import "server-only";
import { getAcharyas, getGaudiyaBooks, bookOf } from "./data";
import type { LBook, LAcharya } from "@/components/gaudiya/library";
/** The books of one kind (or all), each with the ācārya it belongs to. */
export async function shelfData(kind?: string): Promise<{ books: LBook[]; acharyas: LAcharya[] }> {
  const [all, as] = await Promise.all([getGaudiyaBooks(), getAcharyas()]);
  const books = all.filter((b) => !kind || (b.kind || "book") === kind).map((b) => ({ slug: b.slug, title: b.title, cover: b.cover_url, language: b.language, kind: b.kind || "book", words: b.words, acharya: as.find((a) => bookOf(b, a))?.slug || null }));
  return { books, acharyas: as.map((a) => ({ slug: a.slug, title: a.title, cover: a.cover })) };
}
