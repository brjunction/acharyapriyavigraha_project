"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, MapPin, X } from "lucide-react";
import { kindOf, when, type LifeEvent } from "@/lib/content/timeline-shared";

const serif = {} as const;
const pos = (e: LifeEvent) => e.year + ((e.month || 6) - 1) / 12 + ((e.day || 15) - 1) / 365;

/** A long line of years; every moment is a point on it. Hover or tap a point to see the moment with its picture. */
export function LineView({ events }: { events: LifeEvent[] }) {
  const xs = useMemo(() => [...events].sort((a, b) => pos(a) - pos(b)), [events]);
  const [cur, setCur] = useState<LifeEvent | null>(null); const [pin, setPin] = useState<LifeEvent | null>(null);
  if (!xs.length) return null;
  const y0 = Math.floor(xs[0].year / 5) * 5, y1 = Math.ceil((xs[xs.length - 1].year + 1) / 5) * 5; const span = y1 - y0; const W = Math.max(1100, span * 34);
  const lanes: number[] = []; const lane = xs.map((e) => { const x = ((pos(e) - y0) / span) * W; let l = 0; while (lanes[l] !== undefined && x - lanes[l] < 26) l++; lanes[l] = x; return l % 4; });
  const show = pin || cur;
  return (
    <div className="relative">
      <div className="overflow-x-auto pb-4 [scrollbar-width:thin]">
        <div className="relative h-[220px]" style={{ width: W }}>
          <div className="absolute inset-x-0 top-[150px] h-px bg-line-strong" />
          {Array.from({ length: span / 5 + 1 }, (_, i) => y0 + i * 5).map((y) => <div key={y} className="absolute top-[150px]" style={{ left: ((y - y0) / span) * W }}><span className="block h-2.5 w-px bg-line-strong" /><span className="absolute left-0 top-4 -translate-x-1/2 text-[11.5px] tabular-nums text-ink-3">{y}</span></div>)}
          {xs.map((e, i) => { const c = kindOf(e.kind)[2]; const x = ((pos(e) - y0) / span) * W; const top = 150 - 26 - lane[i] * 28; const big = e.importance === 1; return (
            <button key={e.id} onMouseEnter={() => setCur(e)} onMouseLeave={() => setCur(null)} onClick={() => setPin(pin?.id === e.id ? null : e)} className="tl-pop absolute -translate-x-1/2" style={{ left: x, top, animationDelay: `${Math.min(i * 25, 1200)}ms` }} aria-label={e.title}>
              <span className="absolute left-1/2 top-full block w-px -translate-x-1/2 bg-line" style={{ height: 150 - top - (big ? 14 : 10) }} />
              {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt="" className={`block rounded-full border-2 object-cover shadow-sm transition hover:scale-125 ${big ? "size-7" : "size-5"}`} style={{ borderColor: c }} /> : <span className={`block rounded-full border-2 border-white shadow transition hover:scale-150 ${big ? "size-4" : "size-3"}`} style={{ background: c }} />}
            </button>); })}
        </div>
      </div>
      <div className="min-h-[150px]">{show ? <MomentCard e={show} onClose={pin ? () => setPin(null) : undefined} /> : <p className="py-10 text-center text-[13px] text-ink-3">Point at a moment on the line — or tap it — to see what happened.</p>}</div>
    </div>
  );
}

function MomentCard({ e, onClose }: { e: LifeEvent; onClose?: () => void }) {
  const [, l, c] = kindOf(e.kind);
  return (
    <div className="tl-fade relative grid gap-5 rounded-2xl border border-line bg-white p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.4)] sm:grid-cols-[200px_minmax(0,1fr)] sm:p-5">
      {onClose && <button onClick={onClose} className="absolute right-3 top-3 text-ink-3 hover:text-ink"><X size={16} /></button>}
      {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt={e.image_caption || ""} className="aspect-[4/3] w-full rounded-xl object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center rounded-xl text-[34px] text-white/90" style={{ background: `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 55%, #000))`, ...serif }}>{e.year}</div>}
      <div className="min-w-0"><p className="flex flex-wrap items-center gap-2 text-[12px] text-ink-3"><span className="font-medium" style={{ color: c }}>{when(e)}</span><span>· {l}</span>{e.place && <span className="flex items-center gap-1"><MapPin size={12} />{e.place}</span>}</p><h3 className="mt-1 text-[19px] leading-snug text-ink" style={serif}>{e.title}</h3>{e.summary && <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{e.summary}</p>}{e.image_caption && <p className="mt-2 text-[12px]  text-ink-3">{e.image_caption}</p>}</div>
    </div>
  );
}

