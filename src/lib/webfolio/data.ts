/* WebFolio: the archive's text as documentation. Sections → groups (one scrollable page each) → items. */
import { unstable_cache } from "next/cache";
import { sql, hasDb } from "@/lib/db";
import { verseRef, durText } from "@/lib/content/text";
import { order, type Node } from "@/lib/content/books";
import { COLLECTIONS } from "@/lib/archive/config";
import { getTimeline } from "@/lib/content/timeline";

export type FGroup = { key: string; title: string; count?: number };
export type FSec = { key: string; title: string; desc: string; icon: string; color: string; groups: FGroup[] };
export type FItem = { key: string; title: string; sub?: string };

const SECS: Omit<FSec, "groups">[] = [
  { key: "gurudeva", title: "Śrīla Gurudeva", desc: "His life, diary, memories, letters and projects", icon: "Flower2", color: "#853500" },
  { key: "lectures", title: "Lectures", desc: "Every recorded lecture, year by year", icon: "Headphones", color: "#b45309" },
  { key: "transcriptions", title: "Transcriptions", desc: "Lectures written out, to read", icon: "FileText", color: "#4338ca" },
  { key: "kirtans", title: "Kīrtanas", desc: "Songs he sang and led", icon: "Music", color: "#be185d" },
  { key: "books", title: "Books", desc: "Each book on one page", icon: "BookOpen", color: "#0f766e" },
  { key: "compilations", title: "Compilations", desc: "Quotes, verses, stories, analogies", icon: "Quote", color: "#a16207" },
  { key: "videos", title: "Videos", desc: "Video lectures and kīrtanas, by year", icon: "Clapperboard", color: "#b91c1c" },
  { key: "pages", title: "Pages", desc: "Pages written in the Studio", icon: "Files", color: "#475569" },
];
/** Old Studio setting names → sections. */
const OLD: Record<string, string> = { "menu:gurudeva": "gurudeva", audios: "lectures", transcripts: "transcriptions", kirtans: "kirtans", books: "books", excerpts: "compilations", videos: "videos", pages: "pages" };
const EXK: [string, string][] = [["quote", "Quotes"], ["verse", "Verses"], ["story", "Stories & anecdotes"], ["instruction", "Instructions"], ["desire", "Desires"], ["nectar", "Nectar drops"], ["analogy", "Analogies"], ["qa", "Questions & answers"], ["memory", "Memories"], ["glorification", "Glorifications"], ["prayer", "Prayers"]];
const ARCH = ["memories", "glorifications", "letters", "places", "belongings", "disciples", "projects"];
const q = async <T,>(p: Promise<T[]>): Promise<T[]> => { try { return await p; } catch { return []; } };
const yearsOf = (rows: { y: number; n: number }[]) => rows.map((r) => ({ key: r.y ? String(r.y) : "undated", title: r.y ? String(r.y) : "Undated", count: r.n }));

