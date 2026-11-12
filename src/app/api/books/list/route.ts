import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export const revalidate = 300;
/** Every published book, for the reader's "Books" list: title, cover, shelf, language, library. */
export async function GET() {
  if (!hasDb()) return NextResponse.json([]);
  try { return NextResponse.json(await sql`select b.slug, b.title, b.cover_url as cover, (select n.slug from book_nodes n where n.book_id = b.id and n.parent_id is null and n.status = 'published' order by n.position limit 1) as first, coalesce(b.category, case when b.library = 'gaudiya' then coalesce(b.author, 'Gauḍīya library') else 'Books' end) as shelf, b.language, b.library from books b where b.status = 'published' order by b.library, b.category nulls last, b.position, b.title`); }
  catch { return NextResponse.json([]); }
}
