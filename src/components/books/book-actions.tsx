"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, PanelLeft, Focus, BookOpenText, Columns2, ArrowRight, Check } from "lucide-react";
import { loadSettings, saveSettings, type ReaderSettings } from "./reader";

/** Start / continue buttons, and the choice of reader, on a book's first page. */
export function BookActions({ slug, first, canParallel }: { slug: string; first: string | null; canParallel: boolean }) {
  const [last, setLast] = useState<{ href: string; title: string; index: number; total: number } | null>(null);
  const [mode, setMode] = useState<ReaderSettings["mode"]>("classic");
  useEffect(() => { try { setLast(JSON.parse(localStorage.getItem(`tj_last_${slug}`) || "null")); } catch {} setMode(loadSettings().mode); }, [slug]);
  const modes = [["classic", "Classic", "Contents beside the text", PanelLeft], ["focus", "Focus", "Only the text", Focus], ["pages", "Pages", "Turn pages like a book", BookOpenText], ["parallel", "Side by side", canParallel ? "Two languages together" : "When a translation is added", Columns2]] as const;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {last ? <>
          <Link href={last.href} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90"><BookOpen size={15} />Continue reading<ArrowRight size={14} /></Link>
          {first && <Link href={first} className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[13.5px] text-ink hover:bg-band">From the beginning</Link>}
        </> : first ? <Link href={first} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90"><BookOpen size={15} />Start reading</Link> : <span className="text-[13px] text-ink-3">The chapters of this book are being added.</span>}
      </div>
      {last && <p className="mt-2 text-[12.5px] text-ink-3">You stopped at <span className="text-ink-2">{last.title}</span> · {Math.round(((last.index + 1) / last.total) * 100)}% read</p>}
      {first && <div className="mt-6">
        <p className="mb-2 text-[12px] font-medium text-ink-3">How would you like to read?</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{modes.map(([k, l, d, I]) => { const off = k === "parallel" && !canParallel; return (
          <button key={k} disabled={off} onClick={() => { saveSettings({ mode: k }); setMode(k); }} className={`relative rounded-lg border p-3 text-left transition disabled:opacity-45 ${mode === k ? "border-ink bg-band/60" : "border-line hover:border-line-strong"}`}>
            <I size={16} className="text-ink-2" /><p className="mt-2 text-[13px] font-medium text-ink">{l}</p><p className="text-[11.5px] leading-snug text-ink-3">{d}</p>
            {mode === k && <Check size={14} className="absolute right-2.5 top-2.5 text-ink" />}
          </button>); })}</div>
        <p className="mt-2 text-[11.5px] text-ink-3">You can change the reader, colours and text size at any time while reading. Press <kbd className="rounded border border-line px-1">?</kbd> in the reader for keyboard shortcuts.</p>
      </div>}
    </div>
  );
}
