"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, ArrowRight } from "lucide-react";
/** “Continue reading”: the last WebFolio page opened on this device. */
export function ContinueReading() {
  const [l, setL] = useState<{ href: string; title: string; at: number } | null>(null);
  useEffect(() => { try { const x = JSON.parse(localStorage.getItem("tj_folio_last") || "null"); if (x?.href) setL(x); } catch {} }, []);
  if (!l) return null;
  const ago = (() => { const m = Math.round((Date.now() - l.at) / 60000); return m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`; })();
  return <Link href={l.href} className="group mx-auto mt-10 flex max-w-[640px] items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ea] text-[#137333]"><BookOpenCheck size={20} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-zinc-500">Continue reading · {ago}</span><span className="block truncate text-[15px] font-semibold text-zinc-950">{l.title}</span></span><ArrowRight size={18} className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-950" /></Link>;
}
