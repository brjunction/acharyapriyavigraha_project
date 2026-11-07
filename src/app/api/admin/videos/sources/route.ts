import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { freshSite } from "@/lib/fresh";
import { resolve, syncSource, syncStep, apiKey, classify, knownPlaces, addVideo, videoId, sourceMeta, type Source } from "@/lib/youtube-sync";
import { VIDEO } from "@/lib/content/generic";

export const maxDuration = 60;
/** The channels and playlists videos come from. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const rows = await sql`select s.*, (select count(*)::int from video_source_items i where i.source_id = s.id) as videos, (select count(*)::int from video_source_items i where i.source_id = s.id and not exists (select 1 from videos v where v.youtube_id = i.youtube_id)) as missing from video_sources s order by position, created_at`;
  return json({ sources: rows, hasKey: !!(await apiKey()), envKey: !!process.env.YOUTUBE_API_KEY });
}
/** { url } adds a source · { sync: id | "all" } fetches · { key } saves the API key · { resort: true, ids? } re-sorts from titles. */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if ("key" in b) { if (b.key) await sql`insert into settings (key, value) values ('youtube_api_key', ${JSON.stringify(String(b.key).trim())}::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()`; else await sql`delete from settings where key = 'youtube_api_key'`; return json({ ok: true }); }
  // Many links at once, one per line: channels, @handles and playlists become sources; video links are added straight away.
  if (Array.isArray(b.urls)) {
    const out: { url: string; ok: boolean; note: string }[] = [];
    for (const raw of b.urls.map((x: string) => String(x).trim()).filter(Boolean).slice(0, 200)) {
      try {
        if (videoId(raw) && !/[?&]list=/.test(raw)) { const added = await addVideo(raw, b.kind); out.push({ url: raw, ok: true, note: added ? "Video added" : "Video already here" }); continue; }
        const r = await resolve(raw); const m = await sourceMeta({ kind: r.kind, ref: r.ref }, await apiKey());
        const show = ["row", "playlist", "shorts", "channel"].includes(b.show_as) ? b.show_as : r.kind === "channel" ? "channel" : "row";
        const dup = (await sql`select id from video_sources where ref = ${r.ref}`)[0] as any;
        const row = dup || (await sql`insert into video_sources (url, name, kind, ref, default_kind, section, show_as, avatar, description, section_id, position) values (${raw}, ${r.name}, ${r.kind}, ${r.ref}, ${b.kind || null}, ${String(b.section || "").trim() || null}, ${show}, ${m.avatar}, ${m.description}, ${b.section_id || null}, (select coalesce(max(position), 0) + 1 from video_sources)) on conflict (url) do update set ref = excluded.ref, name = coalesce(video_sources.name, excluded.name), avatar = coalesce(video_sources.avatar, excluded.avatar) returning id`)[0];
        if (dup && b.section_id) await sql`update video_sources set section_id = ${b.section_id} where id = ${dup.id}`;
        out.push({ url: raw, ok: true, note: `${r.kind === "playlist" ? "Playlist" : "Channel"} ${dup ? "already here" : "added"}${r.name ? `: ${r.name}` : ""}`, source: row.id } as any);
      } catch (e: any) { out.push({ url: raw, ok: false, note: e.message }); }
    }
    freshSite(); return json({ results: out });
  }
  if (b.update) {
    const u = b.update; const cur = (await sql`select * from video_sources where id = ${u.id}`)[0]; if (!cur) return fail("Not found.");
    const v = { name: u.name ?? cur.name, default_kind: "default_kind" in u ? u.default_kind || null : cur.default_kind, section: "section" in u ? String(u.section || "").trim() || null : cur.section,
      show_as: ["row", "playlist", "shorts", "channel"].includes(u.show_as) ? u.show_as : cur.show_as, hidden: "hidden" in u ? !!u.hidden : cur.hidden, avatar: "avatar" in u ? u.avatar || null : cur.avatar, description: "description" in u ? u.description || null : cur.description };
    await sql`update video_sources set name = ${v.name}, default_kind = ${v.default_kind}, section = ${v.section}, show_as = ${v.show_as}, hidden = ${v.hidden}, avatar = ${v.avatar}, description = ${v.description} where id = ${u.id}`;
    freshSite(); return json({ ok: true });
  }
  /** { order: [ids] } saves the order of sections and sources on the Videos page. */
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update video_sources set position = ${i} where id = ${id}`; freshSite(); return json({ ok: true }); }
  /** { refreshMeta: id } fetches the icon and description again from YouTube. */
  if (b.refreshMeta) { const s = (await sql`select * from video_sources where id = ${b.refreshMeta}`)[0] as Source; if (!s) return fail("Not found."); const m = await sourceMeta({ kind: s.kind, ref: s.ref! }, await apiKey()); await sql`update video_sources set avatar = coalesce(${m.avatar}, avatar), description = coalesce(${m.description}, description) where id = ${s.id}`; freshSite(); return json(m); }
  if (b.url) {
    try { const r = await resolve(String(b.url)); const row = (await sql`insert into video_sources (url, name, kind, ref) values (${String(b.url).trim()}, ${b.name || r.name}, ${r.kind}, ${r.ref}) on conflict (url) do update set ref = excluded.ref returning *`)[0]; return json(row); }
    catch (e: any) { return fail(e.message); }
  }
  /** { step: id } — fetch one source a little further (about 40 seconds); the Studio repeats it until done. */
  if (b.step) {
    const src = (await sql`select * from video_sources where id = ${b.step}`)[0] as any; if (!src) return fail("Not found.");
    const r = await syncStep(src, await apiKey(), 40000); if (r.state !== "working") freshSite();
    return json({ ...r, name: src.name || src.url });
  }
  if (b.sync) {
    const key = await apiKey(); const list = (b.sync === "all" ? await sql`select * from video_sources order by created_at` : await sql`select * from video_sources where id = ${b.sync}`) as Source[];
    const out: { name: string; seen?: number; added?: number; error?: string }[] = [];
    for (const s of list) { try { out.push({ name: s.name || s.url, ...(await syncSource(s, key)) }); } catch (e: any) { out.push({ name: s.name || s.url, error: e.message }); } }
    freshSite(); return json({ results: out });
  }
  if (b.resort) {
    const known = await knownPlaces(); const rows = (b.ids?.length ? await sql`select * from videos where id = any(${b.ids})` : await sql`select * from videos`) as any[]; let changed = 0;
    for (const v of rows) {
      const c = classify(v.title, v.description || "", known); const set: Record<string, any> = {};
      for (const k of ["date", "year", "place", "country", "scripture", "type"]) if (c[k] && !v[k]) set[k] = c[k];
      if (!Object.keys(set).length) continue; const cols = Object.keys(set);
      await sql.query(`update videos set ${cols.map((k, i) => `${k} = $${i + 1}`).join(", ")}, search = $${cols.length + 1} where id = $${cols.length + 2}`, [...cols.map((k) => set[k]), VIDEO.search({ ...v, ...set }), v.id]); changed++;
    }
    freshSite(); return json({ changed, checked: rows.length });
  }
  return fail("Nothing to do.");
}
export async function DELETE(req: Request) { const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); await sql`delete from video_sources where id = ${b.id}`; return json({ ok: true }); }
