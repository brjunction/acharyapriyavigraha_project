import type { CSSProperties, ReactNode } from "react";

/** One smooth, wide swoosh. The band rises over the section above it, and falls away into the page below. */
const TOP = "M0 220 V158 C 420 206 1010 176 1440 22 V220 Z";
const BOTTOM = "M0 220 V158 C 420 206 1010 176 1440 22 V220 Z";

/** A full-width tinted band with a single smooth curved top edge and a curved bottom edge. No lines, only colour. */
export function Band({ tint, className = "", children }: { tint: string; className?: string; children: ReactNode }) {
  const style = { background: tint } as CSSProperties;
  return (
    <section className={`reveal relative isolate ${className}`} style={style}>
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 -top-[139px] h-[140px] w-full sm:-top-[219px] sm:h-[220px]" viewBox="0 0 1440 220" preserveAspectRatio="none"><path d={TOP} fill={tint} /></svg>
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px z-[1] h-[140px] w-full sm:h-[220px]" viewBox="0 0 1440 220" preserveAspectRatio="none"><path d={BOTTOM} fill="var(--page)" /></svg>
      {children}
    </section>
  );
}
