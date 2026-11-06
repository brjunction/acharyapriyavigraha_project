/* A second design of the home page, shown at /home-v2 for review. The words are the same as on the home page; only the design is new:
   a deep saffron dusk and gold, Indian ornament, soft gradients and slow motion, light and dark sections taking turns. */
import Link from "next/link";
import { ArrowRight, Headphones, Music2, Video, BookOpen, FileText, Newspaper, Quote, Network, Columns2, HandHeart, History, NotebookPen, HeartHandshake, Gift, Mail, ImageIcon, MapPin, Captions, Languages, Search as SearchIcon, Type } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
import { STATS } from "@/lib/data";
import { topics as getTopics } from "@/lib/content/topics";
import { ThreeThings, OnPrabhupada } from "@/components/gurudeva-instructions";
import { WebFolioSection, type HomeLecture, type HomeBook } from "@/components/home/sections";
import { FOUNDER_STEPS, THANKS } from "@/components/home/home-data";
import { BlessingLetters, TopicCloud } from "@/components/home/live";
import { VMask, Padma } from "@/components/motifs";
import { V2Hero } from "./v2-hero";
import { Lights, CountUp } from "./v2-motion";

const one = async (q: Promise<any[]>) => { try { return Number((await q)[0]?.n || 0); } catch { return 0; } };
const rows = async <T,>(q: Promise<any[]>) => { try { return (await q) as T[]; } catch { return [] as T[]; } };
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

