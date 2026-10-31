"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, List, Search, Type, BookOpen, Columns2, Bookmark, BookmarkCheck, Maximize, Minimize, Keyboard, ChevronLeft, ChevronRight, X, Languages, PanelLeft, Focus, BookOpenText, Minus, Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import type { TocItem } from "@/lib/content/books-public";

/* ------------------------------------------------------------------ settings */
type Mode = "classic" | "focus" | "pages" | "parallel";
type Theme = "light" | "sepia" | "dusk" | "dark";
type FontK = "literata" | "gentium" | "noto" | "sans";
export type ReaderSettings = { mode: Mode; theme: Theme; font: FontK; size: number; leading: number; width: number; justify: boolean; sidebar: boolean };
const DEF: ReaderSettings = { mode: "classic", theme: "light", font: "literata", size: 19, leading: 1.75, width: 680, justify: false, sidebar: true };
const KEY = "tj_reader_v2";
export const loadSettings = (): ReaderSettings => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEF; } };
export const saveSettings = (s: Partial<ReaderSettings>) => { try { localStorage.setItem(KEY, JSON.stringify({ ...loadSettings(), ...s })); } catch {} };

const DEV = '"Noto Serif Devanagari", "Noto Sans Devanagari"';
const FONTS: Record<FontK, [string, string]> = {
  literata: ["Literata", `"Literata", ${DEV}, Georgia, serif`],
  gentium: ["Gentium", `"Gentium Book Plus", ${DEV}, Georgia, serif`],
  noto: ["Noto Serif", `"Noto Serif", ${DEV}, Georgia, serif`],
  sans: ["Inter", `var(--font-sans), "Noto Sans Devanagari", system-ui, sans-serif`],
};
const THEMES: Record<Theme, { label: string; bg: string; ink: string; muted: string; line: string; panel: string; swatch: string }> = {
  light: { label: "White", bg: "#ffffff", ink: "#1c1c1c", muted: "#7a7a7a", line: "rgba(0,0,0,0.08)", panel: "rgba(255,255,255,0.78)", swatch: "#ffffff" },
  sepia: { label: "Sepia", bg: "#f7f0e2", ink: "#3a2e20", muted: "#8c7a62", line: "rgba(58,46,32,0.12)", panel: "rgba(247,240,226,0.8)", swatch: "#f2e7d0" },
  dusk: { label: "Dusk", bg: "#2a2826", ink: "#e6dfd3", muted: "#a49c90", line: "rgba(255,255,255,0.1)", panel: "rgba(42,40,38,0.78)", swatch: "#3a3734" },
  dark: { label: "Night", bg: "#111111", ink: "#cfcbc4", muted: "#8a8680", line: "rgba(255,255,255,0.09)", panel: "rgba(17,17,17,0.78)", swatch: "#111111" },
};
const MODES: [Mode, string, string, any][] = [
  ["classic", "Classic", "Contents beside the text", PanelLeft],
  ["focus", "Focus", "Only the text, nothing else", Focus],
  ["pages", "Pages", "Turn pages like a printed book", BookOpenText],
  ["parallel", "Side by side", "Two languages together", Columns2],
];
const SHORTCUTS: [string, string][] = [["← →", "Previous / next page or chapter"], ["Space", "Next page (Pages reader)"], ["J  K", "Scroll down / up"], ["1 2 3 4", "Classic, Focus, Pages, Side by side"], ["C", "Contents"], ["/", "Search in this book"], ["A", "Text settings"], ["+  −  0", "Bigger, smaller, reset text"], ["T", "Change colour theme"], ["L", "Language"], ["B", "Bookmark this chapter"], ["F", "Full screen"], ["?", "These shortcuts"], ["Esc", "Close / leave reader"]];

type Nav = { href: string; title: string } | null;
type Tr = { slug: string; title: string; language: string; native: string; href: string; current: boolean };
type Mark = { href: string; title: string; book: string; at: number };

