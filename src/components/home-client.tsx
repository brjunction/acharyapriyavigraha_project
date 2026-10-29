"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, Play, Pause, SkipForward, ChevronLeft, ChevronRight, Headphones, Quote as QuoteIcon, Copy, Check, PlayCircle } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { LECTURES, fmtDate, DIARY, IMG, LANGUAGES, QUOTE_OF_DAY, TIMELINE } from "@/lib/data";
import { Img } from "./img";
import { CutOut, PortraitFrame, Orn, Padma, PaisleyField, Petals, Rosette, LogoMark, VMask } from "./motifs";
import { usePrefs, usePlayer } from "./providers";
import { Backdrop } from "./backdrop";

/* ------------------------------------------------------------------ Hero */

const HINTS = ["the holy name", "SB 1.2.6", "Gopāl Jiu", "Bhubaneswar 1993", "guru-tattva", "separation from Kṛṣṇa", "when the sun rises"];
const CHIPS = [["The Holy Name", "holy name"], ["Guru-tattva", "guru"], ["Separation", "separation"], ["Mahāprabhu", "mahaprabhu"], ["Humility", "humility"], ["Śrīla Prabhupāda", "prabhupada"]];

function useCount(to: number, on: boolean, ms = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    let raf = 0; const t0 = performance.now();
    const f = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [to, on, ms]);
  return v;
}
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, []);
  return [ref, on] as const;
}
export function Stat({ n, label, suffix = "" }: { n: number; label: string; suffix?: string }) {
  const [ref, on] = useInView<HTMLDivElement>(); const v = useCount(n, on);
  return <div ref={ref}><p className="text-[28px] font-bold leading-none tracking-[-0.03em] tabular text-ink">{v.toLocaleString()}{suffix}</p><p className="mt-1.5 text-[12px] text-ink-3">{label}</p></div>;
}

