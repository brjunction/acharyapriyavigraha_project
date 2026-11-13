import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, hrefOf, numbering, hostOf, isLabel, pagesOf, insideOf } from "@/lib/content/books-public";
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
  const words = (n: (typeof flat)[number]) => docText(by.get(n.id) || [], 1e9).split(/\s+/).filter(Boolean).length;
  // pages: chapters with their own page; sections shown inside a page flow on with it; empty sections are labels in the contents
  const pages = pagesOf(nodes, flat); const at = new Map(pages.map((p, i) => [p.id, i]));
  const chapters = pages.map((n) => ({ id: n.id, title: n.title, num: num[n.id] || "", depth: depth(n), href: hrefOf(slug, nodes, n), words: words(n) + insideOf(nodes, flat, n).reduce((a, x) => a + words(x), 0) }));
  const toc = flat.map((n) => { const h = hostOf(nodes, n); const label = isLabel(nodes, n);
    return { key: n.id, title: n.title, num: num[n.id] || "", depth: depth(n), ch: label ? -1 : at.get(h.id) ?? -1, ...(h.id !== n.id ? { anchor: `s-${n.slug}` } : {}), ...(label ? { label: true } : {}), words: h.id === n.id ? chapters[at.get(n.id) ?? -1]?.words : 0 }; });
  return (
    <PathaReader book={{ slug, title: book.title, author: book.author, cover: book.cover_url, language: book.language }} chapters={chapters} toc={toc}>
      {pages.map((n, i) => (
        <section key={n.id} data-ch={i} id={`c-${n.id}`} lang={book.language} className="pr-sec">
          <h2 className="pr-ch">{num[n.id] && <span className="pr-num">{num[n.id]}</span>}{n.title}</h2>
          <div className="book-body"><Render doc={by.get(n.id) || []} />
            {insideOf(nodes, flat, n).map((d) => <section key={d.id} id={`s-${d.slug}`}><h3>{num[d.id] ? <span className="mr-2 opacity-60">{num[d.id]}</span> : null}{d.title}</h3><Render doc={by.get(d.id) || []} /></section>)}</div>
          <i className="pr-end" aria-hidden />
        </section>))}
    </PathaReader>);
}
