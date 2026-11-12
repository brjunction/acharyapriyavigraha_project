import { Suspense } from "react";
import { BookLibrary, type LibBook } from "@/components/books/library";
import { getAcharyas, getGaudiyaBooks, bookOf } from "@/lib/gaudiya/data";

export const revalidate = 300;
export const metadata = { title: "Books · Gauḍīya Library", description: "Books of the Gauḍīya Vaiṣṇava ācāryas to read online, by ācārya and language." };

/** Every Gauḍīya book, on shelves by ācārya. */
export default async function Page() {
  const [books, acharyas] = await Promise.all([getGaudiyaBooks(), getAcharyas()]);
  const lib: LibBook[] = books.map((b) => ({ ...b, category: acharyas.find((a) => bookOf(b, a))?.title || b.category || b.author || "Other books" }));
  return <Suspense><BookLibrary books={lib} shelves={[]} title="Books of the ācāryas" intro="Read online, chapter by chapter. Shelves are by ācārya." shelfWord="All ācāryas" /></Suspense>;
}
