import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { getBook, hrefOf } from "@/lib/content/books-public";
import { fold } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";

/** Find words inside one book: chapter, link and a short passage around the words. */
export async function GET(req: Request) {
  const u = new URL(req.url); const slug = u.searchParams.get("book") || ""; const q = fold(u.searchParams.get("q") || "");
  if (!hasDb() || q.length < 2) return NextResponse.json([]);
  const r = await getBook(slug); if (!r) return NextResponse.json([]);
  const rows = (await sql`select id, title, blocks from book_nodes where book_id = ${r.book.id} and status = 'published' and search like ${"%" + q + "%"} limit 40`) as any[];
  const order = new Map(r.flat.map((n, i) => [n.id, i]));
  const out = rows.filter((x) => order.has(x.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!).map((x) => {
    const text = docText(x.blocks || [], 400000); const f = fold(text); const at = f.indexOf(q);
    const s = Math.max(0, at - 70); const snip = at < 0 ? text.slice(0, 160) : (s ? "…" : "") + text.slice(s, at + q.length + 90) + "…";
    const n = r.nodes.find((y) => y.id === x.id)!;
    return { title: x.title, href: hrefOf(slug, r.nodes, n), snippet: snip, hits: f.split(q).length - 1 };
  });
  return NextResponse.json(out, { headers: { "cache-control": "public, max-age=300" } });
}
