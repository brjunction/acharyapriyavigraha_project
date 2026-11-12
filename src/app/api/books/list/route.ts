import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export const revalidate = 300;
/** Every published book, for the reader's "Books" list: title, cover, shelf, language, library. */
export async function GET() {
  if (!hasDb()) return NextResponse.json([]);
  try { return NextResponse.json(await sql`select slug, title, cover_url as cover, coalesce(category, case when library = 'gaudiya' then coalesce(author, 'Gauḍīya library') else 'Books' end) as shelf, language, library from books where status = 'published' order by library, category nulls last, position, title`); }
  catch { return NextResponse.json([]); }
}
