import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { fold } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";

/** Full-text search for the WebFolio. Diacritics are not needed. Returns links straight into the WebFolio. */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("q") || ""; const f = fold(raw);
  if (f.length < 2 || !hasDb()) return NextResponse.json({ groups: [] });
  const like = `%${f}%`; const y = (d: any) => (d ? String(d instanceof Date ? d.toISOString() : d).slice(0, 4) : "undated");
  const snip = (text: string) => { const t = String(text || "").replace(/\s+/g, " "); const i = fold(t).indexOf(f); if (i < 0) return t.slice(0, 150); const s = Math.max(0, i - 60); return (s ? "…" : "") + t.slice(s, i + f.length + 100) + "…"; };
  const q = async (p: Promise<any[]>) => { try { return await p; } catch { return []; } };
  const [aud, ex, bn, vid, di, ar] = await Promise.all([
    q(sql`select slug, title, date, place, kind, summary, transcript from audios where status = 'published' and search like ${like} order by date limit 40`),
    q(sql`select slug, kind, title, text, verse_ref, translation, source from excerpts where status = 'published' and search like ${like} limit 30`),
    q(sql`select n.slug, n.title, n.blocks, b.slug as book, b.title as btitle from book_nodes n join books b on b.id = n.book_id where n.status = 'published' and b.status = 'published' and n.search like ${like} limit 30`),
    q(sql`select slug, title, date, year, description from videos where status = 'published' and search like ${like} limit 20`),
    q(sql`select slug, date, date_note, translation from diary_entries where status = 'published' and search like ${like} order by date limit 20`),
    q(sql`select collection, slug, title, summary, person from archive_items where status = 'published' and search like ${like} limit 30`),
  ]);
  const song = (k: string) => k === "kirtan" || k === "bhajan";
  const groups = [
    { title: "Lectures & transcriptions", hits: aud.map((r: any) => ({ href: `/webfolio/${song(r.kind) ? "kirtans" : "lectures"}/${y(r.date)}/${r.slug}`, title: r.title, sub: [r.date ? y(r.date) : "", r.place].filter(Boolean).join(" · "), snippet: snip(`${r.summary || ""} ${docText(r.transcript || [], 200000)}`) })) },
    { title: "Books", hits: bn.map((r: any) => ({ href: `/webfolio/books/${r.book}#${r.slug}`, title: r.title, sub: r.btitle, snippet: snip(docText(r.blocks || [], 200000)) })) },
    { title: "Compilations", hits: ex.map((r: any) => ({ href: `/webfolio/compilations/${r.kind}#${r.slug}`, title: r.title || r.verse_ref || "", sub: r.source || "", snippet: snip(`${r.text || ""} ${r.translation || ""}`) })) },
    { title: "His Diary", hits: di.map((r: any) => ({ href: `/webfolio/gurudeva/diary-${y(r.date)}#${r.slug}`, title: r.date ? String(r.date instanceof Date ? r.date.toISOString() : r.date).slice(0, 10) : r.date_note || "Undated", sub: "His Diary", snippet: snip(r.translation) })) },
    { title: "Śrīla Gurudeva", hits: ar.map((r: any) => ({ href: `/webfolio/gurudeva/${r.collection}#${r.slug}`, title: r.title, sub: r.person || "", snippet: snip(r.summary || "") })) },
    { title: "Videos", hits: vid.map((r: any) => ({ href: `/webfolio/videos/${r.year || y(r.date)}/${r.slug}`, title: r.title, sub: r.year || y(r.date), snippet: snip(r.description || "") })) },
  ].filter((g) => g.hits.length);
  return NextResponse.json({ groups });
}
