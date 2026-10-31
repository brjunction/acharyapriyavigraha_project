"use client";
/* Reading preferences of the WebFolio: colour theme, font, size and page width. Kept on this device. */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Sun, Moon, Coffee, Type, Check, AlignLeft, Maximize2, BookOpen } from "lucide-react";

export type Prefs = { theme: "light" | "sepia" | "dark"; font: "sans" | "serif" | "mono"; size: "s" | "m" | "l" | "xl"; width: "narrow" | "normal" | "wide"; mode: "classic" | "focus" | "book"; side: boolean; toc: boolean; leading: "tight" | "normal" | "loose"; justify: boolean };
const DEF: Prefs = { theme: "light", font: "sans", size: "m", width: "normal", mode: "classic", side: true, toc: true, leading: "normal", justify: false };
export const SIZES: Prefs["size"][] = ["s", "m", "l", "xl"]; export const MODES: [Prefs["mode"], string][] = [["classic", "Classic"], ["focus", "Focus"], ["book", "Book"]];
export const THEME_ORDER: Prefs["theme"][] = ["light", "sepia", "dark"];
const Ctx = createContext<{ p: Prefs; set: (x: Partial<Prefs>) => void }>({ p: DEF, set: () => {} });
export const usePrefs = () => useContext(Ctx);

export function PrefsRoot({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Prefs>(DEF);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("tj_folio") || "null"); if (s) setP({ ...DEF, ...s }); else if (matchMedia("(prefers-color-scheme: dark)").matches) setP({ ...DEF, theme: "dark" }); } catch {} }, []);
  const set = (x: Partial<Prefs>) => setP((o) => { const n = { ...o, ...x }; try { localStorage.setItem("tj_folio", JSON.stringify(n)); } catch {} return n; });
  return <Ctx.Provider value={{ p, set }}><div className="folio min-h-dvh bg-white text-zinc-900 transition-colors" data-theme={p.theme} data-font={p.font} data-size={p.size} data-width={p.width} data-mode={p.mode} data-side={p.side ? "on" : "off"} data-toc={p.toc ? "on" : "off"} data-leading={p.leading} data-justify={p.justify ? "on" : "off"}>{children}</div></Ctx.Provider>;
}

const THEMES: [Prefs["theme"], string, any, string, string][] = [["light", "Light", Sun, "#ffffff", "#18181b"], ["sepia", "Sepia", Coffee, "#f8f1e3", "#33281a"], ["dark", "Dark", Moon, "#111214", "#e8e9ec"]];
/** The theme button in the top bar: cycles light → sepia → dark. */
export function ThemeButton() {
  const { p, set } = usePrefs(); const i = THEMES.findIndex((t) => t[0] === p.theme); const [, l, I] = THEMES[i];
  return <button onClick={() => set({ theme: THEMES[(i + 1) % 3][0] })} title={`Theme: ${l}`} aria-label="Change theme" className="flex size-9 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"><I size={17} /></button>;
}
/** “Aa”: every reading preference in one small panel. */
export function ReadingMenu() {
  const { p, set } = usePrefs(); const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false); const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("mousedown", h); document.addEventListener("keydown", k); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); }; }, [open]);
  const Seg = <K extends keyof Prefs>({ k, opts }: { k: K; opts: [Prefs[K], React.ReactNode][] }) => (
    <div className="grid gap-1 rounded-lg bg-zinc-100 p-1" style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>{opts.map(([v, l]) => <button key={String(v)} onClick={() => set({ [k]: v } as Partial<Prefs>)} className={`h-8 rounded-md text-[12.5px] font-medium transition ${p[k] === v ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"}`}>{l}</button>)}</div>);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} title="Reading settings" aria-label="Reading settings" className={`flex size-9 items-center justify-center rounded-full transition hover:bg-zinc-100 ${open ? "bg-zinc-100 text-zinc-950" : "text-zinc-600"}`}><Type size={17} /></button>
      {open && <div className="absolute right-0 top-11 z-50 max-h-[calc(100dvh-80px)] w-[310px] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,.3)]">
        <p className="mb-2 text-[12px] font-semibold text-zinc-500">Reader</p>
        <div className="mb-4 grid grid-cols-3 gap-2">{MODES.map(([v, l]) => { const I = v === "classic" ? AlignLeft : v === "focus" ? Maximize2 : BookOpen; return <button key={v} onClick={() => set({ mode: v })} className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[12px] font-medium transition ${p.mode === v ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1765cc]" : "border-zinc-200 text-zinc-700 hover:border-zinc-300"}`}><I size={16} />{l}</button>; })}</div>
        <p className="mb-2 text-[12px] font-semibold text-zinc-500">Colours</p>
        <div className="grid grid-cols-3 gap-2">{THEMES.map(([v, l, I, bg, fg]) => <button key={v} onClick={() => set({ theme: v })} className={`relative flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[12px] font-medium transition ${p.theme === v ? "border-[#1a73e8] ring-2 ring-[#1a73e8]/25" : "border-zinc-200"}`} style={{ background: bg, color: fg }}><I size={16} />{l}{p.theme === v && <Check size={12} className="absolute right-1.5 top-1.5 text-[#1a73e8]" />}</button>)}</div>
        <p className="mb-2 mt-4 text-[12px] font-semibold text-zinc-500">Font</p>
        <Seg k="font" opts={[["sans", <span key="s" style={{ fontFamily: "var(--font-sans)" }}>Sans</span>], ["serif", <span key="r" style={{ fontFamily: "var(--font-reading-serif)" }}>Serif</span>], ["mono", <span key="m" className="font-mono">Mono</span>]]} />
        <p className="mb-2 mt-4 text-[12px] font-semibold text-zinc-500">Text size</p>
        <Seg k="size" opts={[["s", <span key="1" className="text-[11px]">A</span>], ["m", <span key="2" className="text-[13px]">A</span>], ["l", <span key="3" className="text-[15px]">A</span>], ["xl", <span key="4" className="text-[17px]">A</span>]]} />
        <p className="mb-2 mt-4 text-[12px] font-semibold text-zinc-500">Page width</p>
        <Seg k="width" opts={[["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"]]} />
        <p className="mb-2 mt-4 text-[12px] font-semibold text-zinc-500">Line spacing</p>
        <Seg k="leading" opts={[["tight", "Tight"], ["normal", "Normal"], ["loose", "Loose"]]} />
        <div className="mt-4 space-y-1 border-t border-zinc-200 pt-3">{([["side", "Contents on the left", "["], ["toc", "“On this page” on the right", "]"], ["justify", "Justify the text", ""]] as const).map(([k, l, key]) => <label key={k} className="flex cursor-pointer items-center justify-between py-1 text-[13px] text-zinc-800"><span>{l}{key && <kbd className="ml-2 rounded border border-zinc-200 px-1 text-[10.5px] text-zinc-500">{key}</kbd>}</span><input type="checkbox" checked={p[k]} onChange={(e) => set({ [k]: e.target.checked } as Partial<Prefs>)} className="size-4 accent-[#1a73e8]" /></label>)}</div>
      </div>}
    </div>
  );
}
