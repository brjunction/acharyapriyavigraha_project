import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { sql, hasDb } from "@/lib/db";
import { Blocks } from "@/components/cms/blocks-view";
import { Render, docText, headings } from "@/components/cms/doc";
import { PageIcon } from "@/components/page-icon";
import { HideNavOnPage } from "@/components/nav-toggle";
import { Container } from "@/components/ui";
import { ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import type { Block } from "./blocks";

type P = { id: string; parent_id: string | null; path: string; title: string; type: string; blocks: any[]; seo: Record<string, any>; settings: Record<string, any>; updated_at: string; position: number };
const isOld = (bs: any[]) => bs?.length > 0 && "data" in bs[0];
export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://taptajivanam.com";

async function load(segments: string[], drafts = false): Promise<P | null> {
  if (!hasDb()) return null;
  const path = "/" + segments.map(decodeURIComponent).join("/");
  try { return ((await sql`select id, parent_id, path, title, type, blocks, seo, settings, updated_at, position, status from pages where path = ${path} and coalesce(settings->>'studio', 'on') <> 'off' and (status = 'published' or ${drafts})`)[0] as P) || null; } catch { return null; }
}
const plain = (bs: any[]) => (isOld(bs) ? plainOld(bs) : docText(bs));
const plainOld = (bs: Block[]) => bs.filter((b) => b.type === "text").map((b) => String(b.data.html).replace(/<[^>]+>/g, " ")).join(" ").replace(/\s+/g, " ").trim().slice(0, 155);

/** When editors have published their own page at a designed address, show theirs instead. */
export async function cmsOverride(path: string) { const segs = path.split("/").filter(Boolean); return (await load(segs)) ? <CmsPage segments={segs} /> : null; }

export const hasCms = async (segments: string[]) => Boolean(await load(segments));

export async function cmsMetadata(segments: string[]): Promise<Metadata> {
  const p = await load(segments); if (!p) return {};
  const title = p.seo?.title || p.title, description = p.seo?.description || plain(p.blocks);
  const img = p.seo?.image || p.settings?.cover || (p.blocks.find((b: any) => b.type === "image" && (b.props?.url || b.data?.src)) as any)?.props?.url;
  return { title, description, alternates: { canonical: p.path }, robots: p.seo?.noindex ? { index: false } : undefined,
    openGraph: { title, description, type: "article", url: p.path, images: img ? [img] : undefined }, twitter: { card: img ? "summary_large_image" : "summary" } };
}

/** Any editor page at any depth. Unpublished pages open as a preview for signed-in editors only. */
export async function NestedPage({ segments, fallback }: { segments: string[]; fallback?: () => Promise<React.ReactNode> }) {
  if (await load(segments)) return <CmsPage segments={segments} />;
  if (fallback) { const f = await fallback(); if (f) return f; }
  const { getUser } = await import("@/lib/auth");
  if ((await getUser()) && (await load(segments, true))) return <CmsPage segments={segments} preview />;
  notFound();
}

export async function CmsPage({ segments, preview = false }: { segments: string[]; preview?: boolean }) {
  const p = await load(segments, preview); if (!p) notFound();
  if (p.settings?.redirect && /^(https?:\/\/|\/)/.test(p.settings.redirect)) redirect(p.settings.redirect);
  const isBook = p.type === "book" || p.type === "chapter";
  // crumbs: ancestors by path prefix
  const prefixes = segments.slice(0, -1).map((_, i) => "/" + segments.slice(0, i + 1).join("/"));
  const anc = prefixes.length ? await sql`select path, title from pages where path = any(${prefixes}) and status='published' order by length(path)` : [];
  let tree: { id: string; parent_id: string | null; path: string; title: string; position: number }[] = [], kids: any[] = [];
  if (isBook) {
    const rootPath = await bookRoot(p);
    tree = (await sql`select id, parent_id, path, title, position from pages where (path = ${rootPath} or path like ${rootPath + "/%"}) and status='published' order by path`) as any;
  }
  kids = (await sql`select id, title, path, settings from pages where parent_id = ${p.id} and status='published' order by position, title`) as any[];
  const linkedIds = new Set(JSON.stringify(p.blocks).match(/"pageId":"[0-9a-f-]{36}"/g)?.map((x) => x.slice(10, -1)) || []);
  const unlinked = kids.filter((k: any) => !linkedIds.has(k.id));
  const flat = isBook ? flatten(tree, tree.find((t) => !t.parent_id || !tree.some((x) => x.id === t.parent_id))?.id || p.id) : [];
  const i = flat.findIndex((x) => x.id === p.id), prev = flat[i - 1], next = flat[i + 1];
  const ld = { "@context": "https://schema.org", "@type": p.type === "book" ? "Book" : "Article", headline: p.title, name: p.title, description: p.seo?.description || plain(p.blocks), dateModified: p.updated_at, mainEntityOfPage: SITE + p.path, inLanguage: "en", publisher: { "@type": "Organization", name: "Taptajivanam", url: SITE } };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [...anc, { path: p.path, title: p.title }].map((a: any, n) => ({ "@type": "ListItem", position: n + 1, name: a.title, item: SITE + a.path })) };
  return (
    <div className="relative isolate" style={{ background: bgOf(p.settings?.bg) }}>
    {p.settings?.bgImage && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.settings.bgImage} alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover" style={{ opacity: (p.settings.bgOpacity ?? 12) / 100 }} />}
    {p.settings?.titleStyle === "banner" && p.settings?.cover && <div className="relative h-[260px] overflow-hidden sm:h-[340px]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.settings.cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: `center ${p.settings.coverY ?? 50}%` }} /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" /><Container className="absolute inset-x-0 bottom-0 pb-8"><h1 className="text-[31.5px] font-bold leading-[1.1] tracking-[-0.03em] !text-white sm:text-[42.5px]">{p.title}</h1></Container></div>}
    {p.settings?.hideNav && <HideNavOnPage />}
    {p.settings?.bg && <style dangerouslySetInnerHTML={{ __html: `body{background:${bgOf(p.settings.bg)}}` }} />}
    {preview && (p as any).status !== "published" && <div className="bg-amber-100 py-2 text-center text-[12.5px] text-amber-900">Preview: this page is not published yet. Only signed-in editors can see it.</div>}
    <Container className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, crumbs]) }} />
      {anc.length > 0 && <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-[12.5px] text-ink-3">{anc.map((a: any) => <span key={a.path} className="flex items-center gap-1"><Link href={a.path} className="hover:text-saffron">{a.title}</Link><ChevronRight size={13} /></span>)}<span className="text-ink-2">{p.title}</span></nav>}
      <div className={isBook ? "grid gap-10 lg:grid-cols-[270px_1fr]" : ""}>
        {isBook && <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto"><p className="mb-3 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-saffron"><BookOpen size={14} />Contents</p><Tree nodes={tree} cur={p.path} /></aside>}
        <article className={isBook ? "min-w-0 max-w-[760px]" : `mx-auto ${({ narrow: "max-w-[680px]", wide: "max-w-[1040px]", full: "max-w-none" } as Record<string, string>)[p.settings?.width] || "max-w-[820px]"}`}>
          {p.settings?.cover && p.settings?.titleStyle !== "banner" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.settings.cover} alt="" className="mb-8 h-[200px] w-full rounded-3xl object-cover sm:h-[280px]" style={{ objectPosition: `center ${p.settings.coverY ?? 50}%` }} />}
          {p.settings?.hideTitle !== true && p.settings?.titleStyle !== "banner" && !isOld(p.blocks) && <div className={`mb-8 ${p.settings?.titleStyle === "center" || p.settings?.titleStyle === "ornate" ? "text-center" : ""}`}>{p.settings?.titleStyle === "ornate" && <p aria-hidden className="mb-2 text-[18.5px] tracking-[0.4em] text-[#c98a2b]">❀ ✦ ❀</p>}<h1 className="text-[29.5px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[38.5px]">{p.settings?.icon && <PageIcon icon={p.settings.icon} size={40} className="mr-3" />}{p.title}</h1>{p.settings?.titleStyle === "ornate" && <span aria-hidden className="mx-auto mt-4 block h-[3px] w-20 rounded-full bg-gradient-to-r from-transparent via-saffron to-transparent" />}</div>}
          {isOld(p.blocks) ? <Blocks blocks={p.blocks} /> : <Render doc={p.blocks} ctx={{ pageId: p.id, path: p.path }} toc={<Toc items={isBook && p.type === "book" ? kids.map((k: any) => ({ text: k.title, href: k.path, level: 2 })) : headings(p.blocks).map((h) => ({ text: h.text, href: `#${h.id}`, level: h.level }))} />} />}
          {unlinked.length > 0 && (p.type === "collection" || p.type === "page") && <ul className="mt-10 grid gap-3 sm:grid-cols-2">{unlinked.map((k) => <li key={k.path}><Link href={k.path} className="card block p-4 font-semibold transition hover:-translate-y-0.5 hover:text-saffron">{k.title}</Link></li>)}</ul>}
          {isBook && (prev || next) && <nav className="mt-12 flex justify-between gap-3 border-t border-line pt-6">{prev ? <Link href={prev.path} className="flex items-center gap-1.5 text-[13.5px] font-medium hover:text-saffron"><ChevronLeft size={16} />{prev.title}</Link> : <span />}{next && <Link href={next.path} className="flex items-center gap-1.5 text-right text-[13.5px] font-medium hover:text-saffron">{next.title}<ChevronRight size={16} /></Link>}</nav>}
        </article>
      </div>
    </Container>
    </div>
  );
}

