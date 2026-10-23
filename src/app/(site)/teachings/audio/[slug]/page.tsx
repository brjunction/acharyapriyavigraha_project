import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, BookOpen, Tag, Languages, Clock } from "lucide-react";
import { LECTURES, fmtDate, fmtDur, QUOTE_OF_DAY } from "@/lib/data";
import { LectureHeroControls, Transcript, LectureRow } from "@/components/lecture";
import { Container, Crumbs, QuoteCard } from "@/components/ui";
import { PaisleyField, Rosette } from "@/components/motifs";

export function generateStaticParams() { return LECTURES.map((l) => ({ slug: l.slug })); }

export default async function LecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
          <h1 className="mt-1 text-[38px] leading-tight sm:text-[48px]">{l.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">
            {meta.map(({ i: I, t }) => <span key={t} className="flex items-center gap-1.5"><I size={15} className="text-saffron" />{t}</span>)}
          </div>
          <LectureHeroControls l={l} />
        </Container>
      </section>

      <Container className="grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[28px]">Transcription</h2>
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
            <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-2">Śrīla Gour Govinda Swāmī, “{l.title}”, lecture, {l.place}, {fmtDate(l.date)}. Taptajīvanam archive.</p>
          </div>
        </aside>
      </Container>
      {related.length > 0 && (
        <Container className="max-w-[1200px]">
          <h2 className="mb-4 text-[26px]">More from {l.place}{l.scripture ? ` or on ${l.scripture}` : ""}</h2>
          <div className="card px-2">{related.map((r) => <LectureRow key={r.slug} l={r} />)}</div>
        </Container>
      )}
    </>
  );
}
