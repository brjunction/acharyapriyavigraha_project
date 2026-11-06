"use client";
/* Śrīla Gurudeva’s three instructions (New York, July 1994), and his words on Śrīla Prabhupāda.
   The words are exactly as published; only their presentation is designed here. */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { BlessingLetters } from "@/components/home/live";
import { FOUNDER_STEPS } from "@/components/home/home-data";

const THREE: { n: string; lead: string; bold: string; rest: string }[] = [
  { n: "1", lead: "One is that", bold: "I want to preach to the preachers.", rest: "It causes me so much pain to see the devotees falling down and going away." },
  { n: "2", lead: "The second point is that", bold: "I want to show how everything is in Śrīla Prabhupāda’s books.", rest: "Those persons who are saying that Śrīla Prabhupāda only gave ABC, cause me so much pain in my heart, thus I want to make them silent." },
  { n: "3", lead: "The third thing is that", bold: "I want to show how all the tattvas, higher teachings, are in ISKCON,", rest: "so there is no need to go anywhere else." },
];

export const ON_PRABHUPADA: { title: string; text: string; place: string }[] = [
  { title: "Not just a mantra-dātā-guru", place: "Bhubaneswar, 6 November 1991", text: "Śrīla Prabhupāda is not just a mantra-dātā-guru, one who gives mantra. Rather, he is a kṛṣṇa-dātā-guru and an āśraya-dātā-guru, one who comes to give Kṛṣṇa and give shelter. He taught how to tread the devotional path leading to Vaikuṇṭha. Like a primary school teacher who catches hold of the hand of the child and teaches, “Write ‘A B C.’” Catching hold of our hand, he taught what others cannot because they do not know." },
  { title: "What nonsense!", place: "Bhubaneswar, 17 June 1992", text: "“He who says that Bhaktivedānta Swāmī only gave the ‘A, B, C’ and not higher teachings, is a fool. He is a fool. He is a great offender. I will crush his head. What nonsense! They cannot understand what Bhaktivedānta Swāmī has said. So now, they are husking the husk. Such dull-headed fellows!”" },
  { title: "Leaving the ISKCON camp?", place: "Bhubaneswar, 6 November 1991", text: "“My Guru Mahārāja was a gṛhastha, living in his home. But he got the complete mercy of Śrīla Bhaktisiddhānta and Śrīla Bhaktivinoda Ṭhākura. I will ask them, ‘Who came to the West? Who sowed the seed? Who laid the foundation of Kṛṣṇa consciousness? Who fulfilled the desire of Śrī Gaurāṅga Mahāprabhu? Śrīla Prabhupāda was specially empowered. Now you are going elsewhere, leaving the ISKCON camp? You are such fools! Thereby you have committed such an offense.’”" },
  { title: "Tolerate and co-operate!", place: "Bhubaneswar, 6 March 1993", text: "My Guru Mahārāja, Śrīla A. C. Bhaktivedānta Swami Prabhupāda, gave the same instruction. The last instruction he gave was, “Tolerate and co-operate!” So many obstructions, impediments, sufferings, pain, and unexpected things will come. Insults will come. No praise, but all blame will come to you. Tolerate, tolerate, tolerate, and co-operate. Then you will pass the test! You will get the mercy of the Lord, Mahāprabhu’s mercy, Nityānanda Prabhu’s mercy, Kṛṣṇa’s mercy. All glory will come. It may not come in this very lifetime, but it must come." },
];

