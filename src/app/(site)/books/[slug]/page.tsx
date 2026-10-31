import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Languages } from "lucide-react";
import { getBook, hrefOf, numbering, getTranslations } from "@/lib/content/books-public";
import { Cover } from "@/components/cms/book-view";
import { BookActions } from "@/components/books/book-actions";
import { SITE } from "@/lib/cms/render";
import { langName, langNative } from "@/lib/content/book-langs";
import type { Node } from "@/lib/content/books";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const r = await getBook(slug); if (!r) return {};
  return { title: r.book.title, description: r.book.description || r.book.subtitle, openGraph: { images: r.book.cover_url ? [r.book.cover_url] : undefined }, alternates: { canonical: `/books/${slug}` } };
}

/** A book's first page: cover, about, languages, how to read, and the contents. No chapter text here. */
export default async function BookHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = await getBook(slug); if (!r) notFound();
  const { book, nodes, flat } = r; const num = numbering(nodes); const trs = await getTranslations(book);
  const top = nodes.filter((n) => !n.parent_id).sort((a, b) => a.position - b.position);
  const kids = (id: string) => nodes.filter((n) => n.parent_id === id).sort((a, b) => a.position - b.position);
  const subs = flat.length - top.length;
  const ld = { "@context": "https://schema.org", "@type": "Book", name: book.title, author: book.author ? { "@type": "Person", name: book.author } : undefined, publisher: book.publisher || undefined, datePublished: book.year || undefined, inLanguage: book.language, image: book.cover_url || undefined, url: `${SITE}/books/${slug}`, workTranslation: trs.filter((t) => t.slug !== slug).map((t) => ({ "@type": "Book", name: t.title, inLanguage: t.language, url: `${SITE}/books/${t.slug}` })), hasPart: flat.slice(0, 200).map((n) => ({ "@type": "Chapter", name: n.title, url: SITE + hrefOf(slug, nodes, n) })) };
  const row = (n: Node, d: number): React.ReactNode => { const k = kids(n.id); const link = <Link href={hrefOf(slug, nodes, n)} className="group flex items-baseline gap-3 py-2.5 pr-2"><span className="w-8 shrink-0 text-right text-[12px] tabular-nums text-ink-3">{num[n.id]}</span><span className={`min-w-0 flex-1 group-hover:underline ${d ? "text-[13.5px] text-ink-2" : "text-[14.5px] font-medium text-ink"}`}>{n.title}</span>{k.length > 0 && <span className="shrink-0 text-[11.5px] text-ink-3">{k.length} sections</span>}</Link>;
    return k.length ? <details key={n.id} className="group/d border-b border-line last:border-0 [&_summary::-webkit-details-marker]:hidden"><summary className="flex cursor-pointer list-none items-center"><ChevronRight size={14} className="ml-1 shrink-0 text-ink-3 transition group-open/d:rotate-90" /><div className="min-w-0 flex-1">{link}</div></summary><div className="mb-2 ml-[42px] border-l border-line pl-1">{k.map((c) => <div key={c.id}>{row(c, d + 1)}</div>)}</div></details>
      : <div key={n.id} className={d ? "" : "border-b border-line pl-5 last:border-0"}>{link}</div>; };
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-[1080px] px-4 pb-24 pt-5 sm:px-6">
        <nav className="flex items-center gap-1 text-[12px] text-ink-3"><Link href="/teachings" className="hover:text-ink">His Teachings</Link><ChevronRight size={12} /><Link href="/teachings/books" className="hover:text-ink">Books</Link>{book.category && <><ChevronRight size={12} /><Link href={`/teachings/books?shelf=${encodeURIComponent(book.category)}`} className="hover:text-ink">{book.category}</Link></>}</nav>
        <div className="mt-8 grid items-start gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="mx-auto w-[170px] md:sticky md:top-24 md:w-full"><Cover book={book} /></div>
          <div className="min-w-0">
            <h1 className="text-[28px] leading-[1.15] text-ink sm:text-[34px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{book.title}</h1>
            {book.subtitle && <p className="mt-2 text-[15px] text-ink-2">{book.subtitle}</p>}
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-3.5 text-[12.5px]">
              {book.author && <div><dt className="text-ink-3">Author</dt><dd className="mt-0.5 text-ink">{book.author}</dd></div>}
              <div><dt className="text-ink-3">Language</dt><dd className="mt-0.5 text-ink">{langNative(book.language)}{langNative(book.language) !== langName(book.language) && <span className="text-ink-3"> · {langName(book.language)}</span>}</dd></div>
              <div><dt className="text-ink-3">Contents</dt><dd className="mt-0.5 text-ink">{top.length} chapters{subs > 0 ? `, ${subs} sections` : ""}</dd></div>
              {book.publisher && <div><dt className="text-ink-3">Publisher</dt><dd className="mt-0.5 text-ink">{book.publisher}</dd></div>}
              {book.year && <div><dt className="text-ink-3">Year</dt><dd className="mt-0.5 text-ink">{book.year}</dd></div>}
            </dl>
            {trs.length > 1 && <div className="mt-4 flex flex-wrap items-center gap-1.5"><span className="mr-1 flex items-center gap-1.5 text-[12px] text-ink-3"><Languages size={14} />Also in</span>{trs.map((t) => <Link key={t.slug} href={`/books/${t.slug}`} className={`rounded-md border px-2.5 py-1 text-[12.5px] ${t.slug === slug ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:bg-band"}`}>{langNative(t.language)}</Link>)}</div>}
            {book.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-[14.5px] leading-[1.75] text-ink-2">{book.description}</p>}
            <div className="mt-7"><BookActions slug={slug} first={flat[0] ? hrefOf(slug, nodes, flat[0]) : null} canParallel={trs.length > 1} /></div>

            {top.length > 0 && <section className="mt-12">
              <div className="flex items-baseline justify-between border-b border-line pb-2"><h2 className="text-[15px] font-semibold text-ink">Contents</h2><span className="text-[12px] text-ink-3">{flat.length} parts in all</span></div>
              <div>{top.map((n) => row(n, 0))}</div>
            </section>}
          </div>
        </div>
      </div>
    </div>
  );
}
