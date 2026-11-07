/* Videos, organised by sections made in the Studio — each with its own design and colour — plus channels and search. */
import { sql, hasDb } from "./db";

export type VCard = { slug: string; title: string; yt: string; seconds: number; date: string; description?: string };
export type Shelf = { id: string; name: string; avatar: string | null; description: string | null; showAs: string; kind: string; ref: string; count: number; items: VCard[] };
import { LAYOUTS, COLORS, type Layout } from "./video-layouts";
export { LAYOUTS, COLORS, type Layout };
export type VSection = { id: string; name: string; slug: string; intro: string | null; layout: Layout; color: string; count: number; items: VCard[]; playlists: Shelf[] };
export type VNav = { sections: { name: string; slug: string; color: string; layout: string }[]; channels: number };

const day = (d: any) => (d ? String(d instanceof Date ? d.toISOString() : d).slice(0, 10) : "");
const card = (r: any): VCard => ({ slug: r.slug, title: r.title, yt: r.youtube_id, seconds: r.duration_sec || 0, date: day(r.date) || (r.year ? String(r.year) : ""), ...(r.description ? { description: String(r.description).slice(0, 400) } : {}) });
/** How many videos each design shows on the Home tab. */
const HOME_N: Record<string, number> = { featured: 5, spotlight: 7, row: 12, grid: 8, shorts: 12, playlists: 0 };

async function shelvesOf(sectionIds: string[]): Promise<(Shelf & { section_id: string })[]> {
  if (!sectionIds.length) return [];
  const rows = (await sql`select s.*, (select count(*)::int from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = s.id) as c,
      (select json_agg(t) from (select v.slug, v.title, v.youtube_id, v.duration_sec, v.date, v.year from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = s.id order by i.position limit 1) t) as first
    from video_sources s where s.section_id = any(${sectionIds}::uuid[]) and not s.hidden order by s.position, s.created_at`) as any[];
  return rows.map((s) => ({ id: s.id, section_id: s.section_id, name: s.name || s.url, avatar: s.avatar, description: s.description, showAs: "playlist", kind: s.kind, ref: s.ref, count: s.c || 0, items: (s.first || []).map(card) }));
}

async function sections(where: "home" | "all", slug?: string, limit?: number): Promise<VSection[]> {
  const secs = (slug ? await sql`select * from video_sections where slug = ${slug} and not hidden` : where === "home" ? await sql`select * from video_sections where not hidden and on_home order by position, created_at` : await sql`select * from video_sections where not hidden order by position, created_at`) as any[];
  if (!secs.length) return [];
  const ids = secs.map((s) => s.id);
  const [counts, items, shelves] = await Promise.all([
    sql`select i.section_id, count(*)::int as c from video_section_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.section_id = any(${ids}::uuid[]) and not i.removed group by i.section_id`,
    sql`select * from (select i.section_id, v.slug, v.title, v.youtube_id, v.duration_sec, v.date, v.year, v.description, row_number() over (partition by i.section_id order by i.position) as n from video_section_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.section_id = any(${ids}::uuid[]) and not i.removed) t where n <= ${limit ?? 5000} order by section_id, n`,
    shelvesOf(ids),
  ]);
  return secs.map((s) => {
    const cap = slug ? Infinity : HOME_N[s.layout] ?? 12;
    const its = (items as any[]).filter((i) => i.section_id === s.id).slice(0, cap === Infinity ? undefined : cap).map((r) => card(slug ? r : { ...r, description: null }));
    return { id: s.id, name: s.name, slug: s.slug, intro: s.intro, layout: s.layout, color: s.color, count: (counts as any[]).find((c) => c.section_id === s.id)?.c || 0, items: its, playlists: shelves.filter((x) => x.section_id === s.id) };
  });
}

