"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Home, Library, List, Search, Settings2, Type, BookOpen, Columns2, Bookmark, BookmarkCheck, Maximize, Minimize, Keyboard, ChevronLeft, ChevronRight, X, Languages, PanelLeft, Focus, BookOpenText, Minus, Plus, Check, ChevronDown, Loader2, FileText } from "lucide-react";
import type { TocItem } from "@/lib/content/books-public";

/* ------------------------------------------------------------------ settings */
type Mode = "classic" | "focus" | "pages" | "sheet" | "parallel";
export type Theme = "ivory" | "light" | "paper" | "sepia" | "sage" | "rose" | "dusk" | "slate" | "dark";
export type FontK = "sans" | "notosans" | "atkinson" | "source" | "literata" | "gentium" | "garamond" | "crimson" | "lora" | "merri" | "noto";
export type ReaderSettings = { mode: Mode; theme: Theme; font: FontK; size: number; leading: number; width: number; justify: boolean; sidebar: boolean };
const DEF: ReaderSettings = { mode: "classic", theme: "light", font: "sans", size: 17, leading: 1.75, width: 680, justify: false, sidebar: true };
const KEY = "tj_reader_v2";
export const loadSettings = (): ReaderSettings => { try { const x = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; if (!(x.font in FONTS)) x.font = DEF.font; if (!(x.theme in THEMES)) x.theme = DEF.theme; return x; } catch { return DEF; } };
export const saveSettings = (s: Partial<ReaderSettings>) => { try { localStorage.setItem(KEY, JSON.stringify({ ...loadSettings(), ...s })); } catch {} };

const DEV = '"Noto Serif Devanagari", "Noto Sans Devanagari"';
export const FONTS: Record<FontK, [string, string]> = {
  sans: ["Inter", `var(--font-sans), "Noto Sans Devanagari", system-ui, sans-serif`],
  notosans: ["Noto Sans", `"Noto Sans", "Noto Sans Devanagari", system-ui, sans-serif`],
  atkinson: ["Atkinson (clear)", `"Atkinson Hyperlegible", "Noto Sans Devanagari", system-ui, sans-serif`],
  source: ["Source Serif", `"Source Serif 4", ${DEV}, Georgia, serif`],
  literata: ["Literata", `"Literata", ${DEV}, Georgia, serif`],
  gentium: ["Gentium", `"Gentium Book Plus", ${DEV}, Georgia, serif`],
  garamond: ["EB Garamond", `"EB Garamond", ${DEV}, Garamond, serif`],
  crimson: ["Crimson Pro", `"Crimson Pro", ${DEV}, Georgia, serif`],
  lora: ["Lora", `"Lora", ${DEV}, Georgia, serif`],
  merri: ["Merriweather", `"Merriweather", ${DEV}, Georgia, serif`],
  noto: ["Noto Serif", `"Noto Serif", ${DEV}, Georgia, serif`],
};
/* every reading font, loaded once with the reader */
export const FONT_CSS = "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Atkinson+Hyperlegible:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Literata:opsz,wght@7..72,400;7..72,600&family=Gentium+Book+Plus:wght@400;700&family=EB+Garamond:wght@400;600&family=Crimson+Pro:wght@400;600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=Noto+Serif:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Devanagari:wght@400;600&display=swap";
export const THEMES: Record<Theme, { label: string; bg: string; ink: string; muted: string; line: string; panel: string; swatch: string }> = {
  ivory: { label: "Ivory", bg: "#fffbf3", ink: "#2a2018", muted: "#8c7559", line: "rgba(90,60,20,0.11)", panel: "rgba(255,251,243,0.84)", swatch: "#fbf1dc" },
  light: { label: "White", bg: "#ffffff", ink: "#1c1c1c", muted: "#7a7a7a", line: "rgba(0,0,0,0.08)", panel: "rgba(255,255,255,0.78)", swatch: "#ffffff" },
  paper: { label: "Paper", bg: "#fbf8f1", ink: "#26221c", muted: "#8a8173", line: "rgba(60,45,20,0.1)", panel: "rgba(251,248,241,0.82)", swatch: "#f6f0e2" },
  sepia: { label: "Sepia", bg: "#f4ead5", ink: "#3a2e20", muted: "#8c7a62", line: "rgba(58,46,32,0.13)", panel: "rgba(244,234,213,0.82)", swatch: "#eadbb8" },
  sage: { label: "Sage", bg: "#eef3ec", ink: "#22302a", muted: "#6f8077", line: "rgba(30,60,40,0.11)", panel: "rgba(238,243,236,0.82)", swatch: "#dbe7d6" },
  rose: { label: "Rose", bg: "#fbf1ef", ink: "#3a2524", muted: "#9a7b78", line: "rgba(90,40,40,0.1)", panel: "rgba(251,241,239,0.82)", swatch: "#f3dcd7" },
  dusk: { label: "Dusk", bg: "#2a2826", ink: "#e6dfd3", muted: "#a49c90", line: "rgba(255,255,255,0.1)", panel: "rgba(42,40,38,0.8)", swatch: "#3a3734" },
  slate: { label: "Slate", bg: "#1d232b", ink: "#d7dde5", muted: "#8b96a3", line: "rgba(255,255,255,0.09)", panel: "rgba(29,35,43,0.8)", swatch: "#27303b" },
  dark: { label: "Night", bg: "#0e0e0e", ink: "#cfcbc4", muted: "#8a8680", line: "rgba(255,255,255,0.09)", panel: "rgba(14,14,14,0.8)", swatch: "#0e0e0e" },
};
const MODES: [Mode, string, string, any][] = [
  ["classic", "Classic", "Contents beside the text", PanelLeft],
  ["focus", "Focus", "Only the text, nothing else", Focus],
  ["pages", "Book pages", "An open book: turn the pages", BookOpenText],
  ["sheet", "Paper", "One long page of paper on the desk", FileText],
  ["parallel", "Side by side", "Two languages together", Columns2],
];
const SHORTCUTS: [string, string][] = [["← →", "Previous / next page or chapter"], ["Space", "Next page (Pages reader)"], ["J  K", "Scroll down / up"], ["1 2 3 4 5", "Classic, Focus, Book pages, Paper, Side by side"], ["C", "Contents"], ["/", "Search in this book"], ["A", "Text settings"], ["+  −  0", "Bigger, smaller, reset text"], ["T", "Change colour theme"], ["L", "Language"], ["B", "Bookmark this chapter"], ["F", "Full screen"], ["?", "These shortcuts"], ["Esc", "Close / leave reader"]];

