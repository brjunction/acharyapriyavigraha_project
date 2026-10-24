import Link from "next/link";
import {
  BookOpen, Headphones, FileText, Clapperboard, Quote, Image as ImageIcon, CalendarDays, ArrowRight, HeartHandshake, Network, Mail, Heart, Gift,
  MapPin, ScrollText, Search as SearchIcon, type LucideIcon,
} from "lucide-react";
import { LECTURES, STATS, fmtDate, fmtDur } from "@/lib/data";
import { Hero, Blessing, Featured, LifeTimeline, DiaryRail, QuotePanel, LangMarquee, Radio } from "@/components/home-client";
import { TeachingsOrganiser } from "@/components/teachings-organiser";
import { TopicExplorer } from "@/components/topic-explorer";
import { Container } from "@/components/ui";
import { Orn, OrnMask, Padma, PaisleyField, VectorToran, PeacockDivider } from "@/components/motifs";
import { Backdrop } from "@/components/backdrop";
import { getChannelVideos } from "@/lib/youtube";
import { LectureRow } from "@/components/lecture";

function SectionBg({ src, o = 0.4, flip = false, pos = "center" }: { src: string; o?: number; flip?: boolean; pos?: string }) {
  return (
    <>
      <Backdrop src={src} o={o} flip={flip} pos={pos} className="-z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-page via-transparent to-page" />
    </>
  );
}

