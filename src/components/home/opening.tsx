"use client";
/* The two sections after the hero.
   “Kṛṣṇa sent him.” — Śrīla Prabhupāda and Śrīla Gurudeva side by side, his words beside them; the conversation and the letter open in full.
   How Taptajīvanam began — one golden line that draws itself through the years, each year a point on it. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { FOUNDER_STEPS } from "@/components/home/home-data";
import { VMask, Padma } from "@/components/motifs";

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

/** “Kṛṣṇa sent him.” — Śrīla Prabhupāda and Śrīla Gurudeva side by side, and Śrīla Prabhupāda’s words beside them, plainly set. */
export function KrishnaSentOpening() {
  const [ref, on] = useInView<HTMLElement>();
  const [open, setOpen] = useState<"c" | "l" | null>(null);
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[#fffaf3] py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_25%_55%,rgba(243,179,99,.16),transparent_70%)]" />
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="op-up grid grid-cols-2 items-end gap-2 sm:gap-4 lg:order-2" aria-label="Śrīla Prabhupāda and Śrīla Gurudeva">
          {([["/legacy/prabhupada.webp", "Śrīla A.C. Bhaktivedanta Swami Prabhupāda"], ["/legacy/gurudeva.webp", "Śrī Śrīmad Gour Govinda Swāmī Gurudeva"]] as const).map(([src, alt]) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={src} src={src} alt={alt} className="block aspect-[4/5] w-full object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_80%,transparent)]" loading="lazy" />
          ))}
        </div>
        <div className="text-center lg:order-1 lg:text-left">
          <p className="op-up text-[10.5px] font-semibold uppercase tracking-[0.2em] text-saffron sm:text-[11px]" style={{ transitionDelay: ".1s" }}>Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <h2 className="op-up mt-4 font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[46px]" style={{ transitionDelay: ".18s" }}>“Kṛṣṇa sent him.”</h2>
          <p className="op-up mt-3 text-[12.5px] text-ink-3 sm:text-[13.5px]" style={{ transitionDelay: ".24s" }}>Room conversation · Bombay, 5 January 1977</p>
          <div className="op-up group mx-auto mt-8 max-w-[480px] border-t border-[#efe2cb] pt-7 lg:mx-0" style={{ transitionDelay: ".32s" }}>
            <p className="text-[16px] font-medium leading-relaxed text-ink transition duration-500 group-hover:text-[#853500] sm:text-[18px]">“Krishna is with you and there is no need of disappointment.”</p>
            <p className="mt-2 text-[12.5px] text-ink-3 sm:text-[13.5px]">Śrīla Prabhupāda’s letter to Śrīla Gurudeva · Māyāpur, 12 February 1976</p>
          </div>
          <div className="op-up mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" style={{ transitionDelay: ".4s" }}>
            <button onClick={() => setOpen("c")} className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#853500] px-5 text-[13px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#6b2a00] hover:shadow-[0_12px_24px_-10px_rgba(133,53,0,.7)]">Read the conversation<ArrowRight size={15} /></button>
            <button onClick={() => setOpen("l")} className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#e3cfae] bg-white px-5 text-[13px] font-semibold text-[#853500] transition duration-300 hover:-translate-y-0.5 hover:border-[#853500] hover:shadow-[0_12px_24px_-12px_rgba(133,53,0,.45)]">Read the letter<ArrowRight size={15} /></button>
          </div>
        </div>
      </div>
      {open && <Reading which={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

const VERSE = ["yair īdṛśī bhagavato gatir ātma-vāda", "ekāntato nigamibhiḥ pratipāditā naḥ", "tuṣyantv adabhra-karuṇāḥ sva-kṛtena nityaṁ", "ko nāma tat pratikaroti vinoda-pātram"];
const VERSE_TR = "How can such persons, who have rendered unlimited service by explaining the path of self-realization in relation to the Supreme Personality of Godhead, and whose explanations are given for our enlightenment with complete conviction and Vedic evidence, be repaid except by folded palms containing water for their satisfaction? Such great personalities can be satisfied only by their own activities, which are distributed amongst human society out of their unlimited mercy.";

/** A small second hero: Śrīmad-Bhāgavatam 4.22.47. A soft mandala turns behind; inside a frame whose gold light travels round,
    the verse rises line by line with a light passing over it, a lotus rule draws itself open, then the translation appears. */
export function VerseBand() {
  const [ref, on] = useInView<HTMLElement>("-8%");
  return (
    <section ref={ref} data-on={on ? "1" : "0"} aria-label="Śrīmad-Bhāgavatam 4.22.47" className="op vb relative isolate overflow-hidden bg-[linear-gradient(180deg,#fff4e4_0%,#fffaf3_55%,#fdf1e2_100%)] py-12 sm:py-16">
      <VMask name="mandala-saffron" className="vb-mandala pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[560px] -translate-x-1/2 -translate-y-1/2 text-[#e8913c] opacity-[0.07] sm:size-[820px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">{Array.from({ length: 12 }, (_, k) => <span key={k} className="vb-petal" style={{ left: `${(k * 41 + 9) % 100}%`, animationDuration: `${14 + (k % 5) * 3}s`, animationDelay: `${-((k * 7) % 17)}s` }} />)}</div>
      <div className="mx-auto max-w-[900px] px-4 sm:px-8">
        <div className="vb-frame op-up relative rounded-[28px] bg-white/55 px-5 py-8 text-center shadow-[0_30px_70px_-40px_rgba(133,53,0,.45)] backdrop-blur-sm sm:px-12 sm:py-11" style={{ transitionDelay: ".05s" }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#853500] px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#fff1df] shadow-[0_8px_20px_-10px_rgba(133,53,0,.8)] sm:text-[11px]"><Padma className="size-3.5 text-[#f3c77a]" layers={2} />Śrīmad-Bhāgavatam 4.22.47</span>
          <div className="mt-6 space-y-1 sm:mt-7">
            {VERSE.map((l, i) => <p key={l} className="vb-line text-[13.5px] font-semibold leading-snug min-[400px]:text-[14.5px] sm:text-[20px]" style={{ transitionDelay: `${0.25 + i * 0.18}s`, animationDelay: `${1.6 + i * 0.35}s` }}>{l}</p>)}
          </div>
          <div className="my-6 flex items-center justify-center gap-3 sm:my-7" aria-hidden>
            <span className="vb-rule h-px w-16 origin-right bg-gradient-to-r from-transparent to-[#d9a46c] sm:w-28" />
            <Padma className="vb-lotus size-6 text-[#c2621d]" />
            <span className="vb-rule h-px w-16 origin-left bg-gradient-to-l from-transparent to-[#d9a46c] sm:w-28" />
          </div>
          <p className="op-up mx-auto max-w-[700px] text-[13.5px] leading-[1.75] text-ink-2 sm:text-[15.5px]" style={{ transitionDelay: "1.15s" }}>“{VERSE_TR}”</p>
        </div>
      </div>
    </section>
  );
}

/** How Taptajīvanam began — Śrīla Guru Mahārāja in a round frame beside the heading, then one golden line that draws itself
    through the years on a translucent card. Kept short: the years sit above and below the curve. */
export function FounderJourney() {
  const [ref, on] = useInView<HTMLElement>();
  const n = FOUNDER_STEPS.length; const W = 1200; const xs = FOUNDER_STEPS.map((_, i) => ((i + 0.5) / n) * W); const ys = FOUNDER_STEPS.map((_, i) => (i % 2 ? 110 : 60));
  const d = xs.reduce((p, x, i) => (i === 0 ? `M0,${ys[0] + 25} C${x / 2},${ys[0] + 25} ${x / 2},${ys[0]} ${x},${ys[0]}` : `${p} C${(xs[i - 1] + x) / 2},${ys[i - 1]} ${(xs[i - 1] + x) / 2},${ys[i]} ${x},${ys[i]}`), "") + ` C${(xs[n - 1] + W) / 2},${ys[n - 1]} ${(xs[n - 1] + W) / 2},${ys[n - 1] - 25} ${W},${ys[n - 1] - 25}`;
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[linear-gradient(180deg,#fdf1e2_0%,#fbe6cc_100%)] py-12 sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(255,255,255,.7),transparent_70%)]" />
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Śrīla Guru Mahārāja beside the heading */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left">
          <Link href="/about/founder" className="op-up group shrink-0" style={{ transitionDelay: ".05s" }} aria-label="Śrīla Haladhara Swāmī Guru Mahārāja — read his biography">
            <span className="block size-28 overflow-hidden rounded-full ring-4 ring-white shadow-[0_18px_36px_-18px_rgba(90,40,5,.6)] sm:size-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="h-full w-full object-cover object-[50%_20%] transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
            </span>
          </Link>
          <div className="min-w-0">
            <h2 className="op-up font-display text-[26px] font-bold leading-[1.1] tracking-[-0.03em] text-[#2b1a10] sm:text-[34px]" style={{ transitionDelay: ".12s" }}>How Taptajīvanam began</h2>
            <p className="op-up mt-2 max-w-[680px] text-[13px] leading-relaxed text-ink-2 sm:text-[14.5px]" style={{ transitionDelay: ".2s" }}>Śrīla Haladhara Swāmī Guru Mahārāja, ISKCON Guru and Sannyāsī, travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
            <Link href="/about/founder" className="op-up group mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-saffron" style={{ transitionDelay: ".26s" }}>Read his biography<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></Link>
          </div>
        </div>

        {/* desktop: the golden curve across a translucent card, years above and below it */}
        <div className="op-up relative mt-8 hidden h-[400px] rounded-[28px] border border-white/70 bg-white/35 shadow-[0_24px_60px_-36px_rgba(90,40,5,.5)] backdrop-blur-sm lg:block" style={{ transitionDelay: ".2s" }}>
          <svg viewBox={`0 0 ${W} 170`} preserveAspectRatio="none" className="absolute inset-x-0 top-[115px] h-[170px] w-full" aria-hidden>
            <path d={d} fill="none" stroke="#efd3ad" strokeWidth="1.5" />
            <path d={d} fill="none" stroke="url(#fj-g)" strokeWidth="2.5" strokeLinecap="round" pathLength={100} className="op-draw op-draw-slow" />
            <defs><linearGradient id="fj-g" x1="0" x2="1"><stop offset="0" stopColor="#f3c77a" /><stop offset=".55" stopColor="#c2621d" /><stop offset="1" stopColor="#853500" /></linearGradient></defs>
          </svg>
          {FOUNDER_STEPS.map(([y, t, desc], i) => {
            const hi = i === 3; const up = i % 2 === 0; const top = 115 + ys[i];
            return (
              <div key={y} className="group absolute" style={{ left: `${(xs[i] / W) * 100}%`, top }}>
                <span className={`op-node absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-[scale,box-shadow] duration-300 group-hover:scale-150 ${hi ? "size-5 bg-[radial-gradient(circle_at_35%_30%,#f3c77a,#c2621d)] shadow-[0_0_0_6px_rgba(232,145,60,.18),0_0_26px_rgba(232,145,60,.7)]" : "size-3 border-[3px] border-white bg-[#c2621d] shadow-[0_0_0_4px_rgba(194,98,29,.12)]"}`} style={{ transitionDelay: `${0.6 + i * 0.32}s` }} />
                {hi && <span aria-hidden className="op-pulse absolute left-0 top-0 block size-5 rounded-full border border-[#e8913c]" />}
                <div className={`op-step absolute left-0 w-[180px] -translate-x-1/2 text-center ${up ? "bottom-4" : "top-4"}`} style={{ transitionDelay: `${0.7 + i * 0.32}s` }}>
                  <div className="cursor-default rounded-2xl px-2.5 py-2 transition duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-white/90 group-hover:shadow-[0_18px_36px_-22px_rgba(90,40,5,.55)]">
                    <p className={`font-display text-[18px] font-bold tabular-nums leading-none transition-colors duration-300 group-hover:text-[#c2621d] ${hi ? "text-[#c2621d]" : "text-[#d9a46c]"}`}>{y}</p>
                    <p className={`mt-1.5 text-[13px] font-semibold leading-snug ${hi ? "text-[#853500]" : "text-ink"}`}>{t}</p>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-2 group-hover:line-clamp-none">{desc}</p>
                  </div>
                </div>
              </div>);
          })}
        </div>

        {/* phone and tablet: the line runs down, on a translucent card */}
        <ol className="op-up relative mt-7 space-y-5 rounded-[24px] border border-white/70 bg-white/40 p-5 pl-11 backdrop-blur-sm lg:hidden" style={{ transitionDelay: ".2s" }}>
          <span aria-hidden className="op-vline absolute bottom-7 left-[23px] top-7 w-[2px] origin-top rounded-full bg-gradient-to-b from-[#f3c77a] via-[#c2621d] to-[#853500]" />
          {FOUNDER_STEPS.map(([y, t, desc], i) => {
            const hi = i === 3;
            return (
              <li key={y} className="op-step relative" style={{ transitionDelay: `${0.3 + i * 0.15}s` }}>
                <span className={`absolute top-0.5 rounded-full ${hi ? "-left-[27px] size-4 bg-[radial-gradient(circle_at_35%_30%,#f3c77a,#c2621d)] shadow-[0_0_16px_rgba(232,145,60,.7)]" : "-left-[25px] size-3 border-2 border-[#fdf1e2] bg-[#c2621d]"}`} />
                <p className="flex items-baseline gap-2"><span className={`font-display text-[15px] font-bold tabular-nums leading-none ${hi ? "text-[#c2621d]" : "text-[#d9a46c]"}`}>{y}</span><span className={`text-[13.5px] font-semibold ${hi ? "text-[#853500]" : "text-ink"}`}>{t}</span></p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-2">{desc}</p>
              </li>);
          })}
        </ol>
      </div>
    </section>
  );
}
