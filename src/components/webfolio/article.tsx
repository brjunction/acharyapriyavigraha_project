import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Render } from "@/components/cms/doc";
import { OnThisPage, CopyPage } from "./parts";
import { PageTurn, UpNext } from "./turn";

export type Crumb = { href?: string; label: string };
export type Nb = { title: string; href: string } | null;
/** The page frame of every WebFolio page: breadcrumb, title, copy, the content, previous/next, and the contents on the right. */
export function FolioArticle({ crumbs, title, sub, intro, children, prev, next, source }: { crumbs: Crumb[]; title: string; sub?: string; intro?: string; children: React.ReactNode; prev?: Nb; next?: Nb; source?: string }) {
  const up0 = [...crumbs].reverse().find((c) => c.href && c.href !== "/webfolio"); const upLink = up0 ? { href: up0.href!, label: up0.label } : null;
  return (
    <div className="flex justify-center gap-12 px-5 py-8 sm:px-10 lg:py-12">
      <article id="folio-article" className="min-w-0 flex-1" style={{ maxWidth: "var(--folio-width)" }}>
        {(() => { const up = upLink; return up ? <Link href={up.href!} className="inline-flex h-7 items-center gap-1 rounded-full bg-zinc-100 pl-2 pr-3 text-[12px] font-medium text-zinc-600 transition hover:bg-zinc-200/70 hover:text-zinc-950"><ChevronLeft size={13} />{up.label}</Link> : null; })()}
        <div className="mt-4 flex items-start justify-between gap-4"><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-zinc-950 sm:text-[36px]">{title}</h1><span className="mt-2 hidden sm:block"><CopyPage /></span></div>
        {sub && <p className="mt-1.5 text-[13.5px] text-zinc-500">{sub}</p>}
        {intro && <p className="mt-3 text-[15.5px] leading-relaxed text-zinc-600">{intro}</p>}
        <div className="folio-body mt-8">{children}</div>
        {source && <p className="mt-10 text-[12.5px]"><a href={source} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900">Open on the website<ExternalLink size={12} /></a></p>}
        <UpNext prev={prev} next={next} up={upLink} />
        <PageTurn prev={prev} next={next} up={upLink} />
      </article>
      <aside className="folio-toc hidden w-[220px] shrink-0 xl:block"><OnThisPage /></aside>
    </div>
  );
}
/** Text kept as written: paragraphs from line breaks. */
export function Plain({ text }: { text: string }) { return <div className="folio-text space-y-4 leading-[1.8] text-zinc-800">{text.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>; }
export function Doc({ doc }: { doc: any[] }) { return <div className="reading folio-reading"><Render doc={doc} /></div>; }
