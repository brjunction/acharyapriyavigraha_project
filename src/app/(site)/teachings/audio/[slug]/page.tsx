import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, BookOpen, Tag, Languages, ChevronRight } from "lucide-react";
import { LECTURES, fmtDate, QUOTE_OF_DAY } from "@/lib/data";
import { LectureHeroControls, Transcript, LectureRow } from "@/components/lecture";
import { QuoteCard } from "@/components/ui";

export function generateStaticParams() { return LECTURES.map((l) => ({ slug: l.slug })); }

export default async function LecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = LECTURES.find((x) => x.slug === slug);
  if (!l) notFound();
  const related = LECTURES.filter((x) => x.slug !== l.slug && (x.place === l.place || x.scripture === l.scripture)).slice(0, 4);
  return (
    <>
      <div className="border-b border-line bg-gradient-to-b from-paper-2 to-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <nav className="flex items-center gap-1 text-[13px] text-ink-3">
            <Link href="/teachings" className="hover:text-ink">His Teachings</Link><ChevronRight size={13} />
            <Link href="/teachings/audio" className="hover:text-ink">Audio</Link><ChevronRight size={13} /><span>{l.date.slice(0, 4)}</span>
          </nav>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{l.type}{l.scripture ? ` · ${l.scripture}` : ""}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{l.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
            <span className="flex items-center gap-1.5"><Calendar size={15} className="text-ink-3" />{fmtDate(l.date)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={15} className="text-ink-3" />{l.place}, {l.country}</span>
            {l.scripture && <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-ink-3" />{l.scripture}</span>}
            <span className="flex items-center gap-1.5"><Languages size={15} className="text-ink-3" />{l.languages.map((x) => x.toUpperCase()).join(" · ")}</span>
          </div>
          <LectureHeroControls l={l} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px]">
        <article>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Transcription</h2>
            <div className="flex rounded-full border border-line bg-card p-1 text-[13px]">
              <span className="rounded-full bg-paper-2 px-3 py-1 font-medium">English</span><span className="px-3 py-1 text-ink-3">हिन्दी</span><span className="px-3 py-1 text-ink-3">ଓଡ଼ିଆ</span><span className="px-3 py-1 text-ink-3">Side by side</span>
            </div>
          </div>
          <p className="mb-6 rounded-xl bg-gold-soft px-4 py-3 text-[13px] text-ink-2">Tip: click any paragraph to hear it. The highlighted paragraph follows the audio.</p>
          <div className="lg:pl-12"><Transcript l={l} /></div>
        </article>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3"><BookOpen size={14} />Verses cited</p>
            <ul className="mt-3 space-y-1.5 text-sm">{["Bhagavad-gītā 18.65–66", "Śrīmad-Bhāgavatam 1.2.6", "Śrīmad-Bhāgavatam 3.5.3", "Caitanya-caritāmṛta Madhya 15.104"].map((v) => <li key={v}><Link href="/search?q=SB+1.2.6" className="text-tulasi hover:underline">{v}</Link></li>)}</ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3"><Tag size={14} />Topics</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{l.topics.map((t) => <Link key={t} href="/tattva/guru-tattva" className="rounded-full bg-paper-2 px-2.5 py-1 text-[13px] hover:bg-gold-soft">{t}</Link>)}</div>
          </div>
          <QuoteCard text={QUOTE_OF_DAY.text} source="Quote from the archive" />
          <div className="rounded-2xl border border-line bg-card p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Cite this lecture</p>
            <p className="mt-2 font-serif text-[15px] text-ink-2">Śrīla Gour Govinda Swāmī, “{l.title},” lecture, {l.place}, {fmtDate(l.date)}. Taptajīvanam archive.</p>
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-3 font-serif text-2xl">More from {l.place} or on {l.scripture ?? "this subject"}</h2>
          <div className="rounded-2xl border border-line bg-card/50 p-2">{related.map((r) => <LectureRow key={r.slug} l={r} />)}</div>
        </section>
      )}
    </>
  );
}
