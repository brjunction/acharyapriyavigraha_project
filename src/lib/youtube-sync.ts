/* Bringing whole YouTube channels and playlists into Videos, and sorting each video by date, place, scripture and type from its title. */
import { sql } from "@/lib/db";
import { fold } from "@/lib/content/text";
import { VIDEO, insertRow } from "@/lib/content/generic";

export type Source = { id: string; url: string; name: string | null; kind: string; ref: string | null; default_kind?: string | null; show_as?: string | null; avatar?: string | null; description?: string | null; section_id?: string | null; new_on_top?: boolean | null };
export type YtVideo = { id: string; title: string; seconds: number; published?: string; description?: string };
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "accept-language": "en" };

/** A single video link → its id, or null. */
export const videoId = (s: string) => /(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(s)?.[1] || null;
const TO = (ms = 15000) => AbortSignal.timeout(ms);
const page = async (url: string) => { const r = await fetch(url, { headers: UA, signal: TO() }); if (!r.ok) throw new Error("YouTube could not find that page."); return r.text(); };
const titleOf = (html: string) => (/<meta property="og:title" content="([^"]+)"/.exec(html)?.[1] || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') || null;
/** Channel link (/@handle, /channel/UC…, /c/…, /user/…), playlist link or ID → what to read. */
export async function resolve(input: string): Promise<{ kind: "channel" | "playlist"; ref: string; name: string | null }> {
  const s = input.trim();
  const list = /[?&]list=([\w-]+)/.exec(s)?.[1] || (/^(PL|UU|OL|FL|RD)[\w-]{10,}$/.test(s) ? s : null);
  if (list) { let name: string | null = null; try { name = titleOf(await page(`https://www.youtube.com/playlist?list=${list}&hl=en`)); } catch {} return { kind: "playlist", ref: list, name }; }
  const uc = /(UC[\w-]{22})/.exec(s)?.[1];
  if (uc) { let name: string | null = null; try { name = titleOf(await page(`https://www.youtube.com/channel/${uc}`)); } catch {} return { kind: "channel", ref: uc, name }; }
  const path = /youtube\.com\/((?:c|user)\/[^/?#]+|@[^/?#]+)/.exec(s)?.[1] || (/^@[\w.\-]+$/.test(s) ? s : /^[\w.\-]+$/.test(s) ? `@${s}` : null);
  if (!path) throw new Error("Paste a channel link, @handle, playlist link or video link.");
  const html = await page(`https://www.youtube.com/${path}`);
  const id = /"externalId":"(UC[\w-]{22})"/.exec(html)?.[1] || /itemprop="identifier" content="(UC[\w-]{22})"/.exec(html)?.[1] || /"channelId":"(UC[\w-]{22})"/.exec(html)?.[1];
  if (!id) throw new Error(`Could not read the channel ${path}.`);
  return { kind: "channel", ref: id, name: titleOf(html) };
}
/** Add one video from its link, with its title from YouTube. Returns false when it is already here. */
export async function addVideo(link: string, kind?: string | null) {
  const id = videoId(link); if (!id) throw new Error("Not a video link.");
  if ((await sql`select 1 from videos where youtube_id = ${id}`).length) return false;
  let title = "", author = "";
  try { const j = await (await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { signal: TO(8000) })).json(); title = j.title || ""; author = j.author_name || ""; } catch {}
  const c = classify(title, "", await knownPlaces());
  await insertRow(VIDEO, { youtube_id: id, title: title || `YouTube video ${id}`, channel: author || null, series: author || null, kind: kind || (c.type === "Kīrtana" ? "kirtan" : c.type === "Festival" ? "festival" : c.type === "Memories" ? "memory" : "lecture"), ...c });
  return true;
}
const playlistOf = (src: { kind: string; ref: string }) => (src.kind === "channel" ? `UU${src.ref.slice(2)}` : src.ref);
const iso = (d: string) => { const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(d || ""); return m ? (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0)) : 0; };

