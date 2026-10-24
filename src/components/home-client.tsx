"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, Play, Pause, ChevronLeft, ChevronRight, Headphones, Quote as QuoteIcon, Copy, Check, PlayCircle } from "lucide-react";
import { DIARY, IMG, LANGUAGES, QUOTE_OF_DAY, TIMELINE } from "@/lib/data";
import { Img } from "./img";
import { OgeeFrame, Padma, PaisleyField, Petals, Rosette, LogoMark } from "./motifs";
import { usePrefs } from "./providers";

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
    <section className="relative overflow-hidden border-b border-line" onPointerMove={move}>
      <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_85%_20%,var(--saffron-soft),transparent),radial-gradient(60%_80%_at_0%_100%,var(--gold-soft),transparent)]" />
      <PaisleyField className="text-saffron/[0.07]" scale={1.1} />
      <Petals n={16} />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pb-20 lg:pt-16">
        <div className="rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-surface/70 py-1 pl-1.5 pr-3.5 text-[12px] font-medium text-saffron backdrop-blur">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron text-white"><LogoMark className="h-3.5 w-3.5" flame="#f4c27a" /></span>
            The complete teachings of Śrīla Gour Govinda Swāmī
          </span>
          <h1 className="mt-5 text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[46px] lg:text-[52px]">
            Words that give life<br />to a <span className="text-shine">burning heart</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-2">
            Lectures, letters, books, quotes and photographs of a pure devotee, gathered in one searchable home and growing in many languages. Listen, read, and find the exact words you were looking for.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/search?q=${encodeURIComponent(q)}`); else setSearch(true); }}
            className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-4 shadow-[var(--shadow-md)] transition focus-within:border-saffron focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--saffron)_14%,transparent)]">
            <Search size={19} className="shrink-0 text-saffron" />
            <div className="relative flex-1">
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the teachings" className="h-11 w-full bg-transparent text-[15px] text-ink outline-none" />
              {!q && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-[15px] text-ink-3">Search&nbsp;<span className="caret text-ink-2">{hint}</span></span>}
            </div>
            <button className="btn btn-primary !h-10 !px-5">Search</button>
          </form>
          <div className="mt-4 flex max-w-xl flex-wrap gap-1.5">
            {CHIPS.map(([l, k]) => <Link key={k} href={`/search?q=${k}`} className="chip acc-saffron">{l}</Link>)}
          </div>
          <div className="mt-9 grid max-w-xl grid-cols-4 gap-4 border-t border-line pt-6">
            <Stat n={1595} label="lectures" /><Stat n={130} label="transcribed" /><Stat n={44} label="quote subjects" /><Stat n={8} label="languages" />
          </div>
        </div>

        {/* Portrait stage */}
        <div ref={box} className="relative mx-auto w-full max-w-[440px] [--px:0] [--py:0]">
          <Rosette className="spin-slow absolute -inset-10 text-saffron/25" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--gold)_35%,transparent),transparent)] blur-2xl" />
          <div className="relative transition-transform duration-300 ease-out" style={{ transform: "translate3d(calc(var(--px) * -10px), calc(var(--py) * -8px), 0)" }}>
            <OgeeFrame className="mx-auto aspect-[4/5] w-[78%] drop-shadow-[0_24px_40px_rgba(90,40,0,0.35)]">
              <Img src={IMG.ggs} alt="Śrīla Gour Govinda Swāmī" className="h-full w-full object-cover object-[50%_15%]" />
            </OgeeFrame>
          </div>
          <div className="floaty absolute -left-1 top-[18%] w-[52%] rounded-2xl border border-line bg-surface/95 p-3.5 shadow-[var(--shadow-lg)] backdrop-blur sm:-left-6" style={{ ["--r" as string]: "-3deg", transform: "translate3d(calc(var(--px) * 14px), calc(var(--py) * 10px), 0)" }}>
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-teal"><span className="eq flex h-3 items-end gap-[2px]"><span style={{ animationDelay: "0s" }} /><span style={{ animationDelay: ".25s" }} /><span style={{ animationDelay: ".5s" }} /></span>Now in the archive</p>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-ink">The Mercy of Śrīla Prabhupāda</p>
            <p className="text-[11.5px] text-ink-3">Bhubaneswar, 1996 · 1 h 12 min</p>
          </div>
          <div className="floaty absolute -right-1 bottom-[10%] w-[56%] rounded-2xl border border-line bg-surface/95 p-3.5 shadow-[var(--shadow-lg)] backdrop-blur sm:-right-6" style={{ ["--r" as string]: "2.5deg", animationDelay: "-3s", transform: "translate3d(calc(var(--px) * 18px), calc(var(--py) * 12px), 0)" }}>
            <QuoteIcon size={15} className="text-rosewood" />
            <p className="mt-1 text-[12.5px] leading-snug text-ink-2">“{QUOTE_OF_DAY.text}”</p>
            <p className="mt-1.5 text-[10.5px] text-ink-3">{QUOTE_OF_DAY.source}, {QUOTE_OF_DAY.date}</p>
          </div>
        </div>
      </div>
    </section>
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
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % FEATURES.length), 6000); return () => clearInterval(t); }, [paused]);
  const f = FEATURES[i];
  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-md)] lg:grid-cols-[300px_minmax(0,1fr)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="flex gap-1 overflow-x-auto p-2.5 lg:block lg:p-3">
        {FEATURES.map((x, k) => (
          <li key={x.n} className="shrink-0 lg:mb-1">
            <button onClick={() => setI(k)} className={`acc-${x.acc} relative w-full overflow-hidden rounded-2xl px-4 py-3 text-left transition ${k === i ? "bg-acc-soft" : "hover:bg-band"}`}>
              <span className={`block text-[14px] font-semibold ${k === i ? "text-[var(--acc)]" : "text-ink"}`}>{x.title}</span>
              <span className="mt-0.5 hidden text-[12px] leading-snug text-ink-3 lg:line-clamp-1">{x.text}</span>
              {k === i && !paused && <span key={i} className="absolute bottom-0 left-0 h-[3px] bg-[var(--acc)]" style={{ animation: "grow 6s linear both" }} />}
              {k === i && paused && <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[var(--acc)]" />}
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
          <p className="text-[24px] font-bold tracking-[-0.03em] sm:text-[32px]">{f.title}</p>
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
  const t = TIMELINE[i];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-9">
      <Rosette className="spin-slow pointer-events-none absolute -right-24 -top-24 h-80 w-80 text-saffron/[0.08]" />
      <div className="relative">
        <div className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-2 pt-1">
          <ol className="relative flex min-w-[640px] justify-between">
            <span className="absolute left-[3%] right-[3%] top-[11px] h-[2px] bg-line-strong" />
            <span className="absolute left-[3%] top-[11px] h-[2px] bg-gradient-to-r from-gold to-saffron transition-all duration-500" style={{ width: `${(i / (TIMELINE.length - 1)) * 94}%` }} />
            {TIMELINE.map((e, k) => (
              <li key={e.year} className="relative z-10 flex-1 text-center">
                <button onClick={() => setI(k)} onMouseEnter={() => setI(k)} className="group flex w-full flex-col items-center gap-2" aria-current={k === i}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${k === i ? "glow acc-saffron scale-125 border-saffron bg-saffron text-white" : k < i ? "border-saffron bg-surface text-saffron" : "border-line-strong bg-surface text-ink-3"}`}>
                    <Padma className="h-3.5 w-3.5" layers={2} />
                  </span>
                  <span className={`text-[12.5px] font-semibold tabular transition ${k === i ? "text-saffron" : "text-ink-3 group-hover:text-ink"}`}>{e.year}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div key={i} className="fade-in mt-7 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[12px] font-semibold text-saffron">{t.year}</p>
            <h3 className="mt-1 text-[24px] tracking-[-0.03em]">{t.title}</h3>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">{t.text}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setI((i + TIMELINE.length - 1) % TIMELINE.length)} aria-label="Earlier" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-2 transition hover:border-saffron hover:text-saffron"><ChevronLeft size={18} /></button>
            <button onClick={() => setI((i + 1) % TIMELINE.length)} aria-label="Later" className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron text-white transition hover:bg-saffron-deep"><ChevronRight size={18} /></button>
          </div>
        </div>
        <Link href="/gurudeva/timeline" className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">Open the full timeline<ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Diary rail */