/** Every moment as a picture card, year by year. */
export function CardsView({ events }: { events: LifeEvent[] }) {
  const xs = useMemo(() => [...events].sort((a, b) => pos(a) - pos(b)), [events]);
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">{xs.map((e, i) => { const [, l, c] = kindOf(e.kind); return (
      <article key={e.id} id={`c-${e.slug}`} className="tl-fade mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-white" style={{ animationDelay: `${Math.min(i * 40, 800)}ms` }}>
        {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt={e.image_caption || ""} loading="lazy" className="w-full object-cover" /> : <div className="flex h-24 items-end p-4" style={{ background: `linear-gradient(135deg, ${c}22, ${c}0d)` }}><span className="text-[34px] leading-none" style={{ ...serif, color: c }}>{e.year}</span></div>}
        <div className="p-4"><p className="text-[11.5px] text-ink-3"><span className="font-medium" style={{ color: c }}>{when(e)}</span> · {l}</p><h3 className="mt-1 text-[16px] leading-snug text-ink" style={serif}>{e.title}</h3>{e.summary && <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{e.summary}</p>}{e.place && <p className="mt-2 flex items-center gap-1 text-[12px] text-ink-3"><MapPin size={12} />{[e.place, e.country].filter(Boolean).join(", ")}</p>}</div>
      </article>); })}</div>
  );
}

/** One moment at a time, large, like a slideshow — with a strip of years to jump anywhere. */
export function FilmView({ events }: { events: LifeEvent[] }) {
  const xs = useMemo(() => [...events].sort((a, b) => pos(a) - pos(b)), [events]);
  const [i, setI] = useState(0); const [play, setPlay] = useState(false); const strip = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!play) return; const t = setInterval(() => setI((k) => (k + 1) % xs.length), 6000); return () => clearInterval(t); }, [play, xs.length]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if ((ev.target as HTMLElement).closest("input,textarea")) return; if (ev.key === "ArrowRight") setI((x) => Math.min(xs.length - 1, x + 1)); if (ev.key === "ArrowLeft") setI((x) => Math.max(0, x - 1)); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [xs.length]);
  useEffect(() => { strip.current?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }, [i]);
  const e = xs[i]; if (!e) return null; const [, l, c] = kindOf(e.kind);
  return (
    <div>
      <div key={e.id} className="tl-fade grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-white p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
        {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt={e.image_caption || ""} className="aspect-[4/3] w-full rounded-2xl object-cover" /> : <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl text-[64px] text-white/90 sm:text-[88px]" style={{ background: `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 50%, #000))`, ...serif }}>{e.year}</div>}
        <div><p className="text-[12.5px] text-ink-3"><span className="font-medium" style={{ color: c }}>{when(e)}</span> · {l}</p><h3 className="mt-2 text-[24px] leading-tight text-ink sm:text-[30px]" style={serif}>{e.title}</h3>{e.summary && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{e.summary}</p>}{e.place && <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-3"><MapPin size={13} />{[e.place, e.country].filter(Boolean).join(", ")}</p>}
          <div className="mt-6 flex items-center gap-2"><button onClick={() => setI(Math.max(0, i - 1))} className="flex size-9 items-center justify-center rounded-full border border-line hover:bg-band"><ChevronLeft size={17} /></button><button onClick={() => setPlay(!play)} className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-white">{play ? <Pause size={14} /> : <Play size={14} />}{play ? "Pause" : "Play"}</button><button onClick={() => setI(Math.min(xs.length - 1, i + 1))} className="flex size-9 items-center justify-center rounded-full border border-line hover:bg-band"><ChevronRight size={17} /></button><span className="ml-2 text-[12px] tabular-nums text-ink-3">{i + 1} / {xs.length}</span></div>
        </div>
      </div>
      <div ref={strip} className="mt-4 flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:thin]">{xs.map((x, k) => <button key={x.id} data-i={k} onClick={() => { setI(k); setPlay(false); }} className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] transition ${k === i ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:bg-band"}`}><span className="block tabular-nums">{x.year}</span><span className="block max-w-[140px] truncate">{x.title}</span></button>)}</div>
    </div>
  );
}
