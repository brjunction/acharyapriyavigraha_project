import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, ExternalLink, Clock, Newspaper } from "lucide-react";
import { Render, headings } from "@/components/cms/doc";
import { docText } from "@/components/cms/doc-text";
import { getArticle, related, allAuthors } from "@/lib/content/articles-public";
import { ArticleBar } from "@/components/articles/article-bar";
import { Avatar } from "@/components/articles/header";
import { slugify } from "@/lib/content/text";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = await getArticle(slug); if (!a) return {};
  return { title: a.title, description: a.summary || docText(a.body || []), authors: a.author ? [{ name: a.author }] : undefined, openGraph: { type: "article", images: a.cover ? [a.cover] : undefined }, alternates: { canonical: `/teachings/articles/${slug}` } };
}
const heads = (doc: any[]) => headings(doc).map((x) => ({ t: x.text, id: x.id })).filter((x) => x.t);

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const a = await getArticle(slug); if (!a) notFound();
  const [r, authors] = await Promise.all([related(a), allAuthors()]); const au = authors.find((x) => x.name === a.author);
  const k = r.series.findIndex((x: any) => x.slug === a.slug); const prev = k > 0 ? r.series[k - 1] : null; const next = k >= 0 && k < r.series.length - 1 ? r.series[k + 1] : null;
  const h = heads(Array.isArray(a.body) ? a.body : []);
  const date = a.day ? new Date(a.day).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, author: a.author ? { "@type": "Person", name: a.author } : undefined, datePublished: a.day || undefined, image: a.cover || undefined, isPartOf: a.mag ? { "@type": "PublicationIssue", name: `${a.mag}${a.issue ? `, ${a.issue}` : ""}` } : undefined };
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ArticleBar title={a.title} />
      <div className="mx-auto grid max-w-[1100px] gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <article className="min-w-0">
          <div className="mx-auto max-w-[700px]">
            {(a.section || a.series) && <p className="text-[12px] font-medium text-ink-3">{a.section && <Link href={`/teachings/articles?section=${encodeURIComponent(a.section)}`} className="hover:text-ink">{a.section}</Link>}{a.section && a.series && " · "}{a.series && <Link href={`/teachings/articles?series=${encodeURIComponent(a.series)}`} className="hover:text-ink">{a.series}{a.series_part ? `, part ${a.series_part}` : ""}</Link>}</p>}
            <h1 className="mt-2 text-[30px] leading-[1.15] tracking-[-0.01em] text-ink sm:text-[38px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{a.title}</h1>
            {a.subtitle && <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{a.subtitle}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-line py-3">
              {a.author && <Link href={`/teachings/articles/authors/${slugify(a.author)}`} className="flex items-center gap-2.5"><Avatar name={a.author} photo={au?.photo} size={36} /><span><span className="block text-[13.5px] font-medium text-ink hover:underline">{a.author}</span>{au?.role && <span className="block text-[12px] text-ink-3">{au.role}</span>}</span></Link>}
              <span className="ml-auto flex flex-wrap items-center gap-3 text-[12.5px] text-ink-3">{date && <span>{date}</span>}<span className="flex items-center gap-1"><Clock size={13} />{a.minutes} min read</span></span>
            </div>
            {a.mag && <Link href={`/teachings/magazines/${a.mag_slug}/${a.issue_slug}`} className="mt-4 flex items-center gap-3 rounded-lg border border-line p-3 hover:bg-band/50">{(a.issue_cover || a.mag_cover) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.issue_cover || a.mag_cover} alt="" className="h-12 w-9 rounded-sm object-cover" /> : <Newspaper size={18} className="text-ink-3" />}<span className="text-[13px] text-ink-2">Published in <span className="font-medium text-ink">{a.mag}</span>{a.issue ? `, ${a.issue}` : ""}</span><ChevronRight size={14} className="ml-auto text-ink-3" /></Link>}
            {a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="mt-8 w-full rounded-lg object-cover" />}
            <div id="article-text" className="book-body rd-article mt-8" style={{ fontSize: 18, lineHeight: 1.8, fontFamily: "var(--font-reading-serif)" }}><Render doc={a.body || []} /></div>
            {a.source && <p className="mt-10 border-t border-line pt-4 text-[12.5px] text-ink-3">First published in {a.source_url ? <a href={a.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink-2 underline underline-offset-2">{a.source}<ExternalLink size={12} /></a> : a.source}</p>}
            {a.topics?.length > 0 && <div className="mt-6 flex flex-wrap gap-1.5">{a.topics.map((t: string) => <Link key={t} href={`/tattva/${slugify(t)}`} className="rounded-md bg-band px-2.5 py-1 text-[12px] text-ink-2 hover:bg-line">{t}</Link>)}</div>}
            {(prev || next) && <nav className="mt-10 grid gap-3 sm:grid-cols-2">
              {prev ? <Link href={`/teachings/articles/${prev.slug}`} className="rounded-lg border border-line p-4 hover:border-line-strong"><span className="flex items-center gap-1 text-[11.5px] text-ink-3"><ChevronLeft size={13} />Previous part</span><span className="mt-1 block truncate text-[14px] font-medium text-ink">{prev.title}</span></Link> : <span />}
              {next && <Link href={`/teachings/articles/${next.slug}`} className="rounded-lg border border-line p-4 text-right hover:border-line-strong"><span className="flex items-center justify-end gap-1 text-[11.5px] text-ink-3">Next part<ChevronRight size={13} /></span><span className="mt-1 block truncate text-[14px] font-medium text-ink">{next.title}</span></Link>}
            </nav>}
            {au?.bio && <div className="mt-10 flex gap-4 rounded-xl bg-band/60 p-5"><Avatar name={au.name} photo={au.photo} size={56} /><div><p className="text-[12px] text-ink-3">About the author</p><p className="text-[15px] font-semibold text-ink">{au.name}</p><p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{au.bio}</p></div></div>}
          </div>
        </article>
        <aside className="space-y-8 text-[13px] lg:sticky lg:top-[130px] lg:self-start">
          {h.length > 1 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">On this page</p><ul className="space-y-1 border-l border-line">{h.map((x) => <li key={x.id}><a href={`#${x.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-ink-2 hover:border-ink hover:text-ink">{x.t}</a></li>)}</ul></div>}
          {r.series.length > 1 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">In this series</p><ol className="space-y-0.5">{r.series.map((x: any, i: number) => <li key={x.slug}><Link href={`/teachings/articles/${x.slug}`} className={`flex gap-2 rounded-md px-2 py-1.5 ${x.slug === a.slug ? "bg-band font-medium text-ink" : "text-ink-2 hover:bg-band/60"}`}><span className="w-4 shrink-0 text-ink-3">{x.series_part || i + 1}</span>{x.title}</Link></li>)}</ol></div>}
          {r.inIssue.length > 1 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">Also in this issue</p><ul className="space-y-1">{r.inIssue.filter((x: any) => x.slug !== a.slug).slice(0, 8).map((x: any) => <li key={x.slug}><Link href={`/teachings/articles/${x.slug}`} className="block rounded-md px-2 py-1.5 text-ink-2 hover:bg-band/60">{x.title}{x.author && <span className="block text-[11.5px] text-ink-3">{x.author}</span>}</Link></li>)}</ul></div>}
          {r.byAuthor.length > 0 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">More by {a.author}</p><ul className="space-y-1">{r.byAuthor.map((x: any) => <li key={x.slug}><Link href={`/teachings/articles/${x.slug}`} className="block rounded-md px-2 py-1.5 text-ink-2 hover:bg-band/60">{x.title}</Link></li>)}</ul></div>}
        </aside>
      </div>
    </div>
  );
}
