"use client";
/* Śrīla Gurudeva’s three instructions (New York, July 1994), and his words on Śrīla Prabhupāda.
   The words are exactly as published; only their presentation is designed here. */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
const mask = (url: string): React.CSSProperties => ({ WebkitMask: `url(${url}) center / contain no-repeat`, mask: `url(${url}) center / contain no-repeat`, background: "currentColor" });
const Sign = ({ className = "", draw }: { className?: string; draw?: boolean }) => <span role="img" data-draw={draw === undefined ? undefined : draw ? "on" : "off"} aria-label="Signature of Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className={`gi-sign block aspect-[1112/271] ${className}`} style={mask("/gurudeva-sign-mask.png")} />;

/** “There are three things that are very important to me” — a dark, quiet band with the ISKCON lotus and his signature.
 *  `intro` (optional) is a line above it, e.g. how Śrīla Guru Mahārāja serves these three instructions. */
export function ThreeThings({ intro, kicker = "Śrīla Gurudeva’s mission", bg = "#3a0f0a", glow = "#e8b872", accent = "#f3c77a" }: { intro?: string; kicker?: string; bg?: string; glow?: string; accent?: string }) {
  const [ref, on] = useInView<HTMLElement>();
  return (
    <section ref={ref} data-in={on ? "on" : "off"} className="gi-band relative isolate overflow-hidden py-16 text-white sm:py-24" style={{ background: bg }}>
      <div aria-hidden className="gi-glow absolute left-1/2 top-[-30%] -z-10 size-[700px] -translate-x-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${glow}2e, transparent 62%)` }} />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ background: `radial-gradient(60% 55% at 50% 0%, ${glow}33, transparent 70%), radial-gradient(40% 40% at 90% 100%, ${glow}22, transparent 70%)` }} />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="text-center">
          <span aria-label="ISKCON" role="img" className="gi-in gi-lotus mx-auto block h-16 w-[76px] sm:h-20 sm:w-[95px]" style={{ ...mask("/iskcon-mask.png"), color: accent }} />
          <p className="gi-in mt-5 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: accent, ["--d" as any]: ".15s" }}><span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, transparent, ${accent})` }} />{kicker}<span className="h-px w-8 sm:w-14" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} /></p>
          <h2 style={{ ["--d" as any]: ".25s" }} className="gi-in mx-auto mt-3 max-w-[760px] font-display text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[38px]">There are three things that are very important to me</h2>
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
    <section ref={ref} data-in={on ? "on" : "off"} className="gi-band relative isolate overflow-hidden bg-band py-16 sm:py-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span aria-hidden className="pointer-events-none absolute -left-10 top-6 -z-10 select-none font-serif text-[260px] leading-none opacity-[0.06] sm:text-[420px]" style={{ color: accent }}>“</span>
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 -z-10 size-[520px] rounded-full opacity-40" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 25%, transparent), transparent 65%)` }} />
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
          <div style={{ ["--d" as any]: ".1s" }} className="gi-in relative mx-auto w-[170px] sm:w-[220px] lg:w-full">
            <div aria-hidden className="absolute inset-x-[6%] bottom-0 top-[18%] rounded-[40%_40%_24px_24px]" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 22%, transparent), color-mix(in srgb, ${accent} 8%, transparent))` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" className="gi-float relative mx-auto block w-full object-contain object-bottom" loading="lazy" />
            <p className="relative mt-3 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">Śrīla Prabhupāda</p>
          </div>
          <div style={{ ["--d" as any]: ".25s" }} className="gi-in">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: accent }}>{kicker}</p>
            <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">{title}</h2>
            <figure key={i} className="gi-rise mt-6 sm:mt-8">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-3">{q.title}</p>
              <blockquote className="mt-3 border-l-[3px] pl-4 text-[15.5px] font-medium leading-[1.75] text-ink sm:pl-6 sm:text-[19px] sm:leading-[1.7]" style={{ borderColor: accent }}>{q.text}</blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 pl-4 sm:pl-6">
                <Sign key={i} className="w-[140px] sm:w-[190px]" draw={on} />
                <span className="text-[12.5px] text-ink-3">Śrī Śrīmad Gour Govinda Swāmī Gurudeva · {q.place}</span>
              </figcaption>
            </figure>
          </div>
        </div>
        <div style={{ ["--d" as any]: ".45s" }} className="gi-in -mx-5 mt-10 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0" role="tablist">
          {ON_PRABHUPADA.map((x, k) => (
            <button key={x.title} role="tab" aria-selected={k === i} onClick={() => go(k)}
              className={`relative w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border p-4 text-left transition sm:w-auto ${k === i ? "border-transparent bg-surface shadow-[var(--shadow-md)]" : "border-line bg-surface/60 hover:bg-surface"}`}>
              <span className="text-[11px] font-semibold tabular-nums text-ink-3">0{k + 1} · {x.place.split(",")[1]?.trim()}</span>
              <span className={`mt-1 block text-[14px] font-bold leading-snug ${k === i ? "text-ink" : "text-ink-2"}`}>{x.title}</span>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-line" />
              {k === i && <span key={tick} className="absolute bottom-0 left-0 h-[3px]" style={{ background: accent, width: paused ? "100%" : undefined, animation: paused ? undefined : `gi-progress ${MS}ms linear forwards` }} />}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={() => go(i - 1)} aria-label="Previous" className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-2 transition hover:text-ink"><ChevronLeft size={18} /></button>
          <button onClick={() => go(i + 1)} aria-label="Next" className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-2 transition hover:text-ink"><ChevronRight size={18} /></button>
        </div>
      </div>
    </section>
  );
}
