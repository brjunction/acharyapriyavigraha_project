"use client";
/* The PDF reader (magazine issues). Opens big files quickly: the PDF is fetched in ranges and only the pages in view are
   drawn. Scroll down through the issue, or turn page by page (one page, or two side by side with the cover alone);
   fit width or whole page, zoom (buttons, Ctrl+wheel, pinch); pages and contents panel; search with highlights;
   light, sepia and night colours; full screen; download; remembers the page. Keys: ← → PageUp/Down, + −, Home/End, / F. */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, PanelLeft, Maximize, Minimize, Download, X, Moon, Sun, Columns2, Square, Rows3, Loader2 } from "lucide-react";
import { pdfjs } from "@/lib/fetcher";

type Mode = "scroll" | "page" | "spread";
type Fit = "width" | "page" | "custom";
type Tone = "light" | "sepia" | "night";
type Size = { w: number; h: number };
const PREF = "tj_pdf_pref";

export function PdfReader({ src, title, sub, back, download, storeKey }: { src: string; title: string; sub?: string; back: { href: string; label: string }; download?: string | null; storeKey: string }) {
  const [doc, setDoc] = useState<any>(null); const [err, setErr] = useState(""); const [loadPct, setLoadPct] = useState(0);
  const [sizes, setSizes] = useState<Size[]>([]); const [n, setN] = useState(0);
  const [page, setPage] = useState(1); const [mode, setMode] = useState<Mode>("scroll"); const [fit, setFit] = useState<Fit>("width"); const [zoom, setZoom] = useState(1);
  const [tone, setTone] = useState<Tone>("light"); const [side, setSide] = useState<null | "pages" | "contents" | "search">(null); const [full, setFull] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 }); const [outline, setOutline] = useState<{ title: string; page: number; depth: number }[]>([]);
  const [q, setQ] = useState(""); const [hits, setHits] = useState<{ page: number; text: string }[] | null>(null); const [searching, setSearching] = useState(false);
  const area = useRef<HTMLDivElement>(null); const texts = useRef<Map<number, string>>(new Map()); const [hl, setHl] = useState("");

  // Open the document (ranges: only the parts needed are fetched).
  useEffect(() => {
    let dead = false; let task: any;
    try { const p = JSON.parse(localStorage.getItem(PREF) || "{}"); if (p.mode) setMode(p.mode); if (p.tone) setTone(p.tone); if (p.fit) setFit(p.fit); } catch {}
    (async () => {
      try {
        const lib = await pdfjs(); task = lib.getDocument({ url: src, rangeChunkSize: 262144, disableAutoFetch: true, disableStream: false, isEvalSupported: false });
        task.onProgress = (p: { loaded: number; total: number }) => p.total && setLoadPct(Math.round((p.loaded / p.total) * 100));
        const d = await task.promise; if (dead) return; setDoc(d); setN(d.numPages);
        const first = await d.getPage(1); const v = first.getViewport({ scale: 1 }); setSizes(Array.from({ length: d.numPages }, () => ({ w: v.width, h: v.height })));
        // Real sizes of every page, gently in the background.
        (async () => { const s: Size[] = []; for (let i = 1; i <= d.numPages; i++) { if (dead) return; const pg = await d.getPage(i); const vv = pg.getViewport({ scale: 1 }); s.push({ w: vv.width, h: vv.height }); if (i % 20 === 0 || i === d.numPages) setSizes((o) => s.concat(o.slice(s.length))); } })();
        try { const o = await d.getOutline(); const flat: { title: string; page: number; depth: number }[] = []; const walk = async (items: any[], depth: number) => { for (const it of items || []) { let pg = 0; try { const dest = typeof it.dest === "string" ? await d.getDestination(it.dest) : it.dest; if (dest) pg = (await d.getPageIndex(dest[0])) + 1; } catch {} flat.push({ title: it.title, page: pg, depth }); await walk(it.items, depth + 1); } }; await walk(o || [], 0); if (!dead) setOutline(flat); } catch {}
        let start = 1; try { start = Number(localStorage.getItem(`tj_pdf_${storeKey}`)) || 1; } catch {} if (start > 1 && start <= d.numPages) setTimeout(() => goTo(start, false), 60);
      } catch (e: any) { if (!dead) setErr(e?.message || "This PDF could not be opened."); }
    })();
    return () => { dead = true; try { task?.destroy(); } catch {} };
  }, [src]); // eslint-disable-line
  const savePref = (p: object) => { try { localStorage.setItem(PREF, JSON.stringify({ mode, tone, fit, ...p })); } catch {} };
  useEffect(() => { try { localStorage.setItem(`tj_pdf_${storeKey}`, String(page)); } catch {} }, [page, storeKey]);

  useEffect(() => { const el = area.current; if (!el) return; const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect(); }, [doc]);
  const two = mode === "spread";
  // The scale of a page: fit to width, fit whole page, or a chosen zoom.
  const base = sizes[0] || { w: 600, h: 800 };
  const fitW = (box.w - (two ? 56 : 32)) / (two ? 2 * base.w : base.w); const fitP = Math.min(fitW, (box.h - 24) / base.h);
  const scale = Math.max(0.25, Math.min(6, fit === "width" ? Math.min(fitW, 1.55) : fit === "page" ? fitP : zoom));
  const zoomBy = (f: number) => { setZoom(Math.max(0.25, Math.min(6, scale * f))); setFit("custom"); };

  // Pages to show: all (scroll) or the current one / spread.
  const spreadOf = (p: number) => (p <= 1 ? [1] : p % 2 === 0 ? [p, p + 1].filter((x) => x <= n) : [p - 1, p]);
  const shown = mode === "scroll" ? Array.from({ length: n }, (_, i) => i + 1) : mode === "page" ? [page] : spreadOf(page);
  const goTo = useCallback((p: number, smooth = true) => {
    const k = Math.max(1, Math.min(n || 1, p)); setPage(k);
    if (mode === "scroll") { const el = document.getElementById(`pdfp-${k}`); el?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }); }
    else area.current?.scrollTo({ top: 0 });
  }, [n, mode]);
  const step = (d: number) => { if (mode === "spread") { const cur = spreadOf(page); goTo(d > 0 ? cur[cur.length - 1] + 1 : Math.max(1, cur[0] - 1 - (cur[0] - 1 > 1 && (cur[0] - 1) % 2 === 1 ? 1 : 0))); } else if (mode === "page") goTo(page + d); else goTo(page + d); };

  // In scroll mode, the page in view.
  useEffect(() => {
    if (mode !== "scroll" || !area.current) return;
    const io = new IntersectionObserver((xs) => { let best: { p: number; r: number } | null = null; xs.forEach((x) => { if (x.isIntersecting && (!best || x.intersectionRatio > best.r)) best = { p: Number((x.target as HTMLElement).dataset.p), r: x.intersectionRatio }; }); if (best) setPage((best as any).p); }, { root: area.current, threshold: [0.25, 0.5, 0.75] });
    area.current.querySelectorAll("[data-p]").forEach((e) => io.observe(e)); return () => io.disconnect();
  }, [mode, n, scale]);

  // Keys, Ctrl+wheel zoom, swipe in page modes, pinch.
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest("input,textarea")) { if (e.key === "Escape") setSide(null); return; }
      if (["ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && mode !== "scroll")) { e.preventDefault(); step(1); } else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
      else if (e.key === "+" || e.key === "=") zoomBy(1.15); else if (e.key === "-") zoomBy(1 / 1.15); else if (e.key === "Home") goTo(1); else if (e.key === "End") goTo(n);
      else if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); e.stopImmediatePropagation(); setSide("search"); } else if (e.key === "f") fs(); else if (e.key === "Escape") setSide(null); };
    const w = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08); } };
    window.addEventListener("keydown", k, true); const a = area.current; a?.addEventListener("wheel", w, { passive: false });
    return () => { window.removeEventListener("keydown", k, true); a?.removeEventListener("wheel", w); };
  });
  const touch = useRef<{ x: number; y: number; d: number; s: number } | null>(null); const [pinch, setPinch] = useState(1);
  const onTS = (e: React.TouchEvent) => { if (e.touches.length === 2) { const [a, b] = [e.touches[0], e.touches[1]]; touch.current = { x: 0, y: 0, d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: scale }; } else touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, d: 0, s: scale }; };
  const onTM = (e: React.TouchEvent) => { const t = touch.current; if (t?.d && e.touches.length === 2) { const [a, b] = [e.touches[0], e.touches[1]]; setPinch(Math.max(0.4, Math.min(4, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / t.d))); } };
  const onTE = (e: React.TouchEvent) => { const t = touch.current; touch.current = null; if (!t) return; if (t.d) { if (Math.abs(pinch - 1) > 0.04) { setZoom(Math.max(0.25, Math.min(6, t.s * pinch))); setFit("custom"); } setPinch(1); return; }
    if (mode === "scroll") return; const c = e.changedTouches[0]; const dx = c.clientX - t.x, dy = c.clientY - t.y; const el = area.current; const zoomedIn = el && el.scrollWidth > el.clientWidth + 4;
    if (!zoomedIn && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1); };

  const fs = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch {} };
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);

  // Search: the text of each page is read once, then kept.
  const textOf = useCallback(async (p: number) => { if (texts.current.has(p)) return texts.current.get(p)!; const pg = await doc.getPage(p); const tc = await pg.getTextContent(); const t = tc.items.map((x: any) => x.str + (x.hasEOL ? "\n" : "")).join(""); texts.current.set(p, t); return t; }, [doc]);
  const fold = (t: string) => t.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  useEffect(() => {
    const w = fold(q.trim()); if (!doc || w.length < 2) { setHits(null); return; } let dead = false; setSearching(true);
    const h = setTimeout(async () => { const out: { page: number; text: string }[] = []; for (let p = 1; p <= n && !dead; p++) { const t = await textOf(p); const f = fold(t); let k = f.indexOf(w); let c = 0; while (k >= 0 && c < 3 && out.length < 300) { out.push({ page: p, text: t.slice(Math.max(0, k - 45), k + w.length + 60).replace(/\s+/g, " ") }); k = f.indexOf(w, k + w.length); c++; } if (p % 8 === 0 && !dead) setHits([...out]); } if (!dead) { setHits(out); setSearching(false); } }, 250);
    return () => { dead = true; clearTimeout(h); };
  }, [q, doc, n, textOf]);

  const C = tone === "night" ? { bg: "#141414", bar: "#1d1d1d", ink: "#e8e3db", muted: "#9a948a", line: "#2c2c2c", filter: "invert(0.9) hue-rotate(180deg) contrast(0.9)" } : tone === "sepia" ? { bg: "#e9e0cf", bar: "#f3ecdf", ink: "#3a2d1e", muted: "#8b7a60", line: "#d6c7aa", filter: "sepia(0.35) contrast(0.96)" } : { bg: "#ecebe8", bar: "#ffffff", ink: "#1d1a16", muted: "#7a746c", line: "#dedbd6", filter: "none" };
  const ib = "flex size-9 items-center justify-center rounded-full transition hover:bg-black/[0.07] disabled:opacity-30";

  if (err) return <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-[#ecebe8] p-6 text-center"><p className="text-[15px] text-ink">This issue’s PDF could not be opened.</p><p className="max-w-md text-[13px] text-ink-3">{err}</p><div className="flex gap-2">{download && <a href={download} className="rounded-md bg-ink px-4 py-2 text-[13px] text-white">Open the file directly</a>}<Link href={back.href} className="rounded-md border border-line px-4 py-2 text-[13px]">{back.label}</Link></div></div>;
  return (
    <div className="fixed inset-0 z-[90] flex flex-col" style={{ background: C.bg, color: C.ink }}>
      {/* bar */}
      <div className="z-20 flex h-12 shrink-0 items-center gap-1 border-b px-2 sm:px-3" style={{ background: C.bar, borderColor: C.line }}>
        <Link href={back.href} className={ib} aria-label={back.label} title={back.label}><ArrowLeft size={18} /></Link>
        <button className={ib} onClick={() => setSide(side ? null : "pages")} aria-label="Pages and contents" title="Pages and contents"><PanelLeft size={18} /></button>
        <div className="min-w-0 flex-1 px-1"><p className="truncate text-[13.5px] font-medium">{title}</p>{sub && <p className="truncate text-[11px]" style={{ color: C.muted }}>{sub}</p>}</div>
        <div className="flex items-center gap-0.5 max-md:hidden">
          <button className={ib} onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out"><ZoomOut size={17} /></button>
          <select value={fit === "custom" ? "custom" : fit} onChange={(e) => { const v = e.target.value as Fit; setFit(v); savePref({ fit: v }); }} className="h-8 rounded-md bg-transparent px-1 text-[12.5px] outline-none" style={{ color: C.ink }} aria-label="Zoom">
            <option value="width">Fit width</option><option value="page">Whole page</option><option value="custom">{Math.round(scale * 100)}%</option></select>
          <button className={ib} onClick={() => zoomBy(1.2)} aria-label="Zoom in"><ZoomIn size={17} /></button>
          <span className="mx-1 h-5 w-px" style={{ background: C.line }} />
          {([["scroll", Rows3, "Scroll"], ["page", Square, "One page"], ["spread", Columns2, "Two pages"]] as const).map(([k, I, l]) => <button key={k} className={ib} onClick={() => { setMode(k); savePref({ mode: k }); setTimeout(() => goTo(page, false), 30); }} aria-pressed={mode === k} title={l} aria-label={l} style={mode === k ? { background: "rgba(127,110,90,.16)" } : undefined}><I size={16} /></button>)}
          <span className="mx-1 h-5 w-px" style={{ background: C.line }} />
        </div>
        <button className={ib} onClick={() => { const t: Tone = tone === "light" ? "sepia" : tone === "sepia" ? "night" : "light"; setTone(t); savePref({ tone: t }); }} aria-label="Colours" title={`Colours: ${tone}`}>{tone === "night" ? <Moon size={17} /> : <Sun size={17} />}</button>
        <button className={ib} onClick={() => setSide(side === "search" ? null : "search")} aria-label="Search" title="Search (/)"><Search size={17} /></button>
        {download && <a href={download} download className={`${ib} max-sm:hidden`} aria-label="Download" title="Download the PDF"><Download size={17} /></a>}
        <button className={`${ib} max-sm:hidden`} onClick={fs} aria-label="Full screen" title="Full screen (F)">{full ? <Minimize size={17} /> : <Maximize size={17} />}</button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* side panel */}
        {side && <aside className="absolute inset-y-0 left-0 z-30 flex w-[280px] max-w-[85vw] flex-col border-r shadow-xl md:static md:shadow-none" style={{ background: C.bar, borderColor: C.line }}>
          <div className="flex items-center gap-1 border-b px-2 pt-2" style={{ borderColor: C.line }}>
            {([["pages", "Pages"], ...(outline.length ? [["contents", "Contents"]] : []), ["search", "Search"]] as [string, string][]).map(([k, l]) => <button key={k} onClick={() => setSide(k as any)} className="relative px-2.5 pb-2 pt-1 text-[12.5px] font-medium" style={{ color: side === k ? C.ink : C.muted }}>{l}{side === k && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded bg-[#b5651d]" />}</button>)}
            <button onClick={() => setSide(null)} className="ml-auto mb-1.5 rounded-full p-1" style={{ color: C.muted }} aria-label="Close"><X size={15} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {side === "pages" && doc && <Thumbs doc={doc} n={n} page={page} go={(p) => { goTo(p); if (window.innerWidth < 768) setSide(null); }} C={C} />}
            {side === "contents" && <ul>{outline.map((o, i) => <li key={i}><button disabled={!o.page} onClick={() => { goTo(o.page); if (window.innerWidth < 768) setSide(null); }} className="flex w-full items-baseline gap-2 rounded-md py-1.5 pr-2 text-left text-[13px] hover:bg-black/[0.05]" style={{ paddingLeft: 8 + o.depth * 14 }}><span className="min-w-0 flex-1">{o.title}</span><span className="text-[11px] tabular-nums" style={{ color: C.muted }}>{o.page || ""}</span></button></li>)}</ul>}
            {side === "search" && <div>
              <label className="flex h-9 items-center gap-2 rounded-lg px-2.5" style={{ background: C.bg }}><Search size={14} style={{ color: C.muted }} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this issue" className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none" /></label>
              {hits && <p className="px-1 py-2 text-[11.5px]" style={{ color: C.muted }}>{searching ? "Searching… " : ""}{hits.length} {hits.length === 1 ? "place" : "places"}</p>}
              <ul>{(hits || []).map((h, i) => <li key={i}><button onClick={() => { goTo(h.page); setHl(q.trim()); }} className="w-full rounded-md px-2 py-1.5 text-left text-[12.5px] leading-snug hover:bg-black/[0.05]"><span className="block text-[11px]" style={{ color: C.muted }}>Page {h.page}</span>{h.text}</button></li>)}</ul>
            </div>}
          </div>
        </aside>}

        {/* pages */}
        <div ref={area} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} className="relative min-w-0 flex-1 overflow-auto overscroll-contain" style={{ touchAction: "pan-x pan-y" }}>
          {!doc && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[13px]" style={{ color: C.muted }}><Loader2 className="animate-spin" size={20} />Opening the issue… {loadPct ? `${loadPct}%` : ""}</div>}
          {doc && <div className={`flex min-w-fit flex-col items-center py-3 ${mode === "spread" ? "" : "gap-3"}`} style={{ transform: pinch !== 1 ? `scale(${pinch})` : undefined, transformOrigin: "center top" }}>
            {mode === "spread" ? <div className="flex items-start gap-1">{shown.map((p) => <PageView key={p} doc={doc} p={p} size={sizes[p - 1] || base} scale={scale} filter={C.filter} hl={hl} eager />)}</div>
              : shown.map((p) => <PageView key={p} doc={doc} p={p} size={sizes[p - 1] || base} scale={scale} filter={C.filter} hl={hl} eager={mode !== "scroll"} />)}
          </div>}
          {doc && mode !== "scroll" && <>
            <button onClick={() => step(-1)} disabled={page <= 1} aria-label="Previous page" className="absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/[0.06] backdrop-blur hover:bg-black/[0.12] disabled:opacity-0 md:flex"><ChevronLeft size={20} /></button>
            <button onClick={() => step(1)} disabled={shown[shown.length - 1] >= n} aria-label="Next page" className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/[0.06] backdrop-blur hover:bg-black/[0.12] disabled:opacity-0 md:flex"><ChevronRight size={20} /></button>
          </>}
        </div>
      </div>

      {/* bottom: page number and quick controls */}
      {doc && <div className="z-20 flex h-11 shrink-0 items-center gap-2 border-t px-3 text-[12.5px]" style={{ background: C.bar, borderColor: C.line }}>
        <button className={ib} onClick={() => step(-1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={17} /></button>
        <span className="flex items-center gap-1.5 tabular-nums">Page <input key={page} defaultValue={page} onKeyDown={(e) => { if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value) || 1); }} className="h-7 w-12 rounded-md text-center outline-none" style={{ background: C.bg }} aria-label="Go to page" /> of {n}</span>
        <button className={ib} onClick={() => step(1)} disabled={page >= n} aria-label="Next page"><ChevronRight size={17} /></button>
        <div className="mx-2 hidden h-1 flex-1 cursor-pointer rounded-full sm:block" style={{ background: C.line }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); goTo(Math.round(((e.clientX - r.left) / r.width) * (n - 1)) + 1); }}><span className="block h-1 rounded-full bg-[#b5651d]" style={{ width: `${(page / Math.max(1, n)) * 100}%` }} /></div>
        <span className="ml-auto flex items-center gap-0.5 md:hidden">
          <button className={ib} onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out"><ZoomOut size={16} /></button><button className={ib} onClick={() => zoomBy(1.2)} aria-label="Zoom in"><ZoomIn size={16} /></button>
          <button className={ib} onClick={() => { const m: Mode = mode === "scroll" ? "page" : "scroll"; setMode(m); savePref({ mode: m }); setTimeout(() => goTo(page, false), 30); }} aria-label={mode === "scroll" ? "Turn page by page" : "Scroll"}>{mode === "scroll" ? <Square size={16} /> : <Rows3 size={16} />}</button>
        </span>
      </div>}
    </div>);
}

/** One page: drawn only when near the screen (scroll mode), sharp on high-density screens, with a text layer for
    selecting and for showing search matches. */
function PageView({ doc, p, size, scale, filter, eager, hl: mark }: { doc: any; p: number; size: Size; scale: number; filter: string; eager?: boolean; hl: string }) {
  const host = useRef<HTMLDivElement>(null); const canvas = useRef<HTMLCanvasElement>(null); const tl = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!!eager); const [drawn, setDrawn] = useState(false);
  const w = Math.floor(size.w * scale), h = Math.floor(size.h * scale);
  useEffect(() => { if (eager) { setNear(true); return; } const el = host.current; if (!el) return; const io = new IntersectionObserver(([x]) => setNear(x.isIntersecting), { rootMargin: "120% 0px" }); io.observe(el); return () => io.disconnect(); }, [eager]);
  useEffect(() => {
    if (!near) return; let dead = false; let task: any; let tlTask: any;
    (async () => {
      const pg = await doc.getPage(p); if (dead) return; const v = pg.getViewport({ scale }); const dpr = Math.min(2, window.devicePixelRatio || 1);
      const c = canvas.current!; c.width = Math.floor(v.width * dpr); c.height = Math.floor(v.height * dpr); c.style.width = `${Math.floor(v.width)}px`; c.style.height = `${Math.floor(v.height)}px`;
      task = pg.render({ canvasContext: c.getContext("2d", { alpha: false }), viewport: v, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
      try { await task.promise; } catch { return; } if (dead) return; setDrawn(true);
      try { const lib = await pdfjs(); const box = tl.current!; box.replaceChildren(); box.style.setProperty("--scale-factor", String(scale)); tlTask = new lib.TextLayer({ textContentSource: pg.streamTextContent(), container: box, viewport: v }); await tlTask.render(); if (mark) markIn(box, mark); } catch {}
    })();
    return () => { dead = true; try { task?.cancel(); } catch {} try { tlTask?.cancel(); } catch {} };
  }, [near, doc, p, scale]); // eslint-disable-line
  useEffect(() => { if (tl.current) markIn(tl.current, mark); }, [mark]);
  return (
    <div ref={host} id={`pdfp-${p}`} data-p={p} className="relative shrink-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,.18),0_8px_24px_-12px_rgba(0,0,0,.25)]" style={{ width: w, height: h, filter }}>
      <canvas ref={canvas} className={`block transition-opacity duration-200 ${drawn ? "opacity-100" : "opacity-0"}`} aria-label={`Page ${p}`} />
      <div ref={tl} className="textLayer absolute inset-0" />
      {!drawn && near && <span className="absolute inset-0 flex items-center justify-center text-[12px] text-zinc-400">{p}</span>}
    </div>);
}
function markIn(box: HTMLElement, q: string) {
  const f = (t: string) => t.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase(); const w = f(q || "");
  box.querySelectorAll("span").forEach((s) => s.classList.toggle("pdf-hit", w.length >= 2 && f(s.textContent || "").includes(w)));
}

/** Small pictures of the pages, drawn as they come into view. */
function Thumbs({ doc, n, page, go, C }: { doc: any; n: number; page: number; go: (p: number) => void; C: { muted: string; line: string } }) {
  const cur = useRef<HTMLButtonElement>(null); useEffect(() => { cur.current?.scrollIntoView({ block: "nearest" }); }, [page]);
  return <div className="grid grid-cols-2 gap-2">{Array.from({ length: n }, (_, i) => i + 1).map((p) => <button key={p} ref={p === page ? cur : undefined} onClick={() => go(p)} className="flex flex-col items-center gap-1 rounded-md p-1 transition hover:bg-black/[0.05]" style={p === page ? { boxShadow: "inset 0 0 0 2px #b5651d" } : undefined}><Thumb doc={doc} p={p} /><span className="text-[11px] tabular-nums" style={{ color: C.muted }}>{p}</span></button>)}</div>;
}
function Thumb({ doc, p }: { doc: any; p: number }) {
  const c = useRef<HTMLCanvasElement>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = c.current; if (!el) return; const io = new IntersectionObserver(([x]) => x.isIntersecting && setOn(true), { rootMargin: "200px" }); io.observe(el); return () => io.disconnect(); }, []);
  useEffect(() => { if (!on) return; let dead = false; (async () => { const pg = await doc.getPage(p); const v0 = pg.getViewport({ scale: 1 }); const v = pg.getViewport({ scale: 110 / v0.width }); const el = c.current; if (!el || dead) return; el.width = v.width * 1.5; el.height = v.height * 1.5; await pg.render({ canvasContext: el.getContext("2d"), viewport: v, transform: [1.5, 0, 0, 1.5, 0, 0] }).promise.catch(() => {}); })(); return () => { dead = true; }; }, [on, doc, p]);
  return <canvas ref={c} className="w-[110px] bg-white shadow-sm" style={{ aspectRatio: "3 / 4" }} />;
}