export function Hero() {
  const [q, setQ] = useState(""); const [hint, setHint] = useState("");
  const r = useRouter(); const { setSearch } = usePrefs();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let i = 0, c = 0, del = false;
    const t = setInterval(() => {
      const w = HINTS[i];
      if (!del) { c++; if (c > w.length + 14) del = true; } else { c -= 2; if (c <= 0) { del = false; c = 0; i = (i + 1) % HINTS.length; } }
      setHint(w.slice(0, Math.min(c, w.length)));
    }, 70);
    return () => clearInterval(t);
  }, []);
  // gentle pointer parallax on the portrait stage
  const move = (e: React.PointerEvent) => {
    const el = box.current; if (!el) return; const b = el.getBoundingClientRect();
    el.style.setProperty("--px", String(((e.clientX - b.left) / b.width - 0.5).toFixed(3)));
    el.style.setProperty("--py", String(((e.clientY - b.top) / b.height - 0.5).toFixed(3)));
  };
  return (
    <>
    {/* Indian border standing on a light strip below the navigation, outside the saffron hero, as its top fringe */}
    <div aria-hidden className="relative z-[1] bg-white pt-4"><div className="h-8 w-full overflow-hidden"><VMask name="border-4" repeat="repeat-x" size="auto 100%" pos="center top" className="h-full w-full text-[#8a3a0a]" /></div></div>
    <section className="relative isolate -mt-px overflow-hidden" onPointerMove={move}>
      <Backdrop src="saffron-dark" flip pos="left center" o={0.4} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_40%,rgba(243,179,99,0.28),transparent_65%),linear-gradient(100deg,rgba(70,26,3,0.55),transparent_60%)]" />
      <VMask name="mandala-saffron" className="hero-spin-rev pointer-events-none absolute -bottom-56 -left-48 h-[620px] w-[620px] text-[#f3b363] opacity-[0.16]" />
      <VMask name="paisley-red" repeat="repeat" size="380px" className="pointer-events-none absolute inset-0 text-[#f3b363] opacity-[0.07]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#c98a2b] via-[#ffc566] to-[#c98a2b]" />
      {[8, 22, 36, 61, 74, 90].map((x, i) => (
        <div key={x} className="pointer-events-none absolute bottom-24" style={{ left: `${x}%` }}><div className="hero-petal" style={{ animationDelay: `${i * 1.5}s` }}><Padma className="h-5 w-5 text-[#ffd48a]" layers={2} /></div></div>
      ))}
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 pb-12 pt-14 sm:gap-10 sm:px-8 sm:pb-24 sm:pt-24 lg:min-h-[740px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-28">
        <div className="rise order-2 text-center lg:order-1 lg:text-left">
          <span className="hero-pill inline-flex items-center gap-2 rounded-full border border-[#f3b363]/70 bg-[#f3b363]/20 py-1 pl-3 pr-3 text-[11px] font-semibold text-[#fff1da] sm:py-1.5 sm:pl-4 sm:pr-4 sm:text-[12.5px] backdrop-blur">
            The Complete Life and Teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva
          </span>
          <h1 className="mt-4 text-[23px] font-bold leading-[1.15] tracking-[-0.03em] text-[#fff1da] sm:mt-6 sm:text-[32px] lg:text-[42px]">
            {["Words", "that", "give", "life"].map((w, i) => <span key={w} className="hero-word mr-[0.28em]" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>{w}</span>)}<br />
            {["to", "a"].map((w, i) => <span key={w} className="hero-word mr-[0.28em]" style={{ animationDelay: `${0.63 + i * 0.12}s` }}>{w}</span>)}<span className="hero-word hero-gold" style={{ animationDelay: "0.9s" }}>burning heart</span>
          </h1>
          <div className="hero-rule mx-auto mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#ffc566] to-transparent lg:mx-0" />
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-[#ffe9cc]/90 sm:mt-5 sm:text-[15.5px] lg:mx-0">
            Lectures, letters, books, quotes and photographs of Śrīla Gurudeva, gathered in one searchable home and growing in many languages. Listen, read, and find the exact words you were looking for.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/search?q=${encodeURIComponent(q)}`); else setSearch(true); }}
            className="mx-auto mt-5 flex max-w-xl items-center gap-2 sm:mt-7 lg:mx-0 rounded-2xl border border-line bg-surface p-1.5 pl-4 shadow-[var(--shadow-md)] transition focus-within:border-saffron focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--saffron)_14%,transparent)]">
            <Search size={19} className="shrink-0 text-saffron" />
            <div className="relative flex-1">
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the teachings" className="h-11 w-full bg-transparent text-[15px] text-ink outline-none" />
              {!q && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-[15px] text-ink-3">Search&nbsp;<span className="caret text-ink-2">{hint}</span></span>}
            </div>
            <button className="btn btn-primary !h-10 !px-5">Search</button>
          </form>
          <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5 lg:mx-0 lg:justify-start">
            {CHIPS.map(([l, k], ci) => <Link key={k} href={`/search?q=${k}`} className={`hero-chip ${ci > 2 ? "max-sm:hidden" : ""} rounded-full border border-[#f3b363]/45 bg-white/10 px-2.5 py-0.5 text-[11.5px] sm:px-3 sm:py-1 sm:text-[12.5px] text-[#ffe2b8] backdrop-blur`}>{l}</Link>)}
          </div>
        </div>

        {/* Portrait: a plain circular frame, no animation */}
        <div className="relative order-1 mx-auto w-full max-w-[170px] sm:max-w-[300px] lg:order-2 lg:max-w-[340px]">
          <div aria-hidden className="pointer-events-none absolute inset-[-42%]"><VMask name="mandala-saffron" className="hero-spin h-full w-full text-[#f3b363] opacity-[0.34]" /></div>
          <div className="relative"><PortraitFrame photo focus="center 30%" src="/photos/gurudeva-hero.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="mx-auto w-full" /></div>
        </div>
      </div>
    </section>
    {/* Indian border hanging from the hero's lower edge, outside it, like its fringe */}
    <div aria-hidden className="relative z-[1] -mt-px h-8 w-full overflow-hidden"><VMask name="border-4" repeat="repeat-x" size="auto 100%" pos="center top" className="h-full w-full rotate-180 text-[#8a3a0a]" /></div>
    </>
  );
}

/* ------------------------------------------------------------- Featured */

const FEATURES = [
  { n: 1, href: "/teachings/audio", title: "Hari-kathā", text: "The complete remastered audio archive, searchable by year, place, verse and topic.", cta: "Listen to lectures", acc: "teal" },
  { n: 2, href: "/gurudeva/gallery", title: "Photo albums", text: "Portraits, deities, festivals and travels, tagged and browsable.", cta: "Open the gallery", acc: "rose" },
  { n: 3, href: "/gurudeva/life-description", title: "His life", text: "Gopāl Jiu: the beloved Deity of Śrīla Gurudeva.", cta: "Read the life description", acc: "saffron" },
  { n: 4, href: "/gurudeva/letters", title: "Letters", text: "Correspondence between Śrīla Prabhupāda and Śrīla Gurudeva.", cta: "Read the letters", acc: "indigo" },
  { n: 5, href: "/teachings/books", title: "Books", text: "Publications on his teachings and pastimes, readable on the site.", cta: "Browse books", acc: "gold" },
];

export function Featured() {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false);
  const f = FEATURES[i];
  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-md)] lg:grid-cols-[300px_minmax(0,1fr)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="flex gap-1 overflow-x-auto p-2.5 lg:block lg:p-3">
        {FEATURES.map((x, k) => (
          <li key={x.n} className="shrink-0 lg:mb-1">
            <button onClick={() => setI(k)} className={`acc-${x.acc} relative w-full overflow-hidden rounded-2xl px-4 py-3 text-left transition ${k === i ? "bg-acc-soft" : "hover:bg-band"}`}>
              <span className={`block text-[14px] font-semibold ${k === i ? "text-[var(--acc)]" : "text-ink"}`}>{x.title}</span>
              <span className="mt-0.5 hidden text-[12px] leading-snug text-ink-3 lg:line-clamp-1">{x.text}</span>
              {k === i && <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[var(--acc)]" />}
            </button>
          </li>
        ))}
      </ul>
      <Link href={f.href} key={f.n} className={`acc-${f.acc} group relative block min-h-[260px] overflow-hidden bg-[#2f2622] sm:min-h-[340px]`}>
        <Img src={IMG.banner(f.n)} alt="" className="fade-in absolute inset-0 h-full w-full object-cover transition-transform duration-[6000ms] group-hover:scale-105" fallback="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-0 opacity-70" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--acc) 65%, transparent), transparent 55%)" }} />
        <Rosette className="spin-slow absolute -right-16 -top-16 h-72 w-72 text-white/15" />
        <div className="rise absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
          <p className="text-[20px] font-bold tracking-[-0.03em] sm:text-[26px]">{f.title}</p>
          <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-white/85">{f.text}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--acc)] transition group-hover:gap-2.5">{f.cta}<ArrowRight size={15} /></span>
        </div>
      </Link>
      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------- Life timeline */

