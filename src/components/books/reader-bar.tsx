"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, List, Type, Minus, Plus, X } from "lucide-react";

type S = { size: number; font: "serif" | "sans"; leading: number; width: number };
const DEF: S = { size: 18, font: "serif", leading: 1.8, width: 680 };
const load = (): S => { try { return { ...DEF, ...JSON.parse(localStorage.getItem("tj_reader") || "{}") }; } catch { return DEF; } };
/** Applies the reader’s chosen size, font, spacing and width to the text. */
function apply(s: S) { const el = document.getElementById("book-text"); if (!el) return; el.style.fontSize = `${s.size}px`; el.style.lineHeight = String(s.leading); el.style.maxWidth = `${s.width}px`; el.style.fontFamily = s.font === "serif" ? "var(--font-reading-serif)" : "var(--font-sans)"; }

/** The bar above a chapter: contents, the book and chapter, text settings, previous and next. */
export function ReaderBar({ book, chapter, prev, next, toc }: { book: { title: string; href: string }; chapter: string; prev?: { href: string; title: string } | null; next?: { href: string; title: string } | null; toc: React.ReactNode }) {
  const [s, setS] = useState<S>(DEF); const [aa, setAa] = useState(false); const [contents, setContents] = useState(false); const [pct, setPct] = useState(0); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const x = load(); setS(x); apply(x); }, []);
  const set = (p: Partial<S>) => { const x = { ...s, ...p }; setS(x); apply(x); try { localStorage.setItem("tj_reader", JSON.stringify(x)); } catch {} };
  useEffect(() => { const f = () => { const h = document.documentElement; setPct(Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100)); }; f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { if (!aa) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setAa(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [aa]);
  const btn = "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ink-2 hover:bg-band";
  return (
    <>
      <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto flex h-11 max-w-[1100px] items-center gap-1 px-3 sm:px-5">
          <button onClick={() => setContents(true)} className={btn}><List size={15} /><span className="hidden sm:inline">Contents</span></button>
          <p className="min-w-0 flex-1 truncate px-2 text-center text-[12.5px] text-ink-3"><Link href={book.href} className="hover:text-ink">{book.title}</Link><span className="mx-1.5">/</span><span className="text-ink-2">{chapter}</span></p>
          <div ref={ref} className="relative">
            <button onClick={() => setAa(!aa)} className={btn} aria-label="Text settings"><Type size={15} /><span className="hidden sm:inline">Text</span></button>
            {aa && <div className="absolute right-0 top-10 w-[260px] rounded-lg border border-line bg-white p-3 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.25)]">
              <p className="text-[12px] font-medium text-ink-3">Size</p>
              <div className="mt-1.5 flex items-center gap-2"><button onClick={() => set({ size: Math.max(14, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Minus size={14} /></button><span className="flex-1 text-center text-[13px] tabular-nums">{s.size}px</span><button onClick={() => set({ size: Math.min(28, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Plus size={14} /></button></div>
              <p className="mt-3 text-[12px] font-medium text-ink-3">Font</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-md bg-band p-0.5">{(["serif", "sans"] as const).map((f) => <button key={f} onClick={() => set({ font: f })} className={`rounded px-2 py-1 text-[13px] ${s.font === f ? "bg-white shadow-sm" : "text-ink-2"}`} style={{ fontFamily: f === "serif" ? "var(--font-reading-serif)" : "var(--font-sans)" }}>{f === "serif" ? "Serif" : "Sans"}</button>)}</div>
              <p className="mt-3 text-[12px] font-medium text-ink-3">Line spacing</p>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md bg-band p-0.5">{[[1.55, "Tight"], [1.8, "Normal"], [2.1, "Loose"]].map(([v, l]) => <button key={l} onClick={() => set({ leading: v as number })} className={`rounded px-2 py-1 text-[12.5px] ${s.leading === v ? "bg-white shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
              <p className="mt-3 text-[12px] font-medium text-ink-3">Width</p>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md bg-band p-0.5">{[[600, "Narrow"], [680, "Normal"], [820, "Wide"]].map(([v, l]) => <button key={l} onClick={() => set({ width: v as number })} className={`rounded px-2 py-1 text-[12.5px] ${s.width === v ? "bg-white shadow-sm" : "text-ink-2"}`}>{l}</button>)}</div>
              <button onClick={() => set(DEF)} className="mt-3 w-full text-[12px] text-ink-3 hover:text-ink">Reset</button>
            </div>}
          </div>
          {prev ? <Link href={prev.href} className={btn} title={prev.title} aria-label="Previous chapter"><ChevronLeft size={16} /></Link> : <span className="w-8" />}
          {next ? <Link href={next.href} className={btn} title={next.title} aria-label="Next chapter"><ChevronRight size={16} /></Link> : <span className="w-8" />}
        </div>
        <div className="h-0.5 bg-transparent"><div className="h-full bg-ink/70 transition-[width]" style={{ width: `${pct}%` }} /></div>
      </div>
      {contents && <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setContents(false)}><aside className="h-full w-[88%] max-w-[360px] overflow-y-auto bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><Link href={book.href} className="text-[14px] font-semibold">{book.title}</Link><button onClick={() => setContents(false)}><X size={18} /></button></div>{toc}</aside></div>}
    </>
  );
}
