import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { fold, slugify } from "@/lib/content/text";
import { COLLECTIONS } from "@/lib/archive/config";

export type Hit = { type: string; title: string; href: string; sub: string; snippet: string };
const TYPES: Record<string, string> = { lecture: "Lectures", kirtan: "Kīrtanas", video: "Videos", book: "Books", chapter: "Book chapters", article: "Articles", quote: "Quotes & compilations", topic: "Topics", diary: "His diary", archive: "Śrīla Gurudeva", life: "Life timeline" };
const snip = (text: string, q: string) => { const t = String(text || "").replace(/\s+/g, " "); const i = fold(t).indexOf(q.split(" ")[0]); if (i < 0) return t.slice(0, 160); const s = Math.max(0, i - 70); return (s ? "…" : "") + t.slice(s, i + 130) + "…"; };
const q_ = async (p: Promise<any[]>) => { try { return await p; } catch { return []; } };

/** Search everything: ?q=words&type=lecture|…&limit= . Every word must match (accents ignored). */
export async function GET(req: Request) {
  const u = new URL(req.url); const raw = (u.searchParams.get("q") || "").trim(); const only = u.searchParams.get("type"); const lim = Math.min(60, Number(u.searchParams.get("limit")) || 8);
  const q = fold(raw); if (!hasDb() || q.length < 2) return NextResponse.json({ q: raw, groups: [] });
  const words = q.split(/\s+/).filter(Boolean).slice(0, 6); const like = words.map((w) => `%${w}%`);
  const all = (col: string) => words.map((_, i) => `${col} like $${i + 1}`).join(" and ");
  const run = (t: string, sqlText: string) => (!only || only === t) ? q_(sql.query(sqlText.replace("{W}", all("search")), [...like, lim])) : Promise.resolve([]);
  const L = `$${words.length + 1}`;
  const [lectures, kirtans, videos, books, chapters, articles, quotes, diary, archive, life, topics] = await Promise.all([
    run("lecture", `select slug, title, to_char(date,'YYYY-MM-DD') date, place, coalesce(summary, left(transcript::text, 4000)) t from audios where status='published' and kind not in ('kirtan','bhajan') and {W} order by date desc nulls last limit ${L}`),
    run("kirtan", `select slug, title, to_char(date,'YYYY-MM-DD') date, place, coalesce(song, '') t from audios where status='published' and kind in ('kirtan','bhajan') and {W} order by date desc nulls last limit ${L}`),
    run("video", `select slug, title, to_char(date,'YYYY-MM-DD') date, place, coalesce(description,'') t from videos where status='published' and {W} order by date desc nulls last limit ${L}`),
    (!only || only === "book") ? q_(sql.query(`select slug, title, author, description t from books where status='published' and ${words.map((_, i) => `lower(title || ' ' || coalesce(author,'') || ' ' || coalesce(description,'')) like $${i + 1}`).join(" and ")} limit ${L}`, [...like, lim])) : Promise.resolve([]),
    run("chapter", `select n.title, n.slug, b.slug book, b.title btitle, n.search t, n.parent_id, n.book_id from book_nodes n join books b on b.id = n.book_id where n.status='published' and b.status='published' and {W}`.replace("{W}", all("n.search")) + ` limit ${L}`),
    run("article", `select slug, title, author, coalesce(summary, left(search, 3000)) t from articles where status='published' and {W} order by date desc nulls last limit ${L}`),
    run("quote", `select slug, kind, title, text t from excerpts where status='published' and {W} limit ${L}`),
    run("diary", `select slug, to_char(date,'YYYY-MM-DD') date, date_note, translation t from diary_entries where status='published' and {W} order by date limit ${L}`),
    run("archive", `select collection, slug, title, coalesce(summary, '') t from archive_items where status='published' and {W} limit ${L}`),
    (!only || only === "life") ? q_(sql.query(`select slug, title, year, coalesce(summary,'') t from life_events where status='published' and ${words.map((_, i) => `lower(title || ' ' || coalesce(summary,'') || ' ' || coalesce(place,'')) like $${i + 1}`).join(" and ")} limit ${L}`, [...like, lim])) : Promise.resolve([]),
    (!only || only === "topic") ? q_(sql.query(`select name from vocab where kind='topic' and ${words.map((_, i) => `lower(name) like $${i + 1}`).join(" and ")} limit ${L}`, [...like, lim])) : Promise.resolve([]),
  ]);
  const ROUTE: Record<string, string> = { quote: "/teachings/quotes", verse: "/teachings/verses", story: "/teachings/stories", instruction: "/teachings/instructions", desire: "/teachings/desires", nectar: "/teachings/nectar-drops", analogy: "/teachings/analogies", qa: "/teachings/questions-and-answers" };
  const groups: { type: string; label: string; hits: Hit[] }[] = [
    { type: "lecture", hits: lectures.map((r: any) => ({ type: "lecture", title: r.title, href: `/teachings/audio/${r.slug}`, sub: [r.date, r.place].filter(Boolean).join(" · "), snippet: snip(r.t, q) })) },
    { type: "kirtan", hits: kirtans.map((r: any) => ({ type: "kirtan", title: r.title, href: `/teachings/audio/${r.slug}`, sub: [r.date, r.place].filter(Boolean).join(" · "), snippet: "" })) },
    { type: "video", hits: videos.map((r: any) => ({ type: "video", title: r.title, href: `/teachings/videos/${r.slug}`, sub: [r.date, r.place].filter(Boolean).join(" · "), snippet: snip(r.t, q) })) },
    { type: "book", hits: books.map((r: any) => ({ type: "book", title: r.title, href: `/books/${r.slug}`, sub: r.author || "", snippet: snip(r.t || "", q) })) },
    { type: "chapter", hits: chapters.map((r: any) => ({ type: "chapter", title: r.title, href: `/books/${r.book}?find=${encodeURIComponent(raw)}`, sub: r.btitle, snippet: snip(r.t, q) })) },
    { type: "article", hits: articles.map((r: any) => ({ type: "article", title: r.title, href: `/teachings/articles/${r.slug}`, sub: r.author || "", snippet: snip(r.t, q) })) },
    { type: "quote", hits: quotes.filter((r: any) => ROUTE[r.kind]).map((r: any) => ({ type: "quote", title: r.title || snip(r.t, q).slice(0, 90), href: `${ROUTE[r.kind]}/${r.slug}`, sub: r.kind, snippet: snip(r.t, q) })) },
    { type: "diary", hits: diary.map((r: any) => ({ type: "diary", title: r.date || r.date_note || "His diary", href: `/gurudeva/diaries/${r.slug}`, sub: "His diary to Śrī Gopāl Jiu", snippet: snip(r.t, q) })) },
    { type: "archive", hits: archive.filter((r: any) => COLLECTIONS[r.collection]).map((r: any) => ({ type: "archive", title: r.title, href: `${COLLECTIONS[r.collection].base}/${r.slug}`, sub: COLLECTIONS[r.collection].label, snippet: snip(r.t, q) })) },
    { type: "life", hits: life.map((r: any) => ({ type: "life", title: r.title, href: `/gurudeva/timeline#e-${r.slug}`, sub: String(r.year), snippet: snip(r.t, q) })) },
    { type: "topic", hits: topics.map((r: any) => ({ type: "topic", title: r.name, href: `/tattva/${slugify(r.name)}`, sub: "Tattva", snippet: "" })) },
  ].map((g) => ({ ...g, label: TYPES[g.type] })).filter((g) => g.hits.length);
  return NextResponse.json({ q: raw, groups }, { headers: { "cache-control": "public, max-age=60" } });
}
