/* Home page sections in the newer design: deep saffron and gold, Indian ornament, soft gradients and slow motion. The words are as before. */
import Link from "next/link";
import { ArrowRight, Headphones, Music2, Video, BookOpen, FileText, Newspaper, Quote, Network, Columns2, HandHeart, History, NotebookPen, HeartHandshake, Gift, Mail, ImageIcon, MapPin, Captions, Languages, Search as SearchIcon, Type } from "lucide-react";
import type { HomeLecture, HomeBook } from "@/components/home/sections";
import { THANKS } from "@/components/home/home-data";
import { TopicCloud } from "@/components/home/live";
import { VMask, Padma } from "@/components/motifs";
import { Lights, CountUp } from "./motion";

const W = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
const fmt = (s: number | null) => (s ? `${Math.floor(s / 60)} min` : "");

const Kicker = ({ children, light, center }: { children: React.ReactNode; light?: boolean; center?: boolean }) => (
  <p className={`flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] sm:text-[11px] ${center ? "justify-center" : ""} ${light ? "text-[#f3c77a]" : "text-saffron"}`}>
    <Padma className={`size-4 ${light ? "text-[#f3c77a]" : "text-saffron"}`} layers={2} />{children}
  </p>
);
const H2 = ({ children, light, className = "" }: { children: React.ReactNode; light?: boolean; className?: string }) =>
  <h2 className={`mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:mt-4 sm:text-[30px] lg:text-[36px] ${light ? "text-[#fff1da]" : "text-ink"} ${className}`}>{children}</h2>;
const Btn = ({ href, children, ghost, light }: { href: string; children: React.ReactNode; ghost?: boolean; light?: boolean }) => (
  <Link href={href} className={`group inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-semibold transition duration-300 hover:-translate-y-0.5 sm:h-11 ${ghost ? (light ? "border border-[#f3c77a]/40 text-[#fff1da] hover:border-[#f3c77a] hover:bg-white/5" : "border border-saffron/30 bg-white text-saffron-ink hover:border-saffron") : light ? "tv-flow text-[#2a0d03] shadow-[0_14px_30px_-14px_rgba(243,179,99,.8)]" : "bg-[linear-gradient(120deg,#a8430a,#853500_55%,#5e2200)] text-white shadow-[0_14px_30px_-14px_rgba(133,53,0,.8)]"}`}>
    {children}{!ghost && <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />}
  </Link>
);
/** A thin golden rule with a lotus at its centre. */
const Rule = ({ light }: { light?: boolean }) => (
  <div className="flex items-center justify-center gap-3" aria-hidden>
    <span className={`h-px w-14 bg-gradient-to-r from-transparent ${light ? "to-[#f3c77a]/70" : "to-saffron/50"}`} /><Padma className={`size-5 ${light ? "text-[#f3c77a]" : "text-saffron"}`} /><span className={`h-px w-14 bg-gradient-to-l from-transparent ${light ? "to-[#f3c77a]/70" : "to-saffron/50"}`} />
  </div>
);

