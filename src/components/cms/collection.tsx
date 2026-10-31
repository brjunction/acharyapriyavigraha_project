/* Public pages for videos and compilations, read from their own tables. */
import { notFound } from "next/navigation";
import Link from "next/link";
import { sql, hasDb } from "@/lib/db";
import { PageHero, Container } from "@/components/ui";
import { CollectionBrowser, type Item } from "./collection-browser";
import { durText, slugify } from "@/lib/content/text";
import { Suspense } from "react";
import { CompilationsHeader, COMP_TABS } from "@/components/compilations/header";
import { CompilationLibrary } from "@/components/compilations/library";

/** Which address shows which kind. */
export const ROUTES: Record<string, { kind: string; table: "excerpts" | "videos"; title: string; intro: string; view: string }> = {
  "/teachings/videos": { table: "videos", kind: "", title: "Videos", intro: "Lectures, kīrtanas and festivals on video.", view: "videos" },
  "/teachings/quotes": { table: "excerpts", kind: "quote", title: "Quotes", intro: "Short quotations, each with its exact source.", view: "quotes" },
  "/teachings/verses": { table: "excerpts", kind: "verse", title: "Verses", intro: "Verses he loved to quote, with translation and his explanation.", view: "verses" },
  "/teachings/stories": { table: "excerpts", kind: "story", title: "Stories & anecdotes", intro: "Stories he told, and where he told them.", view: "stories" },
  "/teachings/instructions": { table: "excerpts", kind: "instruction", title: "Instructions", intro: "Guidance for sādhana and life.", view: "stories" },
  "/teachings/desires": { table: "excerpts", kind: "desire", title: "Desires", intro: "His heart’s wishes, in his own words.", view: "quotes" },
  "/teachings/nectar-drops": { table: "excerpts", kind: "nectar", title: "Nectar drops", intro: "A short gem for every day.", view: "quotes" },
  "/teachings/analogies": { table: "excerpts", kind: "analogy", title: "Analogies", intro: "“When the sun rises, the lotus blossoms…”", view: "stories" },
  "/teachings/questions-and-answers": { table: "excerpts", kind: "qa", title: "Questions & answers", intro: "Questions put to him, and his answers.", view: "stories" },
  "/gurudeva/memories": { table: "excerpts", kind: "memory", title: "Memories & pastimes", intro: "Disciples and friends remembering him.", view: "stories" },
  "/gurudeva/glorifications": { table: "excerpts", kind: "glorification", title: "Glorifications", intro: "Vyāsa-pūjā offerings and poems.", view: "stories" },
};

async function rows(route: string) {
  const r = ROUTES[route];
  if (!r || !hasDb()) return null;
  try {
    if (r.table === "videos") return (await sql`select slug, title, date, youtube_id, kind, place, topics, description from videos where status = 'published' order by date desc nulls last limit 5000`).map((v: any) => ({ title: v.title, slug: v.slug, data: { video: v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : "", date: v.date, category: v.kind, place: v.place, topics: v.topics } }));
    return (await sql`select e.slug, e.title, e.text, e.source, e.verse_ref, e.original, e.transliteration, e.translation, e.author, e.date, e.topics, e.at_sec, a.title as lecture, a.slug as lslug from excerpts e left join audios a on a.id = e.audio_id where e.kind = ${r.kind} and e.status = 'published' order by e.position, e.created_at desc limit 5000`)
      .map((e: any) => ({ title: e.title || e.verse_ref || "", slug: e.slug, data: { text: e.text, source: e.source || (e.lecture ? `${e.lecture}${e.at_sec ? `, at ${durText(e.at_sec)}` : ""}` : e.author || ""), reference: e.verse_ref, devanagari: e.original, transliteration: e.transliteration, translation: e.translation, topics: e.topics, date: e.date, lslug: e.lslug } }));
  } catch { return null; }
}

