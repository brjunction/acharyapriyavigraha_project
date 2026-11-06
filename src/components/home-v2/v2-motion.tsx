"use client";
/* Quiet motion for the new home: lights rising through a section, and numbers that count up once they are seen. */
import { useEffect, useRef, useState } from "react";

/** [left %, delay s, duration s, size px] — fixed, so the server and the browser draw the same lights. */
const LIGHTS: [number, number, number, number][] = [[4, 0, 18, 3], [11, 6, 23, 2], [19, 11, 20, 4], [27, 3, 26, 2], [36, 14, 21, 3], [44, 8, 25, 2], [53, 1, 19, 3], [61, 12, 24, 2], [69, 5, 22, 4], [77, 9, 27, 2], [85, 2, 20, 3], [93, 13, 25, 2], [48, 17, 28, 2], [15, 19, 23, 3]];

export function Lights({ color = "#ffd48a", dense }: { color?: string; dense?: boolean }) {
  const list = dense ? LIGHTS : LIGHTS.filter((_, k) => k % 2 === 0);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {list.map(([l, d, t, z], k) => <span key={k} className="tv-light absolute bottom-[-12px] rounded-full" style={{ left: `${l}%`, width: z, height: z, background: color, color, animationDuration: `${t}s`, animationDelay: `${-d}s` }} />)}
    </div>
  );
}

export function CountUp({ to, ms = 1800 }: { to: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null); const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return; let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const f = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f); };
      raf = requestAnimationFrame(f);
    });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);
  return <span ref={ref}>{v.toLocaleString("en-IN")}</span>;
}
