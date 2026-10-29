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
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto"><p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">Contents</p><nav>{flat.map((n) => <a key={n.id} href={`#${n.slug}`} className="block rounded-lg px-2 py-1.5 text-[14px] text-ink-2 hover:bg-band" style={{ paddingLeft: 8 + (num[n.id].split(".").length - 1) * 12 }}>{n.title}</a>)}</nav></aside>
        <article className="max-w-[780px]"><h1 className="text-[34px] font-bold tracking-[-0.03em] sm:text-[44px]">{book.title}</h1>{book.subtitle && <p className="mt-2 text-[18px] text-ink-2">{book.subtitle}</p>}
          {flat.map((n) => <section key={n.id} id={n.slug} className="scroll-mt-24 border-t border-line pt-10 mt-10"><h2 className="text-[26px] font-bold">{n.title}</h2><Render doc={by[n.id]?.blocks || []} /></section>)}</article>
      </Container>
    );
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="border-b border-line bg-[#fbf6ec]">
        <Container className="grid items-center gap-10 py-12 md:grid-cols-[260px_minmax(0,1fr)]">
          <Cover book={book} className="mx-auto w-[220px] md:w-full" />
          <div>
            <Crumbs items={[{ href: "/teachings", label: "His Teachings" }, { href: "/teachings/books", label: "Books" }, { label: book.title }]} />
            <h1 className="mt-4 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[44px]">{book.title}</h1>
            {book.subtitle && <p className="mt-2 text-[18px] text-ink-2">{book.subtitle}</p>}
            <p className="mt-3 text-[14px] text-ink-3">{[book.author, book.publisher, book.year].filter(Boolean).join(" · ")}</p>
            {book.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{book.description}</p>}
            {first && <Link href={hrefOf(slug, nodes, first)} className="mt-6 inline-flex h-11 items-center rounded-full bg-saffron px-6 text-[15px] font-medium text-white">Start reading</Link>}
          </div>
        </Container>
      </section>
      <Container className="max-w-[900px] py-12">
        <h2 className="mb-5 text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-saffron">Contents</h2>
        {book.layout === "cards" ? <div className="grid gap-4 sm:grid-cols-2">{flat.filter((n) => !n.parent_id).map((n) => <Link key={n.id} href={hrefOf(slug, nodes, n)} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fdf6e8] font-bold text-saffron ring-1 ring-[#e3cf9f]">{num[n.id]}</span><span className="text-[16px] font-semibold group-hover:text-saffron">{n.title}</span></Link>)}</div>
          : <div className={`rounded-3xl border border-[#e3cf9f] bg-[#fdfaf3] p-6 sm:p-10 ${book.layout === "scripture" ? "text-center" : ""}`}><BookToc book={book} nodes={nodes} /></div>}
      </Container>
    </>
  );
}
