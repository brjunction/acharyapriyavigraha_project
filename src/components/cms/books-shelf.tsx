import Link from "next/link";
import { BookOpen } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
import { PageHero } from "@/components/ui";
import { Cover } from "./book-view";

/** The public bookshelf, grouped by shelf. Returns null when no book is published yet. */
export async function BooksShelf() {
  if (!hasDb()) return null;
  let books: any[] = [];
  try { books = await sql`select b.slug, b.title, b.subtitle, b.author, b.category, b.cover_url, b.icon, (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published') as chapters from books b where b.status = 'published' order by b.category nulls last, b.position, b.title`; } catch {}
  if (!books.length) return null;
  const shelves = Array.from(new Set(books.map((b) => b.category || "Books")));
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Books" }]} icon={BookOpen} title="Books" intro="Read the books online, chapter by chapter." />
      <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
        {shelves.map((s) => (
          <section key={s} className="mb-14">
            <h2 className="mb-6 flex items-center gap-3 text-[18.5px] font-bold tracking-[-0.02em]"><span className="h-px w-8 bg-saffron/50" />{s}</h2>
            <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-5">{books.filter((b) => (b.category || "Books") === s).map((b) => (
              <Link key={b.slug} href={`/books/${b.slug}`} className="group"><Cover book={b} className="transition group-hover:-translate-y-1" /><p className="mt-3 font-semibold leading-snug group-hover:text-saffron">{b.title}</p><p className="text-[12.5px] text-ink-3">{b.chapters} chapters</p></Link>))}</div>
            <div aria-hidden className="mt-4 h-3 rounded-b-xl bg-gradient-to-b from-[#d9c2a0] to-[#c4a57a] shadow-[0_10px_18px_-10px_rgba(60,30,10,.6)]" />
          </section>))}
      </div>
    </>
  );
}
