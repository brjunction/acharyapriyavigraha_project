"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Type, Link2, Check, Minus, Plus } from "lucide-react";

type S = { size: number; serif: boolean; tone: "light" | "sepia" | "dark"; leading: number; wide: boolean };
const D: S = { size: 18, serif: false, tone: "light", leading: 1.8, wide: false };
const load = (): S => { try { return { ...D, ...JSON.parse(localStorage.getItem("tj_article") || "{}") }; } catch { return D; } };
const apply = (s: S) => { const el = document.getElementById("article-text"); if (!el) return; el.style.fontSize = `${s.size}px`; el.style.lineHeight = String(s.leading); el.style.fontFamily = s.serif ? "var(--font-reading-serif)" : "var(--font-sans)";
  const pg = document.getElementById("article-page"); if (pg) { if (s.tone === "light") delete pg.dataset.theme; else pg.dataset.theme = s.tone; } const col = document.getElementById("article-col"); if (col) col.style.maxWidth = s.wide ? "820px" : ""; };

/** A thin bar while reading an article: back, text size and font, copy link, how far you have read — and an offer to continue where you stopped last time. */
export function ArticleBar({ title }: { title: string }) {
  const [s, setS] = useState<S>(D); const [open, setOpen] = useState(false); const [pct, setPct] = useState(0); const [done, setDone] = useState(false); const [resume, setResume] = useState<number | null>(null); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const x = load(); setS(x); apply(x); }, []);
  const set = (p: Partial<S>) => { const x = { ...s, ...p }; setS(x); apply(x); try { localStorage.setItem("tj_article", JSON.stringify(x)); } catch {} };
  useEffect(() => {
    // where this reader stopped last time (per article, this browser only)
    const key = `tj_article_at:${location.pathname}`; let saved = 0; try { saved = Number(localStorage.getItem(key) || 0); } catch {}
    if (saved > 4 && saved < 95 && !location.hash) setResume(saved);
    let t: ReturnType<typeof setTimeout> | undefined;
    const y0 = window.scrollY;
    const f = () => { const el = document.getElementById("article-text"); if (!el) return; const r = el.getBoundingClientRect(); const v = Math.max(0, Math.min(100, ((window.innerHeight - r.top) / r.height) * 100)); setPct(v);
      // the place to come back to: how far down the text the top of the screen is
      const at = Math.max(0, Math.min(100, ((130 - r.top) / r.height) * 100)); if (Math.abs(window.scrollY - y0) > 200) setResume(null);
      clearTimeout(t); t = setTimeout(() => { try { if (v >= 98) localStorage.removeItem(key); else if (at > 3) localStorage.setItem(key, String(Math.round(at))); } catch {} }, 400); };
    f(); window.addEventListener("scroll", f, { passive: true }); return () => { window.removeEventListener("scroll", f); clearTimeout(t); };
  }, []);
  const goResume = () => { const el = document.getElementById("article-text"); if (!el || resume == null) return; const r = el.getBoundingClientRect(); window.scrollTo({ top: window.scrollY + r.top + (resume / 100) * r.height - 130, behavior: "smooth" }); setResume(null); };
  // + and − change the text size (not while typing in a field)
  useEffect(() => { const k = (e: KeyboardEvent) => { const tg = e.target as HTMLElement; if (e.ctrlKey || e.metaKey || e.altKey || tg.closest("input, textarea, select, [contenteditable=true]")) return;
    if (e.key === "+" || e.key === "=") set({ size: Math.min(26, s.size + 1) }); else if (e.key === "-" || e.key === "_") set({ size: Math.max(14, s.size - 1) }); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  const b = "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ink-2 hover:bg-band";
  return (
    <div className="sticky top-[52px] z-30 border-b border-line bg-page/95 backdrop-blur sm:top-[58px]">
      <div className="relative mx-auto flex h-11 max-w-[1100px] items-center gap-1 px-3 sm:px-5">
        <Link href="/teachings/articles" className={b}><ArrowLeft size={15} /><span className="hidden sm:inline">Articles</span></Link>
        <p className="pointer-events-none absolute left-1/2 top-1/2 w-[calc(100%-240px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[12.5px] text-ink-3">{title}</p><span className="flex-1" />
        <button onClick={() => { navigator.clipboard?.writeText(location.href); setDone(true); setTimeout(() => setDone(false), 1400); }} className={b} title="Copy link">{done ? <Check size={15} /> : <Link2 size={15} />}</button>
        <div ref={ref} className="relative"><button onClick={() => setOpen(!open)} className={b} title="Text"><Type size={15} /><span className="hidden sm:inline">Text</span></button>
          {open && <div className="absolute right-0 top-10 w-[250px] rounded-lg border border-line bg-surface p-3 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.25)]">
            <p className="text-[12px] font-medium text-ink-3">Size</p>
            <div className="mt-1.5 flex items-center gap-2"><button onClick={() => set({ size: Math.max(14, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Minus size={14} /></button><span className="flex-1 text-center text-[13px] tabular-nums">{s.size}px</span><button onClick={() => set({ size: Math.min(26, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Plus size={14} /></button></div>
            <p className="mt-3 text-[12px] font-medium text-ink-3">Font</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-md bg-band p-0.5">{([true, false] as const).map((v) => <button key={String(v)} onClick={() => set({ serif: v })} className={`rounded px-2 py-1 text-[13px] ${s.serif === v ? "bg-surface shadow-sm" : "text-ink-2"}`} style={{ fontFamily: v ? "var(--font-reading-serif)" : "var(--font-sans)" }}>{v ? "Serif" : "Sans"}</button>)}</div>
            <p className="mt-3 text-[12px] font-medium text-ink-3">Colour</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">{([["light", "Light", "#ffffff", "#1a1a1a"], ["sepia", "Sepia", "#f2eadb", "#3a2c1f"], ["dark", "Night", "#16110d", "#efe7df"]] as const).map(([k, l, bg, fg]) => <button key={k} onClick={() => set({ tone: k })} className={`rounded-md border py-1.5 text-[12.5px] ${s.tone === k ? "ring-2 ring-saffron" : "border-line"}`} style={{ background: bg, color: fg }}>{l}</button>)}</div>
            <p className="mt-3 text-[12px] font-medium text-ink-3">Line spacing</p>
            <div className="mt-1.5 grid gap-1 rounded-md bg-band p-0.5 grid-cols-3">{([[1.6, "Compact"], [1.8, "Normal"], [2.05, "Relaxed"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ leading: v })} className={`rounded px-1 py-1 text-[12.5px] ${s.leading === v ? "bg-surface shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
            <p className="mt-3 text-[12px] font-medium text-ink-3">Width</p>
            <div className="mt-1.5 grid gap-1 rounded-md bg-band p-0.5 grid-cols-2">{([[false, "Normal"], [true, "Wide"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ wide: v })} className={`rounded px-1 py-1 text-[12.5px] ${s.wide === v ? "bg-surface shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
            <button onClick={() => set(D)} className="mt-3 w-full rounded-md py-1.5 text-[12px] text-ink-3 hover:bg-band">Reset</button>
          </div>}
        </div>
      </div>
      <div className="h-0.5"><div className="h-full bg-ink/70" style={{ width: `${pct}%` }} /></div>
      {resume != null && <div className="pointer-events-none absolute inset-x-0 top-full flex justify-center pt-3"><div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-4 pr-1 text-[13px] shadow-[0_8px_28px_-10px_rgba(0,0,0,0.3)]">
        <span className="text-ink-2">You read {resume}% last time</span>
        <button onClick={goResume} className="ml-2 rounded-full bg-saffron px-3 py-1 text-[12.5px] font-medium text-white hover:opacity-90">Continue</button>
        <button onClick={() => setResume(null)} className="rounded-full px-2.5 py-1 text-[12.5px] text-ink-3 hover:bg-band">Start over</button>
      </div></div>}
    </div>
  );
}
