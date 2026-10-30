import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { resolve, syncSource, apiKey, classify, knownPlaces, addVideo, videoId, type Source } from "@/lib/youtube-sync";
import { VIDEO } from "@/lib/content/generic";

export const maxDuration = 300;
/** The channels and playlists videos come from. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const rows = await sql`select s.*, (select count(*)::int from videos v where v.source_id = s.id) as videos from video_sources s order by position, created_at`;
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
        const r = await resolve(raw);
        await sql`insert into video_sources (url, name, kind, ref, default_kind) values (${raw}, ${r.name}, ${r.kind}, ${r.ref}, ${b.kind || null}) on conflict (url) do update set ref = excluded.ref, name = coalesce(video_sources.name, excluded.name)`;
        out.push({ url: raw, ok: true, note: `${r.kind === "playlist" ? "Playlist" : "Channel"} added${r.name ? `: ${r.name}` : ""}` });
      } catch (e: any) { out.push({ url: raw, ok: false, note: e.message }); }
    }
    revalidatePath("/teachings/videos"); return json({ results: out });
  }
  if (b.update) { const u = b.update; await sql`update video_sources set name = coalesce(${u.name ?? null}, name), default_kind = ${u.default_kind || null} where id = ${u.id}`; return json({ ok: true }); }
  if (b.url) {
    try { const r = await resolve(String(b.url)); const row = (await sql`insert into video_sources (url, name, kind, ref) values (${String(b.url).trim()}, ${b.name || r.name}, ${r.kind}, ${r.ref}) on conflict (url) do update set ref = excluded.ref returning *`)[0]; return json(row); }
    catch (e: any) { return fail(e.message); }
  }
  if (b.sync) {
    const key = await apiKey(); const list = (b.sync === "all" ? await sql`select * from video_sources order by created_at` : await sql`select * from video_sources where id = ${b.sync}`) as Source[];
    const out: { name: string; seen?: number; added?: number; error?: string }[] = [];
    for (const s of list) { try { out.push({ name: s.name || s.url, ...(await syncSource(s, key)) }); } catch (e: any) { out.push({ name: s.name || s.url, error: e.message }); } }
    revalidatePath("/teachings/videos"); return json({ results: out });
  }
  if (b.resort) {
    const known = await knownPlaces(); const rows = (b.ids?.length ? await sql`select * from videos where id = any(${b.ids})` : await sql`select * from videos`) as any[]; let changed = 0;
    for (const v of rows) {
      const c = classify(v.title, v.description || "", known); const set: Record<string, any> = {};
      for (const k of ["date", "year", "place", "country", "scripture", "type"]) if (c[k] && !v[k]) set[k] = c[k];
      if (!Object.keys(set).length) continue; const cols = Object.keys(set);
      await sql.query(`update videos set ${cols.map((k, i) => `${k} = $${i + 1}`).join(", ")}, search = $${cols.length + 1} where id = $${cols.length + 2}`, [...cols.map((k) => set[k]), VIDEO.search({ ...v, ...set }), v.id]); changed++;
    }
    revalidatePath("/teachings/videos"); return json({ changed, checked: rows.length });
  }
  return fail("Nothing to do.");
}
export async function DELETE(req: Request) { const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); await sql`delete from video_sources where id = ${b.id}`; return json({ ok: true }); }
