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
};
const DEFAULT: Prefs = { theme: "light", lang: "en", font: "sans", size: 17, leading: "comfortable", diacritics: true, speed: 1, reduceMotion: false };

type Ctx = {
  prefs: Prefs; set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void; reset: () => void;
  search: boolean; setSearch: (b: boolean) => void;
};
const PrefsContext = createContext<Ctx | null>(null);
export const usePrefs = () => useContext(PrefsContext)!;

function apply(p: Prefs) {
  const r = document.documentElement;
  const dark = p.theme === "dark" || (p.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  r.dataset.theme = dark ? "dark" : p.theme === "sepia" ? "sepia" : "light";
  r.dataset.font = p.font;
  r.dataset.motion = p.reduceMotion ? "reduce" : "full";
  r.style.setProperty("--reading-size", `${p.size}px`);
  r.style.setProperty("--reading-leading", { compact: "1.55", comfortable: "1.75", spacious: "2" }[p.leading]);
}

export type Track = { slug: string; title: string; subtitle: string; duration: number };
type PlayerCtx = { track: Track | null; playing: boolean; time: number; play: (t: Track, at?: number) => void; toggle: () => void; seek: (s: number) => void; close: () => void };
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea")) { e.preventDefault(); setSearch(true); }
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  // Scroll reveal, once per element
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    const scan = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan); mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  const set = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v })), []);

  // Simulated playback for the prototype (the real site plays the external MP3 link)
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTime((x) => x + prefs.speed), 1000);
    return () => clearInterval(t);
  }, [playing, prefs.speed]);

  const player: PlayerCtx = {
    track, playing, time,
    play: (t, at = 0) => { setTrack(t); setTime(at); setPlaying(true); },
    toggle: () => setPlaying((p) => !p),
    seek: (s) => setTime(Math.max(0, s)),
    close: () => { setTrack(null); setPlaying(false); },
  };

  return (
    <PrefsContext.Provider value={{ prefs, set, reset: () => setPrefs(DEFAULT), search, setSearch }}>
      <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
    </PrefsContext.Provider>
  );
}
