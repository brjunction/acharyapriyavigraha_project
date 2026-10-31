import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { fold } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";

/** Full-text search for the WebFolio. Diacritics are not needed. Returns links straight into the WebFolio.
 *  ?q=  the words · ?mode=phrase|all (default phrase) · ?full=1 for the research page: more results, every place a word is found. */
export async function GET(req: Request) {
  const u = new URL(req.url); const raw = u.searchParams.get("q") || ""; const f = fold(raw).trim().replace(/\s+/g, " ");
  const mode = u.searchParams.get("mode") === "all" ? "all" : "phrase"; const full = u.searchParams.get("full") === "1";
  if (f.length < 2 || !hasDb()) return NextResponse.json({ groups: [] });
  const words = mode === "all" ? f.split(" ").filter((w) => w.length > 1) : [f];
  const key = [...words].sort((a, b) => b.length - a.length)[0] || f; const like = `%${key}%`;
  const L = full ? 400 : 40; const y = (d: any) => (d ? String(d instanceof Date ? d.toISOString() : d).slice(0, 4) : "undated");
  const has = (t: string) => { const x = fold(t); return words.every((w) => x.includes(w)); };
  /** Every place the words are found, with the words around them. */
  const kwic = (text: string, max: number) => {
    const t = String(text || "").replace(/\s+/g, " "); const x = fold(t); const out: string[] = []; let n = 0;
    for (const w of words) { let p = x.indexOf(w); while (p >= 0) { n++; if (out.length < max) { const s = Math.max(0, p - 70); out.push((s ? "…" : "") + t.slice(s, p + w.length + 110).trim() + "…"); } p = x.indexOf(w, p + w.length); } }
    if (!out.length) out.push(t.slice(0, 160)); return { n, snips: out };
  };
  const hit = (base: { href: string; title: string; sub?: string }, text: string) => { const k = kwic(text, full ? 4 : 1); return { ...base, snippet: k.snips[0], snips: full ? k.snips : undefined, n: k.n }; };
  const q = async (p: Promise<any[]>) => { try { return await p; } catch { return []; } };
  const [aud, ex, bn, vid, di, ar, art] = await Promise.all([
    q(sql`select slug, title, date, place, kind, summary, transcript from audios where status = 'published' and search like ${like} order by date limit ${L}`),
    q(sql`select slug, kind, title, text, verse_ref, translation, source from excerpts where status = 'published' and search like ${like} limit ${L}`),
    q(sql`select n.slug, n.title, n.blocks, b.slug as book, b.title as btitle from book_nodes n join books b on b.id = n.book_id where n.status = 'published' and b.status = 'published' and n.search like ${like} limit ${L}`),
    q(sql`select slug, title, date, year, description from videos where status = 'published' and search like ${like} limit ${L}`),
    q(sql`select slug, date, date_note, translation from diary_entries where status = 'published' and search like ${like} order by date limit ${L}`),
    q(sql`select collection, slug, title, summary, body, person from archive_items where status = 'published' and search like ${like} limit ${L}`),
    q(sql`select slug, title, author, section, summary, body from articles where status = 'published' and search like ${like} limit ${L}`),
  ]);
  const song = (k: string) => k === "kirtan" || k === "bhajan";
  const T = (r: any, ...xs: any[]) => [r.title || "", ...xs].join(" \n ");
  const groups = [
    { key: "lectures", title: "Lectures & transcriptions", hits: aud.map((r: any) => ({ r, t: T(r, r.summary || "", docText(r.transcript || [], 400000)) })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/${song(r.kind) ? "kirtans" : "lectures"}/${y(r.date)}/${r.slug}`, title: r.title, sub: [r.date ? String(r.date instanceof Date ? r.date.toISOString() : r.date).slice(0, 10) : "", r.place].filter(Boolean).join(" · ") }, t)) },
    { key: "books", title: "Books", hits: bn.map((r: any) => ({ r, t: T(r, docText(r.blocks || [], 400000)) })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/books/${r.book}#${r.slug}`, title: r.title, sub: r.btitle }, t)) },
    { key: "compilations", title: "Compilations", hits: ex.map((r: any) => ({ r, t: T(r, r.verse_ref || "", r.text || "", r.translation || "") })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/compilations/${r.kind}#${r.slug}`, title: r.title || r.verse_ref || "Entry", sub: r.source || "" }, t)) },
    { key: "articles", title: "Articles", hits: art.map((r: any) => ({ r, t: T(r, r.summary || "", docText(r.body || [], 400000)) })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/articles/${encodeURIComponent(r.section || "Other articles")}#${r.slug}`, title: r.title, sub: r.author ? `By ${r.author}` : "" }, t)) },
    { key: "diary", title: "His Diary", hits: di.map((r: any) => ({ r, t: String(r.translation || "") })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/gurudeva/diary-${y(r.date)}#${r.slug}`, title: r.date ? String(r.date instanceof Date ? r.date.toISOString() : r.date).slice(0, 10) : r.date_note || "Undated", sub: "His Diary" }, t)) },
    { key: "gurudeva", title: "Śrīla Gurudeva", hits: ar.map((r: any) => ({ r, t: T(r, r.person || "", r.summary || "", typeof r.body === "string" ? r.body : docText(r.body || [], 200000)) })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/gurudeva/${r.collection}#${r.slug}`, title: r.title, sub: r.person || "" }, t)) },
    { key: "videos", title: "Videos", hits: vid.map((r: any) => ({ r, t: T(r, r.description || "") })).filter((x) => has(x.t)).map(({ r, t }) => hit({ href: `/webfolio/videos/${r.year || y(r.date)}/${r.slug}`, title: r.title, sub: String(r.year || y(r.date)) }, t)) },
  ].map((g) => ({ ...g, hits: full ? [...g.hits].sort((a, b) => b.n - a.n) : g.hits })).filter((g) => g.hits.length);
  return NextResponse.json({ groups, total: groups.reduce((a, g) => a + g.hits.length, 0), places: groups.reduce((a, g) => a + g.hits.reduce((b, h) => b + h.n, 0), 0) });
}
