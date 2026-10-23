import Link from "next/link";
import { BookOpen, Headphones, PlayCircle, CalendarDays, Clapperboard, ScrollText, Image as ImageIcon, Heart, Clock, Mail } from "lucide-react";
import { IMG, LECTURES, LANGUAGES, QUOTE_OF_DAY, SITE, STATS, TATTVA, DIARY } from "@/lib/data";
import { Img } from "@/components/chrome";
import { Block, Section, QuoteCard, Chip } from "@/components/ui";
import { LectureRow } from "@/components/lecture";
import { HeroSearch } from "./hero-search";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--gold-soft),transparent_60%),radial-gradient(ellipse_at_bottom_left,var(--saffron-soft),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron">Hare Kṛṣṇa · Welcome</p>
            <h1 className="mt-4 font-serif text-[44px] leading-[1.05] text-ink sm:text-6xl">
              The teachings of<br /><span className="text-maroon">Śrīla Gurudeva</span>
            </h1>
            <p className="mt-3 font-serif text-xl text-ink-2">Śrī Śrīmad Gour Govinda Swāmī</p>
            <p className="mt-6 font-serif text-[22px] italic text-gold">{SITE.verse}</p>
            <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-ink-2">{SITE.verseTranslation}</p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap gap-2 text-[13px] text-ink-3">
              Try: <Chip href="/search?q=holy+name">holy name</Chip><Chip href="/search?q=SB+1.2.6">SB 1.2.6</Chip><Chip href="/search?q=gopal+jiu">gopal jiu</Chip><Chip href="/search?q=bhubaneswar+1993">bhubaneswar 1993</Chip>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-4 rounded-[2.5rem] border border-gold/40" />
            <div className="overflow-hidden rounded-[2rem] border border-line bg-card shadow-2xl">
              <Img src={IMG.ggs} alt="Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl border border-line bg-card/95 px-5 py-3 text-center shadow-lg backdrop-blur">
              <p className="text-[12px] uppercase tracking-[0.18em] text-ink-3">The archive holds</p>
              <p className="font-serif text-lg">{STATS.lectures.toLocaleString()} lectures · {STATS.transcriptions} transcriptions · {STATS.books} books</p>
            </div>
          </div>
        </div>
      </section>

      {/* TODAY */}
      <Section title="Today" sub="Saturday, 24 October 2026" className="mt-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1"><QuoteCard text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} place={QUOTE_OF_DAY.place} /></div>
          <Link href="/gurudeva/diaries" className="group relative flex min-h-64 overflow-hidden rounded-2xl border border-line bg-ink text-paper shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={64} strokeWidth={1.2} className="text-white/80 transition group-hover:scale-110" /></div>
            <div className="relative mt-auto p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#ecd59b]">Daily Diary · YouTube Short</p>
              <p className="mt-1 font-serif text-2xl text-white">{DIARY[0].title}</p>
              <p className="text-sm text-white/70">From HH Haladhara Swāmī Mahārāja&apos;s channel</p>
            </div>
          </Link>
          <Link href="/gurudeva/timeline" className="group flex flex-col rounded-2xl border border-line bg-gradient-to-br from-tulasi-soft to-card p-6 shadow-sm hover:border-gold">
            <CalendarDays className="text-tulasi" strokeWidth={1.6} />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-3">This day in his life · 24 October · sample</p>
            <ul className="mt-3 space-y-3 text-[15px]">
              <li><span className="font-serif text-lg text-tulasi">1993</span> · Lecture in Radhadesh, Belgium</li>
              <li><span className="font-serif text-lg text-tulasi">1991</span> · Letter to a disciple</li>
              <li><span className="font-serif text-lg text-tulasi">1989</span> · 14 photos, Bhubaneswar</li>
            </ul>
            <span className="mt-auto pt-4 text-sm font-medium text-saffron">See all 366 days →</span>
          </Link>
        </div>
      </Section>

      {/* PILLARS */}
      <Section title="His Teachings" sub="Every word, sourced and searchable" action={{ href: "/teachings", label: "All teachings" }} className="mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          <Block size="l" href="/soon?t=Books" icon={BookOpen} tone="maroon" title="Books" desc="Read online, browse by publisher, download where permitted." count={`${STATS.books} books & magazines`} />
          <Block size="l" href="/teachings/audio" icon={Headphones} tone="saffron" title="Audio" desc="Lectures from 1985 to 1996 with synchronized transcriptions." count={`${STATS.lectures.toLocaleString()} lectures · ${STATS.transcriptions} transcribed`} />
          <Block size="l" href="/soon?t=Videos" icon={Clapperboard} tone="tulasi" title="Videos" desc="Lectures on video, excerpts, memories and kīrtanas." count={`${STATS.videos} videos`} />
        </div>
      </Section>

      {/* TOPICS */}
      <Section title="Explore by topic" sub="The Tattva-kośa gathers everything he said on each subject" action={{ href: "/tattva", label: "Open Tattva-kośa" }} className="mt-20">
        <div className="flex flex-wrap gap-2.5">
          {TATTVA.flatMap((t) => t.children.slice(0, 2).map((c) => (
            <Link key={c} href={`/tattva/${t.slug}`} className="rounded-full border border-line bg-card px-4 py-2 font-serif text-[17px] text-ink-2 transition hover:border-gold hover:bg-gold-soft hover:text-ink">{c}</Link>
          )))}
        </div>
      </Section>

      {/* GURUDEVA */}
      <Section title="Śrīla Gurudeva" sub="His life, his diaries, his letters and his mission" action={{ href: "/gurudeva", label: "Open" }} className="mt-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Block href="/gurudeva/timeline" icon={Clock} title="Life timeline" desc="1929 to 1996, year by year." tone="gold" />
          <Block href="/gurudeva/letters" icon={Mail} title="Letters" desc="With Śrīla Prabhupāda and others." count={`${STATS.letters} letters`} tone="maroon" />
          <Block href="/gurudeva/gallery" icon={ImageIcon} title="Gallery" desc="Portraits, deities, festivals, travels." count={`${STATS.imageTags} albums`} tone="tulasi" />
          <Block href="/soon?t=Memories" icon={Heart} title="Memories" desc="Disciples remembering him." tone="saffron" />
        </div>
      </Section>

      {/* RECENT */}
      <Section title="Recently added" action={{ href: "/teachings/audio", label: "All lectures" }} className="mt-20">
        <div className="rounded-2xl border border-line bg-card/50 p-2">{LECTURES.slice(0, 5).map((l) => <LectureRow key={l.slug} l={l} />)}</div>
      </Section>

      {/* LANGUAGES */}
      <Section title="In your language" sub="Translations are in progress in many languages" action={{ href: "/translations", label: "Translations" }} className="mt-20">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {LANGUAGES.map((l) => (
            <Link key={l.code} href="/translations" className="rounded-xl border border-line bg-card p-4 hover:border-gold">
              <p className="font-serif text-xl">{l.native}</p><p className="text-xs text-ink-3">{l.name}</p>
              <div className="mt-3 h-1.5 rounded-full bg-paper-2"><div className="h-full rounded-full bg-tulasi" style={{ width: `${l.ui}%` }} /></div>
            </Link>
          ))}
        </div>
      </Section>

      {/* GRATITUDE */}
      <section className="mx-auto mt-20 max-w-4xl px-4 text-center sm:px-6">
        <ScrollText className="mx-auto text-gold" strokeWidth={1.4} size={32} />
        <h2 className="mt-3 font-serif text-3xl">With gratitude</h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink-2">This archive is built by disciples, grand-disciples, followers and admirers of Śrīla Gurudeva across Asia, Europe and the Americas, under the guidance of HH Haladhara Swāmī Mahārāja, founder of Taptajīvanam.</p>
        <Link href="/thank-list" className="mt-5 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-medium text-paper hover:opacity-90">Read our Thank List</Link>
      </section>
    </>
  );
}
