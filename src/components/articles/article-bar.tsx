"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Type, Link2, Check, Minus, Plus } from "lucide-react";

type S = { size: number; serif: boolean };
const load = (): S => { try { return { size: 18, serif: false, ...JSON.parse(localStorage.getItem("tj_article") || "{}") }; } catch { return { size: 18, serif: false }; } };
const apply = (s: S) => { const el = document.getElementById("article-text"); if (!el) return; el.style.fontSize = `${s.size}px`; el.style.fontFamily = s.serif ? "var(--font-reading-serif)" : "var(--font-sans)"; };

/** A thin bar while reading an article: back, text size and font, copy link, and how far you have read. */
export function ArticleBar({ title }: { title: string }) {
  const [s, setS] = useState<S>({ size: 18, serif: false }); const [open, setOpen] = useState(false); const [pct, setPct] = useState(0); const [done, setDone] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const x = load(); setS(x); apply(x); }, []);
  const set = (p: Partial<S>) => { const x = { ...s, ...p }; setS(x); apply(x); try { localStorage.setItem("tj_article", JSON.stringify(x)); } catch {} };
  useEffect(() => { const f = () => { const el = document.getElementById("article-text"); if (!el) return; const r = el.getBoundingClientRect(); setPct(Math.max(0, Math.min(100, ((window.innerHeight - r.top) / r.height) * 100))); }; f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  const b = "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ink-2 hover:bg-band";
  return (
    <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
      <div className="mx-auto flex h-11 max-w-[1100px] items-center gap-1 px-3 sm:px-5">
        <Link href="/teachings/articles" className={b}><ArrowLeft size={15} /><span className="hidden sm:inline">Articles</span></Link>
        <p className="min-w-0 flex-1 truncate px-2 text-center text-[12.5px] text-ink-3">{title}</p>
        <button onClick={() => { navigator.clipboard?.writeText(location.href); setDone(true); setTimeout(() => setDone(false), 1400); }} className={b} title="Copy link">{done ? <Check size={15} /> : <Link2 size={15} />}</button>
        <div ref={ref} className="relative"><button onClick={() => setOpen(!open)} className={b} title="Text"><Type size={15} /><span className="hidden sm:inline">Text</span></button>
          {open && <div className="absolute right-0 top-10 w-[230px] rounded-lg border border-line bg-white p-3 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.25)]">
            <p className="text-[12px] font-medium text-ink-3">Size</p>
            <div className="mt-1.5 flex items-center gap-2"><button onClick={() => set({ size: Math.max(14, s.size - 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Minus size={14} /></button><span className="flex-1 text-center text-[13px] tabular-nums">{s.size}px</span><button onClick={() => set({ size: Math.min(26, s.size + 1) })} className="flex size-8 items-center justify-center rounded-md border border-line"><Plus size={14} /></button></div>
            <p className="mt-3 text-[12px] font-medium text-ink-3">Font</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-md bg-band p-0.5">{([true, false] as const).map((v) => <button key={String(v)} onClick={() => set({ serif: v })} className={`rounded px-2 py-1 text-[13px] ${s.serif === v ? "bg-white shadow-sm" : "text-ink-2"}`} style={{ fontFamily: v ? "var(--font-reading-serif)" : "var(--font-sans)" }}>{v ? "Serif" : "Sans"}</button>)}</div>
          </div>}
        </div>
      </div>
      <div className="h-0.5"><div className="h-full bg-ink/70" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
