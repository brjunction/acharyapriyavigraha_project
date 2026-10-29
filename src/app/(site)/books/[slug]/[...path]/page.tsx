import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { getBook, findByPath, numbering } from "@/lib/content/books-public";
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
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <Link href={`/books/${book.slug}`} className="mb-4 flex items-center gap-3 rounded-xl p-2 hover:bg-band"><span className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[2px_6px_6px_2px] bg-[#6b2a00] text-[14.5px]">{book.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover_url} alt="" className="h-full w-full object-cover" /> : book.icon || "📖"}</span><span className="text-[13.5px] font-bold leading-snug">{book.title}</span></Link>
        <BookToc book={book} nodes={nodes} current={node.id} compact />
      </aside>
      <article className={`min-w-0 ${scripture ? "mx-auto max-w-[720px] text-center" : "max-w-[760px]"}`}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-saffron">{node.kind === "part" ? "Part" : "Chapter"} {num[node.id]}</p>
        <h1 className={`mt-1 font-bold tracking-[-0.03em] ${scripture ? "text-[27.5px] sm:text-[35px]" : "text-[27.5px] sm:text-[35px]"}`}>{node.title}</h1>
        {scripture && <p aria-hidden className="my-5 text-[16.5px] tracking-[0.4em] text-[#c98a2b]">❀ ✦ ❀</p>}
        <div className={`reading mt-6 ${scripture ? "text-left" : ""}`}><Render doc={blocks} /></div>
        {kids.length > 0 && <div className="mt-10 rounded-2xl border border-[#e3cf9f] bg-[#fdfaf3] p-5 text-left"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-saffron">In this {node.kind === "part" ? "part" : "chapter"}</p><BookToc book={book} nodes={nodes.filter((n) => n.id !== node.id)} compact /></div>}
        <PrevNext book={book} nodes={nodes} flat={flat} current={node.id} />
      </article>
    </Container>
  );
}
