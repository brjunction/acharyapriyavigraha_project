"use client";
/* The two sections after the hero.
   “Kṛṣṇa sent him.” — Śrīla Prabhupāda and Śrīla Gurudeva side by side, his words beside them; the conversation and the letter open in full.
   How Taptajīvanam began — one golden line that draws itself through the years, each year a point on it. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { FOUNDER_STEPS } from "@/components/home/home-data";

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
            <img key={src} src={src} alt={alt} className="block aspect-[4/5] w-full cursor-pointer object-contain object-bottom transition duration-700 ease-out [mask-image:linear-gradient(to_bottom,#000_80%,transparent)] hover:-translate-y-2 hover:scale-[1.04] hover:drop-shadow-[0_22px_28px_rgba(120,60,10,.22)]" loading="lazy" />
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

/** One golden line through the years; it draws itself, and each year appears as the line reaches it. */
export function FounderJourney() {
  const [ref, on] = useInView<HTMLElement>();
  const n = FOUNDER_STEPS.length; const W = 1200; const xs = FOUNDER_STEPS.map((_, i) => ((i + 0.5) / n) * W); const ys = FOUNDER_STEPS.map((_, i) => (i % 2 ? 150 : 90));
  const d = xs.reduce((p, x, i) => (i === 0 ? `M0,${ys[0] + 30} C${x / 2},${ys[0] + 30} ${x / 2},${ys[0]} ${x},${ys[0]}` : `${p} C${(xs[i - 1] + x) / 2},${ys[i - 1]} ${(xs[i - 1] + x) / 2},${ys[i]} ${x},${ys[i]}`), "") + ` C${(xs[n - 1] + W) / 2},${ys[n - 1]} ${(xs[n - 1] + W) / 2},${ys[n - 1] - 30} ${W},${ys[n - 1] - 30}`;
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[linear-gradient(180deg,#fdf1e2_0%,#fbe6cc_100%)] py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(255,255,255,.7),transparent_70%)]" />
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Śrīla Guru Mahārāja in a round frame at the centre, the biography link beneath, then the heading */}
        <div className="flex flex-col items-center text-center">
          <Link href="/about/founder" className="op-up group flex flex-col items-center" style={{ transitionDelay: ".05s" }}>
            <span className="block size-36 overflow-hidden rounded-full ring-4 ring-white shadow-[0_18px_36px_-18px_rgba(90,40,5,.6)] sm:size-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="h-full w-full object-cover object-[50%_20%] transition duration-700 group-hover:scale-[1.04]" />
            </span>
            <span className="mt-4 block text-[14px] font-semibold text-ink">Śrīla Haladhara Swāmī Guru Mahārāja</span>
            <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">Read his biography<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></span>
          </Link>
          <h2 className="op-up mt-10 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-[#2b1a10] sm:text-[40px]" style={{ transitionDelay: ".12s" }}>How Taptajīvanam began</h2>
          <p className="op-up mt-3 max-w-[640px] text-[13.5px] leading-relaxed text-ink-2 sm:text-[15px]" style={{ transitionDelay: ".2s" }}>Śrīla Haladhara Swāmī Guru Mahārāja, ISKCON Guru and Sannyāsī, travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
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
              <div key={y} className="group absolute" style={{ left: `${(xs[i] / W) * 100}%`, top }}>
                <span className={`op-node absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-[scale,box-shadow] duration-300 group-hover:scale-150 ${hi ? "size-6 bg-[radial-gradient(circle_at_35%_30%,#f3c77a,#c2621d)] shadow-[0_0_0_6px_rgba(232,145,60,.18),0_0_30px_rgba(232,145,60,.7)]" : "size-3.5 border-[3px] border-white bg-[#c2621d] shadow-[0_0_0_4px_rgba(194,98,29,.12)]"}`} style={{ transitionDelay: `${0.6 + i * 0.32}s` }} />
                {hi && <span aria-hidden className="op-pulse absolute left-0 top-0 block size-6 rounded-full border border-[#e8913c]" />}
                <div className={`op-step absolute left-0 w-[196px] -translate-x-1/2 text-center ${up ? "bottom-6" : "top-6"}`} style={{ transitionDelay: `${0.7 + i * 0.32}s` }}>
                  <div className="cursor-default rounded-2xl px-3 py-3 transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:bg-white/85 group-hover:shadow-[0_18px_36px_-22px_rgba(90,40,5,.55)]">
                    <p className={`font-display text-[22px] font-bold tabular-nums leading-none transition-colors duration-300 group-hover:text-[#c2621d] ${hi ? "text-[#c2621d]" : "text-[#d9a46c]"}`}>{y}</p>
                    <p className={`mt-2 text-[14px] font-semibold leading-snug ${hi ? "text-[#853500]" : "text-ink"}`}>{t}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">{desc}</p>
                  </div>
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
