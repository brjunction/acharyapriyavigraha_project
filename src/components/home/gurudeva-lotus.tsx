/* The home hero's lotus: a full, open lotus seen from above, in gold and ivory on the red, with Śrīla Gurudeva's
   round portrait at its heart. Four rings of pointed petals, each shaded from an ivory base to a saffron-gold tip,
   with a fine rim and midrib. The flower unfolds once on arrival and then stays still (calm, per the design standard).
   Everything stays inside its square, so nothing is cut on a phone. */

const C = 300;
const f = (n: number) => Math.round(n * 100) / 100;

/** A pointed lotus petal rising from (0,0): full shoulders and a fine tip. */
const petal = (L: number, W: number) =>
  `M0,0 C${f(-W * 0.62)},${f(-L * 0.08)} ${f(-W)},${f(-L * 0.42)} ${f(-W * 0.82)},${f(-L * 0.68)} C${f(-W * 0.6)},${f(-L * 0.88)} ${f(-W * 0.14)},${f(-L * 0.93)} 0,${-L} C${f(W * 0.14)},${f(-L * 0.93)} ${f(W * 0.6)},${f(-L * 0.88)} ${f(W * 0.82)},${f(-L * 0.68)} C${f(W)},${f(-L * 0.42)} ${f(W * 0.62)},${f(-L * 0.08)} 0,0Z`;
/** A smaller petal inside the first, for the inner light of each petal. */
const inner = (L: number, W: number) => petal(L * 0.82, W * 0.5);

type Ring = { n: number; L: number; W: number; r0: number; off: number; fill: string; stroke: string; spin: string; delay: number; glow?: boolean };
const RINGS: Ring[] = [
  { n: 24, L: 294, W: 34, r0: 120, off: 7.5, fill: "lx-a", stroke: "#fff1d0", spin: "lx-cw lx-s1", delay: 0 },
  { n: 16, L: 268, W: 50, r0: 112, off: 0, fill: "lx-b", stroke: "#d77a2e", spin: "lx-ccw lx-s2", delay: 0.15, glow: true },
  { n: 16, L: 230, W: 46, r0: 104, off: 11.25, fill: "lx-c", stroke: "#cf6d24", spin: "lx-cw lx-s3", delay: 0.3, glow: true },
  { n: 12, L: 194, W: 44, r0: 96, off: 0, fill: "lx-d", stroke: "#c4611c", spin: "lx-ccw lx-s4", delay: 0.45, glow: true },
];

export function GurudevaLotus({ src, alt, focus = "center 28%" }: { src: string; alt: string; focus?: string }) {
  return (
    <div className="relative aspect-square w-full">
      <span aria-hidden className="lx-aura pointer-events-none absolute inset-[4%] rounded-full" />
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="lx-a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffe9c2" stopOpacity=".05" /><stop offset=".6" stopColor="#ffd98a" stopOpacity=".22" /><stop offset="1" stopColor="#ffd27a" stopOpacity=".42" /></linearGradient>
          <linearGradient id="lx-b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fffaf2" /><stop offset=".6" stopColor="#ffedd2" /><stop offset="1" stopColor="#ffd08e" /></linearGradient>
          <linearGradient id="lx-c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fffdf8" /><stop offset=".55" stopColor="#fff0da" /><stop offset="1" stopColor="#ffc277" /></linearGradient>
          <linearGradient id="lx-d" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#fff3e2" /><stop offset="1" stopColor="#ffb85f" /></linearGradient>
          <linearGradient id="lx-in" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".55" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <radialGradient id="lx-heart"><stop offset=".86" stopColor="#ffe7b0" /><stop offset="1" stopColor="#d98a32" /></radialGradient>
          <filter id="lx-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7a2606" floodOpacity=".22" /></filter>
        </defs>
        <g className="lx-flower" style={{ transformOrigin: `${C}px ${C}px` }}>
        {RINGS.map((r, ri) => (
          /* one movement per nested group: the slow turn, the breathing, the first unfolding */
          <g key={ri} className={`lx-spin ${r.spin}`} style={{ transformOrigin: `${C}px ${C}px` }}>
            <g className="lx-breathe" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${-ri * 1.4}s` }}>
              <g className="lx-open" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${r.delay}s` }} filter={r.glow ? "url(#lx-sh)" : undefined}>
                {Array.from({ length: r.n }, (_, i) => {
                  const a = f((360 / r.n) * i + r.off);
                  const L = r.L - r.r0;
                  return (
                    <g key={i} transform={`rotate(${a} ${C} ${C}) translate(${C} ${C - r.r0})`}>
                      <path d={petal(L, r.W)} fill={`url(#${r.fill})`} stroke={r.stroke} strokeOpacity={ri ? 0.85 : 0.7} strokeWidth={ri ? 0.7 : 0.6} />
                      {ri > 0 && <path d={inner(L, r.W)} fill="url(#lx-in)" />}
                      <path d={`M0,-6 L0,${f(-L * 0.9)}`} stroke={r.stroke} strokeOpacity={ri ? 0.55 : 0.6} strokeWidth=".7" strokeLinecap="round" />
                    </g>
                  );
                })}
              </g>
            </g>
          </g>
        ))}
        </g>
        {/* the golden seat round the portrait: a ring of fine beads */}
        <g className="lx-spin lx-cw lx-s1" style={{ transformOrigin: `${C}px ${C}px` }}>
          {Array.from({ length: 48 }, (_, i) => {
            const t = (i / 48) * Math.PI * 2;
            return <circle key={i} cx={f(C + Math.cos(t) * 158)} cy={f(C + Math.sin(t) * 158)} r={i % 2 ? 1.6 : 2.6} fill="#fff1cf" fillOpacity={i % 2 ? 0.7 : 0.95} />;
          })}
        </g>
        <circle cx={C} cy={C} r="150" fill="url(#lx-heart)" />
      </svg>
      <div className="lx-portrait absolute left-[26%] top-[26%] aspect-square w-[48%] overflow-hidden rounded-full shadow-[0_22px_50px_-20px_rgba(70,10,4,.75)] ring-[4px] ring-[#fff3df]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: focus }} fetchPriority="high" />
      </div>
    </div>
  );
}
