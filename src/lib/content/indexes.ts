/* The Tattva indexes: verses, years, places, people and A–Z, built from what is published (lectures, videos,
   the life timeline, letters and documents, diaries, books, articles, magazines, topics). Nothing is invented:
   an index only shows what the archive holds today and grows as content is added in the Studio. */
import { unstable_cache } from "next/cache";
import { sql, hasDb } from "@/lib/db";
import { slugify } from "./text";
import { ARCHIVE_SLUGS } from "@/lib/archive/routes";
/** The website address of a letter, document or other archive item. */
export const archiveHref = (collection: string, slug: string) => `/gurudeva/${Object.entries(ARCHIVE_SLUGS).find(([, v]) => v === collection)?.[0] || collection}/${slug}`;

const q = async <T = any>(p: Promise<any[]>): Promise<T[]> => { try { return (await p) as T[]; } catch { return []; } };
export const SCRIPTURES: Record<string, string> = { BG: "Bhagavad-gītā", SB: "Śrīmad-Bhāgavatam", CC: "Śrī Caitanya-caritāmṛta", CB: "Śrī Caitanya-bhāgavata", BS: "Śrī Brahma-saṁhitā", BRS: "Bhakti-rasāmṛta-sindhu", NOI: "Śrī Upadeśāmṛta", ISO: "Śrī Īśopaniṣad", NOD: "The Nectar of Devotion" };
export const CC_LILA: Record<number, string> = { 1: "Ādi-līlā", 2: "Madhya-līlā", 3: "Antya-līlā" };
const LEC = sql`slug, code, title, kind, type, to_char(date, 'YYYY-MM-DD') date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, audio_direct, audio_direct2, transcript_status`;

/** Every lecture spoken on a verse, scripture → canto (or līlā) → chapter → verse. */
export const verseIndex = unstable_cache(async () => {
  if (!hasDb()) return { rows: [] as any[] };
  const rows = await q(sql`select ${LEC} from audios where status = 'published' and scripture is not null order by scripture, canto nulls last, chapter nulls last, nullif(regexp_replace(coalesce(verse, ''), '[^0-9].*$', ''), '')::int nulls last, date nulls last`);
  return { rows };
}, ["idx-verses-v1"], { revalidate: 600, tags: ["audios"] });

type YearRow = { y: number; lectures: number; videos: number; moments: number; letters: number; diary: number; issues: number };
/** Years with what each holds. */
export const yearIndex = unstable_cache(async (): Promise<YearRow[]> => {
  if (!hasDb()) return [];
  const [a, v, m, l, d, i] = await Promise.all([
    q(sql`select extract(year from date)::int y, count(*)::int n from audios where status = 'published' and date is not null group by 1`),
    q(sql`select coalesce(year, extract(year from date)::int) y, count(*)::int n from videos where status = 'published' and coalesce(year, extract(year from date)::int) is not null group by 1`),
    q(sql`select year y, count(*)::int n from life_events where status = 'published' and year is not null group by 1`),
    q(sql`select coalesce(year, extract(year from date)::int) y, count(*)::int n from archive_items where status = 'published' and coalesce(year, extract(year from date)::int) is not null group by 1`),
    q(sql`select extract(year from date)::int y, count(*)::int n from diary_entries where status = 'published' and date is not null group by 1`),
    q(sql`select coalesce(year, extract(year from date)::int) y, count(*)::int n from magazine_issues where status = 'published' and coalesce(year, extract(year from date)::int) is not null group by 1`),
  ]);
  const by = new Map<number, YearRow>(); const add = (rows: any[], k: keyof Omit<YearRow, "y">) => rows.forEach((r) => { if (!r.y) return; const x = by.get(r.y) || { y: r.y, lectures: 0, videos: 0, moments: 0, letters: 0, diary: 0, issues: 0 }; x[k] += r.n; by.set(r.y, x); });
  add(a, "lectures"); add(v, "videos"); add(m, "moments"); add(l, "letters"); add(d, "diary"); add(i, "issues");
  return [...by.values()].sort((x, y) => x.y - y.y);
}, ["idx-years-v1"], { revalidate: 600, tags: ["audios", "videos"] });

