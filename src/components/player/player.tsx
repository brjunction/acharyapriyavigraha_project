"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, Volume1, VolumeX, X, PictureInPicture2, Maximize2, Minimize2, FileText, Keyboard, Download, Link2, Check, Moon, ChevronDown, SkipBack, SkipForward, Search, PanelBottom, GripHorizontal, ExternalLink, Loader2 } from "lucide-react";
import { usePlayer, type Track } from "@/components/providers";

const clock = (s: number) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`; };
const SPEEDS = [0.75, 1, 1.1, 1.25, 1.5, 1.75, 2];
type Near = { slug: string; title: string; date: string | null; place: string | null; duration_sec: number | null; audio_url: string | null; transcript_status: string | null };
type Info = { text: { h?: number; t: string }[]; prev: Near | null; next: Near | null };
const SHORTCUTS: [string, string][] = [["K or Space", "Play / pause"], ["J  L", "Back / forward 10 seconds"], ["←  →", "Back / forward 5 seconds"], ["Shift ↑ ↓", "Volume up / down"], ["M", "Mute"], ["<  >", "Slower / faster"], ["T", "Show / hide the transcription"], ["P", "Pop out / dock the player"], ["F", "Full player"], ["N  B", "Next / previous lecture"], ["?", "These shortcuts"], ["Esc", "Close the full player"]];
const toTrack = (n: Near): Track => ({ slug: n.slug, title: n.title, subtitle: [n.date, n.place].filter(Boolean).join(", "), duration: n.duration_sec || 0, url: n.audio_url || undefined, href: `/teachings/audio/${n.slug}`, transcript: n.transcript_status === "done" });

/* -------------------------------------------------------------- shared bits */
function Scrubber({ big }: { big?: boolean }) {
  const { track, time, buffered, seek } = usePlayer(); const d = track?.duration || 0;
  const [hover, setHover] = useState<number | null>(null); const [drag, setDrag] = useState<number | null>(null); const ref = useRef<HTMLDivElement>(null);
  const at = (x: number) => { const r = ref.current!.getBoundingClientRect(); return Math.max(0, Math.min(1, (x - r.left) / r.width)) * d; };
  useEffect(() => { if (drag === null) return; const mv = (e: PointerEvent) => setDrag(at(e.clientX)); const up = (e: PointerEvent) => { seek(at(e.clientX)); setDrag(null); }; window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up, { once: true }); return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); }; }, [drag]); // eslint-disable-line react-hooks/exhaustive-deps
  const t = drag ?? time; const pct = d ? (t / d) * 100 : 0;
  return (
    <div className="flex w-full items-center gap-2.5 text-[11.5px] tabular-nums text-ink-3">
      <span className="w-12 text-right">{clock(t)}</span>
      <div ref={ref} className={`group relative flex-1 cursor-pointer touch-none ${big ? "py-2" : "py-1.5"}`} onPointerDown={(e) => { if (!d) return; setDrag(at(e.clientX)); }} onPointerMove={(e) => d && setHover(at(e.clientX))} onPointerLeave={() => setHover(null)} role="slider" aria-label="Position" aria-valuemin={0} aria-valuemax={d} aria-valuenow={Math.floor(t)}>
        <div className={`relative overflow-hidden rounded-full bg-black/[0.08] ${big ? "h-1.5" : "h-1"} transition-[height] group-hover:h-1.5`}>
          <div className="absolute inset-y-0 left-0 bg-black/[0.12]" style={{ width: `${d ? Math.min(100, (buffered / d) * 100) : 0}%` }} />
          <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${pct}%` }} />
        </div>
        <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink opacity-0 shadow ring-2 ring-white transition group-hover:opacity-100" style={{ left: `${pct}%`, opacity: drag !== null ? 1 : undefined }} />
        {hover !== null && <span className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[11px] text-white" style={{ left: `${(hover / d) * 100}%` }}>{clock(hover)}</span>}
      </div>
      <span className="w-12">{d ? clock(d) : "—"}</span>
    </div>
  );
}

function Btn({ onClick, title, children, on, className = "" }: { onClick: () => void; title: string; children: React.ReactNode; on?: boolean; className?: string }) {
  return <button onClick={onClick} title={title} aria-label={title} className={`flex size-8 shrink-0 items-center justify-center rounded-md transition ${on ? "bg-ink text-white" : "text-ink-2 hover:bg-black/[0.06] hover:text-ink"} ${className}`}>{children}</button>;
}

