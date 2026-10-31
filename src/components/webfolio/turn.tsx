"use client";
/* Moving through the WebFolio: a reading-progress line, page arrows at the edges of the screen, “Up next” at the end,
   and the Book reader’s page turning (← → and Space). */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, CornerLeftUp } from "lucide-react";
import { usePrefs } from "./prefs";

type Nb = { title: string; href: string } | null;
const body = () => document.querySelector<HTMLElement>(".folio-body");

export function PageTurn({ prev, next, up }: { prev?: Nb; next?: Nb; up?: { href: string; label: string } | null }) {
  const { p } = usePrefs(); const router = useRouter(); const book = p.mode === "book";
  const [pct, setPct] = useState(0); const [pg, setPg] = useState({ at: 1, of: 1 });
  // progress: page scroll, or the columns of the Book reader
  useEffect(() => {
    const el = body();
    const upd = () => {
      if (book && el) { const w = el.clientWidth + 64; const of = Math.max(1, Math.round((el.scrollWidth + 64) / w)); const at = Math.min(of, Math.round(el.scrollLeft / w) + 1); setPg({ at, of }); setPct(of > 1 ? ((at - 1) / (of - 1)) * 100 : 100); }
      else { const h = document.documentElement; const m = h.scrollHeight - h.clientHeight; setPct(m > 0 ? Math.min(100, (h.scrollTop / m) * 100) : 100); }
    };
    upd(); const t = setTimeout(upd, 400);
    window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); el?.addEventListener("scroll", upd, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); el?.removeEventListener("scroll", upd); };
  }, [book, p.size, p.font, p.width]);
  const flip = (d: number) => {
    const el = body();
    if (book && el) { const w = el.clientWidth + 64; const max = el.scrollWidth - el.clientWidth - 4; if ((d > 0 && el.scrollLeft < max) || (d < 0 && el.scrollLeft > 4)) { el.scrollBy({ left: d * w }); return; } }
    const to = d > 0 ? next : prev; if (to) router.push(to.href);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement).closest("input,textarea,select,[contenteditable]")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); flip(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); flip(-1); }
      else if (book && e.key === " ") { e.preventDefault(); flip(e.shiftKey ? -1 : 1); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const edge = "group fixed top-1/2 z-30 hidden -translate-y-1/2 items-center xl:flex";
  const btn = "flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-600 shadow-[0_6px_18px_-8px_rgba(0,0,0,.35)] backdrop-blur transition hover:scale-105 hover:text-zinc-950";
  const tip = "pointer-events-none max-w-[220px] truncate rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100";
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"><div className="h-full bg-[#1a73e8] transition-[width] duration-150" style={{ width: `${pct}%` }} /></div>
      {(prev || book) && <div className={`${edge} ${p.side && p.mode === "classic" ? "left-[300px]" : "left-4"} gap-2`}><button onClick={() => flip(-1)} aria-label="Previous" className={btn}><ChevronLeft size={20} /></button>{prev && !book && <span className={tip}>{prev.title}</span>}</div>}
      {(next || book) && <div className={`${edge} right-4 flex-row-reverse gap-2`}><button onClick={() => flip(1)} aria-label="Next" className={btn}><ChevronRight size={20} /></button>{next && !book && <span className={tip}>{next.title}</span>}</div>}
      {book && <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-white/95 p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,.35)] backdrop-blur">
        <button onClick={() => flip(-1)} className="flex size-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100" aria-label="Previous page"><ChevronLeft size={17} /></button>
        <span className="min-w-[92px] text-center text-[12.5px] font-medium tabular-nums text-zinc-700">Page {pg.at} of {pg.of}</span>
        <button onClick={() => flip(1)} className="flex size-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100" aria-label="Next page"><ChevronRight size={17} /></button>
      </div>}
      {/* hidden anchors for the N / P / U shortcuts */}
      {prev && <Link href={prev.href} data-folio-prev className="hidden" aria-hidden tabIndex={-1}>.</Link>}
      {next && <Link href={next.href} data-folio-next className="hidden" aria-hidden tabIndex={-1}>.</Link>}
      {up && <Link href={up.href} data-folio-up className="hidden" aria-hidden tabIndex={-1}>.</Link>}
    </>
  );
}

/** The end of a page: what comes next, as one clear card, and where you came from. */
export function UpNext({ prev, next, up }: { prev?: Nb; next?: Nb; up?: { href: string; label: string } | null }) {
  if (!prev && !next) return null;
  return (
    <div className="mt-16">
      {next && <Link href={next.href} className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:border-zinc-300 hover:bg-white hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,.35)]">
        <span className="min-w-0 flex-1"><span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Up next</span><span className="mt-1 block truncate text-[18px] font-semibold tracking-tight text-zinc-950">{next.title}</span></span>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-white shadow-[0_6px_16px_-6px_rgba(26,115,232,.6)] transition group-hover:translate-x-0.5"><ArrowRight size={19} /></span>
      </Link>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[13px]">
        {prev ? <Link href={prev.href} className="inline-flex min-w-0 items-center gap-1.5 text-zinc-500 hover:text-zinc-950"><ChevronLeft size={15} /><span className="truncate">{prev.title}</span></Link> : <span />}
        {up && <Link href={up.href} className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950"><CornerLeftUp size={14} />{up.label}</Link>}
      </div>
      <p className="mt-6 hidden text-center text-[11.5px] text-zinc-400 md:block">Tip: press <kbd className="rounded border border-zinc-200 px-1">N</kbd> or <kbd className="rounded border border-zinc-200 px-1">→</kbd> for the next page, <kbd className="rounded border border-zinc-200 px-1">?</kbd> for every shortcut.</p>
    </div>
  );
}
