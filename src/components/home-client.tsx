"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowRight } from "lucide-react";
import { IMG } from "@/lib/data";
import { PaisleyField, Rosette } from "./motifs";
import { usePrefs } from "./providers";

const SLIDES = [
  { n: 1, href: "/teachings/audio", title: "Hari-kathā", text: "The complete remastered audio archive", cta: "Listen to lectures" },
  { n: 2, href: "/gurudeva/gallery", title: "Photo albums", text: "Portraits, deities, festivals and travels", cta: "Open the gallery" },
  { n: 3, href: "/gurudeva/life-description", title: "His life", text: "Gopāl Jiu: the beloved Deity of Śrīla Gurudeva", cta: "Read the life description" },
  { n: 4, href: "/gurudeva/letters", title: "Letters", text: "Between Śrīla Prabhupāda and Śrīla Gurudeva", cta: "Read the letters" },
  { n: 5, href: "/teachings/books", title: "Books", text: "Publications on his teachings and pastimes", cta: "Browse books" },
];

function Slide({ s, active }: { s: (typeof SLIDES)[0]; active: boolean }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setErr(true); }, []);
  return (
    <Link href={s.href} aria-hidden={!active} tabIndex={active ? 0 : -1}
      className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={IMG.banner(s.n)} alt={`${s.title}: ${s.text}`} onError={() => setErr(true)}
          className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${active ? "scale-[1.03]" : "scale-100"}`} />
      ) : (
        <div className="relative flex h-full w-full items-center overflow-hidden bg-[#2f2622]">
          <PaisleyField className="text-white/[0.04]" />
          <Rosette className="absolute -left-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 text-[#c47f6e]/20" />
          <div className="relative ml-auto mr-[8%] max-w-md text-right">
            <p className="font-serif text-[64px] italic leading-none text-[#d8907e] sm:text-[84px]">{s.title}</p>
            <p className="mt-4 text-[15px] font-semibold uppercase tracking-[0.14em] text-white/85">{s.text}</p>
            <span className="mt-6 inline-block rounded-md bg-[#efe2df] px-5 py-2.5 text-[14px] font-semibold text-[#6e3b33]">{s.cta}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

export function BannerCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, [paused]);
  const go = (d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);
  return (
    <section className="relative bg-saffron" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Highlights">
      <div className="relative mx-auto aspect-[16/9] max-h-[640px] w-full overflow-hidden sm:aspect-[2.56/1]">
        {SLIDES.map((s, k) => <Slide key={s.n} s={s} active={k === i} />)}
        <button onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-saffron sm:left-6"><ChevronLeft size={22} /></button>
        <button onClick={() => go(1)} aria-label="Next slide" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-saffron sm:right-6"><ChevronRight size={22} /></button>
        <div className="absolute bottom-[72px] left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-[92px]">
          {SLIDES.map((s, k) => (
            <button key={s.n} onClick={() => setI(k)} aria-label={`Show ${s.title}`} className="group h-1.5 overflow-hidden rounded-full bg-white/35 transition-all" style={{ width: k === i ? 34 : 12 }}>
              {k === i && !paused && <span key={i} className="block h-full origin-left bg-white" style={{ animation: "grow 6.5s linear both" }} />}
              {k === i && paused && <span className="block h-full bg-white" />}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}

const HINTS = ["the holy name", "SB 1.2.6", "Gopāl Jiu", "Bhubaneswar 1993", "guru-tattva", "separation from Kṛṣṇa", "when the sun rises"];

export function HeroSearch() {
  const [q, setQ] = useState("");
  const [hint, setHint] = useState("");
  const r = useRouter();
  const { setSearch } = usePrefs();
  useEffect(() => {
    let i = 0, c = 0, del = false;
    const t = setInterval(() => {
      const w = HINTS[i];
      if (!del) { c++; if (c > w.length + 14) del = true; }
      else { c -= 2; if (c <= 0) { del = false; c = 0; i = (i + 1) % HINTS.length; } }
      setHint(w.slice(0, Math.min(c, w.length)));
    }, 70);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative z-10 mx-auto -mt-12 max-w-[920px] px-4 sm:-mt-16">
      <div className="rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-lg)] sm:p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/search?q=${encodeURIComponent(q)}`); else setSearch(true); }}
          className="flex items-center gap-2 rounded-xl border border-line bg-page/60 pl-4 focus-within:border-saffron focus-within:bg-surface">
          <Search size={21} className="shrink-0 text-saffron" />
          <div className="relative flex-1">
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the teachings"
              className="h-14 w-full bg-transparent text-[17px] text-ink outline-none" />
            {!q && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-[17px] text-ink-3">Search for&nbsp;<span className="caret text-ink-2">{hint}</span></span>}
          </div>
          <button className="btn btn-primary m-1.5 !h-11 !px-6">Search</button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[13px] text-ink-3">
          <span>1,595 lectures</span><span>130 transcriptions</span><span>44 quote subjects</span><span>29 letters</span>
          <Link href="/tattva" className="ml-auto hidden items-center gap-1 font-medium text-saffron sm:flex">Browse by topic<ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
}