export async function CollectionPage({ route, crumbs }: { route: string; crumbs: { href?: string; label: string }[] }) {
  const r = ROUTES[route]; const items = await rows(route); const comp = COMP_TABS.some(([h]) => h === route); if (!r || !items || (!items.length && !comp)) return null;
  if (r.table === "excerpts" && comp) {
    const list = items.map((x: any) => ({ slug: x.slug, title: x.title, text: x.data.text, source: x.data.source, href: x.data.lslug ? `/teachings/audio/${x.data.lslug}` : null, reference: x.data.reference, translation: x.data.translation, topics: x.data.topics }));
    const nt = new Set(list.flatMap((x) => x.topics || [])).size;
    return (<><CompilationsHeader at={route} title={r.title} intro={r.intro} stats={[`${list.length.toLocaleString()} entries`, `${nt} topics`]} /><Suspense><CompilationLibrary items={list} base={route} kind={["quote", "desire", "nectar"].includes(r.kind) ? "quote" : "card"} /></Suspense></>);
  }
  const facets = r.table === "videos" ? [{ key: "category", label: "Kind" }, { key: "place", label: "Place" }, { key: "topics", label: "Topic" }] : [{ key: "topics", label: "Topic" }];
  return (
    <>
      <PageHero crumbs={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: r.title } : c))} title={r.title} intro={r.intro} />
      <CollectionBrowser kind={r.view} base={route} items={items as Item[]} facets={facets} dateKey={r.table === "videos" ? "date" : undefined} lectureTitles={{}} />
    </>
  );
}

/** One entry on its own page, so search engines can find each quote, verse or story. */
export async function ItemPage({ route, slug }: { route: string; slug: string }) {
  const r = ROUTES[route]; if (!r || r.table !== "excerpts" || !hasDb()) notFound();
  const e = (await sql`select e.*, a.title as lecture, a.slug as lslug from excerpts e left join audios a on a.id = e.audio_id where e.slug = ${slug} and e.kind = ${r.kind} and e.status = 'published'`.catch(() => []))[0] as any; if (!e) notFound();
  return (
    <Container className="max-w-[820px] py-14">
      <p className="mb-4 text-[12.5px] text-ink-3"><Link href="/teachings" className="hover:text-ink">His Teachings</Link> / <Link href={route} className="hover:text-ink">{r.title}</Link></p>
      {(e.title || e.verse_ref) && <h1 className="mb-5 text-[26px] font-bold tracking-[-0.025em] sm:text-[31.5px]">{e.title || e.verse_ref}</h1>}
      {e.original && <p className="whitespace-pre-line text-center text-[18.5px] leading-[1.9] text-[#7a3a06]">{e.original}</p>}
      {e.transliteration && <p className="mt-3 whitespace-pre-line text-center text-[14.5px]  leading-[1.85] text-ink-2">{e.transliteration}</p>}
      {e.translation && <p className="mt-6 text-[16.5px] font-medium leading-[1.7] text-ink">{e.translation}</p>}
      {e.text && <blockquote className={`mt-6 whitespace-pre-line leading-[1.8] text-ink ${r.kind === "quote" || r.kind === "desire" || r.kind === "nectar" ? "text-[20px]" : "text-[15.5px]"}`}>{r.kind === "quote" ? `“${e.text}”` : e.text}</blockquote>}
      <p className="mt-6 text-[13px] text-ink-2">— Śrī Śrīmad Gour Govinda Swāmī Gurudeva{e.lslug || e.source || e.author ? ", " : ""}{e.lslug ? <Link href={`/teachings/audio/${e.lslug}`} className="underline decoration-line-strong underline-offset-2 hover:text-ink">{e.lecture}{e.at_sec ? `, at ${durText(e.at_sec)}` : ""}</Link> : e.source || e.author}</p>
      {e.topics?.length > 0 && <p className="mt-4 flex flex-wrap gap-1.5">{e.topics.map((t: string) => <Link key={t} href={`/tattva/${slugify(t)}`} className="rounded-md bg-band px-2.5 py-1 text-[12px] text-ink-2 hover:bg-line">{t}</Link>)}</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": r.kind === "quote" ? "Quotation" : "CreativeWork", text: e.text || e.translation, name: e.title || undefined, creator: { "@type": "Person", name: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva" }, isPartOf: r.title }) }} />
    </Container>
  );
}

/** Title and description for one entry's page, so each quote shows well in search results. */
export async function itemMetadata(route: string, slug: string) {
  const r = ROUTES[route]; if (!r || !hasDb()) return {};
  const e = (await sql`select title, text, translation, verse_ref, topics from excerpts where slug = ${slug} and kind = ${r.kind} and status = 'published'`.catch(() => []))[0] as any; if (!e) return {};
  const body = String(e.text || e.translation || "").replace(/\s+/g, " ").trim(); const short = body.length > 70 ? body.slice(0, 67).replace(/\s\S*$/, "") + "…" : body;
  return { title: e.title || e.verse_ref || `“${short}”`, description: `${body.slice(0, 155)}${body.length > 155 ? "…" : ""} — Śrī Śrīmad Gour Govinda Swāmī Gurudeva`, keywords: e.topics || undefined, alternates: { canonical: `${route}/${slug}` } };
}
