"use client";
/* The two sections after the hero.
   “Kṛṣṇa sent him.” — Śrīla Prabhupāda and Śrīla Gurudeva side by side, his words beside them; the conversation and the letter open in full.
   How Taptajīvanam began — one golden line that draws itself through the years, each year a point on it. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { FOUNDER_STEPS } from "@/components/home/home-data";
import { VMask } from "@/components/motifs";

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

/** “Kṛṣṇa sent him.” — on white, set apart from the verse above: Śrīla Prabhupāda's words on one side, and on the other
    Śrīla Prabhupāda and Śrīla Gurudeva in two arched frames, named beneath. The conversation and the letter open in full. */
export function KrishnaSentOpening() {
  const [ref, on] = useInView<HTMLElement>();
  const [open, setOpen] = useState<"c" | "l" | null>(null);
  return (
    <section ref={ref} data-on={on ? "1" : "0"} className="op relative isolate overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fffaf4_100%)] pb-12 pt-4 sm:pb-16 sm:pt-6">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(45%_60%_at_78%_55%,rgba(243,179,99,.14),transparent_70%)]" />
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="text-center lg:text-left">
          <p className="op-up inline-flex items-center gap-2 rounded-full border border-[#ecd3ae] bg-[#fff7ec] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-saffron" style={{ transitionDelay: ".05s" }}>Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <h2 className="op-up mt-4 font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[42px]" style={{ transitionDelay: ".12s" }}>“Kṛṣṇa sent him.”</h2>
          <p className="op-up mt-2 text-[12.5px] text-ink-3 sm:text-[13px]" style={{ transitionDelay: ".18s" }}>Room conversation · Bombay, 5 January 1977</p>
          <figure className="op-up relative mx-auto mt-7 max-w-[500px] rounded-2xl border border-[#f1e2c8] bg-white px-5 py-4 text-left shadow-[0_18px_40px_-30px_rgba(133,53,0,.5)] lg:mx-0" style={{ transitionDelay: ".26s" }}>
            <span aria-hidden className="absolute -top-3 left-5 flex size-6 items-center justify-center rounded-full bg-[#853500] text-[15px] font-bold leading-none text-[#f6d39a]">“</span>
            <blockquote className="border-l-2 border-[#e8913c] pl-4 text-[15px] font-medium leading-relaxed text-ink sm:text-[16px]">Krishna is with you and there is no need of disappointment.</blockquote>
            <figcaption className="mt-2 pl-4 text-[12px] text-ink-3">Śrīla Prabhupāda’s letter to Śrīla Gurudeva · Māyāpur, 12 February 1976</figcaption>
          </figure>
          <div className="op-up mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start" style={{ transitionDelay: ".34s" }}>
            <button onClick={() => setOpen("c")} className="group inline-flex h-10 items-center gap-2 rounded-full bg-[#853500] px-5 text-[13px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#6b2a00] hover:shadow-[0_12px_24px_-10px_rgba(133,53,0,.7)]">Read the conversation<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></button>
            <button onClick={() => setOpen("l")} className="group inline-flex h-10 items-center gap-2 rounded-full border border-[#e3cfae] bg-white px-5 text-[13px] font-semibold text-[#853500] transition duration-300 hover:-translate-y-0.5 hover:border-[#853500]">Read the letter<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></button>
          </div>
        </div>
        {/* Śrīla Prabhupāda and Śrīla Gurudeva, side by side, plain */}
        <div className="op-up mx-auto grid w-full max-w-[340px] grid-cols-2 items-end gap-2 sm:max-w-[480px] sm:gap-4" style={{ transitionDelay: ".15s" }} aria-label="Śrīla Prabhupāda and Śrīla Gurudeva">
          {([["/legacy/prabhupada.webp", "Śrīla A.C. Bhaktivedanta Swami Prabhupāda"], ["/legacy/gurudeva.webp", "Śrī Śrīmad Gour Govinda Swāmī Gurudeva"]] as const).map(([src, alt]) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={src} src={src} alt={alt} className="block aspect-[4/5] w-full object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]" loading="lazy" />
          ))}
        </div>
      </div>
      {open && <Reading which={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

const VERSE = ["yair īdṛśī bhagavato gatir ātma-vāda", "ekāntato nigamibhiḥ pratipāditā naḥ", "tuṣyantv adabhra-karuṇāḥ sva-kṛtena nityaṁ", "ko nāma tat pratikaroti vinoda-pātram"];
const VERSE_TR = "How can such persons, who have rendered unlimited service by explaining the path of self-realization in relation to the Supreme Personality of Godhead, and whose explanations are given for our enlightenment with complete conviction and Vedic evidence, be repaid except by folded palms containing water for their satisfaction? Such great personalities can be satisfied only by their own activities, which are distributed amongst human society out of their unlimited mercy.";

/** A small second hero: Śrīmad-Bhāgavatam 4.22.47 — calm. A whole mandala turns very slowly round a seal with the verse
    number; beside it, the verse and its translation side by side on one quiet card. Only a gentle fade-in. */
export function VerseBand() {
  const [ref, on] = useInView<HTMLElement>("-8%");
  return (
    <section ref={ref} data-on={on ? "1" : "0"} aria-label="Śrīmad-Bhāgavatam 4.22.47" className="op bg-white px-3 py-8 sm:px-6 sm:py-12">
      {/* a card in the hero's own colours and flower print, set in white space so the hero ends cleanly before it */}
      <div className="hero-saffron relative isolate mx-auto max-w-[1360px] overflow-hidden rounded-[26px] shadow-[0_30px_70px_-40px_rgba(70,25,0,.7)] sm:rounded-[32px]">
      <svg aria-hidden className="hero-buti2 pointer-events-none absolute inset-0 -z-10 h-full w-full"><defs><pattern id="vb-buti" width="64" height="64" patternUnits="userSpaceOnUse"><g fill="#fff3dc">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <ellipse key={a} cx="32" cy="24.5" rx="2.6" ry="6" transform={`rotate(${a} 32 32)`} />)}</g><circle cx="32" cy="32" r="2.6" fill="#ffd27a" /></pattern></defs><rect width="100%" height="100%" fill="url(#vb-buti)" /></svg>
      <div className="grid items-center gap-7 px-4 py-8 sm:px-8 sm:py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:px-10">
        {/* the seal: a whole mandala turning slowly, ŚB 4.22.47 at its heart */}
        <div className="op-up relative mx-auto aspect-square w-[min(190px,52vw)] lg:w-[220px]" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,200,130,.22),transparent)]" />
          <VMask name="mandala-saffron" className="vb-mandala absolute inset-[2%] text-[#e8b872] opacity-[0.55]" />
          <span className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe7b8,#e8a95a_75%)] text-center shadow-[0_16px_34px_-14px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.6)] ring-2 ring-[#fff1d6]/60">
            <span className="text-[20px] font-bold leading-none tracking-[0.04em] text-[#5c2401] lg:text-[22px]">ŚB</span>
            <span className="mt-1 text-[13px] font-semibold tabular-nums text-[#7a3206] lg:text-[14px]">4.22.47</span>
          </span>
        </div>
        {/* the verse and its translation, side by side */}
        <div className="op-up overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.06] shadow-[0_24px_60px_-36px_rgba(0,0,0,.6)] backdrop-blur-sm" style={{ transitionDelay: ".12s" }}>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.05] px-5 py-2.5 sm:px-7">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#f3c77a]">ŚB 4.22.47</p>
            <p className="text-[10.5px] font-medium tracking-[0.06em] text-[#f6e6d6]">Canto 4 · Chapter 22 · Verse 47</p>
          </div>
          <div className="grid divide-y divide-white/10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:divide-x lg:divide-y-0">
            <div className="px-5 py-5 text-center sm:px-7 lg:py-6 lg:text-left">
              <p className="mb-2.5 flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#ffd98a] lg:justify-start"><span className="size-1.5 rotate-45 bg-[#ffd98a]" />Verse</p>
              {VERSE.map((l) => <p key={l} className="text-[13.5px] font-semibold leading-[1.7] text-[#ffe9c2] sm:text-[14.5px]">{l}</p>)}
            </div>
            <div className="px-5 py-5 sm:px-7 lg:py-6">
              <p className="mb-2.5 flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#ffd98a] lg:justify-start"><span className="size-1.5 rotate-45 bg-[#ffd98a]" />Translation</p>
              <p className="text-center text-[13.5px] leading-[1.75] text-white sm:text-[14px] lg:text-left">{VERSE_TR}</p>
            </div>
          </div>
        </div>
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
