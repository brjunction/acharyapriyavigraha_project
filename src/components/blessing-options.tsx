"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";
import { CutOut, Padma, VectorToran, VMask } from "./motifs";
import { Backdrop } from "./backdrop";

const hl = (t: string) => t.split(/(«[^»]+»)/).map((x, k) => x.startsWith("«") ? <mark key={k} className="rounded bg-[#fbe3b4] px-1 font-semibold text-ink">{x.slice(1, -1)}</mark> : <span key={k}>{x}</span>);
const PRABHU = "Śrīla A.C. Bhaktivedanta Swami Prabhupāda", GURU = "Śrī Śrīmad Gour Govinda Swāmī Gurudeva";

function Details({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="grid gap-5 border-t border-[#eadcbd] bg-[#fffaf1] p-4 text-left sm:p-7 lg:grid-cols-2">
      <section><h3 className="text-[15px] font-semibold">{CONVERSATION.title}</h3><p className="mb-3 mt-0.5 text-[12px] text-ink-3">{CONVERSATION.speakers}</p>
        <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-[#eadcbd] bg-white">{CONVERSATION.lines.map(([who, line], k) => <p key={k} className="border-b border-[#f1e6cf] px-4 py-2.5 text-[13px] leading-relaxed text-ink-2 last:border-0"><span className={`mr-1.5 font-semibold ${who === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{who}:</span>{hl(line)}</p>)}</div></section>
      <section><h3 className="text-[15px] font-semibold">{LETTER.title}</h3><p className="mb-3 mt-0.5 text-[12px] text-ink-3">Letter {LETTER.ref}</p>
        <article className="max-h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-[#eadcbd] bg-white p-4 text-[13px] leading-relaxed text-ink-2 sm:p-5"><p>{LETTER.salutation}</p>{LETTER.paras.map((t, k) => <p key={k}>{hl(t)}</p>)}<p className="text-ink-3">{LETTER.closing[0]}<br />{LETTER.closing[1]}</p></article></section>
    </div>
  );
}
const Toggle = ({ open, set, className = "" }: { open: boolean; set: (v: boolean) => void; className?: string }) => (
  <button onClick={() => set(!open)} aria-expanded={open} aria-label={open ? "Hide" : "Open"} title={open ? "Hide" : "Open"} className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#e3cf9f] bg-white text-saffron transition hover:bg-[#fbeedd] ${className}`}><ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
);

/** A — Two arches: Śrīla Prabhupāda in the tall central-left arch, Gurudeva in a smaller arch, the words between. */
export function BlessingArches() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#eadcbd] bg-[#fdf8ef]">
      <VectorToran flip className="absolute inset-x-0 top-0 text-[#c98a2b]/35" />
      <div className="relative grid items-end gap-6 px-5 pt-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.8fr)]">
        <div className="mx-auto w-full max-w-[300px]">
          <div className="rounded-t-[999px] bg-gradient-to-b from-[#f6e2bb] to-[#fbefd8] px-3 pt-5 ring-1 ring-[#e9cf98]"><CutOut src="/legacy/prabhupada.webp" alt={PRABHU} fade={0} className="mx-auto w-full" /></div>
          <p className="py-3 text-center text-[13px] font-semibold text-[#7a3a06]">Śrīla Prabhupāda</p>
        </div>
        <div className="self-center pb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <p className="mt-4 text-[34px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[44px]">“Kṛṣṇa sent him.”</p>
          <p className="mt-2 text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
          <Padma className="mx-auto my-5 h-6 w-6 text-[#c98a2b]" layers={2} />
          <p className="mx-auto max-w-sm text-[16px] font-medium leading-relaxed text-ink-2">“Krishna is with you and there is no need of disappointment.”</p>
          <p className="mt-2 text-[13px] text-ink-3">Letter, Māyāpur, 12 February 1976</p>
          <Toggle open={open} set={setOpen} className="mx-auto mt-5" />
        </div>
        <div className="mx-auto w-full max-w-[220px]">
          <div className="rounded-t-[999px] bg-gradient-to-b from-[#f6e2bb] to-[#fbefd8] px-3 pt-5 ring-1 ring-[#e9cf98]"><CutOut src="/legacy/gurudeva.webp" alt={GURU} fade={0} className="mx-auto w-full" /></div>
          <p className="py-3 text-center text-[13px] font-semibold text-[#7a3a06]">Śrīla Gurudeva</p>
        </div>
      </div>
      <Details open={open} />
    </div>
  );
}