function Head({ kicker, title, intro, action, acc = "saffron", light = false }: { light?: boolean; kicker: string; title: string; intro?: string; action?: { href: string; label: string }; acc?: string }) {
  return (
    <div className={`acc-${acc} mb-7 flex flex-wrap items-end justify-between gap-4`}>
      <div>
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><Padma className="h-4 w-4" layers={2} />{kicker}</p>
        <h2 className={`mt-1.5 text-[26px] leading-tight tracking-[-0.03em] sm:text-[30px] ${light ? "!text-white" : ""}`}>{title}</h2>
        {intro && <p className={`mt-1.5 max-w-xl text-[14px] ${light ? "text-white/80" : "text-ink-2"}`}>{intro}</p>}
      </div>
      {action && <Link href={action.href} className={`group flex items-center gap-1 text-[13px] font-medium ${light ? "text-[#f3d9a4]" : "text-[var(--acc)]"}`}>{action.label}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>}
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

export default async function Home() {
  const diary = await getChannelVideos();
  return (
    <>
      <Hero />

      {/* Blessing */}
      <section className="reveal mt-10">
        <Container><Blessing /></Container>
      </section>

      {/* Highlights */}
      <section className="reveal mt-14">
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
            <Path acc="gold" icon={Network} title="Explore" text="Follow a subject through everything he said on it." links={[["/tattva", "Tattva", "112 topics"], ["/tattva/index/verses", "By verse", "SB, BG, CC"], ["/tattva/index/places", "By place and year", ""]]} />
            <Path acc="rose" icon={Heart} title="Remember" text="Photographs, memories and glorifications." links={[["/gurudeva/gallery", "Gallery", "38 albums"], ["/gurudeva/memories", "Memories", ""], ["/gurudeva/glorifications", "Glorifications", ""]]} />
          </div>
        </Container>
      </section>

      <PeacockDivider className="mt-12" />

      {/* Teachings */}
      <section className="reveal relative isolate mt-8 py-6">
        <SectionBg src="cream-watercolor" o={0.7} />
        <Container>
          <Head kicker="His teachings" title="Hear, read and remember" intro="Everything is organised in three places: what you can hear and watch, what you can read, and the compilations drawn from both." action={{ href: "/teachings", label: "All teachings" }} />
          <TeachingsOrganiser />
        </Container>
      </section>

      {/* Today */}
      <section className="reveal relative isolate mt-16 py-10">
        <SectionBg src="tan-mandala" o={0.3} flip />
        <Container>
          <Head kicker="For today" title="A quote, a diary, a date" intro="Something small to carry through the day." />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[1.15fr_1fr]">
            <QuotePanel />
            <div className="acc-leaf card flex flex-col p-6 sm:p-7">
              <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--acc)]"><CalendarDays size={15} />This day in his life</span>
              <p className="mt-2 text-[34px] font-bold leading-none tracking-[-0.04em] sm:text-[40px]">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>
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
            <Head kicker="Daily Diary" title="Today and the days before" intro="Short videos from Śrīla Haladhara Swāmī Guru Mahārāja's channel, added automatically." action={{ href: "/gurudeva/diaries", label: "All diaries" }} acc="rose" />
            <DiaryRail items={diary} />
          </div>
        </Container>
      </section>

      {/* Archive bento */}
      <section className="reveal relative isolate mt-16 overflow-hidden bg-[#4a0a0c] py-20">
        <Backdrop src="red-gold-mandala" o={0.5} className="-z-10" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#3d0307]/70 via-transparent to-[#3d0307]/70" />
        <VectorToran flip className="absolute inset-x-0 top-0 text-[#e8b872]/70" />
        <Container>
          <Head light kicker="The archive" title="Everything he left us, in one place" action={{ href: "/teachings", label: "All teachings" }} acc="gold" />
          <div className="stagger grid gap-4 sm:grid-cols-2 lg:auto-rows-[158px] lg:grid-cols-4">
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
        <VectorToran className="absolute inset-x-0 bottom-0 text-[#e8b872]/70" />
      </section>

      {/* Listen + recent */}
      <section className="reveal relative isolate mt-16 py-10">
        <SectionBg src="cream-mandala" o={0.55} />
        <Container>
          <Head kicker="Śrīla Gurudeva Radio" title="Listen, and let it play on" intro="Hari-kathā in his own voice, one lecture after another, chosen at random." acc="teal" />
          <div className="grid grid-cols-[minmax(0,1fr)] items-stretch gap-5 lg:grid-cols-2">
            <Radio />
            <div className="acc-teal flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-teal">Recently added</span>
                <Link href="/teachings/audio" className="text-[12.5px] font-medium text-teal">All lectures</Link>
              </div>
              <ol className="flex-1 divide-y divide-line">
                {LECTURES.slice(0, 5).map((l, i) => (
                  <li key={l.slug}>
                    <Link href={`/teachings/audio/${l.slug}`} className="group flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-[var(--acc-tint)]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--acc-tint)] text-[12px] font-semibold tabular text-teal">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-teal">{l.title}</span>
                        <span className="mt-0.5 block truncate text-[12px] text-ink-3">{fmtDate(l.date)} · {l.place}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-band px-2.5 py-0.5 text-[11.5px] tabular text-ink-2">{fmtDur(l.duration)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* Life */}
      <PeacockDivider className="mt-16" size={72} />
      <section className="reveal relative isolate mt-6 py-10">
        <SectionBg src="orange-mandala" o={0.28} />
        <Container>
          <Head kicker="His life" title="From Jagannāthapura to Māyāpur" intro="The main moments of his life. Select a year to read more." />
          <LifeTimeline />
        </Container>
      </section>

      {/* Subjects */}
      <PeacockDivider className="mt-12" size={72} />
      <section className="reveal relative isolate mt-6 py-10">
        <SectionBg src="cream-watercolor" o={0.7} flip />
        <Container>
          <Head kicker="Tattva" title="Explore by subject" intro="Everything Śrīla Gurudeva said on each subject, gathered in one place." action={{ href: "/tattva", label: "Open Tattva" }} acc="indigo" />
          <TopicExplorer />
        </Container>
      </section>

      {/* Languages */}
      <section className="reveal relative mt-24 overflow-hidden py-16 text-white">
        <Backdrop src="blue-mandala" />
        <div className="pointer-events-none absolute inset-0 bg-[#0a2c78]/35" />
        <Container>
          <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85"><Padma className="h-4 w-4" layers={2} />Translations</p>
              <h2 className="mt-1.5 text-[26px] leading-tight tracking-[-0.03em] text-white sm:text-[30px]">One teaching, many languages</h2>
              <p className="mt-1.5 max-w-xl text-[14px] text-white/85">Each language is a site of its own, with its own pages, search and archive.</p>
            </div>
            <Link href="/translations" className="group flex items-center gap-1 text-[13px] font-medium text-white">All languages<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
          </div>
        </Container>
        <div className="relative"><LangMarquee /></div>
      </section>

      {/* Thank list */}
      <section className="reveal mt-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl bg-[#4a0a0c] px-6 py-14 text-center text-white sm:px-12">
            <Backdrop src="red-gold-mandala" className="-z-10" />
            <VectorToran flip className="absolute inset-x-0 top-0 text-[#e8b872]/60" />
            <HeartHandshake size={26} strokeWidth={1.4} className="mx-auto text-[#f1d3a4]" />
            <h2 className="mt-3 text-[22px] !text-white sm:text-[26px]">Our Thank List</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
            <Link href="/thank-list" className="btn mt-6 !h-10 bg-[#e8b872] !px-5 text-[#3d0f08] hover:bg-[#f3d9a4]">Read the Thank List<ArrowRight size={15} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
