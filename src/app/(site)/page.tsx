import Link from "next/link";
import {
  BookOpen, Headphones, FileText, Clapperboard, Quote, Image as ImageIcon, CalendarDays, ArrowRight, HeartHandshake, Network, Mail, Heart, Gift,
  MapPin, ScrollText, Search as SearchIcon, type LucideIcon,
} from "lucide-react";
import { LECTURES, STATS } from "@/lib/data";
import { Hero, Featured, LifeTimeline, DiaryRail, QuotePanel, LangMarquee, WavePlayer } from "@/components/home-client";
import { TopicExplorer } from "@/components/topic-explorer";
import { Container } from "@/components/ui";
import { Orn, OrnMask, Padma, PaisleyField, Toran } from "@/components/motifs";
import { LectureRow } from "@/components/lecture";

function Head({ kicker, title, intro, action, acc = "saffron" }: { kicker: string; title: string; intro?: string; action?: { href: string; label: string }; acc?: string }) {
  return (
    <div className={`acc-${acc} mb-7 flex flex-wrap items-end justify-between gap-4`}>
      <div>
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><Padma className="h-4 w-4" layers={2} />{kicker}</p>
        <h2 className="mt-1.5 text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px]">{title}</h2>
        {intro && <p className="mt-1.5 max-w-xl text-[14px] text-ink-2">{intro}</p>}
      </div>
      {action && <Link href={action.href} className="group flex items-center gap-1 text-[13px] font-medium text-[var(--acc)]">{action.label}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>}
    </div>
  );
}

function Path({ acc, icon: I, title, text, links }: { acc: string; icon: LucideIcon; title: string; text: string; links: [string, string, string][] }) {
  return (
    <div className={`acc-${acc} card card-hover group relative flex flex-col overflow-hidden p-6`}>
      <Padma className="absolute -right-10 -top-10 h-40 w-40 text-[var(--acc)] opacity-[0.07] transition duration-700 group-hover:rotate-45 group-hover:opacity-[0.14]" />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-md)]" style={{ background: "linear-gradient(145deg, var(--acc), color-mix(in srgb, var(--acc) 60%, #000))" }}><I size={21} strokeWidth={1.7} /></span>
      <h3 className="relative mt-4 text-[18px] tracking-[-0.025em]">{title}</h3>
      <p className="relative mt-1 text-[13px] leading-relaxed text-ink-2">{text}</p>
      <ul className="relative mt-4 space-y-0.5 border-t border-line pt-3">
        {links.map(([h, l, d]) => (
          <li key={h}><Link href={h} className="group/l flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] transition hover:bg-acc-tint">
            <span><span className="font-medium text-ink group-hover/l:text-[var(--acc)]">{l}</span><span className="ml-2 text-[11.5px] text-ink-3">{d}</span></span>
            <ArrowRight size={13} className="text-[var(--acc)] opacity-0 transition group-hover/l:translate-x-0.5 group-hover/l:opacity-100" />
          </Link></li>
        ))}
      </ul>
    </div>
  );
}

