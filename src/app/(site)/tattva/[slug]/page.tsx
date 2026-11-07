import Link from "next/link";
import { notFound } from "next/navigation";
import { topics, childrenOf, topicContent, topicQuotes, namesBelow, type Topic } from "@/lib/content/topics";
import { SITE } from "@/lib/cms/render";
import { toLecture } from "@/lib/cms/library";
import { LectureRow } from "@/components/lecture";
import type { Lecture } from "@/lib/data";
import { TopicTabs } from "@/components/tattva/tabs";

export const revalidate = 300;
const find = async (slug: string) => { const all = await topics(); return { all, t: all.find((x) => x.slug === slug) }; };
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params; const { page } = await searchParams; const { t } = await find(slug); if (!t) return {};
  const n = Number(page) > 1 ? Number(page) : 0;
  const title = `${t.name} — Śrī Śrīmad Gour Govinda Swāmī${n ? ` (page ${n})` : ""}`;
  const description = (t.description || `${t.name}: quotes, lectures, videos and articles of Śrī Śrīmad Gour Govinda Swāmī Gurudeva on ${t.name}${t.deep ? ` — ${t.deep.toLocaleString()} in all` : ""}, with their sources.`).slice(0, 300);
  return { title, description, keywords: [t.name, ...t.aliases, `${t.name} Gour Govinda Swami`, "Gour Govinda Swami", "Śrīla Gurudeva", "Tattva"], alternates: { canonical: `/tattva/${t.slug}${n ? `?page=${n}` : ""}` }, openGraph: { title, description, type: "website", url: `${SITE}/tattva/${t.slug}` } };
}
const ROUTE: Record<string, [string, string]> = { verse: ["/teachings/verses", "Verse"], story: ["/teachings/stories", "Story"], instruction: ["/teachings/instructions", "Instruction"], desire: ["/teachings/desires", "Desire"], nectar: ["/teachings/nectar-drops", "Nectar drop"], analogy: ["/teachings/analogies", "Analogy"], qa: ["/teachings/questions-and-answers", "Q&A"], memory: ["/gurudeva/memories", "Memory"], glorification: ["/gurudeva/glorifications", "Glorification"] };

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; q?: string; sub?: string; sort?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const { all, t } = await find(slug); if (!t) notFound();
  const sub = childrenOf(all, t.name);
  // quotes can be narrowed to one sub-topic (and everything under it)
  const focus = sp.sub ? all.find((x) => x.slug === sp.sub && namesBelow(all, t.name).includes(x.name)) : null;
  const scope = focus ? [focus.name, ...namesBelow(all, focus.name)] : [t.name, ...namesBelow(all, t.name)];
  const [c, qs] = await Promise.all([topicContent([t.name, ...namesBelow(all, t.name)]), topicQuotes(scope, { page: Number(sp.page) || 1, q: sp.q, sort: sp.sort })]);
  const lectures: Lecture[] = c.lectures.map((r: any) => toLecture(r));
  const qhref = (p: Record<string, string | number | undefined>) => { const u = new URLSearchParams(); const m = { q: sp.q, sub: sp.sub, sort: sp.sort, ...p }; Object.entries(m).forEach(([k, v]) => { if (v && !(k === "page" && Number(v) <= 1)) u.set(k, String(v)); }); const x = u.toString(); return `/tattva/${t.slug}${x ? `?${x}` : ""}#quotes`; };
  const quotesBody = (
    <div>
      <form action={`/tattva/${t.slug}`} className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={sp.q || ""} placeholder={`Find in ${qs.total || ""} quotes on ${focus?.name || t.name}`} className="h-9 min-w-0 flex-1 rounded-full border border-line px-4 text-[13px] outline-none focus:border-saffron" />
        {sp.sub && <input type="hidden" name="sub" value={sp.sub} />}
        <select name="sort" defaultValue={sp.sort || ""} className="h-9 rounded-full border border-line bg-white px-3 text-[12.5px]"><option value="">In order</option><option value="date">By date</option></select>
        <button className="h-9 rounded-full bg-saffron px-4 text-[12.5px] font-semibold text-white">Find</button>
      </form>
      {sub.length > 0 && <div className="mb-4 flex flex-wrap gap-1.5"><Link href={qhref({ sub: undefined, page: undefined })} className={`rounded-full px-3 py-1 text-[12px] ${!focus ? "bg-ink text-white" : "border border-line text-ink-2 hover:border-ink-3"}`}>All of {t.name}</Link>{sub.map((x) => <Link key={x.slug} href={qhref({ sub: x.slug, page: undefined })} className={`rounded-full px-3 py-1 text-[12px] ${focus?.slug === x.slug ? "bg-ink text-white" : "border border-line text-ink-2 hover:border-ink-3"}`}>{x.name}{x.deep ? <span className="ml-1 opacity-60">{x.deep}</span> : null}</Link>)}</div>}
      {!qs.rows.length ? <p className="rounded-lg border border-dashed border-line py-10 text-center text-[13px] text-ink-3">{sp.q ? "No quotes with those words." : "No quotes here yet."}</p> :
        <div className="columns-1 gap-3 md:columns-2">{qs.rows.map((x: any) => (
          <figure key={x.slug} className="mb-3 break-inside-avoid rounded-lg border border-line p-4 transition hover:border-line-strong">
            <blockquote><Link href={`/teachings/quotes/${x.slug}`} className="text-[14.5px] leading-[1.7] text-ink hover:text-saffron">“{x.text}”</Link></blockquote>
            <figcaption className="mt-2 text-[12px] text-ink-3">{x.lslug ? <Link href={x.lcode ? `/audios/${x.lcode}` : `/teachings/audio/${x.lslug}`} className="hover:text-saffron">{[x.lecture, x.place, x.date].filter(Boolean).join(" · ")}</Link> : x.source || x.verse_ref || "Śrī Śrīmad Gour Govinda Swāmī Gurudeva"}</figcaption>
          </figure>))}</div>}
      {qs.pages > 1 && <nav aria-label="Pages of quotes" className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[13px]">
        {qs.page > 1 && <Link rel="prev" href={qhref({ page: qs.page - 1 })} className="rounded-full border border-line px-4 py-1.5 hover:border-ink-3">Previous</Link>}
        <span className="px-2 text-ink-3">Page {qs.page} of {qs.pages} · {qs.total.toLocaleString()} quotes</span>
        {qs.page < qs.pages && <Link rel="next" href={qhref({ page: qs.page + 1 })} className="rounded-full border border-line px-4 py-1.5 hover:border-ink-3">Next</Link>}
      </nav>}
    </div>);
  const tabs = [
    { id: "quotes", label: "Quotes", n: qs.total, body: quotesBody },
    { id: "lectures", label: "Lectures", n: lectures.length, body: <div className="divide-y divide-line rounded-lg border border-line px-3">{lectures.map((l) => <LectureRow key={l.slug} l={l} />)}</div> },
    { id: "videos", label: "Videos", n: c.videos.length, body: <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{c.videos.map((v: any) => <Link key={v.slug} href={`/teachings/videos/${v.slug}`} className="group">{v.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />}<p className="mt-2 line-clamp-2 text-[13.5px] text-ink group-hover:text-saffron">{v.title}</p></Link>)}</div> },
    { id: "articles", label: "Articles", n: c.articles.length, body: <div className="divide-y divide-line rounded-lg border border-line">{c.articles.map((a: any) => <Link key={a.slug} href={`/teachings/articles/${a.slug}`} className="block px-4 py-3 hover:bg-band/50"><p className="text-[14px] font-medium text-ink">{a.title}</p>{a.summary && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-3">{a.summary}</p>}</Link>)}</div> },
    { id: "more", label: "Verses, stories & more", n: c.compilations.length, body: <div className="divide-y divide-line rounded-lg border border-line">{c.compilations.map((x: any) => { const r = ROUTE[x.kind]; return <Link key={x.slug} href={r ? `${r[0]}/${x.slug}` : "#"} className="block px-4 py-3 hover:bg-band/50"><p className="text-[11px] font-medium uppercase tracking-[0.08em] text-saffron">{r?.[1] || x.kind}</p><p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink">{x.title || x.text}</p></Link>; })}</div> },
  ].filter((x) => x.n > 0 || x.id === "quotes");
  // the whole tree under this topic, every level, with counts
  const Tree = ({ name, d }: { name: string; d: number }): React.ReactNode => { const ch = childrenOf(all, name); if (!ch.length) return null; return <ul className={d ? "ml-4 mt-1 border-l border-line pl-3" : "grid gap-x-6 gap-y-1 sm:grid-cols-2"}>{ch.map((x) => <li key={x.slug} className="py-0.5"><Link href={`/tattva/${x.slug}`} className="inline-flex items-baseline gap-1.5 text-[13px] text-ink-2 hover:text-saffron"><span className={d ? "" : "font-medium text-ink"}>{x.name}</span>{x.deep > 0 && <span className="text-[11px] text-ink-3">{x.deep}</span>}</Link><Tree name={x.name} d={d + 1} /></li>)}</ul>; };
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: `${t.name} — Śrī Śrīmad Gour Govinda Swāmī`, description: t.description || undefined, url: `${SITE}/tattva/${t.slug}`, about: { "@type": "Thing", name: t.name, alternateName: t.aliases.length ? t.aliases : undefined },
    mainEntity: { "@type": "ItemList", numberOfItems: qs.total, itemListElement: qs.rows.slice(0, 20).map((x: any, i: number) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Quotation", text: x.text, url: `${SITE}/teachings/quotes/${x.slug}`, creator: { "@type": "Person", name: "Śrī Śrīmad Gour Govinda Swāmī" } } })) } };
  return (
    <div>
      <h1 className="mt-1 text-[24px] leading-tight text-ink sm:text-[28px]">{t.name}</h1>
      {t.aliases.length > 0 && <p className="mt-1 text-[12.5px] text-ink-3">Also: {t.aliases.join(", ")}</p>}
      {t.description && <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-2">{t.description}</p>}
      <p className="mt-2 text-[12px] text-ink-3">{[["quote", qs.total], ["lecture", lectures.length], ["video", c.videos.length], ["article", c.articles.length]].filter(([, n]) => n).map(([w, n]) => `${Number(n).toLocaleString()} ${w}${n === 1 ? "" : "s"}`).join(" · ") || "Nothing linked yet"}{sub.length ? ` · ${namesBelow(all, t.name).length} sub-topics` : ""}</p>
      {sub.length > 0 && <section className="mt-5 rounded-xl border border-line bg-band/30 p-4"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">Inside {t.name}</p><Tree name={t.name} d={0} /></section>}
      <div id="quotes" className="scroll-mt-28" />
      <TopicTabs tabs={tabs.map(({ id, label, n }) => ({ id, label, n }))}>{tabs.map((x) => <section key={x.id} data-tab={x.id}>{x.body}</section>)}</TopicTabs>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
