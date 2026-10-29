/* Public pages for videos and compilations, read from their own tables. */
import { notFound } from "next/navigation";
import Link from "next/link";
import { sql, hasDb } from "@/lib/db";
import { PageHero, Container } from "@/components/ui";
import { CollectionBrowser, type Item } from "./collection-browser";
import { durText } from "@/lib/content/text";

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
  const r = ROUTES[route]; if (!r || !hasDb()) return null;
  try {
    if (r.table === "videos") return (await sql`select slug, title, date, youtube_id, kind, place, topics, description from videos where status = 'published' order by date desc nulls last limit 5000`).map((v: any) => ({ title: v.title, slug: v.slug, data: { video: v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : "", date: v.date, category: v.kind, place: v.place, topics: v.topics } }));
    return (await sql`select e.slug, e.title, e.text, e.source, e.verse_ref, e.original, e.transliteration, e.translation, e.author, e.date, e.topics, e.at_sec, a.title as lecture, a.slug as lslug from excerpts e left join audios a on a.id = e.audio_id where e.kind = ${r.kind} and e.status = 'published' order by e.position, e.created_at desc limit 5000`)
      .map((e: any) => ({ title: e.title || e.verse_ref || "", slug: e.slug, data: { text: e.text, source: e.source || (e.lecture ? `${e.lecture}${e.at_sec ? `, at ${durText(e.at_sec)}` : ""}` : e.author || ""), reference: e.verse_ref, devanagari: e.original, transliteration: e.transliteration, translation: e.translation, topics: e.topics, date: e.date } }));
  } catch { return null; }
}

export async function CollectionPage({ route, crumbs }: { route: string; crumbs: { href?: string; label: string }[] }) {
  const r = ROUTES[route]; const items = await rows(route); if (!r || !items?.length) return null;
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
      <p className="mb-3 text-[12.5px] text-ink-3"><Link href={route} className="hover:text-saffron">{r.title}</Link></p>
      {(e.title || e.verse_ref) && <h1 className="mb-5 text-[26px] font-bold tracking-[-0.025em] sm:text-[31.5px]">{e.title || e.verse_ref}</h1>}
      {e.original && <p className="whitespace-pre-line text-center text-[18.5px] leading-[1.9] text-[#7a3a06]">{e.original}</p>}
      {e.transliteration && <p className="mt-3 whitespace-pre-line text-center text-[14.5px] italic leading-[1.85] text-ink-2">{e.transliteration}</p>}
      {e.translation && <p className="mt-6 text-[16.5px] font-medium leading-[1.7] text-ink">{e.translation}</p>}
      {e.text && <blockquote className={`mt-6 whitespace-pre-line leading-[1.8] text-ink ${r.kind === "quote" || r.kind === "desire" || r.kind === "nectar" ? "text-[22px] font-medium" : "text-[15.5px]"}`}>{r.kind === "quote" ? `“${e.text}”` : e.text}</blockquote>}
      <p className="mt-6 text-[13px] font-medium text-saffron">{e.lslug ? <Link href={`/teachings/audio/${e.lslug}`} className="hover:underline">{e.lecture}{e.at_sec ? `, at ${durText(e.at_sec)}` : ""}</Link> : e.source || e.author}</p>
      {e.topics?.length > 0 && <p className="mt-4 flex flex-wrap gap-1.5">{e.topics.map((t: string) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-band px-3 py-1 text-[12.5px] text-ink-2">{t}</Link>)}</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": r.kind === "quote" ? "Quotation" : "CreativeWork", text: e.text || e.translation, name: e.title || undefined, creator: { "@type": "Person", name: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva" }, isPartOf: r.title }) }} />
    </Container>
  );
}