/** true once the element has scrolled into view (then stays true). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.18 }); io.observe(el); return () => io.disconnect(); }, []);
  return [ref, on] as const;
}
/** Small lights rising slowly through the mission band: [left %, delay s, duration s, size px]. */
const SPARKS: [number, number, number, number][] = [[6, 0, 16, 3], [14, 5, 21, 2], [23, 9, 18, 4], [31, 2, 24, 2], [42, 12, 19, 3], [51, 6, 23, 2], [60, 1, 17, 3], [68, 10, 22, 2], [77, 4, 20, 4], [85, 8, 25, 2], [93, 3, 18, 3], [47, 15, 26, 2]];
const mask = (url: string): React.CSSProperties => ({ WebkitMask: `url(${url}) center / contain no-repeat`, mask: `url(${url}) center / contain no-repeat`, background: "currentColor" });
const Sign = ({ className = "", draw }: { className?: string; draw?: boolean }) => <span role="img" data-draw={draw === undefined ? undefined : draw ? "on" : "off"} aria-label="Signature of Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className={`gi-sign block aspect-[1112/271] ${className}`} style={mask("/gurudeva-sign-mask.png")} />;

/** “There are three things that are very important to me” — a dark, quiet band with the ISKCON lotus and his signature.
 *  `intro` (optional) is a line above it, e.g. how Śrīla Guru Mahārāja serves these three instructions. */
