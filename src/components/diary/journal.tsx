"use client";
/* His Diary — a full-screen diary reader (the website's own menu and footer step aside).
   Views: Calendar (default — the month's calendar beside one clean sheet; days with entries are links, and the same day in
   other years is listed), Diary pages (the entry laid out as pages you turn, two facing pages on wide screens, one on a phone),
   Scroll (one long page), Compact (dense, for reading quickly), and Book format (the book reader, chosen from the menu).
   Reading panel: page colours, many fonts, size (A− / A+ always at hand), spacing, width, the original beside or below.
   Everything chosen is remembered on this device. */
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List, X, Home, Search, LayoutTemplate, Check, Languages, SlidersHorizontal } from "lucide-react";

export type JEntry = { slug: string; date: string | null; date_note: string | null; volume: string | null; page: string | null };
export type JPage = JEntry & { title: string | null; place: string | null; translation: string | null; original: string | null; original_lang: string | null; scan_url: string | null; notes: string | null };
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const when = (e: JEntry) => (e.date ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(e.date.split("-").map(Number)) : e.date_note || "Undated");
const weekday = (e: JEntry) => (e.date ? WD[new Date(`${e.date}T12:00:00Z`).getUTCDay()] : "");
const paras = (t: string | null) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

type Theme = { label: string; page: string; ink: string; soft: string; desk: string; dark?: boolean };
const THEMES: Record<string, Theme> = {
  ivory: { label: "Ivory", page: "linear-gradient(180deg,#fffcf4,#fbf3e2)", ink: "#2a2018", soft: "#8c7559", desk: "#ebdfc9" },
  paper: { label: "Old paper", page: "linear-gradient(180deg,#f8edd3,#f1e1bd)", ink: "#35260f", soft: "#8b6a3e", desk: "#dccaa2" },
  saffron: { label: "Saffron", page: "linear-gradient(170deg,#fff5e3,#fde6c2)", ink: "#3a1f06", soft: "#9a5a1c", desk: "#ecd2a8" },
  white: { label: "White", page: "#ffffff", ink: "#1c1c1e", soft: "#7a7a80", desk: "#e9e9ec" },
  sepia: { label: "Sepia", page: "#f3ead6", ink: "#5a4535", soft: "#8f7a66", desk: "#dfd2b6" },
  rose: { label: "Dawn", page: "linear-gradient(170deg,#fff7f3,#fbe6e2)", ink: "#35202a", soft: "#9b6475", desk: "#ead6d6" },
  dusk: { label: "Dusk", page: "#2c1f19", ink: "#f0e2cc", soft: "#c4a585", desk: "#1b1310", dark: true },
  night: { label: "Night", page: "#141414", ink: "#d9d9d9", soft: "#8a8a8a", desk: "#050505", dark: true },
};
const FONTS: Record<string, [string, string]> = {
  inter: ["Inter", "var(--font-sans), system-ui, sans-serif"],
  noto: ["Noto Sans", "'Noto Sans', system-ui, sans-serif"],
  atkinson: ["Atkinson (clear)", "'Atkinson Hyperlegible', system-ui, sans-serif"],
  source: ["Source Serif", "'Source Serif 4', Georgia, serif"],
  literata: ["Literata", "Literata, Georgia, serif"],
  gentium: ["Gentium", "'Gentium Book Plus', Georgia, serif"],
  garamond: ["EB Garamond", "'EB Garamond', Garamond, serif"],
  crimson: ["Crimson Pro", "'Crimson Pro', Georgia, serif"],
  lora: ["Lora", "Lora, Georgia, serif"],
  merri: ["Merriweather", "Merriweather, Georgia, serif"],
};
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Atkinson+Hyperlegible:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Literata:opsz,wght@7..72,400;7..72,600&family=Gentium+Book+Plus:wght@400;700&family=EB+Garamond:wght@400;600&family=Crimson+Pro:wght@400;600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Oriya:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&display=swap";
type View = "calendar" | "pages" | "scroll" | "compact";
type S = { view: View; theme: string; font: string; size: number; lead: number; width: "narrow" | "normal" | "wide"; orig: "off" | "side" | "below" };
const DEF: S = { view: "calendar", theme: "ivory", font: "inter", size: 16, lead: 1.75, width: "normal", orig: "off" };
const SIZES = [13, 14, 15, 16, 17, 18, 20, 22, 24, 27, 30];

