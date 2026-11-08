"use client";
/* Getting a recording ready before it is played, so it starts at once:
   - the browser opens the connection to the server the MP3 lives on (once per server);
   - when someone points at, touches or tabs to a Play button, the start of that MP3 is fetched quietly.
   Only one recording is warmed at a time, and nothing is fetched until a visitor shows they may play it. */
const linked = new Set<string>();
let warmEl: HTMLAudioElement | null = null; let timer: ReturnType<typeof setTimeout> | null = null;

export function preconnect(url?: string | null) {
  if (!url || typeof document === "undefined") return;
  try { const o = new URL(url, location.href).origin; if (o === location.origin || linked.has(o)) return; linked.add(o);
    for (const rel of ["preconnect", "dns-prefetch"]) { const l = document.createElement("link"); l.rel = rel; l.href = o; if (rel === "preconnect") l.crossOrigin = "anonymous"; document.head.appendChild(l); } } catch {}
}
export function warm(url?: string | null) {
  if (!url || typeof window === "undefined") return; preconnect(url);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { try { if (!warmEl) { warmEl = new Audio(); warmEl.preload = "auto"; warmEl.muted = true; } if (warmEl.src !== new URL(url, location.href).href) { warmEl.src = url; warmEl.load(); } } catch {} }, 120);
}
export function cool() { if (timer) clearTimeout(timer); }
/** Stop warming (the player is starting): the connection is kept for the player alone. */
export function stopWarm() { if (timer) clearTimeout(timer); try { if (warmEl) { warmEl.removeAttribute("src"); warmEl.load(); } } catch {} }