export function ThreeThings({ intro, kicker = "Śrīla Gurudeva’s mission", bg = "#3a0f0a", glow = "#e8b872", accent = "#f3c77a" }: { intro?: string; kicker?: string; bg?: string; glow?: string; accent?: string }) {
  const [ref, on] = useInView<HTMLElement>();
  return (
    <section ref={ref} data-in={on ? "on" : "off"} className="gi-band gi-dark relative isolate overflow-hidden py-16 text-white sm:py-24" style={{ background: bg, ["--gi-accent" as any]: accent }}>
      <div aria-hidden className="gi-glow absolute left-1/2 top-[-30%] -z-10 size-[700px] -translate-x-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${glow}2e, transparent 62%)` }} />
      <span aria-hidden className="gi-watermark pointer-events-none absolute left-1/2 top-[38%] -z-10 aspect-[544/322] w-[640px] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[900px]" style={{ ...mask("/iskcon-lotus-mask.png"), color: accent }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">{SPARKS.map(([l, d, t, z], k) => <span key={k} className="gi-spark absolute bottom-[-10px] rounded-full" style={{ left: `${l}%`, width: z, height: z, background: accent, animationDuration: `${t}s`, animationDelay: `${d}s` }} />)}</div>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ background: `radial-gradient(60% 55% at 50% 0%, ${glow}33, transparent 70%), radial-gradient(40% 40% at 90% 100%, ${glow}22, transparent 70%)` }} />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="text-center">
          <span aria-label="ISKCON" role="img" className="gi-in gi-lotus mx-auto block h-16 w-[76px] sm:h-20 sm:w-[95px]" style={{ ...mask("/iskcon-mask.png"), color: accent }} />
          <p className="gi-in mt-5 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: accent, ["--d" as any]: ".15s" }}><span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, transparent, ${accent})` }} />{kicker}<span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} /></p>
          <h2 style={{ ["--d" as any]: ".25s" }} className="gi-in gi-shine mx-auto mt-3 max-w-[760px] font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[38px]" >There are three things that are very important to me</h2>
          {intro && <p style={{ ["--d" as any]: ".35s" }} className="gi-in mx-auto mt-4 max-w-[640px] text-[14px] leading-relaxed text-white/70 sm:text-[15px]">{intro}</p>}
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {THREE.map((t, k) => (
            <li key={t.n} style={{ ["--d" as any]: `${0.45 + k * 0.15}s` }} className="gi-in group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] backdrop-blur-sm transition duration-500 hover:-translate-y-1.5 hover:border-white/20 sm:p-7">
              <span aria-hidden className="absolute inset-x-6 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
              <span aria-hidden className="absolute -right-3 -top-6 text-[120px] font-black leading-none opacity-[0.07] transition group-hover:opacity-[0.12]" style={{ color: accent }}>{t.n}</span>
              <span className="gi-num relative flex size-10 items-center justify-center rounded-full text-[15px] font-bold" style={{ background: accent, color: bg, ["--ring" as any]: accent }}>{t.n}</span>
              <p className="relative mt-5 text-[13px] text-white/60">{t.lead}</p>
              <p className="relative mt-1 font-display text-[17px] font-bold leading-snug sm:text-[19.5px]" style={{ color: accent }}>{t.bold}</p>
              <p className="relative mt-3 text-[14px] leading-relaxed text-white/80">{t.rest}</p>
            </li>
          ))}
        </ol>
        <div style={{ ["--d" as any]: "1s" }} className="gi-in mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <Sign className="w-[200px] sm:w-[240px]" draw={on} />
          <p className="text-[13px] text-white/60">Śrī Śrīmad Gour Govinda Swāmī Gurudeva · New York, July 1994</p>
        </div>
      </div>
    </section>
  );
}

/** Śrīla Gurudeva on Śrīla Prabhupāda: four passages, one at a time — Śrīla Prabhupāda’s portrait, the passage in large type,
 *  and the four titles as cards with a progress line that moves on by itself. */
export function OnPrabhupada({ kicker = "Śrīla Gurudeva on Śrīla Prabhupāda", title = "Everything is in Śrīla Prabhupāda’s books", accent = "var(--saffron)", portrait = "/legacy/prabhupada.webp" }: { kicker?: string; title?: string; accent?: string; portrait?: string }) {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false); const [tick, setTick] = useState(0);
  const MS = 14000;
  useEffect(() => { if (paused) return; const t = setTimeout(() => { setI((x) => (x + 1) % ON_PRABHUPADA.length); setTick((k) => k + 1); }, MS); return () => clearTimeout(t); }, [paused, i]);
  const go = (k: number) => { setI((k + ON_PRABHUPADA.length) % ON_PRABHUPADA.length); setPaused(true); setTick((x) => x + 1); };
  const q = ON_PRABHUPADA[i]; const [ref, on] = useInView<HTMLElement>();
  return (
    <section ref={ref} data-in={on ? "on" : "off"} className="gi-band relative isolate overflow-hidden bg-[linear-gradient(180deg,#fffaf2_0%,#fbf0dd_100%)] py-16 sm:py-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div aria-hidden className="op-drift absolute -left-40 top-10 -z-10 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(243,179,99,.25),transparent)]" />
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
          {/* Śrīla Prabhupāda within a golden halo */}
          <div style={{ ["--d" as any]: ".1s" }} className="gi-in relative mx-auto w-[210px] sm:w-[260px] lg:w-full">
            <span aria-hidden className="op-halo absolute left-1/2 top-[46%] -z-10 aspect-square w-[96%] rounded-full" />
            <span aria-hidden className="op-ring absolute left-1/2 top-[46%] -z-10 aspect-square w-[108%] rounded-full border border-dashed" style={{ borderColor: "rgba(133,53,0,.25)" }} />
            <span aria-hidden className="absolute left-1/2 top-[46%] -z-10 aspect-square w-[122%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e8c766]/40" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" className="gi-float relative mx-auto block w-full object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_80%,transparent)]" loading="lazy" />
            <p className="relative -mt-4 text-center"><span className="inline-block rounded-full bg-white/90 px-4 py-1.5 text-[11.5px] font-semibold text-saffron-ink shadow-[0_10px_24px_-14px_rgba(120,60,10,.6)] ring-1 ring-[#efe2cb] backdrop-blur">Śrīla A.C. Bhaktivedanta Swami Prabhupāda</span></p>
          </div>
          <div style={{ ["--d" as any]: ".25s" }} className="gi-in min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]" style={{ color: accent }}>{kicker}</p>
            <h2 className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[32px] lg:text-[36px]">{title}</h2>
            {/* the words, on a white card with a fine golden edge */}
            <div className="mt-7 rounded-[26px] bg-[linear-gradient(140deg,#f3c77a,#e8913c_40%,rgba(232,145,60,.15)_70%,#f3c77a)] p-[1.5px] shadow-[0_34px_60px_-40px_rgba(120,60,10,.7)]">
              <figure key={i} className="gi-rise relative overflow-hidden rounded-[25px] bg-white px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
                <span aria-hidden className="pointer-events-none absolute -right-2 -top-10 select-none text-[180px] font-bold leading-none text-[#f7e6cf]">”</span>
                <p className="relative inline-flex items-center gap-2 rounded-full bg-[#fbf0dd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-saffron-ink"><span className="size-1.5 rounded-full bg-saffron" />{q.title}</p>
                <blockquote className="relative mt-4 text-[15px] font-medium leading-[1.75] text-ink sm:text-[18.5px] sm:leading-[1.7]">{q.text}</blockquote>
                <figcaption className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#f1e6d3] pt-5">
                  <Sign key={i} className="w-[130px] sm:w-[170px]" draw={on} />
                  <span className="text-[12px] text-ink-3 sm:text-[12.5px]">Śrī Śrīmad Gour Govinda Swāmī Gurudeva · {q.place}</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
        <div style={{ ["--d" as any]: ".45s" }} className="gi-in mt-10 flex items-stretch gap-3">
          <div className="-mx-5 flex min-w-0 flex-1 snap-x gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0" role="tablist">
            {ON_PRABHUPADA.map((x, k) => (
              <button key={x.title} role="tab" aria-selected={k === i} onClick={() => go(k)}
                className={`group relative w-[210px] shrink-0 snap-start overflow-hidden rounded-2xl p-4 text-left transition duration-300 sm:w-auto ${k === i ? "bg-white shadow-[0_18px_34px_-22px_rgba(120,60,10,.6)] ring-1 ring-[#f3c77a]" : "bg-white/50 ring-1 ring-[#efe2cb] hover:bg-white"}`}>
                <span className="flex items-center gap-2"><span className={`flex size-6 items-center justify-center rounded-full text-[10.5px] font-semibold tabular-nums transition ${k === i ? "bg-saffron text-white" : "bg-[#fbf0dd] text-saffron-ink"}`}>{k + 1}</span><span className="text-[11px] tabular-nums text-ink-3">{x.place.split(",")[1]?.trim()}</span></span>
                <span className={`mt-2 block text-[13.5px] font-semibold leading-snug ${k === i ? "text-ink" : "text-ink-2"}`}>{x.title}</span>
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#f1e6d3]" />
                {k === i && <span key={tick} className="absolute bottom-0 left-0 h-[3px] bg-[linear-gradient(90deg,#e8913c,#853500)]" style={{ width: paused ? "100%" : undefined, animation: paused ? undefined : `gi-progress ${MS}ms linear forwards` }} />}
              </button>
            ))}
          </div>
          <div className="hidden flex-col justify-center gap-2 sm:flex">
            <button onClick={() => go(i - 1)} aria-label="Previous" className="flex size-10 items-center justify-center rounded-full bg-white text-saffron-ink ring-1 ring-[#efe2cb] transition hover:ring-saffron"><ChevronLeft size={18} /></button>
            <button onClick={() => go(i + 1)} aria-label="Next" className="flex size-10 items-center justify-center rounded-full bg-white text-saffron-ink ring-1 ring-[#efe2cb] transition hover:ring-saffron"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* The two light bands that open the home page, built the way the mission band is: an emblem, a kicker between fine lines,
   a shining title, cards with a hairline of colour along the top, small lights rising, and a closing line with a rule above. */