export function DiaryJournal({ e, list }: { e: JPage; list: JEntry[] }) {
  const router = useRouter(); const [s, setS] = useState<S>(DEF); const [panel, setPanel] = useState<"" | "toc" | "style" | "view">(""); const [q, setQ] = useState("");
  useEffect(() => { try { setS({ ...DEF, ...JSON.parse(localStorage.getItem("tj_diary_view") || "{}") }); } catch {} }, []);
  const set = (p: Partial<S>) => setS((o) => { const n = { ...o, ...p }; try { localStorage.setItem("tj_diary_view", JSON.stringify(n)); } catch {} return n; });
  // full screen: the website's own menu and footer step aside while reading
  useEffect(() => { document.documentElement.classList.add("tj-immersive"); return () => document.documentElement.classList.remove("tj-immersive"); }, []);
  const i = list.findIndex((x) => x.slug === e.slug); const prev = list[i - 1], next = list[i + 1];
  useEffect(() => { try { localStorage.setItem("tj_diary_last", JSON.stringify(e.slug)); } catch {} }, [e.slug]);
  const T = THEMES[s.theme] || THEMES.ivory; const F = FONTS[s.font]?.[1] || FONTS.inter[1];
  const size = (d: number) => { const k = SIZES.findIndex((x) => x >= s.size); set({ size: SIZES[Math.max(0, Math.min(SIZES.length - 1, (k < 0 ? SIZES.length - 1 : k) + d))] }); };
  const orig = paras(e.original); const tr = paras(e.translation); const showOrig = s.orig !== "off" && orig.length > 0;

  /* ----- Diary pages: the entry flows into fixed-height columns; each column is a page, turned one spread at a time ----- */
  const flow = useRef<HTMLDivElement>(null); const [spread, setSpread] = useState(0); const [spreads, setSpreads] = useState(1); const [two, setTwo] = useState(false);
  const measure = useCallback(() => { const el = flow.current; if (!el) return; const w = el.clientWidth; const gap = parseFloat(getComputedStyle(el).columnGap) || 0; setSpreads(Math.max(1, Math.round((el.scrollWidth + gap) / (w + gap)))); setTwo(window.innerWidth >= 1024); }, []);
  useLayoutEffect(() => { if (s.view !== "pages") return; setSpread(0); const t = setTimeout(measure, 60); window.addEventListener("resize", measure); (document as any).fonts?.ready?.then(measure); return () => { clearTimeout(t); window.removeEventListener("resize", measure); }; }, [s.view, s.size, s.lead, s.font, s.width, s.orig, e.slug, measure]);
  useEffect(() => { const el = flow.current; if (!el || s.view !== "pages") return; const gap = parseFloat(getComputedStyle(el).columnGap) || 0; el.scrollTo({ left: spread * (el.clientWidth + gap), behavior: "smooth" }); }, [spread, s.view]);
  const turn = useCallback((d: number) => {
    if (s.view === "pages") { const n = spread + d; if (n >= 0 && n < spreads) { setSpread(n); return; } }
    const to = d > 0 ? next : prev; if (to) router.push(`/gurudeva/diaries/${to.slug}`);
  }, [s.view, spread, spreads, next, prev, router]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if ((ev.target as HTMLElement).closest("input,textarea,select")) return; if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); turn(1); } if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); turn(-1); } if (ev.key === "Escape") setPanel(""); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [turn]);
  const touch = useRef<number | null>(null);

  // contents: volume (or year) → month → day
  const tree = useMemo(() => { const vols = new Map<string, Map<string, JEntry[]>>(); list.forEach((x) => { const v = x.volume ? `Volume ${x.volume}` : x.date ? x.date.slice(0, 4) : "Undated"; const m = x.date ? x.date.slice(0, 7) : "undated"; if (!vols.has(v)) vols.set(v, new Map()); const mm = vols.get(v)!; mm.set(m, [...(mm.get(m) || []), x]); }); return [...vols.entries()]; }, [list]);
  const curVol = e.volume ? `Volume ${e.volume}` : e.date ? e.date.slice(0, 4) : "Undated";
  const found = q.trim().length > 1 ? list.filter((x) => when(x).toLowerCase().includes(q.toLowerCase()) || (x.date || "").includes(q)).slice(0, 60) : null;

  // Calendar view: the month of this entry, with the days that have a page; and the same day in other years.
  const month = e.date?.slice(0, 7) || null;
  const monthDays = useMemo(() => { const m = new Map<number, JEntry>(); if (month) list.forEach((x) => { if (x.date?.startsWith(month)) m.set(Number(x.date.slice(8, 10)), x); }); return m; }, [list, month]);
  const months = useMemo(() => Array.from(new Set(list.map((x) => x.date?.slice(0, 7)).filter(Boolean) as string[])), [list]);
  const mi = month ? months.indexOf(month) : -1; const pm = mi > 0 ? months[mi - 1] : null; const nm = mi >= 0 && mi < months.length - 1 ? months[mi + 1] : null;
  const firstOf = (m: string) => list.find((x) => x.date?.startsWith(m));
  const sameDay = e.date ? list.filter((x) => x.slug !== e.slug && x.date?.slice(5) === e.date!.slice(5)) : [];
  const grid = useMemo(() => { if (!month) return []; const [y, m] = month.split("-").map(Number); const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); const n = new Date(Date.UTC(y, m, 0)).getUTCDate(); return [...Array(lead).fill(0), ...Array.from({ length: n }, (_, k) => k + 1)]; }, [month]);
  const today = e.date ? Number(e.date.slice(8, 10)) : 0;
  const monthLabel = (m: string) => `${MON[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
  const head = (
    <header className="mb-[1.6em] text-center" style={{ breakInside: "avoid" }}>
      <p className="text-[0.66em] font-semibold uppercase tracking-[0.24em]" style={{ color: T.soft }}>{[weekday(e), e.place].filter(Boolean).join(" · ") || "His Diary"}</p>
      <h1 className="mt-[0.35em] text-[1.55em] font-semibold leading-tight tracking-[-0.01em]">{when(e)}</h1>
      {e.title && <p className="mt-[0.2em] text-[0.9em]" style={{ color: T.soft }}>{e.title}</p>}
      <span aria-hidden className="mx-auto mt-[0.9em] block h-px w-16" style={{ background: T.soft, opacity: .5 }} />
    </header>);
  const ps = (xs: string[], lang?: string | null, dim = false) => <div lang={lang || undefined} style={{ opacity: dim ? .88 : 1 }}>{xs.map((p, k) => <p key={k} className="mb-[0.85em] whitespace-pre-line text-left sm:text-justify" style={{ hyphens: "auto", orphans: 2, widows: 2 }}>{p}</p>)}</div>;
  const tail = <>{e.notes && <p className="mt-[1.5em] border-t pt-[0.8em] text-[0.8em]" style={{ borderColor: `${T.soft}55`, color: T.soft }}>{e.notes}</p>}
    {e.scan_url && /* eslint-disable-next-line @next/next/no-img-element */ <figure className="mt-[1.5em]" style={{ breakInside: "avoid" }}><img src={e.scan_url} alt={`The page in his own hand, ${when(e)}`} className="max-h-[60vh] w-full rounded object-contain" loading="lazy" /><figcaption className="mt-1 text-center text-[0.75em]" style={{ color: T.soft }}>The page in his own hand</figcaption></figure>}
    <p className="mt-[1.5em] text-center text-[0.72em] tabular-nums tracking-[0.06em]" style={{ color: T.soft }}>{[e.volume ? `Volume ${e.volume}` : null, e.page ? `page ${e.page}` : null].filter(Boolean).join(" · ")}</p></>;
  const textBlock = (<>
    {head}
    {showOrig && s.orig === "side" ? <div className="grid gap-8 md:grid-cols-2"><div>{ps(orig, e.original_lang, true)}</div><div>{tr.length ? ps(tr) : <p style={{ color: T.soft }}>The translation of this page is being prepared.</p>}</div></div>
      : <>{tr.length ? ps(tr) : <p className="text-center" style={{ color: T.soft }}>The translation of this page is being prepared.</p>}{showOrig && s.orig === "below" && <div className="mt-[1.2em] border-t pt-[1.2em]" style={{ borderColor: `${T.soft}44` }}>{ps(orig, e.original_lang, true)}</div>}</>}
    {tail}</>);
  const maxW = s.width === "narrow" ? 560 : s.width === "wide" ? 860 : 680;
  const bar = `flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition ${T.dark ? "text-white/80 hover:bg-white/10" : "text-black/70 hover:bg-black/[0.06]"}`;
  const seg = (on: boolean) => `rounded-md px-2 py-1.5 text-[12.5px] ${on ? "bg-white font-medium text-zinc-900 shadow-sm" : "text-zinc-500"}`;
  const VIEWS: [View | "book", string, string][] = [["calendar", "Calendar", "The month beside the page; every written day one tap away"], ["pages", "Diary pages", "Turn the pages, like the diary itself"], ["scroll", "Scroll", "The whole page in one long column"], ["compact", "Compact", "Dense and plain, to read quickly"], ["book", "Book format", "In the book reader, with its own tools"]];

  return (
    <div className="fixed inset-0 z-[55] flex flex-col" style={{ background: T.desk, color: T.ink }}>
      <link rel="stylesheet" href={FONT_LINK} precedence="default" />
      {/* the diary's own slim bar */}
      <div className="relative flex shrink-0 items-center gap-1 px-2 py-1.5 sm:px-4" style={{ borderBottom: `1px solid ${T.dark ? "#ffffff14" : "#00000010"}` }}>
        <Link href="/gurudeva/diaries" className={bar} title="Diary home" aria-label="Diary home"><Home size={17} /></Link>
        <button onClick={() => setPanel(panel === "toc" ? "" : "toc")} className={bar}><List size={17} /><span className="max-sm:hidden">Contents</span></button>
        <span className="pointer-events-none absolute left-1/2 top-1/2 w-[calc(100%-240px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[13px] font-medium max-sm:hidden" style={{ color: T.soft }}>{when(e)}</span><span className="flex-1" />
        <button onClick={() => size(-1)} className={bar} title="Smaller text" aria-label="Smaller text"><span className="text-[13px] font-semibold">A−</span></button>
        <button onClick={() => size(1)} className={bar} title="Larger text" aria-label="Larger text"><span className="text-[16px] font-semibold">A+</span></button>
        {orig.length > 0 && <button onClick={() => set({ orig: s.orig === "off" ? "side" : "off" })} className={bar} title="The original"><Languages size={17} /></button>}
        <button onClick={() => setPanel(panel === "view" ? "" : "view")} className={bar} title="View"><LayoutTemplate size={17} /><span className="max-md:hidden">View</span></button>
        <button onClick={() => setPanel(panel === "style" ? "" : "style")} className={bar} title="Reading style"><SlidersHorizontal size={17} /></button>
      </div>

      {/* the page(s) */}
      <div className="relative min-h-0 flex-1">
        {s.view === "calendar" ? (
          <div className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto grid max-w-[1180px] gap-6 px-3 py-4 sm:px-6 sm:py-8 lg:grid-cols-[280px_1fr] lg:gap-10">
              {month && <aside className="order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start">
                <div className="rounded-2xl p-4" style={{ background: T.page, boxShadow: "0 18px 40px -26px rgba(40,20,0,.5), 0 0 0 1px rgba(0,0,0,.04)" }}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    {pm ? <Link href={`/gurudeva/diaries/${firstOf(pm)!.slug}`} aria-label={monthLabel(pm)} title={monthLabel(pm)} className="rounded-full p-1.5 hover:bg-black/5"><ChevronLeft size={16} /></Link> : <span className="size-7" />}
                    <p className="text-[14px] font-semibold">{monthLabel(month)}</p>
                    {nm ? <Link href={`/gurudeva/diaries/${firstOf(nm)!.slug}`} aria-label={monthLabel(nm)} title={monthLabel(nm)} className="rounded-full p-1.5 hover:bg-black/5"><ChevronRight size={16} /></Link> : <span className="size-7" />}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[12px] tabular-nums">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, k) => <span key={k} className="pb-1 text-[10.5px] font-semibold" style={{ color: T.soft }}>{d}</span>)}
                    {grid.map((d, k) => { const x = d ? monthDays.get(d) : undefined; return !d ? <span key={k} /> : x ? (
                      <Link key={k} href={`/gurudeva/diaries/${x.slug}`} aria-current={d === today ? "page" : undefined} className={`flex aspect-square items-center justify-center rounded-full font-medium transition ${d === today ? "bg-[#c2621d] text-white" : "hover:bg-black/[0.07]"}`} style={d === today ? undefined : { boxShadow: `inset 0 0 0 1px ${T.soft}55` }}>{d}</Link>
                    ) : <span key={k} className="flex aspect-square items-center justify-center opacity-35">{d}</span>; })}
                  </div>
                  <p className="mt-3 text-[11.5px]" style={{ color: T.soft }}>{monthDays.size} {monthDays.size === 1 ? "page" : "pages"} this month</p>
                </div>
                {sameDay.length > 0 && <div className="mt-4 rounded-2xl px-4 py-3 max-lg:hidden" style={{ background: T.page, boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
                  <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: T.soft }}>The same day, other years</p>
                  {sameDay.map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} className="block py-1 text-[13px] hover:underline">{when(x)}</Link>)}
                </div>}
              </aside>}
              <article className="order-1 mx-auto w-full rounded-[10px] px-6 py-10 lg:order-2 sm:px-14 sm:py-14" style={{ maxWidth: maxW + 140, background: T.page, boxShadow: "0 24px 60px -28px rgba(40,20,0,.5), 0 0 0 1px rgba(0,0,0,.04)", fontFamily: F, fontSize: s.size, lineHeight: s.lead }}>
                {textBlock}
              </article>
            </div>
          </div>
        ) : s.view === "pages" ? (
          <div className="absolute inset-0 flex items-center justify-center px-2 py-3 sm:px-6 sm:py-6" onTouchStart={(ev) => { touch.current = ev.touches[0].clientX; }} onTouchEnd={(ev) => { if (touch.current === null) return; const dx = ev.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1); }}>
            <div className="relative h-full w-full overflow-hidden rounded-[6px] shadow-[0_24px_60px_-28px_rgba(40,20,0,.55),0_0_0_1px_rgba(0,0,0,.04)]" style={{ maxWidth: two ? maxW * 2 + 120 : maxW + 60, background: T.page }}>
              {two && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-16 -translate-x-1/2" style={{ background: T.dark ? "linear-gradient(90deg,transparent,rgba(0,0,0,.35),transparent)" : "linear-gradient(90deg,transparent,rgba(90,50,10,.13) 48%,rgba(90,50,10,.2) 50%,rgba(90,50,10,.13) 52%,transparent)" }} />}
              <span aria-hidden className="pointer-events-none absolute inset-3 z-10 rounded-[3px] border sm:inset-4" style={{ borderColor: T.dark ? "#e8b87226" : "#b0843c40" }} />
              <div className="h-full px-7 py-9 sm:px-12 sm:py-12"><div ref={flow} className="h-full overflow-hidden" style={{ columnCount: two ? 2 : 1, columnGap: two ? 96 : 56, columnFill: "auto", fontFamily: F, fontSize: s.size, lineHeight: s.lead }}>
                {textBlock}
              </div></div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto">
            <article className={s.view === "compact" ? "mx-auto px-4 py-6 sm:px-8" : "mx-auto my-6 rounded-[6px] px-6 py-10 shadow-[0_24px_60px_-28px_rgba(40,20,0,.5)] sm:my-10 sm:px-14 sm:py-14"} style={{ maxWidth: s.view === "compact" ? maxW + 80 : maxW + 140, background: s.view === "compact" ? "transparent" : T.page, fontFamily: F, fontSize: s.view === "compact" ? s.size - 1 : s.size, lineHeight: s.view === "compact" ? Math.max(1.45, s.lead - .2) : s.lead }}>
              {textBlock}
            </article>
          </div>)}
      </div>

      {/* turning: page within the entry, then on to the next entry */}
      <div className="flex shrink-0 items-center gap-2 px-2 py-1.5 sm:px-4" style={{ borderTop: `1px solid ${T.dark ? "#ffffff14" : "#00000010"}` }}>
        <button onClick={() => turn(-1)} disabled={s.view === "pages" ? spread === 0 && !prev : !prev} className={`${bar} disabled:opacity-30`}><ChevronLeft size={18} /><span className="max-sm:hidden">{s.view === "pages" && spread > 0 ? "Previous page" : prev ? when(prev) : ""}</span></button>
        <div className="flex-1 text-center text-[12px] tabular-nums" style={{ color: T.soft }}>
          {s.view === "pages" && spreads > 1 && <span className="mr-2">{two ? "Pages" : "Page"} {two ? `${spread * 2 + 1}–${Math.min(spreads * 2, spread * 2 + 2)}` : spread + 1} of {two ? spreads * 2 : spreads}</span>}
          <span className="max-sm:hidden">· Entry {i + 1} of {list.length}</span>
        </div>
        <button onClick={() => turn(1)} disabled={s.view === "pages" ? spread >= spreads - 1 && !next : !next} className={`${bar} disabled:opacity-30`}><span className="max-sm:hidden">{s.view === "pages" && spread < spreads - 1 ? "Next page" : next ? when(next) : ""}</span><ChevronRight size={18} /></button>
      </div>

      {/* panels */}
      {panel && <div className="fixed inset-0 z-[70] bg-black/10" onClick={() => setPanel("")}><aside className={`absolute top-0 h-full w-[88%] max-w-[340px] overflow-y-auto bg-[#fffaf2] p-4 text-zinc-900 shadow-2xl ${panel === "toc" ? "left-0" : "right-0"}`} onClick={(ev) => ev.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="text-[14px] font-semibold">{panel === "toc" ? `Contents · ${list.length} entries` : panel === "view" ? "View" : "Reading style"}</p><button onClick={() => setPanel("")} className="text-zinc-400 hover:text-zinc-900"><X size={18} /></button></div>
        {panel === "toc" && <div className="space-y-1">
          <label className="relative mb-2 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Find a date — 1975, May 1975…" className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-2 text-[13px] outline-none focus:border-[#c2621d]" /></label>
          {found ? found.map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} onClick={() => setPanel("")} className="block rounded px-2 py-1.5 text-[13px] hover:bg-black/5">{when(x)}</Link>) :
            tree.map(([v, months]) => (
              <details key={v} open={v === curVol}>
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-2 text-[13.5px] font-semibold hover:bg-black/5">{v}<span className="text-[11.5px] font-normal text-zinc-500">{[...months.values()].reduce((a, b) => a + b.length, 0)}</span></summary>
                <div className="ml-2 border-l border-zinc-200 pl-2">{[...months.entries()].map(([m, xs]) => (
                  <details key={m} open={e.date?.slice(0, 7) === m}>
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded px-2 py-1.5 text-[13px] hover:bg-black/5">{m === "undated" ? "Undated" : `${MON[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`}<span className="text-[11px] text-zinc-500">{xs.length}</span></summary>
                    <div className="grid grid-cols-6 gap-1 py-1 pl-2">{xs.map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} onClick={() => setPanel("")} className={`rounded py-1 text-center text-[12px] tabular-nums ${x.slug === e.slug ? "bg-[#c2621d] text-white" : "hover:bg-black/5"}`}>{x.date ? Number(x.date.slice(8, 10)) : "·"}</Link>)}</div>
                  </details>))}</div>
              </details>))}
        </div>}
        {panel === "view" && <div className="space-y-1.5">{VIEWS.map(([k, l, d]) => {
          const on = k === s.view; const inner = <><span className="flex items-center justify-between text-[13.5px] font-medium">{l}{on && <Check size={15} className="text-[#c2621d]" />}</span><span className="block text-[12px] text-zinc-500">{d}</span></>;
          return k === "book" ? <Link key={k} href={`/gurudeva/diaries/${e.slug}?view=book`} className="block rounded-lg border border-zinc-200 bg-white px-3 py-2.5 hover:border-zinc-400">{inner}</Link>
            : <button key={k} onClick={() => { set({ view: k as View }); setPanel(""); }} className={`block w-full rounded-lg border px-3 py-2.5 text-left ${on ? "border-[#c2621d] bg-[#fff3e3]" : "border-zinc-200 bg-white hover:border-zinc-400"}`}>{inner}</button>; })}</div>}
        {panel === "style" && <div className="space-y-4">
          <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Page</p><div className="grid grid-cols-4 gap-1.5">{Object.entries(THEMES).map(([k, t]) => <button key={k} onClick={() => set({ theme: k })} className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[10.5px] ${s.theme === k ? "border-zinc-900" : "border-zinc-200"}`}><span className="h-8 w-full rounded border border-black/10" style={{ background: t.page }} />{t.label}</button>)}</div></div>
          <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Font</p><div className="grid grid-cols-2 gap-1">{Object.entries(FONTS).map(([k, [l, f]]) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md border px-2 py-1.5 text-left text-[14px] ${s.font === k ? "border-zinc-900 bg-white" : "border-zinc-200 bg-white/60"}`} style={{ fontFamily: f }}>{l}</button>)}</div></div>
          <div><p className="mb-1.5 flex items-center justify-between text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Size<span className="normal-case tracking-normal">{s.size}</span></p><div className="flex items-center gap-2"><button onClick={() => size(-1)} className="flex h-10 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[14px] font-semibold">A−</button><input type="range" min={13} max={30} value={s.size} onChange={(ev) => set({ size: Number(ev.target.value) })} className="flex-1 accent-[#c2621d]" /><button onClick={() => size(1)} className="flex h-10 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[18px] font-semibold">A+</button></div></div>
          <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Line spacing</p><div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{([[1.5, "Compact"], [1.75, "Normal"], [2.05, "Airy"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ lead: v })} className={seg(s.lead === v)}>{l}</button>)}</div></div>
          <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Width</p><div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{(["narrow", "normal", "wide"] as const).map((w) => <button key={w} onClick={() => set({ width: w })} className={seg(s.width === w)}>{w[0].toUpperCase() + w.slice(1)}</button>)}</div></div>
          {orig.length > 0 && <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">The original</p><div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{([["off", "Hide"], ["side", "Beside"], ["below", "Below"]] as const).map(([k, l]) => <button key={k} onClick={() => set({ orig: k })} className={seg(s.orig === k)}>{l}</button>)}</div></div>}
          <button onClick={() => set({ ...DEF, view: s.view })} className="w-full rounded-md py-1.5 text-[12px] text-zinc-500 hover:bg-zinc-100">Reset</button>
        </div>}
      </aside></div>}
    </div>
  );
}
