import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, FileDown, ExternalLink, Clock } from "lucide-react";
import { getIssue } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { MagCover } from "@/components/articles/mag-cover";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ mag: string; issue: string }> }) { const { mag, issue } = await params; const r = await getIssue(mag, issue); return r ? { title: `${r.issue.title || r.issue.number} — ${r.magazine.title}`, description: r.issue.description || `Contents of ${r.magazine.title}, ${r.issue.title || r.issue.number}.` } : {}; }

/** One issue: its cover, the whole issue to open, and the articles inside it in order. */
export default async function Page({ params }: { params: Promise<{ mag: string; issue: string }> }) {
  const { mag, issue } = await params; const r = await getIssue(mag, issue); if (!r) notFound();
  const { magazine: m, issue: i, articles, newer, older } = r; const label = i.number && i.title ? `${i.number} · ${i.title}` : i.title || i.number;
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title={label} intro={m.title} stats={[i.date ? new Date(i.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "", `${articles.length} articles`].filter(Boolean)} crumbs={[["/teachings/magazines", "Magazines"], [`/teachings/magazines/${m.slug}`, m.title]]} />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pb-20 pt-8 sm:px-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-24 md:self-start">
          <MagCover src={i.cover} label={label} className="mx-auto w-[180px] md:w-full" />
          <div className="mt-4 grid gap-2">{i.pdf_url && <a href={i.pdf_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-ink text-[13px] font-medium text-white hover:bg-ink/90"><FileDown size={15} />Open the whole issue (PDF)</a>}{i.url && <a href={i.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line text-[13px] text-ink-2 hover:bg-band"><ExternalLink size={14} />Where it is kept</a>}</div>
          {i.description && <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{i.description}</p>}
          <div className="mt-6 grid grid-cols-2 gap-2 text-[12px]">{older ? <Link href={`/teachings/magazines/${m.slug}/${older.slug}`} className="rounded-md border border-line p-2.5 hover:bg-band"><span className="flex items-center gap-1 text-ink-3"><ChevronLeft size={12} />Earlier</span><span className="mt-0.5 block truncate text-ink">{older.title || older.number}</span></Link> : <span />}{newer && <Link href={`/teachings/magazines/${m.slug}/${newer.slug}`} className="rounded-md border border-line p-2.5 text-right hover:bg-band"><span className="flex items-center justify-end gap-1 text-ink-3">Later<ChevronRight size={12} /></span><span className="mt-0.5 block truncate text-ink">{newer.title || newer.number}</span></Link>}</div>
        </aside>
        <div>
          <h2 className="border-b border-line pb-2 text-[15px] font-semibold text-ink">In this issue</h2>
          {!articles.length && <p className="py-12 text-center text-[13.5px] text-ink-3">The contents of this issue are being added{i.pdf_url ? " — you can open the whole issue meanwhile" : ""}.</p>}
          <ol className="divide-y divide-line">{articles.map((a: any, k: number) => (
            <li key={a.slug}><Link href={`/teachings/articles/${a.slug}`} className="group flex gap-4 py-4">
              <span className="w-6 shrink-0 pt-0.5 text-right text-[13px] tabular-nums text-ink-3">{k + 1}</span>
              <span className="min-w-0"><span className="block text-[16.5px] font-medium leading-snug text-ink group-hover:underline" style={{ fontFamily: "var(--font-reading-serif)" }}>{a.title}</span>{a.summary && <span className="mt-1 line-clamp-2 block text-[13.5px] text-ink-2">{a.summary}</span>}<span className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-ink-3">{a.author && <span>{a.author}</span>}{a.section && <span>{a.section}</span>}<span className="flex items-center gap-1"><Clock size={12} />{a.minutes} min</span></span></span>
            </Link></li>))}</ol>
        </div>
      </div>
    </>
  );
}