/** Everything of one year. */
export const yearItems = unstable_cache(async (y: number) => {
  if (!hasDb()) return { lectures: [], videos: [], moments: [], letters: [], diary: [], issues: [] };
  const [lectures, videos, moments, letters, diary, issues] = await Promise.all([
    q(sql`select ${LEC} from audios where status = 'published' and extract(year from date) = ${y} order by date, position`),
    q(sql`select slug, title, youtube_id, thumb, to_char(date, 'YYYY-MM-DD') date, place from videos where status = 'published' and coalesce(year, extract(year from date)::int) = ${y} order by date nulls last, position limit 120`),
    q(sql`select slug, title, summary, month, day, date_label, place, image from life_events where status = 'published' and year = ${y} order by month nulls first, day nulls first, position`),
    q(sql`select slug, collection, title, date_label, to_char(date, 'YYYY-MM-DD') date, place, person, recipient from archive_items where status = 'published' and coalesce(year, extract(year from date)::int) = ${y} order by date nulls last, position`),
    q(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date, place from diary_entries where status = 'published' and extract(year from date) = ${y} order by date, position`),
    q(sql`select i.slug, coalesce(m.slug, m.id::text) mslug, m.title mtitle, i.number, i.title, i.cover, to_char(i.date, 'YYYY-MM-DD') date from magazine_issues i join magazines m on m.id = i.magazine_id where i.status = 'published' and coalesce(i.year, extract(year from i.date)::int) = ${y} order by i.date nulls last`),
  ]);
  return { lectures, videos, moments, letters, diary, issues };
}, ["idx-year-v1"], { revalidate: 600, tags: ["audios", "videos"] });

export type PlaceRow = { place: string; country: string | null; slug: string; lectures: number; videos: number; moments: number; letters: number; diary: number; first: number | null; last: number | null };
/** Places he spoke, travelled or wrote from. */
export const placeIndex = unstable_cache(async (): Promise<PlaceRow[]> => {
  if (!hasDb()) return [];
  const [a, v, m, l, d] = await Promise.all([
    q(sql`select place, max(country) country, count(*)::int n, min(extract(year from date))::int f, max(extract(year from date))::int t from audios where status = 'published' and coalesce(place, '') <> '' group by place`),
    q(sql`select place, max(country) country, count(*)::int n, min(coalesce(year, extract(year from date)::int)) f, max(coalesce(year, extract(year from date)::int)) t from videos where status = 'published' and coalesce(place, '') <> '' group by place`),
    q(sql`select place, max(country) country, count(*)::int n, min(year) f, max(year) t from life_events where status = 'published' and coalesce(place, '') <> '' group by place`),
    q(sql`select place, max(country) country, count(*)::int n, min(coalesce(year, extract(year from date)::int)) f, max(coalesce(year, extract(year from date)::int)) t from archive_items where status = 'published' and coalesce(place, '') <> '' group by place`),
    q(sql`select place, null::text country, count(*)::int n, min(extract(year from date))::int f, max(extract(year from date))::int t from diary_entries where status = 'published' and coalesce(place, '') <> '' group by place`),
  ]);
  const by = new Map<string, PlaceRow>();
  const add = (rows: any[], k: "lectures" | "videos" | "moments" | "letters" | "diary") => rows.forEach((r) => { const name = String(r.place).trim(); const key = slugify(name); if (!key) return; const x = by.get(key) || { place: name, country: r.country || null, slug: key, lectures: 0, videos: 0, moments: 0, letters: 0, diary: 0, first: null, last: null }; x[k] += r.n; if (!x.country && r.country) x.country = r.country; if (r.f) x.first = x.first ? Math.min(x.first, r.f) : r.f; if (r.t) x.last = x.last ? Math.max(x.last, r.t) : r.t; by.set(key, x); });
  add(a, "lectures"); add(v, "videos"); add(m, "moments"); add(l, "letters"); add(d, "diary");
  return [...by.values()].sort((x, y) => x.place.localeCompare(y.place));
}, ["idx-places-v1"], { revalidate: 600, tags: ["audios", "videos"] });

/** Everything at one place. */
export const placeItems = unstable_cache(async (name: string) => {
  if (!hasDb()) return { lectures: [], videos: [], moments: [], letters: [], diary: [] };
  const [lectures, videos, moments, letters, diary] = await Promise.all([
    q(sql`select ${LEC} from audios where status = 'published' and lower(trim(place)) = lower(${name}) order by date nulls last, position`),
    q(sql`select slug, title, youtube_id, thumb, to_char(date, 'YYYY-MM-DD') date, place from videos where status = 'published' and lower(trim(place)) = lower(${name}) order by date nulls last limit 120`),
    q(sql`select slug, title, summary, year, month, day, date_label, image from life_events where status = 'published' and lower(trim(place)) = lower(${name}) order by year, month nulls first, day nulls first`),
    q(sql`select slug, collection, title, date_label, to_char(date, 'YYYY-MM-DD') date, person, recipient from archive_items where status = 'published' and lower(trim(place)) = lower(${name}) order by date nulls last`),
    q(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date from diary_entries where status = 'published' and lower(trim(place)) = lower(${name}) order by date`),
  ]);
  return { lectures, videos, moments, letters, diary };
}, ["idx-place-v1"], { revalidate: 600, tags: ["audios", "videos"] });