const LIGHT = { bg: "linear-gradient(180deg,#fffaf2 0%,#fbf0dd 100%)", accent: "#a8430a", glow: "#f3b363" };
function LightBand({ children, on, bandRef, bg = LIGHT.bg }: { children: React.ReactNode; on: boolean; bandRef: React.Ref<HTMLElement>; bg?: string }) {
  return (
    <section ref={bandRef} data-in={on ? "on" : "off"} className="gi-band relative isolate overflow-hidden py-16 sm:py-24" style={{ background: bg, ["--gi-accent" as any]: LIGHT.accent }}>
      <div aria-hidden className="gi-glow absolute left-1/2 top-[-30%] -z-10 size-[700px] -translate-x-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${LIGHT.glow}40, transparent 62%)` }} />
      <span aria-hidden className="gi-watermark pointer-events-none absolute left-1/2 top-[40%] -z-10 aspect-[544/322] w-[640px] max-w-none -translate-x-1/2 -translate-y-1/2 !opacity-[0.05] sm:w-[900px]" style={{ ...mask("/iskcon-lotus-mask.png"), color: LIGHT.accent }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">{SPARKS.map(([l, d, t, z], k) => <span key={k} className="gi-spark absolute bottom-[-10px] rounded-full" style={{ left: `${l}%`, width: z, height: z, background: LIGHT.glow, color: LIGHT.glow, animationDuration: `${t}s`, animationDelay: `${d}s` }} />)}</div>
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT.glow}, transparent)` }} />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">{children}</div>
    </section>
  );
}
const LKicker = ({ children, d }: { children: React.ReactNode; d: string }) => (
  <p className="gi-in mt-5 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: LIGHT.accent, ["--d" as any]: d }}><span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT.accent})` }} />{children}<span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, ${LIGHT.accent}, transparent)` }} /></p>
);
const CARD = "gi-in group relative overflow-hidden rounded-3xl border border-[#efe2cb] bg-white/80 p-6 shadow-[0_30px_60px_-36px_rgba(120,60,10,.45)] backdrop-blur-sm transition duration-500 hover:-translate-y-1.5 hover:border-[#e8c79a] sm:p-7";
const Hairline = () => <span aria-hidden className="absolute inset-x-6 top-0 h-px opacity-80" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT.glow}, transparent)` }} />;