function PlayPause({ size = 40 }: { size?: number }) {
  const { playing, toggle } = usePlayer();
  return <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause (K)" : "Play (K)"} className="flex shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-sm transition hover:scale-[1.04] active:scale-95" style={{ width: size, height: size }}>{playing ? <Pause size={size * 0.4} fill="currentColor" strokeWidth={0} /> : <Play size={size * 0.4} className="ml-[2px]" fill="currentColor" strokeWidth={0} />}</button>;
}

function Volume() {
  const { volume, setVolume, muted, toggleMute } = usePlayer(); const v = muted ? 0 : volume; const I = v === 0 ? VolumeX : v < 0.5 ? Volume1 : Volume2;
  return (
    <div className="group/v flex items-center">
      <Btn onClick={toggleMute} title={muted ? "Unmute (M)" : "Mute (M)"}><I size={16} /></Btn>
      <input type="range" min={0} max={1} step={0.01} value={v} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="h-1 w-0 cursor-pointer accent-[#1a1a1a] opacity-0 transition-all group-hover/v:ml-1 group-hover/v:w-20 group-hover/v:opacity-100 focus:ml-1 focus:w-20 focus:opacity-100" />
    </div>
  );
}

function Menu({ label, title, children, up = true, wide }: { label: React.ReactNode; title: string; children: (close: () => void) => React.ReactNode; up?: boolean; wide?: boolean }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} title={title} className={`flex h-8 items-center gap-1 rounded-md px-2 text-[12.5px] tabular-nums transition ${open ? "bg-black/[0.06] text-ink" : "text-ink-2 hover:bg-black/[0.06] hover:text-ink"}`}>{label}</button>
      {open && <div className={`absolute right-0 z-50 rounded-lg border border-line bg-white p-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] ${up ? "bottom-10" : "top-10"} ${wide ? "w-[300px]" : "w-[180px]"}`}>{children(() => setOpen(false))}</div>}
    </div>
  );
}
const Item = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => <button onClick={onClick} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-band">{children}{on && <Check size={14} />}</button>;

