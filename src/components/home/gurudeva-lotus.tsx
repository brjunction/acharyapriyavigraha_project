/* The home hero's lotus: a pink lotus seen from above — three layers of petals shaded from a pearl-white base to a rose tip,
   with fine veins and a golden ring of stamens — turning slowly around Śrīla Gurudeva's round portrait. */
const C = 300;
const f = (n: number) => Math.round(n * 100) / 100;

/** A lotus petal pointing up from (0,0): full shoulders, a soft pointed tip. */
const petal = (L: number, W: number) =>
  `M0,0 C${-W * 0.55},${-L * 0.06} ${-W},${-L * 0.38} ${-W * 0.86},${-L * 0.64} C${-W * 0.7},${-L * 0.86} ${-W * 0.16},${-L * 0.95} 0,${-L} C${W * 0.16},${-L * 0.95} ${W * 0.7},${-L * 0.86} ${W * 0.86},${-L * 0.64} C${W},${-L * 0.38} ${W * 0.55},${-L * 0.06} 0,0Z`;
const veins = (L: number, W: number) => [
  `M0,-4 L0,${-L * 0.9}`,
  `M-1.5,-6 C${-W * 0.42},${-L * 0.3} ${-W * 0.5},${-L * 0.62} ${-W * 0.2},${-L * 0.86}`,
  `M1.5,-6 C${W * 0.42},${-L * 0.3} ${W * 0.5},${-L * 0.62} ${W * 0.2},${-L * 0.86}`,
];
type Layer = { n: number; L: number; W: number; r0: number; off: number; fill: string; cls: string; delay: number; shadow?: boolean };
const LAYERS: Layer[] = [
  { n: 16, L: 240, W: 54, r0: 58, off: 0, fill: "gl-a", cls: "gl-cw", delay: 0 },
  { n: 16, L: 204, W: 52, r0: 52, off: 11.25, fill: "gl-b", cls: "gl-ccw", delay: 0.2, shadow: true },
  { n: 12, L: 160, W: 50, r0: 46, off: 0, fill: "gl-c", cls: "gl-cw2", delay: 0.4, shadow: true },
];

export function GurudevaLotus({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="gl-wrap group/lotus relative aspect-square w-full">
      {[0, 3, 6].map((d) => <span key={d} aria-hidden className="gl-ripple" style={{ animationDelay: `${d}s` }} />)}
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full overflow-visible transition duration-[1200ms] ease-out group-hover/lotus:scale-[1.035] group-hover/lotus:drop-shadow-[0_0_40px_rgba(255,170,200,.35)]" aria-hidden>
        <defs>
          <linearGradient id="gl-a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fffdfb" stopOpacity=".95" /><stop offset=".6" stopColor="#ffe8ef" stopOpacity=".92" /><stop offset="1" stopColor="#f9b4cb" stopOpacity=".9" /></linearGradient>
          <linearGradient id="gl-b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#ffe0ea" /><stop offset="1" stopColor="#f39bbb" /></linearGradient>
          <linearGradient id="gl-c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#ffd6e3" /><stop offset="1" stopColor="#ec82a8" /></linearGradient>
          <radialGradient id="gl-glow"><stop offset="0" stopColor="#ffc7d8" stopOpacity=".5" /><stop offset=".7" stopColor="#ff9fbf" stopOpacity=".1" /><stop offset="1" stopColor="#ff9fbf" stopOpacity="0" /></radialGradient>
          <filter id="gl-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7a1030" floodOpacity=".28" /></filter>
        </defs>
        <circle cx={C} cy={C} r="300" fill="url(#gl-glow)" className="gl-glow" />
        <circle cx={C} cy={C} r="296" fill="none" stroke="#ffd2a1" strokeOpacity=".35" strokeWidth=".9" strokeDasharray="1 7" strokeLinecap="round" className="gl-dots" style={{ transformOrigin: `${C}px ${C}px` }} />
        {LAYERS.map((l, li) => (
          <g key={li} className={`gl-spin ${l.cls}`} style={{ transformOrigin: `${C}px ${C}px` }}>
            <g className="gl-breathe" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${-li * 2.3}s` }}>
              <g className="gl-open" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${l.delay}s` }} filter={l.shadow ? "url(#gl-sh)" : undefined}>
                {Array.from({ length: l.n }, (_, i) => {
                  const a = (360 / l.n) * i + l.off;
                  return (
                    <g key={i} transform={`rotate(${a} ${C} ${C}) translate(${C} ${C - l.r0})`}>
                      <path d={petal(l.L - l.r0, l.W)} fill={`url(#${l.fill})`} stroke="#e0789c" strokeOpacity=".45" strokeWidth=".7" />
                      {veins(l.L - l.r0, l.W).map((d, k) => <path key={k} d={d} fill="none" stroke="#d9668e" strokeOpacity={k ? 0.2 : 0.3} strokeWidth=".6" strokeLinecap="round" />)}
                    </g>
                  );
                })}
              </g>
            </g>
          </g>
        ))}
        {/* a golden ring of stamens around the portrait */}
        <g className="gl-stamens" style={{ transformOrigin: `${C}px ${C}px` }}>
          {Array.from({ length: 48 }, (_, i) => { const a = (Math.PI * 2 * i) / 48; const r1 = 150, r2 = i % 2 ? 160 : 166; return <line key={i} x1={f(C + Math.cos(a) * r1)} y1={f(C + Math.sin(a) * r1)} x2={f(C + Math.cos(a) * r2)} y2={f(C + Math.sin(a) * r2)} stroke="#f3c35e" strokeWidth="1.6" strokeLinecap="round" strokeOpacity=".9" />; })}
          {Array.from({ length: 24 }, (_, i) => { const a = (Math.PI * 2 * i) / 24 + 0.06; return <circle key={i} cx={f(C + Math.cos(a) * 168)} cy={f(C + Math.sin(a) * 168)} r="2.4" fill="#ffd77a" />; })}
        </g>
        <circle cx={C} cy={C} r="148" fill="#fff" fillOpacity=".95" />
        <circle cx={C} cy={C} r="148" fill="none" stroke="#f3c35e" strokeOpacity=".8" strokeWidth="1.2" />
      </svg>
      <div className="gl-portrait absolute left-[26.3%] top-[26.3%] aspect-square w-[47.4%] overflow-hidden rounded-full shadow-[0_24px_50px_-20px_rgba(60,5,10,.7)] ring-[5px] ring-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: "center 22%" }} fetchPriority="high" />
      </div>
    </div>
  );
}