/** B — Saffron dawn: a warm gradient band, Prabhupāda large on the left rising from the edge, Gurudeva smaller beside the words. */
export function BlessingDawn() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#eadcbd]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_20%_100%,#f9d9a6_0%,#fcebcc_40%,#fdf8ef_75%)]" />
      <VMask name="mandala-gold" className="absolute -left-40 -bottom-48 -z-10 h-[620px] w-[620px] text-[#c98a2b] opacity-[0.12]" />
      <div className="grid items-end lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]">
        <CutOut src="/legacy/prabhupada.webp" alt={PRABHU} fade={0} className="mx-auto w-[78%] max-w-[380px] pt-8" />
        <div className="relative px-6 pb-10 pt-6 sm:px-10 lg:pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <p className="mt-3 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[48px]">“Kṛṣṇa sent him.”</p>
          <p className="mt-2 text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
          <div className="mt-7 flex items-center gap-4 rounded-2xl border border-[#eadcbd] bg-white/75 p-3 pr-5 backdrop-blur">
            <CutOut src="/legacy/gurudeva.webp" alt={GURU} fade={0} className="h-24 w-24 shrink-0 rounded-xl bg-[#fbefd8] object-contain object-bottom" />
            <div><p className="text-[15px] font-medium leading-relaxed text-ink">“Krishna is with you and there is no need of disappointment.”</p><p className="mt-1 text-[12.5px] text-ink-3">Śrīla Prabhupāda to Śrīla Gurudeva · Letter, Māyāpur, 12 February 1976</p></div>
          </div>
          <Toggle open={open} set={setOpen} className="mt-5" />
        </div>
      </div>
      <Details open={open} />
    </div>
  );
}

/** C — Paramparā medallions: both portraits in gold medallions on a cream field, Prabhupāda above and larger, joined by a line of descent. */
export function BlessingMedallions() {
  const [open, setOpen] = useState(false);
  const Med = ({ src, alt, size }: { src: string; alt: string; size: string }) => (
    <div className={`${size} rounded-full bg-gradient-to-b from-[#e9b85f] via-[#fff1d0] to-[#e9b85f] p-[4px]`}><div className="h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_30%,#fff7e3,#f6d9a0_70%)]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={alt} className="h-full w-full object-contain object-bottom pt-3" /></div></div>
  );
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#eadcbd] bg-[#fdf8ef]">
      <Backdrop src="cream-mandala" o={0.08} />
      <div className="relative grid items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex flex-col items-center">
          <Med src="/legacy/prabhupada.webp" alt={PRABHU} size="h-[200px] w-[200px]" />
          <p className="mt-2 text-[13px] font-semibold text-[#7a3a06]">Śrīla Prabhupāda</p>
          <span className="my-1 h-8 w-px bg-gradient-to-b from-[#c98a2b] to-[#e3cf9f]" />
          <Med src="/legacy/gurudeva.webp" alt={GURU} size="h-[132px] w-[132px]" />
          <p className="mt-2 text-[13px] font-semibold text-[#7a3a06]">Śrīla Gurudeva</p>
        </div>
        <div className="text-center lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p>
          <p className="mt-3 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[50px]">“Kṛṣṇa sent him.”</p>
          <p className="mt-2 text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
          <div className="mt-7 border-l-[3px] border-[#c98a2b] pl-5 text-left"><p className="text-[17px] font-medium leading-relaxed text-ink-2">“Krishna is with you and there is no need of disappointment.”</p><p className="mt-1 text-[13px] text-ink-3">Letter, Māyāpur, 12 February 1976</p></div>
          <Toggle open={open} set={setOpen} className="mx-auto mt-6 lg:mx-0" />
        </div>
      </div>
      <Details open={open} />
    </div>
  );
}

/* ---------- Second round: new light colours, new motifs ---------- */
function Words({ open, setOpen, tone, kick }: { open: boolean; setOpen: (v: boolean) => void; tone: string; kick: string }) {
  return (
    <div className="self-center pb-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: kick }}>Śrīla Prabhupāda on Śrīla Gurudeva</p>
      <p className="mt-3 text-[34px] font-bold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[44px]">“Kṛṣṇa sent him.”</p>
      <p className="mt-2 text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
      <p className="mx-auto mt-6 max-w-sm rounded-2xl px-4 py-3 text-[15.5px] font-medium leading-relaxed text-ink-2" style={{ background: tone }}>“Krishna is with you and there is no need of disappointment.”<span className="mt-1 block text-[12.5px] font-normal text-ink-3">Letter, Māyāpur, 12 February 1976</span></p>
      <Toggle open={open} set={setOpen} className="mx-auto mt-5" />
    </div>
  );
}

