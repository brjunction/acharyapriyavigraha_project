"use client";
import { RotateCcw, RotateCw, Download, Link2, Check } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/components/providers";
import { PlayButton } from "@/components/lecture";
import type { Lecture } from "@/lib/data";

const clock = (s: number) => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`; };

/** A slim player for one lecture: play, ±15 s, progress, download and a link to this moment. */
export function LecturePlayer({ l }: { l: Lecture }) {
  const { track, time, seek } = usePlayer(); const mine = track?.slug === l.slug; const t = mine ? time : 0; const pct = l.duration ? Math.min(100, (t / l.duration) * 100) : 0;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-3 sm:gap-4">
      <PlayButton l={l} size={40} />
      <button disabled={!mine} onClick={() => seek(t - 15)} className="text-ink-3 hover:text-ink disabled:opacity-30" title="Back 15 seconds"><RotateCcw size={16} /></button>
      <button disabled={!mine} onClick={() => seek(t + 15)} className="text-ink-3 hover:text-ink disabled:opacity-30" title="Forward 15 seconds"><RotateCw size={16} /></button>
      <div className="flex min-w-[180px] flex-1 items-center gap-2 text-[11.5px] tabular-nums text-ink-3">
        <span className="w-12 text-right">{clock(t)}</span>
        <div className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-band" onClick={(e) => { if (!mine || !l.duration) return; const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * l.duration); }}><div className="absolute inset-y-0 left-0 rounded-full bg-saffron" style={{ width: `${pct}%` }} /></div>
        <span className="w-12">{l.duration ? clock(l.duration) : "—"}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}${mine && t > 5 ? `?t=${Math.floor(t)}` : ""}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} title={mine && t > 5 ? "Copy a link to this moment" : "Copy link"} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-2 hover:border-line-strong">{copied ? <Check size={14} /> : <Link2 size={14} />}</button>
        {l.url && <a href={l.url} download title="Download MP3" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-2 hover:border-line-strong"><Download size={14} /></a>}
      </div>
    </div>
  );
}
