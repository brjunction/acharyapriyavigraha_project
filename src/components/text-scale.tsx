"use client";
/* Text size for the audio lectures (A− / A+): only text grows or shrinks; width, spacing, pictures and icons stay as they are.
   Remembered on the device. */
import { useEffect, useState } from "react";

export const SCALES = [0.9, 1, 1.15, 1.3, 1.45];
const KEY = "tj_text_scale";
const EV = "tj:textscale";
const read = () => { try { const n = Number(localStorage.getItem(KEY)); return n > 0 && SCALES.includes(n) ? n : 1; } catch { return 1; } };

export function useTextScale(): [number, (n: number) => void] {
  const [k, setK] = useState(1);
  useEffect(() => { setK(read()); const f = () => setK(read()); window.addEventListener(EV, f); return () => window.removeEventListener(EV, f); }, []);
  const set = (n: number) => { try { localStorage.setItem(KEY, String(n)); } catch {} setK(n); window.dispatchEvent(new Event(EV)); };
  return [k, set];
}

/** Applies the chosen size inside one part of the page (the audio library). */
export function TextScaler({ selector = "#main" }: { selector?: string }) {
  const [k] = useTextScale();
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector); if (!el) return; let raf = 0; let applied = false;
    const apply = () => {
      if (k === 1 && !applied) return;
      const all = [el, ...el.querySelectorAll<HTMLElement>("*")].filter((e) => !(e instanceof SVGElement)) as HTMLElement[];
      all.forEach((e) => { if (e.dataset.ts) { e.style.fontSize = ""; delete e.dataset.ts; } });
      if (k === 1) { applied = false; return; }
      const sizes = all.map((e) => parseFloat(getComputedStyle(e).fontSize));
      all.forEach((e, i) => { if (!e.style.fontSize) { e.style.fontSize = `${(sizes[i] * k).toFixed(2)}px`; e.dataset.ts = "1"; } });
      applied = true;
    };
    apply();
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(apply); });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); const all = el.querySelectorAll<HTMLElement>("[data-ts]"); all.forEach((e) => { e.style.fontSize = ""; delete e.dataset.ts; }); if (el.dataset.ts) { el.style.fontSize = ""; delete el.dataset.ts; } };
  }, [k, selector]);
  return null;
}

/** The A− 100% A+ control. */
export function TextSizeControl({ className = "", big = false }: { className?: string; big?: boolean }) {
  const [k, set] = useTextScale(); const i = SCALES.indexOf(k);
  const b = `flex items-center justify-center rounded-full font-semibold text-ink-2 transition hover:bg-band disabled:opacity-30 ${big ? "h-9 w-10" : "h-7 w-8"}`;
  return (
    <div className={`flex items-center gap-0.5 rounded-full border border-line bg-white p-0.5 ${className}`} aria-label="Text size" role="group">
      <button onClick={() => set(SCALES[Math.max(0, i - 1)])} disabled={i <= 0} aria-label="Smaller text" title="Smaller text" className={`${b} text-[12px]`}>A−</button>
      <span className={`min-w-[2.6rem] text-center tabular-nums text-ink-3 ${big ? "text-[12.5px]" : "text-[11px]"}`}>{Math.round(k * 100)}%</span>
      <button onClick={() => set(SCALES[Math.min(SCALES.length - 1, i + 1)])} disabled={i >= SCALES.length - 1} aria-label="Bigger text" title="Bigger text" className={`${b} text-[15px]`}>A+</button>
    </div>
  );
}
