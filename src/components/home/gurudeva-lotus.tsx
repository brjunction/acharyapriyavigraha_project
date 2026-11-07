/* The home hero: Śrīla Gurudeva seated on a lotus, seen from the side as in the old paintings —
   a back row of tall petals rising behind him, a front row cupping the seat, broad emerald lotus leaves
   spreading over still water, a bud on a curving stem, and soft golden rays behind his head.
   Everything moves very slowly; on hover the lotus opens a little and glows. */
const f = (n: number) => Math.round(n * 100) / 100;
const CX = 360, CY = 292, R = 168;      // portrait
const BX = 360, BY = 612;               // where the petals rise from

/** A petal pointing up from (0,0): full shoulders, a soft pointed tip. */
const petal = (L: number, W: number) =>
  `M0,0 C${f(-W * 0.55)},${f(-L * 0.06)} ${f(-W)},${f(-L * 0.38)} ${f(-W * 0.86)},${f(-L * 0.64)} C${f(-W * 0.7)},${f(-L * 0.86)} ${f(-W * 0.16)},${f(-L * 0.95)} 0,${f(-L)} C${f(W * 0.16)},${f(-L * 0.95)} ${f(W * 0.7)},${f(-L * 0.86)} ${f(W * 0.86)},${f(-L * 0.64)} C${f(W)},${f(-L * 0.38)} ${f(W * 0.55)},${f(-L * 0.06)} 0,0Z`;
const vein = (L: number) => `M0,-6 L0,${f(-L * 0.88)}`;

const BACK = [-78, -60, -42, -24, -8, 8, 24, 42, 60, 78].map((a, i) => ({ a, L: 250 - Math.abs(a) * 0.9, W: 50, d: i * 0.37 }));
const FRONT = [-70, -46, -22, 0, 22, 46, 70].map((a, i) => ({ a, L: 168 - Math.abs(a) * 0.55, W: 52, d: i * 0.41 }));

/** A lotus leaf lying on the water: an ellipse with a notch, and veins running out from its heart. */
function Leaf({ x, y, rx, ry, rot, cls, notch = 0 }: { x: number; y: number; rx: number; ry: number; rot: number; cls: string; notch?: number }) {
  const n = 13;
  return (
    <g className={cls} style={{ transformOrigin: `${x}px ${y}px` }}>
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse rx={rx} ry={ry} fill="url(#lf-g)" stroke="#a9d39a" strokeOpacity=".28" strokeWidth="1" />
        <ellipse rx={rx * 0.96} ry={ry * 0.9} fill="url(#lf-sheen)" />
        <path d={`M0,0 L${f(rx * Math.cos(notch))},${f(ry * Math.sin(notch) - 6)} L${f(rx * Math.cos(notch))},${f(ry * Math.sin(notch) + 6)}Z`} fill="#3a0a07" fillOpacity=".55" />
        {Array.from({ length: n }, (_, i) => { const t = (Math.PI * 2 * i) / n + 0.2; return <path key={i} d={`M0,0 L${f(rx * 0.92 * Math.cos(t))},${f(ry * 0.92 * Math.sin(t))}`} stroke="#f3c35e" strokeOpacity=".2" strokeWidth=".8" />; })}
        <circle r="4" fill="#f3c35e" fillOpacity=".35" />
      </g>
    </g>
  );
}

