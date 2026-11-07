/* The home hero's centre: Śrīla Gurudeva's portrait within a golden seal — a slowly turning inscription of his name,
   fine rings turning the other way, small gold marks orbiting, and a soft light behind. Calm, like an engraved medallion. */
const f = (n: number) => Math.round(n * 100) / 100;
const C = 360;
const TEXT = "ŚRĪ ŚRĪMAD GOUR GOVINDA SWĀMĪ GURUDEVA  ✦  TAPTAJĪVANAM  ✦  WORDS THAT GIVE LIFE  ✦ ";

export function GurudevaLotus({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group/seal relative aspect-square w-full">
      {/* soft light and slow rays behind */}
      <div aria-hidden className="gd-rays absolute inset-[-8%] rounded-full opacity-70" />
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(243,195,94,.26),rgba(232,145,60,.07)_60%,transparent)] transition duration-1000 group-hover/seal:scale-110" />
      {[0, 4, 8].map((d) => <span key={d} aria-hidden className="gd-ripple" style={{ animationDelay: `${d}s` }} />)}

      <svg viewBox="0 0 720 720" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="sl-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe3a0" /><stop offset=".5" stopColor="#f3c35e" /><stop offset="1" stopColor="#c98a2b" /></linearGradient>
          <path id="sl-arc" d={`M ${C},${C} m -268,0 a 268,268 0 1,1 536,0 a 268,268 0 1,1 -536,0`} />
        </defs>
        {/* outermost hairline with 72 ticks, turning slowly */}
        <g className="sl-spin-slow" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r="340" fill="none" stroke="#f3c35e" strokeOpacity=".22" strokeWidth=".8" />
          {Array.from({ length: 72 }, (_, i) => { const a = (Math.PI * 2 * i) / 72; const r2 = i % 6 ? 333 : 326; return <line key={i} x1={f(C + Math.cos(a) * 340)} y1={f(C + Math.sin(a) * 340)} x2={f(C + Math.cos(a) * r2)} y2={f(C + Math.sin(a) * r2)} stroke="#f3c35e" strokeOpacity={i % 6 ? 0.25 : 0.55} strokeWidth=".9" />; })}
        </g>
        {/* orbiting marks */}
        <g className="sl-orbit" style={{ transformOrigin: `${C}px ${C}px` }}>
          {[0, 1, 2].map((k) => { const a = (Math.PI * 2 * k) / 3 - Math.PI / 2; return <g key={k} transform={`translate(${f(C + Math.cos(a) * 310)} ${f(C + Math.sin(a) * 310)})`}><circle r="7" fill="#f3c35e" fillOpacity=".18" /><path d="M0,-5 L1.6,-1.6 L5,0 L1.6,1.6 L0,5 L-1.6,1.6 L-5,0 L-1.6,-1.6Z" fill="url(#sl-gold)" /></g>; })}
        </g>
        {/* the inscription band */}
        <circle cx={C} cy={C} r="292" fill="none" stroke="url(#sl-gold)" strokeOpacity=".75" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="244" fill="none" stroke="url(#sl-gold)" strokeOpacity=".75" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="268" fill="none" stroke="#2a0604" strokeOpacity=".25" strokeWidth="46" />
        <g className="sl-spin" style={{ transformOrigin: `${C}px ${C}px` }}>
          <text fill="url(#sl-gold)" fontSize="18" fontWeight="600" style={{ fontFamily: "var(--font-sans)" }}>
            <textPath href="#sl-arc" startOffset="0" textLength={f(2 * Math.PI * 268 - 6)} lengthAdjust="spacing">{TEXT}</textPath>
          </text>
        </g>
        {/* fine inner rings, turning the other way */}
        <g className="sl-spin-rev" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r="226" fill="none" stroke="#f3c35e" strokeOpacity=".45" strokeWidth=".9" strokeDasharray="2 9" strokeLinecap="round" />
          {Array.from({ length: 8 }, (_, i) => { const a = (Math.PI * 2 * i) / 8; return <circle key={i} cx={f(C + Math.cos(a) * 226)} cy={f(C + Math.sin(a) * 226)} r="3" fill="url(#sl-gold)" />; })}
        </g>
        <circle cx={C} cy={C} r="212" fill="none" stroke="url(#sl-gold)" strokeWidth="2" />
      </svg>

      <div className="gd-portrait absolute left-[21.4%] top-[21.4%] aspect-square w-[57.2%] overflow-hidden rounded-full shadow-[0_30px_80px_-24px_rgba(15,2,1,.9)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover/seal:scale-[1.05]" style={{ objectPosition: "center 22%" }} fetchPriority="high" />
        <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(243,195,94,.5),inset_0_-30px_60px_-30px_rgba(40,5,2,.5)]" />
      </div>
    </div>
  );
}