/** The tabs along the top of every Videos page. */
export async function getVideoNav(): Promise<VNav> {
  if (!hasDb()) return { sections: [], channels: 0 };
  try {
    const [s, c] = await Promise.all([sql`select name, slug, color, layout from video_sections where not hidden order by position, created_at`, sql`select count(*)::int as c from video_sources where kind = 'channel' and not hidden`]);
    return { sections: s as any[], channels: (c as any[])[0]?.c || 0 };
  } catch { return { sections: [], channels: 0 }; }
}

/** Home: every section marked “show on Home”, a few videos each, in its own design. */
export async function getVideoHome(): Promise<{ sections: VSection[]; latest: VCard[]; channels: Shelf[] }> {
  if (!hasDb()) return { sections: [], latest: [], channels: [] };
  try {
    const [secs, latest, channels] = await Promise.all([
      sections("home", undefined, 12),
      sql`select slug, title, youtube_id, duration_sec, date, year from videos where status = 'published' and youtube_id is not null order by coalesce(published_at, date::timestamptz) desc nulls last, created_at desc limit 12`,
      getChannels(8),
    ]);
    return { sections: secs, latest: (latest as any[]).map(card), channels };
  } catch { return { sections: [], latest: [], channels: [] }; }
}

/** One section's own tab: all its videos (or all its playlists). */
export async function getSection(slug: string): Promise<VSection | null> {
  if (!hasDb()) return null;
  try { return (await sections("all", slug))[0] || null; } catch { return null; }
}

export async function getChannels(limit = 200): Promise<Shelf[]> {
  if (!hasDb()) return [];
  try {
    const rows = (await sql`select s.*, (select count(*)::int from video_source_items i join videos v on v.youtube_id = i.youtube_id and v.status = 'published' where i.source_id = s.id) as c from video_sources s where s.kind = 'channel' and not s.hidden order by s.position, s.created_at limit ${limit}`) as any[];
    return rows.map((s) => ({ id: s.id, name: s.name || s.url, avatar: s.avatar, description: s.description, showAs: "channel", kind: s.kind, ref: s.ref, count: s.c || 0, items: [] }));
  } catch { return []; }
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

/** The queue a watch page follows: a section (sec=) or a channel/playlist (list=). */
export async function getQueue(o: { sec?: string; list?: string }): Promise<{ id: string; name: string; href: string; param: string; items: VCard[] } | null> {
  if (o.list) { const s = await getShelf(o.list); return s ? { id: s.id, name: s.name, href: `/teachings/videos/list/${s.id}`, param: `list=${s.id}`, items: s.items } : null; }
  if (o.sec && hasDb()) { const s = await getSection(o.sec); return s ? { id: s.id, name: s.name, href: `/teachings/videos/s/${s.slug}`, param: `sec=${s.slug}`, items: s.items } : null; }
  return null;
}

export async function searchVideos(q: string): Promise<VCard[]> {
  if (!hasDb() || !q.trim()) return [];
  const words = q.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
  try {
    const rows = (await sql`select slug, title, youtube_id, duration_sec, date, year from videos where status = 'published' and youtube_id is not null and search ilike all(${words.map((w) => `%${w}%`)}::text[]) order by coalesce(published_at, date::timestamptz) desc nulls last limit 200`) as any[];
    return rows.map(card);
  } catch { return []; }
}

/** Studio: add videos to a section without duplicates; removed ones stay removed. */
export async function addToSection(sectionId: string, ids: string[], top = false) {
  if (!ids.length) return 0;
  const have = new Set(((await sql`select youtube_id from video_section_items where section_id = ${sectionId}`) as any[]).map((r) => r.youtube_id));
  const add = [...new Set(ids)].filter((y) => !have.has(y)); if (!add.length) return 0;
  const edge = (await sql`select coalesce(min(position), 0) as lo, coalesce(max(position), 0) as hi from video_section_items where section_id = ${sectionId}`)[0] as any;
  const pos = add.map((_, i) => (top ? edge.lo - add.length + i : edge.hi + 1 + i));
  await sql`insert into video_section_items (section_id, youtube_id, position) select ${sectionId}::uuid, y, p from unnest(${add}::text[], ${pos}::int[]) as t(y, p) on conflict do nothing`;
  return add.length;
}