const BG: Record<string, string> = { cream: "#fdf8ef", saffron: "#fdf1e2", tulasi: "#f1f7ef", lotus: "#fbf0f2", sky: "#f0f5fc", gold: "#fbf3dc", lilac: "#f5f0fa", stone: "#f3f1ee" };
const bgOf = (v?: string) => (!v ? undefined : v.startsWith("#") ? v : BG[v]);

async function bookRoot(p: P): Promise<string> {
  let cur = p;
  while (cur.parent_id) {
    const r = (await sql`select id, parent_id, path, title, type, blocks, seo, settings, updated_at, position from pages where id = ${cur.parent_id}`)[0] as P | undefined;
    if (!r || (r.type !== "book" && r.type !== "chapter")) break; cur = r;
  }
  return cur.path;
}
function flatten(nodes: { id: string; parent_id: string | null; path: string; title: string; position: number }[], rootId: string) {
  const out: typeof nodes = []; const by = (id: string) => nodes.filter((n) => n.parent_id === id).sort((a, b) => a.position - b.position);
  const walk = (id: string) => { const n = nodes.find((x) => x.id === id); if (n) out.push(n); by(id).forEach((c) => walk(c.id)); }; walk(rootId); return out;
}
function Tree({ nodes, cur }: { nodes: { id: string; parent_id: string | null; path: string; title: string; position: number }[]; cur: string }) {
  const root = nodes.find((t) => !t.parent_id || !nodes.some((x) => x.id === t.parent_id)); if (!root) return null;
  const list = (id: string, d: number): React.ReactNode => { const kids = nodes.filter((n) => n.parent_id === id).sort((a, b) => a.position - b.position); return kids.length ? <ul className={d ? "ml-3 border-l border-line pl-3" : ""}>{kids.map((k) => <li key={k.id}><Link href={k.path} className={`block rounded-lg px-2 py-1.5 text-[13px] leading-snug ${k.path === cur ? "bg-saffron-soft font-semibold text-saffron" : "text-ink-2 hover:bg-band"}`}>{k.title}</Link>{list(k.id, d + 1)}</li>)}</ul> : null; };
  return <div><Link href={root.path} className={`mb-1 block rounded-lg px-2 py-1.5 text-[14px] font-bold ${root.path === cur ? "text-saffron" : ""}`}>{root.title}</Link>{list(root.id, 0)}</div>;
}

function Toc({ items }: { items: { text: string; href: string; level: number }[] }) {
  if (!items.length) return null;
  return <nav aria-label="Contents" className="my-6 rounded-2xl border border-line bg-[#fdfaf4] p-5"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-saffron">Contents</p><ol className="space-y-1">{items.map((i) => <li key={i.href} style={{ paddingLeft: (i.level - 1) * 14 }}><Link href={i.href} className="text-[14px] text-ink-2 hover:text-saffron">{i.text}</Link></li>)}</ol></nav>;
}
