"use client";
/* Śrīla Gurudeva’s three instructions (New York, July 1994), and his words on Śrīla Prabhupāda.
   The words are exactly as published; only their presentation is designed here. */
import { useEffect, useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

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

const mask = (url: string): React.CSSProperties => ({ WebkitMask: `url(${url}) center / contain no-repeat`, mask: `url(${url}) center / contain no-repeat`, background: "currentColor" });
const Sign = ({ className = "" }: { className?: string }) => <span role="img" aria-label="Signature of Śrī Śrīmad Gour Govinda Swāmī" className={`block aspect-[1112/271] ${className}`} style={mask("/gurudeva-sign-mask.png")} />;

/** “There are three things that are very important to me” — a dark, quiet band with the ISKCON lotus and his signature.
 *  `intro` (optional) is a line above it, e.g. how Śrīla Guru Mahārāja serves these three instructions. */
export function ThreeThings({ intro, kicker = "Śrīla Gurudeva’s mission", bg = "#3a0f0a", glow = "#e8b872", accent = "#f3c77a" }: { intro?: string; kicker?: string; bg?: string; glow?: string; accent?: string }) {
  return (
    <section className="relative isolate overflow-hidden py-16 text-white sm:py-24" style={{ background: bg }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ background: `radial-gradient(60% 55% at 50% 0%, ${glow}33, transparent 70%), radial-gradient(40% 40% at 90% 100%, ${glow}22, transparent 70%)` }} />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="text-center">
          <span aria-label="ISKCON" role="img" className="mx-auto block h-16 w-[76px] sm:h-20 sm:w-[95px]" style={{ ...mask("/iskcon-mask.png"), color: accent }} />
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: accent }}>{kicker}</p>
          <h2 className="mx-auto mt-3 max-w-[760px] text-[24px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">There are three things that are very important to me</h2>
          {intro && <p className="mx-auto mt-4 max-w-[640px] text-[14px] leading-relaxed text-white/70 sm:text-[15px]">{intro}</p>}
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {THREE.map((t) => (
            <li key={t.n} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] sm:p-7">
              <span aria-hidden className="absolute -right-3 -top-6 text-[120px] font-black leading-none opacity-[0.07] transition group-hover:opacity-[0.12]" style={{ color: accent }}>{t.n}</span>
              <span className="flex size-10 items-center justify-center rounded-full text-[15px] font-bold" style={{ background: accent, color: bg }}>{t.n}</span>
              <p className="relative mt-5 text-[13px] text-white/60">{t.lead}</p>
              <p className="relative mt-1 text-[17px] font-bold leading-snug sm:text-[19px]" style={{ color: accent }}>{t.bold}</p>
              <p className="relative mt-3 text-[14px] leading-relaxed text-white/80">{t.rest}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <Sign className="w-[200px] sm:w-[240px]" />
          <p className="text-[13px] text-white/60">Śrī Śrīmad Gour Govinda Swāmī · New York, July 1994</p>
        </div>
      </div>
    </section>
  );
}

/** Śrīla Gurudeva on Śrīla Prabhupāda: four passages, one at a time, with their titles as tabs. */
export function OnPrabhupada({ kicker = "Śrīla Gurudeva on Śrīla Prabhupāda", title = "Everything is in Śrīla Prabhupāda’s books", accent = "var(--saffron)" }: { kicker?: string; title?: string; accent?: string }) {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % ON_PRABHUPADA.length), 12000); return () => clearInterval(t); }, [paused]);
  const q = ON_PRABHUPADA[i];
  return (
    <section className="bg-page py-16 sm:py-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-[12px]" style={{ color: accent }}>{kicker}</p>
          <h2 className="mx-auto mt-3 max-w-[700px] text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">{title}</h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" role="tablist">
            {ON_PRABHUPADA.map((x, k) => (
              <button key={x.title} role="tab" aria-selected={k === i} onClick={() => { setI(k); setPaused(true); }}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${k === i ? "border-transparent bg-ink text-page shadow-[var(--shadow-md)]" : "border-line bg-surface text-ink hover:border-line-strong"}`}>
                <span className={`block text-[11px] font-semibold uppercase tracking-[0.1em] ${k === i ? "opacity-70" : "text-ink-3"}`}>{x.place.split(",")[1]?.trim() || x.place}</span>
                <span className="mt-0.5 block whitespace-nowrap text-[14px] font-semibold lg:whitespace-normal">{x.title}</span>
              </button>
            ))}
          </div>
          <figure key={i} style={{ color: accent }} className="gi-rise relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-md)] sm:p-10">
            <Quote aria-hidden size={56} className="absolute right-6 top-6 opacity-10" style={{ color: accent }} />
            <h3 className="text-[19px] font-bold text-ink sm:text-[24px]">{q.title}</h3>
            <blockquote className="mt-4 text-[15px] leading-[1.8] text-ink-2 sm:text-[17px]">{q.text}</blockquote>
            <figcaption className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
              <Sign className="w-[150px] sm:w-[210px]" />
              <span className="text-[13px] text-ink-3">{q.place}</span>
            </figcaption>
            <div className="mt-5 flex items-center gap-2">
              <button onClick={() => { setI((i - 1 + ON_PRABHUPADA.length) % ON_PRABHUPADA.length); setPaused(true); }} aria-label="Previous" className="flex size-9 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-strong hover:text-ink"><ChevronLeft size={17} /></button>
              <button onClick={() => { setI((i + 1) % ON_PRABHUPADA.length); setPaused(true); }} aria-label="Next" className="flex size-9 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-strong hover:text-ink"><ChevronRight size={17} /></button>
              <span className="ml-2 flex gap-1.5">{ON_PRABHUPADA.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6" : "w-1.5 bg-line-strong"}`} style={k === i ? { background: accent } : undefined} />)}</span>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
