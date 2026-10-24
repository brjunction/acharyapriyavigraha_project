import type { CSSProperties, ReactNode } from "react";

/** Big diagonal sweeping edges: a tinted section that rises over the one above it in one long curve. */
const UP = "M0 220 V150 C 300 250 560 -30 900 70 S 1300 -10 1440 20 V220 Z";
const DOWN = "M0 0 V 24 C 120 40 420 150 760 170 S 1250 190 1440 214 V0 Z";

/** Huge soft ribbons and lines sitting far behind the content of a band. */
function Arcs({ stroke, fill, flip }: { stroke: string; fill: string; flip?: boolean }) {
  return (
    <svg aria-hidden className={`arc-drift pointer-events-none absolute inset-0 -z-10 h-full w-full ${flip ? "-scale-x-100" : ""}`} viewBox="0 0 1440 900" preserveAspectRatio="none">
      <path d="M-120 820 C 260 640 520 760 820 420 S 1280 60 1600 -80 V 300 C 1300 340 1100 640 820 760 S 300 980 -120 980 Z" fill={fill} />
      <path d="M-140 560 C 240 480 520 520 800 300 S 1240 20 1580 -40" fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d="M-140 700 C 280 600 560 680 860 440 S 1300 140 1600 60" fill="none" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A full-width tinted band whose top edge sweeps diagonally over the previous section. */
export function Band({ tint, arc, arcFill, flip = false, carve = false, className = "", children }: {
  tint: string; arc: string; arcFill: string; flip?: boolean; carve?: boolean; className?: string; children: ReactNode;
}) {
  const style = { background: tint } as CSSProperties;
  return (
    <section className={`reveal relative isolate ${className}`} style={style}>
      <svg aria-hidden className={`pointer-events-none absolute inset-x-0 -top-[139px] h-[140px] w-full sm:-top-[219px] sm:h-[220px] ${flip ? "-scale-x-100" : ""}`} viewBox="0 0 1440 220" preserveAspectRatio="none"><path d={UP} fill={tint} /></svg>
      <Arcs stroke={arc} fill={arcFill} flip={flip} />
      {carve && <svg aria-hidden className={`pointer-events-none absolute inset-x-0 -bottom-px h-[140px] w-full sm:h-[220px] ${flip ? "" : "-scale-x-100"} rotate-180`} viewBox="0 0 1440 220" preserveAspectRatio="none"><path d={DOWN} fill="var(--page)" /></svg>}
      {children}
    </section>
  );
}

/** Carves a long diagonal curve out of the top and/or bottom of a section, in the page colour. */
export function Carve({ where }: { where: "top" | "bottom" }) {
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-x-0 z-[1] h-[110px] w-full sm:h-[190px] ${where === "top" ? "top-0 -mt-px" : "bottom-0 -mb-px rotate-180"}`} viewBox="0 0 1440 220" preserveAspectRatio="none"><path d={DOWN} fill="var(--page)" /></svg>
  );
}
