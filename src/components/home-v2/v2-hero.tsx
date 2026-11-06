"use client";
/* The new home’s opening: a deep saffron dusk, a golden lotus turning around Śrīla Gurudeva, lights rising, and the search that finds his words. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowDown } from "lucide-react";
import { VMask } from "@/components/motifs";
import { usePrefs } from "@/components/providers";
import { GoldLotus } from "./v2-lotus";
import { Lights, CountUp } from "./v2-motion";

const HINTS = ["the holy name", "SB 1.2.6", "Gopāl Jiu", "Bhubaneswar 1993", "guru-tattva", "separation from Kṛṣṇa", "when the sun rises"];
const CHIPS = [["The Holy Name", "holy name"], ["Guru-tattva", "guru"], ["Separation", "separation"], ["Mahāprabhu", "mahaprabhu"], ["Humility", "humility"], ["Śrīla Prabhupāda", "prabhupada"]];

export function V2Hero({ stats }: { stats: { n: number; label: string }[] }) {
  const [q, setQ] = useState(""); const [hint, setHint] = useState("");
  const r = useRouter(); const { setSearch } = usePrefs();
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let i = 0, c = 0, del = false;
    const t = setInterval(() => {
      const w = HINTS[i];
      if (!del) { c++; if (c > w.length + 14) del = true; } else { c -= 2; if (c <= 0) { del = false; c = 0; i = (i + 1) % HINTS.length; } }
      setHint(w.slice(0, Math.min(c, w.length)));
    }, 70);
    return () => clearInterval(t);
  }, []);
  // the lotus leans a little toward the pointer
  const move = (e: React.PointerEvent) => {
    const el = stage.current; if (!el) return; const b = el.getBoundingClientRect();
    el.style.setProperty("--tx", `${(((e.clientX - b.left) / b.width) - 0.5) * 14}px`);
    el.style.setProperty("--ty", `${(((e.clientY - b.top) / b.height) - 0.5) * 14}px`);
  };
  return (
    <section onPointerMove={move} className="relative isolate flex min-h-[calc(100svh-52px)] flex-col overflow-hidden bg-[#2a0d03] text-[#fff1da] sm:min-h-[calc(100svh-58px)]">
      {/* dusk: a warm glow behind the lotus, deepening to the edges */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(90%_75%_at_72%_42%,#b8501a_0%,#7a2a08_34%,#3d1305_68%,#240a02_100%)] max-lg:bg-[radial-gradient(120%_60%_at_50%_26%,#b8501a_0%,#7a2a08_38%,#3d1305_72%,#240a02_100%)]" />
      <div aria-hidden className="tv-aurora absolute inset-0 -z-10" />
      <VMask name="paisley-red" repeat="repeat" size="420px" className="pointer-events-none absolute inset-0 -z-10 text-[#f3b363] opacity-[0.05]" />
      <VMask name="mandala-saffron" className="tv-spin-rev pointer-events-none absolute -bottom-72 -left-72 -z-10 size-[760px] text-[#f3b363] opacity-[0.1]" />
      <Lights color="#ffd48a" dense />

      <div className="mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 content-center items-center gap-6 px-5 pb-6 pt-6 sm:gap-10 sm:px-10 sm:pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:py-12">
        <div ref={stage} className="tv-stage relative order-1 mx-auto w-full max-w-[min(300px,40svh)] sm:max-w-[min(400px,44svh)] lg:order-2 lg:max-w-[540px]">
          <GoldLotus src="/photos/gurudeva-hero.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" />
        </div>
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="tv-rise inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[0.06em] text-[#f3c77a] sm:text-[12.5px]">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#f3c77a] sm:w-10" />tava kathāmṛtaṁ tapta-jīvanam<span className="h-px w-6 bg-gradient-to-l from-transparent to-[#f3c77a] sm:w-10 lg:hidden" />
          </p>
          <h1 className="mt-3 text-[27px] font-semibold leading-[1.1] tracking-[-0.03em] sm:mt-5 sm:text-[42px] lg:text-[52px]">
            <span className="tv-line"><span style={{ animationDelay: ".1s" }}>Words that give life</span></span>
            <span className="tv-line"><span style={{ animationDelay: ".25s" }}>to a <span className="tv-gold">burning heart</span></span></span>
          </h1>
          <p className="tv-rise mx-auto mt-3 max-w-[520px] text-[12.5px] leading-relaxed text-[#ffe9cc]/80 sm:mt-5 sm:text-[15px] lg:mx-0" style={{ animationDelay: ".45s" }}>
            The complete life and teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva — lectures, letters, books, quotes and photographs, gathered in one searchable home and growing in many languages.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/search?q=${encodeURIComponent(q)}`); else setSearch(true); }}
            className="tv-rise tv-glass mx-auto mt-5 flex max-w-[540px] items-center gap-2 rounded-full p-1.5 pl-4 sm:mt-8 lg:mx-0" style={{ animationDelay: ".6s" }}>
            <Search size={18} className="shrink-0 text-[#f3c77a]" />
            <div className="relative min-w-0 flex-1">
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the teachings" className="h-9 w-full bg-transparent text-[13px] text-white outline-none sm:h-11 sm:text-[14px]" />
              {!q && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-[13px] text-white/55 sm:text-[14px]">Search&nbsp;<span className="caret text-white/85">{hint}</span></span>}
            </div>
            <button className="tv-flow inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[12.5px] font-semibold text-[#2a0d03] sm:h-11 sm:px-6 sm:text-[13.5px]">Search</button>
          </form>
          <div className="tv-rise mx-auto mt-3.5 flex max-w-[540px] flex-wrap justify-center gap-1.5 lg:mx-0 lg:justify-start" style={{ animationDelay: ".75s" }}>
            {CHIPS.map(([l, k], i) => <Link key={k} href={`/search?q=${k}`} className={`${i > 3 ? "max-sm:hidden" : ""} rounded-full border border-[#f3b363]/30 bg-white/5 px-3 py-1 text-[11.5px] text-[#ffe2b8] backdrop-blur transition hover:border-[#f3c77a] hover:bg-white/10 sm:text-[12px]`}>{l}</Link>)}
          </div>
        </div>
      </div>

      {/* what is gathered here, counted */}
      <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-12 sm:px-10 sm:pb-14">
        <div className="tv-rise tv-glass grid grid-cols-3 divide-x divide-[#f3b363]/15 rounded-2xl py-3 sm:grid-cols-6 sm:rounded-full sm:py-3.5" style={{ animationDelay: ".9s" }}>
          {stats.map((s, i) => (
            <div key={s.label} className={`px-2 text-center ${i > 2 ? "max-sm:mt-3 max-sm:border-t max-sm:border-[#f3b363]/15 max-sm:pt-3" : ""} ${i === 3 ? "max-sm:!border-l-0" : ""}`}>
              <p className="text-[17px] font-semibold tabular-nums leading-none text-white sm:text-[22px]"><CountUp to={s.n} /></p>
              <p className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#f3c77a]/80 sm:text-[10.5px]">{s.label}</p>
            </div>
          ))}
        </div>
        <a href="#v2-next" aria-label="Scroll down" className="tv-bob absolute bottom-3 left-1/2 hidden -translate-x-1/2 text-[#f3c77a]/70 sm:block"><ArrowDown size={16} /></a>
      </div>
      {/* the Indian fringe along the lower edge */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-6 overflow-hidden"><VMask name="border-4" repeat="repeat-x" size="auto 100%" pos="center bottom" className="h-full w-full text-[#e8c766] opacity-60" /></div>
    </section>
  );
}
