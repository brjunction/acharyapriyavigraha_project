/**
 * Section background, drawn as vector art so it stays sharp at any size.
 * The old `src` names are kept: each maps to a colour family (light, warm, red, blue).
 */
type Tone = { base: string; line: string; glow: string; o: number };
const TONES: Record<string, Tone> = {
  light: { base: "#f7efe0", line: "#b9780a", glow: "rgba(233,184,95,0.35)", o: 0.2 },
  warm: { base: "#f3e2c4", line: "#853500", glow: "rgba(210,130,40,0.3)", o: 0.16 },
  red: { base: "#4a0a0c", line: "#e8b872", glow: "rgba(200,60,40,0.45)", o: 0.2 },
  saffron: { base: "#8a3a0a", line: "#f3b363", glow: "rgba(243,179,99,0.28)", o: 0.2 },
  blue: { base: "#12295f", line: "#bcd0ff", glow: "rgba(90,130,230,0.4)", o: 0.18 },
};
const FAMILY: Record<string, keyof typeof TONES> = {
  "red-gold-mandala": "red", "maroon-mandala": "red", "red-henna-gold": "red", "blue-mandala": "blue",
  "saffron-dark": "saffron", "tan-mandala": "warm", "orange-mandala": "warm", "folk-peacock": "warm",
};

function tile(line: string) {
  // One 120 x 120 tile: an eight-petal lotus with a diamond lattice, drawn with hairlines
  const petals = Array.from({ length: 8 }, (_, i) => `<path d="M0 -6 C 6 -16 6 -30 0 -40 C -6 -30 -6 -16 0 -6 Z" transform="rotate(${i * 45})"/>`).join("");
  const small = Array.from({ length: 8 }, (_, i) => `<path d="M0 -4 C 3 -9 3 -15 0 -19 C -3 -15 -3 -9 0 -4 Z" transform="rotate(${i * 45 + 22.5})"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="${line}" stroke-width="0.8" stroke-linejoin="round">
<g transform="translate(60 60)">${petals}${small}<circle r="3.2"/><circle r="44" stroke-dasharray="1 3"/></g>
<path d="M60 0 L120 60 L60 120 L0 60 Z" stroke-width="0.6"/>
<g transform="translate(0 0)"><circle r="2"/></g><g transform="translate(120 0)"><circle r="2"/></g><g transform="translate(0 120)"><circle r="2"/></g><g transform="translate(120 120)"><circle r="2"/></g>
</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function Backdrop({ src, flip = false, className = "", o }: { src: string; flip?: boolean; className?: string; pos?: string; size?: string; o?: number }) {
  const t = TONES[FAMILY[src] ?? "light"];
  // `o` (the old image opacity) now only scales the pattern a little
  const k = o === undefined ? 1 : 0.7 + Math.min(o, 1) * 0.6;
  return (
    <div aria-hidden className={`bgimg pointer-events-none absolute inset-0 ${className}`} style={{ backgroundColor: t.base, transform: flip ? "scaleX(-1)" : undefined }}>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(60% 80% at 85% 20%, ${t.glow}, transparent 70%), radial-gradient(50% 70% at 10% 90%, ${t.glow}, transparent 70%)` }} />
      <div className="absolute inset-0" style={{ backgroundImage: tile(t.line), backgroundSize: "120px 120px", opacity: Math.min(0.9, t.o * k) }} />
    </div>
  );
}
