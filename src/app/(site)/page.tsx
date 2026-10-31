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
import { FounderSection } from "@/components/home/founder";
import { Band } from "@/components/waves";
import { Orn, OrnMask, Padma, PaisleyField, VectorToran, PortraitFrame, VMask } from "@/components/motifs";
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
    <div className={`acc-${acc} mb-5 flex flex-wrap items-end justify-between gap-4`}>
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><Padma className="h-3.5 w-3.5" layers={2} />{kicker}</p>
        <h2 className={`mt-1 text-[19.5px] leading-tight tracking-[-0.025em] sm:text-[23px] ${light ? "!text-white" : ""}`}>{title}</h2>
        {intro && <p className={`mt-2 max-w-xl text-[12.5px] ${light ? "text-white/80" : "text-ink-2"}`}>{intro}</p>}
      </div>
      {action && <Link href={action.href} className={`group flex items-center gap-1 text-[12.5px] font-medium ${light ? "text-[#f3d9a4]" : "text-[var(--acc)]"}`}>{action.label}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>}
    </div>
  );
}

function Path({ acc, icon: I, title, text, links }: { acc: string; icon: LucideIcon; title: string; text: string; links: [string, string, string][] }) {
  return (
    <div className={`path-card acc-${acc} card tile-hue group relative flex flex-col overflow-hidden p-3.5 sm:p-5`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white shadow sm:h-11 sm:w-11 sm:rounded-2xl-[var(--shadow-md)]" style={{ background: "linear-gradient(145deg, var(--acc), color-mix(in srgb, var(--acc) 60%, #000))" }}><I size={21} strokeWidth={1.7} /></span>
      <h3 className="relative mt-3 text-[14.5px] tracking-[-0.02em]">{title}</h3>
      <p className="relative mt-1 text-[11.5px] leading-snug text-ink-2 sm:text-[12.5px] sm:leading-relaxed">{text}</p>
      <ul className="relative mt-4 hidden space-y-0.5 border-t border-line pt-3 sm:block">
        {links.map(([h, l, d]) => (
          <li key={h}><Link href={h} className="group/l flex items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] transition hover:bg-acc-tint">
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
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/30 backdrop-blur"><I size={26} strokeWidth={1.8} /></span>
      <h3 className="mt-3 text-[16.5px] tracking-[-0.025em] text-white">{title}</h3>
      <p className="mt-1 max-w-xs text-[12px] leading-snug text-white/80">{desc}</p>
      {children}
      <div className="mt-auto flex items-center justify-between pt-4 text-[11.5px]">
        <span className="rounded-full bg-white/18 px-2.5 py-1 font-medium backdrop-blur">{count}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/0 transition group-hover:bg-white group-hover:text-[var(--acc)]"><ArrowRight size={14} /></span>
      </div>
    </Link>
  );
}

const SHOW_TRANSLATIONS = false;

export default async function Home() {
  const diary = await getChannelVideos();
  return (
    <>
      <Hero />

      {/* Blessing */}
      <section className="reveal relative z-[2] mt-10">
        <Container><Blessing /></Container>
      </section>

      <FounderSection />

      {/* Four ways in */}
      <section className="reveal relative z-[2] mt-10">
        <Container>
          <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Path acc="teal" icon={Headphones} title="Listen" text="Hari-kathā in his own voice, from 1985 to 1996." links={[["/teachings/audio", "Audio lectures", "1,595"], ["/teachings/transcriptions", "Transcriptions", "130"], ["/teachings/videos", "Videos", "210"]]} />
            <Path acc="indigo" icon={BookOpen} title="Read" text="Books, letters and quotes, each with its source." links={[["/teachings/books", "Books", "48"], ["/gurudeva/letters", "Letters", "29"], ["/teachings/quotes", "Quotes", "44 subjects"]]} />
            <Path acc="gold" icon={Network} title="Explore" text="Follow a subject through everything he said on it." links={[["/tattva", "Tattva", "112 topics"], ["/tattva/index/verses", "By verse", "SB, BG, CC"], ["/tattva/index/places", "By place and year", ""]]} />
            <Path acc="rose" icon={Heart} title="Remember" text="Photographs, memories and glorifications." links={[["/gurudeva/gallery", "Gallery", "38 albums"], ["/gurudeva/memories", "Memories", ""], ["/gurudeva/glorifications", "Glorifications", ""]]} />
          </div>
        </Container>
      </section>


      {/* Teachings */}
      <Band tint="#fbf1de" className="mt-[110px] pb-[130px] pt-8 sm:mt-[150px] sm:pb-[190px]">
        <Container>
          <Head kicker="His teachings" title="Hear, read and remember" intro="Everything is organised in three places: what you can hear and watch, what you can read, and the compilations drawn from both." action={{ href: "/teachings", label: "All teachings" }} />
          <TeachingsOrganiser />
        </Container>
      </Band>

     

      

      {/* Subjects */}
      <section className="reveal relative isolate mt-6 py-10">
        <SectionBg src="cream-watercolor" o={0.7} flip />
        <Container>
          <Head kicker="Tattva" title="Explore by subject" intro="Everything Śrīla Gurudeva said on each subject, gathered in one place." action={{ href: "/tattva", label: "Open Tattva" }} acc="indigo" />
          <TopicExplorer />
        </Container>
      </section>
      

      {/* Languages: hidden until translations are ready */}
      {SHOW_TRANSLATIONS && (<>
      <section className="reveal relative mt-24 overflow-hidden py-16 text-white">
        <Backdrop src="blue-mandala" />
        <div className="pointer-events-none absolute inset-0 bg-[#0a2c78]/35" />
        <Container>
          <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#f3d9a4]"><Padma className="h-3.5 w-3.5" layers={2} />Translations</p>
              <h2 className="mt-1 text-[19.5px] leading-tight tracking-[-0.025em] text-white sm:text-[23px]">One teaching, many languages</h2>
              <p className="mt-1 max-w-xl text-[12.5px] text-white/85">Each language is a site of its own, with its own pages, search and archive.</p>
            </div>
            <Link href="/translations" className="group flex items-center gap-1 text-[12.5px] font-medium text-white">All languages<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
          </div>
        </Container>
        <div className="relative"><LangMarquee /></div>
      </section>
      </>)}

      {/* Thank list */}
      <section className="reveal mt-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl bg-[#4a0a0c] px-6 py-14 text-center text-white sm:px-12">
            <Backdrop src="red-gold-mandala" o={0} className="-z-10 opacity-60" />
            <VectorToran flip className="absolute inset-x-0 top-0 text-[#e8b872]/30" />
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-[#e8b872]/50"><HeartHandshake size={26} strokeWidth={1.8} className="text-[#f1d3a4]" /></span>
            <h2 className="mt-3 text-[20px] !text-white sm:text-[24px]">Our Thank List</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-white/85">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
            <Link href="/thank-list" className="btn mt-6 !h-10 bg-gradient-to-r from-saffron to-[#e8b872] !px-5 text-white shadow-[0_6px_18px_-8px_rgba(243,179,99,0.8)] hover:brightness-110">Read the Thank List<ArrowRight size={15} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