function Bento({ href, acc, className = "", icon: I, title, desc, count, children }: { href: string; acc: string; className?: string; icon: LucideIcon; title: string; desc: string; count: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className={`bento acc-${acc} group flex flex-col p-6 text-white ${className}`} style={{ background: "linear-gradient(145deg, var(--acc), color-mix(in srgb, var(--acc) 58%, #000))" }}>
      <PaisleyField className="text-white/[0.08]" scale={0.6} />
      <Padma className="motif absolute -bottom-12 -right-12 -z-10 h-52 w-52 text-white opacity-[0.16]" />
      <I size={26} strokeWidth={1.4} />
      <h3 className="mt-3 text-[19px] tracking-[-0.025em] text-white">{title}</h3>
      <p className="mt-1 max-w-xs text-[12.5px] leading-snug text-white/80">{desc}</p>
      {children}
      <div className="mt-auto flex items-center justify-between pt-4 text-[12px]">
        <span className="rounded-full bg-white/18 px-2.5 py-1 font-medium backdrop-blur">{count}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/0 transition group-hover:bg-white group-hover:text-[var(--acc)]"><ArrowRight size={14} /></span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      {/* Highlights */}
      <section className="reveal relative mt-14">
        <Orn src="peacock" className="absolute right-[6%] top-[-18px] hidden h-40 md:block" />
        <Container>
          <Head kicker="Highlights" title="Where would you like to begin?" />
          <Featured />
        </Container>
      </section>

      {/* Four ways in */}
      <section className="reveal mt-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Path acc="teal" icon={Headphones} title="Listen" text="Hari-kathā in his own voice, from 1985 to 1996." links={[["/teachings/audio", "Audio lectures", "1,595"], ["/teachings/transcriptions", "Transcriptions", "130"], ["/teachings/videos", "Videos", "210"]]} />
            <Path acc="indigo" icon={BookOpen} title="Read" text="Books, letters and quotes, each with its source." links={[["/teachings/books", "Books", "48"], ["/gurudeva/letters", "Letters", "29"], ["/teachings/quotes", "Quotes", "44 subjects"]]} />
            <Path acc="gold" icon={Network} title="Explore" text="Follow a subject through everything he said on it." links={[["/tattva", "Tattva-kośa", "112 topics"], ["/tattva/index/verses", "By verse", "SB, BG, CC"], ["/tattva/index/places", "By place and year", ""]]} />
            <Path acc="rose" icon={Heart} title="Remember" text="Photographs, memories and glorifications." links={[["/gurudeva/gallery", "Gallery", "38 albums"], ["/gurudeva/memories", "Memories", ""], ["/gurudeva/glorifications", "Glorifications", ""]]} />
          </div>
        </Container>
      </section>

      {/* Today */}
      <section className="reveal mt-24">
        <Container>
          <Head kicker="For today" title="A quote, a diary, a date" intro="Something small to carry through the day." />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[1.15fr_1fr]">
            <QuotePanel />
            <div className="acc-leaf card flex flex-col p-7">
              <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--acc)]"><CalendarDays size={15} />This day in his life</span>
              <p className="mt-2 text-[40px] font-bold leading-none tracking-[-0.04em]">24 October</p>
              <ul className="mt-6 divide-y divide-line text-[14px] text-ink-2">
                {[["1993", "Lecture, Radhadesh", "/teachings/audio"], ["1991", "Letter to a disciple", "/gurudeva/letters"], ["1989", "14 photographs, Bhubaneswar", "/gurudeva/gallery"]].map(([y, t, h]) => (
                  <li key={y}><Link href={h} className="group flex items-center gap-4 py-3 transition hover:text-[var(--acc)]"><span className="w-12 text-[17px] font-bold tabular text-[var(--acc)]">{y}</span><span className="flex-1">{t}</span><ArrowRight size={14} className="opacity-0 transition group-hover:opacity-100" /></Link></li>
                ))}
              </ul>
              <Link href="/gurudeva/on-this-day" className="mt-auto inline-flex items-center gap-1 pt-5 text-[13px] font-medium text-[var(--acc)]">Pick another date<ArrowRight size={14} /></Link>
              <p className="mt-2 text-[11px] text-ink-3">Sample entries for the prototype</p>
            </div>
          </div>
          <div className="mt-12">
            <Head kicker="Daily Diary" title="Today and the days before" intro="Short videos from HH Haladhara Swāmī Mahārāja's channel, added automatically." action={{ href: "/gurudeva/diaries", label: "All diaries" }} acc="rose" />
            <DiaryRail />
          </div>
        </Container>
      </section>

      {/* Archive bento */}
      <section className="reveal relative mt-24 border-y border-line bg-band py-16">
        <Toran className="absolute inset-x-0 top-0 text-saffron/50" />
        <Container>
          <Head kicker="The archive" title="Everything he left us, in one place" action={{ href: "/teachings", label: "All teachings" }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[158px] lg:grid-cols-4">
            <Bento acc="teal" href="/teachings/audio" icon={Headphones} title="Audio lectures" desc="Search by year, place, verse and topic." count={`${STATS.lectures.toLocaleString()} lectures`} className="min-h-[220px] sm:col-span-2 lg:row-span-2">
              <div className="mt-5 hidden h-16 items-center gap-[3px] sm:flex">{Array.from({ length: 48 }, (_, i) => <span key={i} className="w-[3px] rounded-full bg-white/50" style={{ height: Math.round(10 + Math.abs(Math.sin(i * 0.6) * 24 + Math.sin(i * 0.2) * 12)) }} />)}</div>
            </Bento>
            <Bento acc="indigo" href="/teachings/books" icon={BookOpen} title="Books" desc="Read on the site, from three publishers." count={`${STATS.books} titles`} className="min-h-[200px] lg:row-span-2" />
            <Bento acc="gold" href="/teachings/transcriptions" icon={FileText} title="Transcriptions" desc="Text that follows the audio." count={`${STATS.transcriptions}`} className="min-h-[160px]" />
            <Bento acc="rose" href="/teachings/videos" icon={Clapperboard} title="Videos" desc="Lectures you can see." count={`${STATS.videos}`} className="min-h-[160px]" />
            <Bento acc="saffron" href="/teachings/quotes" icon={Quote} title="Quotes" desc="On people, tattvas and many subjects, each with its source." count={`${STATS.quoteCategories} subjects`} className="min-h-[160px] sm:col-span-2" />
            <Bento acc="leaf" href="/gurudeva/gallery" icon={ImageIcon} title="Images" desc="His pastimes in photographs." count={`${STATS.imageTags} albums`} className="min-h-[160px] sm:col-span-2" />
          </div>
        </Container>
        <Toran flip className="absolute inset-x-0 bottom-0 text-saffron/50" />
      </section>

      {/* Listen + recent */}
      <section className="reveal mt-24">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <Head kicker="Listen now" title="Featured lecture" acc="teal" />
            <WavePlayer />
            <div className="acc-indigo card mt-5 flex items-center gap-4 p-5">
              <span className="mega-ic !h-11 !w-11 !rounded-xl"><ScrollText size={20} strokeWidth={1.7} /></span>
              <div className="flex-1"><p className="text-[14px] font-semibold">Looking for a verse?</p><p className="text-[12.5px] text-ink-3">Type “SB 1.2.6” in search to find every lecture and quote on it.</p></div>
              <Link href="/tattva/index/verses" className="btn btn-ghost !h-9">Verse index</Link>
            </div>
          </div>
          <div>
            <Head kicker="Recently added" title="New in the archive" action={{ href: "/teachings/audio", label: "All lectures" }} acc="teal" />
            <div className="card px-2">{LECTURES.slice(0, 6).map((l) => <LectureRow key={l.slug} l={l} />)}</div>
          </div>
        </Container>
      </section>

      {/* Life */}
      <section className="reveal mt-24">
        <Container>
          <Head kicker="His life" title="From Jagannāthapura to Māyāpur" intro="Seven moments. Click a year, or move with the arrows." />
          <LifeTimeline />
        </Container>
      </section>

      {/* Subjects */}
      <section className="reveal relative mt-24">
        <Orn src="buta-garden" className="absolute right-[19%] top-[-34px] hidden h-40 lg:block" />
        <Container>
          <Head kicker="Tattva-kośa" title="Explore by subject" intro="Everything Śrīla Gurudeva said on each subject, gathered in one place." action={{ href: "/tattva", label: "Open Tattva-kośa" }} acc="indigo" />
          <TopicExplorer />
        </Container>
      </section>

      {/* Languages */}
      <section className="reveal mt-24">
        <Container><Head kicker="Translations" title="One teaching, many languages" intro="Each language is a site of its own, with its own pages, search and archive." action={{ href: "/translations", label: "All languages" }} acc="rose" /></Container>
        <LangMarquee />
      </section>

      {/* Gratitude */}
      <section className="reveal mt-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#592300] to-[#2f1407] px-6 py-14 text-center text-white sm:px-12">
            <PaisleyField className="text-white/[0.06]" scale={0.9} />
            <Orn src="mandala-gold" className="spin-slow absolute -left-28 -top-28 h-80 w-80 max-w-none opacity-30" />
            <Orn src="peacock-mandala" className="absolute -bottom-10 -right-6 hidden h-72 w-72 max-w-none opacity-90 sm:block" />
            <Orn src="mandala-plum" className="spin-slow absolute -bottom-28 -left-16 h-64 w-64 max-w-none opacity-25 sm:hidden" />
            <HeartHandshake size={28} strokeWidth={1.4} className="relative mx-auto text-[#f1d3a4]" />
            <p className="relative mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-white/90">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrīla Gour Govinda Swāmī.</p>
            <OrnMask src="border-5" repeat="repeat-x" size="auto 100%" className="relative mx-auto mt-6 h-5 max-w-xs text-[#e8b872]/70" />
            <Link href="/thank-list" className="btn relative mt-4 !h-11 bg-white !px-6 text-[#592300] hover:bg-[#f6ebe3]">Our Thank List<ArrowRight size={15} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
