"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type Prefs = {
  theme: "light" | "sepia" | "dark" | "system";
  lang: string;
  font: "serif" | "sans";
  size: number;
  leading: "compact" | "comfortable" | "spacious";
  diacritics: boolean;
  speed: number;
  reduceMotion: boolean;
  zoom: number;
  autoHide: boolean;
};
const DEFAULT: Prefs = { theme: "light", lang: "en", font: "sans", size: 17, leading: "comfortable", diacritics: true, speed: 1, reduceMotion: false, zoom: 100, autoHide: false };

type Ctx = {
  prefs: Prefs; set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void; reset: () => void;
  search: boolean; setSearch: (b: boolean) => void;
};
const PrefsContext = createContext<Ctx | null>(null);
export const usePrefs = () => useContext(PrefsContext)!;

function apply(p: Prefs) {
  const r = document.documentElement;
  r.dataset.theme = "light"; // dark and sepia themes are not offered for now
  r.dataset.font = p.font;
  r.dataset.motion = p.reduceMotion ? "reduce" : "full";
  r.style.setProperty("--reading-size", `${p.size}px`);
  (r.style as any).zoom = p.zoom && p.zoom !== 100 ? String(p.zoom / 100) : "";
  r.style.setProperty("--reading-leading", { compact: "1.55", comfortable: "1.75", spacious: "2" }[p.leading]);
}

export type Track = { slug: string; title: string; subtitle: string; duration: number; url?: string; href?: string; transcript?: boolean };
export type PlayerMode = "dock" | "float" | "full";
type PlayerCtx = {
  track: Track | null; playing: boolean; time: number; buffered: number; play: (t: Track, at?: number) => void; toggle: () => void; seek: (s: number) => void; skip: (d: number) => void; close: () => void;
  volume: number; setVolume: (v: number) => void; muted: boolean; toggleMute: () => void; speed: number; setSpeed: (v: number) => void;
  mode: PlayerMode; setMode: (m: PlayerMode) => void; text: boolean; setText: (b: boolean) => void; sleep: number | null; setSleep: (min: number | null) => void;
};
const PlayerContext = createContext<PlayerCtx | null>(null);
export const usePlayer = () => useContext(PlayerContext)!;

