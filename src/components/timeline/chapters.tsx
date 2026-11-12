"use client";
/* The life timeline. On top, a zoomable ruler: the whole life, a decade, a year or a month (buttons, or Ctrl/pinch +
   wheel on the ruler); labels change from decades to years, months and days; an overview strip shows where the window
   is. Tap or drag the ruler to go to a moment; ‹ › or the arrow keys step through. Below, the line with the years and
   chapters, filling in as you read; each moment opens in full. Simple = the timeline; Advanced adds a side panel
   (search, chapters, kinds of moment, places). */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Users, Search, X, Link2, Check, ExternalLink, Headphones, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { KINDS, kindOf, when, eraOf, type Era, type LifeEvent } from "@/lib/content/timeline-shared";

const fold = (t: string) => t.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
const span = (e: Era) => (e.year_from === e.year_to ? `${e.year_from}` : `${e.year_from}–${e.year_to}`);
/** Muted, earthy colours for the chapters. */
const ERA_C = ["#b5651d", "#9c4a2f", "#2f6f73", "#5b5ea6", "#8a6d1f", "#7a3e65", "#4f7a3a"];
const eraC = (i: number) => ERA_C[((i % ERA_C.length) + ERA_C.length) % ERA_C.length];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** A moment's place in time, as a fractional year. */
const tOf = (e: LifeEvent) => e.year + ((e.month || 1) - 1) / 12 + ((e.month && e.day ? e.day : 1) - 1) / 365;
const ZOOMS: [string, number][] = [["Life", 0], ["10 years", 10], ["1 year", 1], ["1 month", 1 / 12]];

