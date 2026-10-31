"use client";
import { useEffect, useRef, useState } from "react";
import { PanelRightClose, PanelRightOpen, ChevronUp, ChevronDown, Type, Minus, Plus, Check } from "lucide-react";
import { THEMES, FONTS, type Theme, type FontK } from "@/components/books/reader";

type Style = "classic" | "wide" | "paper" | "focus";
type S = { style: Style; theme: Theme; font: FontK; size: number; leading: number; aside: boolean; player: boolean };
const DEF: S = { style: "classic", theme: "light", font: "sans", size: 18, leading: 1.8, aside: true, player: true };
const STYLES: [Style, string, string][] = [["classic", "Classic", "A calm column of text"], ["wide", "Wide", "Longer lines, more on the screen"], ["paper", "Paper", "The text on a page"], ["focus", "Focus", "Large text, nothing else"]];
const load = (): S => { try { return { ...DEF, ...JSON.parse(localStorage.getItem("tj_transcript") || "{}") }; } catch { return DEF; } };

/** The lecture page: a player you can tuck away, details you can fold to the side, and the transcription in the style you like. */
export function LectureLayout({ head, player, transcript, aside, label }: { head: React.ReactNode; player: React.ReactNode; transcript: React.ReactNode; aside: React.ReactNode; label: string }) {
  const [s, setS] = useState<S>(DEF); const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setS(load()), []);
  const set = (p: Partial<S>) => setS((o) => { const x = { ...o, ...p }; try { localStorage.setItem("tj_transcript", JSON.stringify(x)); } catch {} return x; });
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  const T = THEMES[s.theme]; const dark = ["dusk", "slate", "dark"].includes(s.theme);
  const width = s.style === "wide" ? 900 : s.style === "focus" ? 760 : 700; const size = s.style === "focus" ? s.size + 3 : s.size;
  const btn = "flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[12.5px] text-ink-2 hover:bg-band";
  return (
    <div className={`mt-6 grid gap-10 ${s.aside ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
      <article className="min-w-0">
        {head}
        {s.player ? <div className="mt-5 flex items-start gap-2"><div className="min-w-0 flex-1">{player}</div><button onClick={() => set({ player: false })} title="Hide this player — the player at the bottom keeps playing" className="mt-2.5 flex size-8 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-band hover:text-ink"><ChevronUp size={16} /></button></div>
          : <button onClick={() => set({ player: true })} className="mt-4 inline-flex h-7 items-center gap-1 rounded-full border border-line px-3 text-[12px] text-ink-3 hover:text-ink"><ChevronDown size={13} />Show the player here</button>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
          <h2 className="text-[17px] font-semibold text-ink">{label}</h2>
          <div className="flex items-center gap-1.5">
            <div ref={ref} className="relative"><button onClick={() => setOpen(!open)} className={btn}><Type size={14} />Reading style</button>
              {open && <div className="absolute right-0 top-10 z-30 w-[300px] rounded-xl border border-line bg-white p-3 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.3)]">
                <p className="mb-1.5 text-[11.5px] font-medium text-ink-3">Style</p>
                <div className="grid grid-cols-2 gap-1.5">{STYLES.map(([k, l, d]) => <button key={k} onClick={() => set({ style: k })} className={`rounded-lg border p-2 text-left ${s.style === k ? "border-ink" : "border-line hover:border-line-strong"}`}><span className="flex items-center justify-between text-[12.5px] font-medium text-ink">{l}{s.style === k && <Check size={13} />}</span><span className="block text-[11px] leading-snug text-ink-3">{d}</span></button>)}</div>
                <p className="mb-1.5 mt-3 text-[11.5px] font-medium text-ink-3">Colour</p>
                <div className="grid grid-cols-4 gap-1.5">{(Object.keys(THEMES) as Theme[]).map((k) => <button key={k} onClick={() => set({ theme: k })} title={THEMES[k].label} className={`flex flex-col items-center gap-1 rounded-lg border p-1 text-[10.5px] text-ink-2 ${s.theme === k ? "border-ink" : "border-line"}`}><span className="flex h-6 w-full items-center justify-center rounded border border-black/10 text-[11px] font-semibold" style={{ background: THEMES[k].bg, color: THEMES[k].ink, fontFamily: "Georgia, serif" }}>Aa</span>{THEMES[k].label}</button>)}</div>
                <p className="mb-1.5 mt-3 text-[11.5px] font-medium text-ink-3">Font</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-band p-0.5">{(Object.keys(FONTS) as FontK[]).map((k) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md px-2 py-1.5 text-[13px] ${s.font === k ? "bg-white shadow-sm" : "text-ink-2"}`} style={{ fontFamily: FONTS[k][1] }}>{FONTS[k][0]}</button>)}</div>
                <p className="mb-1.5 mt-3 text-[11.5px] font-medium text-ink-3">Size</p>
                <div className="flex items-center gap-2"><button onClick={() => set({ size: Math.max(14, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Minus size={14} /></button><input type="range" min={14} max={28} value={s.size} onChange={(e) => set({ size: +e.target.value })} className="flex-1 accent-[#1a1a1a]" /><button onClick={() => set({ size: Math.min(28, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Plus size={14} /></button></div>
                <p className="mb-1.5 mt-3 text-[11.5px] font-medium text-ink-3">Line spacing</p>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-band p-0.5">{([[1.55, "Compact"], [1.8, "Normal"], [2.05, "Relaxed"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ leading: v })} className={`rounded-md px-2 py-1 text-[12px] ${s.leading === v ? "bg-white shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
                <button onClick={() => set({ ...DEF, aside: s.aside, player: s.player })} className="mt-3 w-full rounded-md py-1.5 text-[12px] text-ink-3 hover:bg-band">Reset</button>
              </div>}
            </div>
            <button onClick={() => set({ aside: !s.aside })} className={`${btn} hidden lg:flex`} title={s.aside ? "Hide the details" : "Show the details"}>{s.aside ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}{s.aside ? "Hide details" : "Details"}</button>
          </div>
        </div>
        <div className={`rd-text ${dark ? "rd-dark" : ""} mt-6 transition-colors ${s.style === "paper" ? "rounded-2xl border px-6 py-8 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.4)] sm:px-12 sm:py-12" : s.theme !== "light" ? "rounded-2xl px-5 py-6 sm:px-8" : ""}`} style={{ background: s.theme === "light" && s.style !== "paper" ? undefined : T.bg, color: T.ink, borderColor: T.line, ["--rd-ink" as any]: T.ink, ["--rd-muted" as any]: T.muted, ["--rd-line" as any]: T.line }}>
          <div className="mx-auto" style={{ maxWidth: width, fontFamily: FONTS[s.font][1], fontSize: size, lineHeight: s.leading }}>{transcript}</div>
        </div>
      </article>
      {s.aside && <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">{aside}</aside>}
    </div>
  );
}
