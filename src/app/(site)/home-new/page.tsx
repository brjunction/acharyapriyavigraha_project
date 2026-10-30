import Link from "next/link";
import { Headphones, Clapperboard, BookOpen, FileText, Quote, Image as ImageIcon, NotebookPen, Network, ArrowRight, Search, type LucideIcon } from "lucide-react";
import { SITE, STATS } from "@/lib/data";

export const metadata = { title: "Home — new design (preview)", robots: { index: false, follow: false } };

const TOPICS = ["The Holy Name", "Guru-tattva", "Separation", "Mahāprabhu", "Humility", "Gopāl Jiu", "Vaiṣṇava etiquette", "Śrīmad-Bhāgavatam", "Hearing", "Service"];

const PILLARS: { href: string; icon: LucideIcon; title: string; text: string; n: string }[] = [
  { href: "/teachings/audio", icon: Headphones, title: "Listen", text: "Lectures and kīrtans, with transcriptions", n: `${STATS.lectures.toLocaleString()} recordings` },
  { href: "/teachings/transcriptions", icon: Clapperboard, title: "Watch", text: "Videos from the Taptajīvanam channel", n: `${STATS.videos}+ videos` },
  { href: "/books", icon: BookOpen, title: "Read", text: "Books you can read right here", n: `${STATS.books} books` },
  { href: "/teachings/articles", icon: FileText, title: "Articles", text: "Essays, compilations and magazines", n: "Articles & magazines" },
];

export default function HomeNew() {
  return (
    <div className="bg-white text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-saffron">Taptajīvanam</p>
            <h1 className="mt-4 text-[34px] leading-[1.1] tracking-[-0.03em] sm:text-[48px]" style={{ fontFamily: "var(--font-reading-serif)" }}>
              The words that give life<br className="hidden sm:block" /> to those who suffer.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2">
              An archive of the teachings of Śrīla Prabhupāda and his dear disciple Śrī Śrīmad Gour Govinda Swāmī Gurudeva — lectures, kīrtans, books, articles and photographs, all searchable, each with its source.
            </p>
            <form action="/search" className="mt-7 flex max-w-xl items-center gap-2 rounded-full border border-line-strong bg-white p-1.5 pl-5 shadow-sm focus-within:border-saffron">
              <Search size={18} className="text-saffron" />
              <input name="q" placeholder="Search a quote, a verse, a topic, a place…" className="h-11 flex-1 bg-transparent text-[14.5px] outline-none" />
              <button className="h-11 rounded-full bg-saffron px-6 text-[13.5px] font-medium text-white">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOPICS.slice(0, 6).map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-2 transition hover:border-saffron hover:text-saffron">{t}</Link>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-band">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/legacy/prabhupada.webp" alt="Śrīla Prabhupāda" className="h-full w-full object-cover object-top" />
            </div>
            <div className="absolute -bottom-6 -left-4 w-[44%] overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:-left-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/gurudeva-portrait.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="aspect-[4/5] w-full object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      {/* VERSE */}
      <section className="mx-auto max-w-3xl px-5 py-14 text-center">
        <p className="text-[24px] italic leading-snug sm:text-[30px]" style={{ fontFamily: "var(--font-reading-serif)", color: "#853500" }}>{SITE.verse}</p>
        <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-ink-2">{SITE.verseTranslation}</p>
        <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-3">{SITE.verseSource}</p>
      </section>

      {/* FOUR WAYS IN */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PILLARS.map(({ href, icon: I, title, text, n }) => (
            <Link key={title} href={href} className="group flex flex-col rounded-2xl border border-line p-4 transition hover:border-saffron hover:shadow-md sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-tint text-saffron"><I size={20} strokeWidth={1.7} /></span>
              <h3 className="mt-4 text-[17px] tracking-[-0.02em]">{title}</h3>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-2">{text}</p>
              <p className="mt-auto pt-4 text-[12px] font-medium text-saffron">{n} <ArrowRight size={13} className="inline transition group-hover:translate-x-0.5" /></p>
            </Link>
          ))}
        </div>
      </section>

      {/* GURUDEVA */}
      <section className="border-y border-line bg-[#fdf8f2]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[0.8fr_1.2fr]">
          <div className="aspect-[4/5] max-w-sm overflow-hidden rounded-[24px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/gurudeva-garland.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="h-full w-full object-cover object-top" />
          </div>
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-saffron">Gurudeva</p>
            <h2 className="mt-3 text-[26px] leading-tight tracking-[-0.025em] sm:text-[34px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Śrī Śrīmad Gour Govinda Swāmī Gurudeva</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">A dear disciple of Śrīla Prabhupāda, born near Purī into a family devoted to Śrī Gopāl Jiu. He carried his Guru’s mission across Odisha and the world through humble kīrtana, patient hearing and tireless preaching.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/gurudeva" className="rounded-full bg-saffron px-5 py-2.5 text-[13.5px] font-medium text-white">His life</Link>
              <Link href="/gurudeva/srila-prabhupada" className="rounded-full border border-line-strong px-5 py-2.5 text-[13.5px] font-medium text-ink hover:border-saffron hover:text-saffron">Śrīla Prabhupāda</Link>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {([
            ["/tattva", Network, "Explore by topic", "Each topic gathers quotes, lectures and verses in one place."],
            ["/teachings/quotes", Quote, "Quotes", "Searchable, with the source of every line."],
            ["/gurudeva/gallery", ImageIcon, "Photographs", "A gallery of rare and treasured images."],
          ] as [string, LucideIcon, string, string][]).map(([h, I, t, d]) => (
            <Link key={t} href={h} className="group flex gap-4 rounded-2xl border border-line p-5 transition hover:border-saffron">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron-tint text-saffron"><I size={20} strokeWidth={1.7} /></span>
              <span><span className="block text-[16px] font-medium">{t}</span><span className="mt-1 block text-[13px] leading-snug text-ink-2">{d}</span></span>
            </Link>
          ))}
        </div>
        <Link href="/gurudeva/diaries" className="group mt-4 flex items-center gap-4 rounded-2xl border border-line p-5 transition hover:border-saffron">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron-tint text-saffron"><NotebookPen size={20} strokeWidth={1.7} /></span>
          <span className="flex-1"><span className="block text-[16px] font-medium">Gurudeva’s diaries</span><span className="mt-1 block text-[13px] text-ink-2">His prayers to Śrī Gopāl Jiu</span></span>
          <ArrowRight size={16} className="text-saffron" />
        </Link>
      </section>

      {/* GRATITUDE */}
      <section className="border-t border-line py-14 text-center">
        <p className="mx-auto max-w-xl px-5 text-[15px] leading-relaxed text-ink-2">With gratitude to everyone who has recorded, preserved, transcribed and shared these teachings.</p>
        <Link href="/thank-list" className="mt-4 inline-block text-[13.5px] font-medium text-saffron">Read the thank list →</Link>
      </section>
    </div>
  );
}
