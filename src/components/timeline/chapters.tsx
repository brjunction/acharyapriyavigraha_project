"use client";
/* The life timeline's default view: a real timeline. A line runs down the page with the years on it and each moment
   beside it (alternating sides on wide screens); the chapters of his life cross the line as bands. On top, a year ruler
   shows the whole life: tap or drag it to go to any year; ‹ › (or the arrow keys) step moment by moment.
   Advanced adds a calm panel on the left: search, chapters, kinds of moment and places, which filter the line. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Users, Search, X, Link2, Check, ExternalLink, Headphones, ArrowRight } from "lucide-react";
import Link from "next/link";
import { KINDS, kindOf, when, eraOf, type Era, type LifeEvent } from "@/lib/content/timeline-shared";

const fold = (t: string) => t.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();

const span = (e: Era) => (e.year_from === e.year_to ? `${e.year_from}` : `${e.year_from}–${e.year_to}`);
const INK = "#1f1a14"; const MUTED = "#cdbfae";

export function TimelineChapters({ eras, events, recordings = {}, advanced, onMode }: { eras: Era[]; events: LifeEvent[]; recordings?: Record<number, number>; advanced: boolean; onMode: (adv: boolean) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const all = useMemo(() => [...events].sort((a, b) => a.year - b.year || (a.month || 0) - (b.month || 0) || (a.day || 0) - (b.day || 0)), [events]);
  const [q, setQ] = useState(""); const [kinds, setKinds] = useState<string[]>([]); const [place, setPlace] = useState("");
  const list = useMemo(() => { if (!advanced) return all; const w = fold(q.trim()).split(/\s+/).filter(Boolean);
    return all.filter((e) => (!kinds.length || kinds.includes(e.kind)) && (!place || e.place === place) && (!w.length || w.every((x) => fold([e.title, e.summary, e.body, e.place, e.country, e.people.join(" "), String(e.year), e.date_label].filter(Boolean).join(" ")).includes(x)))); }, [all, advanced, q, kinds, place]);
  const usedKinds = KINDS.filter(([k]) => all.some((e) => e.kind === k));
  const places = useMemo(() => { const m = new Map<string, number>(); all.forEach((e) => e.place && m.set(e.place, (m.get(e.place) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [all]);
  const filtered = advanced && (q.trim() || kinds.length || place);
  const from = all[0]?.year ?? 0, to = all[all.length - 1]?.year ?? 0, len = Math.max(1, to - from);
  const [cur, setCur] = useState(0); const [drag, setDrag] = useState(false);
  const ruler = useRef<HTMLDivElement>(null);
  const eraIx = (e: LifeEvent) => { const x = eraOf(eras, e.year); return x ? eras.indexOf(x) : -1; };

  // The moment being read follows the scroll.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-ev]"));
    const io = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) setCur(Number((x.target as HTMLElement).dataset.ev)); }), { rootMargin: "-40% 0px -55% 0px" });
    els.forEach((e) => io.observe(e));
    const seen = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("tlc-seen"); seen.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".tlc-in").forEach((e) => seen.observe(e));
    return () => { io.disconnect(); seen.disconnect(); };
  }, [list]);

  useEffect(() => { setCur(0); }, [list.length]);
  // A shared link (#m-slug) opens that moment.
  useEffect(() => { const h = decodeURIComponent(location.hash.slice(1)); const i = h.startsWith("m-") ? all.findIndex((e) => `m-${e.slug}` === h) : -1; if (i >= 0) setTimeout(() => { go(i, false); setOpen(i); }, 250); }, []); // eslint-disable-line
  const go = useCallback((i: number, smooth = true) => {
    const k = Math.max(0, Math.min(list.length - 1, i)); const el = document.getElementById(`m-${list[k]?.slug}`); if (!el) return;
    setCur(k); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 190, behavior: smooth ? "smooth" : "auto" });
  }, [list]);
  const toYear = useCallback((y: number, smooth = true) => { let best = 0; list.forEach((e, i) => { if (Math.abs(e.year - y) < Math.abs(list[best].year - y)) best = i; }); go(best, smooth); }, [list, go]);
  const yearAt = (clientX: number) => { const r = ruler.current!.getBoundingClientRect(); return Math.round(from + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * len); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest("input,textarea,select,[contenteditable]")) return; if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [cur, go]);

  if (!all.length) return <p className="py-20 text-center text-[15px] text-ink-3">The moments of his life are being added.</p>;
  const now = list[Math.min(cur, list.length - 1)] || all[0]; const maxRec = Math.max(1, ...Object.values(recordings)); const pct = (y: number) => ((y - from) / len) * 100;
  const decades: number[] = []; for (let y = Math.ceil(from / 10) * 10; y <= to; y += 10) decades.push(y);

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-[1180px] px-5 pt-10 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[34px]">Life timeline</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">Śrī Śrīmad Gour Govinda Swāmī Gurudeva, {from}–{to}: {all.length} moments in {eras.length} chapters.</p>
          </div>
          <div className="inline-flex rounded-full bg-band p-1 text-[13px]" role="group" aria-label="View">{([[false, "Simple"], [true, "Advanced"]] as const).map(([v, l]) => <button key={l} onClick={() => onMode(v)} aria-pressed={advanced === v} className={`h-8 rounded-full px-4 transition ${advanced === v ? "bg-white font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}>{l}</button>)}</div>
        </div>
      </section>

      {/* Year ruler: the whole life at a glance; tap or drag to go to a year */}
      <div className="sticky top-[52px] z-30 mt-6 border-y border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-5 py-3 sm:px-8">
          <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous moment" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 transition hover:border-ink hover:text-ink disabled:opacity-30"><ChevronLeft size={18} /></button>
          <div className="min-w-0 flex-1">
            <div ref={ruler} role="slider" aria-label="Year" aria-valuemin={from} aria-valuemax={to} aria-valuenow={now.year} tabIndex={0}
              onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); toYear(now.year + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); toYear(now.year - 1); } }}
              onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDrag(true); toYear(yearAt(e.clientX), false); }}
              onPointerMove={(e) => drag && toYear(yearAt(e.clientX), false)} onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)}
              className="relative h-12 cursor-pointer touch-none select-none pt-1 outline-none">
              {/* faint bars: how many of his lectures were recorded each year */}
              {Object.entries(recordings).map(([y, n]) => +y >= from && +y <= to && <span key={y} className="absolute bottom-[31px] w-[3px] -translate-x-1/2 rounded-t-sm bg-[#e4d8c8]" style={{ left: `${pct(+y)}%`, height: `${Math.max(2, (n / maxRec) * 12)}px` }} title={`${y}: ${n} recordings`} />)}
              {/* the chapters */}
              <div className="absolute inset-x-0 top-[15px] h-[3px] overflow-hidden rounded-full bg-band">
                {eras.map((e, i) => <span key={e.id} title={`${e.title} · ${span(e)}`} className="absolute inset-y-0" style={{ left: `${pct(Math.max(from, e.year_from))}%`, width: `${Math.max(0.6, pct(Math.min(to, e.year_to)) - pct(Math.max(from, e.year_from)))}%`, background: eraIx(now) === i ? "#8b7a66" : MUTED, opacity: 1, borderRight: "2px solid #fff" }} />)}
              </div>
              {/* a dot for every moment */}
              {list.map((e, i) => <span key={e.id} className="absolute top-[13px] size-2 -translate-x-1/2 rounded-full ring-2 ring-white" style={{ left: `${pct(e.year)}%`, background: i === cur ? INK : "#b9a891", opacity: i === cur ? 1 : 0.0 }} />)}
              {/* decade labels */}
              {decades.map((y) => <span key={y} className={`absolute top-[26px] -translate-x-1/2 text-[10.5px] tabular-nums text-ink-3 ${(y / 10) % 2 ? "max-sm:hidden" : ""}`} style={{ left: `${pct(y)}%` }}>{y}</span>)}
              {/* the current year */}
              <span className="absolute top-0 -translate-x-1/2 transition-[left] duration-300 ease-out" style={{ left: `${pct(now.year)}%` }}>
                <span className="block h-[30px] w-px bg-ink" />
              </span>
            </div>
          </div>
          <div className="w-[118px] shrink-0 text-right max-sm:w-[64px]"><p className="text-[22px] font-semibold leading-none tabular-nums text-ink">{now.year}</p><p className="mt-1 truncate text-[11.5px] text-ink-3 max-sm:hidden">{eras[eraIx(now)]?.title || ""}</p></div>
          <button onClick={() => go(cur + 1)} disabled={cur === list.length - 1} aria-label="Next moment" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 transition hover:border-ink hover:text-ink disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Advanced: the panel beside the line */}
      <div className={advanced ? "mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)]" : ""}>
      {advanced && <aside className="pt-8 lg:sticky lg:top-[140px] lg:max-h-[calc(100dvh-160px)] lg:self-start lg:overflow-y-auto lg:pb-8 [scrollbar-width:thin]">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-ink"><Search size={15} className="text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search his life" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" />{q && <button onClick={() => setQ("")} aria-label="Clear"><X size={14} className="text-ink-3" /></button>}</label>
        <p className="mb-1.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Chapters</p>
        <ul>{eras.map((e, i) => <li key={e.id}><button onClick={() => toYear(e.year_from)} className={`flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left text-[13.5px] transition hover:bg-band ${eraIx(now) === i ? "bg-band font-medium text-ink" : "text-ink-2"}`}><span className={`h-3 w-px shrink-0 ${eraIx(now) === i ? "bg-ink" : "bg-line-strong"}`} /><span className="min-w-0 flex-1 truncate">{e.title}</span><span className="shrink-0 text-[11.5px] tabular-nums text-ink-3">{span(e)}</span></button></li>)}</ul>
        {usedKinds.length > 1 && <><p className="mb-1.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Kind of moment</p>
          <ul>{usedKinds.map(([k, l, c]) => { const on = kinds.includes(k); const n = all.filter((e) => e.kind === k).length; return <li key={k}><button onClick={() => setKinds((s) => (on ? s.filter((x) => x !== k) : [...s, k]))} aria-pressed={on} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13.5px] transition hover:bg-band ${on ? "bg-band font-medium text-ink" : "text-ink-2"}`}><span className={`flex size-4 items-center justify-center rounded border ${on ? "border-transparent" : "border-line-strong"}`} style={on ? { background: c } : undefined}>{on && <span className="size-1.5 rounded-full bg-white" />}</span><span className="flex-1">{l}</span><span className="text-[11.5px] tabular-nums text-ink-3">{n}</span></button></li>; })}</ul></>}
        {places.length > 1 && <><p className="mb-1.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Place</p>
          <select value={place} onChange={(e) => setPlace(e.target.value)} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13.5px] outline-none focus:border-ink"><option value="">Every place</option>{places.map(([p, n]) => <option key={p} value={p}>{p} ({n})</option>)}</select></>}
        {filtered && <button onClick={() => { setQ(""); setKinds([]); setPlace(""); }} className="mt-5 text-[13px] text-ink-2 underline underline-offset-2 hover:text-ink">Show every moment</button>}
      </aside>}
      <div>
      {advanced && <p className="pt-8 text-[13px] text-ink-3">{filtered ? `${list.length} of ${all.length} moments` : `${all.length} moments`}</p>}
      {!list.length && <p className="py-16 text-center text-[14px] text-ink-3">Nothing matches. Try another word, or show every moment.</p>}
      <div className={`relative pb-24 ${advanced ? "pt-4" : "pt-10"} ${advanced ? "" : "mx-auto max-w-[1180px] px-5 sm:px-8"}`}>
        <span aria-hidden className={`absolute bottom-0 top-0 w-px bg-line-strong ${advanced ? "left-[7px] sm:left-[11px]" : "left-[27px] sm:left-[39px] lg:left-1/2 lg:-translate-x-1/2"}`} />
        {list.map((e, i) => {
          const prev = list[i - 1]; const newYear = !prev || prev.year !== e.year; const ei = eraIx(e); const newEra = ei >= 0 && (!prev || eraIx(prev) !== ei);
          const k = kindOf(e.kind); const right = advanced || i % 2 === 1; const era = eras[ei];
          return (
            <div key={e.id}>
              {newEra && era && (
                <div className={`tlc-in relative z-10 mb-6 bg-white py-3 ${i === 0 ? "mt-0" : "mt-14"} ${advanced ? "ml-[28px] sm:ml-[36px]" : "ml-[44px] sm:ml-[64px] lg:mx-auto lg:max-w-[520px] lg:text-center"}`}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">Chapter {ei + 1} · <span className="tabular-nums">{span(era)}</span></p>
                  <h2 className="mt-1.5 text-[21px] font-semibold leading-snug tracking-[-0.01em] text-ink">{era.title}</h2>
                  {era.summary && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{era.summary}</p>}
                </div>)}
              {newYear && (
                <div className={`relative z-10 mb-3 mt-6 flex items-center ${advanced ? "" : "lg:justify-center"}`}>
                  <span className="bg-white py-1 pr-2 text-[13px] font-semibold tabular-nums tracking-wide text-ink lg:px-2">{e.year}</span>
                </div>)}
              <article id={`m-${e.slug}`} data-ev={i} className={`tlc-in relative mb-5 ${advanced ? "pl-[28px] sm:pl-[36px]" : "pl-[44px] sm:pl-[64px] lg:grid lg:grid-cols-2 lg:gap-14 lg:pl-0"}`}>
                <span aria-hidden className={`absolute top-5 z-10 size-[9px] rounded-full ring-[3px] ring-white transition ${advanced ? "left-[2px] sm:left-[6px]" : "left-[22px] sm:left-[34px] lg:left-1/2 lg:-translate-x-1/2"} ${i === cur ? "bg-ink" : "bg-[#cdbfae]"}`} />
                <div className={right ? "lg:col-start-2" : "lg:col-start-1 lg:text-right"}>
                  <div role="button" tabIndex={0} onClick={() => { setCur(i); setOpen(i); }} onKeyDown={(ev) => ev.key === "Enter" && setOpen(i)} className={`group cursor-pointer border-b border-line/70 pb-5 pt-3 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ink/20 ${i === cur ? "" : "opacity-[.86] hover:opacity-100"}`}>
                    <p className="text-[12.5px] tabular-nums text-ink-3">{when(e)}<span className="mx-1.5">·</span>{k[1]}</p>
                    <h3 className={`mt-1 leading-snug text-ink ${e.importance === 1 ? "text-[17px] font-semibold" : "text-[15px] font-medium"}`}>{e.title}</h3>
                    {e.summary && e.importance !== 3 && <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{e.summary}</p>}
                    {(e.place || e.people.length > 0) && <p className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-3 ${right ? "" : "lg:justify-end"}`}>
                      {e.place && <span className="flex items-center gap-1"><MapPin size={13} />{[e.place, e.country].filter(Boolean).join(", ")}</span>}
                      {e.people.length > 0 && <span className="flex items-center gap-1"><Users size={13} />{e.people.join(", ")}</span>}
                    </p>}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt={e.image_caption || ""} loading="lazy" className={`mt-3 h-auto max-h-[220px] w-auto max-w-full rounded-lg border border-line ${right ? "" : "lg:ml-auto"}`} />}
                    {(e.body || e.links.length > 0 || e.source) && <p className={`mt-2.5 flex items-center gap-1 text-[12.5px] font-medium text-ink-2 group-hover:text-ink ${right ? "" : "lg:justify-end"}`}>Read more<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></p>}
                  </div>
                </div>
              </article>
            </div>);
        })}
        {list.length > 0 && <div className={`relative z-10 mt-8 flex ${advanced ? "" : "lg:justify-center"}`}><span className="ml-0 bg-white py-1 pr-2 text-[13px] font-semibold tabular-nums text-ink lg:px-2 sm:ml-[28px] lg:ml-0">{to}</span></div>}
      </div>
      </div></div>
      {open !== null && list[open] && <Moment e={list[open]} chapter={eras[eraIx(list[open])]} rec={recordings[list[open].year]} onClose={() => setOpen(null)}
        onPrev={open > 0 ? () => { go(open - 1); setOpen(open - 1); } : undefined} onNext={open < list.length - 1 ? () => { go(open + 1); setOpen(open + 1); } : undefined} />}
    </div>);
}

