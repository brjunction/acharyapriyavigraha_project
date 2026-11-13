"use client";
/* Pāṭha — the book reader. The whole book, laid out in pages like a printed book: one page, or two side by side on wide
   screens. Swipe or tap the sides on a phone; arrow keys, the wheel or a click on a computer. Contents, search,
   bookmarks, and a full set of reading settings (fonts, size, weight, spacing, margins, alignment, hyphenation, themes,
   light and warmth, page-turn style, tap zones, status line). Position, settings and bookmarks stay on this device.
   Only the current chapter is laid out at a time, so even very long books open and turn instantly. */
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { setReaderKind } from "@/lib/reader-pref";
import { AllBooks } from "./reader";
import { Home, Library, ArrowLeft, List, Search, Bookmark, BookmarkCheck, Settings2, Maximize, Minimize, X, ChevronLeft, ChevronRight, Trash2, RotateCcw, ExternalLink } from "lucide-react";

type Chapter = { id: string; title: string; num: string; depth: number; href: string; words: number };
type Book = { slug: string; title: string; author?: string | null; cover?: string | null; language?: string | null };
type S = {
  theme: string; font: string; size: number; weight: number; lead: number; para: number; indent: number; justify: boolean; hyphen: boolean;
  margin: number; letter: number; word: number; spread: "auto" | "one" | "two"; anim: "slide" | "fade" | "none"; taps: "sides" | "forward";
  status: boolean; showPct: boolean; showTime: boolean; dim: number; warm: number; width: number; dock: boolean;
};
const DEF: S = { theme: "paper", font: "literata", size: 19, weight: 400, lead: 1.6, para: 0.5, indent: 0, justify: true, hyphen: true, margin: 7, letter: 0, word: 0, spread: "one", anim: "slide", taps: "sides", status: true, showPct: true, showTime: true, dim: 0, warm: 0, width: 0, dock: true };

const THEMES: Record<string, { name: string; bg: string; ink: string; muted: string; line: string; ui: string }> = {
  day: { name: "Day", bg: "#ffffff", ink: "#1d1a16", muted: "#8a8178", line: "#e6e1da", ui: "#f6f4f1" },
  paper: { name: "Paper", bg: "#f7f1e6", ink: "#2e261d", muted: "#8d7f6c", line: "#e4d9c6", ui: "#efe6d5" },
  sepia: { name: "Sepia", bg: "#eadfc8", ink: "#3a2d1e", muted: "#8b7a60", line: "#d8c9ab", ui: "#e1d4b9" },
  grey: { name: "Grey", bg: "#e7e5e2", ink: "#202020", muted: "#77736d", line: "#d3d0cb", ui: "#dcd9d4" },
  dusk: { name: "Dusk", bg: "#2a2622", ink: "#e6ddcf", muted: "#9b9183", line: "#3e3832", ui: "#34302b" },
  night: { name: "Night", bg: "#000000", ink: "#b8b1a6", muted: "#6f6a62", line: "#1d1c1a", ui: "#141413" },
};
/** Fonts with full diacritics (IAST: ā ī ū ṛ ṣ ṇ ṁ ḥ). g = Google Fonts family; loaded only when chosen. */
const FONTS: { k: string; name: string; css: string; g?: string; note: string }[] = [
  { k: "literata", name: "Literata", css: "'Literata', Georgia, serif", g: "Literata:ital,opsz,wght@0,7..72,300..700;1,7..72,300..700", note: "Made for long reading" },
  { k: "gentium", name: "Gentium Book", css: "'Gentium Book Plus', Georgia, serif", g: "Gentium+Book+Plus:ital,wght@0,400;0,700;1,400;1,700", note: "Classic book face, rich diacritics" },
  { k: "garamond", name: "EB Garamond", css: "'EB Garamond', Georgia, serif", g: "EB+Garamond:ital,wght@0,400..800;1,400..800", note: "Old-style elegance" },
  { k: "crimson", name: "Crimson Pro", css: "'Crimson Pro', Georgia, serif", g: "Crimson+Pro:ital,wght@0,300..800;1,300..800", note: "Warm and bookish" },
  { k: "source", name: "Source Serif", css: "'Source Serif 4', Georgia, serif", g: "Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700", note: "Clear on screens" },
  { k: "noto", name: "Noto Serif", css: "'Noto Serif', Georgia, serif", g: "Noto+Serif:ital,wght@0,300..700;1,300..700", note: "Covers every script" },
  { k: "alegreya", name: "Alegreya", css: "'Alegreya', Georgia, serif", g: "Alegreya:ital,wght@0,400..800;1,400..800", note: "Lively, calligraphic" },
  { k: "spectral", name: "Spectral", css: "'Spectral', Georgia, serif", g: "Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400", note: "Light and refined" },
  { k: "merriweather", name: "Merriweather", css: "'Merriweather', Georgia, serif", g: "Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900", note: "Sturdy, very readable" },
  { k: "lora", name: "Lora", css: "'Lora', Georgia, serif", g: "Lora:ital,wght@0,400..700;1,400..700", note: "Soft contemporary serif" },
  { k: "inter", name: "Inter", css: "'Inter', system-ui, sans-serif", g: "Inter:ital,wght@0,300..700;1,300..700", note: "Clean sans-serif" },
  { k: "notosans", name: "Noto Sans", css: "'Noto Sans', system-ui, sans-serif", g: "Noto+Sans:ital,wght@0,300..700;1,300..700", note: "Neutral sans-serif" },
  { k: "atkinson", name: "Atkinson Hyperlegible", css: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', system-ui, sans-serif", g: "Atkinson+Hyperlegible+Next:ital,wght@0,300..700;1,300..700", note: "For low vision" },
  { k: "system", name: "This device", css: "Georgia, 'Times New Roman', serif", note: "No download" },
];
const loaded = new Set<string>();
function loadFont(k: string) {
  const f = FONTS.find((x) => x.k === k); if (!f?.g || loaded.has(k)) return; loaded.add(k);
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = `https://fonts.googleapis.com/css2?family=${f.g}&display=swap`; document.head.appendChild(l);
}
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? { ...(d as any), ...JSON.parse(v) } : d; } catch { return d; } };
const readArr = <T,>(k: string): T[] => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
type Mark = { ch: number; r: number; label: string; text: string; at: number };
type Target = { kind: "ratio"; r: number } | { kind: "first" } | { kind: "last" } | { kind: "el"; el: Element };