export function GurudevaLotus({ src, alt }: { src: string; alt: string }) {
  const petals = (rows: typeof BACK, fill: string, cls: string) => rows.map((p) => (
    <g key={p.a} transform={`rotate(${p.a} ${BX} ${BY})`}>
      <g className={`lp-sway ${cls}`} style={{ transformOrigin: `${BX}px ${BY}px`, animationDelay: `${-p.d}s` }}>
        <g transform={`translate(${BX} ${BY})`}>
          <path d={petal(p.L, p.W)} fill={`url(#${fill})`} stroke="#f3c35e" strokeOpacity=".55" strokeWidth=".9" />
          <path d={vein(p.L)} stroke="#f3c35e" strokeOpacity=".22" strokeWidth=".7" fill="none" />
        </g>
      </g>
    </g>));
  return (
    <div className="group/lotus relative aspect-square w-full">
      {/* rays and a warm aura behind his head */}
      <div aria-hidden className="gd-rays absolute size-[115%]" style={{ left: `${(CX / 720) * 100}%`, top: `${(CY / 720) * 100}%`, transform: "translate(-50%,-50%)" }} />
      <div aria-hidden className="absolute size-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(243,195,94,.30),rgba(232,145,60,.08)_60%,transparent)] opacity-80 transition duration-1000 group-hover/lotus:scale-110 group-hover/lotus:opacity-100" style={{ left: `${(CX / 720) * 100}%`, top: `${(CY / 720) * 100}%`, transform: "translate(-50%,-50%)" }} />

      {/* behind the portrait: water, the far leaves, the bud, the back petals */}
      <svg viewBox="0 0 720 720" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="lf-g" cx=".45" cy=".4" r=".75"><stop offset="0" stopColor="#3f7d59" /><stop offset=".65" stopColor="#24563d" /><stop offset="1" stopColor="#123726" /></radialGradient>
          <radialGradient id="lf-sheen" cx=".35" cy=".3" r=".6"><stop offset="0" stopColor="#d8f0c8" stopOpacity=".18" /><stop offset="1" stopColor="#d8f0c8" stopOpacity="0" /></radialGradient>
          <linearGradient id="pt-back" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#5a120a" stopOpacity=".55" /><stop offset=".55" stopColor="#b4501a" stopOpacity=".5" /><stop offset="1" stopColor="#f6c76c" stopOpacity=".62" /></linearGradient>
          <linearGradient id="pt-front" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#6a160c" stopOpacity=".92" /><stop offset=".5" stopColor="#c2621d" stopOpacity=".9" /><stop offset="1" stopColor="#ffd98a" stopOpacity=".95" /></linearGradient>
          <linearGradient id="pt-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#ffe9b8" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f7d59" /><stop offset="1" stopColor="#1c4a33" /></linearGradient>
          <filter id="pt-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#200402" floodOpacity=".4" /></filter>
        </defs>
        {/* still water */}
        <ellipse cx={BX} cy={BY + 70} rx="330" ry="34" fill="#2a0604" fillOpacity=".35" />
        {[0, 3, 6].map((d) => <ellipse key={d} cx={BX} cy={BY + 70} rx="150" ry="16" fill="none" stroke="#f3c35e" strokeOpacity=".4" strokeWidth=".8" className="lp-water" style={{ transformOrigin: `${BX}px ${BY + 70}px`, animationDelay: `${d}s` }} />)}
        {/* far leaves */}
        <Leaf x={150} y={636} rx={150} ry={44} rot={-6} cls="lp-leaf-a" notch={-0.35} />
        <Leaf x={588} y={640} rx={140} ry={42} rot={7} cls="lp-leaf-b" notch={3.5} />
        {/* a bud on a curving stem */}
        <g className="lp-bud" style={{ transformOrigin: "612px 640px" }}>
          <path d="M612,640 C600,560 640,520 628,452" fill="none" stroke="url(#stem)" strokeWidth="5" strokeLinecap="round" />
          <g transform="translate(628 452) rotate(10)"><path d={petal(78, 22)} fill="url(#pt-front)" stroke="#f3c35e" strokeOpacity=".6" strokeWidth=".8" /><path d={petal(64, 14)} transform="rotate(-18)" fill="url(#pt-back)" stroke="#f3c35e" strokeOpacity=".5" strokeWidth=".7" /><path d={petal(64, 14)} transform="rotate(18)" fill="url(#pt-back)" stroke="#f3c35e" strokeOpacity=".5" strokeWidth=".7" /></g>
        </g>
        <g className="lp-open-back transition duration-[1400ms] ease-out group-hover/lotus:[transform:scale(1.045)]" style={{ transformOrigin: `${BX}px ${BY}px` }} filter="url(#pt-sh)">{petals(BACK, "pt-back", "lp-sway-b")}</g>
      </svg>

      {/* the portrait */}
      <div className="gd-portrait absolute aspect-square overflow-hidden rounded-full shadow-[0_30px_70px_-24px_rgba(20,2,1,.9)] ring-2 ring-[#f3c35e]/80" style={{ left: `${((CX - R) / 720) * 100}%`, top: `${((CY - R) / 720) * 100}%`, width: `${((R * 2) / 720) * 100}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover transition duration-[1400ms] group-hover/lotus:scale-[1.04]" style={{ objectPosition: "center 22%" }} fetchPriority="high" />
      </div>
      <div aria-hidden className="pointer-events-none absolute rounded-full ring-1 ring-[#f3c35e]/35" style={{ left: `${((CX - R - 12) / 720) * 100}%`, top: `${((CY - R - 12) / 720) * 100}%`, width: `${(((R + 12) * 2) / 720) * 100}%`, aspectRatio: "1" }} />

      {/* in front: the near leaves and the front petals cupping the seat, with a shine passing over them */}
      <svg viewBox="0 0 720 720" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs><mask id="pt-m">{FRONT.map((p) => <path key={p.a} d={petal(p.L, p.W)} fill="#fff" transform={`rotate(${p.a} ${BX} ${BY}) translate(${BX} ${BY})`} />)}</mask></defs>
        <Leaf x={230} y={672} rx={170} ry={40} rot={-3} cls="lp-leaf-c" notch={-0.6} />
        <Leaf x={500} y={676} rx={160} ry={38} rot={4} cls="lp-leaf-d" notch={3.8} />
        <g className="lp-open-front transition duration-[1400ms] ease-out group-hover/lotus:[transform:scale(1.05)]" style={{ transformOrigin: `${BX}px ${BY}px` }} filter="url(#pt-sh)">{petals(FRONT, "pt-front", "lp-sway-f")}</g>
        <g mask="url(#pt-m)"><rect x="-300" y="380" width="260" height="260" fill="url(#pt-shine)" className="lp-shine" /></g>
        <ellipse cx={BX} cy={BY - 2} rx="64" ry="9" fill="#f3c35e" fillOpacity=".25" />
      </svg>
    </div>
  );
}