/** D — Morning sky: pale blue wash, navy paisley lace, floral swirls in the corners. */
export function BlessingSky() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#d8e3f3] bg-gradient-to-b from-[#f2f7fd] to-[#fbfdff]">
      <VMask name="paisley-navy" repeat="repeat" size="420px" className="absolute inset-0 -z-10 text-[#3c5a99] opacity-[0.06]" />
      <VMask name="floral-swirl" className="absolute -left-6 -top-4 -z-10 h-56 w-40 text-[#6f8cc4] opacity-25" />
      <VMask name="floral-swirl" className="absolute -right-6 -top-4 -z-10 h-56 w-40 -scale-x-100 text-[#6f8cc4] opacity-25" />
      <div className="grid items-end gap-4 px-5 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="relative mx-auto w-full max-w-[300px]"><div className="absolute inset-x-6 bottom-0 top-10 -z-10 rounded-t-full bg-white/80 ring-1 ring-[#d8e3f3]" /><CutOut src="/legacy/prabhupada.webp" alt={PRABHU} fade={0} className="w-full" /></div>
        <Words open={open} setOpen={setOpen} tone="#e6eef9" kick="#3c5a99" />
        <div className="relative mx-auto w-full max-w-[220px]"><div className="absolute inset-x-4 bottom-0 top-8 -z-10 rounded-t-full bg-white/80 ring-1 ring-[#d8e3f3]" /><CutOut src="/legacy/gurudeva.webp" alt={GURU} fade={0} className="w-full" /></div>
      </div>
      <Details open={open} />
    </div>
  );
}

/** E — Lotus blush: soft pink and peach, gold half-mandala crests rising behind each portrait like a halo. */
export function BlessingBlush() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-[#f1d9dc] bg-gradient-to-br from-[#fdf1f1] via-[#fff8f3] to-[#fdf0e6]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/backgrounds/paint-pink.webp" alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.07]" />
      <div className="grid items-end gap-4 px-5 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="relative mx-auto w-full max-w-[300px]"><VMask name="crest-gold" className="absolute -inset-x-8 bottom-6 -z-10 h-[78%] text-[#d99a9a] opacity-35" /><CutOut src="/legacy/prabhupada.webp" alt={PRABHU} fade={0} className="w-full" /></div>
        <Words open={open} setOpen={setOpen} tone="#fbe6e8" kick="#a3365a" />
        <div className="relative mx-auto w-full max-w-[220px]"><VMask name="crest-gold" className="absolute -inset-x-6 bottom-6 -z-10 h-[78%] text-[#d99a9a] opacity-35" /><CutOut src="/legacy/gurudeva.webp" alt={GURU} fade={0} className="w-full" /></div>
      </div>
      <VMask name="border-2" repeat="repeat-x" size="auto 100%" className="h-4 w-full text-[#d99a9a] opacity-60" />
      <Details open={open} />
    </div>
  );
}

/** F — Tulasī green: pale sage, a large saffron mandala half-curve in one corner, a leaf-green lace edge at the base. */
export function BlessingTulasi() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div className="relative isolate overflow-hidden rounded-t-[28px] border border-b-0 border-[#d6e6d6] bg-gradient-to-b from-[#f3f8f1] to-[#f6faf3]">
        <VMask name="mandala-half-curve" className="absolute -right-10 -top-8 -z-10 h-72 w-72 text-[#6a9b6e] opacity-[0.16]" />
        <VMask name="mandala-saffron" className="absolute -bottom-40 -left-32 -z-10 h-96 w-96 text-[#6a9b6e] opacity-[0.10]" />
        <div className="grid items-end gap-4 px-5 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="mx-auto w-full max-w-[300px]"><CutOut src="/legacy/prabhupada.webp" alt={PRABHU} fade={0} className="w-full" /></div>
          <Words open={open} setOpen={setOpen} tone="#e5f0e3" kick="#2f6b3f" />
          <div className="mx-auto w-full max-w-[220px]"><CutOut src="/legacy/gurudeva.webp" alt={GURU} fade={0} className="w-full" /></div>
        </div>
        <Details open={open} />
      </div>
      <div aria-hidden className="h-[3px] w-full bg-[#7fae82]" />
      <div aria-hidden className="-mt-px h-6 w-full overflow-hidden"><VMask name="border-2" repeat="repeat-x" size="auto 100%" pos="center top" className="h-full w-full rotate-180 text-[#7fae82]" /></div>
    </div>
  );
}