export function PathaReader({ book, chapters, toc, children }: { book: Book; chapters: Chapter[]; toc?: TocRow[]; children: React.ReactNode }) {
  const rows: TocRow[] = toc || chapters.map((c, i) => ({ key: c.id, title: c.title, num: c.num, depth: c.depth, ch: i, words: c.words }));
  const [s, setS] = useState<S>(DEF); const [ready, setReady] = useState(false);
  const [ch, setCh] = useState(0); const [page, setPage] = useState(0); const [pages, setPages] = useState(1);
  const [bars, setBars] = useState(true); const [panel, setPanel] = useState<null | "toc" | "books" | "search" | "marks" | "settings">(null);
  const [wide, setWide] = useState(false); const [dockTab, setDockTab] = useState<"toc" | "books" | "search" | "marks">("toc");
  const [marks, setMarks] = useState<Mark[]>([]); const [full, setFull] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const view = useRef<HTMLDivElement>(null); const flow = useRef<HTMLDivElement>(null);
  const zoomAcc = useRef(0); const sRef = useRef<S>(DEF); const pinch = useRef<{ d: number; size: number } | null>(null); const hoverBars = useRef(false); const hideT = useRef<any>(null);
  const target = useRef<Target | null>(null); const dragX = useRef(0); const [drag, setDrag] = useState(0); const [noAnim, setNoAnim] = useState(true);
  sRef.current = s;
  const T = THEMES[s.theme] || THEMES.paper; const F = FONTS.find((f) => f.k === s.font) || FONTS[0];
  const posKey = `tj_patha_pos_${book.slug}`, markKey = `tj_patha_marks_${book.slug}`;

  // Start: settings, bookmarks, and where the reader stopped (or ?c=chapter id).
  useEffect(() => {
    const v = read("tj_patha", DEF); setS(v); loadFont(v.font); setMarks(readArr<Mark>(markKey));
    const c = new URLSearchParams(location.search).get("c"); const ci = c === "start" ? 0 : c ? chapters.findIndex((x) => x.id === c) : -1; setReaderKind("patha");
    const p = read<{ ch: number; r: number }>(posKey, { ch: 0, r: 0 });
    const start = ci >= 0 ? ci : Math.min(Math.max(0, p.ch), chapters.length - 1);
    target.current = ci >= 0 ? { kind: "first" } : { kind: "ratio", r: p.r || 0 }; setCh(start); setReady(true);
  }, []); // eslint-disable-line
  const set = (p: Partial<S>) => setS((o) => { const n = { ...o, ...p }; write("tj_patha", n); if (p.font) loadFont(p.font); return n; });

  // Wide screens keep the contents beside the pages, as in the other reader.
  useEffect(() => { const f = () => setWide(window.innerWidth >= 1100); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const docked = wide && s.dock;
  const openSide = (t: "toc" | "books" | "search" | "marks") => { if (wide) { if (s.dock && dockTab === t) setKeep({ dock: false }); else { if (!s.dock) setKeep({ dock: true }); setDockTab(t); } } else setPanel(panel === t ? null : t); };
  // The size of the page area.
  useEffect(() => {
    const el = view.current; if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [ready]);
  const two = s.spread === "two" || (s.spread === "auto" && box.w >= 1000 && box.w > box.h * 1.25);
  // Margins; a single page keeps a comfortable line length (about 70 characters) however wide the screen.
  const m0 = Math.round((box.w * s.margin) / 100 / (two ? 2 : 1)) + (two ? 8 : 0);
  const m = two ? m0 : s.width ? Math.max(m0, Math.round((box.w * (1 - s.width / 100)) / 2)) : Math.max(m0, Math.round((box.w - s.size * 36) / 2));
  const colW = two ? (box.w - 4 * m) / 2 : box.w - 2 * m;

  // Show only the current chapter; then lay it out and count its pages.
  const measure = useCallback(() => {
    const f = flow.current; if (!f || !box.w) return;
    f.querySelectorAll<HTMLElement>(".pr-sec").forEach((sec) => sec.classList.toggle("on", Number(sec.dataset.ch) === ch));
    const sec = f.querySelector<HTMLElement>(`.pr-sec[data-ch="${ch}"]`); const end = sec?.querySelector(".pr-end") || sec?.lastElementChild;
    const base = f.getBoundingClientRect().left - (f as any)._tx || 0;
    const fl = f.getBoundingClientRect().left;
    let n = 1; if (end) { const r = end.getBoundingClientRect(); n = Math.max(1, Math.floor((r.left - fl + 2) / box.w) + 1); }
    void base; setPages(n);
    const t = target.current; target.current = null;
    if (!t) setPage((p) => Math.min(p, n - 1));
    else if (t.kind === "first") setPage(0);
    else if (t.kind === "last") setPage(n - 1);
    else if (t.kind === "ratio") setPage(Math.min(n - 1, Math.round(t.r * n)));
    else { const r = t.el.getBoundingClientRect(); setPage(Math.min(n - 1, Math.max(0, Math.floor((r.left - fl + 2) / box.w)))); }
  }, [ch, box.w]);
  useLayoutEffect(() => { setNoAnim(true); measure(); const id = requestAnimationFrame(() => setNoAnim(false)); return () => cancelAnimationFrame(id); }, [measure, s, box.h, two]);
  useEffect(() => { document.fonts?.ready.then(() => measure()); const f = flow.current; const on = () => measure(); f?.addEventListener("load", on, true); return () => f?.removeEventListener("load", on, true); }, [measure]);
  // When the layout changes (settings, size), keep the same place: remember the ratio first.
  const keep = () => { target.current = { kind: "ratio", r: pages > 1 ? page / pages : 0 }; };
  const setKeep = (p: Partial<S>) => { keep(); set(p); };

  // Save the place.
  useEffect(() => { if (!ready) return; const t = setTimeout(() => { write(posKey, { ch, r: pages > 1 ? page / pages : 0 });
    const last = { href: `/books/${book.slug}/read`, title: chapters[ch]?.title || "", book: book.title, slug: book.slug, cover: book.cover || null, at: Date.now(), index: ch, total: chapters.length };
    write(`tj_last_${book.slug}`, last); write("tj_last_books", [last, ...readArr<any>("tj_last_books").filter((x) => x.slug !== book.slug)].slice(0, 8)); }, 250); return () => clearTimeout(t); }, [ch, page, pages, ready, posKey]); // eslint-disable-line

  const next = useCallback(() => { if (page < pages - 1) setPage(page + 1); else if (ch < chapters.length - 1) { target.current = { kind: "first" }; setCh(ch + 1); } setBars(false); }, [page, pages, ch, chapters.length]);
  const prev = useCallback(() => { if (page > 0) setPage(page - 1); else if (ch > 0) { target.current = { kind: "last" }; setCh(ch - 1); } setBars(false); }, [page, ch]);
  const goToc = (i: number, anchor?: string) => { const el = anchor ? flow.current?.querySelector(`#${CSS.escape(anchor)}`) : null; goCh(i, el ? { kind: "el", el } : { kind: "first" }); };
  const goCh = (i: number, t: Target = { kind: "first" }) => { target.current = t; if (i === ch) measure(); else setCh(i); setPanel(null); };

  // Keys and wheel.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) { if (e.key === "Escape") setPanel(null); return; }
      if (e.key === "Escape") { if (panel) setPanel(null); else setBars((b) => !b); return; }
      if (panel) return;
      if (["ArrowRight", "PageDown", "ArrowDown"].includes(e.key) || (e.key === " " && !e.shiftKey)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "PageUp", "ArrowUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); prev(); }
      else if (e.key === "Home") setPage(0); else if (e.key === "End") setPage(pages - 1);
      else if (e.key === "t") openSide("toc"); else if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); e.stopImmediatePropagation(); openSide("search"); } else if (e.key === "b") toggleMark();
      else if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "0"].includes(e.key)) { e.preventDefault(); setKeep({ size: e.key === "0" ? DEF.size : e.key === "-" ? Math.max(13, s.size - 1) : Math.min(34, s.size + 1) }); }
      else if (e.key === "s" || e.key === "a") setPanel("settings"); else if (e.key === "m") openSide("marks"); else if (e.key === "n") { if (ch < chapters.length - 1) goCh(ch + 1); } else if (e.key === "p") { if (ch > 0) goCh(ch - 1); }
      else if (e.key === "+" || e.key === "=") setKeep({ size: Math.min(34, s.size + 1) }); else if (e.key === "-") setKeep({ size: Math.max(13, s.size - 1) });
      else if (e.key === "f") fullscreen();
    };
    let last = 0;
    const w = (e: WheelEvent) => { if (panel) return;
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomAcc.current += -e.deltaY; if (Math.abs(zoomAcc.current) >= 18) { const st = zoomAcc.current > 0 ? 1 : -1; zoomAcc.current = 0; setKeep({ size: Math.max(13, Math.min(34, sRef.current.size + st)) }); } return; }
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX; if (Math.abs(d) < 12) return; const now = Date.now(); if (now - last < 380) return; last = now; d > 0 ? next() : prev(); };
    window.addEventListener("keydown", k, true); view.current?.addEventListener("wheel", w, { passive: false }); const v = view.current;
    return () => { window.removeEventListener("keydown", k, true); v?.removeEventListener("wheel", w); };
  });

  // Pinch with two fingers: the text grows or shrinks.
  useEffect(() => { const el = view.current; if (!el) return;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const st = (e: TouchEvent) => { if (e.touches.length === 2) { pinch.current = { d: dist(e.touches), size: sRef.current.size }; pd.current = null; } };
    const mv = (e: TouchEvent) => { const p = pinch.current; if (!p || e.touches.length !== 2) return; e.preventDefault(); const size = Math.max(13, Math.min(34, Math.round(p.size * (dist(e.touches) / p.d)))); if (size !== sRef.current.size) setKeep({ size }); };
    const en = (e: TouchEvent) => { if (e.touches.length < 2) pinch.current = null; };
    el.addEventListener("touchstart", st, { passive: true }); el.addEventListener("touchmove", mv, { passive: false }); el.addEventListener("touchend", en);
    return () => { el.removeEventListener("touchstart", st); el.removeEventListener("touchmove", mv); el.removeEventListener("touchend", en); }; }, [ready]); // eslint-disable-line
  // With a mouse: the menus appear when the pointer goes near the top or the bottom, and go again when it leaves.
  const onHover = (e: React.MouseEvent) => { const h = window.innerHeight; const edge = e.clientY < 70 || e.clientY > h - 90;
    if (edge) { clearTimeout(hideT.current); if (!bars) { hoverBars.current = true; setBars(true); } }
    else if (hoverBars.current && !panel) { clearTimeout(hideT.current); hideT.current = setTimeout(() => { hoverBars.current = false; setBars(false); }, 700); } };
  // The menus show at the start, then step aside.
  useEffect(() => { if (!ready) return; const t = setTimeout(() => { if (!hoverBars.current) setBars(false); }, 3500); return () => clearTimeout(t); }, [ready]);
  // Swipe and tap.
  const pd = useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest("a,button,input,select,summary")) return; pd.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false }; };
  const onMove = (e: React.PointerEvent) => { const p = pd.current; if (!p) return; const dx = e.clientX - p.x; if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - p.y)) { p.moved = true; if (s.anim === "slide" && e.pointerType !== "mouse") { dragX.current = dx; setDrag(dx); } } };
  const onUp = (e: React.PointerEvent) => {
    const p = pd.current; pd.current = null; setDrag(0); if (!p) return; const dx = e.clientX - p.x;
    if (p.moved) { if (Math.abs(dx) > Math.max(36, box.w * 0.06)) (dx < 0 ? next : prev)(); return; }
    if (window.getSelection()?.toString()) return; if (Date.now() - p.t > 600) return;
    const r = view.current!.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width;
    if (s.taps === "sides") { if (x < 0.3) prev(); else if (x > 0.7) next(); else setBars((b) => !b); }
    else { if (x < 0.2) prev(); else if (x > 0.35 && x < 0.65 && (e.clientY - r.top) / r.height < 0.4) setBars((b) => !b); else next(); }
  };

  const fullscreen = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch {} };
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);

  // Bookmarks.
  const here = pages > 1 ? page / pages : 0;
  const marked = marks.find((x) => x.ch === ch && Math.abs(x.r - here) < 0.5 / Math.max(1, pages));
  const pageText = () => { const f = flow.current; if (!f) return ""; const fl = f.getBoundingClientRect().left; const sec = f.querySelector(`.pr-sec[data-ch="${ch}"]`); const ps = sec ? Array.from(sec.querySelectorAll("p,li,h2,h3,blockquote")) : []; const el = ps.find((x) => { const l = x.getBoundingClientRect().left - fl; return l >= page * box.w - 4 && l < (page + 1) * box.w; }); return (el?.textContent || "").trim().slice(0, 140); };
  const toggleMark = () => { const n = marked ? marks.filter((x) => x !== marked) : [...marks, { ch, r: here, label: chapters[ch]?.title || "", text: pageText(), at: Date.now() }].sort((a, b) => a.ch - b.ch || a.r - b.r); setMarks(n); write(markKey, n); };

  // Progress through the whole book, by words.
  const totalW = useMemo(() => chapters.reduce((a, c) => a + Math.max(1, c.words), 0), [chapters]);
  const beforeW = useMemo(() => chapters.slice(0, ch).reduce((a, c) => a + Math.max(1, c.words), 0), [chapters, ch]);
  const cw = Math.max(1, chapters[ch]?.words || 1); const step = two ? 2 : 1;
  const pct = Math.min(100, Math.round(((beforeW + ((page + step) / Math.max(1, pages)) * cw) / totalW) * 100));
  const minsLeft = Math.max(0, Math.round(((1 - (page + step) / Math.max(1, pages)) * cw) / 230));
  const seek = (r: number) => { let acc = 0; for (let i = 0; i < chapters.length; i++) { const w = Math.max(1, chapters[i].words); if (acc + w >= r * totalW || i === chapters.length - 1) { goCh(i, { kind: "ratio", r: Math.max(0, Math.min(0.999, (r * totalW - acc) / w)) }); return; } acc += w; } };

  const tx = -page * box.w + drag;
  const vars = { "--rd-ink": T.ink, "--rd-muted": T.muted, "--rd-line": T.line, "--pr-h": `${box.h}px` } as React.CSSProperties;
  const half = Math.ceil(pages / step); const at = Math.floor(page / step) + 1;
  return (
    <div onMouseMove={onHover} className="pr-root fixed inset-0 z-[90] flex select-text overflow-hidden" style={{ background: T.bg, color: T.ink, ...vars }}>
      {docked && <aside className="flex w-[300px] shrink-0 flex-col" style={{ background: T.ui, borderRight: `1px solid ${T.line}` }}>
        <div className="flex h-12 shrink-0 items-end gap-1 px-2" style={{ borderBottom: `1px solid ${T.line}` }}>
          {([["toc", "Contents"], ["books", "Books"], ["search", "Search"], ["marks", "Bookmarks"]] as const).map(([k, l]) => <button key={k} onClick={() => setDockTab(k)} className="relative px-2 pb-2.5 text-[13px] font-medium" style={{ color: dockTab === k ? T.ink : T.muted }}>{l}{dockTab === k && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full" style={{ background: "#b5651d" }} />}</button>)}
          <button onClick={() => setKeep({ dock: false })} aria-label="Hide the side column" title="Hide" className="mb-2 ml-auto rounded-full p-1.5" style={{ color: T.muted }}><X size={16} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {dockTab === "toc" && <Toc rows={rows} ch={ch} T={T} go={goToc} />}
          {dockTab === "search" && <Find flow={flow} chapters={chapters} T={T} go={(i, el) => goCh(i, { kind: "el", el })} />}
          {dockTab === "books" && <AllBooks T={T} current={book.slug} onGo={() => {}} />}
          {dockTab === "marks" && <Marks marks={marks} T={T} go={(x) => goCh(x.ch, { kind: "ratio", r: x.r })} remove={(x) => { const n = marks.filter((y) => y !== x); setMarks(n); write(markKey, n); }} />}
        </div>
      </aside>}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* top bar */}
      <div className={`absolute inset-x-0 top-0 z-30 flex h-12 items-center gap-1 px-2 transition duration-300 sm:px-3 ${bars ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`} style={{ background: T.ui, borderBottom: `1px solid ${T.line}` }}>
        <Link href="/teachings/books" className="pr-ib" aria-label="All books" title="All books"><Home size={17} /></Link>
        <button className="pr-ib" onClick={() => openSide("toc")} aria-label="Contents" title="Contents (T)"><List size={18} /></button>
        <button className="pr-ib" onClick={() => openSide("books")} aria-label="All books — go to another book" title="All books — go to another book"><Library size={17} /></button>
        <Link href={`/books/${book.slug}`} className="min-w-0 flex-1 px-1 text-center"><p className="truncate text-[11.5px]" style={{ color: T.muted }}>{book.title}</p><p className="truncate text-[13px] font-medium">{chapters[ch]?.title}</p></Link>
        <button className="pr-ib" onClick={() => openSide("search")} aria-label="Search" title="Search (/)"><Search size={18} /></button>
        <button className="pr-ib" onClick={toggleMark} aria-label={marked ? "Remove bookmark" : "Bookmark this page"} title="Bookmark (B)">{marked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>
        <button className="pr-ib max-sm:hidden" onClick={fullscreen} aria-label="Full screen" title="Full screen (F)">{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        <button className="pr-ib" onClick={() => setPanel(panel === "settings" ? null : "settings")} aria-label="Reading settings" title="Settings (S)"><Settings2 size={18} /></button>
      </div>
      {marked && <span aria-hidden className="absolute right-6 top-0 z-20 h-7 w-4" style={{ background: "#b5651d", clipPath: "polygon(0 0,100% 0,100% 100%,50% 75%,0 100%)" }} />}

      {/* the pages */}
      <div ref={view} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { pd.current = null; setDrag(0); }}
        className="relative mx-auto w-full flex-1 touch-pan-y overflow-hidden" style={{ marginTop: 34, marginBottom: s.status ? 30 : 18, maxWidth: s.width >= 90 ? "none" : 1600 }}>
        <div ref={flow} className={`pr-flow rd-text ${s.anim === "fade" && !noAnim ? "pr-fade" : ""}`} key={s.anim === "fade" ? `${ch}-${page}` : "f"}
          style={{ height: box.h, width: box.w, paddingLeft: m, paddingRight: m, columnWidth: colW, columnGap: 2 * m, columnFill: "auto",
            transform: `translate3d(${s.anim === "fade" ? -page * box.w : tx}px,0,0)`, transition: noAnim || drag || s.anim !== "slide" ? "none" : "transform .32s cubic-bezier(.22,.8,.24,1)",
            fontFamily: F.css, fontSize: s.size, fontWeight: s.weight, lineHeight: s.lead, textAlign: s.justify ? "justify" : "left", hyphens: s.hyphen ? "auto" : "manual",
            letterSpacing: `${s.letter / 100}em`, wordSpacing: `${s.word / 50}em`, ["--pr-para" as string]: `${s.para}em`, ["--pr-indent" as string]: `${s.indent}em` }}>
          {children}
        </div>
        {two && <span aria-hidden className="pointer-events-none absolute inset-y-6 left-1/2 w-px" style={{ background: `linear-gradient(${T.line}00, ${T.line}, ${T.line}00)` }} />}
      </div>

      {/* status line */}
      {s.status && <div className="absolute inset-x-0 bottom-0 z-10 flex h-[30px] items-center gap-3 px-4 text-[11.5px] tabular-nums sm:px-6" style={{ color: T.muted }}>
        <span className="min-w-0 flex-1 truncate">{chapters[ch]?.title}</span>
        <span>{at} / {half}</span>
        {s.showPct && <span>{pct}%</span>}
        {s.showTime && <span className="max-sm:hidden">{minsLeft ? `${minsLeft} min left in chapter` : "End of chapter"}</span>}
      </div>}

      {/* bottom bar: progress through the whole book */}
      <div className={`absolute inset-x-0 bottom-0 z-30 px-3 pb-3 pt-2 transition duration-300 sm:px-6 ${bars ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`} style={{ background: T.ui, borderTop: `1px solid ${T.line}` }}>
        <div className="flex items-center gap-3">
          <button className="pr-ib" onClick={() => { if (ch > 0) goCh(ch - 1); }} disabled={ch === 0} aria-label="Previous chapter"><ChevronLeft size={18} /></button>
          <div className="relative h-6 flex-1 cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); }} role="slider" aria-label="Place in the book" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ background: T.line }} />
            <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ width: `${pct}%`, background: "#b5651d" }} />
            {chapters.length < 120 && chapters.map((c, i) => i > 0 && <span key={c.id} className="absolute top-1/2 h-[7px] w-px -translate-y-1/2" style={{ left: `${(chapters.slice(0, i).reduce((a, x) => a + Math.max(1, x.words), 0) / totalW) * 100}%`, background: T.muted, opacity: 0.5 }} />)}
            <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" style={{ left: `${pct}%`, background: "#b5651d", border: `2px solid ${T.ui}` }} />
          </div>
          <span className="w-10 text-right text-[12px] tabular-nums" style={{ color: T.muted }}>{pct}%</span>
          <button className="pr-ib" onClick={() => { if (ch < chapters.length - 1) goCh(ch + 1); }} disabled={ch === chapters.length - 1} aria-label="Next chapter"><ChevronRight size={18} /></button>
        </div>
      </div>

      </div>
      {/* light: dim and warmth */}
      {(s.dim > 0 || s.warm > 0) && <div aria-hidden className="pointer-events-none absolute inset-0 z-40" style={{ background: `linear-gradient(rgba(255,140,30,${s.warm / 250}), rgba(255,140,30,${s.warm / 250})), rgba(0,0,0,${s.dim / 100})`, mixBlendMode: s.warm && !s.dim ? "multiply" : "normal" }} />}

      {panel && <Sheet T={T} onClose={() => setPanel(null)} tab={panel} setTab={setPanel}>
        {panel === "toc" && <Toc rows={rows} ch={ch} T={T} go={goToc} />}
        {panel === "books" && <AllBooks T={T} current={book.slug} onGo={() => setPanel(null)} />}
        {panel === "search" && <Find flow={flow} chapters={chapters} T={T} go={(i, el) => goCh(i, { kind: "el", el })} />}
        {panel === "marks" && <Marks marks={marks} T={T} go={(x) => goCh(x.ch, { kind: "ratio", r: x.r })} remove={(x) => { const n = marks.filter((y) => y !== x); setMarks(n); write(markKey, n); }} />}
        {panel === "settings" && <Settings s={s} set={setKeep} T={T} chapter={chapters[ch]} />}
      </Sheet>}
    </div>);
}

