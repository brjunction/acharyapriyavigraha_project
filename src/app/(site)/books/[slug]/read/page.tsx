import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, hrefOf, numbering } from "@/lib/content/books-public";
import { Render, docText } from "@/components/cms/doc";
import { sql } from "@/lib/db";
import { PathaReader } from "@/components/books/patha";

export const revalidate = 300;
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const r = await getBook((await params).slug); if (!r) return {};
  return { title: `${r.book.title} · Pāṭha`, description: r.book.description, alternates: { canonical: `/books/${r.book.slug}` }, robots: { index: false } };
}

/** Pāṭha: the whole book as one, laid out in pages (the chapter pages stay the indexed, linkable copy). */
export default async function Read({ params }: P) {
  const { slug } = await params; const r = await getBook(slug); if (!r) notFound();
  const { book, nodes, flat } = r; const num = numbering(nodes);
  const ids = flat.map((n) => n.id);
  const rows = ids.length ? ((await sql`select id, blocks from book_nodes where id = any(${ids}::uuid[])`) as { id: string; blocks: any[] }[]) : [];
  const by = new Map(rows.map((x) => [x.id, x.blocks || []]));
  const depth = (n: (typeof flat)[number]) => { let d = 0, p = n.parent_id; while (p) { d++; p = nodes.find((x) => x.id === p)?.parent_id ?? null; } return d; };
  const chapters = flat.map((n) => ({ id: n.id, title: n.title, num: num[n.id] || "", depth: depth(n), href: hrefOf(slug, nodes, n), words: docText(by.get(n.id) || [], 1e9).split(/\s+/).filter(Boolean).length }));
  return (
    <PathaReader book={{ slug, title: book.title, author: book.author, cover: book.cover_url, language: book.language }} chapters={chapters}>
      {flat.map((n, i) => (
        <section key={n.id} data-ch={i} id={`c-${n.id}`} lang={book.language} className="pr-sec">
          <h2 className="pr-ch">{num[n.id] && <span className="pr-num">{num[n.id]}</span>}{n.title}</h2>
          <div className="book-body"><Render doc={by.get(n.id) || []} /></div>
          <i className="pr-end" aria-hidden />
        </section>))}
    </PathaReader>);
}
