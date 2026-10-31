/* “Kṛṣṇa sent him.” — four designs of the same section. The Studio chooses which one the home page shows. */
import { Quote } from "lucide-react";
import { BlessingLetters } from "./live";

export const BLESSINGS: [string, string, string][] = [
  ["a", "At either side", "Śrīla Prabhupāda on the left, Śrīla Gurudeva on the right, the words between them"],
  ["b", "Side by side", "Both portraits together on one side, the words on the other"],
  ["c", "Together above", "Both portraits together, the words below them, centred"],
  ["d", "Large quote", "A large quote across the page, the portraits beside it"],
];
const SP = "/legacy/prabhupada.webp", SG = "/legacy/gurudeva.webp";
const Img = ({ src, alt, className = "", delay = "0s", from = "bless-rise" }: { src: string; alt: string; className?: string; delay?: string; from?: string }) =>
  /* eslint-disable-next-line @next/next/no-img-element */
  <img src={src} alt={alt} className={`${from} block object-contain object-bottom ${className}`} style={{ animationDelay: delay }} loading="lazy" />;
const Kicker = ({ left }: { left?: boolean }) => <p className={`mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-saffron ${left ? "" : "text-center"}`}>Śrīla Prabhupāda on Śrīla Gurudeva</p>;
const Title = ({ className = "" }: { className?: string }) => <h2 className={`font-semibold tracking-[-0.03em] text-ink ${className}`}>{["“Kṛṣṇa", "sent", "him.”"].map((w, i) => <span key={i} className="bless-word inline-block" style={{ animationDelay: `${0.15 + i * 0.15}s` }}>{w}&nbsp;</span>)}</h2>;
const Source = ({ children, left }: { children: React.ReactNode; left?: boolean }) => <p className={`mt-1.5 text-[12.5px] text-ink-3 ${left ? "" : "text-center"}`}>{children}</p>;
const Letter = ({ left }: { left?: boolean }) => (
  <div className={left ? "" : "mx-auto max-w-lg"}>
    <p className={`text-[15px] font-medium leading-relaxed text-ink-2 sm:text-[16.5px] ${left ? "" : "text-center"}`}>“Krishna is with you and there is no need of disappointment.”</p>
    <Source left={left}>Śrīla Prabhupāda’s letter to Śrīla Gurudeva · Māyāpur, 12 February 1976</Source>
  </div>
);
const SP_ALT = "Śrīla A.C. Bhaktivedanta Swami Prabhupāda", SG_ALT = "Śrī Śrīmad Gour Govinda Swāmī Gurudeva";

export function Blessing({ v = "a" }: { v?: string }) {
  if (v === "b") return (
    <section className="reveal bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative mx-auto flex w-full max-w-[480px] items-end justify-center">
          <Img src={SP} alt={SP_ALT} className="relative z-10 w-[52%]" from="bless-left" />
          <Img src={SG} alt={SG_ALT} className="-ml-[8%] w-[50%]" from="bless-right" />
        </div>
        <div><Kicker left /><Title className="text-[26px] leading-tight sm:text-[36px]" /><Source left>Room conversation · Bombay, 5 January 1977</Source><div className="my-7 h-px w-16 bg-saffron/50" /><Letter left /><BlessingLetters align="left" /></div>
      </div>
    </section>
  );
  if (v === "c") return (
    <section className="reveal bg-white">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-[520px] items-end justify-center">
          <Img src={SP} alt={SP_ALT} className="relative z-10 w-1/2" from="bless-left" />
          <Img src={SG} alt={SG_ALT} className="-ml-[6%] w-[48%]" from="bless-right" delay=".15s" />
        </div>
        <div className="mx-auto mt-8 max-w-2xl"><Kicker /><Title className="text-[26px] leading-tight sm:text-[36px]" /><Source>Room conversation · Bombay, 5 January 1977</Source><div className="mx-auto my-7 h-px w-16 bg-saffron/50" /><Letter /><BlessingLetters /></div>
      </div>
    </section>
  );
  if (v === "d") return (
    <section className="reveal bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <span className="mb-6 flex size-12 items-center justify-center rounded-full bg-saffron-tint text-saffron"><Quote size={22} /></span>
          <Kicker left /><Title className="text-[32px] leading-[1.15] sm:text-[48px]" /><Source left>Śrīla Prabhupāda, room conversation · Bombay, 5 January 1977</Source>
          <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-[1fr_auto] sm:items-end"><Letter left /></div>
          <BlessingLetters align="left" />
        </div>
        <div className="flex items-end justify-center rounded-[28px] bg-gradient-to-b from-[#fdf6e3] to-white px-4 pt-8">
          <Img src={SP} alt={SP_ALT} className="relative z-10 w-1/2" from="bless-left" />
          <Img src={SG} alt={SG_ALT} className="-ml-[6%] w-[48%]" from="bless-right" delay=".15s" />
        </div>
      </div>
    </section>
  );
  return (
    <section className="reveal bg-white pb-12 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-5 sm:pt-16">
        <div className="grid grid-cols-2 items-center gap-x-3 lg:grid-cols-[280px_1fr_280px] lg:gap-x-8">
          <div className="order-2 lg:order-1"><Img src={SP} alt={SP_ALT} className="mr-auto w-full max-w-[180px] sm:max-w-[280px]" from="bless-left" /></div>
          <div className="order-1 col-span-2 pb-8 lg:order-2 lg:col-span-1 lg:pb-0"><Kicker /><Title className="text-center text-[26px] leading-tight sm:text-[36px]" /><Source>Room conversation · Bombay, 5 January 1977</Source><div className="mx-auto my-7 h-px w-16 bg-saffron/50" /><Letter /><BlessingLetters /></div>
          <div className="order-3"><Img src={SG} alt={SG_ALT} className="ml-auto w-full max-w-[180px] sm:max-w-[280px]" from="bless-right" /></div>
        </div>
      </div>
    </section>
  );
}
