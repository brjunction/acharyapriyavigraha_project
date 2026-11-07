/* The Videos home: every channel and playlist added in the Studio, arranged in sections — like YouTube, in one place. */
import { sql, hasDb } from "./db";

export type VCard = { slug: string; title: string; yt: string; seconds: number; date: string };
export type Shelf = { id: string; name: string; avatar: string | null; description: string | null; showAs: "row" | "playlist" | "shorts" | "channel"; kind: string; ref: string; count: number; items: VCard[] };
export type VSection = { title: string; shelves: Shelf[] };
export type VideoHome = { sections: VSection[]; latest: VCard[]; channels: Shelf[]; total: number };

const day = (d: any) => (d ? String(d instanceof Date ? d.toISOString() : d).slice(0, 10) : "");
const card = (r: any): VCard => ({ slug: r.slug, title: r.title, yt: r.youtube_id, seconds: r.duration_sec || 0, date: day(r.date) || (r.year ? String(r.year) : "") });

export async function getVideoHome(per = 24): Promise<VideoHome> {
  const empty = { sections: [], latest: [], channels: [], total: 0 };
  if (!hasDb()) return empty;
  try {
    const srcs = (await sql`select id, name, url, kind, ref, avatar, description, show_as, section from video_sources where not hidden order by position, created_at`) as any[];
    const ids = srcs.map((s) => s.id);
    const [items, counts, latest, total] = await Promise.all([
      ids.length ? sql`select * from (select i.source_id, v.slug, v.title, v.youtube_id, v.duration_sec, v.date, v.year, row_number() over (partition by i.source_id order by i.position) as n from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = any(${ids}::uuid[])) t where n <= ${per} order by source_id, n` : Promise.resolve([]),
      ids.length ? sql`select i.source_id, count(*)::int as c from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = any(${ids}::uuid[]) group by i.source_id` : Promise.resolve([]),
      sql`select slug, title, youtube_id, duration_sec, date, year from videos where status = 'published' and youtube_id is not null and coalesce(kind, '') not in ('short', 'daily-diary') order by coalesce(published_at, date::timestamptz) desc nulls last, created_at desc limit ${per}`,
      sql`select count(*)::int as c from videos where status = 'published'`,
    ]);
    const shelves: (Shelf & { section: string })[] = srcs.map((s) => ({
      id: s.id, name: s.name || s.url, avatar: s.avatar, description: s.description, showAs: s.show_as || "row", kind: s.kind, ref: s.ref, section: s.section || s.name || s.url,
      count: (counts as any[]).find((c) => c.source_id === s.id)?.c || 0, items: (items as any[]).filter((i) => i.source_id === s.id).map(card),
    }));
    const sections: VSection[] = [];
    for (const s of shelves.filter((x) => x.showAs !== "channel" && x.items.length)) {
      let sec = sections.find((x) => x.title === s.section); if (!sec) { sec = { title: s.section, shelves: [] }; sections.push(sec); }
      sec.shelves.push(s);
    }
    return { sections, latest: (latest as any[]).map(card), channels: shelves.filter((s) => s.kind === "channel"), total: (total as any[])[0]?.c || 0 };
  } catch { return empty; }
}

/** One channel or playlist with all its videos, in order. */
export async function getShelf(id: string): Promise<Shelf | null> {
  if (!hasDb() || !/^[0-9a-f-]{36}$/.test(id)) return null;
  try {
    const s = (await sql`select * from video_sources where id = ${id}`)[0] as any; if (!s) return null;
    const rows = (await sql`select v.slug, v.title, v.youtube_id, v.duration_sec, v.date, v.year from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = ${id} order by i.position limit 5000`) as any[];
    return { id: s.id, name: s.name || s.url, avatar: s.avatar, description: s.description, showAs: s.show_as || "row", kind: s.kind, ref: s.ref, count: rows.length, items: rows.map(card) };
  } catch { return null; }
}
