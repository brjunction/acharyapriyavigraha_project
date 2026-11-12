"use client";
/* The lecture page: a player you can tuck away, its details just under it (they fold away), and the transcription
   as a proper reading page — a sticky reading bar (A− / A+, width, style), contents beside the text on wide screens,
   a progress line, and a full-screen reader with a "Book pages" view (two facing pages on a laptop, one on a phone). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Type, Minus, Plus, Check, Maximize2, X, List } from "lucide-react";
import { THEMES, FONTS, FONT_CSS, type Theme, type FontK } from "@/components/books/reader";

type Style = "column" | "paper" | "pages";
type Width = "normal" | "wide" | "full";
type S = { style: Style; width: Width; theme: Theme; font: FontK; size: number; leading: number; aside: boolean; player: boolean };
const DEF: S = { style: "column", width: "normal", theme: "light", font: "sans", size: 17, leading: 1.8, aside: true, player: true };
const STYLES: [Style, string, string][] = [["column", "Column", "A calm column of text"], ["paper", "Paper", "The text on a sheet of paper"], ["pages", "Book pages", "Turn pages, in full screen"]];
const WIDTHS: [Width, string, number][] = [["normal", "Normal", 700], ["wide", "Wide", 940], ["full", "Full", 1400]];
const load = (): S => { try { const x = { ...DEF, ...JSON.parse(localStorage.getItem("tj_transcript2") || "{}") }; if (!(x.font in FONTS)) x.font = DEF.font; if (!(x.theme in THEMES)) x.theme = DEF.theme; return x; } catch { return DEF; } };
type Head = { id: string; text: string; level: number };

export function LectureLayout({ head, player, transcript, aside, label, title, heads = [] }: { head: React.ReactNode; player: React.ReactNode; transcript: React.ReactNode; aside: React.ReactNode; label: string; title?: string; heads?: Head[] }) {
  const [s, setS] = useState<S>(DEF); const [open, setOpen] = useState(false); const [full, setFull] = useState(false); const [pct, setPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null); const body = useRef<HTMLDivElement>(null);
  useEffect(() => setS(load()), []);
  const set = useCallback((p: Partial<S>) => setS((o) => { const x = { ...o, ...p }; try { localStorage.setItem("tj_transcript2", JSON.stringify(x)); } catch {} return x; }), []);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  // reading progress through the transcription
  useEffect(() => { if (full) return; const f = () => { const el = body.current; if (!el) return; const r = el.getBoundingClientRect(); const seen = Math.min(Math.max(window.innerHeight * 0.6 - r.top, 0), r.height); setPct(r.height ? (seen / r.height) * 100 : 0); }; f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, [full]);
  const T = THEMES[s.theme] || THEMES.light; const dark = ["dusk", "slate", "dark"].includes(s.theme);
  const maxW = WIDTHS.find(([k]) => k === s.width)?.[2] || 700;
  const size = (d: number) => set({ size: Math.max(13, Math.min(30, s.size + d)) });
  const chooseStyle = (k: Style) => { set({ style: k }); if (k === "pages") setFull(true); };
  const btn = "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-ink-2 transition hover:bg-band hover:text-ink";
  const panel = <StylePanel s={s} set={set} onStyle={chooseStyle} />;
  const textStyle: React.CSSProperties = { fontFamily: FONTS[s.font][1], fontSize: s.size, lineHeight: s.leading };
  const vars = { ["--rd-ink" as any]: T.ink, ["--rd-muted" as any]: T.muted, ["--rd-line" as any]: T.line } as React.CSSProperties;
  const showToc = heads.length > 2 && s.width !== "full";
  return (
    <div className="mt-6">
      <link rel="stylesheet" href={FONT_CSS} precedence="default" />
      <article className="min-w-0">
        {head}
        {s.player ? <div className="mt-5 flex items-start gap-2"><div className="min-w-0 flex-1">{player}</div><button onClick={() => set({ player: false })} title="Hide this player — the player at the bottom keeps playing" className="mt-2.5 flex size-8 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-band hover:text-ink"><ChevronUp size={16} /></button></div>
          : <button onClick={() => set({ player: true })} className="mt-4 inline-flex h-7 items-center gap-1 rounded-full border border-line px-3 text-[12px] text-ink-3 hover:text-ink"><ChevronDown size={13} />Show the player here</button>}
        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-band/40">
          <button onClick={() => set({ aside: !s.aside })} aria-expanded={s.aside} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-ink hover:bg-band/70">
            Details{s.aside ? <ChevronUp size={16} className="text-ink-3" /> : <ChevronDown size={16} className="text-ink-3" />}
          </button>
          {s.aside && <div className="grid gap-5 border-t border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:first-child]:sm:col-span-2 [&>*:first-child]:lg:col-span-1">{aside}</div>}
        </section>

        {/* the reading bar stays at the top while reading */}
        <div className="sticky top-[52px] z-20 -mx-4 mt-8 border-b border-line bg-white/95 px-4 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 py-1.5">
            <h2 className="text-[16px] font-semibold text-ink">{label}</h2>
            <div className="flex items-center gap-0.5">
              <button onClick={() => size(-1)} className={`${btn} font-semibold`} title="Smaller text" aria-label="Smaller text">A−</button>
              <button onClick={() => size(1)} className={`${btn} text-[16px] font-semibold`} title="Larger text" aria-label="Larger text">A+</button>
              <div className="mx-1 hidden h-5 w-px bg-line sm:block" />
              <div className="hidden rounded-lg bg-band p-0.5 sm:flex">{WIDTHS.map(([k, l]) => <button key={k} onClick={() => set({ width: k })} className={`rounded-md px-2.5 py-1 text-[12.5px] ${s.width === k ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3 hover:text-ink"}`}>{l}</button>)}</div>
              <div ref={ref} className="relative"><button onClick={() => setOpen(!open)} className={btn}><Type size={15} /><span className="max-sm:hidden">Style</span></button>
                {open && <div className="absolute right-0 top-11 z-30 w-[310px] rounded-xl border border-line bg-white p-3 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.3)]">{panel}</div>}
              </div>
              <button onClick={() => setFull(true)} className={btn} title="Read in full screen"><Maximize2 size={15} /><span className="max-sm:hidden">Full screen</span></button>
            </div>
          </div>
          <div className="absolute inset-x-0 -bottom-px h-[2px]"><div className="h-full bg-saffron/70 transition-[width] duration-150" style={{ width: `${pct}%` }} /></div>
        </div>

        {!full && <div ref={body} className={`mt-6 ${showToc ? "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10" : ""}`}>
          {showToc && <aside className="hidden lg:block"><nav className="sticky top-[130px] max-h-[calc(100dvh-160px)] overflow-y-auto pr-2 [scrollbar-width:thin]"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Contents</p><ol className="space-y-1 border-l border-line">{heads.map((h) => <li key={h.id}><a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-0.5 text-[13px] leading-snug text-ink-2 hover:border-saffron hover:text-saffron" style={{ paddingLeft: 10 + (h.level - 1) * 10 }}>{h.text}</a></li>)}</ol></nav></aside>}
          <div className={`rd-text ${dark ? "rd-dark" : ""} min-w-0 transition-colors ${s.style === "paper" ? "rounded-2xl border px-6 py-8 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.4)] sm:px-12 sm:py-12" : s.theme !== "light" ? "rounded-2xl px-5 py-6 sm:px-8" : ""}`} style={{ background: s.theme === "light" && s.style !== "paper" ? undefined : T.bg, color: T.ink, borderColor: T.line, ...vars }}>
            <div className="mx-auto" style={{ maxWidth: maxW, ...textStyle }}>{transcript}</div>
          </div>
        </div>}
        {full && <FullReader title={title || label} heads={heads} s={s} set={set} panel={panel} onClose={() => { setFull(false); if (s.style === "pages") set({ style: "column" }); }}>{transcript}</FullReader>}
      </article>
    </div>
  );
}

function StylePanel({ s, set, onStyle }: { s: S; set: (p: Partial<S>) => void; onStyle: (k: Style) => void }) {
  const lab = "mb-1.5 mt-3 text-[11.5px] font-medium text-ink-3 first:mt-0";
  return (<>
    <p className={lab}>View</p>
    <div className="grid grid-cols-3 gap-1.5">{STYLES.map(([k, l, d]) => <button key={k} onClick={() => onStyle(k)} title={d} className={`rounded-lg border p-2 text-left ${s.style === k ? "border-ink" : "border-line hover:border-line-strong"}`}><span className="flex items-center justify-between text-[12.5px] font-medium text-ink">{l}{s.style === k && <Check size={13} />}</span><span className="block text-[10.5px] leading-snug text-ink-3">{d}</span></button>)}</div>
    <p className={lab}>Width</p>
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-band p-0.5">{WIDTHS.map(([k, l]) => <button key={k} onClick={() => set({ width: k })} className={`rounded-md px-2 py-1 text-[12px] ${s.width === k ? "bg-white shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
    <p className={lab}>Colour</p>
    <div className="grid grid-cols-5 gap-1.5">{(Object.keys(THEMES) as Theme[]).map((k) => <button key={k} onClick={() => set({ theme: k })} title={THEMES[k].label} className={`flex flex-col items-center gap-1 rounded-lg border p-1 text-[10px] text-ink-2 ${s.theme === k ? "border-ink" : "border-line"}`}><span className="flex h-6 w-full items-center justify-center rounded border border-black/10 text-[11px] font-semibold" style={{ background: THEMES[k].bg, color: THEMES[k].ink }}>Aa</span>{THEMES[k].label}</button>)}</div>
    <p className={lab}>Font</p>
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-band p-0.5">{(Object.keys(FONTS) as FontK[]).map((k) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md px-2 py-1.5 text-[13px] ${s.font === k ? "bg-white shadow-sm" : "text-ink-2"}`} style={{ fontFamily: FONTS[k][1] }}>{FONTS[k][0]}</button>)}</div>
    <p className={lab}>Size</p>
    <div className="flex items-center gap-2"><button onClick={() => set({ size: Math.max(13, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Minus size={14} /></button><input type="range" min={13} max={30} value={s.size} onChange={(e) => set({ size: +e.target.value })} className="flex-1 accent-[#1a1a1a]" /><button onClick={() => set({ size: Math.min(30, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Plus size={14} /></button><span className="w-6 text-right text-[12px] tabular-nums text-ink-3">{s.size}</span></div>
    <p className={lab}>Line spacing</p>
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-band p-0.5">{([[1.55, "Compact"], [1.8, "Normal"], [2.05, "Relaxed"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ leading: v })} className={`rounded-md px-2 py-1 text-[12px] ${s.leading === v ? "bg-white shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
    <button onClick={() => set({ ...DEF, aside: s.aside, player: s.player })} className="mt-3 w-full rounded-md py-1.5 text-[12px] text-ink-3 hover:bg-band">Reset</button>
  </>);
}

/** Full-screen reading: the site steps aside; a column, a sheet of paper, or book pages you turn. */
function FullReader({ title, heads, s, set, panel, onClose, children }: { title: string; heads: Head[]; s: S; set: (p: Partial<S>) => void; panel: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  const T = THEMES[s.theme] || THEMES.light; const dark = ["dusk", "slate", "dark"].includes(s.theme);
  const [pop, setPop] = useState<"" | "style" | "toc">(""); const pages = s.style === "pages";
  const desk = dark ? `color-mix(in srgb, ${T.bg} 70%, #000)` : `color-mix(in srgb, ${T.bg} 90%, #6b4a1c)`;
  useEffect(() => { document.documentElement.classList.add("tj-immersive"); return () => document.documentElement.classList.remove("tj-immersive"); }, []);
  // book pages: columns turned one spread at a time
  const flow = useRef<HTMLDivElement>(null); const [two, setTwo] = useState(false); const [pg, setPg] = useState(0); const [n, setN] = useState(1); const touch = useRef<number | null>(null);
  const gap = two ? 112 : 56;
  const measure = useCallback(() => { const el = flow.current; if (!el) return; setN(Math.max(1, Math.round((el.scrollWidth + gap) / (el.clientWidth + gap)))); }, [gap]);
  useEffect(() => { const f = () => setTwo(window.innerWidth >= 1024); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  useLayoutEffect(() => { if (!pages) return; setPg(0); const t = setTimeout(measure, 80); const r = new ResizeObserver(measure); if (flow.current) r.observe(flow.current); (document as any).fonts?.ready?.then(measure); return () => { clearTimeout(t); r.disconnect(); }; }, [pages, s.size, s.leading, s.font, two, measure]);
  useEffect(() => { const el = flow.current; if (pages && el) el.scrollTo({ left: pg * (el.clientWidth + gap) }); }, [pg, pages, gap]);
  const turn = useCallback((d: number) => setPg((p) => Math.max(0, Math.min(n - 1, p + d))), [n]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest("input,textarea,select")) return; if (e.key === "Escape") { if (pop) setPop(""); else onClose(); } if (!pages) return; if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); turn(1); } if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); turn(-1); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [pages, turn, pop, onClose]);
  const goHead = (id: string) => { setPop(""); if (!pages) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; } const el = flow.current, h = document.getElementById(id); if (!el || !h) return; const x = h.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft; setPg(Math.floor(x / ((el.clientWidth + gap) * 1))); };
  const maxW = WIDTHS.find(([k]) => k === s.width)?.[2] || 700;
  const textStyle: React.CSSProperties = { fontFamily: FONTS[s.font][1], fontSize: s.size, lineHeight: s.leading, ["--rd-ink" as any]: T.ink, ["--rd-muted" as any]: T.muted, ["--rd-line" as any]: T.line };
  const ib = `flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition ${dark ? "text-white/80 hover:bg-white/10" : "text-black/70 hover:bg-black/[0.06]"}`;
  return (
    <div className={`rd fixed inset-0 z-[65] flex flex-col ${dark ? "rd-dark" : ""}`} style={{ background: s.style === "column" ? T.bg : desk, color: T.ink }}>
      <div className="relative flex shrink-0 items-center gap-1 px-2 py-1.5 sm:px-4" style={{ borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <button onClick={onClose} className={ib} title="Close (Esc)"><X size={18} /></button>
        {heads.length > 0 && <button onClick={() => setPop(pop === "toc" ? "" : "toc")} className={ib}><List size={17} /><span className="max-sm:hidden">Contents</span></button>}
        <span className="pointer-events-none absolute left-1/2 top-1/2 w-[calc(100%-240px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[13px] font-medium max-sm:hidden" style={{ color: T.muted }}>{title}</span><span className="flex-1" />
        <button onClick={() => set({ size: Math.max(13, s.size - 1) })} className={ib} aria-label="Smaller text">A−</button>
        <button onClick={() => set({ size: Math.min(30, s.size + 1) })} className={`${ib} text-[16px]`} aria-label="Larger text">A+</button>
        <button onClick={() => setPop(pop === "style" ? "" : "style")} className={ib}><Type size={16} /><span className="max-sm:hidden">Style</span></button>
      </div>
      <div className="relative min-h-0 flex-1">
        {pages ? (
          <div className="absolute inset-0 flex items-center justify-center px-2 py-3 sm:px-6 sm:py-6" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1); }}>
            <div className="relative h-full w-full overflow-hidden rounded-[5px] shadow-[0_26px_60px_-30px_rgba(30,15,0,.55),0_0_0_1px_rgba(0,0,0,.05)]" style={{ maxWidth: two ? 1500 : 760, background: T.bg }}>
              {two && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-16 -translate-x-1/2" style={{ background: dark ? "linear-gradient(90deg,transparent,rgba(0,0,0,.4),transparent)" : "linear-gradient(90deg,transparent,rgba(80,50,15,.12) 47%,rgba(80,50,15,.2) 50%,rgba(80,50,15,.12) 53%,transparent)" }} />}
              <span aria-hidden className="pointer-events-none absolute inset-3 z-10 rounded-[3px] border sm:inset-4" style={{ borderColor: T.line }} />
              <div className="h-full px-7 pb-12 pt-10 sm:px-12 sm:pt-12"><div ref={flow} className="rd-text h-full overflow-hidden" style={{ ...textStyle, columnCount: two ? 2 : 1, columnGap: gap, columnFill: "auto" }}>{children}</div></div>
              <span className="absolute bottom-5 left-0 z-10 text-center text-[11px] tabular-nums sm:bottom-6" style={{ color: T.muted, width: two ? "50%" : "100%" }}>{two ? pg * 2 + 1 : pg + 1}</span>
              {two && <span className="absolute bottom-5 right-0 z-10 w-1/2 text-center text-[11px] tabular-nums sm:bottom-6" style={{ color: T.muted }}>{pg * 2 + 2}</span>}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto px-2 sm:px-6">
            <div className={`rd-text mx-auto ${s.style === "paper" ? "my-8 rounded-[5px] px-6 py-10 shadow-[0_26px_60px_-30px_rgba(30,15,0,.5)] sm:my-12 sm:px-14 sm:py-14" : "px-3 py-10 sm:py-14"}`} style={{ maxWidth: maxW + (s.style === "paper" ? 140 : 40), background: T.bg, ...textStyle }}>{children}</div>
          </div>)}
      </div>
      {pages && <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-1.5 sm:px-4" style={{ borderTop: `1px solid ${T.line}`, background: T.bg }}>
        <button onClick={() => turn(-1)} disabled={pg === 0} className={`${ib} disabled:opacity-30`}><ChevronLeft size={18} /><span className="max-sm:hidden">Previous page</span></button>
        <span className="text-[12px] tabular-nums" style={{ color: T.muted }}>{two ? `Pages ${pg * 2 + 1}–${pg * 2 + 2} of ${n * 2}` : `Page ${pg + 1} of ${n}`}</span>
        <button onClick={() => turn(1)} disabled={pg >= n - 1} className={`${ib} disabled:opacity-30`}><span className="max-sm:hidden">Next page</span><ChevronRight size={18} /></button>
      </div>}
      {pop && <div className="fixed inset-0 z-[70] bg-black/10" onClick={() => setPop("")}><aside className={`absolute top-0 h-full w-[88%] max-w-[340px] overflow-y-auto bg-white p-4 text-zinc-900 shadow-2xl ${pop === "toc" ? "left-0" : "right-0"}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="text-[14px] font-semibold">{pop === "toc" ? "Contents" : "Reading style"}</p><button onClick={() => setPop("")} className="text-zinc-400 hover:text-zinc-900"><X size={18} /></button></div>
        {pop === "toc" ? <ol className="space-y-0.5">{heads.map((h) => <li key={h.id}><button onClick={() => goHead(h.id)} className="block w-full rounded px-2 py-1.5 text-left text-[13.5px] hover:bg-zinc-100" style={{ paddingLeft: 8 + (h.level - 1) * 12 }}>{h.text}</button></li>)}</ol> : panel}
      </aside></div>}
    </div>
  );
}
