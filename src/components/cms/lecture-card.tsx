"use client";
import Link from "next/link";
import { PlayButton } from "@/components/lecture";
import type { Lecture } from "@/lib/data";

export function LectureCard({ l }: { l: Lecture }) {
  return (
    <div className="my-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
      <PlayButton l={l} size={48} />
      <div className="min-w-0"><Link href={l.href || "#"} className="block truncate text-[14.5px] font-semibold hover:text-saffron">{l.title}</Link><p className="truncate text-[12.5px] text-ink-3">{[l.date, l.place, l.scripture].filter(Boolean).join(" · ")}</p></div>
    </div>
  );
}