export function LifeTimeline() {
  const [i, setI] = useState(0);
  const n = TIMELINE.length;
  const t = TIMELINE[i];
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
      {/* Desktop and tablet: a horizontal rail */}
      <div className="hidden md:block">
        <div className="relative">
          <span className="absolute left-[calc(50%/7)] right-[calc(50%/7)] top-[9px] h-[2px] rounded-full bg-line-strong" />
          <span className="absolute left-[calc(50%/7)] top-[9px] h-[2px] rounded-full bg-gradient-to-r from-gold to-saffron transition-all duration-500" style={{ width: `calc((100% - 100%/${n}) * ${i / (n - 1)})` }} />
          <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {TIMELINE.map((e, k) => (
              <li key={e.year} className="flex flex-col items-center text-center">
                <button onClick={() => setI(k)} onMouseEnter={() => setI(k)} aria-current={k === i} className="group flex flex-col items-center">
                  <span className={`block h-5 w-5 rounded-full border-[3px] transition ${k === i ? "scale-125 border-saffron bg-white ring-4 ring-saffron/20" : k < i ? "border-saffron bg-saffron" : "border-line-strong bg-surface group-hover:border-saffron"}`} />
                  <span className={`mt-3 text-[15px] font-semibold tabular transition ${k === i ? "text-saffron" : "text-ink-2 group-hover:text-saffron"}`}>{e.year}</span>
                  <span className={`mt-0.5 px-1 text-[12px] leading-snug transition ${k === i ? "font-medium text-ink" : "text-ink-3"}`}>{e.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div key={i} className="fade-in mt-8 flex items-center gap-5 rounded-2xl bg-saffron-tint p-5">
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-saffron">{t.year}</p>
            <h3 className="mt-0.5 text-[18px] font-semibold tracking-[-0.01em]">{t.title}</h3>
            <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-ink-2">{t.text}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => setI((i + n - 1) % n)} aria-label="Earlier" className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-saffron hover:text-saffron"><ChevronLeft size={16} /></button>
            <button onClick={() => setI((i + 1) % n)} aria-label="Later" className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron text-white transition hover:bg-saffron-deep"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      {/* Phone: a vertical timeline, everything visible */}
      <ol className="relative md:hidden">
        <span className="absolute bottom-2 left-[9px] top-2 w-[2px] rounded-full bg-gradient-to-b from-gold to-saffron" />
        {TIMELINE.map((e) => (
          <li key={e.year} className="relative pb-6 pl-9 last:pb-0">
            <span className="absolute left-0 top-1 block h-5 w-5 rounded-full border-[3px] border-saffron bg-white" />
            <p className="text-[13px] font-semibold tabular text-saffron">{e.year}</p>
            <h3 className="text-[15px] font-semibold">{e.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{e.text}</p>
          </li>
        ))}
      </ol>
      <Link href="/gurudeva/timeline" className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">Open the full timeline<ArrowRight size={14} /></Link>
    </div>
  );
}

/* ----------------------------------------------------------- Diary rail */

const HUES = ["#853500", "#0b6b6f", "#3a4a9c", "#a3365e", "#3b7a4b", "#b9780a", "#6b2a00", "#2f2622"];
export type DiaryItem = { id: string; title: string; published: string };
export function DiaryRail({ items }: { items?: DiaryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * 480, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="scrollbar-none snap-x-rail flex gap-4 overflow-x-auto pb-4">
        {items && items.length ? items.slice(0, 10).map((v, k) => (
          <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="group relative aspect-[9/14] w-[168px] shrink-0 overflow-hidden rounded-2xl bg-[#1d1411] text-white transition duration-300 hover:-translate-y-1.5 sm:w-[184px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] font-medium backdrop-blur">{k === 0 ? "Latest" : new Date(v.published).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:scale-110 group-hover:bg-white group-hover:text-saffron"><Play size={18} fill="currentColor" className="ml-0.5" /></span>
            <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-[12.5px] font-semibold leading-snug">{v.title}</span>
          </a>
        )) : DIARY.slice(0, 7).map((d, k) => (
          <div key={d.date} className="group relative aspect-[9/14] w-[168px] shrink-0 overflow-hidden rounded-2xl text-white"
            style={{ background: `linear-gradient(160deg, ${HUES[k % HUES.length]}, #1d1411)` }}>
            <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10.5px] font-medium backdrop-blur">Soon</span>
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur"><Play size={18} fill="currentColor" /></span>
            <span className="absolute inset-x-3 bottom-3 text-[12.5px] font-semibold leading-snug">Daily Diary<span className="mt-0.5 block text-[10.5px] font-normal text-white/65">Coming soon</span></span>
          </div>
        ))}
      </div>
      <div className="mt-1 hidden justify-end gap-2 sm:flex">
        <button onClick={() => by(-1)} aria-label="Previous" className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-saffron hover:text-saffron"><ChevronLeft size={17} /></button>
        <button onClick={() => by(1)} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-saffron hover:text-saffron"><ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Quote card */

export function QuotePanel() {
  const [copied, setCopied] = useState(false);
  const cite = `“${QUOTE_OF_DAY.text}” Śrī Śrīmad Gour Govinda Swāmī Gurudeva, ${QUOTE_OF_DAY.source}, ${QUOTE_OF_DAY.date}, ${QUOTE_OF_DAY.place}. Taptajīvanam.`;
  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#6b2a00] p-7 text-white sm:p-9">
      <Backdrop src="orange-mandala" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#4c1b00]/90 via-[#4c1b00]/55 to-transparent" />
      <p className="relative flex items-center gap-2 text-[12px] font-medium text-[#f1d3a4]"><QuoteIcon size={15} />Quote of the day</p>
      <blockquote className="relative mt-5 text-[19px] font-medium leading-[1.4] tracking-[-0.015em] sm:text-[22px]">“{QUOTE_OF_DAY.text}”</blockquote>
      <figcaption className="relative mt-auto pt-8">
        <p className="text-[13px] text-white/80"><span className="font-semibold text-white">Śrīla Gurudeva</span><br />{QUOTE_OF_DAY.source}, {QUOTE_OF_DAY.date}, {QUOTE_OF_DAY.place}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => { navigator.clipboard?.writeText(cite); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-medium backdrop-blur transition hover:bg-white hover:text-[#853500]">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied with source" : "Copy with source"}</button>
          <Link href="/teachings/quotes" className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[12px] font-medium transition hover:bg-white/10">More quotes<ArrowRight size={13} /></Link>
        </div>
      </figcaption>
    </figure>
  );
}

/* ----------------------------------------------------- Language marquee */

export function LangMarquee() {
  const rows = [LANGUAGES, [...LANGUAGES].reverse()];
  return (
    <div className="space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="marquee-wrap">
          <div className={`marquee ${r ? "marquee-rev" : ""}`} style={{ ["--dur" as string]: r ? "55s" : "70s" } as React.CSSProperties}>
            {[...row, ...row, ...row, ...row].map((l, k) => (
              <Link key={k} href={`/${l.code === "en" ? "" : l.code}`} className="mr-3 flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 transition hover:-translate-y-0.5 hover:border-saffron hover:shadow-[var(--shadow-md)]">
                <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink">{l.native}</span>
                <span className="text-[11.5px] text-ink-3">{l.name}<br /><span className="text-saffron">{l.ui}% translated</span></span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------- Listen-now card */

export function Radio() {
  const { track, playing, play, toggle, time } = usePlayer();
  const pick = (exceptSlug?: string) => { const pool = LECTURES.filter((l) => l.slug !== exceptSlug); return pool[Math.floor(Math.random() * pool.length)]; };
  const [cur, setCur] = useState(LECTURES[0]);
  const bars = Array.from({ length: 48 }, (_, i) => Math.round(10 + Math.abs(Math.sin(i * 0.7) * 20 + Math.sin(i * 0.23) * 12)));
  const mine = track?.slug === cur.slug;
  const on = mine && playing;
  const start = (l: (typeof LECTURES)[0]) => { setCur(l); play({ slug: l.slug, title: l.title, subtitle: `${fmtDate(l.date)}, ${l.place}`, duration: l.duration }); };
  // Radio: when the track ends, another one begins at random
  useEffect(() => { if (mine && playing && time >= cur.duration - 1) start(pick(cur.slug)); }, [time]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="acc-teal relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-teal"><span className={`h-2 w-2 rounded-full ${on ? "bg-rose-d animate-pulse" : "bg-ink-3"}`} />Radio</span>
        <span className="text-[12px] text-ink-3">Plays on, in random order</span>
      </div>
      <h3 className="mt-4 text-[20px] leading-snug tracking-[-0.02em]">{cur.title}</h3>
      <p className="mt-1 text-[13px] text-ink-3">{fmtDate(cur.date)} · {cur.place}{cur.scripture ? ` · ${cur.scripture}` : ""}</p>
      <div className="mt-6 flex items-center gap-4">
        <button onClick={() => (mine ? toggle() : start(cur))} aria-label={on ? "Pause" : "Play"} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-white transition hover:scale-105">
          {on ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex h-14 flex-1 items-center gap-[3px] overflow-hidden">
          {bars.map((h, i) => <span key={i} className="w-[3px] shrink-0 rounded-full bg-teal/70" style={{ height: h, opacity: on ? 1 : 0.4, animation: on ? `eq ${0.8 + (i % 7) * 0.12}s ease-in-out ${(i % 9) * 0.05}s infinite` : undefined }} />)}
        </div>
        <button onClick={() => start(pick(cur.slug))} aria-label="Next, at random" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-teal hover:text-teal"><SkipForward size={17} /></button>
      </div>
      <div className="mt-auto flex items-center justify-between pt-6 text-[13px]">
        <Link href={`/teachings/audio/${cur.slug}`} className="inline-flex items-center gap-1 font-medium text-teal">Open lecture<ArrowRight size={14} /></Link>
        <Link href="/teachings/audio" className="text-ink-3 hover:text-teal">Browse all audio</Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Blessing */
const hl = (t: string) => t.split(/(«[^»]+»)/).map((x, k) => x.startsWith("«") ? <mark key={k} className="mark-live rounded px-1 font-semibold text-ink">{x.slice(1, -1)}</mark> : <span key={k}>{x}</span>);

export function Blessing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#fdf8ee]">
      <Backdrop src="cream-mandala" o={0.12} pos="center" />
      <VMask name="border-3" repeat="repeat-x" size="auto 100%" className="pointer-events-none absolute inset-x-0 top-0 h-5 text-[#d9a441]/35" />
      <div className="relative grid grid-cols-2 items-end gap-x-3 gap-y-2 px-4 pt-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:px-10 lg:pt-8">
        <div className="order-2 self-end lg:order-1">
          <CutOut src="/legacy/prabhupada.webp" alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" fade={0} className="mx-auto w-full max-w-[250px]" />
        </div>
        <div className="order-1 col-span-2 pb-6 text-center lg:order-2 lg:col-span-1 lg:pb-10">
          <p className="kick-live text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <p className="mt-4 text-balance text-[23px] font-semibold leading-[1.3] tracking-tight text-ink sm:text-[30px]">{["“Kṛṣṇa", "sent", "him.”"].map((w, i) => <span key={i} className="live-word" style={{ ["--d" as string]: `${0.1 + i * 0.16}s` } as React.CSSProperties}>{w}</span>)}</p>
          <p className="hover-glow mt-2 text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ink-2"><mark className="mark-live rounded px-1 font-semibold text-ink">“Krishna is with you and there is no need of disappointment.”</mark></p>
          <p className="mt-2 text-[13px] text-ink-3">Letter, Māyāpur, 12 February 1976</p>
        </div>
        <div className="order-3 self-end">
          <CutOut src="/legacy/gurudeva.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" fade={0} className="mx-auto w-[88%] max-w-[225px]" />
        </div>
      </div>
      <div className="relative border-t border-[#efe2c6] bg-[#fffaf0] py-3 text-center">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-2 rounded-full border border-[#e3cf9f] bg-white px-4 py-1.5 text-[12.5px] font-medium text-saffron transition hover:bg-saffron-soft">{open ? "Hide the conversation and letter" : "Read the conversation and the letter"}<ChevronRight size={14} className={`transition-transform ${open ? "-rotate-90" : "rotate-90"}`} /></button>
      </div>
      {open && <div className="relative grid gap-5 border-t border-[#efe2c6] bg-[#fffaf0] p-4 sm:p-7 lg:grid-cols-2">
        <section>
          <h3 className="text-[16px] font-semibold">{CONVERSATION.title}</h3>
          <p className="mb-3 mt-0.5 text-[12px] text-ink-3">{CONVERSATION.speakers}</p>
          <div className="max-h-[280px] overflow-y-auto rounded-2xl border border-[#e9d9b8] bg-[#fffbf3] sm:max-h-none">
            {CONVERSATION.lines.map(([who, line], k) => (
              <p key={k} className="live-row border-b border-[#efe2c6] px-4 py-2.5 text-[13px] leading-relaxed text-ink-2 last:border-0"><span className={`mr-1.5 font-semibold ${who === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{who}:</span>{hl(line)}</p>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-[16px] font-semibold">{LETTER.title}</h3>
          <p className="mb-3 mt-0.5 text-[12px] text-ink-3">Letter {LETTER.ref}</p>
          <article className="max-h-[280px] space-y-3 overflow-y-auto rounded-2xl border border-[#e9d9b8] bg-[#fffbf3] p-4 text-[13px] sm:max-h-none sm:p-5 leading-relaxed text-ink-2">
            <p>{LETTER.salutation}</p>
            {LETTER.paras.map((t, k) => <p key={k}>{hl(t)}</p>)}
            <p className="text-ink-3">{LETTER.closing[0]}<br />{LETTER.closing[1]}<br /><span className="text-[12px]">{LETTER.closing[2]}</span></p>
          </article>
        </section>
      </div>}
    </div>
  );
}
