import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui";
import { Render } from "@/components/cms/doc";
import { docText } from "@/components/cms/doc-text";
import { getArticle, related } from "@/lib/content/articles-public";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = await getArticle(slug); if (!a) return {};
  return { title: a.title, description: a.summary || docText(a.body || []), openGraph: a.cover ? { images: [a.cover] } : undefined };
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const a = await getArticle(slug); if (!a) notFound();
  const r = await related(a); const k = r.series.findIndex((x: any) => x.slug === a.slug); const prev = k > 0 ? r.series[k - 1] : null; const next = k >= 0 && k < r.series.length - 1 ? r.series[k + 1] : null;
  const q = (o: Record<string, string>) => `/teachings/articles?${new URLSearchParams(o)}`;
  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-[12.5px] text-ink-3"><Link href="/teachings" className="hover:text-saffron">His Teachings</Link><ChevronRight size={13} /><Link href="/teachings/articles" className="hover:text-saffron">Articles</Link>{a.series && <><ChevronRight size={13} /><Link href={q({ series: a.series })} className="hover:text-saffron">{a.series}</Link></>}</nav>
      <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
        <article className="min-w-0">
          {(a.section || a.series) && <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-saffron">{[a.section, a.series && `${a.series}${a.series_part ? ` · Part ${a.series_part}` : ""}`].filter(Boolean).join(" · ")}</p>}
          <h1 className="mt-2 text-[27px] font-bold leading-tight tracking-tight sm:text-[34px]">{a.title}</h1>
          {a.subtitle && <p className="mt-2 text-[16px] text-ink-2">{a.subtitle}</p>}
          <p className="mt-3 text-[13px] text-ink-3">{a.author && <>By <Link href={q({ author: a.author })} className="font-medium text-ink hover:text-saffron">{a.author}</Link></>}{a.author && a.day && " · "}{a.day && new Date(a.day).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          {a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="mt-6 w-full rounded-2xl object-cover" />}
          <div className="reading mt-8"><Render doc={a.body || []} /></div>
          {a.source && <p className="mt-10 border-t border-line pt-4 text-[12.5px] text-ink-3">First published in {a.source_url ? <a href={a.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-saffron hover:underline">{a.source}<ExternalLink size={12} /></a> : a.source}.</p>}
          {(prev || next) && <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? <Link href={`/teachings/articles/${prev.slug}`} className="rounded-xl border border-line p-4 transition hover:border-saffron"><span className="flex items-center gap-1 text-[11.5px] text-ink-3"><ChevronLeft size={13} />Previous part</span><span className="mt-1 block text-[14px] font-semibold">{prev.title}</span></Link> : <span />}
            {next && <Link href={`/teachings/articles/${next.slug}`} className="rounded-xl border border-line p-4 text-right transition hover:border-saffron"><span className="flex items-center justify-end gap-1 text-[11.5px] text-ink-3">Next part<ChevronRight size={13} /></span><span className="mt-1 block text-[14px] font-semibold">{next.title}</span></Link>}
          </div>}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {r.series.length > 1 && <div className="rounded-2xl border border-line p-4"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">In this series</p><p className="mb-2 text-[14px] font-bold">{a.series}</p>
            <ol className="space-y-0.5">{r.series.map((x: any, i: number) => <li key={x.slug}><Link href={`/teachings/articles/${x.slug}`} className={`flex gap-2 rounded-lg px-2 py-1.5 text-[13px] ${x.slug === a.slug ? "bg-saffron-soft font-semibold text-saffron" : "text-ink-2 hover:bg-band"}`}><span className="w-5 shrink-0 tabular text-ink-3">{x.series_part || i + 1}</span><span>{x.title}</span></Link></li>)}</ol></div>}
          {r.byAuthor.length > 0 && <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">More by {a.author}</p><ul className="space-y-1">{r.byAuthor.map((x: any) => <li key={x.slug}><Link href={`/teachings/articles/${x.slug}`} className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band hover:text-saffron">{x.title}</Link></li>)}</ul></div>}
          {a.topics?.length > 0 && <div className="flex flex-wrap gap-1.5">{a.topics.map((t: string) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-ink-2 hover:border-saffron">{t}</Link>)}</div>}
        </aside>
      </div>
    </Container>
  );
}