/** One moment in full: the account, the picture, people and place, links, source; share, previous and next. */
function Moment({ e, chapter, rec, onClose, onPrev, onNext }: { e: LifeEvent; chapter?: Era; rec?: number; onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  const [copied, setCopied] = useState(false); const k = kindOf(e.kind);
  const share = () => { try { const u = `${location.origin}${location.pathname}#m-${e.slug}`; navigator.clipboard.writeText(u); history.replaceState(null, "", `#m-${e.slug}`); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} };
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/25" onMouseDown={(x) => x.target === x.currentTarget && onClose()} role="dialog" aria-modal aria-label={e.title}>
      <aside className="tlm-in flex h-full w-full max-w-[560px] flex-col bg-white shadow-[-20px_0_60px_-30px_rgba(0,0,0,.35)]">
        <div className="flex items-center gap-1 border-b border-line px-4 py-2.5">
          <button onClick={onPrev} disabled={!onPrev} aria-label="Previous moment" className="rounded-full p-2 text-ink-2 hover:bg-band disabled:opacity-30"><ChevronLeft size={17} /></button>
          <button onClick={onNext} disabled={!onNext} aria-label="Next moment" className="rounded-full p-2 text-ink-2 hover:bg-band disabled:opacity-30"><ChevronRight size={17} /></button>
          <p className="ml-1 min-w-0 flex-1 truncate text-[12.5px] text-ink-3">{chapter ? `Chapter · ${chapter.title}` : ""}</p>
          <button onClick={share} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] text-ink-2 hover:bg-band">{copied ? <Check size={14} /> : <Link2 size={14} />}{copied ? "Copied" : "Share"}</button>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink-2 hover:bg-band"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6 sm:px-8">
          <p className="text-[12.5px] tabular-nums text-ink-3">{when(e)}<span className="mx-1.5">·</span>{k[1]}</p>
          <h2 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-ink">{e.title}</h2>
          {(e.place || e.people.length > 0) && <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
            {e.place && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-ink-3" />{[e.place, e.country].filter(Boolean).join(", ")}</span>}
            {e.people.length > 0 && <span className="flex items-center gap-1.5"><Users size={14} className="text-ink-3" />{e.people.join(", ")}</span>}</p>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {e.image && <figure className="mt-5"><img src={e.image} alt={e.image_caption || ""} className="h-auto w-full rounded-xl border border-line" />{e.image_caption && <figcaption className="mt-2 text-[12.5px] text-ink-3">{e.image_caption}</figcaption>}</figure>}
          {e.summary && <p className="mt-5 text-[16px] leading-relaxed text-ink">{e.summary}</p>}
          {e.body && <div className="mt-4 space-y-3 text-[15px] leading-[1.75] text-ink-2">{e.body.split(/\n\s*\n/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>}
          {e.links.length > 0 && <div className="mt-6 border-t border-line pt-4"><p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">Read and listen</p>
            <ul className="space-y-1">{e.links.map((l, i) => { const ext = /^https?:/.test(l.url); return <li key={i}>{ext ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[14px] text-ink hover:underline">{l.label || l.url}<ExternalLink size={13} className="text-ink-3" /></a> : <Link href={l.url} className="flex items-center gap-2 text-[14px] text-ink hover:underline">{l.label || l.url}<ArrowRight size={13} className="text-ink-3" /></Link>}</li>; })}</ul></div>}
          {rec ? <Link href={`/teachings/audio?year=${e.year}`} className="mt-6 flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-[13.5px] text-ink-2 hover:border-ink hover:text-ink"><Headphones size={15} />{rec} of his lectures were recorded in {e.year}<ArrowRight size={14} className="ml-auto" /></Link> : null}
          {e.source && <p className="mt-6 border-t border-line pt-4 text-[12.5px] text-ink-3">Source: {e.source}</p>}
        </div>
      </aside>
    </div>);
}