const HUES = ["#853500", "#0b6b6f", "#3a4a9c", "#a3365e", "#3b7a4b", "#b9780a", "#6b2a00", "#2f2622"];
export function DiaryRail() {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * 480, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="scrollbar-none snap-x-rail -mx-5 flex gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
        {DIARY.map((d, k) => (
          <Link key={d.date} href="/gurudeva/diaries" className="group relative aspect-[9/14] w-[168px] shrink-0 overflow-hidden rounded-2xl text-white shadow-[var(--shadow-md)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] sm:w-[190px]"
            style={{ background: `linear-gradient(160deg, ${HUES[k % HUES.length]}, #1d1411)` }}>
            <PaisleyField className="text-white/[0.09]" scale={0.55} />
            <Padma className="spin-slow absolute -right-10 -top-10 h-40 w-40 text-white/[0.12]" />
            <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10.5px] font-medium backdrop-blur">{k === 0 ? "Today" : new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:scale-110 group-hover:bg-white group-hover:text-saffron"><Play size={22} fill="currentColor" className="ml-0.5" /></span>
            <span className="absolute inset-x-3 bottom-3 text-[13px] font-semibold leading-snug">{d.title.replace("Daily Diary · ", "Diary, ")}<span className="mt-0.5 block text-[10.5px] font-normal text-white/65">Short · HH Haladhara Swāmī</span></span>
          </Link>
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
  const cite = `“${QUOTE_OF_DAY.text}” Śrīla Gour Govinda Swāmī, ${QUOTE_OF_DAY.source}, ${QUOTE_OF_DAY.date}, ${QUOTE_OF_DAY.place}. Taptajīvanam.`;
  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#853500] to-[#4c1b00] p-7 text-white sm:p-9">
      <PaisleyField className="text-white/[0.07]" scale={0.9} />
      <Rosette className="spin-slow pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 text-white/[0.10]" />
      <p className="relative flex items-center gap-2 text-[12px] font-medium text-[#f1d3a4]"><QuoteIcon size={15} />Quote of the day</p>
      <blockquote className="relative mt-5 text-[22px] font-medium leading-[1.35] tracking-[-0.02em] sm:text-[26px]">“{QUOTE_OF_DAY.text}”</blockquote>
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
              <Link key={k} href={`/${l.code === "en" ? "" : l.code}`} className="mr-3 flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 transition hover:-translate-y-0.5 hover:border-rosewood hover:shadow-[var(--shadow-md)]">
                <span className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{l.native}</span>
                <span className="text-[11.5px] text-ink-3">{l.name}<br /><span className="text-rosewood">{l.ui}% translated</span></span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------- Listen-now card */

export function WavePlayer() {
  const [on, setOn] = useState(false);
  const bars = Array.from({ length: 56 }, (_, i) => Math.round(14 + Math.abs(Math.sin(i * 0.7) * 22 + Math.sin(i * 0.23) * 14)));
  return (
    <div className="acc-teal relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-8">
      <Headphones size={160} strokeWidth={0.6} className="pointer-events-none absolute -right-8 -top-8 text-teal/[0.09]" />
      <p className="relative text-[12px] font-semibold text-teal">Sample recording</p>
      <h3 className="relative mt-1 text-[22px] tracking-[-0.03em]">The Mercy of Śrīla Prabhupāda</h3>
      <p className="relative mt-1 text-[13px] text-ink-3">Bhubaneswar · 21 January 1996 · Bhagavad-gītā 18.66</p>
      <div className="relative mt-6 flex items-center gap-4">
        <button onClick={() => setOn(!on)} aria-label={on ? "Pause" : "Play"} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-white shadow-[var(--shadow-md)] transition hover:scale-105">
          {on ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex h-14 flex-1 items-center gap-[3px] overflow-hidden">
          {bars.map((h, i) => <span key={i} className="w-[3px] shrink-0 rounded-full bg-teal/70" style={{ height: h, opacity: on ? 1 : 0.45, animation: on ? `eq ${0.8 + (i % 7) * 0.12}s ease-in-out ${(i % 9) * 0.05}s infinite` : undefined }} />)}
        </div>
      </div>
      <Link href="/teachings/audio/1996-01-21-the-mercy-of-srila-prabhupada-bhubaneswar" className="relative mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-teal">Open lecture and transcript<ArrowRight size={14} /></Link>
    </div>
  );
}
