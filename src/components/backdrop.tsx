/** A full-bleed background picture for a hero or section (see public/backgrounds). Dims itself in the dark theme. */
export function Backdrop({ src, flip = false, className = "", pos = "center", size = "cover", o = 0.5 }: { src: string; flip?: boolean; className?: string; pos?: string; size?: string; o?: number }) {
  return (
    <div aria-hidden className={`bgimg pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: `url(/backgrounds/${src}.webp)`, backgroundSize: size, backgroundPosition: pos, backgroundRepeat: "no-repeat", transform: flip ? "scaleX(-1)" : undefined, opacity: o }} />
  );
}