export function ListenNew({ latest, lectures, kirtans, videos, transcripts }: { latest: HomeLecture[]; lectures: number; kirtans: number; videos: number; transcripts: number }) {
  return (
    <>
      {/* ───────── Listen ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#3d1305_0%,#2a0d03_55%,#1f0902_100%)] py-16 text-[#fff1da] sm:py-24">
        <Lights />
        <div aria-hidden className="tv-drift absolute -left-40 top-0 -z-10 size-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(243,179,99,.2),transparent)]" />
        <div className={`${W} grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16`}>
          <div className="reveal">
            <Kicker light>Hari-kathā in his own voice</Kicker>
            <H2 light>Listen, watch, and read along</H2>
            <p className="mt-4 max-w-[520px] text-[13.5px] leading-relaxed text-[#ffe9cc]/75 sm:text-[15px]">Lectures, darśanas and kīrtanas from 1985 to 1996, sorted by year, place, scripture and type — many with a full transcription you can follow as he speaks.</p>
            <ul className="mt-6 grid max-w-[520px] grid-cols-2 gap-x-4 gap-y-3 text-[12.5px] sm:text-[13.5px]">
              {([[MapPin, "By year and place"], [BookOpen, "By scripture"], [Captions, "Read along"], [Headphones, "Keep listening"]] as const).map(([I, t]) => <li key={t} className="flex items-center gap-2.5 text-[#ffe9cc]/90"><span className="flex size-7 items-center justify-center rounded-full bg-[#f3c77a]/15 text-[#f3c77a]"><I size={14} /></span>{t}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2.5"><Btn href="/teachings/audio" light>Audio lectures</Btn><Btn href="/teachings/kirtans" ghost light>Kīrtanas</Btn><Btn href="/teachings/videos" ghost light>Videos</Btn></div>
          </div>
          <div className="reveal tv-glass relative overflow-hidden rounded-[28px] p-5 sm:p-7">
            <div className="flex items-end gap-[3px] sm:gap-1" aria-hidden>
              {Array.from({ length: 44 }, (_, i) => <span key={i} className="tv-wave w-full rounded-full bg-gradient-to-t from-[#c2621d] to-[#ffd48a]" style={{ animationDelay: `${-((i * 37) % 23) / 10}s`, height: `${18 + ((i * 53) % 41)}px` }} />)}
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2 border-b border-[#f3b363]/15 pb-5 text-center">
              {([["Lectures", lectures], ["Kīrtanas", kirtans], ["Videos", videos], ["Texts", transcripts]] as const).map(([l, n]) => <div key={l}><p className="text-[18px] font-semibold tabular-nums text-white sm:text-[22px]"><CountUp to={n} /></p><p className="text-[9.5px] uppercase tracking-[0.14em] text-[#f3c77a]/80 sm:text-[10.5px]">{l}</p></div>)}
            </div>
            <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#f3c77a]">Recently added</p>
            {latest.length ? (
              <ul className="mt-2 divide-y divide-[#f3b363]/10">{latest.map((l) => (
                <li key={l.slug}><Link href={`/teachings/audio/${l.slug}`} className="group flex items-center gap-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f3c77a] text-[#2a0d03] transition group-hover:scale-105"><Headphones size={14} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-white">{l.title}</span><span className="block truncate text-[11.5px] text-[#ffe9cc]/55">{[l.date, l.place, fmt(l.duration_sec)].filter(Boolean).join(" · ")}</span></span>
                </Link></li>))}</ul>
            ) : <p className="mt-3 rounded-2xl border border-dashed border-[#f3b363]/25 px-4 py-6 text-center text-[12.5px] text-[#ffe9cc]/60">Lectures appear here as they are added.</p>}
          </div>
        </div>
      </section>
    </>
  );
}

export function BooksNew({ shelf }: { shelf: HomeBook[] }) {
  return (
    <>
      {/* ───────── Books ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(200deg,#4a1708_0%,#2a0d03_60%,#1f0902_100%)] py-16 text-[#fff1da] sm:py-24">
        <VMask name="paisley-red" repeat="repeat" size="380px" className="pointer-events-none absolute inset-0 -z-10 text-[#f3b363] opacity-[0.04]" />
        <div aria-hidden className="tv-drift absolute -right-40 bottom-0 -z-10 size-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(243,179,99,.18),transparent)]" />
        <div className={`${W} grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16`}>
          <div className="reveal relative order-2 lg:order-1">
            <div className="flex items-end justify-center gap-2 [perspective:1200px] sm:gap-3">
              {(shelf.length ? shelf.slice(0, 5) : Array.from({ length: 5 }, () => null)).map((b, i, arr) => {
                const mid = (arr.length - 1) / 2; const d = i - mid;
                return (
                  <Link key={b?.slug ?? i} href={b ? `/books/${b.slug}` : "/teachings/books"} className="tv-book group relative block w-[19%] max-w-[150px] shrink-0" style={{ ["--r" as any]: `${d * -8}deg`, ["--y" as any]: `${Math.abs(d) * 14}px`, zIndex: 10 - Math.abs(d) }}>
                    <span className="relative block aspect-[2/3] overflow-hidden rounded-[6px_12px_12px_6px] shadow-[0_30px_50px_-20px_rgba(0,0,0,.8)] ring-1 ring-black/20">
                      {b?.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover" loading="lazy" />
                        : <span className="flex h-full w-full flex-col items-center justify-between p-3 text-center" style={{ background: ["linear-gradient(160deg,#c2621d,#7a2a08)", "linear-gradient(160deg,#e8913c,#a8430a)", "linear-gradient(160deg,#f3c77a,#c2621d)", "linear-gradient(160deg,#a8430a,#5e2200)", "linear-gradient(160deg,#d9782a,#7a2a08)"][i % 5] }}>
                          <Padma className="mt-2 size-6 text-[#fff1da]/80" /><span className="text-[9px] font-semibold uppercase leading-tight tracking-[0.16em] text-[#fff1da]/85 sm:text-[10px]">Śrīla Gurudeva</span><span className="h-px w-8 bg-[#fff1da]/40" />
                        </span>}
                      <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
                    </span>
                  </Link>);
              })}
            </div>
            <div aria-hidden className="mx-auto mt-1 h-3 w-[92%] rounded-full bg-gradient-to-r from-transparent via-[#f3c77a]/40 to-transparent blur-[2px]" />
          </div>
          <div className="reveal order-1 lg:order-2">
            <Kicker light>Books</Kicker>
            <H2 light>Read his books, the way you like to read</H2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-[#ffe9cc]/75 sm:text-[15px]">Books to read right here, chapter by chapter — and the same book in other languages as translations are added.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-[12.5px] sm:text-[13.5px]">
              {([[BookOpen, "Four readers", "Classic, Focus, Pages, Side by side"], [Languages, "Every translation", "Switch language mid-chapter"], [SearchIcon, "Find in a book", "Any word, in any chapter"], [Type, "Made for reading", "Night colours, font size, bookmarks"]] as const).map(([I, t, d]) => (
                <li key={t} className="rounded-2xl bg-white/5 p-3 ring-1 ring-[#f3b363]/15 sm:p-4"><I size={16} className="text-[#f3c77a]" /><p className="mt-2 font-semibold text-white">{t}</p><p className="mt-0.5 text-[11.5px] leading-snug text-[#ffe9cc]/60 sm:text-[12.5px]">{d}</p></li>))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2.5"><Btn href="/teachings/books" light>Open the library</Btn><Btn href="/gurudeva/who-is-srila-gurudeva" ghost light>Books about him</Btn></div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TattvaNew({ topTopics }: { topTopics: { name: string; slug: string; total: number }[] }) {
  return (
    <>
      {/* ───────── Tattva ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffaf2,#fbf0dd)] py-16 sm:py-24">
        <VMask name="mandala-half-curve" className="pointer-events-none absolute -right-20 top-0 -z-10 h-[420px] w-[420px] text-[#853500] opacity-[0.05]" />
        <div className={W}>
          <div className="reveal mx-auto max-w-[680px] text-center">
            <Kicker center>Tattva</Kicker>
            <H2>Follow one subject through everything he said</H2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]">Open a topic — Guru-tattva, the Holy Name, separation — and find his quotes, lectures, videos and articles on it together, each with its exact source.</p>
          </div>
          <div className="reveal relative mx-auto mt-10 max-w-[900px] rounded-[28px] bg-[linear-gradient(140deg,#f3c77a,#e8913c_40%,rgba(232,145,60,.15)_70%,#f3c77a)] p-[1.5px] shadow-[0_34px_60px_-40px_rgba(120,60,10,.7)]">
            <VMask name="mandala-saffron" className="tv-spin-a pointer-events-none absolute -left-16 -top-16 size-40 text-[#e8913c] opacity-25 sm:-left-20 sm:-top-20 sm:size-52" />
            <div className="relative rounded-[27px] bg-white/95 p-5 backdrop-blur sm:p-8">
              <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-3"><Network size={13} className="text-saffron" />Open a topic</p>
              <TopicCloud topics={topTopics} />
            </div>
          </div>
          <div className="mx-auto mt-6 grid max-w-[900px] grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {([["/tattva", Network, "Topics A–Z"], ["/teachings/quotes", Quote, "Quotes"], ["/teachings/instructions", HandHeart, "Instructions & desires"], ["/search", SearchIcon, "Search everything"]] as const).map(([h, I, t]) => (
              <Link key={t} href={h} className="reveal group flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 text-[12.5px] font-medium text-ink ring-1 ring-[#efe2cb] transition hover:-translate-y-0.5 hover:ring-saffron/40 sm:text-[13.5px]"><I size={16} className="shrink-0 text-saffron" />{t}<ArrowRight size={13} className="ml-auto text-saffron/60 transition group-hover:translate-x-0.5" /></Link>))}
          </div>
        </div>
      </section>
    </>
  );
}

export function EverythingNew() {
  return (
    <>
      {/* ───────── Everything, in one place ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#f8d7a4_0%,#f3b363_55%,#e8913c_100%)] py-16 sm:py-24">
        <div aria-hidden className="tv-aurora-light absolute inset-0 -z-10" />
        <VMask name="paisley-red" repeat="repeat" size="380px" className="pointer-events-none absolute inset-0 -z-10 text-[#853500] opacity-[0.05]" />
        <div className={W}>
          <div className="reveal text-center"><p className="flex items-center justify-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-saffron-ink sm:text-[11px]"><Padma className="size-4 text-saffron-ink" layers={2} />On this website</p><H2>Everything, in one place</H2></div>
          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
            {([["/teachings/audio", Headphones, "Audio lectures", "By year, place, scripture and type, with transcriptions."], ["/teachings/kirtans", Music2, "Kīrtanas & bhajanas", "Songs he sang, by song, author and place."], ["/teachings/videos", Video, "Videos", "Every video from the channels, sorted for you."], ["/teachings/books", BookOpen, "Books", "Four readers, translations, search inside."], ["/teachings/articles", FileText, "Articles", "Essays and compilations by many authors."], ["/teachings/magazines", Newspaper, "Magazines", "Issues of the magazines, to read online."], ["/teachings/quotes", Quote, "Compilations", "Quotes, instructions, desires, verses and stories."], ["/tattva", Network, "Tattva", "Every subject, with everything said on it."], ["/webfolio", Columns2, "WebFolio", "The whole archive as one document — offline too."]] as const).map(([h, I, t, d], k) => (
              <Link key={h} href={h} className="reveal group relative flex flex-col gap-3 overflow-hidden rounded-[22px] bg-white/75 p-4 ring-1 ring-white/70 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_44px_-26px_rgba(90,30,0,.6)] sm:flex-row sm:gap-4 sm:p-5" style={{ transitionDelay: `${(k % 3) * 40}ms` }}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#c2621d,#853500)] text-white shadow-[0_10px_20px_-10px_rgba(133,53,0,.8)] transition duration-500 group-hover:rotate-[-6deg] sm:size-12"><I size={19} strokeWidth={1.7} /></span>
                <span><span className="block text-[13px] font-semibold text-ink sm:text-[15.5px]">{t}</span><span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-ink-2 sm:text-[13px]">{d}</span></span>
              </Link>))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ThanksNew() {
  return (
    <>
      {/* ───────── With gratitude ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffaf2,#fbf0dd)] py-16 sm:py-24">
        <div className={`${W} grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`}>
          <div className="reveal">
            <Kicker>With gratitude</Kicker>
            <H2>Our Thank List</H2>
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
            <div className="mt-8 flex flex-wrap gap-2.5"><Btn href="/thank-list">Read the Thank List</Btn><Btn href="/about/contact" ghost>Offer your service</Btn></div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {THANKS.map(([I, t, d], i) => (
              <div key={t} className="reveal group rounded-[20px] bg-white p-4 ring-1 ring-[#efe2cb] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_-24px_rgba(120,60,10,.55)] sm:p-5" style={{ transitionDelay: `${i * 40}ms` }}>
                <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#fde6c4,#f8d7a4)] text-saffron-ink transition group-hover:scale-105 sm:size-10"><I size={17} /></span>
                <p className="mt-3 text-[13px] font-semibold text-ink sm:text-[15px]">{t}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-3 sm:text-[13px]">{d}</p>
              </div>))}
          </div>
        </div>
      </section>
    </>
  );
}

