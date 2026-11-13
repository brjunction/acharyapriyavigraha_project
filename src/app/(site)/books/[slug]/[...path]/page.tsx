import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBook, findByPath, numbering, hrefOf, getTranslations, tocOf, hostOf, isLabel, pagesOf, insideOf } from "@/lib/content/books-public";
import { Reader } from "@/components/books/reader";
import { Render, docText } from "@/components/cms/doc";
import { sql } from "@/lib/db";
import { langName, langNative } from "@/lib/content/book-langs";

export const revalidate = 300;
const READER_FONTS = "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Noto+Serif:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Devanagari:wght@400;600&family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap";
async function load(slug: string, path: string[]) {
  const r = await getBook(slug); if (!r) return null; const n = findByPath(r.nodes, path); if (!n) return null;
  const full = (await sql`select blocks from book_nodes where id = ${n.id}`)[0] as any;
  return { ...r, node: n, blocks: (full?.blocks || []) as any[] };
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string; path: string[] }> }): Promise<Metadata> {
  const { slug, path } = await params; const r = await load(slug, path); if (!r) return {};
  return { title: `${r.node.title} — ${r.book.title}`, description: docText(r.blocks) || r.book.description, alternates: { canonical: hrefOf(slug, r.nodes, r.node) } };
}
export default async function Chapter({ params, searchParams }: { params: Promise<{ slug: string; path: string[] }>; searchParams: Promise<{ with?: string }> }) {
  const { slug, path } = await params; const { with: other } = await searchParams; const r = await load(slug, path); if (!r) notFound();
  const { book, nodes, flat, node, blocks } = r; const num = numbering(nodes);
  // a section shown inside another page, or a label with no text: go to where it is read
  if (hostOf(nodes, node).id !== node.id || isLabel(nodes, node)) { const to = hrefOf(slug, nodes, node); if (to !== `/books/${slug}/${path.join("/")}`) redirect(to); }
  const i = flat.findIndex((n) => n.id === node.id); const pages = pagesOf(nodes, flat); const pi = pages.findIndex((n) => n.id === node.id); const prev = pages[pi - 1], next = pages[pi + 1];
  const inside = insideOf(nodes, flat, node);
  const more = inside.length ? new Map(((await sql`select id, blocks from book_nodes where id = any(${inside.map((n) => n.id)}::uuid[])`) as { id: string; blocks: any[] }[]).map((x) => [x.id, x.blocks || []])) : new Map<string, any[]>();
  const depthOf = (n: (typeof flat)[number]) => { let d = 0, c = n; while (c.parent_id && c.parent_id !== node.id) { d++; c = nodes.find((x) => x.id === c.parent_id)!; if (!c) break; } return d; };
  const trs = await getTranslations(book);
  const translations = await Promise.all(trs.map(async (t) => {
    if (t.slug === slug) return { slug: t.slug, title: t.title, language: langName(t.language), native: langNative(t.language), href: hrefOf(slug, nodes, node), current: true };
    const o = await getBook(t.slug); const on = o?.flat[i];
    return { slug: t.slug, title: t.title, language: langName(t.language), native: langNative(t.language), href: o && on ? hrefOf(t.slug, o.nodes, on) : `/books/${t.slug}`, current: false };
  }));
  let parallel = null;
  if (other && trs.some((t) => t.slug === other) && other !== slug) {
    const o = await getBook(other); const on = o?.flat[i];
    if (o && on) { const ob = ((await sql`select blocks from book_nodes where id = ${on.id}`)[0] as any)?.blocks || []; parallel = { title: on.title, slug: other, language: langName(o.book.language), native: langNative(o.book.language), node: <div className="book-body"><Render doc={ob} /></div> }; }
  }
  return (
    <>
      <link rel="stylesheet" href={READER_FONTS} precedence="default" />
      <Reader
        book={{ slug, title: book.title, href: `/books/${slug}`, language: book.language, cover: book.cover_url }}
        chapter={{ id: node.id, title: node.title, num: num[node.id], label: node.kind === "part" ? "Part" : "Chapter", href: hrefOf(slug, nodes, node), index: Math.max(0, pi), total: pages.length }}
        toc={tocOf(slug, nodes, flat)} prev={prev ? { href: hrefOf(slug, nodes, prev), title: prev.title } : null} next={next ? { href: hrefOf(slug, nodes, next), title: next.title } : null}
        translations={translations} parallel={parallel} home={{ href: "/teachings/books", label: "All books" }}
      >
        <div className="book-body" lang={book.language}><Render doc={blocks} />
          {inside.map((d) => { const H = depthOf(d) ? "h3" : "h2"; return <section key={d.id} id={`s-${d.slug}`} className="scroll-mt-24"><H>{num[d.id] ? <span className="mr-2 opacity-60">{num[d.id]}</span> : null}{d.title}</H><Render doc={more.get(d.id) || []} /></section>; })}
        </div>
      </Reader>
    </>
  );
}