function SpeedMenu() {
  const { speed, setSpeed } = usePlayer();
  return <Menu title="Speed (< >)" label={<>{speed}×</>}>{(c) => <><p className="px-2.5 pb-1 pt-1.5 text-[11.5px] text-ink-3">Speed</p>{SPEEDS.map((s) => <Item key={s} on={speed === s} onClick={() => { setSpeed(s); c(); }}>{s === 1 ? "Normal" : `${s}×`}</Item>)}</>}</Menu>;
}
function SleepMenu() {
  const { sleep, setSleep } = usePlayer();
  return <Menu title="Sleep timer" label={<Moon size={15} className={sleep ? "fill-current" : ""} />}>{(c) => <><p className="px-2.5 pb-1 pt-1.5 text-[11.5px] text-ink-3">Stop playing after</p>{([[null, "Off"], [15, "15 minutes"], [30, "30 minutes"], [60, "1 hour"], [-1, "End of this lecture"]] as [number | null, string][]).map(([v, l]) => <Item key={l} on={sleep === v} onClick={() => { setSleep(v); c(); }}>{l}</Item>)}</>}</Menu>;
}
function MoreMenu() {
  const { track, time } = usePlayer(); const [done, setDone] = useState(false); if (!track) return null;
  return <Menu title="More" label={<span className="text-[15px] leading-none">⋯</span>}>{(c) => <>
    <Item onClick={() => { navigator.clipboard?.writeText(`${location.origin}${track.href || `/teachings/audio/${track.slug}`}${time > 5 ? `?t=${Math.floor(time)}` : ""}`); setDone(true); setTimeout(() => { setDone(false); c(); }, 900); }}><span className="flex items-center gap-2">{done ? <Check size={14} /> : <Link2 size={14} />}Copy link at {clock(time)}</span></Item>
    {track.url && <a href={track.url} download className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-ink hover:bg-band"><Download size={14} />Download MP3</a>}
    <Link href={track.href || `/teachings/audio/${track.slug}`} onClick={c} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-ink hover:bg-band"><ExternalLink size={14} />Open lecture page</Link>
  </>}</Menu>;
}

/* -------------------------------------------------------------- transcription */
function useInfo(slug?: string) {
  const [info, setInfo] = useState<Info | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!slug) return; setInfo(null); setBusy(true); fetch(`/api/audio/${slug}`).then((r) => r.json()).then(setInfo).catch(() => setInfo({ text: [], prev: null, next: null })).finally(() => setBusy(false)); }, [slug]);
  return { info, busy };
}
function Transcript({ info, busy, compact }: { info: Info | null; busy: boolean; compact?: boolean }) {
  const [q, setQ] = useState(""); const [size, setSize] = useState(15);
  const f = q.trim().toLowerCase();
  const hits = useMemo(() => (f && info ? info.text.filter((p) => p.t.toLowerCase().includes(f)).length : 0), [f, info]);
  const mark = (t: string) => { if (!f) return t; const parts: React.ReactNode[] = []; let i = 0, k = 0; const low = t.toLowerCase(); while (true) { const j = low.indexOf(f, i); if (j < 0) break; parts.push(t.slice(i, j), <mark key={k++} className="rounded-sm bg-yellow-200 text-ink">{t.slice(j, j + f.length)}</mark>); i = j + f.length; } parts.push(t.slice(i)); return parts; };
  if (busy) return <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-ink-3"><Loader2 size={15} className="animate-spin" />Loading the transcription…</div>;
  if (!info?.text.length) return <p className="py-10 text-center text-[13px] text-ink-3">The transcription of this lecture is being prepared.</p>;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <label className="relative flex-1"><Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find in the transcription" className="h-8 w-full rounded-md border border-line bg-white pl-7 pr-2 text-[12.5px] outline-none focus:border-ink/40" /></label>
        {f && <span className="text-[11.5px] text-ink-3">{hits} found</span>}
        <div className="flex rounded-md border border-line"><button onClick={() => setSize(Math.max(12, size - 1))} className="px-2 text-[12px] text-ink-2 hover:bg-band">A−</button><button onClick={() => setSize(Math.min(22, size + 1))} className="border-l border-line px-2 text-[13.5px] text-ink-2 hover:bg-band">A+</button></div>
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin] ${compact ? "max-h-[300px]" : ""}`} style={{ fontSize: size, lineHeight: 1.75 }}>
        {info.text.filter((p) => !f || p.h || p.t.toLowerCase().includes(f)).map((p, i) => p.h ? <p key={i} className="mb-2 mt-4 font-semibold text-ink first:mt-0" style={{ fontSize: "1.05em" }}>{mark(p.t)}</p> : <p key={i} className="mb-3 text-ink-2">{mark(p.t)}</p>)}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- the player */
export function AudioPlayer() {
  const p = usePlayer(); const { track, mode, setMode, text, setText, playing } = p;
  const { info, busy } = useInfo(track?.slug);
  const [help, setHelp] = useState(false);
  const go = useCallback((n: Near | null) => { if (n) p.play(toTrack(n)); }, [p]);

  // keyboard
  useEffect(() => {
    if (!track) return;
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (t.closest("input, textarea, select, [contenteditable=true], .rd") || document.querySelector(".rd") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key; const map: Record<string, () => void> = {
        k: p.toggle, K: p.toggle, " ": p.toggle, j: () => p.skip(-10), l: () => p.skip(10), ArrowLeft: () => p.skip(-5), ArrowRight: () => p.skip(5),
        m: p.toggleMute, "<": () => p.setSpeed(p.speed - 0.25), ">": () => p.setSpeed(p.speed + 0.25), ",": () => p.setSpeed(p.speed - 0.25), ".": () => p.setSpeed(p.speed + 0.25),
        t: () => setText(!text), p: () => setMode(mode === "float" ? "dock" : "float"), f: () => setMode(mode === "full" ? "dock" : "full"),
        n: () => go(info?.next || null), b: () => go(info?.prev || null), "?": () => setHelp((x) => !x), Escape: () => { if (help) setHelp(false); else if (mode === "full") setMode("dock"); },
      };
      if (e.shiftKey && k === "ArrowUp") { e.preventDefault(); p.setVolume(p.volume + 0.1); return; }
      if (e.shiftKey && k === "ArrowDown") { e.preventDefault(); p.setVolume(p.volume - 0.1); return; }
      if (k === " " && t.closest("button, a")) return;
      const fn = map[k] || (k.length === 1 ? map[k.toLowerCase()] : undefined); if (fn && !(k === "Escape" && mode !== "full" && !help)) { e.preventDefault(); fn(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [track, p, text, setText, mode, setMode, info, go, help]);

  // floating position, remembered
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); const drag = useRef<{ dx: number; dy: number } | null>(null);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("tj-player-pos") || "null"); if (s) setPos(s); } catch {} }, []);
  const startDrag = (e: React.PointerEvent) => { const el = (e.currentTarget as HTMLElement).closest("[data-float]") as HTMLElement; const r = el.getBoundingClientRect(); drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    const mv = (ev: PointerEvent) => { if (!drag.current) return; const x = Math.max(8, Math.min(window.innerWidth - r.width - 8, ev.clientX - drag.current.dx)); const y = Math.max(8, Math.min(window.innerHeight - 80, ev.clientY - drag.current.dy)); setPos({ x, y }); };
    const up = () => { drag.current = null; window.removeEventListener("pointermove", mv); setPos((q) => { try { localStorage.setItem("tj-player-pos", JSON.stringify(q)); } catch {} return q; }); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up, { once: true }); };

  if (!track) return null;
  const title = <Link href={track.href || `/teachings/audio/${track.slug}`} className="block truncate text-[13.5px] font-medium text-ink hover:underline">{track.title}</Link>;
  const sub = <p className="truncate text-[12px] text-ink-3">{track.subtitle || "Śrī Śrīmad Gour Govinda Swāmī Gurudeva"}</p>;
  const helpBox = help && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 p-4" onClick={() => setHelp(false)}><div className="w-full max-w-[420px] rounded-xl border border-line bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><p className="text-[15px] font-semibold">Player shortcuts</p><Btn onClick={() => setHelp(false)} title="Close"><X size={15} /></Btn></div>{SHORTCUTS.map(([k, d]) => <div key={k} className="flex items-center justify-between py-1 text-[13px]"><span className="text-ink-2">{d}</span><kbd className="rounded border border-line bg-band px-1.5 py-0.5 font-sans text-[11.5px]">{k}</kbd></div>)}</div></div>;

  /* full player: a side sheet with the transcription */
  if (mode === "full") return (<>
    <div className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-[2px]" onClick={() => setMode("dock")} />
    <aside className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[520px] flex-col border-l border-line bg-white shadow-2xl">
      <div className="flex items-center gap-1 border-b border-line px-3 py-2"><p className="flex-1 px-1 text-[12px] font-medium text-ink-3">Now playing</p><Btn onClick={() => setMode("float")} title="Pop out (P)"><PictureInPicture2 size={15} /></Btn><Btn onClick={() => setMode("dock")} title="Back to the bar"><Minimize2 size={15} /></Btn><Btn onClick={() => setHelp(true)} title="Shortcuts (?)"><Keyboard size={15} /></Btn><Btn onClick={p.close} title="Close"><X size={15} /></Btn></div>
      <div className="border-b border-line px-6 pb-5 pt-5">
        <p className="text-[18px] font-semibold leading-snug tracking-[-0.01em] text-ink">{track.title}</p>{sub}
        <div className="mt-4"><Scrubber big /></div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Btn onClick={() => go(info?.prev || null)} title="Previous lecture (B)" className={info?.prev ? "" : "opacity-30"}><SkipBack size={16} /></Btn>
          <Btn onClick={() => p.skip(-10)} title="Back 10 seconds (J)"><RotateCcw size={17} /></Btn>
          <PlayPause size={52} />
          <Btn onClick={() => p.skip(10)} title="Forward 10 seconds (L)"><RotateCw size={17} /></Btn>
          <Btn onClick={() => go(info?.next || null)} title="Next lecture (N)" className={info?.next ? "" : "opacity-30"}><SkipForward size={16} /></Btn>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1"><Volume /><SpeedMenu /><SleepMenu /><MoreMenu /></div>
      </div>
      <div className="flex items-center gap-2 px-6 pb-1 pt-3"><FileText size={14} className="text-ink-3" /><p className="text-[12.5px] font-medium text-ink">Transcription</p></div>
      <Transcript info={info} busy={busy} />
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">{([["Previous", info?.prev], ["Next", info?.next]] as [string, Near | null | undefined][]).map(([l, n]) => <button key={l} disabled={!n} onClick={() => go(n || null)} className={`bg-white px-4 py-3 text-left hover:bg-band disabled:opacity-40 ${l === "Next" ? "text-right" : ""}`}><span className="block text-[11px] text-ink-3">{l} lecture</span><span className="block truncate text-[13px] font-medium text-ink">{n?.title || "—"}</span></button>)}</div>
    </aside>
    {helpBox}
  </>);

  /* floating, detached card */
  if (mode === "float") return (<>
    <div data-float className="fixed z-[75] w-[360px] max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border border-line bg-white/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl" style={pos ? { left: pos.x, top: pos.y } : { right: 16, bottom: 16 }}>
      <div onPointerDown={startDrag} className="flex cursor-grab items-center gap-1 border-b border-line bg-[#fafafa]/80 px-2 py-1 active:cursor-grabbing"><GripHorizontal size={14} className="mx-1 text-ink-3" /><p className="flex-1 truncate text-[11.5px] text-ink-3">{playing ? "Playing" : "Paused"} · drag to move</p><Btn onClick={() => setMode("full")} title="Full player (F)"><Maximize2 size={14} /></Btn><Btn onClick={() => setMode("dock")} title="Dock to the bottom (P)"><PanelBottom size={14} /></Btn><Btn onClick={p.close} title="Close"><X size={14} /></Btn></div>
      <div className="px-4 pt-3">{title}{sub}<div className="mt-2"><Scrubber /></div></div>
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center"><Btn onClick={() => p.skip(-10)} title="Back 10 seconds (J)"><RotateCcw size={16} /></Btn><PlayPause size={38} /><Btn onClick={() => p.skip(10)} title="Forward 10 seconds (L)"><RotateCw size={16} /></Btn></div>
        <div className="flex items-center"><Volume /><SpeedMenu /><Btn onClick={() => setText(!text)} title="Transcription (T)" on={text}><FileText size={15} /></Btn><MoreMenu /></div>
      </div>
      {text && <div className="flex max-h-[340px] flex-col border-t border-line"><Transcript info={info} busy={busy} compact /></div>}
    </div>
    {helpBox}
  </>);

  /* docked bar */
  return (<>
    {text && <div className="fixed inset-x-0 bottom-[68px] z-[74] mx-auto flex h-[46vh] max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-b-0 border-line bg-white shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2"><FileText size={14} className="text-ink-3" /><p className="flex-1 truncate text-[12.5px] font-medium text-ink">Transcription · {track.title}</p><Btn onClick={() => setText(false)} title="Hide (T)"><ChevronDown size={16} /></Btn></div>
      <Transcript info={info} busy={busy} />
    </div>}
    <div className="fixed inset-x-0 bottom-0 z-[75] border-t border-line bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-3 sm:px-5">
        <div className="flex items-center gap-0.5">
          <Btn onClick={() => go(info?.prev || null)} title="Previous lecture (B)" className={`hidden md:flex ${info?.prev ? "" : "opacity-30"}`}><SkipBack size={15} /></Btn>
          <Btn onClick={() => p.skip(-10)} title="Back 10 seconds (J)" className="hidden sm:flex"><RotateCcw size={16} /></Btn>
          <PlayPause size={40} />
          <Btn onClick={() => p.skip(10)} title="Forward 10 seconds (L)" className="hidden sm:flex"><RotateCw size={16} /></Btn>
          <Btn onClick={() => go(info?.next || null)} title="Next lecture (N)" className={`hidden md:flex ${info?.next ? "" : "opacity-30"}`}><SkipForward size={15} /></Btn>
        </div>
        <div className="w-[180px] min-w-0 shrink-0 max-sm:flex-1 lg:w-[260px]">{title}{sub}</div>
        <div className="hidden flex-1 sm:block"><Scrubber /></div>
        <div className="flex items-center gap-0.5">
          <div className="hidden lg:block"><Volume /></div>
          <div className="hidden md:block"><SpeedMenu /></div>
          <Btn onClick={() => setText(!text)} title="Transcription (T)" on={text}><FileText size={15} /></Btn>
          <Btn onClick={() => setMode("float")} title="Pop out (P)" className="hidden md:flex"><PictureInPicture2 size={15} /></Btn>
          <Btn onClick={() => setMode("full")} title="Full player (F)"><Maximize2 size={15} /></Btn>
          <Btn onClick={() => setHelp(true)} title="Shortcuts (?)" className="hidden lg:flex"><Keyboard size={15} /></Btn>
          <Btn onClick={p.close} title="Close"><X size={15} /></Btn>
        </div>
      </div>
      <div className="px-3 pb-2 sm:hidden"><Scrubber /></div>
    </div>
    <div aria-hidden className="h-[68px]" />
    {helpBox}
  </>);
}