export async function V2Home() {
  const db = hasDb();
  const [lectures, kirtans, videos, transcripts, books, quotes, latest, shelf, tps] = await Promise.all([
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan')`) : STATS.lectures,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind in ('kirtan','bhajan')`) : 0,
    db ? one(sql`select count(*)::int n from videos where status = 'published'`) : STATS.videos,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and transcript_status = 'done'`) : STATS.transcriptions,
    db ? one(sql`select count(*)::int n from books where status = 'published'`) : STATS.books,
    db ? one(sql`select count(*)::int n from excerpts where status = 'published'`) : 0,
    db ? rows<HomeLecture>(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date, place, duration_sec, transcript_status from audios where status = 'published' and kind not in ('kirtan','bhajan') order by created_at desc limit 5`) : [],
    db ? rows<HomeBook>(sql`select slug, title, cover_url, language from books where status = 'published' order by position, title limit 6`) : [],
    getTopics().catch(() => []),
  ]);
  const topTopics = [...tps].sort((a, b) => b.total - a.total).slice(0, 22).map((t) => ({ name: t.name, slug: t.slug, total: t.total }));
  const stats = [{ n: lectures, label: "Lectures" }, { n: kirtans, label: "Kīrtanas" }, { n: videos, label: "Videos" }, { n: transcripts, label: "Transcriptions" }, { n: books, label: "Books" }, { n: quotes || tps.length, label: quotes ? "Compilations" : "Topics" }];

  return (
    <div className="tv-home">
      <V2Hero stats={stats} />

      {/* ───────── Kṛṣṇa sent him ───────── */}
      <section id="v2-next" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffaf2_0%,#fbf0dd_100%)] py-16 sm:py-24">
        <VMask name="mandala-saffron" className="tv-spin-slow pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[900px] -translate-x-1/2 -translate-y-1/2 text-[#853500] opacity-[0.045]" />
        <div className={`${W} grid grid-cols-2 items-end gap-x-3 gap-y-8 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:items-center lg:gap-x-10`}>
          {([["/legacy/prabhupada.webp", "Śrīla A.C. Bhaktivedanta Swami Prabhupāda", "order-2 lg:order-1", "tv-from-left"], ["/legacy/gurudeva.webp", "Śrī Śrīmad Gour Govinda Swāmī Gurudeva", "order-3", "tv-from-right"]] as const).map(([src, alt, o, a]) => (
            <figure key={src} className={`reveal relative mx-auto w-full max-w-[170px] sm:max-w-[260px] ${o}`}>
              <span aria-hidden className="tv-halo absolute left-1/2 top-[44%] -z-10 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <span aria-hidden className="tv-spin-a absolute left-1/2 top-[44%] -z-10 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-saffron/25" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={`${a} relative block w-full object-contain`} loading="lazy" />
            </figure>
          ))}
          <div className="reveal order-1 col-span-2 text-center lg:order-2 lg:col-span-1">
            <Kicker center>Śrīla Prabhupāda on Śrīla Gurudeva</Kicker>
            <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[54px]"><span className="tv-ink-gold">“Kṛṣṇa sent him.”</span></h2>
            <p className="mt-2 text-[12px] text-ink-3 sm:text-[12.5px]">Room conversation · Bombay, 5 January 1977</p>
            <div className="my-7"><Rule /></div>
            <p className="mx-auto max-w-lg text-[15px] font-medium leading-relaxed text-ink-2 sm:text-[17px]">“Krishna is with you and there is no need of disappointment.”</p>
            <p className="mt-1.5 text-[12px] text-ink-3 sm:text-[12.5px]">Śrīla Prabhupāda’s letter to Śrīla Gurudeva · Māyāpur, 12 February 1976</p>
            <BlessingLetters />
          </div>
        </div>
      </section>

      {/* ───────── Śrīla Gurudeva’s mission ───────── */}
      <ThreeThings bg="#2a0d03" glow="#f3b363" accent="#f3c77a" />

      {/* ───────── Śrīla Gurudeva ───────── */}
      <section className="relative isolate overflow-hidden bg-white py-16 sm:py-24">
        <div aria-hidden className="tv-drift absolute -right-40 top-10 -z-10 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(243,179,99,.22),transparent)]" />
        <div className={`${W} grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16`}>
          <div className="reveal relative mx-auto w-full max-w-[400px]">
            {/* an arch, as at a temple door */}
            <div className="relative rounded-t-[999px] rounded-b-[28px] bg-[linear-gradient(160deg,#f3c77a,#c2621d_45%,#7a2a08)] p-[6px] shadow-[0_40px_80px_-40px_rgba(90,30,0,.7)]">
              <div className="overflow-hidden rounded-t-[999px] rounded-b-[23px] bg-[#fbf0dd]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photos/gurudeva-marigold.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="block aspect-[931/1240] w-full object-cover object-top" loading="lazy" />
              </div>
            </div>
            <VMask name="crest-gold" className="absolute -top-7 left-1/2 h-14 w-28 -translate-x-1/2 text-[#c98a2b]" />
            <div className="absolute -bottom-6 -right-3 w-[38%] rotate-[4deg] rounded-2xl bg-white p-1.5 shadow-[0_24px_40px_-20px_rgba(0,0,0,.5)] sm:-right-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/gurudeva-writing.webp" alt="" className="aspect-[16/10] w-full rounded-xl object-cover" loading="lazy" />
            </div>
          </div>
          <div className="reveal">
            <Kicker>Śrīla Gurudeva</Kicker>
            <H2>A dear disciple of Śrīla Prabhupāda</H2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]">Born in a family devoted to Śrī Gopāl Jiu, he carried his Guru’s mission across Odisha and the world. Here his life is remembered — by those who knew him, in his own diary, and in photographs.</p>
            <div className="mt-7 grid grid-cols-2 gap-2 sm:gap-2.5">
              {([["/gurudeva/who-is-srila-gurudeva", HandHeart, "Who is Śrīla Gurudeva"], ["/gurudeva/timeline", History, "Life timeline"], ["/gurudeva/diaries", NotebookPen, "His diary to Śrī Gopāl Jiu"], ["/gurudeva/memories", HeartHandshake, "Memories & pastimes"], ["/gurudeva/glorifications", Gift, "Glorifications"], ["/gurudeva/letters", Mail, "Letters"], ["/gurudeva/gallery", ImageIcon, "Gallery"], ["/gurudeva/places-of-remembrance", MapPin, "Places of remembrance"]] as const).map(([h, I, l]) => (
                <Link key={h} href={h} className="group flex items-center gap-2.5 rounded-2xl bg-[#fbf5ec] px-3 py-2.5 text-[12.5px] font-medium text-ink ring-1 ring-[#efe2cb] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_-18px_rgba(120,60,10,.55)] hover:ring-saffron/40 sm:px-3.5 sm:text-[13.5px]">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-saffron ring-1 ring-[#efe2cb] transition group-hover:bg-saffron group-hover:text-white"><I size={15} /></span>
                  <span className="min-w-0 flex-1 leading-tight">{l}</span>
                </Link>))}
            </div>
          </div>
        </div>
      </section>

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

      {/* ───────── Everything is in Śrīla Prabhupāda’s books ───────── */}
      <OnPrabhupada />

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

      {/* ───────── Tattva ───────── */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffaf2,#fbf0dd)] py-16 sm:py-24">
        <VMask name="mandala-half-curve" className="pointer-events-none absolute -right-20 top-0 -z-10 h-[420px] w-[420px] text-[#853500] opacity-[0.05]" />
        <div className={W}>
          <div className="reveal mx-auto max-w-[680px] text-center">
            <Kicker center>Tattva</Kicker>
            <H2>Follow one subject through everything he said</H2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]">Open a topic — Guru-tattva, the Holy Name, separation — and find his quotes, lectures, videos and articles on it together, each with its exact source.</p>
          </div>
          <div className="reveal mx-auto mt-10 max-w-[900px] rounded-[28px] bg-white/80 p-5 shadow-[0_30px_60px_-40px_rgba(120,60,10,.5)] ring-1 ring-[#efe2cb] backdrop-blur sm:p-8">
            <TopicCloud topics={topTopics} />
          </div>
          <div className="mx-auto mt-6 grid max-w-[900px] grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {([["/tattva", Network, "Topics A–Z"], ["/teachings/quotes", Quote, "Quotes"], ["/teachings/instructions", HandHeart, "Instructions & desires"], ["/search", SearchIcon, "Search everything"]] as const).map(([h, I, t]) => (
              <Link key={t} href={h} className="reveal group flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 text-[12.5px] font-medium text-ink ring-1 ring-[#efe2cb] transition hover:-translate-y-0.5 hover:ring-saffron/40 sm:text-[13.5px]"><I size={16} className="shrink-0 text-saffron" />{t}<ArrowRight size={13} className="ml-auto text-saffron/60 transition group-hover:translate-x-0.5" /></Link>))}
          </div>
        </div>
      </section>

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

      {/* ───────── How Taptajīvanam began ───────── */}
      <section className="relative isolate overflow-hidden bg-white py-16 sm:py-24">
        <div className={`${W} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16`}>
          <div className="reveal lg:sticky lg:top-24 lg:self-start">
            <Kicker>The founder</Kicker>
            <H2>How Taptajīvanam began</H2>
            <figure className="relative mx-auto mt-8 max-w-[340px] lg:mx-0">
              <div className="rounded-[26px] bg-[linear-gradient(140deg,#f3c77a,#c2621d_45%,#7a2a08)] p-[5px] shadow-[0_30px_60px_-30px_rgba(90,30,0,.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="block aspect-square w-full rounded-[21px] object-cover object-top" loading="lazy" />
              </div>
              <figcaption className="absolute inset-x-5 -bottom-6 rounded-2xl bg-white/95 px-4 py-3 text-center shadow-[0_16px_34px_-18px_rgba(0,0,0,.4)] ring-1 ring-[#efe2cb] backdrop-blur">
                <p className="text-[14.5px] font-semibold text-ink sm:text-[15.5px]">Śrīla Haladhara Swāmī Guru Mahārāja</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">Founder of Taptajīvanam</p>
              </figcaption>
            </figure>
            <p className="mt-12 text-[13px] leading-relaxed text-ink-2 sm:text-[14px]">ISKCON Guru and Sannyāsī — he travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
            <Link href="/about/founder" className="group mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-saffron">Read his biography<ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></Link>
          </div>
          <ol className="relative">
            <span aria-hidden className="absolute bottom-8 left-[23px] top-8 w-px bg-gradient-to-b from-[#f3c77a] via-[#c2621d]/50 to-[#f3c77a] sm:left-[29px]" />
            {FOUNDER_STEPS.map(([y, t, d], i) => (
              <li key={y} className="reveal relative flex gap-4 pb-4 last:pb-0 sm:gap-6 sm:pb-5">
                <span className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums sm:size-[60px] sm:text-[12.5px] ${i === 3 ? "tv-flow text-[#2a0d03] shadow-[0_10px_24px_-8px_rgba(194,98,29,.8)]" : "bg-white text-saffron ring-1 ring-[#efe2cb]"}`}>{y}</span>
                <div className={`flex-1 rounded-[20px] p-4 transition duration-300 hover:-translate-y-0.5 sm:p-5 ${i === 3 ? "bg-[linear-gradient(135deg,#fff6e4,#fde6c4)] ring-1 ring-[#f3c77a]" : "bg-[#fbf7f0] ring-1 ring-[#f1e6d3] hover:bg-white hover:shadow-[0_16px_30px_-22px_rgba(120,60,10,.5)]"}`}>
                  <p className="text-[13.5px] font-semibold text-ink sm:text-[15.5px]">{t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2 sm:text-[13.5px]">{d}</p>
                </div>
              </li>))}
          </ol>
        </div>
      </section>

      {/* ───────── WebFolio ───────── */}
      <WebFolioSection />

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
        <div className="mt-14"><Rule /></div>
      </section>
    </div>
  );
}
