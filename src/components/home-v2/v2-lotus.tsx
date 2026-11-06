/* A golden lotus seen from above — three rings of veined petals, each turning very slowly and breathing — around Śrīla Gurudeva’s round portrait, with a mandala turning far behind. */
import { VMask } from "@/components/motifs";

const C = 300;
const petal = (L: number, W: number) =>
  `M0,0 C${-W * 0.55},${-L * 0.06} ${-W},${-L * 0.38} ${-W * 0.86},${-L * 0.64} C${-W * 0.7},${-L * 0.86} ${-W * 0.16},${-L * 0.95} 0,${-L} C${W * 0.16},${-L * 0.95} ${W * 0.7},${-L * 0.86} ${W * 0.86},${-L * 0.64} C${W},${-L * 0.38} ${W * 0.55},${-L * 0.06} 0,0Z`;
const veins = (L: number, W: number) => [`M0,-4 L0,${-L * 0.9}`, `M-1.5,-6 C${-W * 0.42},${-L * 0.3} ${-W * 0.5},${-L * 0.62} ${-W * 0.2},${-L * 0.86}`, `M1.5,-6 C${W * 0.42},${-L * 0.3} ${W * 0.5},${-L * 0.62} ${W * 0.2},${-L * 0.86}`];

const LAYERS = [
  { n: 16, L: 250, W: 54, r0: 60, off: 0, fill: "tv-a", spin: "tv-spin-a", delay: 0 },
  { n: 16, L: 212, W: 52, r0: 54, off: 11.25, fill: "tv-b", spin: "tv-spin-b", delay: 0.2 },
  { n: 12, L: 166, W: 50, r0: 48, off: 0, fill: "tv-c", spin: "tv-spin-c", delay: 0.4 },
];

export function GoldLotus({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full">
      <VMask name="mandala-gold" className="tv-spin-slow pointer-events-none absolute inset-[-16%] text-[#f3c77a] opacity-[0.16]" />
      {[0, 3, 6].map((d) => <span key={d} aria-hidden className="tv-ripple" style={{ animationDelay: `${d}s` }} />)}
      <svg viewBox="0 0 600 600" className="tv-tilt absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="tv-a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff2d4" /><stop offset=".55" stopColor="#f6c27a" /><stop offset="1" stopColor="#c8601c" /></linearGradient>
          <linearGradient id="tv-b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff6e2" /><stop offset=".5" stopColor="#f8cf8c" /><stop offset="1" stopColor="#d9782a" /></linearGradient>
          <linearGradient id="tv-c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fffaf0" /><stop offset=".5" stopColor="#fbdca6" /><stop offset="1" stopColor="#e8913c" /></linearGradient>
          <radialGradient id="tv-glow"><stop offset="0" stopColor="#ffd48a" stopOpacity=".45" /><stop offset=".7" stopColor="#ffb35c" stopOpacity=".08" /><stop offset="1" stopColor="#ffb35c" stopOpacity="0" /></radialGradient>
          <filter id="tv-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3a1204" floodOpacity=".45" /></filter>
        </defs>
        <circle cx={C} cy={C} r="300" fill="url(#tv-glow)" className="tv-pulse" />
        <circle cx={C} cy={C} r="296" fill="none" stroke="#f3c77a" strokeOpacity=".35" strokeWidth=".9" strokeDasharray="1 7" strokeLinecap="round" className="tv-spin-a" style={{ transformOrigin: `${C}px ${C}px` }} />
        {LAYERS.map((l, li) => (
          <g key={li} className={l.spin} style={{ transformOrigin: `${C}px ${C}px` }}>
            <g className="tv-breathe" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${-li * 2.3}s` }}>
              <g className="tv-open" style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${l.delay}s` }} filter="url(#tv-sh)">
                {Array.from({ length: l.n }, (_, i) => (
                  <g key={i} transform={`rotate(${(360 / l.n) * i + l.off} ${C} ${C}) translate(${C} ${C - l.r0})`}>
                    <path d={petal(l.L - l.r0, l.W)} fill={`url(#${l.fill})`} fillOpacity=".96" stroke="#ffe3ad" strokeOpacity=".7" strokeWidth=".8" />
                    {veins(l.L - l.r0, l.W).map((d, k) => <path key={k} d={d} fill="none" stroke="#b5551a" strokeOpacity={k ? 0.22 : 0.32} strokeWidth=".6" strokeLinecap="round" />)}
                  </g>
                ))}
              </g>
            </g>
          </g>
        ))}
        <circle cx={C} cy={C} r="150" fill="#fff6e6" />
        <circle cx={C} cy={C} r="150" fill="none" stroke="#e8b872" strokeWidth="1.2" />
      </svg>
      <div className="tv-portrait absolute left-[26%] top-[26%] aspect-square w-[48%] overflow-hidden rounded-full shadow-[0_30px_60px_-24px_rgba(0,0,0,.75)] ring-[5px] ring-[#fff3dc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover object-[50%_0%]" fetchPriority="high" />
      </div>
    </div>
  );
}
