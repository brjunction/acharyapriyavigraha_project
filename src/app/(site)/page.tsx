import Link from "next/link";
import { BookOpen, Headphones, FileText, Clapperboard, Quote, Image as ImageIcon, PlayCircle, CalendarDays, ArrowRight, HeartHandshake } from "lucide-react";
import { IMG, LECTURES, LANGUAGES, QUOTE_OF_DAY, STATS, DIARY } from "@/lib/data";
import { BannerCarousel, HeroSearch } from "@/components/home-client";
import { TopicExplorer } from "@/components/topic-explorer";
import { ArchiveTile, Container, Img, SectionHead } from "@/components/ui";
import { FlowerBand, Ornament, PaisleyField, Rosette } from "@/components/motifs";
import { LectureRow } from "@/components/lecture";

function Portrait({ src, name, text, href }: { src: string; name: string; text: string; href: string }) {
  return (
    <Link href={href} className="group text-center">
      <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64">
        <Rosette className="spin-slow absolute inset-0 h-full w-full text-saffron/25" />
        <div className="absolute inset-[18px] overflow-hidden rounded-full border-4 border-surface shadow-[var(--shadow-lg)] transition duration-500 group-hover:scale-[1.03]">
          <Img src={src} alt={name} className="h-full w-full object-cover" />
        </div>
      </div>
      <h3 className="mt-5 text-[26px] group-hover:text-saffron">{name}</h3>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-2">{text}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-saffron">Read more<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <BannerCarousel />
      <HeroSearch />

      {/* Welcome */}
      <section className="reveal pt-20 sm:pt-24">
        <Container>
          <SectionHead title="Hare Kṛṣṇa, welcome" intro="This is the archive of Śrīla Gour Govinda Swāmī, a disciple of the founder-ācārya of ISKCON, Śrīla Prabhupāda, and a representative of the Brahma-Madhva-Gauḍīya sampradāya." />
          <div className="mx-auto grid max-w-4xl gap-14 sm:grid-cols-2">
            <Portrait src={IMG.sp} name="Śrīla Prabhupāda" href="/gurudeva/srila-prabhupada" text="Founder-ācārya of ISKCON, who opened 108 centres around the world and gave Śrīla Gurudeva the order to build a temple in Bhubaneswar." />
            <Portrait src={IMG.ggs} name="Śrīla Gurudeva" href="/gurudeva" text="Born in 1929 in Jagannāthapura near Purī, into the Giri family of Gaḍeigiri, devotees of Śrī Gopāl Jiu for generations." />
          </div>
        </Container>
      </section>

      {/* Today */}
      <section className="reveal mt-24">
        <Container>
          <SectionHead align="left" title="For today" intro="A quote, a daily diary and this date in Śrīla Gurudeva's life." />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[1.35fr_1fr_1fr]">
            <figure className="card relative overflow-hidden p-8 sm:p-10">
              <Rosette className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 text-saffron/[0.07]" />
              <p className="text-[13px] font-medium text-saffron">Quote of the day</p>
              <blockquote className="relative mt-4 font-serif text-[27px] leading-snug text-ink sm:text-[31px]">“{QUOTE_OF_DAY.text}”</blockquote>
              <figcaption className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
                <span className="text-[14px] leading-relaxed text-ink-2"><span className="font-semibold text-ink">Śrīla Gurudeva</span><br />{QUOTE_OF_DAY.source}, {QUOTE_OF_DAY.date}, {QUOTE_OF_DAY.place}</span>
                <Img src={IMG.sign} alt="Signature of Śrīla Gurudeva" className="h-10 w-auto opacity-80 dark:invert" fallback="" />
              </figcaption>
            </figure>
            <Link href="/gurudeva/diaries" className="group relative flex min-h-72 flex-col overflow-hidden rounded-[14px] bg-[#2f2622] p-7 text-white">
              <PaisleyField className="text-white/[0.05]" scale={0.7} />
              <span className="relative text-[13px] font-medium text-[#e9b8a6]">Daily Diary</span>
              <span className="relative mt-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur transition group-hover:scale-110 group-hover:bg-saffron"><PlayCircle size={34} strokeWidth={1.3} /></span>
              <span className="relative mt-5 font-serif text-[24px] font-bold">{DIARY[0].title}</span>
              <span className="relative text-[13.5px] text-white/70">Today&apos;s short from HH Haladhara Swāmī Mahārāja&apos;s channel</span>
            </Link>
            <Link href="/gurudeva/on-this-day" className="card card-hover group flex flex-col p-7">
              <span className="flex items-center gap-2 text-[13px] font-medium text-saffron"><CalendarDays size={15} />This day in his life</span>
              <span className="mt-2 font-serif text-[40px] font-bold leading-none text-ink">24 October</span>
              <ul className="mt-6 space-y-3 text-[14.5px] text-ink-2">
                {[["1993", "Lecture, Radhadesh"], ["1991", "Letter to a disciple"], ["1989", "14 photos, Bhubaneswar"]].map(([y, t]) => (
                  <li key={y} className="flex items-baseline gap-3"><span className="w-12 font-serif text-[18px] font-bold text-saffron">{y}</span>{t}</li>
                ))}
              </ul>
              <span className="mt-auto pt-5 text-[12px] text-ink-3">Sample entries for the prototype</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Archive */}
      <section className="reveal relative mt-24 bg-band py-20">
        <FlowerBand className="absolute inset-x-0 top-0" />
        <Container>
          <SectionHead title="Archive" intro="Everything recorded, written and photographed, in one place." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ArchiveTile tone="saffron" href="/teachings/books" icon={BookOpen} title="Books" desc="The teachings and pastimes of Śrīla Gurudeva, from three publishers." count={`${STATS.books} titles`} />
            <ArchiveTile tone="charcoal" href="/teachings/audio" icon={Headphones} title="Audio lectures" desc="Search more than a thousand lectures by year, place, verse and topic." count={`${STATS.lectures.toLocaleString()} lectures`} />
            <ArchiveTile tone="saffron" href="/teachings/transcriptions" icon={FileText} title="Transcriptions" desc="Read the lectures, with the text following the audio as it plays." count={`${STATS.transcriptions} transcribed`} />
            <ArchiveTile tone="charcoal" href="/teachings/videos" icon={Clapperboard} title="Videos" desc="Not only for the ears, but also for the eyes: lectures on video." count={`${STATS.videos} videos`} />
            <ArchiveTile tone="saffron" href="/teachings/quotes" icon={Quote} title="Quotes" desc="On personalities, tattvas and many subjects, each with its source." count={`${STATS.quoteCategories} subjects`} />
            <ArchiveTile tone="charcoal" href="/gurudeva/gallery" icon={ImageIcon} title="Images" desc="A picture tells more than a thousand words: his pastimes in photographs." count={`${STATS.imageTags} albums`} />
          </div>
        </Container>
        <FlowerBand className="absolute inset-x-0 bottom-0" />
      </section>

      {/* Tattva-kośa */}
      <section className="reveal mt-24">
        <Container>
          <SectionHead align="left" title="Explore by subject" intro="The Tattva-kośa gathers everything Śrīla Gurudeva said on each subject." action={{ href: "/tattva", label: "Open Tattva-kośa" }} />
          <TopicExplorer />
        </Container>
      </section>

      {/* Recently added + languages */}
      <section className="reveal mt-24">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <SectionHead align="left" title="Recently added" action={{ href: "/teachings/audio", label: "All lectures" }} />
            <div className="card px-2">{LECTURES.slice(0, 6).map((l) => <LectureRow key={l.slug} l={l} />)}</div>
          </div>
          <div>
            <SectionHead align="left" title="Translations" action={{ href: "/translations", label: "All" }} />
            <div className="card divide-y divide-line">
              {LANGUAGES.slice(0, 6).map((l) => (
                <Link key={l.code} href={`/${l.code === "en" ? "" : l.code}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-saffron-tint">
                  <span className="flex-1"><span className="block font-serif text-[18px] font-bold group-hover:text-saffron">{l.native}</span><span className="text-[12.5px] text-ink-3">{l.name}</span></span>
                  <span className="w-20"><span className="block h-1.5 overflow-hidden rounded-full bg-band"><span className="block h-full rounded-full bg-saffron" style={{ width: `${l.ui}%` }} /></span><span className="mt-1 block text-right text-[11px] tabular text-ink-3">{l.ui}%</span></span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Gratitude */}
      <section className="reveal mt-24 text-center">
        <Container>
          <HeartHandshake size={30} strokeWidth={1.4} className="mx-auto text-saffron" />
          <p className="mx-auto mt-4 max-w-3xl font-serif text-[21px] leading-relaxed text-ink-2">This archive is being built by the efforts of the disciples, grand-disciples, followers and admirers of Śrīla Gour Govinda Swāmī.</p>
          <Ornament className="mt-5" />
          <Link href="/thank-list" className="mt-4 inline-block font-serif text-[30px] font-bold text-ink transition hover:text-saffron">Our Thank List</Link>
        </Container>
      </section>
    </>
  );
}