export function Providers({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [search, setSearch] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try { const s = localStorage.getItem("tj-prefs-v3"); if (s) setPrefs({ ...DEFAULT, ...JSON.parse(s) }); } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => { apply(prefs); if (loaded.current) { try { localStorage.setItem("tj-prefs-v3", JSON.stringify(prefs)); } catch {} } }, [prefs]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !location.pathname.startsWith("/admin")) { e.preventDefault(); setSearch(true); }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,[contenteditable=true]") && !location.pathname.startsWith("/admin")) { e.preventDefault(); setSearch(true); }
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  // Scroll reveal, once per element
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    const scan = () => document.querySelectorAll(".reveal:not(.in), .stagger:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan); mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  // Hide the menu while reading down the page, show it again on the way up
  useEffect(() => {
    const h = document.documentElement; if (!prefs.autoHide) { h.classList.remove("nav-auto"); return; }
    let last = window.scrollY, raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const y = window.scrollY; if (Math.abs(y - last) < 6) return; h.classList.toggle("nav-auto", y > 140 && y > last); last = y; }); };
    window.addEventListener("scroll", on, { passive: true }); return () => { window.removeEventListener("scroll", on); h.classList.remove("nav-auto"); };
  }, [prefs.autoHide]);
  // Scroll progress line and a slow parallax variable
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const h = document.documentElement; const y = window.scrollY; const max = h.scrollHeight - window.innerHeight;
      h.style.setProperty("--prog", String(max > 0 ? Math.min(1, y / max) : 0)); h.style.setProperty("--sy", String(y));
    }); };
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  const set = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v })), []);

  // Plays the lecture's real audio file when it has one; otherwise a silent preview timer.
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0); const [buffered, setBuffered] = useState(0);
  const [volume, setVol] = useState(1); const [muted, setMuted] = useState(false);
  const [mode, setModeS] = useState<PlayerMode>("dock"); const [text, setText] = useState(false); const [sleep, setSleepS] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { try { const p = JSON.parse(localStorage.getItem("tj-player") || "{}"); if (typeof p.volume === "number") setVol(p.volume); if (p.mode === "float") setModeS("float"); } catch {} }, []);
  const persist = (x: object) => { try { localStorage.setItem("tj-player", JSON.stringify({ ...JSON.parse(localStorage.getItem("tj-player") || "{}"), ...x })); } catch {} };
  useEffect(() => {
    if (track?.url) return;
    if (!playing) return;
    const t = setInterval(() => setTime((x) => x + prefs.speed), 1000);
    return () => clearInterval(t);
  }, [playing, prefs.speed, track]);
  useEffect(() => {
    const a = audio.current; if (!a || !track?.url) return;
    a.playbackRate = prefs.speed;
    if (playing) a.play().catch(() => setPlaying(false)); else a.pause();
  }, [playing, track, prefs.speed]);
  useEffect(() => { if (audio.current) { audio.current.volume = volume; audio.current.muted = muted; } }, [volume, muted, track?.url]);
  useEffect(() => {
    if (!track?.url) { audio.current?.pause(); return; }
    let a = audio.current; if (!a) { a = new Audio(); a.preload = "metadata"; audio.current = a;
      a.addEventListener("timeupdate", () => setTime(a!.currentTime));
      a.addEventListener("progress", () => { try { setBuffered(a!.buffered.length ? a!.buffered.end(a!.buffered.length - 1) : 0); } catch {} });
      a.addEventListener("ended", () => setPlaying(false));
      a.addEventListener("loadedmetadata", () => setTrack((t) => (t && (!t.duration || Math.abs(t.duration - a!.duration) > 5) && a!.duration ? { ...t, duration: a!.duration } : t))); }
    if (a.src !== track.url) { a.src = track.url; a.currentTime = 0; setBuffered(0); }
  }, [track?.url]); // eslint-disable-line react-hooks/exhaustive-deps
  // remember where each lecture was left
  useEffect(() => { if (!track || time < 5) return; if (Math.floor(time) % 5) return; try { const m = JSON.parse(localStorage.getItem("tj-resume") || "{}"); m[track.slug] = Math.floor(time); localStorage.setItem("tj-resume", JSON.stringify(m)); } catch {} }, [time, track]);
  // sleep timer: minutes from now, or -1 for "end of this lecture"
  useEffect(() => { if (!sleep || sleep < 0) return; const t = setTimeout(() => { setPlaying(false); setSleepS(null); }, sleep * 60000); return () => clearTimeout(t); }, [sleep]);
  useEffect(() => { if (sleep === -1 && !playing && track && time >= track.duration - 1) setSleepS(null); }, [sleep, playing, time, track]);

  const seek = useCallback((s: number) => { const v = Math.max(0, track?.duration ? Math.min(s, track.duration) : s); setTime(v); if (audio.current && track?.url) audio.current.currentTime = v; }, [track]);
  const player: PlayerCtx = {
    track, playing, time, buffered,
    play: (t, at) => { let start = at ?? 0; if (at === undefined) { try { start = JSON.parse(localStorage.getItem("tj-resume") || "{}")[t.slug] || 0; if (t.duration && start > t.duration - 10) start = 0; } catch {} } setTrack(t); setTime(start); setPlaying(true); const a = audio.current; if (a && t.url) { if (a.src !== t.url) { a.src = t.url; } a.currentTime = start; } },
    toggle: () => setPlaying((p) => !p),
    seek, skip: (d) => seek(time + d),
    close: () => { setTrack(null); setPlaying(false); audio.current?.pause(); setModeS((m) => (m === "full" ? "dock" : m)); },
    volume, setVolume: (v) => { const x = Math.max(0, Math.min(1, v)); setVol(x); setMuted(x === 0); persist({ volume: x }); }, muted, toggleMute: () => setMuted((m) => !m),
    speed: prefs.speed, setSpeed: (v) => setPrefs((p) => ({ ...p, speed: Math.max(0.5, Math.min(2.5, Math.round(v * 100) / 100)) })),
    mode, setMode: (m) => { setModeS(m); if (m !== "full") persist({ mode: m }); }, text, setText, sleep, setSleep: setSleepS,
  };
  // operating-system media controls (keyboard media keys, lock screen, headphones)
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva", album: track.subtitle || "Taptajīvanam" });
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true)); navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("seekbackward", () => seek((audio.current?.currentTime || 0) - 10)); navigator.mediaSession.setActionHandler("seekforward", () => seek((audio.current?.currentTime || 0) + 10));
  }, [track, seek]);

  return (
    <PrefsContext.Provider value={{ prefs, set, reset: () => setPrefs(DEFAULT), search, setSearch }}>
      <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
    </PrefsContext.Provider>
  );
}
