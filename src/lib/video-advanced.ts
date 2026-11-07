/* Advanced search for videos: words, section (with what is inside it), kind, language, year, place, channel or playlist, length — with counts. */
import { sql, hasDb } from "./db";
import type { VCard } from "./video-home";

export const LANGS = ["English", "Hindi", "Odia", "Bengali", "Russian", "Spanish", "Portuguese", "Italian", "German", "French", "Chinese", "Indonesian", "Tamil", "Telugu", "Marathi", "Gujarati"];
import { LENGTHS } from "./video-layouts";
export { LENGTHS };
export const KIND_NAMES: Record<string, string> = { lecture: "Lectures", short: "Shorts", "daily-diary": "Daily diary", kirtan: "Kīrtanas", festival: "Festivals", darshan: "Darśanas", documentary: "Documentaries", memory: "Memories", other: "Other" };
export type AdvFilter = { q?: string; sec?: string; kind?: string; lang?: string; year?: string; place?: string; src?: string; len?: string; sort?: string; page?: string };
export type Facet = { v: string; label: string; n: number };
export type AdvResult = { items: VCard[]; total: number; page: number; pages: number; facets: { sections: (Facet & { depth: number })[]; kinds: Facet[]; langs: Facet[]; years: Facet[]; places: Facet[]; sources: Facet[] } };

const PER = 48;
export async function advancedVideos(f: AdvFilter): Promise<AdvResult> {
  const empty: AdvResult = { items: [], total: 0, page: 1, pages: 1, facets: { sections: [], kinds: [], langs: [], years: [], places: [], sources: [] } };
  if (!hasDb()) return empty;
  const words = (f.q || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6).map((w) => `%${w}%`);
  const len = LENGTHS.find(([k]) => k === f.len); const page = Math.max(1, Number(f.page) || 1);
  const sort = ["oldest", "longest", "shortest", "az"].includes(f.sort || "") ? f.sort : "newest";
  try {
    // the section chosen and everything inside it; its videos, and the videos of playlists shown in it
    const secIds = f.sec ? ((await sql`with recursive t as (select id from video_sections where slug = ${f.sec} union all select s.id from video_sections s join t on s.parent_id = t.id) select id from t`) as any[]).map((r) => r.id) : null;
    const rows = (await sql`
      with lang_of as (
        select i.youtube_id, min(l) as lang from video_section_items i join video_sections s on s.id = i.section_id cross join unnest(${LANGS}::text[]) as l
        where not i.removed and s.name ilike '%' || l || '%' group by i.youtube_id),
      base as (
        select v.slug, v.title, v.youtube_id, v.duration_sec, v.date, v.year, v.published_at, v.created_at, v.kind, v.place, v.source_id,
          coalesce(nullif(v.language, ''), (select l from unnest(${LANGS}::text[]) as l where v.title ilike '%' || l || '%' limit 1), lo.lang) as lang,
          coalesce(v.year, extract(year from v.date)::int, extract(year from v.published_at)::int) as yr
        from videos v left join lang_of lo on lo.youtube_id = v.youtube_id
        where v.status = 'published' and v.youtube_id is not null
          and (${words.length === 0} or v.search ilike all(${words.length ? words : ["%"]}::text[]))
          and (${secIds === null} or v.youtube_id in (select youtube_id from video_section_items where not removed and section_id = any(${secIds || []}::uuid[]) union select i.youtube_id from video_source_items i join video_sources s on s.id = i.source_id where s.section_id = any(${secIds || []}::uuid[])))
          and (${!f.src} or v.youtube_id in (select youtube_id from video_source_items where source_id::text = ${f.src || ""}))
      )
      select * from base
      where (${!f.kind} or kind = ${f.kind || ""}) and (${!f.lang} or lang = ${f.lang || ""}) and (${!f.year} or yr::text = ${f.year || ""}) and (${!f.place} or place = ${f.place || ""})
        and (${!len} or coalesce(duration_sec, 0) >= ${len?.[2] ?? 0} and coalesce(duration_sec, 0) < ${len?.[3] ?? 0})`) as any[];
    const by = (k: (r: any) => any, label: (v: any) => string = String) => { const m = new Map<string, number>(); rows.forEach((r) => { const v = k(r); if (v !== null && v !== undefined && v !== "") m.set(String(v), (m.get(String(v)) || 0) + 1); }); return [...m.entries()].map(([v, n]) => ({ v, label: label(v), n })); };
    const ts = (r: any) => new Date(r.published_at || r.date || r.created_at).getTime() || 0;
    rows.sort((a, b) => sort === "oldest" ? ts(a) - ts(b) : sort === "longest" ? (b.duration_sec || 0) - (a.duration_sec || 0) : sort === "shortest" ? (a.duration_sec || 1e9) - (b.duration_sec || 1e9) : sort === "az" ? String(a.title).localeCompare(String(b.title)) : ts(b) - ts(a));
    const [secs, srcs] = await Promise.all([sql`select id, name, slug, parent_id from video_sections where not hidden order by position, created_at`, sql`select id, name, kind from video_sources where not hidden order by position, created_at`]) as any[][];
    const tree: (Facet & { depth: number })[] = []; const walk = (p: string | null, d: number) => secs.filter((s: any) => (s.parent_id || null) === p).forEach((s: any) => { tree.push({ v: s.slug, label: s.name, n: 0, depth: d }); walk(s.id, d + 1); }); walk(null, 0);
    const srcN = by((r) => r.source_id); const yr = by((r) => r.yr).sort((a, b) => Number(b.v) - Number(a.v));
    const items: VCard[] = rows.slice((page - 1) * PER, page * PER).map((r) => ({ slug: r.slug, title: r.title, yt: r.youtube_id, seconds: r.duration_sec || 0, date: r.date ? String(r.date instanceof Date ? r.date.toISOString() : r.date).slice(0, 10) : r.yr ? String(r.yr) : "" }));
    return { items, total: rows.length, page, pages: Math.max(1, Math.ceil(rows.length / PER)), facets: {
      sections: tree, kinds: by((r) => r.kind, (v) => KIND_NAMES[v] || v).sort((a, b) => b.n - a.n), langs: by((r) => r.lang).sort((a, b) => b.n - a.n), years: yr,
      places: by((r) => r.place).sort((a, b) => b.n - a.n).slice(0, 60), sources: srcs.map((s: any) => ({ v: s.id, label: s.name || "Untitled", n: srcN.find((x) => x.v === s.id)?.n || 0 })) } };
  } catch { return empty; }
}