/** “Kṛṣṇa sent him.” — Śrīla Prabhupāda and Śrīla Gurudeva as two portraits joined at the top, then Śrīla Prabhupāda’s two sentences as cards. */
export function KrishnaSentBand() {
  const [ref, on] = useInView<HTMLElement>();
  const words: [string, string, string][] = [["“He’s a good boy. … Yes. Yes. He’s organizing nicely.”", "In the same conversation", "Room conversation · Bombay, 5 January 1977"], ["“Krishna is with you and there is no need of disappointment.”", "Śrīla Prabhupāda’s letter to Śrīla Gurudeva", "Māyāpur, 12 February 1976"]];
  return (
    <LightBand on={on} bandRef={ref}>
      <div className="text-center">
        <div className="gi-in gi-lotus mx-auto flex w-fit items-center">
          {([["/legacy/prabhupada.webp", "Śrīla Prabhupāda", "object-[50%_10%]"], ["/legacy/gurudeva.webp", "Śrīla Gurudeva", "object-[50%_8%]"]] as const).map(([src, alt, pos], k) => (
            <span key={src} className={`relative block size-[76px] overflow-hidden rounded-full bg-[#fbf0dd] ring-[3px] ring-white shadow-[0_14px_30px_-14px_rgba(120,60,10,.7)] sm:size-[92px] ${k ? "-ml-4" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className={`h-full w-full scale-[1.45] object-cover ${pos} origin-[50%_0%] translate-y-[6%]`} loading="lazy" />
            </span>))}
        </div>
        <LKicker d=".15s">Śrīla Prabhupāda on Śrīla Gurudeva</LKicker>
        <h2 style={{ ["--d" as any]: ".25s" }} className="gi-in gi-shine-ink mx-auto mt-3 max-w-[760px] font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[46px]">“Kṛṣṇa sent him.”</h2>
        <p style={{ ["--d" as any]: ".32s" }} className="gi-in mt-2 text-[13px] text-ink-3">Room conversation · Bombay, 5 January 1977</p>
      </div>
      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {words.map(([q, who, where], k) => (
          <li key={q} style={{ ["--d" as any]: `${0.4 + k * 0.15}s` }} className={CARD}>
            <Hairline />
            <span aria-hidden className="absolute -right-2 -top-10 font-display text-[150px] font-black leading-none text-[#a8430a] opacity-[0.06] transition group-hover:opacity-[0.1]">”</span>
            <span className="gi-num relative flex size-10 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: LIGHT.accent, ["--ring" as any]: LIGHT.accent }}>{k + 1}</span>
            <p className="relative mt-5 text-[13px] text-ink-3">{who}</p>
            <p className="relative mt-1 font-display text-[18px] font-bold leading-snug sm:text-[21px]" style={{ color: LIGHT.accent }}>{q}</p>
            <p className="relative mt-3 text-[13.5px] text-ink-2">{where}</p>
          </li>))}
      </ol>
      <div style={{ ["--d" as any]: ".8s" }} className="gi-in mt-6 border-t border-[#efe2cb] pt-1"><BlessingLetters /></div>
    </LightBand>
  );
}

/** How Taptajīvanam began — Śrīla Guru Mahārāja’s portrait as the emblem, then the six steps as cards; the wish of 2019 lit in saffron. */
export function FounderBand() {
  const [ref, on] = useInView<HTMLElement>();
  return (
    <LightBand on={on} bandRef={ref} bg="linear-gradient(180deg,#fbf0dd 0%,#fffaf2 100%)">
      <div className="text-center">
        <span className="gi-in gi-lotus relative mx-auto block size-[92px] overflow-hidden rounded-full ring-[3px] ring-white shadow-[0_14px_30px_-14px_rgba(120,60,10,.7)] sm:size-[104px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="h-full w-full object-cover object-top" loading="lazy" />
        </span>
        <LKicker d=".15s">The founder</LKicker>
        <h2 style={{ ["--d" as any]: ".25s" }} className="gi-in gi-shine-ink mx-auto mt-3 max-w-[760px] font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[38px]">How Taptajīvanam began</h2>
        <p style={{ ["--d" as any]: ".35s" }} className="gi-in mx-auto mt-4 max-w-[640px] text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">Śrīla Haladhara Swāmī Guru Mahārāja, ISKCON Guru and Sannyāsī, travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FOUNDER_STEPS.map(([y, t, d], k) => {
          const hi = k === 3;
          return (
            <li key={y} style={{ ["--d" as any]: `${0.4 + k * 0.1}s`, ...(hi ? { background: "linear-gradient(150deg,#c2621d,#853500 70%)" } : {}) }} className={hi ? "gi-in group relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_30px_60px_-30px_rgba(133,53,0,.8)] transition duration-500 hover:-translate-y-1.5 sm:p-7" : CARD}>
              {!hi && <Hairline />}
              <span aria-hidden className={`absolute -right-2 -top-5 font-display text-[78px] font-black leading-none tabular-nums transition ${hi ? "text-white opacity-[0.12]" : "text-[#a8430a] opacity-[0.07] group-hover:opacity-[0.11]"}`}>{y}</span>
              <span className={`gi-num relative inline-flex h-9 items-center justify-center rounded-full px-3.5 text-[12.5px] font-bold tabular-nums ${hi ? "bg-white text-[#853500]" : "text-white"}`} style={hi ? { ["--ring" as any]: "#fff" } : { background: LIGHT.accent, ["--ring" as any]: LIGHT.accent }}>{y}</span>
              <p className={`relative mt-5 font-display text-[17px] font-bold leading-snug sm:text-[19px] ${hi ? "text-white" : ""}`} style={hi ? undefined : { color: LIGHT.accent }}>{t}</p>
              <p className={`relative mt-2 text-[13.5px] leading-relaxed ${hi ? "text-white/85" : "text-ink-2"}`}>{d}</p>
            </li>);
        })}
      </ol>
      <div style={{ ["--d" as any]: "1s" }} className="gi-in mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#efe2cb] pt-7 sm:flex-row">
        <p className="text-[13px] text-ink-3"><span className="font-semibold text-ink">Śrīla Haladhara Swāmī Guru Mahārāja</span> · Founder of Taptajīvanam</p>
        <Link href="/about/founder" className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: LIGHT.accent }}>Read his biography<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></Link>
      </div>
    </LightBand>
  );
}
