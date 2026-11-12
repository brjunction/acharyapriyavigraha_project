import { getAcharyas, getGaudiyaBooks, booksOf, SECTIONS } from "@/lib/gaudiya/data";
import { People } from "@/components/gaudiya/people";

export const revalidate = 300;
export const metadata = { title: "Ācāryas · Gauḍīya Library", description: "Every ācārya of the Gauḍīya library, with his books and biography." };

export default async function Page() {
  const [all, books] = await Promise.all([getAcharyas(), getGaudiyaBooks()]);
  const ps = all.map((a) => ({ ...a, books: booksOf(books, a).length }));
  const withBooks = ps.filter((p) => p.books).sort((a, b) => b.books - a.books);
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-[28px] font-semibold tracking-tight text-ink">Ācāryas</h1>
      <p className="mb-8 mt-1 text-[14px] text-ink-2">Open an ācārya to see his books and read his life.</p>
      <People empty="The ācāryas are being added." groups={[["With books in the library", withBooks], ...(Object.keys(SECTIONS).map((k) => [SECTIONS[k], ps.filter((p) => p.section === k && !p.books)]) as [string, typeof ps][])]} />
    </div>);
}
