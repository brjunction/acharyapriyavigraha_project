"use client";
import Link from "next/link";
import { Play, Pause, FileText, Languages as Lang, Download, Share2, Quote, Copy } from "lucide-react";
import { usePlayer } from "./providers";
import { Lecture, fmtDate, fmtDur, fmtClock, TRANSCRIPT } from "@/lib/data";
import { useEffect, useRef } from "react";

export function PlayButton({ l, size = 40 }: { l: Lecture; size?: number }) {
  const { track, playing, play, toggle } = usePlayer();
  const mine = track?.slug === l.slug;
  return (
    <button
      onClick={() => (mine ? toggle() : play({ slug: l.slug, title: l.title, subtitle: `${fmtDate(l.date)} · ${l.place}`, duration: l.duration }))}
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full transition ${mine && playing ? "bg-saffron text-white" : "bg-saffron-soft text-saffron hover:bg-saffron hover:text-white"}`}
      aria-label={mine && playing ? "Pause" : `Play ${l.title}`}>
      {mine && playing ? <Pause size={size * 0.4} /> : <Play size={size * 0.4} className="ml-0.5" />}
    </button>
  );
}

export function LectureRow({ l }: { l: Lecture }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-line hover:bg-card">
      <PlayButton l={l} />
      <div className="min-w-0 flex-1">
        <Link href={`/teachings/audio/${l.slug}`} className="block truncate font-serif text-[18px] text-ink hover:text-maroon">{l.title}</Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
          <span>{fmtDate(l.date)}</span><span>·</span><span>{l.place}, {l.country}</span><span>·</span><span>{l.type}</span>
          {l.scripture && <><span>·</span><span className="text-tulasi">{l.scripture}</span></>}
        </p>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        {l.transcribed && <span title="Transcription available" className="flex items-center gap-1 rounded-full bg-tulasi-soft px-2 py-0.5 text-[11px] text-tulasi"><FileText size={12} />Text</span>}
        {l.languages.length > 1 && <span title="Translations" className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] text-ink-2"><Lang size={12} />{l.languages.length}</span>}
      </div>
      <span className="w-16 shrink-0 text-right text-[13px] tabular-nums text-ink-3">{fmtDur(l.duration)}</span>
    </div>
  );
}

export function LectureHeroControls({ l }: { l: Lecture }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <PlayButton l={l} size={56} />
      <div className="mr-4"><p className="text-sm font-medium">Listen</p><p className="text-xs text-ink-3">{fmtDur(l.duration)} · plays across pages</p></div>
      {[{ i: Download, t: "MP3" }, { i: Share2, t: "Share at time" }, { i: Copy, t: "Cite" }].map(({ i: I, t }) => (
        <button key={t} className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-sm text-ink-2 hover:border-gold"><I size={15} />{t}</button>
      ))}
    </div>
  );
}

export function Transcript({ l }: { l: Lecture }) {
  const { track, time, play, seek, playing } = usePlayer();
  const mine = track?.slug === l.slug;
  const activeIdx = mine ? TRANSCRIPT.reduce((acc, p, i) => (time >= p.t ? i : acc), 0) : -1;
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { if (mine && playing && activeIdx >= 0) refs.current[activeIdx]?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [activeIdx, mine, playing]);
  const jump = (t: number) => (mine ? seek(t) : play({ slug: l.slug, title: l.title, subtitle: l.place, duration: l.duration }, t));
  return (
    <div className="reading mx-auto space-y-1">
      {TRANSCRIPT.map((p, i) => {
        const active = i === activeIdx;
        return (
          <div key={i} ref={(el) => { refs.current[i] = el; }} id={`p-${i + 1}`}
            className={`group relative -mx-4 cursor-pointer rounded-xl px-4 py-3 transition ${active ? "bg-saffron-soft" : "hover:bg-paper-2"}`} onClick={() => jump(p.t)}>
            <span className="absolute -left-12 top-4 hidden w-10 text-right font-sans text-[11px] tabular-nums text-ink-3 group-hover:block lg:block">{fmtClock(p.t)}</span>
            {p.kind === "verse" ? (
              <div className="my-2 border-l-2 border-gold pl-5 text-center italic">
                {p.text.split("\n").map((x) => <p key={x}>{x}</p>)}
                <p className="mt-2 font-sans text-[12px] font-semibold not-italic text-tulasi">{p.cite}</p>
              </div>
            ) : p.kind === "note" ? (
              <p className="text-center font-sans text-sm text-ink-3">{p.text}</p>
            ) : (
              <p>{p.speaker && <span className="mr-1.5 font-sans text-[13px] font-semibold text-maroon">{p.speaker}:</span>}{p.text}</p>
            )}
            <span className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
              <span className="rounded-md bg-card p-1 text-ink-3 shadow-sm" title="Make quote"><Quote size={13} /></span>
              <span className="rounded-md bg-card p-1 text-ink-3 shadow-sm" title="Play from here"><Play size={13} /></span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
