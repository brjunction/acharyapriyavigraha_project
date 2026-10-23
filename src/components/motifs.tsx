"use client";
// Traditional Indian ornament, drawn as SVG so it stays crisp and themeable.
// Paisley (mehndi) field for the footer and bands, the flower border of
// taptajivanam.com, a lotus rosette, and the Taptajīvanam mark.

import { useId } from "react";

function petals(n: number, r: number, rx: number, ry: number, cx = 0, cy = 0) {
  return Array.from({ length: n }, (_, i) => (
    <ellipse key={i} cx={cx} cy={cy - r} rx={rx} ry={ry} transform={`rotate(${(360 / n) * i} ${cx} ${cy})`} />
  ));
}

/** Tiled paisley / mehndi field. Colour comes from `currentColor`. */
export function PaisleyField({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  const id = useId().replace(/:/g, "");
  const s = 260 * scale;
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <pattern id={`p${id}`} width={s} height={s} patternUnits="userSpaceOnUse" viewBox="0 0 260 260">
          <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {/* paisley */}
            <path d="M78 26c42 2 66 44 52 84-11 31-47 49-75 36-23-11-27-40-8-53 17-11 34 1 30 16-3 10-15 12-20 5" />
            <path d="M80 42c30 3 46 33 36 61-8 22-33 34-52 25" />
            <path d="M64 70c6-8 18-9 24-2" />
            {/* mirrored paisley */}
            <path d="M190 236c-42-2-66-44-52-84 11-31 47-49 75-36 23 11 27 40 8 53-17 11-34-1-30-16 3-10 15-12 20-5" />
            <path d="M188 220c-30-3-46-33-36-61 8-22 33-34 52-25" />
            {/* vines */}
            <path d="M0 214c26-20 44-20 62 0s38 22 58 4" />
            <path d="M140 30c20 10 40 8 60-6s38-12 60 2" />
            <path d="M226 120c-10 18-6 34 10 46" />
          </g>
          <g fill="currentColor">
            <circle cx="84" cy="88" r="3.4" /><circle cx="96" cy="72" r="2.4" /><circle cx="72" cy="104" r="2.4" />
            <circle cx="184" cy="174" r="3.4" /><circle cx="172" cy="190" r="2.4" /><circle cx="196" cy="158" r="2.4" />
            <circle cx="20" cy="40" r="5" /><circle cx="34" cy="54" r="2.6" /><circle cx="236" cy="236" r="5" />
            <circle cx="120" cy="150" r="2.2" /><circle cx="140" cy="132" r="3" /><circle cx="236" cy="70" r="2.4" />
          </g>
          {/* flowers */}
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <g transform="translate(205 88)">{petals(8, 9, 4, 8)}<circle r="4" /></g>
            <g transform="translate(40 168)">{petals(10, 11, 4, 9)}<circle r="5" /><circle r="16" strokeDasharray="1 4" /></g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p${id})`} />
    </svg>
  );
}

/** The flower border band used between sections on taptajivanam.com. */
export function FlowerBand({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`${className.includes("absolute") ? "" : "relative "}h-[30px] w-full overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`b${id}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2.5" x2="30" y2="2.5" stroke="var(--ornament)" strokeWidth="1.2" />
            <line x1="0" y1="27.5" x2="30" y2="27.5" stroke="var(--ornament)" strokeWidth="1.2" />
            <g fill="var(--ornament-light)">
              {[3, 9, 15, 21, 27].map((x) => <circle key={`t${x}`} cx={x} cy="6.5" r="1.1" />)}
              {[3, 9, 15, 21, 27].map((x) => <circle key={`b${x}`} cx={x} cy="23.5" r="1.1" />)}
            </g>
            <g fill="var(--ornament)">{petals(10, 4.6, 1.7, 3.6, 15, 15)}</g>
            <circle cx="15" cy="15" r="2" fill="var(--page)" stroke="var(--ornament)" strokeWidth=".8" />
            <circle cx="0" cy="15" r="1.6" fill="var(--ornament-light)" /><circle cx="30" cy="15" r="1.6" fill="var(--ornament-light)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#b${id})`} />
      </svg>
    </div>
  );
}

/** Lotus rosette (mandala). Colour from currentColor. */
export function Rosette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden fill="none" stroke="currentColor">
      <circle r="96" strokeWidth=".8" strokeDasharray="1.5 4" />
      <circle r="88" strokeWidth=".8" />
      <g strokeWidth="1">{petals(24, 72, 6, 15)}</g>
      <circle r="56" strokeWidth=".8" />
      <g strokeWidth="1.1">{petals(16, 42, 8, 17)}</g>
      <g strokeWidth="1">{petals(8, 22, 7, 13)}</g>
      <circle r="8" strokeWidth="1.2" />
      <circle r="3" fill="currentColor" />
    </svg>
  );
}

/** Small centred ornament used under headings. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-ornament ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-current opacity-60" />
      <svg viewBox="-12 -12 24 24" className="h-4 w-4" fill="currentColor">{petals(8, 6, 2, 4.5)}<circle r="2.2" fill="var(--page)" /></svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-current opacity-60" />
    </div>
  );
}

/** The Taptajīvanam mark: a lamp flame rising from a lotus. */
export function LogoMark({ className = "", flame = "#f4b26a" }: { className?: string; flame?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M24 3.5c4.6 5.2 7.4 9.6 5.6 14.2-1.1 2.8-3.4 4.1-5.6 4.1s-4.5-1.3-5.6-4.1C16.6 13.1 19.4 8.7 24 3.5Z" fill={flame} />
      <path d="M24 10.5c1.9 2.4 2.9 4.5 2.1 6.4-.4 1-1.2 1.5-2.1 1.5s-1.7-.5-2.1-1.5c-.8-1.9.2-4 2.1-6.4Z" fill="#fff6e8" opacity=".9" />
      <g fill="currentColor">
        <path d="M24 44c-4.6-4.2-6.6-9.2-6-14.2.4-3 2.4-5.6 6-7.6 3.6 2 5.6 4.6 6 7.6.6 5-1.4 10-6 14.2Z" />
        <path d="M22.6 43.8C15.8 42.6 10.6 38.6 8.6 32.4c-.6-1.8-.6-3.6-.2-5.2 4 .2 7.6 1.8 10.2 4.6 2.8 3 4 7 4 12Z" opacity=".85" />
        <path d="M25.4 43.8c6.8-1.2 12-5.2 14-11.4.6-1.8.6-3.6.2-5.2-4 .2-7.6 1.8-10.2 4.6-2.8 3-4 7-4 12Z" opacity=".85" />
        <path d="M21 44.4c-6.6.6-12.4-1.4-16-5.6 3.2-2 7-2.6 10.6-1.6 2.4.7 4.2 2.9 5.4 7.2ZM27 44.4c6.6.6 12.4-1.4 16-5.6-3.2-2-7-2.6-10.6-1.6-2.4.7-4.2 2.9-5.4 7.2Z" opacity=".6" />
      </g>
    </svg>
  );
}