function Sheet({ T, tab, setTab, onClose, children }: { T: (typeof THEMES)[string]; tab: string; setTab: (t: any) => void; onClose: () => void; children: React.ReactNode }) {
  const right = tab === "settings";
  return (
    <div className={`absolute inset-0 z-50 flex ${right ? "justify-end" : "justify-start"}`} style={{ background: "rgba(0,0,0,.28)" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="pr-sheet flex h-full w-full max-w-[420px] flex-col shadow-2xl" style={{ background: T.bg, color: T.ink, [right ? "borderLeft" : "borderRight"]: `1px solid ${T.line}`, animationName: right ? "pr-sheet-r" : undefined }}>
        <div className="flex items-center gap-1 px-3 pt-3" style={{ borderBottom: `1px solid ${T.line}` }}>
          {(right ? ([["settings", "Settings"]] as const) : ([["toc", "Contents"], ["books", "Books"], ["search", "Search"], ["marks", "Bookmarks"]] as const)).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="relative px-2.5 pb-2.5 pt-1 text-[13px] font-medium transition" style={{ color: tab === k ? T.ink : T.muted }}>{l}{tab === k && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full" style={{ background: "#b5651d" }} />}</button>))}
          <button onClick={onClose} aria-label="Close" className="ml-auto mb-2 rounded-full p-1.5" style={{ color: T.muted }}><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>);
}

type TocRow = { key: string; title: string; num: string; depth: number; ch: number; anchor?: string; label?: boolean; words?: number };
function Toc({ rows, ch, T, go }: { rows: TocRow[]; ch: number; T: (typeof THEMES)[string]; go: (i: number, anchor?: string) => void }) {
  const cur = useRef<HTMLButtonElement>(null); useEffect(() => { cur.current?.scrollIntoView({ block: "center" }); }, []);
  return <ol className="py-2">{rows.map((c) => { const on = c.ch === ch && !c.anchor && !c.label; return (
    <li key={c.key}>{c.label ? <p className="flex items-baseline gap-2 pb-1 pr-4 pt-3 text-[11.5px] font-semibold uppercase tracking-[0.08em]" style={{ paddingLeft: 16 + c.depth * 16, color: T.muted }}>{c.num && <span className="w-8 shrink-0 tabular-nums">{c.num}</span>}{c.title}</p>
      : <button ref={on ? cur : undefined} onClick={() => go(c.ch, c.anchor)} className="flex w-full items-baseline gap-2 py-2 pr-4 text-left text-[14px] transition hover:opacity-100" style={{ paddingLeft: 16 + c.depth * 16, background: on ? `${T.line}` : undefined, opacity: on ? 1 : 0.88 }}>
      {c.num && <span className="w-8 shrink-0 text-[12px] tabular-nums" style={{ color: T.muted }}>{c.num}</span>}<span className={`min-w-0 flex-1 ${c.depth === 0 && !c.anchor ? "font-medium" : ""}`}>{c.title}</span><span className="shrink-0 text-[11px] tabular-nums" style={{ color: T.muted }}>{!c.anchor && (c.words || 0) > 200 ? `${Math.max(1, Math.round((c.words || 0) / 230))} min` : ""}</span></button>}</li>); })}</ol>;
}

function Find({ flow, chapters, T, go }: { flow: React.RefObject<HTMLDivElement | null>; chapters: Chapter[]; T: (typeof THEMES)[string]; go: (i: number, el: Element) => void }) {
  const [q, setQ] = useState(""); const inp = useRef<HTMLInputElement>(null); useEffect(() => { inp.current?.focus(); }, []);
  const fold = (t: string) => t.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  const hits = useMemo(() => {
    const w = fold(q.trim()); if (w.length < 2 || !flow.current) return [];
    const out: { ch: number; el: Element; before: string; match: string; after: string }[] = [];
    flow.current.querySelectorAll<HTMLElement>(".pr-sec").forEach((sec) => { const i = Number(sec.dataset.ch); sec.querySelectorAll("p,li,h2,h3,h4,blockquote,td,figcaption").forEach((el) => {
      if (out.length >= 200) return; const t = el.textContent || ""; const f = fold(t); const k = f.indexOf(w); if (k < 0) return;
      out.push({ ch: i, el, before: t.slice(Math.max(0, k - 50), k), match: t.slice(k, k + w.length), after: t.slice(k + w.length, k + w.length + 70) }); }); });
    return out;
  }, [q, flow]);
  const jump = (h: (typeof hits)[number]) => {
    try { const H = (window as any).Highlight; const reg = (CSS as any).highlights; if (H && reg) { const node = h.el.firstChild; const r = document.createRange(); r.selectNodeContents(h.el); reg.set("pr-find", new H(r)); setTimeout(() => reg.delete("pr-find"), 4000); void node; } } catch {}
    go(h.ch, h.el);
  };
  return (
    <div className="p-3">
      <label className="flex h-10 items-center gap-2 rounded-lg px-3" style={{ background: T.ui }}><Search size={15} style={{ color: T.muted }} /><input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this book" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" /></label>
      {q.trim().length >= 2 && <p className="px-1 pb-1 pt-3 text-[12px]" style={{ color: T.muted }}>{hits.length >= 200 ? "200+ places" : `${hits.length} ${hits.length === 1 ? "place" : "places"}`}</p>}
      <ul>{hits.map((h, k) => <li key={k}><button onClick={() => jump(h)} className="w-full rounded-lg px-2 py-2 text-left text-[13.5px] leading-snug transition" style={{}}>
        <span className="block text-[11.5px]" style={{ color: T.muted }}>{chapters[h.ch]?.title}</span>…{h.before}<mark style={{ background: "#e9b46c66", color: "inherit", borderRadius: 2 }}>{h.match}</mark>{h.after}…</button></li>)}</ul>
    </div>);
}

function Marks({ marks, T, go, remove }: { marks: Mark[]; T: (typeof THEMES)[string]; go: (m: Mark) => void; remove: (m: Mark) => void }) {
  if (!marks.length) return <p className="p-6 text-center text-[13.5px]" style={{ color: T.muted }}>No bookmarks yet. Tap the bookmark at the top (or press B) to keep a page.</p>;
  return <ul className="p-2">{marks.map((x, i) => <li key={i} className="flex items-start gap-2 rounded-lg px-2 py-2"><button onClick={() => go(x)} className="min-w-0 flex-1 text-left"><span className="block text-[13.5px] font-medium">{x.label}</span><span className="line-clamp-2 block text-[12.5px]" style={{ color: T.muted }}>{x.text || `${Math.round(x.r * 100)}% into the chapter`}</span></button><button onClick={() => remove(x)} aria-label="Remove bookmark" className="rounded p-1.5" style={{ color: T.muted }}><Trash2 size={14} /></button></li>)}</ul>;
}

function Settings({ s, set, T, chapter }: { s: S; set: (p: Partial<S>) => void; T: (typeof THEMES)[string]; chapter?: Chapter }) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.line}` }}><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.muted }}>{label}</p>{children}</div>;
  const Seg = <V extends string | number | boolean>({ v, opts, on }: { v: V; opts: [V, string][]; on: (x: V) => void }) => <div className="flex rounded-lg p-0.5" style={{ background: T.ui }}>{opts.map(([k, l]) => <button key={String(k)} onClick={() => on(k)} className="flex-1 rounded-md px-2 py-1.5 text-[12.5px] transition" style={v === k ? { background: T.bg, color: T.ink, boxShadow: "0 1px 2px rgba(0,0,0,.15)", fontWeight: 600 } : { color: T.muted }}>{l}</button>)}</div>;
  const Slide = ({ v, min, max, st = 1, on, show }: { v: number; min: number; max: number; st?: number; on: (x: number) => void; show: string }) => <div className="flex items-center gap-3"><input type="range" min={min} max={max} step={st} value={v} onChange={(e) => on(Number(e.target.value))} className="pr-range flex-1" /><span className="w-12 text-right text-[12px] tabular-nums" style={{ color: T.muted }}>{show}</span></div>;
  return (
    <div className="pb-10">
      <Row label="Reader"><div className="grid gap-1.5">
        <div className="flex items-start gap-3 rounded-lg p-2.5" style={{ background: T.ui, boxShadow: "inset 0 0 0 2px #b5651d" }}><span className="mt-0.5 text-[15px]">📖</span><span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold">Pāṭha — pages <span className="ml-1 rounded px-1.5 py-px text-[10.5px] font-semibold uppercase tracking-wide" style={{ background: "#b5651d", color: "#fff" }}>Recommended</span></span><span className="block text-[12px]" style={{ color: T.muted }}>Turn pages through the whole book, like a printed book.</span></span></div>
        {chapter && <Link href={chapter.href} onClick={() => setReaderKind("classic")} className="flex items-start gap-3 rounded-lg p-2.5 transition" style={{ boxShadow: `inset 0 0 0 1px ${T.line}` }}><span className="mt-0.5 text-[15px]">📜</span><span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium">Classic — scroll</span><span className="block text-[12px]" style={{ color: T.muted }}>One chapter at a time as a web page, scrolling down. Opens books this way from now on.</span></span></Link>}
      </div></Row>
      <Row label="Theme"><div className="grid grid-cols-6 gap-2">{Object.entries(THEMES).map(([k, t]) => <button key={k} onClick={() => set({ theme: k })} title={t.name} className="flex flex-col items-center gap-1"><span className="flex size-10 items-center justify-center rounded-full text-[13px] font-semibold" style={{ background: t.bg, color: t.ink, boxShadow: s.theme === k ? "0 0 0 2px #b5651d" : `0 0 0 1px ${T.line}` }}>Aa</span><span className="text-[10.5px]" style={{ color: T.muted }}>{t.name}</span></button>)}</div></Row>
      <Row label="Font"><div className="grid grid-cols-2 gap-1.5">{FONTS.map((f) => <button key={f.k} onMouseEnter={() => loadFont(f.k)} onFocus={() => loadFont(f.k)} onClick={() => set({ font: f.k })} className="rounded-lg px-2.5 py-2 text-left transition" style={{ background: s.font === f.k ? T.ui : "transparent", boxShadow: s.font === f.k ? "inset 0 0 0 1.5px #b5651d" : `inset 0 0 0 1px ${T.line}` }}><span className="block truncate text-[15px]" style={{ fontFamily: f.css }}>{f.name}</span><span className="block truncate text-[10.5px]" style={{ color: T.muted }}>{f.note}</span></button>)}</div></Row>
      <Row label="Text size"><div className="flex items-center gap-2"><button onClick={() => set({ size: Math.max(13, s.size - 1) })} className="pr-ib text-[13px]">A−</button><Slide v={s.size} min={13} max={34} on={(x) => set({ size: x })} show={`${s.size}px`} /><button onClick={() => set({ size: Math.min(34, s.size + 1) })} className="pr-ib text-[17px]">A+</button></div></Row>
      <Row label="Weight"><Seg v={s.weight} opts={[[300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Bold"]]} on={(x) => set({ weight: x })} /></Row>
      <Row label="Line spacing"><Seg v={s.lead} opts={[[1.35, "Tight"], [1.5, "Snug"], [1.6, "Normal"], [1.8, "Relaxed"], [2.05, "Loose"]]} on={(x) => set({ lead: x })} /></Row>
      <Row label="Page width"><Seg v={s.width} opts={[[0, "Comfortable"], [50, "Half"], [70, "Wide"], [85, "Wider"], [100, "Full screen"]]} on={(x) => set({ width: x })} /><p className="mt-1.5 text-[11.5px]" style={{ color: T.muted }}>“Comfortable” keeps lines easy to read whatever the screen. Margins below still apply.</p></Row>
      <Row label="Margins"><Slide v={s.margin} min={2} max={16} on={(x) => set({ margin: x })} show={`${s.margin}%`} /></Row>
      <Row label="Alignment"><Seg v={s.justify} opts={[[true, "Justified"], [false, "Left"]]} on={(x) => set({ justify: x })} /><label className="mt-2.5 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={s.hyphen} onChange={(e) => set({ hyphen: e.target.checked })} />Hyphenate long words</label></Row>
      <Row label="Paragraphs"><p className="mb-1 text-[12px]" style={{ color: T.muted }}>Space between</p><Seg v={s.para} opts={[[0, "None"], [0.5, "Small"], [0.95, "Normal"], [1.4, "Large"]]} on={(x) => set({ para: x })} /><p className="mb-1 mt-2.5 text-[12px]" style={{ color: T.muted }}>First-line indent</p><Seg v={s.indent} opts={[[0, "None"], [1, "Small"], [1.6, "Normal"], [2.4, "Large"]]} on={(x) => set({ indent: x })} /></Row>
      <Row label="Letter and word spacing"><p className="mb-1 text-[12px]" style={{ color: T.muted }}>Letters</p><Slide v={s.letter} min={-3} max={8} on={(x) => set({ letter: x })} show={s.letter ? `${s.letter > 0 ? "+" : ""}${s.letter}` : "Normal"} /><p className="mb-1 mt-2 text-[12px]" style={{ color: T.muted }}>Words</p><Slide v={s.word} min={-3} max={10} on={(x) => set({ word: x })} show={s.word ? `${s.word > 0 ? "+" : ""}${s.word}` : "Normal"} /></Row>
      <Row label="Pages"><Seg v={s.spread} opts={[["one", "One page"], ["two", "Two pages"], ["auto", "Two on wide screens"]]} on={(x) => set({ spread: x })} /></Row>
      <Row label="Turning pages"><Seg v={s.anim} opts={[["slide", "Slide"], ["fade", "Fade"], ["none", "Instant"]]} on={(x) => set({ anim: x })} /><p className="mb-1 mt-2.5 text-[12px]" style={{ color: T.muted }}>Tapping the page</p><Seg v={s.taps} opts={[["sides", "Left back · right forward"], ["forward", "Almost anywhere forward"]]} on={(x) => set({ taps: x })} /></Row>
      <Row label="Light"><p className="mb-1 text-[12px]" style={{ color: T.muted }}>Dim the screen</p><Slide v={s.dim} min={0} max={60} on={(x) => set({ dim: x })} show={s.dim ? `${s.dim}%` : "Off"} /><p className="mb-1 mt-2 text-[12px]" style={{ color: T.muted }}>Warmth (easier at night)</p><Slide v={s.warm} min={0} max={60} on={(x) => set({ warm: x })} show={s.warm ? `${s.warm}%` : "Off"} /></Row>
      <Row label="Status line"><label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={s.status} onChange={(e) => set({ status: e.target.checked })} />Show the line at the bottom</label>
        <label className="mt-1.5 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={s.showPct} onChange={(e) => set({ showPct: e.target.checked })} />Percent of the book read</label>
        <label className="mt-1.5 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={s.showTime} onChange={(e) => set({ showTime: e.target.checked })} />Time left in the chapter</label></Row>
      <div className="flex flex-wrap items-center gap-2 px-4 py-4">
        <button onClick={() => set({ ...DEF })} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px]" style={{ boxShadow: `inset 0 0 0 1px ${T.line}` }}><RotateCcw size={13} />Reset to the defaults</button>

      </div>
      <p className="px-4 text-[11.5px] leading-relaxed" style={{ color: T.muted }}>Keys: ← → or Space to turn · N / P next / previous chapter · T contents · / search · B bookmark · M bookmarks · S settings · Ctrl + / − (or pinch) text size · F full screen · Esc menus. With a mouse, move to the top or bottom edge for the menus. On a phone: swipe, or tap the sides; tap the middle for the menus.</p>
    </div>);
}
