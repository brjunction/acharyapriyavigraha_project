/* Bringing whole YouTube channels and playlists into Videos, and sorting each video by date, place, scripture and type from its title. */
import { sql } from "@/lib/db";
import { fold } from "@/lib/content/text";
import { VIDEO, insertRow } from "@/lib/content/generic";

export type Source = { id: string; url: string; name: string | null; kind: string; ref: string | null; default_kind?: string | null };
export type YtVideo = { id: string; title: string; seconds: number; published?: string; description?: string };
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "accept-language": "en" };

/** A single video link → its id, or null. */
export const videoId = (s: string) => /(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(s)?.[1] || null;
const page = async (url: string) => { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error("YouTube could not find that page."); return r.text(); };
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
  try { const j = await (await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`)).json(); title = j.title || ""; author = j.author_name || ""; } catch {}
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
      const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${pl}&key=${key}${token ? `&pageToken=${token}` : ""}`);
      const j = await r.json(); if (j.error) throw new Error(`YouTube: ${j.error.message}`);
      for (const it of j.items || []) out.push({ id: it.contentDetails.videoId, title: it.snippet.title, seconds: 0, published: it.contentDetails.videoPublishedAt || it.snippet.publishedAt, description: it.snippet.description });
      token = j.nextPageToken || "";
    } while (token && out.length < max);
    for (let i = 0; i < out.length; i += 50) {
      const ids = out.slice(i, i + 50).map((v) => v.id).join(",");
      const j = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${key}`)).json();
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
async function scrape(url: string, out: YtVideo[], max: number) {
  const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error("YouTube did not answer. Check the link.");
  const html = await r.text();
  const raw = /var ytInitialData = (\{[\s\S]*?\});<\/script>/.exec(html)?.[1] || /ytInitialData'\] = (\{[\s\S]*?\});/.exec(html)?.[1];
  const data = raw ? JSON.parse(raw) : JSON.parse(/<script[^>]*id="ytInitialData"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1] || "{}");
  const apiKey = /"INNERTUBE_API_KEY":"([^"]+)"/.exec(html)?.[1]; const ver = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(html)?.[1] || "2.20241001.00.00";
  // Only what is in the page's list counts (not suggestions elsewhere on the page).
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs; const sel = Array.isArray(tabs) ? tabs.find((t: any) => t.tabRenderer?.selected)?.tabRenderer?.content : null;
  let token = take(sel || data, out); let seen = new Set<string>(); let rounds = 0;
  while (token && apiKey && out.length < max && !seen.has(token) && rounds++ < 200) {
    seen.add(token); const before = out.length;
    const j = await (await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, { method: "POST", headers: { ...UA, "content-type": "application/json" }, body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: ver, hl: "en" } }, continuation: token }) })).json();
    token = take(j.onResponseReceivedActions || j.onResponseReceivedEndpoints || j, out);
    if (out.length === before) break;
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

/** Fetch one source and add the videos not yet in the archive. Existing ones are left as edited. */
export async function syncSource(s: Source, key?: string | null) {
  const vids = await listVideos({ kind: s.kind, ref: s.ref! }, key);
  const have = new Set(((await sql`select youtube_id from videos where youtube_id = any(${vids.map((v) => v.id)})`) as any[]).map((x) => x.youtube_id));
  const known = await knownPlaces(); let added = 0; const todo = vids.filter((v) => !have.has(v.id));
  for (const v of todo.slice(0, 150)) {
    const c = classify(v.title, v.description, known);
    await insertRow(VIDEO, { youtube_id: v.id, title: v.title, description: v.description || null, duration_sec: v.seconds || null, published_at: v.published || null, channel: s.name, series: s.name, source_id: s.id, kind: s.default_kind || (c.type === "Kīrtana" ? "kirtan" : c.type === "Festival" ? "festival" : c.type === "Memories" ? "memory" : (v.seconds && v.seconds <= 60 ? "short" : "lecture")), ...c });
    added++;
  }
  await sql`update video_sources set last_synced_at = now(), last_count = ${vids.length} where id = ${s.id}`;
  return { seen: vids.length, added, left: Math.max(0, todo.length - 150) };
}
export async function apiKey(): Promise<string | null> { if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY; try { return ((await sql`select value from settings where key = 'youtube_api_key'`)[0]?.value as string) || null; } catch { return null; } }
