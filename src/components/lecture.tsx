"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Play, Pause, FileText, Languages, Download, Share2, Quote, Copy, RotateCcw, RotateCw, X } from "lucide-react";
import { usePlayer, usePrefs } from "./providers";
import { type Lecture, fmtDate, fmtDur, fmtClock, TRANSCRIPT } from "@/lib/data";

const toTrack = (l: Lecture) => ({ slug: l.slug, title: l.title, subtitle: `${fmtDate(l.date)}, ${l.place}`, duration: l.duration, url: l.url, href: l.href });

export function PlayButton({ l, size = 40 }: { l: Lecture; size?: number }) {
  const { track, playing, play, toggle } = usePlayer();
  const mine = track?.slug === l.slug;
  const on = mine && playing;
  return (
    <button onClick={() => (mine ? toggle() : play(toTrack(l)))} style={{ width: size, height: size }} aria-label={on ? "Pause" : `Play ${l.title}`}
      className={`relative flex shrink-0 items-center justify-center rounded-full transition ${on ? "bg-saffron text-white shadow-[var(--shadow-md)]" : "border border-saffron/25 bg-saffron-soft text-saffron hover:bg-saffron hover:text-white"}`}>
      {on ? (
        <span className="eq flex h-[38%] items-end gap-[2px]"><span style={{ animationDelay: "0s" }} /><span style={{ animationDelay: ".2s" }} /><span style={{ animationDelay: ".4s" }} /></span>
      ) : <Play size={size * 0.38} className="ml-0.5" fill="currentColor" />}
    </button>
  );
}

export function LectureRow({ l, index }: { l: Lecture; index?: number }) {
  return (
    <div className="group flex items-center gap-4 border-b border-line px-2 py-3.5 last:border-0 sm:px-4">
      {index !== undefined && <span className="hidden w-6 text-right text-[13px] tabular text-ink-3 sm:block">{index}</span>}
      <PlayButton l={l} />
      <div className="min-w-0 flex-1">
        <Link href={l.href || `/teachings/audio/${l.slug}`} className="block truncate font-serif text-[18px] font-bold text-ink transition-colors group-hover:text-saffron">{l.title}</Link>
        <p className="mt-0.5 truncate text-[13px] text-ink-3">
          {fmtDate(l.date)} <span className="mx-1 text-line-strong">/</span> {l.place}, {l.country} <span className="mx-1 text-line-strong">/</span> {l.type}
          {l.scripture && <> <span className="mx-1 text-line-strong">/</span> <span className="text-saffron">{l.scripture}</span></>}
        </p>
      </div>
      <div className="hidden items-center gap-1.5 md:flex">
        {l.transcribed && <span title="Transcription available" className="flex items-center gap-1 rounded-full bg-band px-2 py-0.5 text-[11.5px] text-ink-2"><FileText size={12} />Text</span>}
        {l.languages.length > 1 && <span title="Translations available" className="flex items-center gap-1 rounded-full bg-band px-2 py-0.5 text-[11.5px] text-ink-2"><Languages size={12} />{l.languages.length}</span>}
      </div>
      <span className="w-[4.6rem] shrink-0 whitespace-nowrap text-right text-[13px] tabular text-ink-3">{fmtDur(l.duration)}</span>
    </div>
  );
}

