import { Suspense } from "react";
import { sql, hasDb } from "@/lib/db";
import { BookLibrary, type LibBook, type Shelf } from "@/components/books/library";

/** The public library of books. Returns null when no book is published yet. */
export async function BooksShelf() {
  if (!hasDb()) return null;
  let books: LibBook[] = []; let shelves: Shelf[] = [];
  try { books = (await sql`select b.slug, b.title, b.subtitle, b.author, b.category, b.cover_url, b.language, b.description, b.work, b.settings->>'size' as size, (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published' and n.parent_id is null) as chapters from books b where b.status = 'published' order by b.category nulls last, b.position, b.title`) as LibBook[]; } catch {}
  try { shelves = ((await sql`select name, extra from vocab where kind = 'shelf' order by (extra->>'position')::int nulls last, name`) as any[]).map((r) => ({ name: r.name, color: r.extra?.color || null, description: r.extra?.description || null, size: r.extra?.size || null })); } catch {}
  if (!books.length) return null;
  return <Suspense><BookLibrary books={books} shelves={shelves} /></Suspense>;
}
