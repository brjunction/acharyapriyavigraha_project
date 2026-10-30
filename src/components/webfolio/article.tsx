import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Render } from "@/components/cms/doc";
import { OnThisPage, CopyPage } from "./parts";

export type Crumb = { href?: string; label: string };
export type Nb = { title: string; href: string } | null;
/** The page frame of every WebFolio page: breadcrumb, title, copy, the content, previous/next, and the contents on the right. */
export function FolioArticle({ crumbs, title, sub, intro, children, prev, next, source }: { crumbs: Crumb[]; title: string; sub?: string; intro?: string; children: React.ReactNode; prev?: Nb; next?: Nb; source?: string }) {
  return (
    <div className="flex gap-10 px-5 py-8 sm:px-10 lg:py-10">
      <article id="folio-article" className="min-w-0 max-w-[760px] flex-1">
        <nav className="flex flex-wrap items-center gap-1 text-[12.5px] text-zinc-500">{crumbs.map((c, i) => <span key={i} className="flex items-center gap-1">{i > 0 && <ChevronRight size={12} />}{c.href ? <Link href={c.href} className="hover:text-zinc-900">{c.label}</Link> : <span>{c.label}</span>}</span>)}</nav>
        <div className="mt-3 flex items-start justify-between gap-4"><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-zinc-950 sm:text-[34px]">{title}</h1><span className="mt-2 hidden sm:block"><CopyPage /></span></div>
        {sub && <p className="mt-1.5 text-[13.5px] text-zinc-500">{sub}</p>}
        {intro && <p className="mt-3 text-[15.5px] leading-relaxed text-zinc-700">{intro}</p>}
        <div className="mt-8">{children}</div>
        {source && <p className="mt-10 text-[12.5px]"><a href={source} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">Open on the website<ExternalLink size={12} /></a></p>}
        {(prev || next) && <nav className="mt-12 flex items-end justify-between gap-4 border-t border-zinc-200 pt-6">
          {prev ? <Link href={prev.href} className="group min-w-0"><span className="text-[12px] text-zinc-500">Previous</span><span className="mt-0.5 flex items-center gap-1 text-[15px] font-medium text-zinc-900 group-hover:text-[#853500]"><ChevronLeft size={16} className="shrink-0" /><span className="truncate">{prev.title}</span></span></Link> : <span />}
          {next && <Link href={next.href} className="group min-w-0 text-right"><span className="text-[12px] text-zinc-500">Next</span><span className="mt-0.5 flex items-center justify-end gap-1 text-[15px] font-medium text-zinc-900 group-hover:text-[#853500]"><span className="truncate">{next.title}</span><ChevronRight size={16} className="shrink-0" /></span></Link>}
        </nav>}
      </article>
      <aside className="hidden w-[220px] shrink-0 xl:block"><OnThisPage /></aside>
    </div>
  );
}
/** Text kept as written: paragraphs from line breaks. */
export function Plain({ text }: { text: string }) { return <div className="space-y-4 text-[16px] leading-[1.8] text-zinc-800" style={{ fontFamily: "var(--font-reading-serif)" }}>{text.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>; }
export function Doc({ doc }: { doc: any[] }) { return <div className="reading folio-reading"><Render doc={doc} /></div>; }