export type PersonRow = { name: string; slug: string; moments: number; letters: number; years: number[] };
/** People named in the life timeline and in letters and documents. */
export const peopleIndex = unstable_cache(async (): Promise<PersonRow[]> => {
  if (!hasDb()) return [];
  const [m, l] = await Promise.all([
    q(sql`select p name, array_agg(distinct year) filter (where year is not null) ys, count(*)::int n from (select unnest(people) p, year from life_events where status = 'published') x where coalesce(p, '') <> '' group by p`),
    q(sql`select p name, array_agg(distinct coalesce(year, extract(year from date)::int)) filter (where coalesce(year, extract(year from date)::int) is not null) ys, count(*)::int n from (select unnest(array[person, recipient]) p, year, date from archive_items where status = 'published') x where coalesce(p, '') <> '' group by p`),
  ]);
  const by = new Map<string, PersonRow>();
  const add = (rows: any[], k: "moments" | "letters") => rows.forEach((r) => { const name = String(r.name).trim(); const key = slugify(name); if (!key) return; const x = by.get(key) || { name, slug: key, moments: 0, letters: 0, years: [] }; x[k] += r.n; x.years = [...new Set([...x.years, ...((r.ys || []) as number[])])].sort(); by.set(key, x); });
  add(m, "moments"); add(l, "letters");
  return [...by.values()].sort((x, y) => x.name.localeCompare(y.name));
}, ["idx-people-v1"], { revalidate: 600, tags: ["timeline"] });

export const personItems = unstable_cache(async (name: string) => {
  if (!hasDb()) return { moments: [], letters: [] };
  const [moments, letters] = await Promise.all([
    q(sql`select slug, title, summary, year, month, day, date_label, place, image from life_events where status = 'published' and exists (select 1 from unnest(people) p where lower(trim(p)) = lower(${name})) order by year, month nulls first, day nulls first`),
    q(sql`select slug, collection, title, date_label, to_char(date, 'YYYY-MM-DD') date, place, person, recipient from archive_items where status = 'published' and (lower(trim(person)) = lower(${name}) or lower(trim(recipient)) = lower(${name})) order by date nulls last`),
  ]);
  return { moments, letters };
}, ["idx-person-v1"], { revalidate: 600, tags: ["timeline"] });

export type AZ = { title: string; href: string; kind: string; sub?: string | null };
/** Everything, alphabetically. */
export const azIndex = unstable_cache(async (): Promise<AZ[]> => {
  if (!hasDb()) return [];
  const [t, b, a, v, ar, m, i, li, ar2] = await Promise.all([
    q(sql`select name from vocab where kind = 'topic'`),
    q(sql`select slug, title, author from books where status = 'published' and library = 'main'`),
    q(sql`select slug, code, title, to_char(date, 'YYYY-MM-DD') date, place from audios where status = 'published'`),
    q(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date from videos where status = 'published'`),
    q(sql`select slug, title, author from articles where status = 'published'`),
    q(sql`select coalesce(slug, id::text) slug, title from magazines where status = 'published'`),
    q(sql`select i.slug, coalesce(m.slug, m.id::text) mslug, m.title mtitle, i.number, i.title from magazine_issues i join magazines m on m.id = i.magazine_id where i.status = 'published'`),
    q(sql`select slug, title, year from life_events where status = 'published'`),
    q(sql`select slug, collection, title, date_label from archive_items where status = 'published'`),
  ]);
  const out: AZ[] = [
    ...t.map((x) => ({ title: x.name, href: `/tattva/${slugify(x.name)}`, kind: "Topic" })),
    ...b.map((x) => ({ title: x.title, href: `/books/${x.slug}`, kind: "Book", sub: x.author })),
    ...a.map((x) => ({ title: x.title, href: x.code ? `/audios/${x.code}` : `/teachings/audio/${x.slug}`, kind: "Lecture", sub: [x.date, x.place].filter(Boolean).join(" · ") })),
    ...v.map((x) => ({ title: x.title, href: `/teachings/videos/${x.slug}`, kind: "Video", sub: x.date })),
    ...ar.map((x) => ({ title: x.title, href: `/teachings/articles/${x.slug}`, kind: "Article", sub: x.author })),
    ...m.map((x) => ({ title: x.title, href: `/teachings/magazines/${x.slug}`, kind: "Magazine" })),
    ...i.map((x) => ({ title: [x.number, x.title].filter(Boolean).join(" · ") || "Issue", href: `/teachings/magazines/${x.mslug}/${x.slug}`, kind: "Issue", sub: x.mtitle })),
    ...li.map((x) => ({ title: x.title, href: `/gurudeva/timeline#m-${x.slug}`, kind: "Life moment", sub: x.year ? String(x.year) : null })),
    ...ar2.map((x) => ({ title: x.title, href: archiveHref(x.collection, x.slug), kind: x.collection === "letters" ? "Letter" : x.collection.charAt(0).toUpperCase() + x.collection.slice(1).replace(/s$/, ""), sub: x.date_label })),
  ].filter((x) => x.title && String(x.title).trim());
  return out.sort((x, y) => fold(x.title).localeCompare(fold(y.title)));
}, ["idx-az-v1"], { revalidate: 600, tags: ["audios", "videos"] });

export const fold = (s: string) => s.normalize("NFKD").replace(/\p{M}+/gu, "").replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
