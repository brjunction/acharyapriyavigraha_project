"use client";
/* Page numbers for long lists — large, plain and easy to press: ‹ Previous  1 … 4 5 6 … 20  Next ›
   The page is kept in the address (?page=3) so Back and shared links return to the same page. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const nums = (p: number, n: number): (number | "…")[] => {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  const s = new Set([1, n, p - 1, p, p + 1].filter((x) => x >= 1 && x <= n)); const a = [...s].sort((x, y) => x - y); const out: (number | "…")[] = [];
  a.forEach((x, i) => { if (i && x - a[i - 1] > 1) out.push("…"); out.push(x); }); return out;
};

/** Slices a list into pages. `reset` — when any of these change (a filter, a search), go back to page 1. */
export function usePages<T>(items: T[], per: number, reset: unknown[] = [], key = "page") {
  const [page, setPage] = useState(1); const top = useRef<HTMLDivElement>(null); const first = useRef(true);
  useEffect(() => { try { const p = Number(new URLSearchParams(location.search).get(key)); if (p > 1) setPage(p); } catch {} }, [key]);
  useEffect(() => { if (first.current) { first.current = false; return; } setPage(1); }, reset); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(items.length / per)); const cur = Math.min(page, pages);
  const go = useCallback((p: number) => {
    setPage(p);
    try { const u = new URL(location.href); if (p > 1) u.searchParams.set(key, String(p)); else u.searchParams.delete(key); history.replaceState(history.state, "", u.toString()); } catch {}
    const el = top.current; if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" }); }
  }, [key]);
  return { page: cur, pages, go, top, slice: items.slice((cur - 1) * per, cur * per), from: (cur - 1) * per };
}

export function Pager({ page, pages, go, total, per, label = "items", className = "" }: { page: number; pages: number; go: (p: number) => void; total?: number; per?: number; label?: string; className?: string }) {
  if (pages <= 1) return null;
  const btn = "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[14.5px] font-medium tabular-nums transition";
  return (
    <nav aria-label="Pages" className={`flex flex-col items-center gap-2 pt-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button onClick={() => go(page - 1)} disabled={page <= 1} className={`${btn} gap-1 border border-line bg-white pr-4 text-ink hover:border-line-strong disabled:opacity-35`}><ChevronLeft size={17} /><span className="max-sm:hidden">Previous</span></button>
        {nums(page, pages).map((x, i) => x === "…" ? <span key={`e${i}`} className="px-1 text-ink-3">…</span>
          : <button key={x} onClick={() => go(x)} aria-current={x === page ? "page" : undefined} className={`${btn} ${x === page ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}>{x}</button>)}
        <button onClick={() => go(page + 1)} disabled={page >= pages} className={`${btn} gap-1 border border-line bg-white pl-4 text-ink hover:border-line-strong disabled:opacity-35`}><span className="max-sm:hidden">Next</span><ChevronRight size={17} /></button>
      </div>
      {total !== undefined && per && <p className="text-[12.5px] tabular-nums text-ink-3">{((page - 1) * per + 1).toLocaleString()}–{Math.min(total, page * per).toLocaleString()} of {total.toLocaleString()} {label}</p>}
    </nav>
  );
}
