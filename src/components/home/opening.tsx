"use client";
/* The two sections after the hero.
   “Kṛṣṇa sent him.” — the words set large like a page, a golden ring drawing itself around Śrīla Prabhupāda and Śrīla Gurudeva,
   and the conversation and the letter as two sheets of paper that open to be read in full.
   How Taptajīvanam began — one golden line that draws itself through the years, each year a point on it. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { FOUNDER_STEPS } from "@/components/home/home-data";
import { Padma } from "@/components/motifs";

function useInView<T extends HTMLElement>(margin = "-12%") {
  const ref = useRef<T>(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: `0px 0px ${margin} 0px` });
    io.observe(el); return () => io.disconnect();
  }, [margin]);
  return [ref, on] as const;
}
const mark = (t: string) => t.split(/«|»/).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-[#fbecc8] px-0.5 font-medium text-ink">{p}</mark> : p));

/** The full conversation or letter, in a quiet reading window. */
function Reading({ which, onClose }: { which: "c" | "l"; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="op-fade fixed inset-0 z-[90] flex items-center justify-center bg-[#2a0d03]/45 p-3 backdrop-blur-sm sm:p-8" onClick={onClose}>
      <div className="op-rise flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-[#fffdf8] shadow-[0_40px_100px_-30px_rgba(0,0,0,.6)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#efe4cf] px-6 py-4 sm:px-8">
          <div><p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p><p className="mt-1 text-[16px] font-semibold text-ink sm:text-[18px]">{which === "c" ? CONVERSATION.title : LETTER.title}</p></div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"><X size={17} /></button>
        </div>
        <div className="overflow-y-auto px-6 py-6 text-[14.5px] leading-[1.8] text-ink-2 sm:px-10 sm:text-[15.5px]">
          {which === "c"
            ? <>{CONVERSATION.lines.map(([w, l], i) => <p key={i} className="mb-3"><span className={`mr-2 text-[12.5px] font-semibold ${w === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{w}</span>{mark(l)}</p>)}<p className="mt-5 text-[12px] text-ink-3">{CONVERSATION.speakers}</p></>
            : <><p className="text-[12px] text-ink-3">{LETTER.ref}</p><p className="mt-4 font-medium text-ink">{LETTER.salutation}</p>{LETTER.paras.map((p, i) => <p key={i} className="mt-3">{mark(p)}</p>)}<div className="mt-5 text-ink">{LETTER.closing.map((c) => <p key={c}>{c}</p>)}</div></>}
        </div>
      </div>
    </div>
  );
}

/** A sheet of paper: a ruled page, a saffron seal, the date, one line, and “Read”. */
function Sheet({ kind, date, line, tilt, onOpen, delay }: { kind: string; date: string; line: string; tilt: string; onOpen: () => void; delay: string }) {
  return (
    <button onClick={onOpen} style={{ ["--t" as any]: tilt, transitionDelay: delay }}
      className="op-sheet group relative w-full overflow-hidden rounded-[6px_14px_14px_6px] bg-[#fffdf7] p-5 pb-4 text-left shadow-[0_24px_40px_-24px_rgba(90,40,5,.55),0_2px_6px_-2px_rgba(90,40,5,.15)] ring-1 ring-[#efe2cb] sm:p-6 sm:pb-5">
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background:repeating-linear-gradient(180deg,transparent_0,transparent_27px,#f3e7d3_27px,#f3e7d3_28px)]" />
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,#e8913c,#853500)]" />
      <span className="relative flex items-start justify-between gap-3">
        <span><span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-saffron">{kind}</span><span className="mt-0.5 block text-[12px] text-ink-3">{date}</span></span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#d9782a,#853500)] text-[#fff1da] shadow-[0_6px_12px_-4px_rgba(133,53,0,.7),inset_0_-2px_4px_rgba(0,0,0,.25)] transition duration-500 group-hover:rotate-[20deg]"><Padma className="size-4" layers={2} /></span>
      </span>
      <span className="relative mt-4 block text-[15px] font-medium leading-[28px] text-ink sm:text-[16px]">{line}</span>
      <span className="relative mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-saffron">Read in full<ArrowUpRight size={14} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
    </button>
  );
}

export function KrishnaSentOpening() {
  const [ref, on] = useInView<HTMLElement>();
  const [open, setOpen] = useState<"c" | "l" | null>(null);
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[#fffaf3] py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_78%_45%,rgba(243,179,99,.22),transparent_70%),radial-gradient(50%_50%_at_10%_90%,rgba(232,145,60,.1),transparent_70%)]" />
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        {/* the two of them, inside a ring that draws itself */}
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:order-2 lg:max-w-[480px]">
          <div className="relative aspect-square">
            <span aria-hidden className="op-light absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,236,200,1)_0%,rgba(250,214,160,.55)_45%,transparent_70%)]" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="100" cy="100" r="96" fill="none" stroke="#efdcc0" strokeWidth=".5" />
              <circle cx="100" cy="100" r="96" fill="none" stroke="url(#op-g)" strokeWidth="1.2" strokeLinecap="round" pathLength={100} className="op-draw" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="#e8c79a" strokeWidth=".4" strokeDasharray=".6 2.4" className="op-turn" style={{ transformOrigin: "100px 100px" }} />
              <defs><linearGradient id="op-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3c77a" /><stop offset=".5" stopColor="#c2621d" /><stop offset="1" stopColor="#f3c77a" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-[4%] overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/legacy/prabhupada.webp" alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" className="op-p1 absolute bottom-0 left-[2%] w-[60%] object-contain [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/legacy/gurudeva.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="op-p2 absolute bottom-0 right-[2%] w-[56%] object-contain [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]" loading="lazy" />
            </div>
          </div>
          <div className="op-names mt-4 flex items-center justify-center gap-2 whitespace-nowrap text-[11.5px] sm:gap-3 font-medium text-ink-2 sm:text-[12.5px]">
            <span>Śrīla Prabhupāda</span><span className="h-px w-8 bg-gradient-to-r from-[#e8c79a] to-[#c2621d]" /><Padma className="size-3.5 text-saffron" layers={2} /><span className="h-px w-8 bg-gradient-to-l from-[#e8c79a] to-[#c2621d]" /><span>Śrīla Gurudeva</span>
          </div>
        </div>

        {/* the words */}
        <div className="text-center lg:order-1 lg:text-left">
          <p className="op-up flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-saffron sm:text-[11px] sm:tracking-[0.24em] lg:justify-start" style={{ transitionDelay: ".1s" }}><span className="hidden h-px w-10 bg-saffron/50 lg:block" />Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <h2 className="op-up mt-5 font-display text-[44px] font-semibold leading-[1] tracking-[-0.045em] text-[#2b1a10] sm:text-[68px] lg:text-[76px]" style={{ transitionDelay: ".2s" }}>
            <span className="text-[#c2621d]">“</span>Kṛṣṇa<br className="hidden lg:block" /> <span className="relative inline-block">sent him.<svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-[0.22em] w-full sm:-bottom-2" aria-hidden><path d="M3 14 C 70 4, 160 4, 297 10" fill="none" stroke="#e8913c" strokeWidth="5" strokeLinecap="round" pathLength={100} className="op-draw op-draw-late" /></svg></span><span className="text-[#c2621d]">”</span>
          </h2>
          <p className="op-up mt-6 text-[12.5px] text-ink-3 sm:text-[13.5px]" style={{ transitionDelay: ".3s" }}>Śrīla Prabhupāda · Room conversation, Bombay, 5 January 1977</p>
          <div className="mx-auto mt-9 grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-2 lg:mx-0">
            <Sheet kind="The conversation" date="Bombay · 5 January 1977" line="“He’s a good boy. … He’s organizing nicely.”" tilt="-1.5deg" onOpen={() => setOpen("c")} delay=".45s" />
            <Sheet kind="The letter" date="Māyāpur · 12 February 1976" line="“Krishna is with you and there is no need of disappointment.”" tilt="1.2deg" onOpen={() => setOpen("l")} delay=".6s" />
          </div>
        </div>
      </div>
      {open && <Reading which={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/** One golden line through the years; it draws itself, and each year appears as the line reaches it. */
export function FounderJourney() {
  const [ref, on] = useInView<HTMLElement>();
  const n = FOUNDER_STEPS.length; const W = 1200; const xs = FOUNDER_STEPS.map((_, i) => ((i + 0.5) / n) * W); const ys = FOUNDER_STEPS.map((_, i) => (i % 2 ? 150 : 90));
  const d = xs.reduce((p, x, i) => (i === 0 ? `M0,${ys[0] + 30} C${x / 2},${ys[0] + 30} ${x / 2},${ys[0]} ${x},${ys[0]}` : `${p} C${(xs[i - 1] + x) / 2},${ys[i - 1]} ${(xs[i - 1] + x) / 2},${ys[i]} ${x},${ys[i]}`), "") + ` C${(xs[n - 1] + W) / 2},${ys[n - 1]} ${(xs[n - 1] + W) / 2},${ys[n - 1] - 30} ${W},${ys[n - 1] - 30}`;
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[linear-gradient(180deg,#fdf1e2_0%,#fbe6cc_100%)] py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(255,255,255,.7),transparent_70%)]" />
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="max-w-[620px]">
            <p className="op-up flex items-center justify-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-saffron sm:text-[11px] lg:justify-start"><span className="hidden h-px w-10 bg-saffron/50 lg:block" />The founder</p>
            <h2 className="op-up mt-4 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.035em] text-[#2b1a10] sm:text-[48px]" style={{ transitionDelay: ".1s" }}>How Taptajīvanam began</h2>
            <p className="op-up mt-4 text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]" style={{ transitionDelay: ".2s" }}>Śrīla Haladhara Swāmī Guru Mahārāja, ISKCON Guru and Sannyāsī, travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
          </div>
          <Link href="/about/founder" className="op-up group flex shrink-0 items-center gap-3 rounded-full bg-white/70 py-1.5 pl-1.5 pr-5 shadow-[0_18px_36px_-22px_rgba(90,40,5,.6)] ring-1 ring-white backdrop-blur transition hover:-translate-y-0.5" style={{ transitionDelay: ".3s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/haladhara.webp" alt="" className="size-12 rounded-full object-cover object-top ring-2 ring-[#f3c77a]" />
            <span className="text-left"><span className="block text-[13px] font-semibold text-ink">Śrīla Haladhara Swāmī Guru Mahārāja</span><span className="flex items-center gap-1 text-[12px] font-medium text-saffron">Read his biography<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></span></span>
          </Link>
        </div>

        {/* desktop: the line across, years above and below it */}
        <div className="relative mt-14 hidden h-[560px] lg:block">
          <svg viewBox={`0 0 ${W} 240`} preserveAspectRatio="none" className="absolute inset-x-0 top-[170px] h-[240px] w-full" aria-hidden>
            <path d={d} fill="none" stroke="#efd3ad" strokeWidth="1.5" />
            <path d={d} fill="none" stroke="url(#fj-g)" strokeWidth="2.5" strokeLinecap="round" pathLength={100} className="op-draw op-draw-slow" />
            <defs><linearGradient id="fj-g" x1="0" x2="1"><stop offset="0" stopColor="#f3c77a" /><stop offset=".55" stopColor="#c2621d" /><stop offset="1" stopColor="#853500" /></linearGradient></defs>
          </svg>
          {FOUNDER_STEPS.map(([y, t, desc], i) => {
            const hi = i === 3; const up = i % 2 === 0; const top = 170 + ys[i];
            return (
              <div key={y} className="absolute" style={{ left: `${(xs[i] / W) * 100}%`, top }}>
                <span className={`op-node absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full ${hi ? "size-6 bg-[radial-gradient(circle_at_35%_30%,#f3c77a,#c2621d)] shadow-[0_0_0_6px_rgba(232,145,60,.18),0_0_30px_rgba(232,145,60,.7)]" : "size-3.5 border-[3px] border-white bg-[#c2621d] shadow-[0_0_0_4px_rgba(194,98,29,.12)]"}`} style={{ transitionDelay: `${0.6 + i * 0.32}s` }} />
                {hi && <span aria-hidden className="op-pulse absolute left-0 top-0 block size-6 rounded-full border border-[#e8913c]" />}
                <div className={`op-step absolute left-0 w-[176px] -translate-x-1/2 text-center ${up ? "bottom-6" : "top-6"}`} style={{ transitionDelay: `${0.7 + i * 0.32}s` }}>
                  <p className={`font-display text-[22px] font-bold tabular-nums leading-none ${hi ? "text-[#c2621d]" : "text-[#d9a46c]"}`}>{y}</p>
                  <p className={`mt-2 text-[14px] font-semibold leading-snug ${hi ? "text-[#853500]" : "text-ink"}`}>{t}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">{desc}</p>
                </div>
              </div>);
          })}
        </div>

        {/* phone and tablet: the line runs down */}
        <ol className="relative mt-10 space-y-7 pl-8 lg:hidden">
          <span aria-hidden className="op-vline absolute bottom-2 left-[7px] top-2 w-[2px] origin-top rounded-full bg-gradient-to-b from-[#f3c77a] via-[#c2621d] to-[#853500]" />
          {FOUNDER_STEPS.map(([y, t, desc], i) => {
            const hi = i === 3;
            return (
              <li key={y} className="op-step relative" style={{ transitionDelay: `${0.3 + i * 0.15}s` }}>
                <span className={`absolute top-1 -translate-x-1/2 rounded-full ${hi ? "-left-[25px] size-5 bg-[radial-gradient(circle_at_35%_30%,#f3c77a,#c2621d)] shadow-[0_0_20px_rgba(232,145,60,.7)]" : "-left-[25px] size-3.5 translate-y-0.5 border-[3px] border-[#fdf1e2] bg-[#c2621d]"}`} />
                <p className={`font-display text-[18px] font-bold tabular-nums leading-none ${hi ? "text-[#c2621d]" : "text-[#d9a46c]"}`}>{y}</p>
                <p className={`mt-1.5 text-[14.5px] font-semibold ${hi ? "text-[#853500]" : "text-ink"}`}>{t}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{desc}</p>
              </li>);
          })}
        </ol>
      </div>
    </section>
  );
}