/* ------------------------------------------------------------------ reader */
export function Reader({ book, chapter, toc, prev, next, translations, parallel, children, searchApi, extra }: {
  book: { slug: string; title: string; href: string; language: string; cover?: string | null };
  chapter: { id: string; title: string; num: string; label: string; href: string; index: number; total: number };
  toc: TocItem[]; prev: Nav; next: Nav; translations: Tr[];
  parallel?: { title: string; language: string; native: string; slug: string; node: React.ReactNode } | null;
  children: React.ReactNode; searchApi?: string; extra?: React.ReactNode;
}) {
  const router = useRouter();
  const [s, setS] = useState<ReaderSettings>(DEF); const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<null | "contents" | "marks" | "search">(null);
  const [pop, setPop] = useState<null | "text" | "mode" | "lang">(null); const [help, setHelp] = useState(false);
  const [barHidden, setBarHidden] = useState(false); const [pct, setPct] = useState(0); const [full, setFull] = useState(false);
  const [marks, setMarks] = useState<Mark[]>([]);
  const scroller = useRef<HTMLDivElement>(null); const pager = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0); const [pages, setPages] = useState(1);
  const hasPar = translations.length > 1;
  const mode: Mode = s.mode === "parallel" && !parallel ? "classic" : s.mode;
  const T = THEMES[s.theme];

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
  const gap = 64;
  const measure = useCallback(() => { const el = pager.current; if (!el) return; const step = el.clientWidth + gap; const n = Math.max(1, Math.round((el.scrollWidth + gap) / step)); setPages(n); setPage((p) => Math.min(p, n - 1)); }, []);
  useEffect(() => { if (mode !== "pages") return; measure(); const r = new ResizeObserver(measure); if (pager.current) r.observe(pager.current); document.fonts?.ready.then(measure); return () => r.disconnect(); }, [mode, measure, s.size, s.leading, s.width, s.font]);
  useEffect(() => { const el = pager.current; if (mode !== "pages" || !el) return; el.scrollTo({ left: page * (el.clientWidth + gap), behavior: "instant" as ScrollBehavior }); setPct(pages > 1 ? (page / (pages - 1)) * 100 : 100); }, [page, pages, mode]);
  useEffect(() => { if (mode === "pages") { try { if (sessionStorage.getItem("tj_from_next") === "1") { sessionStorage.removeItem("tj_from_next"); setTimeout(() => setPage(Math.max(0, pages - 1)), 50); } } catch {} } }, [mode, pages]);
  const turn = useCallback((d: number) => {
    if (mode !== "pages") { const h = d > 0 ? next?.href : prev?.href; if (h) router.push(h + (parallel ? `?with=${parallel.slug}` : "")); return; }
    if (d > 0) { if (page < pages - 1) setPage(page + 1); else if (next) router.push(next.href); }
    else { if (page > 0) setPage(page - 1); else if (prev) { try { sessionStorage.setItem("tj_from_next", "1"); } catch {} router.push(prev.href); } }
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
        "1": () => set({ mode: "classic" }), "2": () => set({ mode: "focus" }), "3": () => set({ mode: "pages" }), "4": () => hasPar && set({ mode: "parallel" }),
        c: () => setPanel((p) => (p === "contents" ? null : "contents")), "/": () => setPanel("search"), s: () => setPanel("search"),
        a: () => setPop((p) => (p === "text" ? null : "text")), l: () => hasPar && setPop((p) => (p === "lang" ? null : "lang")), m: () => setPop((p) => (p === "mode" ? null : "mode")),
        "+": () => set({ size: Math.min(30, s.size + 1) }), "=": () => set({ size: Math.min(30, s.size + 1) }), "-": () => set({ size: Math.max(14, s.size - 1) }), "0": () => set({ size: DEF.size, leading: DEF.leading, width: DEF.width }),
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
    <header className="mb-10 font-sans">
      <p className="text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color: T.muted }}>{chapter.label} {chapter.num}{lang ? ` · ${lang}` : ""}</p>
      <h1 className="mt-2 text-[1.6em] font-semibold leading-[1.2] tracking-[-0.015em]" style={{ fontFamily: FONTS[s.font][1] }}>{title}</h1>
    </header>
  );
  const end = (
    <nav className="mt-16 grid gap-2 border-t pt-6 font-sans sm:grid-cols-2" style={{ borderColor: T.line }}>
      {prev ? <Link href={prev.href + (parallel ? `?with=${parallel.slug}` : "")} className="group rounded-lg border p-3.5 transition hover:opacity-80" style={{ borderColor: T.line }}><span className="flex items-center gap-1 text-[11.5px]" style={{ color: T.muted }}><ChevronLeft size={13} />Previous</span><span className="mt-0.5 block truncate text-[14px] font-medium">{prev.title}</span></Link> : <span />}
      {next && <Link href={next.href + (parallel ? `?with=${parallel.slug}` : "")} className="group rounded-lg border p-3.5 text-right transition hover:opacity-80" style={{ borderColor: T.line }}><span className="flex items-center justify-end gap-1 text-[11.5px]" style={{ color: T.muted }}>Next<ChevronRight size={13} /></span><span className="mt-0.5 block truncate text-[14px] font-medium">{next.title}</span></Link>}
    </nav>
  );

  const icon = "flex size-9 items-center justify-center rounded-md transition hover:bg-black/[0.06] [.rd-dark_&]:hover:bg-white/10";
  const dark = s.theme === "dusk" || s.theme === "dark";

  return (
    <div className={`rd fixed inset-0 z-[70] flex flex-col ${dark ? "rd-dark" : ""}`} style={{ background: T.bg, color: T.ink, ["--rd-ink" as any]: T.ink, ["--rd-muted" as any]: T.muted, ["--rd-line" as any]: T.line, ["--rd-bg" as any]: T.bg, visibility: ready ? "visible" : "hidden" }}>
      {/* top bar */}
      <div className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ${barHidden ? "-translate-y-full" : ""}`} onMouseEnter={() => setBarHidden(false)}>
        <div className="flex h-12 items-center gap-1 border-b px-2 backdrop-blur-xl backdrop-saturate-150 sm:px-3" style={{ background: T.panel, borderColor: T.line }}>
          <Link href={book.href} className={icon} title="Back to the book (Esc)"><ArrowLeft size={17} /></Link>
          <button onClick={() => setPanel(panel === "contents" ? null : "contents")} className={icon} title="Contents (C)"><List size={17} /></button>
          <div className="min-w-0 flex-1 px-2 text-center font-sans leading-tight">
            <p className="truncate text-[12px]" style={{ color: T.muted }}>{book.title}</p>
            <p className="truncate text-[13px] font-medium">{chapter.title}</p>
          </div>
          <button onClick={() => setPanel("search")} className={`${icon} hidden sm:flex`} title="Search in this book (/)"><Search size={17} /></button>
          {hasPar && <div className="relative"><button onClick={() => setPop(pop === "lang" ? null : "lang")} className={icon} title="Language (L)"><Languages size={17} /></button>{pop === "lang" && <Pop T={T} onClose={() => setPop(null)}>
            <p className="px-2 pb-1 text-[11.5px] font-medium" style={{ color: T.muted }}>Read this book in</p>
            {translations.map((t) => <Link key={t.slug} href={t.href} onClick={() => setPop(null)} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><span>{t.native}<span className="ml-1.5 text-[11.5px]" style={{ color: T.muted }}>{t.language}</span></span>{t.current && <Check size={14} />}</Link>)}
            <div className="my-1 border-t" style={{ borderColor: T.line }} />
            <p className="px-2 pb-1 text-[11.5px] font-medium" style={{ color: T.muted }}>Side by side with</p>
            {translations.filter((t) => !t.current).map((t) => <button key={t.slug} onClick={() => { set({ mode: "parallel" }); setPop(null); router.replace(`${chapter.href}?with=${t.slug}`, { scroll: false }); }} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10">{t.native}{parallel?.slug === t.slug && <Check size={14} />}</button>)}
          </Pop>}</div>}
          <div className="relative"><button onClick={() => setPop(pop === "mode" ? null : "mode")} className={icon} title="Choose a reader (M)"><BookOpen size={17} /></button>{pop === "mode" && <Pop T={T} onClose={() => setPop(null)} wide>
            <p className="px-2 pb-1.5 text-[11.5px] font-medium" style={{ color: T.muted }}>Reader</p>
            {MODES.map(([k, l, d, I], i) => { const off = k === "parallel" && !hasPar; return <button key={k} disabled={off} onClick={() => { set({ mode: k }); setPop(null); }} className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-black/5 disabled:opacity-40 [.rd-dark_&]:hover:bg-white/10"><I size={17} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1"><span className="flex items-center justify-between text-[13px] font-medium">{l}<kbd className="font-sans text-[11px]" style={{ color: T.muted }}>{i + 1}</kbd></span><span className="block text-[12px]" style={{ color: T.muted }}>{off ? "Appears when this book has another language" : d}</span></span>{mode === k && <Check size={14} className="mt-1" />}</button>; })}
          </Pop>}</div>
          <div className="relative"><button onClick={() => setPop(pop === "text" ? null : "text")} className={icon} title="Text settings (A)"><Type size={17} /></button>{pop === "text" && <Pop T={T} onClose={() => setPop(null)} wide><TextSettings s={s} set={set} T={T} /></Pop>}</div>
          <button onClick={toggleMark} className={`${icon} hidden sm:flex`} title="Bookmark (B)">{marked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button>
          <button onClick={toggleFull} className={`${icon} hidden md:flex`} title="Full screen (F)">{full ? <Minimize size={17} /> : <Maximize size={17} />}</button>
          <button onClick={() => setHelp(true)} className={`${icon} hidden md:flex`} title="Keyboard shortcuts (?)"><Keyboard size={17} /></button>
        </div>
        <div className="h-[2px]"><div className="h-full transition-[width] duration-150" style={{ width: `${pct}%`, background: T.ink, opacity: 0.55 }} /></div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        {mode === "classic" && s.sidebar && <aside className="hidden w-[290px] shrink-0 overflow-y-auto border-r pb-10 pt-16 font-sans [scrollbar-width:thin] lg:block" style={{ borderColor: T.line }}><Contents toc={toc} current={chapter.id} T={T} suffix={parallel ? `?with=${parallel.slug}` : ""} /></aside>}

        {mode === "pages" ? (
          <div className="relative flex min-w-0 flex-1 flex-col pt-14">
            <div className="relative mx-auto min-h-0 w-full flex-1 px-6 py-6 sm:px-10" onClick={(e) => { if ((e.target as HTMLElement).closest("a, button")) return; const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; if (x < 0.3) turn(-1); else if (x > 0.7) turn(1); }} style={{ maxWidth: s.width * 2 + gap + 80 }}>
              <div ref={pager} className="rd-text h-full overflow-hidden" style={{ ...textStyle, columnWidth: Math.min(s.width, 560), columnGap: gap, columnFill: "auto" }}>
                {heading(chapter.title)}{children}
              </div>
            </div>
            <div className="flex h-11 items-center justify-between gap-3 px-4 font-sans text-[12px]" style={{ color: T.muted }}>
              <button onClick={() => turn(-1)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><ChevronLeft size={15} />{page === 0 && prev ? "Previous chapter" : "Previous"}</button>
              <span className="tabular-nums">Page {page + 1} of {pages} · Chapter {chapter.index + 1} of {chapter.total}</span>
              <button onClick={() => turn(1)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10">{page >= pages - 1 && next ? "Next chapter" : "Next"}<ChevronRight size={15} /></button>
            </div>
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
            {([["contents", "Contents"], ["marks", "Bookmarks"], ["search", "Search"]] as const).map(([k, l]) => <button key={k} onClick={() => setPanel(k)} className={`rounded-md px-2.5 py-1.5 text-[13px] ${panel === k ? "bg-black/[0.07] font-medium [.rd-dark_&]:bg-white/10" : ""}`} style={panel === k ? undefined : { color: T.muted }}>{l}</button>)}
            <button onClick={() => setPanel(null)} className={`${icon} ml-auto`}><X size={16} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            {panel === "contents" && <><Link href={book.href} className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: T.line }}>{book.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover} alt="" className="h-14 w-10 rounded-sm object-cover shadow" />}<span className="min-w-0"><span className="block truncate text-[14px] font-semibold">{book.title}</span><span className="text-[12px]" style={{ color: T.muted }}>{chapter.total} chapters · {Math.round(((chapter.index + 1) / chapter.total) * 100)}% through</span></span></Link><Contents toc={toc} current={chapter.id} T={T} onGo={() => setPanel(null)} suffix={parallel ? `?with=${parallel.slug}` : ""} /></>}
            {panel === "marks" && <div className="p-3">{marks.length ? marks.map((m) => <div key={m.href} className="group flex items-start gap-2 rounded-md px-2 py-2 hover:bg-black/5 [.rd-dark_&]:hover:bg-white/10"><Link href={m.href} onClick={() => setPanel(null)} className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium">{m.title}</span><span className="block truncate text-[12px]" style={{ color: T.muted }}>{m.book} · {new Date(m.at).toLocaleDateString()}</span></Link><button onClick={() => { const x = marks.filter((y) => y.href !== m.href); setMarks(x); try { localStorage.setItem("tj_marks", JSON.stringify(x)); } catch {} }} className="opacity-0 group-hover:opacity-60"><X size={14} /></button></div>) : <p className="px-2 py-8 text-center text-[13px]" style={{ color: T.muted }}>No bookmarks yet. Press <kbd>B</kbd> on any chapter.</p>}</div>}
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
      <div className="grid grid-cols-4 gap-1.5">{(Object.keys(THEMES) as Theme[]).map((k) => <button key={k} onClick={() => set({ theme: k })} className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[11.5px] ${s.theme === k ? "ring-2 ring-current" : ""}`} style={{ borderColor: T.line }}><span className="h-6 w-full rounded border" style={{ background: THEMES[k].swatch, borderColor: "rgba(0,0,0,0.12)", color: THEMES[k].ink }}><span className="text-[12px] font-semibold" style={{ fontFamily: "Georgia, serif" }}>Aa</span></span>{THEMES[k].label}</button>)}</div>
      <p className={lab} style={{ color: T.muted }}>Font</p>
      <div className={`${seg} grid-cols-2`}>{(Object.keys(FONTS) as FontK[]).map((k) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md px-2 py-1.5 text-[13.5px] ${s.font === k ? on : ""}`} style={{ fontFamily: FONTS[k][1] }}>{FONTS[k][0]}</button>)}</div>
      <p className={lab} style={{ color: T.muted }}>Size</p>
      <div className="flex items-center gap-2"><button onClick={() => set({ size: Math.max(14, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border" style={{ borderColor: T.line }}><Minus size={14} /></button><input type="range" min={14} max={30} value={s.size} onChange={(e) => set({ size: Number(e.target.value) })} className="flex-1 accent-current" /><button onClick={() => set({ size: Math.min(30, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border" style={{ borderColor: T.line }}><Plus size={14} /></button><span className="w-7 text-right text-[12px] tabular-nums">{s.size}</span></div>
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