type Nav = { href: string; title: string } | null;
type Tr = { slug: string; title: string; language: string; native: string; href: string; current: boolean };
type Mark = { href: string; title: string; book: string; at: number };

/* ------------------------------------------------------------------ reader */
export function Reader({ book, chapter, toc, prev, next, translations, parallel, children, searchApi, extra, home = { href: "/teachings/books", label: "All books" }, library = true }: {
  book: { slug: string; title: string; href: string; language: string; cover?: string | null };
  chapter: { id: string; title: string; num: string; label: string; href: string; index: number; total: number };
  toc: TocItem[]; prev: Nav; next: Nav; translations: Tr[];
  parallel?: { title: string; language: string; native: string; slug: string; node: React.ReactNode } | null;
  children: React.ReactNode; searchApi?: string; extra?: React.ReactNode;
  /** Where Home goes (the books homepage; the diary home for the diary); and whether the list of all books is offered. */
  home?: { href: string; label: string }; library?: boolean;
}) {
  const router = useRouter();
  const [s, setS] = useState<ReaderSettings>(DEF); const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<null | "contents" | "marks" | "search" | "books">(null);
  const [pop, setPop] = useState<null | "all">(null); const [canFull, setCanFull] = useState(false); useEffect(() => { setCanFull(!!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)); }, []); const [help, setHelp] = useState(false);
  const [barHidden, setBarHidden] = useState(false); const [pct, setPct] = useState(0); const [full, setFull] = useState(false);
  const [marks, setMarks] = useState<Mark[]>([]);
  const scroller = useRef<HTMLDivElement>(null); const pager = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0); const [pages, setPages] = useState(1);
  const hasPar = translations.length > 1;
  const mode: Mode = s.mode === "parallel" && !parallel ? "classic" : s.mode;
  const T = THEMES[s.theme] || THEMES.light;
  const dark = s.theme === "dusk" || s.theme === "dark" || s.theme === "slate";
  const touch = useRef<number | null>(null); const [flip, setFlip] = useState(false);

  useLayoutEffect(() => { setS(loadSettings()); setReady(true); }, []);
  const set = useCallback((p: Partial<ReaderSettings>) => setS((o) => { const x = { ...o, ...p }; saveSettings(x); return x; }), []);
  useEffect(() => { try { setMarks(JSON.parse(localStorage.getItem("tj_marks") || "[]")); } catch {} }, []);
  // remember where the reader is
  useEffect(() => { try { const last = { href: chapter.href, title: chapter.title, book: book.title, slug: book.slug, cover: book.cover || null, at: Date.now(), index: chapter.index, total: chapter.total }; localStorage.setItem(`tj_last_${book.slug}`, JSON.stringify(last)); const all = JSON.parse(localStorage.getItem("tj_last_books") || "[]").filter((x: any) => x.slug !== book.slug); localStorage.setItem("tj_last_books", JSON.stringify([last, ...all].slice(0, 12))); } catch {} }, [book, chapter]);
  // choosing "Side by side" needs a second language in the address
  useEffect(() => { if (!ready) return; if (s.mode === "parallel" && !parallel && hasPar) { const other = translations.find((t) => !t.current); if (other) router.replace(`${chapter.href}?with=${other.slug}`, { scroll: false }); } }, [ready, s.mode, parallel, hasPar, translations, chapter.href, router]);

  // progress + hide the bar while reading down (Focus)
  useEffect(() => {
    const el = scroller.current; if (!el || mode === "pages") return; let last = 0;
    const f = () => { const y = el.scrollTop; setPct(Math.min(100, (y / Math.max(1, el.scrollHeight - el.clientHeight)) * 100)); if (mode === "focus") setBarHidden(y > 80 && y > last); last = y; try { sessionStorage.setItem(`tj_pos_${chapter.href}`, String(y)); } catch {} };
    el.addEventListener("scroll", f, { passive: true }); return () => el.removeEventListener("scroll", f);
  }, [mode, chapter.href]);
  useEffect(() => { const el = scroller.current; if (!el) return; try { const y = Number(sessionStorage.getItem(`tj_pos_${chapter.href}`) || 0); el.scrollTop = y; } catch {} if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); }, [chapter.href, ready]);
  useEffect(() => { if (mode !== "focus") setBarHidden(false); }, [mode]);

  // Pages reader: CSS columns, moved one page at a time
  const [two, setTwo] = useState(false); const gap = two ? 112 : 56;
  useEffect(() => { const f = () => setTwo(window.innerWidth >= 1024); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const measure = useCallback(() => { const el = pager.current; if (!el) return; const step = el.clientWidth + gap; const n = Math.max(1, Math.round((el.scrollWidth + gap) / step)); setPages(n); setPage((p) => Math.min(p, n - 1)); }, [gap]);
  useEffect(() => { if (mode !== "pages") return; measure(); const r = new ResizeObserver(measure); if (pager.current) r.observe(pager.current); document.fonts?.ready.then(measure); return () => r.disconnect(); }, [mode, measure, s.size, s.leading, s.width, s.font, two]);
  useEffect(() => { const el = pager.current; if (mode !== "pages" || !el) return; el.scrollTo({ left: page * (el.clientWidth + gap), behavior: "instant" as ScrollBehavior }); setPct(pages > 1 ? (page / (pages - 1)) * 100 : 100); }, [page, pages, mode, gap]);
  useEffect(() => { if (mode === "pages") { try { if (sessionStorage.getItem("tj_from_next") === "1") { sessionStorage.removeItem("tj_from_next"); setTimeout(() => setPage(Math.max(0, pages - 1)), 50); } } catch {} } }, [mode, pages]);
  const turn = useCallback((d: number) => {
    if (mode !== "pages") { const h = d > 0 ? next?.href : prev?.href; if (h) router.push(h + (parallel ? `?with=${parallel.slug}` : "")); return; }
    const go = (n: number) => { setFlip(true); setTimeout(() => { setPage(n); setFlip(false); }, 140); };
    if (d > 0) { if (page < pages - 1) go(page + 1); else if (next) router.push(next.href); }
    else { if (page > 0) go(page - 1); else if (prev) { try { sessionStorage.setItem("tj_from_next", "1"); } catch {} router.push(prev.href); } }
  }, [mode, page, pages, next, prev, router, parallel]);

  const marked = marks.some((m) => m.href === chapter.href);
  const toggleMark = useCallback(() => setMarks((o) => { const x = o.some((m) => m.href === chapter.href) ? o.filter((m) => m.href !== chapter.href) : [{ href: chapter.href, title: chapter.title, book: book.title, at: Date.now() }, ...o]; try { localStorage.setItem("tj_marks", JSON.stringify(x)); } catch {} return x; }), [chapter, book.title]);
  const toggleFull = useCallback(() => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); }, []);
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);

  // keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (t.closest("input, textarea, select, [contenteditable=true]")) { if (e.key === "Escape") (t as HTMLInputElement).blur(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key; const el = scroller.current;
      const act: Record<string, () => void> = {
        ArrowRight: () => turn(1), ArrowLeft: () => turn(-1),
        " ": () => { if (mode === "pages") turn(e.shiftKey ? -1 : 1); else el?.scrollBy({ top: (e.shiftKey ? -1 : 1) * (el.clientHeight - 80), behavior: "smooth" }); },
        j: () => el?.scrollBy({ top: 90, behavior: "smooth" }), k: () => el?.scrollBy({ top: -90, behavior: "smooth" }),
        ArrowDown: () => mode === "pages" ? turn(1) : el?.scrollBy({ top: 60 }), ArrowUp: () => mode === "pages" ? turn(-1) : el?.scrollBy({ top: -60 }),
        Home: () => mode === "pages" ? setPage(0) : el?.scrollTo({ top: 0 }), End: () => mode === "pages" ? setPage(pages - 1) : el?.scrollTo({ top: el.scrollHeight }),
        "1": () => set({ mode: "classic" }), "2": () => set({ mode: "focus" }), "3": () => set({ mode: "pages" }), "4": () => set({ mode: "sheet" }), "5": () => hasPar && set({ mode: "parallel" }),
        c: () => setPanel((p) => (p === "contents" ? null : "contents")), "/": () => setPanel("search"), s: () => setPanel("search"),
        a: () => setPop((p) => (p ? null : "all")), l: () => hasPar && setPop((p) => (p ? null : "all")), m: () => setPop((p) => (p ? null : "all")),
        "+": () => set({ size: Math.min(30, s.size + 1) }), "=": () => set({ size: Math.min(30, s.size + 1) }), "-": () => set({ size: Math.max(13, s.size - 1) }), "0": () => set({ size: DEF.size, leading: DEF.leading, width: DEF.width }),
        t: () => { const ks = Object.keys(THEMES) as Theme[]; set({ theme: ks[(ks.indexOf(s.theme) + 1) % ks.length] }); },
        b: toggleMark, f: toggleFull, "?": () => setHelp((x) => !x),
        Escape: () => { if (help) setHelp(false); else if (pop) setPop(null); else if (panel) setPanel(null); else router.push(book.href); },
      };
      const fn = act[k] || act[k.toLowerCase()]; if (fn) { e.preventDefault(); fn(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [turn, mode, pages, set, s, hasPar, toggleMark, toggleFull, help, pop, panel, router, book.href]);

  const textStyle: React.CSSProperties = { fontFamily: FONTS[s.font][1], fontSize: s.size, lineHeight: s.leading, textAlign: s.justify ? "justify" : undefined, hyphens: s.justify ? "auto" : undefined };
  const heading = (title: string, lang?: string) => (
    <header className="mb-10 font-sans" style={{ textAlign: "left", hyphens: "manual" }}>
      <p className="text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color: T.muted }}>{chapter.label} {chapter.num}{lang ? ` · ${lang}` : ""}</p>
      <h1 className="mt-2 text-[1.6em] font-semibold leading-[1.2] tracking-[-0.015em]" style={{ fontFamily: FONTS[s.font][1], textAlign: "left", textWrap: "balance", wordSpacing: "normal" } as React.CSSProperties}>{title}</h1>
    </header>
  );
  const end = (
    <nav className="mt-16 grid gap-2 border-t pt-6 font-sans sm:grid-cols-2" style={{ borderColor: T.line }}>
      {prev ? <Link href={prev.href + (parallel ? `?with=${parallel.slug}` : "")} className="group rounded-lg border p-3.5 transition hover:opacity-80" style={{ borderColor: T.line }}><span className="flex items-center gap-1 text-[11.5px]" style={{ color: T.muted }}><ChevronLeft size={13} />Previous</span><span className="mt-0.5 block truncate text-[14px] font-medium">{prev.title}</span></Link> : <span />}
      {next && <Link href={next.href + (parallel ? `?with=${parallel.slug}` : "")} className="group rounded-lg border p-3.5 text-right transition hover:opacity-80" style={{ borderColor: T.line }}><span className="flex items-center justify-end gap-1 text-[11.5px]" style={{ color: T.muted }}>Next<ChevronRight size={13} /></span><span className="mt-0.5 block truncate text-[14px] font-medium">{next.title}</span></Link>}
    </nav>
  );

  const desk = dark ? `color-mix(in srgb, ${T.bg} 70%, #000)` : `color-mix(in srgb, ${T.bg} 90%, #6b4a1c)`;
  const icon = "flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9 transition hover:bg-black/[0.06] [.rd-dark_&]:hover:bg-white/10";

  return (
    <div className={`rd fixed inset-0 z-[70] flex flex-col ${dark ? "rd-dark" : ""}`} style={{ background: T.bg, color: T.ink, ["--rd-ink" as any]: T.ink, ["--rd-muted" as any]: T.muted, ["--rd-line" as any]: T.line, ["--rd-bg" as any]: T.bg, visibility: ready ? "visible" : "hidden" }}>
      <link rel="stylesheet" href={FONT_CSS} precedence="default" />
      {/* top bar */}
      <div className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ${barHidden ? "-translate-y-full" : ""}`} onMouseEnter={() => setBarHidden(false)}>
        <div className="relative flex h-12 items-center gap-1 border-b px-2 backdrop-blur-xl backdrop-saturate-150 sm:px-3" style={{ background: T.panel, borderColor: T.line }}>
          <Link href={home.href} className={icon} title={`${home.label} (Esc)`} aria-label={home.label}><Home size={17} /></Link>
          <button onClick={() => setPanel(panel === "contents" ? null : "contents")} className={icon} title="Contents (C)"><List size={17} /></button>
          {library && <button onClick={() => setPanel(panel === "books" ? null : "books")} className={icon} title="All books — go to another book" aria-label="All books"><Library size={17} /></button>}
          {/* the title sits over the centre of the text being read (beside the contents column when it is open) */}
          <div className={`flex min-w-0 flex-1 flex-col justify-center px-1.5 text-left font-sans leading-tight sm:pointer-events-none sm:absolute sm:inset-y-0 sm:left-1/2 sm:w-[calc(100%-300px)] sm:max-w-[560px] sm:flex-none sm:-translate-x-1/2 sm:items-center sm:px-0 sm:text-center ${mode === "classic" && s.sidebar ? "lg:left-[calc(50%+145px)] lg:w-[calc(100%-290px-300px)]" : ""}`}>
            <p className="w-full truncate text-[11.5px]" style={{ color: T.muted }}>{book.title}</p>
            <p className="w-full truncate text-[13px] font-medium">{chapter.title}</p>
          </div>
          <span className="hidden flex-1 sm:block" />
          <button onClick={() => setPanel(panel === "search" ? null : "search")} className={icon} title="Search in this book (/)" aria-label="Search"><Search size={17} /></button>
          <button onClick={toggleMark} className={icon} title="Bookmark (B)" aria-label="Bookmark" aria-pressed={marked}>{marked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
          {canFull && <button onClick={toggleFull} className={icon} title="Full screen (F)" aria-label="Full screen">{full ? <Minimize size={17} /> : <Maximize size={17} />}</button>}
          <div className="relative"><button onClick={() => setPop(pop === "all" ? null : "all")} className={icon} title="Settings (A)" aria-label="Settings"><Settings2 size={17} /></button>{pop === "all" && <Pop T={T} onClose={() => setPop(null)} wide>
            <div className="max-h-[calc(100dvh-90px)] overflow-y-auto overscroll-contain">
              <div className="flex items-center gap-2 px-1 pt-1"><span className="flex-1 text-[12px] font-medium" style={{ color: T.muted }}>Text size</span>
                <button onClick={() => set({ size: Math.max(13, s.size - 1) })} className={`${icon} border text-[13px] font-semibold`} style={{ borderColor: T.line }} aria-label="Smaller text">A−</button><span className="w-7 text-center text-[12.5px] tabular-nums">{s.size}</span><button onClick={() => set({ size: Math.min(30, s.size + 1) })} className={`${icon} border text-[16px] font-semibold`} style={{ borderColor: T.line }} aria-label="Larger text">A+</button></div>
              <div className="mt-2 grid gap-1 border-y py-1.5 max-sm:hidden" style={{ borderColor: T.line }}>
                {([[Keyboard, "Keyboard shortcuts", () => { setPop(null); setHelp(true); }]] as [any, string, () => void][]).map(([I, l, f]) => <button key={l} onClick={f} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><I size={16} />{l}</button>)}
              </div>
              <p className="px-2 pb-1 pt-3 text-[11.5px] font-medium" style={{ color: T.muted }}>Reader</p>
              {MODES.map(([k, l, d, I]) => { const off = k === "parallel" && !hasPar; return <button key={k} disabled={off} onClick={() => set({ mode: k })} className="flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left hover:bg-black/5 disabled:opacity-40 [.rd-dark_&]:hover:bg-white/10"><I size={16} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium">{l}</span><span className="block text-[11.5px]" style={{ color: T.muted }}>{off ? "When this book has another language" : d}</span></span>{mode === k && <Check size={14} className="mt-1" />}</button>; })}
              {hasPar && <><p className="px-2 pb-1 pt-3 text-[11.5px] font-medium" style={{ color: T.muted }}>Read this book in</p>
                {translations.map((t) => <Link key={t.slug} href={t.href} onClick={() => setPop(null)} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><span>{t.native}<span className="ml-1.5 text-[11.5px]" style={{ color: T.muted }}>{t.language}</span></span>{t.current && <Check size={14} />}</Link>)}
                <p className="px-2 pb-1 pt-2 text-[11.5px] font-medium" style={{ color: T.muted }}>Side by side with</p>
                {translations.filter((t) => !t.current).map((t) => <button key={t.slug} onClick={() => { set({ mode: "parallel" }); setPop(null); router.replace(`${chapter.href}?with=${t.slug}`, { scroll: false }); }} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10">{t.native}{parallel?.slug === t.slug && <Check size={14} />}</button>)}</>}
              <div className="mt-2 border-t pt-1" style={{ borderColor: T.line }}><TextSettings s={s} set={set} T={T} /></div>
            </div>
          </Pop>}</div>
        </div>
        <div className="h-[2px]"><div className="h-full transition-[width] duration-150" style={{ width: `${pct}%`, background: T.ink, opacity: 0.55 }} /></div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        {mode === "classic" && s.sidebar && <aside className="hidden w-[290px] shrink-0 overflow-y-auto border-r pb-10 pt-16 font-sans [scrollbar-width:thin] lg:block" style={{ borderColor: T.line }}><Contents toc={toc} current={chapter.id} T={T} suffix={parallel ? `?with=${parallel.slug}` : ""} /></aside>}

        {mode === "pages" ? (
          <div className="relative flex min-w-0 flex-1 flex-col pt-14" style={{ background: desk }}>
            <div className="relative mx-auto min-h-0 w-full flex-1 px-2 py-3 sm:px-6 sm:py-6" onClick={(e) => { if ((e.target as HTMLElement).closest("a, button")) return; const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; if (x < 0.25) turn(-1); else if (x > 0.75) turn(1); }} onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1); }} style={{ maxWidth: two ? s.width * 2 + 200 : s.width + 80 }}>
              {/* the open book: paper, a fine inner rule, the fold between facing pages, page numbers at the foot */}
              <div className="relative h-full overflow-hidden rounded-[5px] shadow-[0_26px_60px_-30px_rgba(30,15,0,.55),0_0_0_1px_rgba(0,0,0,.05)]" style={{ background: T.bg }}>
                {two && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-16 -translate-x-1/2" style={{ background: dark ? "linear-gradient(90deg,transparent,rgba(0,0,0,.4),transparent)" : "linear-gradient(90deg,transparent,rgba(80,50,15,.12) 47%,rgba(80,50,15,.2) 50%,rgba(80,50,15,.12) 53%,transparent)" }} />}
                <span aria-hidden className="pointer-events-none absolute inset-3 z-10 rounded-[3px] border sm:inset-4" style={{ borderColor: T.line }} />
                <div className={`h-full px-7 pb-12 pt-10 sm:px-12 sm:pt-12 transition-opacity duration-200 ${flip ? "opacity-0" : "opacity-100"}`}>
                  <div ref={pager} className="rd-text h-full overflow-hidden" style={{ ...textStyle, columnCount: two ? 2 : 1, columnGap: gap, columnFill: "auto" }}>
                    {heading(chapter.title)}{children}
                  </div>
                </div>
                <span className="absolute bottom-5 left-0 z-10 w-1/2 text-center font-sans text-[11px] tabular-nums sm:bottom-6" style={{ color: T.muted, width: two ? "50%" : "100%" }}>{two ? page * 2 + 1 : page + 1}</span>
                {two && page * 2 + 2 <= pages * 2 && <span className="absolute bottom-5 right-0 z-10 w-1/2 text-center font-sans text-[11px] tabular-nums sm:bottom-6" style={{ color: T.muted }}>{page * 2 + 2}</span>}
              </div>
            </div>
            <div className="flex h-11 items-center justify-between gap-3 px-4 font-sans text-[12px]" style={{ color: T.muted }}>
              <button onClick={() => turn(-1)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><ChevronLeft size={15} /><span className="max-sm:hidden">{page === 0 && prev ? "Previous chapter" : "Previous page"}</span></button>
              <span className="tabular-nums">{two ? `Pages ${page * 2 + 1}–${page * 2 + 2} of ${pages * 2}` : `Page ${page + 1} of ${pages}`}<span className="max-sm:hidden"> · Chapter {chapter.index + 1} of {chapter.total}</span></span>
              <button onClick={() => turn(1)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><span className="max-sm:hidden">{page >= pages - 1 && next ? "Next chapter" : "Next page"}</span><ChevronRight size={15} /></button>
            </div>
          </div>
        ) : mode === "sheet" ? (
          <div ref={scroller} className="min-w-0 flex-1 overflow-y-auto px-2 [scrollbar-width:thin] sm:px-6" style={{ background: desk }}>
            <article className="rd-text relative mx-auto mb-16 mt-16 rounded-[5px] px-6 pb-14 pt-12 shadow-[0_26px_60px_-30px_rgba(30,15,0,.5),0_0_0_1px_rgba(0,0,0,.05)] sm:mt-20 sm:px-14 sm:pt-16" style={{ ...textStyle, maxWidth: s.width + 140, background: T.bg }}>
              <span aria-hidden className="pointer-events-none absolute inset-3 rounded-[3px] border sm:inset-4" style={{ borderColor: T.line }} />
              {heading(chapter.title)}{children}{extra}{end}
            </article>
          </div>
        ) : (
          <div ref={scroller} className="min-w-0 flex-1 overflow-y-auto scroll-smooth [scrollbar-width:thin]">
            {mode === "parallel" && parallel ? (
              <div className="mx-auto grid max-w-[1400px] gap-x-14 px-5 pb-24 pt-20 md:grid-cols-2 sm:px-10">
                <article className="rd-text min-w-0" style={{ ...textStyle, fontSize: Math.max(14, s.size - 2) }}>{heading(chapter.title, translations.find((t) => t.current)?.native)}{children}</article>
                <article className="rd-text min-w-0 border-t pt-10 md:border-l md:border-t-0 md:pl-14 md:pt-0" style={{ ...textStyle, fontSize: Math.max(14, s.size - 2), borderColor: T.line }}>{heading(parallel.title, parallel.native)}{parallel.node}</article>
                <div className="md:col-span-2">{end}</div>
              </div>
            ) : (
              <article className="rd-text mx-auto px-5 pb-24 pt-20 sm:px-8" style={{ ...textStyle, maxWidth: s.width + 64 }}>{heading(chapter.title)}{children}{extra}{end}</article>
            )}
          </div>
        )}
      </div>

      {/* side sheet: contents, bookmarks, search */}
      {panel && <div className="absolute inset-0 z-30 bg-black/20" onClick={() => setPanel(null)}>
        <aside className="flex h-full w-[92%] max-w-[380px] flex-col border-r font-sans shadow-2xl backdrop-blur-2xl backdrop-saturate-150" style={{ background: T.panel, borderColor: T.line }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 border-b px-3 py-2" style={{ borderColor: T.line }}>
            {([["contents", "Contents"], ...(library ? [["books", "Books"]] : []), ["marks", "Bookmarks"], ["search", "Search"]] as [typeof panel & string, string][]).map(([k, l]) => <button key={k} onClick={() => setPanel(k)} className={`rounded-md px-2.5 py-1.5 text-[13px] ${panel === k ? "bg-black/[0.07] font-medium [.rd-dark_&]:bg-white/10" : ""}`} style={panel === k ? undefined : { color: T.muted }}>{l}</button>)}
            <button onClick={() => setPanel(null)} className={`${icon} ml-auto`}><X size={16} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            {panel === "contents" && <><Link href={book.href} className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: T.line }}>{book.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover} alt="" className="h-14 w-10 rounded-sm object-cover shadow" />}<span className="min-w-0"><span className="block truncate text-[14px] font-semibold">{book.title}</span><span className="text-[12px]" style={{ color: T.muted }}>{chapter.total} chapters · {Math.round(((chapter.index + 1) / chapter.total) * 100)}% through</span></span></Link><Contents toc={toc} current={chapter.id} T={T} onGo={() => setPanel(null)} suffix={parallel ? `?with=${parallel.slug}` : ""} /></>}
            {panel === "marks" && <div className="p-3">{marks.length ? marks.map((m) => <div key={m.href} className="group flex items-start gap-2 rounded-md px-2 py-2 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><Link href={m.href} onClick={() => setPanel(null)} className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium">{m.title}</span><span className="block truncate text-[12px]" style={{ color: T.muted }}>{m.book} · {new Date(m.at).toLocaleDateString()}</span></Link><button onClick={() => { const x = marks.filter((y) => y.href !== m.href); setMarks(x); try { localStorage.setItem("tj_marks", JSON.stringify(x)); } catch {} }} className="opacity-0 group-hover:opacity-60"><X size={14} /></button></div>) : <p className="px-2 py-8 text-center text-[13px]" style={{ color: T.muted }}>No bookmarks yet. Press <kbd>B</kbd> on any chapter.</p>}</div>}
            {panel === "books" && <AllBooks T={T} current={book.slug} onGo={() => setPanel(null)} />}
            {panel === "search" && <BookSearch api={searchApi || `/api/books/search?book=${book.slug}&q=`} T={T} onGo={() => setPanel(null)} />}
          </div>
          <div className="border-t px-4 py-2.5 text-[11.5px]" style={{ borderColor: T.line, color: T.muted }}>Press <kbd className="rounded border px-1" style={{ borderColor: T.line }}>?</kbd> for keyboard shortcuts</div>
        </aside>
      </div>}

      {help && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4" onClick={() => setHelp(false)}>
        <div className="w-full max-w-[460px] rounded-xl border p-5 font-sans shadow-2xl backdrop-blur-2xl" style={{ background: T.panel, borderColor: T.line }} onClick={(e) => e.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between"><p className="text-[15px] font-semibold">Keyboard shortcuts</p><button onClick={() => setHelp(false)} className={icon}><X size={16} /></button></div>
          <div className="grid gap-y-1.5">{SHORTCUTS.map(([k, d]) => <div key={k} className="flex items-center justify-between gap-4 text-[13px]"><span style={{ color: T.muted }}>{d}</span><span className="flex gap-1">{k.split(/\s{2}|\s(?=\S)/).filter(Boolean).map((x) => <kbd key={x} className="min-w-[24px] rounded border px-1.5 py-0.5 text-center text-[11.5px]" style={{ borderColor: T.line }}>{x}</kbd>)}</span></div>)}</div>
        </div>
      </div>}
    </div>
  );
}

/* ------------------------------------------------------------------ parts */
function Pop({ children, onClose, T, wide }: { children: React.ReactNode; onClose: () => void; T: (typeof THEMES)[Theme]; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest("button")) onClose(); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [onClose]);
  return <div ref={ref} className={`absolute right-0 top-11 z-40 rounded-xl border p-2 font-sans shadow-[0_16px_50px_-12px_rgba(0,0,0,0.35)] ${wide ? "w-[300px]" : "w-[240px]"}`} style={{ background: T.bg, borderColor: T.line }}>{children}</div>;
}

function TextSettings({ s, set, T }: { s: ReaderSettings; set: (p: Partial<ReaderSettings>) => void; T: (typeof THEMES)[Theme] }) {
  const seg = "grid gap-1 rounded-lg p-0.5 bg-black/[0.05] [.rd-dark_&]:bg-white/[0.07]"; const on = "bg-white text-[#1c1c1c] shadow-sm"; const lab = "mb-1.5 mt-3 px-1 text-[11.5px] font-medium first:mt-1";
  return (
    <div className="p-1">
      <p className={lab} style={{ color: T.muted }}>Colour</p>
      <div className="grid grid-cols-3 gap-1.5">{(Object.keys(THEMES) as Theme[]).map((k) => <button key={k} onClick={() => set({ theme: k })} className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[11.5px] ${s.theme === k ? "ring-2 ring-current" : ""}`} style={{ borderColor: T.line }}><span className="h-6 w-full rounded border" style={{ background: THEMES[k].swatch, borderColor: "rgba(0,0,0,0.12)", color: THEMES[k].ink }}><span className="text-[12px] font-semibold" style={{ fontFamily: "Georgia, serif" }}>Aa</span></span>{THEMES[k].label}</button>)}</div>
      <p className={lab} style={{ color: T.muted }}>Font</p>
      <div className={`${seg} grid-cols-2`}>{(Object.keys(FONTS) as FontK[]).map((k) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md px-2 py-1.5 text-[13.5px] ${s.font === k ? on : ""}`} style={{ fontFamily: FONTS[k][1] }}>{FONTS[k][0]}</button>)}</div>
      <p className={lab} style={{ color: T.muted }}>Size</p>
      <div className="flex items-center gap-2"><button onClick={() => set({ size: Math.max(13, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border" style={{ borderColor: T.line }}><Minus size={14} /></button><input type="range" min={13} max={30} value={s.size} onChange={(e) => set({ size: Number(e.target.value) })} className="flex-1 accent-current" /><button onClick={() => set({ size: Math.min(30, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border" style={{ borderColor: T.line }}><Plus size={14} /></button><span className="w-7 text-right text-[12px] tabular-nums">{s.size}</span></div>
      <p className={lab} style={{ color: T.muted }}>Line spacing</p>
      <div className={`${seg} grid-cols-3`}>{([[1.5, "Compact"], [1.75, "Normal"], [2.05, "Relaxed"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ leading: v })} className={`rounded-md px-2 py-1 text-[12.5px] ${s.leading === v ? on : ""}`}>{l}</button>)}</div>
      <p className={lab} style={{ color: T.muted }}>Page width</p>
      <div className={`${seg} grid-cols-3`}>{([[580, "Narrow"], [680, "Normal"], [820, "Wide"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ width: v })} className={`rounded-md px-2 py-1 text-[12.5px] ${s.width === v ? on : ""}`}>{l}</button>)}</div>
      <div className="mt-3 flex items-center justify-between px-1 text-[12.5px]">
        <label className="flex items-center gap-2"><input type="checkbox" checked={s.justify} onChange={(e) => set({ justify: e.target.checked })} />Justify text</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={s.sidebar} onChange={(e) => set({ sidebar: e.target.checked })} />Contents beside</label>
      </div>
      <button onClick={() => set({ size: DEF.size, leading: DEF.leading, width: DEF.width, font: DEF.font, justify: false })} className="mt-3 w-full rounded-md py-1.5 text-[12px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10" style={{ color: T.muted }}>Reset text</button>
    </div>
  );
}

function Contents({ toc, current, T, onGo, suffix = "" }: { toc: TocItem[]; current: string; T: (typeof THEMES)[Theme]; onGo?: () => void; suffix?: string }) {
  const kids = useMemo(() => { const m: Record<string, TocItem[]> = {}; toc.forEach((t) => (m[t.parent || ""] ||= []).push(t)); return m; }, [toc]);
  const chain = useMemo(() => { const by = Object.fromEntries(toc.map((t) => [t.id, t])); const out = new Set<string>(); let c = by[current]; while (c) { out.add(c.id); c = c.parent ? by[c.parent] : (undefined as any); } return out; }, [toc, current]);
  const [open, setOpen] = useState<Set<string>>(chain);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector("[data-current]")?.scrollIntoView({ block: "center" }); }, []);
  const row = (t: TocItem): React.ReactNode => { const ch = kids[t.id] || []; const o = open.has(t.id); const cur = t.id === current; return (
    <li key={t.id}>
      <div className={`flex items-start rounded-md ${cur ? "bg-black/[0.07] [.rd-dark_&]:bg-white/10" : "hover:bg-black/[0.04] [.rd-dark_&]:hover:bg-white/[0.06]"}`} {...(cur ? { "data-current": "" } : {})}>
        <button onClick={() => setOpen((s) => { const x = new Set(s); x.has(t.id) ? x.delete(t.id) : x.add(t.id); return x; })} className={`mt-[7px] flex size-5 shrink-0 items-center justify-center ${ch.length ? "" : "invisible"}`} style={{ color: T.muted }}><ChevronDown size={13} className={o ? "" : "-rotate-90"} /></button>
        <Link href={t.href + suffix} onClick={onGo} className={`flex min-w-0 flex-1 gap-2 py-1.5 pr-2 text-[13px] leading-snug ${cur ? "font-medium" : ""}`}><span className="w-6 shrink-0 text-right text-[11px] tabular-nums" style={{ color: T.muted, paddingTop: 1 }}>{t.num}</span><span className={t.depth ? "" : "font-medium"} style={t.depth && !cur ? { opacity: 0.85 } : undefined}>{t.title}</span></Link>
      </div>
      {o && ch.length > 0 && <ol className="ml-[22px] border-l pl-1" style={{ borderColor: T.line }}>{ch.map(row)}</ol>}
    </li>); };
  return <div ref={ref} className="px-2 py-2"><ol>{(kids[""] || []).map(row)}</ol></div>;
}

function BookSearch({ api, T, onGo }: { api: string; T: (typeof THEMES)[Theme]; onGo: () => void }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState<{ title: string; href: string; snippet: string; hits: number }[] | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (q.trim().length < 2) { setRes(null); return; } setBusy(true); const h = setTimeout(() => fetch(`${api}${encodeURIComponent(q.trim())}`).then((r) => r.json()).then(setRes).catch(() => setRes([])).finally(() => setBusy(false)), 250); return () => clearTimeout(h); }, [q, api]);
  const mark = (t: string) => { const w = q.trim(); if (!w) return t; const i = t.toLowerCase().indexOf(w.toLowerCase()); return i < 0 ? t : <>{t.slice(0, i)}<mark className="rounded-sm bg-yellow-300/70 px-0.5 text-inherit">{t.slice(i, i + w.length)}</mark>{t.slice(i + w.length)}</>; };
  return (
    <div className="p-3">
      <label className="relative block"><Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find words" className="h-9 w-full rounded-md border bg-transparent pl-8 pr-8 text-[13.5px] outline-none" style={{ borderColor: T.line }} />{busy && <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin" />}</label>
      {res && <p className="mt-3 px-1 text-[12px]" style={{ color: T.muted }}>{res.length ? `Found in ${res.length} ${res.length === 1 ? "chapter" : "chapters"}` : "Not found in this book."}</p>}
      <div className="mt-1">{res?.map((r) => <Link key={r.href} href={r.href} onClick={onGo} className="block rounded-md px-2 py-2 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><span className="flex justify-between gap-2 text-[13px] font-medium"><span className="truncate">{r.title}</span><span className="shrink-0 text-[11.5px] font-normal" style={{ color: T.muted }}>{r.hits}×</span></span><span className="mt-0.5 line-clamp-3 block text-[12.5px] leading-relaxed" style={{ color: T.muted }}>{mark(r.snippet)}</span></Link>)}</div>
    </div>
  );
}

/** Every book of the library, by shelf, with a search: to go straight from one book to another. */
function AllBooks({ T, current, onGo }: { T: (typeof THEMES)[Theme]; current: string; onGo: () => void }) {
  const [all, setAll] = useState<{ slug: string; title: string; cover: string | null; first: string | null; shelf: string; language: string; library: string }[] | null>(null); const [q, setQ] = useState("");
  useEffect(() => { fetch("/api/books/list").then((r) => r.json()).then(setAll).catch(() => setAll([])); }, []);
  const fold = (x: string) => x.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); const f = fold(q.trim());
  const shown = (all || []).filter((b) => !f || fold(`${b.title} ${b.shelf}`).includes(f)); const shelves = [...new Set(shown.map((b) => b.shelf))];
  return (
    <div className="p-3">
      <label className="relative block"><Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a book" className="h-9 w-full rounded-md border bg-transparent pl-8 pr-3 text-[13.5px] outline-none" style={{ borderColor: T.line }} /></label>
      {!all ? <p className="flex items-center gap-2 px-2 py-6 text-[13px]" style={{ color: T.muted }}><Loader2 size={14} className="animate-spin" />Loading…</p> : !shown.length ? <p className="px-2 py-6 text-[13px]" style={{ color: T.muted }}>No book has that in its title.</p> :
        shelves.map((sh) => <div key={sh} className="mt-3"><p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: T.muted }}>{sh}</p>
          {shown.filter((b) => b.shelf === sh).map((b) => <Link key={b.slug} href={b.first ? `/books/${b.slug}/${b.first}` : `/books/${b.slug}`} onClick={onGo} className={`flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10 ${b.slug === current ? "bg-black/[0.06] [.rd-dark_&]:bg-white/10" : ""}`}>
            <span className="flex h-11 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[2px_4px_4px_2px] bg-gradient-to-br from-[#5a3418] to-[#2d1a0c] text-[10px] text-white/80">{b.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover} alt="" className="h-full w-full object-cover" loading="lazy" /> : b.title.charAt(0)}</span>
            <span className="min-w-0 flex-1"><span className="line-clamp-2 text-[13.5px] leading-snug">{b.title}</span><span className="text-[11px] uppercase" style={{ color: T.muted }}>{b.language}{b.slug === current ? " · reading now" : ""}</span></span></Link>)}</div>)}
    </div>);
}
