import type { CSSProperties, ReactNode } from "react";

/** A full-width, straight-edged tinted band. */
export function Band({ tint, className = "", children }: { tint: string; className?: string; children: ReactNode }) {
  const style = { background: tint } as CSSProperties;
  return (
    <section className={`reveal relative isolate ${className}`} style={style}>
      {children}
    </section>
  );
}
