"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { readerKind, type ReaderKind } from "@/lib/reader-pref";

/** One clear way in: Start reading (or Continue). Books open in Pāṭha, the page reader; scrolling instead is a choice
    inside the reader's Settings, so nobody has to decide anything before reading. */
export function BookActions({ slug, first }: { slug: string; first: string | null; canParallel?: boolean }) {
  const [last, setLast] = useState<{ href: string; title: string; index: number; total: number } | null>(null);
  const [kind, setKind] = useState<ReaderKind>("patha");
  useEffect(() => { try { setLast(JSON.parse(localStorage.getItem(`tj_last_${slug}`) || "null")); } catch {} setKind(readerKind()); }, [slug]);
  if (!first) return <span className="text-[13px] text-ink-3">The chapters of this book are being added.</span>;
  const pages = `/books/${slug}/read`;
  const cont = kind === "patha" ? pages : last?.href && !last.href.endsWith("/read") ? last.href : first;
  const start = kind === "patha" ? `${pages}?c=start` : first;
  const big = "inline-flex h-11 items-center gap-2 rounded-md bg-ink px-5 text-[14px] font-medium text-white hover:bg-ink/90";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {last ? <>
          <Link href={cont} className={big}><BookOpen size={16} />Continue reading<ArrowRight size={15} /></Link>
          <Link href={start} className="inline-flex h-11 items-center rounded-md border border-line-strong px-4 text-[13.5px] text-ink hover:bg-band">From the beginning</Link>
        </> : <Link href={start} className={big}><BookOpen size={16} />Start reading</Link>}
      </div>
      {last && <p className="mt-2.5 flex items-center gap-2 text-[12.5px] text-ink-3"><span className="inline-block h-1 w-20 overflow-hidden rounded-full bg-band"><span className="block h-full bg-saffron/80" style={{ width: `${Math.round(((last.index + 1) / last.total) * 100)}%` }} /></span>{Math.round(((last.index + 1) / last.total) * 100)}% · {last.title}</p>}
      <p className="mt-3 text-[12px] text-ink-3">{kind === "patha" ? "Opens as pages, like a printed book. Text size, colours and more are under Aa Settings while reading." : "Opens one chapter at a time, scrolling. Pages can be chosen again under Settings while reading."}</p>
    </div>
  );
}