/** Every video in the list. With an API key: full details. Without: titles and lengths from the public playlist page. */
export async function listVideos(src: { kind: string; ref: string }, key?: string | null, max = 5000): Promise<YtVideo[]> {
  const pl = playlistOf(src); const out: YtVideo[] = [];
  if (key) {
    let token = "";
    do {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${pl}&key=${key}${token ? `&pageToken=${token}` : ""}`, { signal: TO() });
      const j = await r.json(); if (j.error) throw new Error(`YouTube: ${j.error.message}`);
      for (const it of j.items || []) out.push({ id: it.contentDetails.videoId, title: it.snippet.title, seconds: 0, published: it.contentDetails.videoPublishedAt || it.snippet.publishedAt, description: it.snippet.description });
      token = j.nextPageToken || "";
    } while (token && out.length < max);
    for (let i = 0; i < out.length; i += 50) {
      const ids = out.slice(i, i + 50).map((v) => v.id).join(",");
      const j = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${key}`, { signal: TO() })).json();
      for (const it of j.items || []) { const v = out.find((x) => x.id === it.id); if (v) v.seconds = iso(it.contentDetails?.duration); }
    }
    return out.filter((v) => v.title !== "Private video" && v.title !== "Deleted video");
  }
  // Without a key: read YouTube's own pages. Channels: the Videos and Live tabs; playlists: the playlist page. Each follows its “more” pages.
  const pages = src.kind === "channel" ? [`https://www.youtube.com/channel/${src.ref}/videos?hl=en`, `https://www.youtube.com/channel/${src.ref}/streams?hl=en`] : [`https://www.youtube.com/playlist?list=${pl}&hl=en`];
  for (const url of pages) { try { await scrape(url, out, max); } catch (e) { if (url === pages[0]) throw e; } }
  if (!out.length) throw new Error("No videos found. The playlist may be private, or YouTube changed its page — add an API key to use YouTube’s official access.");
  return out;
}
const clockOf = (o: any): number => { let n = 0; const w = (x: any) => { if (n || !x || typeof x !== "object") return; for (const k in x) { const v = x[k]; if (typeof v === "string" && /^\d{1,2}(:\d{2}){1,2}$/.test(v)) { n = v.split(":").map(Number).reduce((a, b) => a * 60 + b, 0); return; } w(v); } }; w(o); return n; };
/** Collect the videos in a page (or a “more” answer) and return the token for the next page. */
function take(node: any, out: YtVideo[]): string | null {
  let next: string | null = null;
  const walk = (o: any) => { if (!o || typeof o !== "object") return;
    if (o.lockupViewModel) { const v = o.lockupViewModel; const id = v.contentId; if (/VIDEO|^$/.test(v.contentType || "") || /^[\w-]{11}$/.test(id || "")) { const title = v.metadata?.lockupMetadataViewModel?.title?.content || ""; if (id && /^[\w-]{11}$/.test(id) && !out.some((x) => x.id === id)) out.push({ id, title, seconds: clockOf(v.contentImage) }); } return; }
    if (o.richItemRenderer?.content?.videoRenderer || o.videoRenderer || o.gridVideoRenderer) { const v = o.richItemRenderer?.content?.videoRenderer || o.videoRenderer || o.gridVideoRenderer; if (v.videoId && !out.some((x) => x.id === v.videoId)) out.push({ id: v.videoId, title: v.title?.runs?.map((x: any) => x.text).join("") || v.title?.simpleText || "", seconds: clockOf(v.lengthText || v.thumbnailOverlays) }); return; }
    if (o.playlistVideoRenderer) { const v = o.playlistVideoRenderer; if (v.videoId && v.isPlayable !== false && !out.some((x) => x.id === v.videoId)) out.push({ id: v.videoId, title: v.title?.runs?.map((x: any) => x.text).join("") || v.title?.simpleText || "", seconds: Number(v.lengthSeconds) || 0 }); return; }
    if (o.continuationItemRenderer) { const m = /"continuationCommand":\{"token":"([^"]+)"/.exec(JSON.stringify(o.continuationItemRenderer)); if (m) next = m[1]; return; }
    for (const k in o) walk(o[k]); };
  walk(node);
  if (!next) { const t = JSON.stringify(node); const last = t.lastIndexOf("lockupViewModel"); const re = /"continuationCommand":\{"token":"([^"]+)"/g; let m: RegExpExecArray | null; while ((m = re.exec(t))) if (m.index > last) next = m[1]; }
  return next;
}
type Pg = { items: YtVideo[]; token: string | null; k?: string; v?: string };
/** The first page of a playlist or channel tab: its videos, the token for “more”, and the keys to ask for more. */
async function firstPage(url: string): Promise<Pg> {
  const r = await fetch(url, { headers: UA, signal: TO(20000) }); if (!r.ok) throw new Error("YouTube did not answer. Check the link.");
  const html = await r.text();
  const raw = /var ytInitialData = (\{[\s\S]*?\});<\/script>/.exec(html)?.[1] || /ytInitialData'\] = (\{[\s\S]*?\});/.exec(html)?.[1];
  const data = raw ? JSON.parse(raw) : JSON.parse(/<script[^>]*id="ytInitialData"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1] || "{}");
  const k = /"INNERTUBE_API_KEY":"([^"]+)"/.exec(html)?.[1]; const v = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(html)?.[1] || "2.20241001.00.00";
  // Only what is in the page's own list counts (not suggestions elsewhere on the page).
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs; const sel = Array.isArray(tabs) ? tabs.find((t: any) => t.tabRenderer?.selected)?.tabRenderer?.content : null;
  const items: YtVideo[] = []; const token = take(sel || data, items);
  if (/"alerts":\[[^\]]*"text":"This playlist (?:does not exist|is private)/.test(html) && !items.length) throw new Error("This playlist is private or does not exist.");
  return { items, token, k, v };
}
/** The next “more” page. */
async function nextPage(token: string, k: string, v: string): Promise<Pg> {
  const r = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${k}`, { method: "POST", headers: { ...UA, "content-type": "application/json" }, body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: v, hl: "en" } }, continuation: token }), signal: TO(20000) });
  if (!r.ok) throw new Error(`YouTube stopped answering (${r.status}). Fetch again in a minute — it carries on where it stopped.`);
  const j = await r.json(); const items: YtVideo[] = [];
  const next = take(j.onResponseReceivedActions || j.onResponseReceivedEndpoints || j, items);
  return { items, token: next };
}
async function scrape(url: string, out: YtVideo[], max: number) {
  let p = await firstPage(url); const seen = new Set<string>(); let rounds = 0;
  const push = (xs: YtVideo[]) => { for (const x of xs) if (!out.some((o) => o.id === x.id)) out.push(x); };
  push(p.items);
  while (p.token && p.k && out.length < max && !seen.has(p.token) && rounds++ < 400) { seen.add(p.token); const b = out.length; const n = await nextPage(p.token, p.k, p.v!); push(n.items); p = { ...p, token: n.token }; if (out.length === b && !n.token) break; }
}

/* ---------- Fetching in steps: a big playlist or channel is read a few pages at a time and carries on where it stopped,
   so nothing times out, every video is counted, and a fetch can be repeated safely. */
type St = { phase: "list" | "finish" | "add" | "done"; urls: string[]; t: string | null; k: string | null; v: string | null; pos: number; gen: number };
const pagesFor = (s: { kind: string; ref: string }) => (s.kind === "channel" ? [`https://www.youtube.com/channel/${s.ref}/videos?hl=en`, `https://www.youtube.com/channel/${s.ref}/streams?hl=en`, `https://www.youtube.com/channel/${s.ref}/shorts?hl=en`] : [`https://www.youtube.com/playlist?list=${s.ref}&hl=en`]);
export type StepResult = { state: "working" | "done" | "error"; found: number; added: number; left: number; error?: string };
async function keepItems(id: string, xs: YtVideo[], from: number, gen: number) {
  if (!xs.length) return;
  await sql`insert into video_source_items (source_id, youtube_id, position, title, seconds, published, gen)
    select ${id}::uuid, y, p, t, sec, pub, ${gen} from unnest(${xs.map((x) => x.id)}::text[], ${xs.map((_, i) => from + i)}::int[], ${xs.map((x) => x.title || null)}::text[], ${xs.map((x) => x.seconds || 0)}::int[], ${xs.map((x) => x.published || null)}::text[]) as u(y, p, t, sec, pub)
    on conflict (source_id, youtube_id) do update set position = least(excluded.position, case when video_source_items.gen = ${gen} then video_source_items.position else excluded.position end), title = coalesce(excluded.title, video_source_items.title), seconds = coalesce(nullif(excluded.seconds, 0), video_source_items.seconds), published = coalesce(excluded.published, video_source_items.published), gen = ${gen}`;
}
/** One step of fetching a source, within about `budget` ms. Call again until it says done. */
export async function syncStep(src: Source & { sync_state?: string | null; sync_gen?: number | null }, key?: string | null, budget = 40000): Promise<StepResult> {
  const t0 = Date.now(); const left = () => budget - (Date.now() - t0); let added = 0;
  let st: St | null = null; try { st = src.sync_state ? JSON.parse(src.sync_state) : null; } catch { st = null; }
  const save = async () => { await sql`update video_sources set sync_state = ${st && st.phase !== "done" ? JSON.stringify(st) : null} where id = ${src.id}`; };
  try {
    if (!st || st.phase === "done") { st = { phase: "list", urls: pagesFor({ kind: src.kind, ref: src.ref! }), t: null, k: null, v: null, pos: 0, gen: (src.sync_gen || 0) + 1 }; await sql`update video_sources set sync_gen = ${st.gen}, sync_error = null where id = ${src.id}`; }
    if (st.phase === "list" && key && st.pos === 0) { const all = await listVideos({ kind: src.kind, ref: src.ref! }, key); await keepItems(src.id, all, 0, st.gen); st.pos = all.length; st.phase = "finish"; }
    while (st.phase === "list" && left() > 10000) {
      let pg: Pg;
      if (st.t && st.k) pg = await nextPage(st.t, st.k, st.v || "2.20241001.00.00");
      else if (st.urls.length) { const first = st.urls.length === pagesFor({ kind: src.kind, ref: src.ref! }).length; try { pg = await firstPage(st.urls[0]); st.k = pg.k || null; st.v = pg.v || null; } catch (e) { if (first) throw e; pg = { items: [], token: null }; } }
      else { st.phase = "finish"; break; }
      await keepItems(src.id, pg.items, st.pos, st.gen); st.pos += pg.items.length;
      st.t = pg.items.length || pg.token !== st.t ? pg.token : null;
      if (!st.t) { st.urls.shift(); st.k = st.k; }
      await save();
    }
    if (st.phase === "finish") {
      const n = ((await sql`select count(*)::int as n from video_source_items where source_id = ${src.id} and gen = ${st.gen}`)[0] as any).n;
      if (!n) throw new Error("No videos found. The playlist may be private or empty, or YouTube changed its page — an API key in Settings uses YouTube’s official access.");
      // what is no longer in the playlist leaves it; the order is the playlist's own
      await sql`delete from video_source_items where source_id = ${src.id} and gen <> ${st.gen}`;
      await sql`update video_source_items i set position = r.n - 1 from (select youtube_id, row_number() over (order by position) as n from video_source_items where source_id = ${src.id}) r where i.source_id = ${src.id} and i.youtube_id = r.youtube_id`;
      await sql`update video_sources set last_count = ${n} where id = ${src.id}`;
      if (!src.avatar || !src.description) { const m = await sourceMeta({ kind: src.kind, ref: src.ref! }, key); await sql`update video_sources set avatar = coalesce(avatar, ${m.avatar}), description = coalesce(description, ${m.description}) where id = ${src.id}`; }
      st.phase = "add"; await save();
    }
    if (st.phase === "add") {
      const known = await knownPlaces();
      while (left() > 6000) {
        const todo = (await sql`select i.youtube_id, i.title, i.seconds, i.published from video_source_items i where i.source_id = ${src.id} and not exists (select 1 from videos v where v.youtube_id = i.youtube_id) order by i.position limit 40`) as any[];
        if (!todo.length) { st.phase = "done"; break; }
        for (let i = 0; i < todo.length; i += 8) {
          await Promise.all(todo.slice(i, i + 8).map(async (v) => {
            const c = classify(v.title || "", "", known);
            const row = { youtube_id: v.youtube_id, title: v.title || `YouTube video ${v.youtube_id}`, duration_sec: v.seconds || null, published_at: v.published || null, channel: src.name, series: src.name, source_id: src.id, kind: src.default_kind || (src.show_as === "shorts" ? "short" : null) || (c.type === "Kīrtana" ? "kirtan" : c.type === "Festival" ? "festival" : c.type === "Memories" ? "memory" : (v.seconds && v.seconds <= 60 ? "short" : "lecture")), ...c };
            try { await insertRow(VIDEO, row); added++; } catch { try { if (!(await sql`select 1 from videos where youtube_id = ${v.youtube_id}`).length) { await insertRow(VIDEO, row); added++; } } catch {} }
          }));
        }
      }
    }
    if (st.phase === "done") {
      await sql`update video_sources set last_synced_at = now(), sync_state = null, sync_error = null where id = ${src.id}`;
      if (src.section_id) { const sec = (await sql`select layout from video_sections where id = ${src.section_id}`)[0] as any; if (sec && !["playlists", "channels", "folder", "tabs"].includes(sec.layout)) { const ids = ((await sql`select youtube_id from video_source_items where source_id = ${src.id} order by position`) as any[]).map((r) => r.youtube_id); const { addToSection } = await import("./video-home"); await addToSection(src.section_id, ids, src.new_on_top ?? src.kind === "channel"); } }
    } else await save();
    const missing = ((await sql`select count(*)::int as n from video_source_items i where i.source_id = ${src.id} and not exists (select 1 from videos v where v.youtube_id = i.youtube_id)`)[0] as any).n;
    return { state: st.phase === "done" ? "done" : "working", found: st.pos, added, left: missing };
  } catch (e: any) {
    const msg = e?.name === "TimeoutError" ? "YouTube was slow to answer. Fetch again — it carries on where it stopped." : e?.message || "Fetching failed.";
    await sql`update video_sources set sync_error = ${msg} where id = ${src.id}`.catch(() => {});
    return { state: "error", found: st?.pos || 0, added, left: 0, error: msg };
  }
}

/* ---------- Sorting by the title */
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const PLACES: [string, string, string][] = [["bhubaneswar", "Bhubaneswar", "India"], ["mayapur", "Māyāpur", "India"], ["vrindavan", "Vṛndāvana", "India"], ["vrndavana", "Vṛndāvana", "India"], ["puri", "Purī", "India"], ["jagannath puri", "Purī", "India"], ["gadeigiri", "Gaḍeigiri", "India"], ["jagannathpur", "Jagannāthapura", "India"], ["pattamundai", "Pattamundai", "India"], ["cuttack", "Cuttack", "India"], ["kolkata", "Kolkata", "India"], ["calcutta", "Kolkata", "India"], ["delhi", "Delhi", "India"], ["mumbai", "Mumbai", "India"], ["bombay", "Mumbai", "India"], ["radhadesh", "Radhadesh", "Belgium"], ["durbuy", "Radhadesh", "Belgium"], ["murwillumbah", "Murwillumbah", "Australia"], ["new govardhana", "Murwillumbah", "Australia"], ["sydney", "Sydney", "Australia"], ["melbourne", "Melbourne", "Australia"], ["bali", "Bali", "Indonesia"], ["jakarta", "Jakarta", "Indonesia"], ["amsterdam", "Amsterdam", "Netherlands"], ["paris", "Paris", "France"], ["london", "London", "United Kingdom"], ["san francisco", "San Francisco", "USA"], ["los angeles", "Los Angeles", "USA"], ["new york", "New York", "USA"], ["moscow", "Moscow", "Russia"], ["germany", "Germany", "Germany"], ["italy", "Italy", "Italy"]];
export function classify(title: string, desc = "", known: [string, string, string][] = []) {
  const t = ` ${fold(title)} `; const all = ` ${fold(`${title} ${desc.slice(0, 600)}`)} `; const o: Record<string, any> = {};
  const pad = (n: number | string) => String(n).padStart(2, "0"); const ok = (y: number, m: number, d: number) => y >= 1960 && y <= 2035 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
  let m: RegExpExecArray | null;
  if ((m = /\b(19[5-9]\d|20[0-3]\d)[-./](\d{1,2})[-./](\d{1,2})\b/.exec(t)) && ok(+m[1], +m[2], +m[3])) o.date = `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  else if ((m = /\b(\d{1,2})[-./](\d{1,2})[-./](19[5-9]\d|20[0-3]\d)\b/.exec(t)) && ok(+m[3], +m[2], +m[1])) o.date = `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  else if ((m = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(19[5-9]\d|20[0-3]\d)\b/.exec(t))) o.date = `${m[3]}-${pad(MON.indexOf(m[2]) + 1)}-${pad(m[1])}`;
  else if ((m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(19[5-9]\d|20[0-3]\d)\b/.exec(t))) o.date = `${m[3]}-${pad(MON.indexOf(m[1]) + 1)}-${pad(m[2])}`;
  else if ((m = /\b([789]\d)(\d\d)(\d\d)\b/.exec(t)) && ok(1900 + +m[1], +m[2], +m[3])) o.date = `19${m[1]}-${m[2]}-${m[3]}`;
  if (o.date) o.year = +o.date.slice(0, 4); else if ((m = /\b(19[6-9]\d)\b/.exec(t))) o.year = +m[1];
  const n = "(\\d+)[.:](\\d+)(?:[.:](\\d+))?";
  if ((m = new RegExp(`\\b(?:sb|s\\.b\\.|bhag(?:avatam)?|srimad[- ]?bhagavatam)\\.?\\s*${n}`).exec(t))) o.scripture = `SB ${[m[1], m[2], m[3]].filter(Boolean).join(".")}`;
  else if ((m = new RegExp(`\\b(?:bg|b\\.g\\.|gita|bhagavad[- ]?gita)\\.?\\s*(\\d+)[.:](\\d+)`).exec(t))) o.scripture = `BG ${m[1]}.${m[2]}`;
  else if ((m = /\b(?:cc|c\.c\.|caitanya[- ]?caritamrta|chaitanya[- ]?charitamrita)\.?\s*(adi|madhya|antya)\s*(\d+)[.:](\d+)/.exec(t))) o.scripture = `CC ${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}.${m[3]}`;
  else if (/\b(bhagavatam|bhagavat)\b/.test(t)) o.scripture = "SB"; else if (/\b(gita)\b/.test(t)) o.scripture = "BG"; else if (/\b(caritamrta|charitamrita)\b/.test(t)) o.scripture = "CC";
  const T: [RegExp, string][] = [[/\b(kirtan|kirtana|bhajan|bhajana|harinam|sankirtan)\b/, "Kīrtana"], [/\b(darshan|darsana|darshana)\b/, "Darśana"], [/\b(q ?& ?a|q ?and ?a|questions?)\b/, "Questions & answers"], [/\bseminar\b/, "Seminar"], [/\b(initiation|diksa|diksha|sannyas)\w*/, "Initiation"], [/\b(vyasa ?puja|ratha ?yatra|janmastami|janmashtami|gaura ?purnima|kartik|festival|appearance day|disappearance day)\b/, "Festival"], [/\b(memor|remember|glorif|tribute)\w*/, "Memories"], [/\b(documentary)\b/, "Documentary"], [/\b(interview)\b/, "Interview"]];
  o.type = T.find(([r]) => r.test(t))?.[1] || (o.scripture ? "Lecture" : null);
  const pl = [...known, ...PLACES].find(([k]) => k.length > 2 && new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(all));
  if (pl) { o.place = pl[1]; o.country = pl[2]; }
  return o;
}
export async function knownPlaces(): Promise<[string, string, string][]> {
  try { return ((await sql`select distinct place, country from audios where place is not null`) as any[]).map((r) => [fold(r.place), r.place, r.country || ""]); } catch { return []; }
}

const unesc = (x: string) => x.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
/** The icon (channel picture or playlist cover) and description of a channel or playlist. */
export async function sourceMeta(src: { kind: string; ref: string }, key?: string | null): Promise<{ avatar: string | null; description: string | null }> {
  try {
    if (key) {
      const u = src.kind === "channel" ? `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${src.ref}&key=${key}` : `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${src.ref}&key=${key}`;
      const sn = (await (await fetch(u, { signal: TO() })).json()).items?.[0]?.snippet; const t = sn?.thumbnails;
      if (sn) return { avatar: (t?.high || t?.medium || t?.default)?.url || null, description: sn.description || null };
    }
    const html = await page(src.kind === "channel" ? `https://www.youtube.com/channel/${src.ref}?hl=en` : `https://www.youtube.com/playlist?list=${src.ref}&hl=en`);
    const img = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]; const d = /<meta property="og:description" content="([^"]*)"/.exec(html)?.[1];
    return { avatar: img ? unesc(img) : null, description: d ? unesc(d) : null };
  } catch { return { avatar: null, description: null }; }
}

/** Fetch one source completely (steps until done, within `budget` ms in all). */
export async function syncSource(s: Source, key?: string | null, budget = 250000) {
  const t0 = Date.now(); let r: StepResult = { state: "working", found: 0, added: 0, left: 0 }; let added = 0;
  while (Date.now() - t0 < budget - 15000) { const cur = (await sql`select * from video_sources where id = ${s.id}`)[0] as any; r = await syncStep(cur, key, Math.min(45000, budget - (Date.now() - t0) - 5000)); added += r.added; if (r.state !== "working") break; }
  if (r.state === "error") throw new Error(r.error);
  return { seen: r.found, added, left: r.left };
}
export async function apiKey(): Promise<string | null> { if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY; try { return ((await sql`select value from settings where key = 'youtube_api_key'`)[0]?.value as string) || null; } catch { return null; } }
