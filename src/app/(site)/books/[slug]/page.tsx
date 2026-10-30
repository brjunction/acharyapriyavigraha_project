import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Crumbs } from "@/components/ui";
import { getBook, hrefOf, numbering } from "@/lib/content/books-public";
import { BookToc, Cover } from "@/components/cms/book-view";
import { Render } from "@/components/cms/doc";
import { sql } from "@/lib/db";
import { SITE } from "@/lib/cms/render";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const r = await getBook(slug); if (!r) return {};
  return { title: r.book.title, description: r.book.description || r.book.subtitle, openGraph: { images: r.book.cover_url ? [r.book.cover_url] : undefined }, alternates: { canonical: `/books/${slug}` } };
}
export default async function BookHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = await getBook(slug); if (!r) notFound();
  const { book, nodes, flat } = r; const first = flat.find((n) => n.kind !== "part"); const num = numbering(nodes);
  const ld = { "@context": "https://schema.org", "@type": "Book", name: book.title, author: book.author ? { "@type": "Person", name: book.author } : undefined, publisher: book.publisher || undefined, datePublished: book.year || undefined, inLanguage: book.language, image: book.cover_url || undefined, url: `${SITE}/books/${slug}`, hasPart: flat.slice(0, 200).map((n) => ({ "@type": "Chapter", name: n.title, url: SITE + hrefOf(slug, nodes, n) })) };
  if (book.layout === "single") {
    const all = await sql`select id, title, blocks from book_nodes where book_id = ${book.id} and status = 'published'`; const by = Object.fromEntries(all.map((x: any) => [x.id, x]));
    return (
      <Container className="grid gap-10 py-12 lg:grid-cols-[280px_minmax(0,1fr)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto"><p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-saffron">Contents</p><nav>{flat.map((n) => <a key={n.id} href={`#${n.slug}`} className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band" style={{ paddingLeft: 8 + (num[n.id].split(".").length - 1) * 12 }}>{n.title}</a>)}</nav></aside>
        <article className="max-w-[780px]"><h1 className="text-[31.5px] font-bold tracking-[-0.03em] sm:text-[40.5px]">{book.title}</h1>{book.subtitle && <p className="mt-2 text-[16.5px] text-ink-2">{book.subtitle}</p>}
          {flat.map((n) => <section key={n.id} id={n.slug} className="scroll-mt-24 border-t border-line pt-10 mt-10"><h2 className="text-[24px] font-bold">{n.title}</h2><Render doc={by[n.id]?.blocks || []} /></section>)}</article>
      </Container>
    );
  }
  const chapters = flat.filter((n) => n.kind !== "part").length;
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-[1000px] px-4 pb-20 pt-6 sm:px-6">
        <Crumbs items={[{ href: "/teachings", label: "His Teachings" }, { href: "/teachings/books", label: "Books" }, { label: book.title }]} />
        <div className="mt-8 grid items-start gap-8 sm:grid-cols-[180px_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)]">
          <Cover book={book} className="mx-auto w-[160px] sm:w-full" />
          <div>
            <h1 className="text-[28px] leading-tight text-ink sm:text-[34px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{book.title}</h1>
            {book.subtitle && <p className="mt-1.5 text-[15px] text-ink-2">{book.subtitle}</p>}
            <p className="mt-3 text-[13px] text-ink-3">{[book.author, book.publisher, book.year, chapters ? `${chapters} chapters` : null].filter(Boolean).join(" · ")}</p>
            {book.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{book.description}</p>}
            <div className="mt-6 flex flex-wrap gap-2">{first ? <Link href={hrefOf(slug, nodes, first)} className="inline-flex h-10 items-center rounded-md bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-ink/90">Start reading</Link> : <span className="text-[13px] text-ink-3">The chapters of this book are being added.</span>}</div>
          </div>
        </div>
        {flat.length > 0 && <section className="mt-14">
          <h2 className="border-b border-line pb-2 text-[15px] font-semibold text-ink">Contents</h2>
          <div className="mt-3">{book.layout === "cards" ? <div className="grid gap-3 sm:grid-cols-2">{flat.filter((n) => !n.parent_id).map((n) => <Link key={n.id} href={hrefOf(slug, nodes, n)} className="group flex items-center gap-4 rounded-xl border border-line p-4 transition hover:border-line-strong"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-band text-[13px] font-medium text-ink-2">{num[n.id]}</span><span className="text-[14.5px] font-medium text-ink group-hover:underline">{n.title}</span></Link>)}</div> : <BookToc book={book} nodes={nodes} />}</div>
        </section>}
      </div>
    </div>
  );
}