export function TimelineChapters({ eras, events, recordings = {}, advanced, onMode }: { eras: Era[]; events: LifeEvent[]; recordings?: Record<number, number>; advanced: boolean; onMode: (adv: boolean) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const all = useMemo(() => [...events].sort((a, b) => tOf(a) - tOf(b)), [events]);
  const [q, setQ] = useState(""); const [kinds, setKinds] = useState<string[]>([]); const [place, setPlace] = useState("");
  const list = useMemo(() => { if (!advanced) return all; const w = fold(q.trim()).split(/\s+/).filter(Boolean);
    return all.filter((e) => (!kinds.length || kinds.includes(e.kind)) && (!place || e.place === place) && (!w.length || w.every((x) => fold([e.title, e.summary, e.body, e.place, e.country, e.people.join(" "), String(e.year), e.date_label].filter(Boolean).join(" ")).includes(x)))); }, [all, advanced, q, kinds, place]);
  const usedKinds = KINDS.filter(([k]) => all.some((e) => e.kind === k));
  const places = useMemo(() => { const m = new Map<string, number>(); all.forEach((e) => e.place && m.set(e.place, (m.get(e.place) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [all]);
  const filtered = advanced && (q.trim() || kinds.length || place);
  const lifeFrom = all.length ? Math.floor(tOf(all[0])) : 0, lifeTo = all.length ? Math.floor(tOf(all[all.length - 1])) + 1 : 1;
  const [cur, setCur] = useState(0); const [drag, setDrag] = useState(false);
  const [win, setWin] = useState<[number, number]>([lifeFrom, lifeTo]);
  const ruler = useRef<HTMLDivElement>(null); const line = useRef<HTMLDivElement>(null); const [fill, setFill] = useState(0);
  const eraIx = (e: LifeEvent) => { const x = eraOf(eras, e.year); return x ? eras.indexOf(x) : -1; };
  useEffect(() => { setWin([lifeFrom, lifeTo]); }, [lifeFrom, lifeTo]);

  // The moment being read follows the scroll; moments rise in once.
  useEffect(() => {
    const io = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) setCur(Number((x.target as HTMLElement).dataset.ev)); }), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll<HTMLElement>("[data-ev]").forEach((e) => io.observe(e));
    const seen = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("tlc-seen"); seen.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".tlc-in").forEach((e) => seen.observe(e));
    return () => { io.disconnect(); seen.disconnect(); };
  }, [list]);
  useEffect(() => { setCur(0); }, [list.length]);
  // The line fills in down to the moment being read.
  useEffect(() => { const el = document.getElementById(`m-${list[cur]?.slug}`); const box = line.current; if (el && box) setFill(Math.max(0, el.offsetTop + 24)); }, [cur, list]);
  // A shared link (#m-slug) opens that moment.
  useEffect(() => { const h = decodeURIComponent(location.hash.slice(1)); const i = h.startsWith("m-") ? all.findIndex((e) => `m-${e.slug}` === h) : -1; if (i >= 0) setTimeout(() => { go(i, false); setOpen(i); }, 250); }, []); // eslint-disable-line

  const go = useCallback((i: number, smooth = true) => {
    const k = Math.max(0, Math.min(list.length - 1, i)); const el = document.getElementById(`m-${list[k]?.slug}`); if (!el) return;
    setCur(k); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 210, behavior: smooth ? "smooth" : "auto" });
  }, [list]);
  const toTime = useCallback((t: number, smooth = true) => { if (!list.length) return; let best = 0; list.forEach((e, i) => { if (Math.abs(tOf(e) - t) < Math.abs(tOf(list[best]) - t)) best = i; }); go(best, smooth); }, [list, go]);

  // Zoom: the window keeps the current moment in view.
  const width = win[1] - win[0];
  const zoomTo = useCallback((w: number, centre?: number) => {
    const full = lifeTo - lifeFrom; const W = Math.min(full, Math.max(1 / 24, w || full)); const c = centre ?? (list[cur] ? tOf(list[cur]) : (win[0] + win[1]) / 2);
    let a = c - W / 2; a = Math.max(lifeFrom, Math.min(lifeTo - W, a)); setWin([a, a + W]);
  }, [lifeFrom, lifeTo, list, cur, win]);
  useEffect(() => { const t = list[cur] ? tOf(list[cur]) : null; if (t === null) return; if (t < win[0] || t > win[1]) zoomTo(width, t); }, [cur]); // eslint-disable-line
  const pct = (t: number) => ((t - win[0]) / width) * 100;
  const timeAt = (clientX: number) => { const r = ruler.current!.getBoundingClientRect(); return win[0] + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * width; };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest("input,textarea,select,[contenteditable]")) return; if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [cur, go]);
  // Ctrl + wheel (or a trackpad pinch) over the ruler zooms around the pointer; a sideways wheel pans.
  useEffect(() => {
    const el = ruler.current; if (!el) return;
    const w = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); const at = timeAt(e.clientX); zoomTo(width * Math.exp(e.deltaY * 0.01), at); }
      else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); const d = (e.deltaX / el.clientWidth) * width; let a = Math.max(lifeFrom, Math.min(lifeTo - width, win[0] + d)); setWin([a, a + width]); }
    };
    el.addEventListener("wheel", w, { passive: false }); return () => el.removeEventListener("wheel", w);
  }); // eslint-disable-line

  if (!all.length) return <p className="py-20 text-center text-[15px] text-ink-3">The moments of his life are being added.</p>;
  const now = list[Math.min(cur, list.length - 1)] || all[0]; const maxRec = Math.max(1, ...Object.values(recordings));
  // Ticks for the window: decades, years, months or days.
  const ticks: { t: number; label: string; major: boolean }[] = [];
  if (width > 25) { for (let y = Math.ceil(win[0] / 10) * 10; y <= win[1]; y += 10) ticks.push({ t: y, label: String(y), major: true }); for (let y = Math.ceil(win[0]); y <= win[1]; y++) if (y % 10) ticks.push({ t: y, label: "", major: false }); }
  else if (width > 4) { for (let y = Math.ceil(win[0]); y <= win[1]; y++) ticks.push({ t: y, label: width > 12 && y % 2 ? "" : String(y), major: true }); }
  else if (width > 0.4) { for (let m = Math.ceil(win[0] * 12); m <= win[1] * 12; m++) { const y = Math.floor(m / 12), mo = m % 12; ticks.push({ t: m / 12, label: mo === 0 ? String(y) : width < 2.5 ? MON[mo] : "", major: mo === 0 }); } }
  else { for (let d = Math.ceil(win[0] * 365); d <= win[1] * 365; d++) { const t = d / 365; const y = Math.floor(t); const doy = d - y * 365; const mo = Math.min(11, Math.floor(doy / 30.42)); const dd = Math.floor(doy - mo * 30.42) + 1; if (dd === 1 || dd % 5 === 0) ticks.push({ t, label: dd === 1 ? `${MON[mo]} ${y}` : String(dd), major: dd === 1 }); } }
  const zoomName = width >= (lifeTo - lifeFrom) - 0.01 ? "Life" : width > 4 ? "10 years" : width > 0.4 ? "1 year" : "1 month";

  return (
    <div className="bg-[#fcfaf7]">
      <section className="mx-auto max-w-[1180px] px-5 pt-10 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="tl-rise">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-saffron">His life</p>
            <h1 className="mt-1.5 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[34px]">Life timeline</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">Śrī Śrīmad Gour Govinda Swāmī Gurudeva, {Math.floor(tOf(all[0]))}–{Math.floor(tOf(all[all.length - 1]))}: {all.length} moments in {eras.length} chapters.</p>
          </div>
          <div className="inline-flex rounded-full bg-white p-1 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.05)]" role="group" aria-label="View">{([[false, "Simple"], [true, "Advanced"]] as const).map(([v, l]) => <button key={l} onClick={() => onMode(v)} aria-pressed={advanced === v} className={`h-8 rounded-full px-4 transition ${advanced === v ? "bg-ink font-medium text-white" : "text-ink-2 hover:text-ink"}`}>{l}</button>)}</div>
        </div>
      </section>

      {/* The ruler */}
      <div className="sticky top-[52px] z-30 mt-6 border-y border-line/80 bg-white/95 shadow-[0_8px_24px_-20px_rgba(60,30,10,.5)] backdrop-blur sm:top-[58px]">
        <div className="mx-auto max-w-[1180px] px-5 pb-2 pt-2.5 sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous moment" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-ink-2 shadow-[0_1px_3px_rgba(0,0,0,.12)] transition hover:text-ink disabled:opacity-30"><ChevronLeft size={18} /></button>
            <div className="min-w-0 flex-1">
              <div ref={ruler} role="slider" aria-label="Time" aria-valuemin={lifeFrom} aria-valuemax={lifeTo} aria-valuenow={now.year} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "+" || e.key === "=") zoomTo(width / 3); if (e.key === "-") zoomTo(width * 3); }}
                onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDrag(true); toTime(timeAt(e.clientX), false); }}
                onPointerMove={(e) => drag && toTime(timeAt(e.clientX), false)} onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)}
                className="relative h-[52px] cursor-pointer touch-none select-none overflow-hidden outline-none">
                {/* lectures recorded each year, as faint bars */}
                {width > 4 && Object.entries(recordings).map(([y, n]) => +y + 1 >= win[0] && +y <= win[1] && <span key={y} className="absolute bottom-[35px] rounded-t-sm bg-saffron/15" style={{ left: `${pct(+y)}%`, width: `${Math.max(0.4, 100 / width - 0.3)}%`, height: `${Math.max(2, (n / maxRec) * 13)}px` }} title={`${y}: ${n} recordings`} />)}
                {/* the chapters */}
                <div className="absolute inset-x-0 top-[17px] h-[4px] rounded-full bg-[#efe7dc]">
                  {eras.map((e, i) => { const a = Math.max(win[0], e.year_from), b = Math.min(win[1], e.year_to + 1); if (b <= a) return null; return <span key={e.id} title={`${e.title} · ${span(e)}`} className="absolute inset-y-0 rounded-full transition-opacity" style={{ left: `${pct(a)}%`, width: `calc(${pct(b) - pct(a)}% - 2px)`, background: eraC(i), opacity: eraIx(now) === i ? 0.95 : 0.35 }} />; })}
                </div>
                {/* ticks */}
                {ticks.map((t, k) => <span key={k} className="absolute top-[24px] -translate-x-1/2" style={{ left: `${pct(t.t)}%` }}><span className={`mx-auto block w-px ${t.major ? "h-[6px] bg-ink-3/70" : "h-[3px] bg-ink-3/40"}`} />{t.label && <span className="mt-0.5 block whitespace-nowrap text-[10.5px] tabular-nums text-ink-3">{t.label}</span>}</span>)}
                {/* moments */}
                {list.map((e, i) => { const t = tOf(e); if (t < win[0] - 0.01 || t > win[1] + 0.01) return null; return <span key={e.id} className={`absolute top-[14px] -translate-x-1/2 rounded-full ring-2 ring-white transition-all ${i === cur ? "z-10 size-[11px] -mt-[1px]" : "size-[9px]"}`} style={{ left: `${pct(t)}%`, background: i === cur ? "#1f1a14" : kindOf(e.kind)[2], opacity: i === cur ? 1 : 0.8 }} />; })}
                {/* now */}
                <span className="pointer-events-none absolute top-[4px] h-[26px] w-[2px] -translate-x-1/2 rounded bg-ink transition-[left] duration-300 ease-out" style={{ left: `${pct(tOf(now))}%` }} />
              </div>
              {/* overview of the whole life, with the window */}
              {zoomName !== "Life" && <div className="relative mt-0.5 h-[3px] rounded-full bg-[#efe7dc]" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); zoomTo(width, lifeFrom + ((e.clientX - r.left) / r.width) * (lifeTo - lifeFrom)); }}>
                <span className="absolute inset-y-[-1px] rounded-full bg-saffron/70 transition-all" style={{ left: `${((win[0] - lifeFrom) / (lifeTo - lifeFrom)) * 100}%`, width: `${Math.max(1, (width / (lifeTo - lifeFrom)) * 100)}%` }} /></div>}
            </div>
            <div className="w-[120px] shrink-0 text-right max-sm:w-[58px]">
              <p className="text-[21px] font-semibold leading-none tabular-nums text-ink">{now.year}</p>
              <p className="mt-1 truncate text-[11.5px] text-ink-3 max-sm:hidden">{when(now) !== String(now.year) ? when(now) : eras[eraIx(now)]?.title || ""}</p>
            </div>
            <button onClick={() => go(cur + 1)} disabled={cur === list.length - 1} aria-label="Next moment" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-ink-2 shadow-[0_1px_3px_rgba(0,0,0,.12)] transition hover:text-ink disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
          {/* zoom */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px]">
            <span className="mr-1 text-ink-3 max-sm:hidden">Zoom</span>
            <button onClick={() => zoomTo(width * 3)} aria-label="Zoom out" className="rounded-full p-1 text-ink-2 hover:bg-band"><ZoomOut size={15} /></button>
            <div className="inline-flex rounded-full bg-band/80 p-0.5">{ZOOMS.map(([l, w]) => <button key={l} onClick={() => zoomTo(w)} aria-pressed={zoomName === l} className={`rounded-full px-2.5 py-0.5 transition ${zoomName === l ? "bg-white font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}>{l}</button>)}</div>
            <button onClick={() => zoomTo(width / 3)} aria-label="Zoom in" className="rounded-full p-1 text-ink-2 hover:bg-band"><ZoomIn size={15} /></button>
            <span className="ml-auto text-ink-3 max-md:hidden">Ctrl + scroll on the ruler to zoom · ← → to step</span>
          </div>
        </div>
      </div>

      <div className={advanced ? "mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[264px_minmax(0,1fr)]" : ""}>
      {advanced && <aside className="space-y-4 pt-8 lg:sticky lg:top-[170px] lg:max-h-[calc(100dvh-190px)] lg:self-start lg:overflow-y-auto lg:pb-8 [scrollbar-width:thin]">
        <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-3.5 shadow-[0_1px_3px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.05)] focus-within:shadow-[0_0_0_2px_rgba(181,101,29,.35)]"><Search size={15} className="text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search his life" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" />{q && <button onClick={() => setQ("")} aria-label="Clear"><X size={14} className="text-ink-3" /></button>}</label>
        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]">
          <p className="mb-1 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Chapters</p>
          <ul>{eras.map((e, i) => { const n = all.filter((x) => eraIx(x) === i).length; const on = eraIx(now) === i; return <li key={e.id}><button onClick={() => toTime(e.year_from)} className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-[13.5px] transition hover:bg-[#f7f2ea] ${on ? "bg-[#f7f2ea] font-medium text-ink" : "text-ink-2"}`}><span className="flex size-5 shrink-0 items-center justify-center rounded-md text-[10.5px] font-semibold text-white" style={{ background: eraC(i) }}>{i + 1}</span><span className="min-w-0 flex-1"><span className="block truncate">{e.title}</span><span className="block text-[11px] tabular-nums text-ink-3">{span(e)} · {n} {n === 1 ? "moment" : "moments"}</span></span></button></li>; })}</ul>
        </div>
        {usedKinds.length > 1 && <div className="rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]">
          <p className="mb-2 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Kind of moment</p>
          <div className="flex flex-wrap gap-1.5 px-1">{usedKinds.map(([k, l, c]) => { const on = kinds.includes(k); return <button key={k} onClick={() => setKinds((s) => (on ? s.filter((x) => x !== k) : [...s, k]))} aria-pressed={on} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] transition" style={on ? { background: c, color: "#fff" } : { background: `color-mix(in srgb, ${c} 10%, white)`, color: c }}><span className="size-1.5 rounded-full" style={{ background: on ? "#fff" : c }} />{l}</button>; })}</div>
        </div>}
        {places.length > 1 && <div className="rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]">
          <p className="mb-2 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">Place</p>
          <select value={place} onChange={(e) => setPlace(e.target.value)} className="h-9 w-full rounded-lg bg-[#f7f2ea] px-2.5 text-[13.5px] outline-none"><option value="">Every place</option>{places.map(([p, n]) => <option key={p} value={p}>{p} ({n})</option>)}</select>
        </div>}
        {filtered && <button onClick={() => { setQ(""); setKinds([]); setPlace(""); }} className="px-1 text-[13px] text-ink-2 underline underline-offset-2 hover:text-ink">Show every moment</button>}
      </aside>}
      <div>
      {advanced && <p className="pt-8 text-[13px] text-ink-3">{filtered ? `${list.length} of ${all.length} moments` : `${all.length} moments`}</p>}
      {!list.length && <p className="py-16 text-center text-[14px] text-ink-3">Nothing matches. Try another word, or show every moment.</p>}

      {/* The line */}
      <div ref={line} className={`relative pb-24 ${advanced ? "pt-4" : "mx-auto max-w-[1180px] px-5 pt-10 sm:px-8"}`}>
        <span aria-hidden className={`absolute bottom-0 top-0 w-[2px] rounded bg-[#e9dfd1] ${advanced ? "left-[7px] sm:left-[11px]" : "left-[27px] sm:left-[39px] lg:left-1/2 lg:-translate-x-1/2"}`} />
        <span aria-hidden className={`absolute top-0 w-[2px] rounded bg-gradient-to-b from-[#e7b67c] to-saffron transition-[height] duration-700 ease-out ${advanced ? "left-[7px] sm:left-[11px]" : "left-[27px] sm:left-[39px] lg:left-1/2 lg:-translate-x-1/2"}`} style={{ height: fill }} />
        {list.map((e, i) => {
          const prev = list[i - 1]; const newYear = !prev || prev.year !== e.year; const ei = eraIx(e); const newEra = ei >= 0 && (!prev || eraIx(prev) !== ei);
          const k = kindOf(e.kind); const right = advanced || i % 2 === 1; const era = eras[ei]; const on = i === cur;
          return (
            <div key={e.id}>
              {newEra && era && (
                <div className={`tlc-in relative z-10 mb-6 ${i === 0 ? "mt-0" : "mt-14"} ${advanced ? "ml-[28px] sm:ml-[36px]" : "ml-[44px] sm:ml-[64px] lg:mx-auto lg:max-w-[520px] lg:text-center"}`}>
                  <div className="inline-block rounded-2xl bg-white px-5 py-4 text-left shadow-[0_10px_30px_-20px_rgba(60,30,10,.45),0_0_0_1px_rgba(0,0,0,.04)] lg:text-inherit">
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] lg:justify-[inherit]" style={{ color: eraC(ei) }}><span className="h-[3px] w-5 rounded-full" style={{ background: eraC(ei) }} />Chapter {ei + 1} · <span className="tabular-nums">{span(era)}</span></p>
                    <h2 className="mt-1.5 text-[21px] font-semibold leading-snug tracking-[-0.01em] text-ink">{era.title}</h2>
                    {era.summary && <p className="mt-1 text-[14px] leading-relaxed text-ink-3">{era.summary}</p>}
                  </div>
                </div>)}
              {newYear && <div className={`relative z-10 mb-3 mt-6 flex items-center ${advanced ? "" : "lg:justify-center"}`}><span className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold tabular-nums tracking-wide text-ink shadow-[0_1px_3px_rgba(0,0,0,.1),0_0_0_1px_rgba(0,0,0,.05)]">{e.year}</span></div>}
              <article id={`m-${e.slug}`} data-ev={i} className={`tlc-in relative mb-5 ${advanced ? "pl-[28px] sm:pl-[36px]" : "pl-[44px] sm:pl-[64px] lg:grid lg:grid-cols-2 lg:gap-14 lg:pl-0"}`}>
                <span aria-hidden className={`absolute top-6 z-10 -translate-x-1/2 rounded-full ring-4 ring-[#fcfaf7] transition-all duration-300 ${advanced ? "left-[8px] sm:left-[12px]" : "left-[28px] sm:left-[40px] lg:left-1/2"} ${on ? "tl-pulse size-[13px]" : "size-[10px]"}`} style={{ background: k[2] }} />
                <div className={right ? "lg:col-start-2" : "lg:col-start-1"}>
                  <div role="button" tabIndex={0} onClick={() => { setCur(i); setOpen(i); }} onKeyDown={(ev) => ev.key === "Enter" && setOpen(i)}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-4 outline-none transition duration-300 sm:p-5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-saffron/40 ${on ? "shadow-[0_16px_40px_-22px_rgba(60,30,10,.55),0_0_0_1px_rgba(181,101,29,.25)]" : "shadow-[0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)] hover:shadow-[0_14px_34px_-22px_rgba(60,30,10,.5),0_0_0_1px_rgba(0,0,0,.05)]"}`}>
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: k[2], opacity: on ? 0.9 : 0.45 }} />
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] tabular-nums text-ink-3">{when(e)}<span className="rounded-full px-2 py-[1px] text-[11.5px] font-medium" style={{ background: `color-mix(in srgb, ${k[2]} 10%, white)`, color: k[2] }}>{k[1]}</span></p>
                    <h3 className={`mt-1.5 leading-snug text-ink ${e.importance === 1 ? "text-[17.5px] font-semibold" : "text-[15.5px] font-medium"}`}>{e.title}</h3>
                    {e.summary && e.importance !== 3 && <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{e.summary}</p>}
                    {(e.place || e.people.length > 0) && <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-3">
                      {e.place && <span className="flex items-center gap-1"><MapPin size={13} />{[e.place, e.country].filter(Boolean).join(", ")}</span>}
                      {e.people.length > 0 && <span className="flex items-center gap-1"><Users size={13} />{e.people.join(", ")}</span>}</p>}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.image && <img src={e.image} alt={e.image_caption || ""} loading="lazy" className="mt-3 h-auto max-h-[240px] w-auto max-w-full rounded-xl" />}
                    {(e.body || e.links.length > 0 || e.source || e.image) && <p className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-saffron">Read more<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></p>}
                  </div>
                </div>
              </article>
            </div>);
        })}
        {list.length > 0 && <div className={`relative z-10 mt-8 flex ${advanced ? "" : "lg:justify-center"}`}><span className="rounded-full bg-ink px-3.5 py-1 text-[13px] font-semibold tabular-nums text-white">{Math.floor(tOf(list[list.length - 1]))}</span></div>}
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