async function buildNav(): Promise<FSec[]> {
  if (!hasDb()) return SECS.map((s) => ({ ...s, groups: [] }));
  const cfg = (await q(sql`select source, title, enabled, position from folio_sections`)) as any[];
  const [lec, tr, kir, books, exk, vid, pages, diary, arch, tl] = await Promise.all([
    q(sql`select coalesce(extract(year from date)::int, 0) y, count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan') group by 1 order by (coalesce(extract(year from date)::int, 0) = 0), 1`),
    q(sql`select coalesce(extract(year from date)::int, 0) y, count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan') and jsonb_array_length(transcript) > 0 group by 1 order by (coalesce(extract(year from date)::int, 0) = 0), 1`),
    q(sql`select coalesce(extract(year from date)::int, 0) y, count(*)::int n from audios where status = 'published' and kind in ('kirtan','bhajan') group by 1 order by (coalesce(extract(year from date)::int, 0) = 0), 1`),
    q(sql`select slug, title, (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published') n from books b where status = 'published' order by category nulls last, position, title`),
    q(sql`select kind, count(*)::int n from excerpts where status = 'published' group by 1`),
    q(sql`select coalesce(year, extract(year from date)::int, 0) y, count(*)::int n from videos where status = 'published' group by 1 order by (coalesce(year, extract(year from date)::int, 0) = 0), 1`),
    q(sql`select path, title from pages where status = 'published' and parent_id is null and coalesce(settings->>'studio', 'on') <> 'off' order by position, title`),
    q(sql`select coalesce(extract(year from date)::int, 0) y, count(*)::int n from diary_entries where status = 'published' and coalesce(translation, '') <> '' group by 1 order by (coalesce(extract(year from date)::int, 0) = 0), 1`),
    q(sql`select collection, count(*)::int n from archive_items where status = 'published' group by 1`),
    q(sql`select count(*)::int n from life_events where status = 'published'`),
  ]) as any[][];
  const groups: Record<string, FGroup[]> = {
    gurudeva: [
      { key: "timeline", title: "Life timeline", count: tl[0]?.n || undefined },
      ...diary.map((r) => ({ key: `diary-${r.y || "undated"}`, title: `His Diary, ${r.y || "undated"}`, count: r.n })),
      ...ARCH.filter((k) => arch.some((a) => a.collection === k)).map((k) => ({ key: k, title: COLLECTIONS[k].label, count: arch.find((a) => a.collection === k)?.n })),
    ],
    lectures: yearsOf(lec), transcriptions: yearsOf(tr), kirtans: yearsOf(kir), videos: yearsOf(vid),
    books: books.map((b) => ({ key: b.slug, title: b.title, count: b.n })),
    compilations: EXK.filter(([k]) => exk.some((e) => e.kind === k)).map(([k, l]) => ({ key: k, title: l, count: exk.find((e) => e.kind === k)?.n })),
    pages: pages.map((p) => ({ key: p.path.replace(/^\//, "").replace(/\//g, "~"), title: p.title })),
  };
  const conf = (k: string) => cfg.find((c) => OLD[c.source] === k);
  return SECS.map((s) => ({ ...s, title: conf(s.key)?.title || s.title, groups: groups[s.key] || [] }))
    .filter((s) => s.groups.length && conf(s.key)?.enabled !== false)
    .sort((a, b) => (conf(a.key)?.position ?? 99) - (conf(b.key)?.position ?? 99) || SECS.findIndex((x) => x.key === a.key) - SECS.findIndex((x) => x.key === b.key));
}
/** The whole contents, cached for ten minutes (and refreshed when the Studio publishes). */
export const nav = unstable_cache(buildNav, ["webfolio-nav-v1"], { revalidate: 600, tags: ["webfolio"] });

/* ------------------------------------------------------------------ Group pages: everything of one group on one page */
export type Block = { id: string; title: string; sub?: string; href?: string; text?: string; doc?: any[]; badge?: string; audio?: string };
export type Page = { title: string; sub?: string; intro?: string; blocks: Block[]; list?: boolean };
const yr = (g: string) => (g === "undated" ? 0 : Number(g));
const date = (d: any) => (d ? String(d instanceof Date ? d.toISOString() : d).slice(0, 10) : "");

export async function groupPage(sec: string, g: string): Promise<Page | null> {
  if (!hasDb()) return null;
  if (sec === "lectures" || sec === "transcriptions" || sec === "kirtans") {
    const songs = sec === "kirtans"; const text = sec === "transcriptions";
    const rows = (await q(sql`select slug, title, date, date_note, place, country, scripture, canto, chapter, verse, type, duration_sec, transcript_status, jsonb_array_length(transcript) > 0 as has_text from audios where status = 'published' and (kind in ('kirtan','bhajan')) = ${songs} and (${!text} or jsonb_array_length(transcript) > 0) and coalesce(extract(year from date)::int, 0) = ${yr(g)} order by date nulls last, title`)) as any[];
    return { title: `${SECS.find((s) => s.key === sec)!.title} · ${g === "undated" ? "Undated" : g}`, intro: `${rows.length} ${songs ? "recordings" : text ? "transcriptions" : "lectures"}${g === "undated" ? " without a known date" : ` from ${g}`}.`, list: true,
      blocks: rows.map((r) => ({ id: r.slug, title: r.title, href: `/webfolio/${sec}/${g}/${r.slug}`, sub: [date(r.date) || r.date_note, [r.place, r.country].filter(Boolean).join(", "), r.type, verseRef(r), durText(r.duration_sec)].filter(Boolean).join(" · "), badge: !text && r.has_text ? "Text" : undefined })) };
  }
  if (sec === "videos") {
    const rows = (await q(sql`select slug, title, date, year, place, type, scripture, duration_sec from videos where status = 'published' and coalesce(year, extract(year from date)::int, 0) = ${yr(g)} order by date nulls last, title`)) as any[];
    return { title: `Videos · ${g === "undated" ? "Undated" : g}`, intro: `${rows.length} videos.`, list: true, blocks: rows.map((r) => ({ id: r.slug, title: r.title, href: `/webfolio/videos/${g}/${r.slug}`, sub: [date(r.date) || r.year, r.place, r.type, r.scripture, durText(r.duration_sec)].filter(Boolean).join(" · ") })) };
  }
  if (sec === "books") {
    const b = (await q(sql`select id, title, subtitle, author, description from books where slug = ${g} and status = 'published'`))[0] as any; if (!b) return null;
    const nodes = order((await q(sql`select id, book_id, parent_id, kind, position, title, slug, status, blocks from book_nodes where book_id = ${b.id} and status = 'published'`)) as (Node & { blocks: any[] })[]) as (Node & { blocks: any[] })[];
    return { title: b.title, sub: [b.subtitle, b.author].filter(Boolean).join(" · "), intro: b.description || undefined, blocks: nodes.map((n) => ({ id: n.slug, title: n.title, doc: n.blocks, href: `/webfolio/books/${g}/${n.slug}` })) };
  }
  if (sec === "compilations") {
    const rows = (await q(sql`select e.slug, e.title, e.text, e.verse_ref, e.original, e.transliteration, e.translation, e.source, a.title as lecture from excerpts e left join audios a on a.id = e.audio_id where e.status = 'published' and e.kind = ${g} order by e.position, e.created_at`)) as any[];
    return { title: EXK.find(([k]) => k === g)?.[1] || g, intro: `${rows.length} entries, each with its source.`, blocks: rows.map((r) => ({ id: r.slug, title: r.title || r.verse_ref || "", sub: [r.source, r.lecture].filter(Boolean).join(" · "), text: [r.original, r.transliteration, r.translation, r.text].filter(Boolean).join("\n\n") })) };
  }
  if (sec === "pages") {
    const path = "/" + g.replace(/~/g, "/"); const p = (await q(sql`select title, blocks from pages where path = ${path} and status = 'published'`))[0] as any; if (!p) return null;
    const kids = (await q(sql`select c.path, c.title, c.blocks from pages c join pages p on c.parent_id = p.id where p.path = ${path} and c.status = 'published' order by c.position, c.title`)) as any[];
    return { title: p.title, blocks: [{ id: "page", title: "", doc: p.blocks }, ...kids.map((k) => ({ id: k.path.split("/").pop(), title: k.title, doc: k.blocks }))] };
  }
  if (sec === "gurudeva") {
    if (g === "timeline") { const t = await getTimeline(); return { title: "Life timeline", intro: "The life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, chapter by chapter.", blocks: t.eras.flatMap((e) => [{ id: `era-${e.year_from}`, title: e.title, sub: `${e.year_from}–${e.year_to}`, text: e.summary || "" }, ...t.events.filter((x) => x.year >= e.year_from && x.year <= e.year_to).map((x) => ({ id: x.slug, title: `${x.date_label || x.year} — ${x.title}`, sub: [x.place, x.people.join(", ")].filter(Boolean).join(" · "), text: [x.summary, x.body].filter(Boolean).join("\n\n") }))]) }; }
    if (g.startsWith("diary-")) {
      const y = g.slice(6); const rows = (await q(sql`select slug, date, date_note, translation from diary_entries where status = 'published' and coalesce(translation, '') <> '' and coalesce(extract(year from date)::int, 0) = ${yr(y)} order by date nulls last, position`)) as any[];
      const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      return { title: `His Diary, ${y === "undated" ? "undated pages" : y}`, intro: `Prayers to Śrī Gopāl Jiu — ${rows.length} pages.`, blocks: rows.map((r) => ({ id: r.slug, title: r.date ? fmt(r.date) : r.date_note || "Undated", text: r.translation })) };
    }
    const c = COLLECTIONS[g]; if (!c) return null;
    const rows = (await q(sql`select slug, title, subtitle, person, person_role, recipient, to_char(date, 'YYYY-MM-DD') as d, year, date_label, place, summary, body, chapters, s.title as section from archive_items i left join archive_sections s on s.collection = i.collection and s.key = i.section where i.collection = ${g} and i.status = 'published' order by s.position nulls last, coalesce(i.date, make_date(i.year, 1, 1)) nulls last, i.position, i.title`)) as any[];
    return { title: c.label, intro: c.intro, blocks: rows.map((r) => ({ id: r.slug, title: r.title, sub: [r.section, [r.person, r.recipient].filter(Boolean).join(" → "), r.person_role, r.date_label || r.d || r.year, r.place, r.subtitle].filter(Boolean).join(" · "), text: [r.summary, ...(r.chapters || []).map((ch: any) => `${ch.title}\n${ch.text}`)].filter(Boolean).join("\n\n"), doc: r.body })) };
  }
  return null;
}

/* ------------------------------------------------------------------ Item pages */
export type Item = { title: string; sub?: string; doc?: any[]; text?: string; audio?: string; youtube?: string; href?: string; facts?: [string, string][] };
export async function itemPage(sec: string, g: string, slug: string): Promise<Item | null> {
  if (!hasDb()) return null;
  if (sec === "lectures" || sec === "transcriptions" || sec === "kirtans") {
    const r = (await q(sql`select * from audios where slug = ${slug} and status = 'published'`))[0] as any; if (!r) return null;
    return { title: r.title, sub: [date(r.date) || r.date_note, [r.place, r.country].filter(Boolean).join(", "), r.type, verseRef(r)].filter(Boolean).join(" · "), doc: r.transcript || [], text: r.summary || undefined, audio: r.audio_url || undefined, href: `/teachings/audio/${slug}`,
      facts: [["Length", durText(r.duration_sec)], ["Series", r.series], ["Language", r.language], ["Song", r.song], ["Written by", r.song_author], ["Sung by", r.singer]].filter(([, v]) => v) as [string, string][] };
  }
  if (sec === "videos") { const r = (await q(sql`select * from videos where slug = ${slug} and status = 'published'`))[0] as any; if (!r) return null; return { title: r.title, sub: [date(r.date) || r.year, r.place, r.type, r.scripture].filter(Boolean).join(" · "), text: r.description || undefined, youtube: r.youtube_id || undefined, href: `/teachings/videos/${slug}` }; }
  if (sec === "books") { const r = (await q(sql`select n.title, n.blocks, b.title as book from book_nodes n join books b on b.id = n.book_id where b.slug = ${g} and n.slug = ${slug} and n.status = 'published'`))[0] as any; if (!r) return null; return { title: r.title, sub: r.book, doc: r.blocks }; }
  return null;
}
/** Previous and next items of a list group, for item pages. */
export async function neighbours(sec: string, g: string, slug: string) {
  const p = await groupPage(sec, g); const xs = p?.blocks || []; const k = xs.findIndex((b) => b.id === slug);
  const at = (b?: Block) => (b ? { title: b.title, href: b.href || `/webfolio/${sec}/${g}#${b.id}` } : null);
  return { prev: at(xs[k - 1]), next: at(xs[k + 1]), group: p?.title || "" };
}
