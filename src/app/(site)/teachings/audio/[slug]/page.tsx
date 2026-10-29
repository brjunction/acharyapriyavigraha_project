import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, BookOpen, Tag, Languages, Clock } from "lucide-react";
import { LECTURES, fmtDate, fmtDur, QUOTE_OF_DAY } from "@/lib/data";
import { LectureHeroControls, Transcript, LectureRow } from "@/components/lecture";
import { Container, Crumbs, QuoteCard } from "@/components/ui";
import { PaisleyField, Rosette } from "@/components/motifs";
import { getAudio, toLecture } from "@/lib/cms/library";
import { Render } from "@/components/cms/doc";
import { sql } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = await getAudio(slug);
  if (a) { const l = toLecture(a); return { title: l.title, description: a.summary || [l.type, l.scripture, l.place, l.date].filter(Boolean).join(" · "), alternates: { canonical: `/teachings/audio/${slug}` } }; }
  const l = LECTURES.find((x) => x.slug === slug); return l ? { title: l.title } : {};
}

export function generateStaticParams() { return LECTURES.map((l) => ({ slug: l.slug })); }

export default async function LecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getAudio(slug);
  if (row) return <RealLecture a={row} />;
  const l = LECTURES.find((x) => x.slug === slug);
  if (!l) notFound();
  const related = LECTURES.filter((x) => x.slug !== l.slug && (x.place === l.place || x.scripture === l.scripture)).slice(0, 4);
  const meta = [
    { i: Calendar, t: fmtDate(l.date) }, { i: MapPin, t: `${l.place}, ${l.country}` }, { i: Clock, t: fmtDur(l.duration) },
    ...(l.scripture ? [{ i: BookOpen, t: l.scripture }] : []), { i: Languages, t: l.languages.map((x) => x.toUpperCase()).join(" · ") },
  ];
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-band">
        <PaisleyField className="text-saffron/[0.045]" />
        <Rosette className="spin-slow pointer-events-none absolute -right-24 -top-24 h-96 w-96 text-saffron/[0.09]" />
        <Container className="relative max-w-[1000px] py-10 sm:py-14">
          <Crumbs items={[{ href: "/teachings", label: "His Teachings" }, { href: "/teachings/audio", label: "Audio lectures" }, { label: l.date.slice(0, 4) }]} />
          <p className="mt-6 text-[14px] font-medium text-saffron">{l.type}{l.scripture ? ` on ${l.scripture}` : ""}</p>
          <h1 className="mt-1 text-[28px] leading-tight sm:text-[34px]">{l.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">
            {meta.map(({ i: I, t }) => <span key={t} className="flex items-center gap-1.5"><I size={15} className="text-saffron" />{t}</span>)}
          </div>
          <LectureHeroControls l={l} />
        </Container>
      </section>

      <Container className="grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px]">Transcription</h2>
            <div className="flex rounded-full border border-line bg-surface p-1 text-[13px]">
              {["English", "हिन्दी", "ଓଡ଼ିଆ", "Side by side"].map((x, i) => <span key={x} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-saffron text-white" : "text-ink-3"}`}>{x}</span>)}
            </div>
          </div>
          <div className="lg:pl-14"><Transcript l={l} /></div>
        </article>
        <aside className="space-y-5">
          <div className="card p-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3"><BookOpen size={14} />Verses cited</p>
            <ul className="mt-3 space-y-2 text-[14px]">{["Bhagavad-gītā 18.65–66", "Śrīmad-Bhāgavatam 1.2.6", "Śrīmad-Bhāgavatam 3.5.3", "Caitanya-caritāmṛta, Madhya 15.104"].map((v) => <li key={v}><Link href="/tattva/index/verses" className="text-saffron hover:underline">{v}</Link></li>)}</ul>
          </div>
          <div className="card p-5">
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3"><Tag size={14} />Topics</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{l.topics.map((t) => <Link key={t} href="/tattva/guru-tattva" className="rounded-full bg-band px-3 py-1 text-[13px] text-ink-2 hover:bg-saffron-soft hover:text-saffron">{t}</Link>)}</div>
          </div>
          <QuoteCard text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} />
          <div className="card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Cite this lecture</p>
            <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-2">Śrī Śrīmad Gour Govinda Swāmī Gurudeva, “{l.title}”, lecture, {l.place}, {fmtDate(l.date)}. Taptajīvanam archive.</p>
          </div>
        </aside>
      </Container>
      {related.length > 0 && (
        <Container className="max-w-[1200px]">
          <h2 className="mb-4 text-[21px]">More from {l.place}{l.scripture ? ` or on ${l.scripture}` : ""}</h2>
          <div className="card px-2">{related.map((r) => <LectureRow key={r.slug} l={r} />)}</div>
        </Container>
      )}
    </>
  );
}

