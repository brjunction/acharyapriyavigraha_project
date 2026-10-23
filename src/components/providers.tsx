"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ---------------- Reader preferences ---------------- */
export type Prefs = {
  theme: "light" | "dark" | "sepia" | "system";
  font: "serif" | "sans";
  size: number;
  leading: "compact" | "comfortable" | "spacious";
  width: "narrow" | "medium" | "wide";
  diacritics: boolean;
  speed: number;
  reduceMotion: boolean;
};
const DEFAULT: Prefs = { theme: "light", font: "serif", size: 19, leading: "comfortable", width: "medium", diacritics: true, speed: 1, reduceMotion: false };

type PrefsCtx = { prefs: Prefs; set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void; reset: () => void; drawer: boolean; setDrawer: (b: boolean) => void; palette: boolean; setPalette: (b: boolean) => void };
const PrefsContext = createContext<PrefsCtx | null>(null);
export const usePrefs = () => useContext(PrefsContext)!;

function apply(p: Prefs) {
  const r = document.documentElement;
  const dark = p.theme === "dark" || (p.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  r.dataset.theme = dark ? "dark" : p.theme === "sepia" ? "sepia" : "light";
  r.dataset.font = p.font;
  r.dataset.motion = p.reduceMotion ? "reduce" : "full";
  r.style.setProperty("--reading-size", `${p.size}px`);
  r.style.setProperty("--reading-leading", { compact: "1.55", comfortable: "1.75", spacious: "2" }[p.leading]);
  r.style.setProperty("--reading-width", { narrow: "36rem", medium: "42rem", wide: "52rem" }[p.width]);
}

/* ---------------- Audio player ---------------- */
export type Track = { slug: string; title: string; subtitle: string; duration: number };
type PlayerCtx = { track: Track | null; playing: boolean; time: number; play: (t: Track, at?: number) => void; toggle: () => void; seek: (s: number) => void; close: () => void };
const PlayerContext = createContext<PlayerCtx | null>(null);
export const usePlayer = () => useContext(PlayerContext)!;

export function Providers({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem("tj-prefs"); if (s) setPrefs({ ...DEFAULT, ...JSON.parse(s) }); } catch {}
  }, []);
  useEffect(() => { apply(prefs); try { localStorage.setItem("tj-prefs", JSON.stringify(prefs)); } catch {} }, [prefs]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } if (e.key === "Escape") { setPalette(false); setDrawer(false); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const set = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v })), []);

  // Simulated playback (prototype has no MP3s in the sandbox; real site plays the external MP3 URL)
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (playing) timer.current = setInterval(() => setTime((t) => t + prefs.speed), 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, prefs.speed]);

  const player: PlayerCtx = {
    track, playing, time,
    play: (t, at = 0) => { setTrack(t); setTime(at); setPlaying(true); },
    toggle: () => setPlaying((p) => !p),
    seek: (s) => setTime(Math.max(0, s)),
    close: () => { setTrack(null); setPlaying(false); },
  };

  return (
    <PrefsContext.Provider value={{ prefs, set, reset: () => setPrefs(DEFAULT), drawer, setDrawer, palette, setPalette }}>
      <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
    </PrefsContext.Provider>
  );
}
