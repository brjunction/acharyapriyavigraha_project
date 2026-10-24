/** Curvy, slowly flowing section dividers and drifting clouds. Decorative only. */

const WAVE = "M0 60 C 120 10, 240 10, 360 60 S 600 110, 720 60 S 960 10, 1080 60 S 1320 110, 1440 60 L1440 120 L0 120 Z";
const WAVE2 = "M0 70 C 150 110, 270 110, 400 66 S 640 10, 760 62 S 1010 112, 1120 70 S 1330 22, 1440 70 L1440 120 L0 120 Z";

/** Three layered waves that drift sideways and slowly change hue. `solid` fills the front wave with a section colour so a dark band flows into the page. */
export function Waves({ tone = "warm", flip = false, solid, className = "" }: { tone?: "warm" | "rose" | "teal" | "indigo"; flip?: boolean; solid?: string; className?: string }) {
  return (
    <div aria-hidden className={`wave-box pointer-events-none relative h-[72px] w-full overflow-hidden sm:h-[96px] ${flip ? "rotate-180" : ""} ${className}`} data-tone={tone}>
      {[["wave-a", WAVE, 0.28, 0], ["wave-b", WAVE2, 0.22, 1], ["wave-c", WAVE, 0.2, 2]].map(([c, d, o, i]) => (
        <svg key={String(c)} className={`${c} wave-hue absolute inset-y-0 left-0 h-full w-[200%]`} style={{ animationDelay: `${-(i as number) * 4}s` }} viewBox="0 0 2880 120" preserveAspectRatio="none">
          <g fill="currentColor" opacity={o as number}><path d={d as string} /><path d={d as string} transform="translate(1440 0)" /></g>
        </svg>
      ))}
      {solid && (
        <svg className="wave-solid absolute inset-y-0 left-0 h-full w-[200%]" style={{ color: solid }} viewBox="0 0 2880 120" preserveAspectRatio="none">
          <g fill="currentColor"><path d={WAVE2} transform="translate(0 6)" /><path d={WAVE2} transform="translate(1440 6)" /></g>
        </svg>
      )}
    </div>
  );
}

/** A soft cloud that drifts slowly across its section. */
export function Cloud({ className = "", delay = 0, dur = 90 }: { className?: string; delay?: number; dur?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 220 90" className={`cloud-drift pointer-events-none absolute ${className}`} style={{ animationDuration: `${dur}s`, animationDelay: `${-delay}s` }}>
      <path fill="currentColor" d="M42 78C18 78 6 64 8 50c2-14 16-22 30-18 4-16 20-26 38-22 14 3 24 12 28 24 6-6 16-8 26-4 12 4 18 14 16 26 12 0 22 8 22 20H42Z" />
    </svg>
  );
}