/** A lecture from the Audio panel: real details, the transcription, quotes taken from it, and related lectures. */
async function RealLecture({ a }: { a: any }) {
  const l = toLecture(a);
  const [quotes, related] = await Promise.all([
    sql`select kind, slug, text, at_sec from excerpts where audio_id = ${a.id} and status = 'published' order by at_sec nulls last limit 30`.catch(() => [] as any[]),
    sql`select slug, title, kind, date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, transcript_status from audios where status = 'published' and id <> ${a.id} and ((place is not null and place = ${a.place}) or (series is not null and series = ${a.series}) or (scripture is not null and scripture = ${a.scripture} and chapter is not distinct from ${a.chapter})) order by date desc nulls last limit 5`.catch(() => [] as any[]),
  ]);
  const meta = [{ i: Calendar, t: l.date ? fmtDate(l.date) : a.date_note || "" }, { i: MapPin, t: [l.place, l.country].filter(Boolean).join(", ") }, { i: Clock, t: l.duration ? fmtDur(l.duration) : "" }, { i: BookOpen, t: l.scripture || "" }, { i: Languages, t: a.language || "" }].filter((m) => m.t);
  const ld = { "@context": "https://schema.org", "@type": "AudioObject", name: l.title, contentUrl: a.audio_url || undefined, uploadDate: l.date || undefined, duration: l.duration ? `PT${Math.floor(l.duration / 60)}M${l.duration % 60}S` : undefined, description: a.summary || undefined, locationCreated: l.place || undefined, inLanguage: a.language || undefined, creator: { "@type": "Person", name: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="relative overflow-hidden border-b border-line bg-band">
        <PaisleyField className="text-saffron/[0.045]" />
        <Rosette className="spin-slow pointer-events-none absolute -right-24 -top-24 h-96 w-96 text-saffron/[0.09]" />
        <Container className="relative max-w-[1000px] py-10 sm:py-14">
          <Crumbs items={[{ href: "/teachings", label: "His Teachings" }, { href: a.kind === "kirtan" || a.kind === "bhajan" ? "/teachings/kirtans" : "/teachings/audio", label: a.kind === "kirtan" || a.kind === "bhajan" ? "Kīrtanas & bhajanas" : "Audio lectures" }, ...(l.date ? [{ label: l.date.slice(0, 4) }] : [])]} />
          <p className="mt-6 text-[14px] font-medium text-saffron">{l.type}{l.scripture ? ` on ${l.scripture}` : ""}{a.occasion ? ` · ${a.occasion}` : ""}</p>
          <h1 className="mt-1 text-[28px] leading-tight sm:text-[34px]">{l.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">{meta.map(({ i: I, t }) => <span key={t} className="flex items-center gap-1.5"><I size={15} className="text-saffron" />{t}</span>)}</div>
          {a.summary && <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">{a.summary}</p>}
          <LectureHeroControls l={l} />
        </Container>
      </section>
      <Container className="grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <h2 className="mb-6 text-[22px]">{a.kind === "kirtan" || a.kind === "bhajan" ? "Words" : "Transcription"}</h2>
          {Array.isArray(a.transcript) && a.transcript.length ? <div className="reading"><Render doc={a.transcript} /></div> : <p className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-3">The transcription of this lecture is being prepared.</p>}
        </article>
        <aside className="space-y-5">
          {l.topics.length > 0 && <div className="card p-5"><p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3"><Tag size={14} />Topics</p><div className="mt-3 flex flex-wrap gap-1.5">{l.topics.map((t) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-band px-3 py-1 text-[13px] text-ink-2 hover:bg-saffron-soft hover:text-saffron">{t}</Link>)}</div></div>}
          {quotes.length > 0 && <div className="card p-5"><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">From this lecture</p><ul className="mt-3 space-y-3">{quotes.slice(0, 6).map((q: any) => <li key={q.slug}><Link href={`/teachings/quotes#${q.slug}`} className="block text-[14.5px] leading-relaxed text-ink hover:text-saffron">“{String(q.text).slice(0, 160)}{String(q.text).length > 160 ? "…" : ""}”</Link></li>)}</ul></div>}
          {a.series && <div className="card p-5"><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Series</p><Link href={`/teachings/audio?series=${encodeURIComponent(a.series)}`} className="mt-2 block font-medium text-saffron">{a.series}</Link></div>}
          <div className="card p-5"><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Cite this lecture</p><p className="mt-2 text-[15px] leading-relaxed text-ink-2">Śrī Śrīmad Gour Govinda Swāmī Gurudeva, “{l.title}”, {l.type.toLowerCase()}, {[l.place, l.date ? fmtDate(l.date) : a.date_note].filter(Boolean).join(", ")}. Taptajīvanam archive.</p></div>
        </aside>
      </Container>
      {related.length > 0 && <Container className="max-w-[1200px] pb-16"><h2 className="mb-4 text-[22px]">Related lectures</h2><div className="card px-2">{related.map((r: any) => <LectureRow key={r.slug} l={toLecture(r)} />)}</div></Container>}
    </>
  );
}
