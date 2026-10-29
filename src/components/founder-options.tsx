import Link from "next/link";
import { ArrowRight, PlayCircle, Youtube } from "lucide-react";
import { VectorToran, Padma, VMask } from "./motifs";
import { Backdrop } from "./backdrop";

export const FOUNDER_STEPS: [string, string, string][] = [
  ["1992", "Joins ISKCON Bhubaneswar", "Comes into contact with the devotees at ISKCON Bhubaneswar and begins to join their service."],
  ["1994", "Initiation", "Initiated as Halāyudha Dāsa. Serves in the travelling saṅkīrtana party and as head pūjārī of Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2016", "Sannyāsa", "Accepts the renounced order on 20 March 2016, from His Holiness Rādhā-Govinda Swāmī Mahārāja, at Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2019", "The wish for one digital home", "On his European tour, at ISKCON New Māyāpura, he expressed his desire for one place where all the audio lectures of his spiritual master would be available to everyone."],
  ["2020", "Small clips, every day", "With his disciples and followers he began curating daily selections of quotes and lectures as short audio clips."],
  ["Always", "Simple living, high thinking", "Serving the spiritual master (śrī guru-sevā) and chanting the holy names (śrī nāma-sevā) without compromise."],
];
const NAME = "Śrīla Haladhara Swāmī Guru Mahārāja";
const Btns = ({ light = false }: { light?: boolean }) => (
  <div className="flex flex-wrap gap-2">
    <Link href="/about/founder" className={`inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-[13.5px] font-medium ${light ? "bg-[#f3d9a4] text-[#4a0a0c]" : "bg-saffron text-white"}`}>Read his biography<ArrowRight size={15} /></Link>
    <Link href="/gurudeva/diaries" className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium ring-1 ${light ? "text-white ring-white/40 hover:bg-white/10" : "text-ink-2 ring-line-strong hover:bg-band"}`}><PlayCircle size={15} />Daily diary</Link>
    <Link href="https://www.youtube.com/@HaladharaSwami" className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium ring-1 ${light ? "text-white ring-white/40 hover:bg-white/10" : "text-ink-2 ring-line-strong hover:bg-band"}`}><Youtube size={15} />YouTube</Link>
  </div>
);

/** A — Temple arch: the portrait in a carved arch, the story on cream paper, a milestone road beneath. */
export function FounderArch() {
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#ead7ae] bg-[#fdf7ec]">
      <Backdrop src="cream-watercolor" o={0.3} />
      <VectorToran className="absolute inset-x-0 top-0 text-[#c98a2b]/45" />
      <div className="relative grid gap-8 px-5 pb-8 pt-14 sm:px-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
        <div className="mx-auto w-[240px] lg:w-full">
          <div className="rounded-t-[999px] bg-gradient-to-b from-[#e9b85f] via-[#fff1d0] to-[#e9b85f] p-[5px]">
            <div className="overflow-hidden rounded-t-[999px] bg-white p-[5px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/haladhara.webp" alt={NAME} className="aspect-[4/5] w-full rounded-t-[999px] object-cover" />
            </div>
          </div>
          <div className="h-3 rounded-b-xl bg-gradient-to-b from-[#c98a2b] to-[#8a4a0e]" />
        </div>
        <div className="self-center">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-saffron"><Padma className="h-4 w-4" layers={2} />The founder of Taptajīvanam</p>
          <h2 className="mt-2 text-[26px] leading-tight tracking-[-0.025em] sm:text-[34px]">{NAME}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-ink-2">ISKCON guru and sannyāsī. He travels and preaches Kṛṣṇa consciousness around the world in Odia, Hindi and English, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[12.5px]">{["Śrī Guru Sevā", "Śrī Nāma Sevā", "Odia · Hindi · English"].map((t) => <span key={t} className="rounded-full border border-[#e3cf9f] bg-white/70 px-3 py-1 font-medium text-[#8a4a0e]">{t}</span>)}</div>
          <div className="mt-6"><Btns /></div>
        </div>
      </div>
      <div className="relative border-t border-[#ead7ae] bg-white/60 px-5 py-7 sm:px-10">
        <ol className="grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {FOUNDER_STEPS.map(([y, t, d]) => (
            <li key={y} className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#e9b85f] to-[#c98a2b] text-[11px] font-bold text-white ring-4 ring-[#fdf7ec]">{y === "Always" ? "∞" : `'${y.slice(2)}`}</span>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-saffron">{y}</p>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug">{t}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** B — Maroon shrine: the same family as the Thank List band, with the story set in gold. */
export function FounderShrine() {
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] bg-[#4a0a0c] text-white">
      <Backdrop src="red-gold-mandala" o={0} className="-z-10 opacity-60" />
      <VectorToran flip className="absolute inset-x-0 top-0 text-[#e8b872]/35" />
      <VectorToran className="absolute inset-x-0 bottom-0 text-[#e8b872]/35" />
      <div className="relative grid items-center gap-8 px-5 py-14 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="text-center">
          <div className="relative mx-auto h-[230px] w-[230px]">
            <VMask name="mandala-gold" className="absolute -inset-10 text-[#e8b872] opacity-30" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/haladhara.webp" alt={NAME} className="relative h-full w-full rounded-full object-cover ring-[5px] ring-[#e8b872]/80" />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f3d9a4]">Founder of Taptajīvanam</p>
          <h2 className="mt-1 text-[24px] !text-white sm:text-[28px]">{NAME}</h2>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-white/80">ISKCON guru and sannyāsī, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva in Odia, Hindi and English.</p>
          <div className="mt-5 flex justify-center"><Btns light /></div>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_STEPS.map(([y, t, d]) => (
            <li key={y} className="rounded-2xl border border-[#e8b872]/25 bg-white/[0.06] p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f3d9a4]">{y}</p>
              <p className="mt-1 text-[14.5px] font-semibold text-white">{t}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/75">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** C — Open book: a portrait page on the left, the story as a lotus-marked path on the right. */
export function FounderBook() {
  return (
    <div className="relative isolate grid overflow-hidden rounded-[28px] border border-[#ead7ae] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      <div className="relative min-h-[420px] overflow-hidden bg-[#8a3a06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/haladhara.webp" alt={NAME} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a1203]/90 via-[#3a1203]/20 to-transparent" />
        <VMask name="border-2" repeat="repeat-y" size="100% auto" className="absolute inset-y-0 right-0 hidden w-5 text-[#f3d9a4]/70 lg:block" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f3d9a4]">Founder of Taptajīvanam</p>
          <h2 className="mt-1 text-[24px] leading-tight !text-white sm:text-[30px]">{NAME}</h2>
          <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-white/85">ISKCON guru and sannyāsī. Śrī Guru Sevā · Śrī Nāma Sevā.</p>
        </div>
      </div>
      <div className="relative bg-[#fdf7ec] p-6 sm:p-10">
        <Backdrop src="cream-mandala" o={0.1} />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-saffron"><Padma className="h-4 w-4" layers={2} />How Taptajīvanam began</p>
          <ol className="mt-5 space-y-4">
            {FOUNDER_STEPS.map(([y, t, d]) => (
              <li key={y} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4">
                <span className="pt-0.5 text-right text-[13px] font-bold text-saffron">{y}</span>
                <div className="relative border-l-2 border-[#ead7ae] pl-5">
                  <Padma className="absolute -left-[9px] top-0.5 h-4 w-4 bg-[#fdf7ec] text-saffron" layers={2} />
                  <p className="text-[14.5px] font-semibold">{t}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-7"><Btns /></div>
        </div>
      </div>
    </div>
  );
}
