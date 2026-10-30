import Link from "next/link";
import { notFound } from "next/navigation";
import { topics, childrenOf, topicContent, type Topic } from "@/lib/content/topics";
import { toLecture } from "@/lib/cms/library";
import { LectureRow } from "@/components/lecture";
import type { Lecture } from "@/lib/data";
import { TopicTabs } from "@/components/tattva/tabs";

export const revalidate = 300;
const find = async (slug: string) => { const all = await topics(); return { all, t: all.find((x) => x.slug === slug) }; };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { t } = await find(slug); if (!t) return {};
  return { title: `${t.name} · Tattva`, description: t.description || `Quotes, lectures, videos and articles of Śrī Śrīmad Gour Govinda Swāmī Gurudeva on ${t.name}.`, alternates: { canonical: `/tattva/${t.slug}` } };
}
const below = (all: Topic[], name: string): string[] => childrenOf(all, name).flatMap((c) => [c.name, ...below(all, c.name)]);
const ROUTE: Record<string, [string, string]> = { verse: ["/teachings/verses", "Verse"], story: ["/teachings/stories", "Story"], instruction: ["/teachings/instructions", "Instruction"], desire: ["/teachings/desires", "Desire"], nectar: ["/teachings/nectar-drops", "Nectar drop"], analogy: ["/teachings/analogies", "Analogy"], qa: ["/teachings/questions-and-answers", "Q&A"], memory: ["/gurudeva/memories", "Memory"], glorification: ["/gurudeva/glorifications", "Glorification"] };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { all, t } = await find(slug); if (!t) notFound();
  const sub = childrenOf(all, t.name); const parent = t.parent ? all.find((x) => x.name === t.parent) : null;
  const c = await topicContent([t.name, ...below(all, t.name)]);
  const lectures: Lecture[] = c.lectures.map((r: any) => toLecture(r));
  const tabs = [
    { id: "quotes", label: "Quotes", n: c.quotes.length, body: <div className="columns-1 gap-3 md:columns-2">{c.quotes.map((x: any) => <Link key={x.slug} href={`/teachings/quotes/${x.slug}`} className="mb-3 block break-inside-avoid rounded-lg border border-line p-4 hover:border-line-strong"><p className="text-[14.5px] leading-[1.7] text-ink">“{x.text}”</p><p className="mt-2 text-[12px] text-ink-3">{x.lecture ? x.lecture : x.source || x.verse_ref}</p></Link>)}</div> },
    { id: "lectures", label: "Lectures", n: lectures.length, body: <div className="divide-y divide-line rounded-lg border border-line px-3">{lectures.map((l) => <LectureRow key={l.slug} l={l} />)}</div> },
    { id: "videos", label: "Videos", n: c.videos.length, body: <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{c.videos.map((v: any) => <Link key={v.slug} href={`/teachings/videos/${v.slug}`} className="group">{v.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full rounded-lg border border-line object-cover" />}<p className="mt-2 line-clamp-2 text-[13px] text-ink group-hover:underline">{v.title}</p>{v.date && <p className="text-[11.5px] text-ink-3">{String(v.date).slice(0, 10)}</p>}</Link>)}</div> },
    { id: "articles", label: "Articles", n: c.articles.length, body: <div className="divide-y divide-line rounded-lg border border-line">{c.articles.map((a: any) => <Link key={a.slug} href={`/teachings/articles/${a.slug}`} className="block px-4 py-3 hover:bg-band/50"><p className="text-[14px] font-medium text-ink">{a.title}</p>{a.summary && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-2">{a.summary}</p>}{a.author && <p className="mt-1 text-[11.5px] text-ink-3">{a.author}</p>}</Link>)}</div> },
    { id: "more", label: "Verses, stories & more", n: c.compilations.length, body: <div className="divide-y divide-line rounded-lg border border-line">{c.compilations.map((x: any) => { const r = ROUTE[x.kind]; return <Link key={x.slug} href={r ? `${r[0]}/${x.slug}` : "#"} className="block px-4 py-3 hover:bg-band/50"><p className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{r?.[1] || x.kind}</p>{x.title && <p className="text-[14px] font-medium text-ink">{x.title}</p>}<p className="mt-0.5 line-clamp-3 text-[13px] leading-relaxed text-ink-2">{x.text}</p></Link>; })}</div> },
  ].filter((x) => x.n > 0);
  return (
    <div>
      <nav className="text-[12px] text-ink-3"><Link href="/tattva" className="hover:text-ink">Tattva</Link>{parent && <> / <Link href={`/tattva/${parent.slug}`} className="hover:text-ink">{parent.name}</Link></>}</nav>
      <h1 className="mt-1 text-[24px] leading-tight text-ink sm:text-[26px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{t.name}</h1>
      {t.description && <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">{t.description}</p>}
      <p className="mt-2 text-[12px] text-ink-3">{[["quote", c.quotes.length], ["lecture", lectures.length], ["video", c.videos.length], ["article", c.articles.length]].filter(([, n]) => n).map(([w, n]) => `${n} ${w}${n === 1 ? "" : "s"}`).join(" · ") || "Nothing linked yet"}</p>
      {sub.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{sub.map((s) => <Link key={s.name} href={`/tattva/${s.slug}`} className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-2 hover:bg-band">{s.name}{s.total > 0 && <span className="ml-1 text-ink-3">{s.total}</span>}</Link>)}</div>}
      {tabs.length ? <TopicTabs tabs={tabs.map(({ id, label, n }) => ({ id, label, n }))}>{tabs.map((x) => <section key={x.id} data-tab={x.id}>{x.body}</section>)}</TopicTabs> : <p className="mt-10 rounded-lg border border-dashed border-line py-12 text-center text-[13px] text-ink-3">Nothing is linked to this topic yet. In the Studio, add “{t.name}” to a quote, lecture, video or article.</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: t.name, description: t.description || undefined, about: { "@type": "Thing", name: t.name } }) }} />
    </div>
  );
}
