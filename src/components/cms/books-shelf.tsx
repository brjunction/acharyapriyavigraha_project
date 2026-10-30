import { sql, hasDb } from "@/lib/db";
import { BookLibrary, type LibBook } from "@/components/books/library";

/** The public library of books. Returns null when no book is published yet. */
export async function BooksShelf() {
  if (!hasDb()) return null;
  let books: LibBook[] = [];
  try { books = (await sql`select b.slug, b.title, b.subtitle, b.author, b.category, b.cover_url, b.language, b.description, (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published') as chapters from books b where b.status = 'published' order by b.category nulls last, b.position, b.title`) as LibBook[]; } catch {}
  if (!books.length) return null;
  return <BookLibrary books={books} />;
}
