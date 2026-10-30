import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, findByPath, numbering, hrefOf } from "@/lib/content/books-public";
import { ReaderBar } from "@/components/books/reader-bar";
import { BookToc, PrevNext } from "@/components/cms/book-view";
import { Render, docText } from "@/components/cms/doc";
import { sql } from "@/lib/db";

export const revalidate = 300;
async function load(slug: string, path: string[]) {
  const r = await getBook(slug); if (!r) return null; const n = findByPath(r.nodes, path); if (!n) return null;
  const full = (await sql`select blocks from book_nodes where id = ${n.id}`)[0] as any;
  return { ...r, node: n, blocks: (full?.blocks || []) as any[] };
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string; path: string[] }> }): Promise<Metadata> {
  const { slug, path } = await params; const r = await load(slug, path); if (!r) return {};
  return { title: `${r.node.title} — ${r.book.title}`, description: docText(r.blocks) || r.book.description };
}
export default async function Chapter({ params }: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path } = await params; const r = await load(slug, path); if (!r) notFound();
  const { book, nodes, flat, node, blocks } = r; const num = numbering(nodes); const scripture = book.layout === "scripture";
  const kids = nodes.filter((n) => n.parent_id === node.id).sort((a, b) => a.position - b.position);
  const i = flat.findIndex((n) => n.id === node.id); const prev = flat[i - 1], next = flat[i + 1];
  const toc = <BookToc book={book} nodes={nodes} current={node.id} compact />;
  return (
    <div className="bg-white">
      <ReaderBar book={{ title: book.title, href: `/books/${book.slug}` }} chapter={node.title} prev={prev ? { href: hrefOf(book.slug, nodes, prev), title: prev.title } : null} next={next ? { href: hrefOf(book.slug, nodes, next), title: next.title } : null} toc={toc} />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-[130px] max-h-[calc(100dvh-150px)] overflow-y-auto pr-2 [scrollbar-width:thin]"><p className="mb-2 px-2 text-[12px] font-medium text-ink-3">Contents</p>{toc}</div></aside>
        <article className="min-w-0">
          <div id="book-text" className={`mx-auto ${scripture ? "text-center" : ""}`} style={{ maxWidth: 680, fontSize: 18, lineHeight: 1.8, fontFamily: "var(--font-reading-serif)" }}>
            <p className="font-sans text-[12.5px] text-ink-3">{node.kind === "part" ? "Part" : "Chapter"} {num[node.id]}</p>
            <h1 className="mt-1 font-sans text-[26px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[30px]">{node.title}</h1>
            <div className={`book-body mt-8 ${scripture ? "text-left" : ""}`}><Render doc={blocks} /></div>
            {kids.length > 0 && <div className="mt-10 rounded-xl border border-line p-5 font-sans text-left"><p className="mb-2 text-[12px] font-medium text-ink-3">In this {node.kind === "part" ? "part" : "chapter"}</p><BookToc book={book} nodes={nodes.filter((n) => n.id !== node.id)} compact /></div>}
            <div className="font-sans"><PrevNext book={book} nodes={nodes} flat={flat} current={node.id} /></div>
          </div>
        </article>
      </div>
    </div>
  );
}