export function LectureHeroControls({ l }: { l: Lecture }) {
  const { track, time, seek } = usePlayer();
  const mine = track?.slug === l.slug;
  const pct = mine ? Math.min(100, (time / l.duration) * 100) : 0;
  return (
    <div className="card mt-8 flex flex-wrap items-center gap-5 p-4 sm:p-5">
      <PlayButton l={l} size={58} />
      <div className="min-w-[220px] flex-1">
        <div className="flex justify-between text-[12px] tabular text-ink-3"><span>{fmtClock(mine ? time : 0)}</span><span>{fmtClock(l.duration)}</span></div>
        <div className="relative mt-1.5 h-9 cursor-pointer" onClick={(e) => { if (!mine) return; const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * l.duration); }}>
          <div className="absolute inset-0 flex items-center gap-[3px]">
            {Array.from({ length: 72 }, (_, i) => {
              const h = 25 + Math.abs(Math.sin(i * 1.7) * 55) + ((i * 37) % 20);
              return <span key={i} className={`flex-1 rounded-full transition-colors ${i / 72 * 100 < pct ? "bg-saffron" : "bg-line-strong"}`} style={{ height: `${Math.min(100, h)}%` }} />;
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[{ i: Download, t: "MP3" }, { i: Share2, t: "Share" }, { i: Copy, t: "Cite" }].map(({ i: I, t }) => (
          <button key={t} className="btn btn-ghost !h-9 !px-3.5 text-[13px]"><I size={15} />{t}</button>
        ))}
      </div>
    </div>
  );
}

export function Transcript({ l }: { l: Lecture }) {
  const { track, time, play, seek, playing } = usePlayer();
  const mine = track?.slug === l.slug;
  const activeIdx = mine ? TRANSCRIPT.reduce((acc, p, i) => (time >= p.t ? i : acc), 0) : -1;
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { if (mine && playing && activeIdx >= 0) refs.current[activeIdx]?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [activeIdx, mine, playing]);
  const jump = (t: number) => (mine ? seek(t) : play(toTrack(l), t));
  return (
    <div className="reading mx-auto">
      {TRANSCRIPT.map((p, i) => {
        const active = i === activeIdx;
        return (
          <div key={i} ref={(el) => { refs.current[i] = el; }} id={`p-${i + 1}`} onClick={() => jump(p.t)}
            className={`group relative -mx-5 cursor-pointer rounded-xl px-5 py-3 transition-colors ${active ? "bg-saffron-soft" : "hover:bg-band"}`}>
            <span className={`absolute -left-14 top-[18px] hidden w-11 text-right font-sans text-[11.5px] tabular lg:block ${active ? "text-saffron" : "text-ink-3"}`}>{fmtClock(p.t)}</span>
            {p.kind === "verse" ? (
              <div className="my-3 rounded-xl border border-saffron/20 bg-saffron-tint px-6 py-5 text-center italic">
                {p.text.split("\n").map((x) => <p key={x}>{x}</p>)}
                <p className="mt-2 font-sans text-[12.5px] font-semibold not-italic text-saffron">{p.cite}</p>
              </div>
            ) : p.kind === "note" ? (
              <p className="text-center font-sans text-[13px] tracking-wide text-ink-3">{p.text}</p>
            ) : (
              <p>{p.speaker && <span className="mr-1.5 font-sans text-[13px] font-semibold text-saffron">{p.speaker}:</span>}{p.text}</p>
            )}
            <span className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
              <span className="rounded-md border border-line bg-surface p-1 text-ink-3" title="Make a quote"><Quote size={13} /></span>
              <span className="rounded-md border border-line bg-surface p-1 text-ink-3" title="Play from here"><Play size={13} /></span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MiniPlayer() {
  const { track, playing, time, toggle, seek, close } = usePlayer();
  const { prefs } = usePrefs();
  if (!track) return null;
  const pct = Math.min(100, (time / track.duration) * 100);
  return (
    <div className="fixed inset-x-0 bottom-3 z-40 px-3">
      <div className="rise mx-auto flex max-w-3xl items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface/95 px-3.5 py-3 shadow-[var(--shadow-lg)] backdrop-blur">
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron text-white">
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
        </button>
        <div className="min-w-0 flex-1">
          <Link href={track.href || `/teachings/audio/${track.slug}`} className="block truncate font-serif text-[16px] font-bold hover:text-saffron">{track.title}</Link>
          <div className="mt-1 flex items-center gap-2 text-[11px] tabular text-ink-3">
            <span>{fmtClock(time)}</span>
            <div className="h-1 flex-1 cursor-pointer rounded-full bg-band" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * track.duration); }}>
              <div className="h-full rounded-full bg-saffron transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <span>{fmtClock(track.duration)}</span><span className="hidden sm:inline">{prefs.speed}×</span>
          </div>
        </div>
        <button onClick={() => seek(time - 15)} className="hidden rounded-full p-2 text-ink-2 hover:bg-band sm:block" aria-label="Back 15 seconds"><RotateCcw size={17} /></button>
        <button onClick={() => seek(time + 15)} className="hidden rounded-full p-2 text-ink-2 hover:bg-band sm:block" aria-label="Forward 15 seconds"><RotateCw size={17} /></button>
        <button onClick={close} className="rounded-full p-2 text-ink-3 hover:bg-band" aria-label="Close player"><X size={17} /></button>
      </div>
    </div>
  );
}
