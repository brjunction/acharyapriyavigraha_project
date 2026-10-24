"use client";
// Traditional Indian ornament, constructed from real forms rather than doodles:
//  padma  - the lotus, drawn with ogee (pointed, S-curved) petals as on temple ceilings
//  buta   - the paisley / mango motif of Indian textiles
//  jali   - the eight-pointed star lattice of carved stone screens
//  toran  - the row of cusped (ogee) arches hung over a doorway
// Colour always comes from currentColor or the theme tokens, so everything follows light, sepia and dark.

import { useId } from "react";

/** One ogee petal pointing up from the origin, length L, half-width w. */
const petalD = (L: number, w: number) =>
  `M0 0C${w * 0.9} ${-L * 0.18} ${w * 1.15} ${-L * 0.55} ${w * 0.45} ${-L * 0.84}Q${w * 0.2} ${-L * 0.94} 0 ${-L}Q${-w * 0.2} ${-L * 0.94} ${-w * 0.45} ${-L * 0.84}C${-w * 1.15} ${-L * 0.55} ${-w * 0.9} ${-L * 0.18} 0 0Z`;

function Ring({ n, L, w, rot = 0, vein = true, fill }: { n: number; L: number; w: number; rot?: number; vein?: boolean; fill?: string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`rotate(${rot + (360 / n) * i})`}>
          <path d={petalD(L, w)} fill={fill ?? "none"} />
          {vein && <path d={`M0 ${-L * 0.14}V${-L * 0.7}`} opacity=".6" />}
        </g>
      ))}
    </g>
  );
}

/** Lotus seen from above. */
export function Padma({ className = "", layers = 3 }: { className?: string; layers?: 2 | 3 }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
      {layers === 3 && <Ring n={12} L={48} w={6.6} rot={15} />}
      <Ring n={8} L={38} w={8.6} />
      <Ring n={8} L={25} w={6.2} rot={22.5} />
      <circle r="7" /><circle r="3" fill="currentColor" stroke="none" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={0} cy={-5.2} r=".9" fill="currentColor" stroke="none" transform={`rotate(${45 * i})`} />)}
    </svg>
  );
}

/** The saffron mandala artwork as a recolourable mask. */
export function Rosette({ className = "" }: { className?: string }) {
  return <OrnMask src="mandala-saffron" repeat="no-repeat" size="contain" className={className} />;
}

/** Mandala of lotus rings (hand-drawn SVG version, kept for tiny sizes). */
export function RosetteLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeLinejoin="round">
      <circle r="97" strokeWidth=".8" />
      <circle r="92" strokeWidth=".6" strokeDasharray="0.1 5.1" strokeLinecap="round" />
      <g strokeWidth=".9"><Ring n={24} L={84} w={7.2} /></g>
      <circle r="52" strokeWidth=".7" />
      <g strokeWidth="1"><Ring n={16} L={66} w={9} rot={11.25} vein={false} /></g>
      <g strokeWidth="1"><Ring n={12} L={47} w={8.2} /></g>
      <g strokeWidth="1"><Ring n={8} L={29} w={7} rot={22.5} /></g>
      <circle r="9" strokeWidth="1.1" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={0} cy={-5.5} r="1.2" fill="currentColor" stroke="none" transform={`rotate(${45 * i})`} />)}
      <circle r="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Buta (paisley) outline with an inner contour and a bead trail. Drawn in a 120 x 140 box. */
function Buta({ stroke = 1.6 }: { stroke?: number }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M52 6C92 2 118 36 111 78C105 112 76 134 47 129C21 124 8 102 20 84C30 70 53 72 56 88C58 100 44 105 37 96" />
      <path d="M53 24C82 22 100 46 96 76C92 100 72 114 50 111C35 108 28 97 34 88" strokeWidth={stroke * 0.7} />
      {[[60, 44], [76, 54], [84, 70], [84, 88], [76, 102], [62, 108]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.3" fill="currentColor" stroke="none" />)}
      <g transform="translate(58 72)"><circle r="4" fill="currentColor" stroke="none" /><g strokeWidth={stroke * 0.6}><Ring n={8} L={15} w={4} vein={false} /></g></g>
    </g>
  );
}

/** Real paisley artwork (from the supplied designs) as a recolourable tiled mask. Colour = text colour. */
export function PaisleyField({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return <OrnMask src="paisley-red" repeat="repeat" size={`${400 * scale}px`} className={`absolute inset-0 h-full w-full ${className}`} />;
}

/** Border band: a chain of small lotuses between two rules, with diamond beads. */
export function FlowerBand({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`${className.includes("absolute") ? "" : "relative "}h-[30px] w-full overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`b${id}`} width="46" height="30" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2.5" x2="46" y2="2.5" stroke="var(--ornament)" strokeWidth="1" />
            <line x1="0" y1="27.5" x2="46" y2="27.5" stroke="var(--ornament)" strokeWidth="1" />
            <g transform="translate(23 15)" fill="none" stroke="var(--ornament)" strokeWidth=".9" strokeLinejoin="round">
              <g transform="scale(.27)"><Ring n={8} L={50} w={10} vein={false} /></g>
              <g transform="scale(.17) rotate(22.5)"><Ring n={8} L={50} w={10} vein={false} /></g>
              <circle r="1.6" fill="var(--ornament)" stroke="none" />
            </g>
            <path d="M0 15l4-4 4 4-4 4Z M38 15l4-4 4 4-4 4Z" fill="var(--ornament-light)" />
            <circle cx="12" cy="15" r="1" fill="var(--ornament-light)" /><circle cx="34" cy="15" r="1" fill="var(--ornament-light)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#b${id})`} />
      </svg>
    </div>
  );
}

/** Small centred ornament under headings: a lotus between two fading rules. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-ornament ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-current opacity-60" />
      <Padma className="h-6 w-6" layers={2} />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-current opacity-60" />
    </div>
  );
}

/** Row of arches along a section edge (strip 4 of the supplied henna borders). Colour = text colour. */
export function Toran({ className = "", flip = false, strip = 4 }: { className?: string; flip?: boolean; strip?: number }) {
  return <OrnMask src={`border-${strip}`} repeat="repeat-x" size="auto 100%" pos="center top" className={`h-9 w-full ${flip ? "rotate-180" : ""} ${className}`} />;
}

/** Corner border: right-angle rules with a lotus fanning out of the corner. */
export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2H70M2 2V70" strokeWidth="1.3" />
      <path d="M2 11H44M11 2V44" strokeWidth=".7" opacity=".6" />
      <g transform="translate(2 2)" strokeWidth=".9">
        {[98, 116, 135, 154, 172].map((a) => <path key={a} d={petalD(a === 135 ? 52 : a === 116 || a === 154 ? 44 : 34, 7.5)} transform={`rotate(${a})`} />)}
        <circle r="3.4" fill="currentColor" stroke="none" />
      </g>
      <circle cx="56" cy="2" r="1.6" fill="currentColor" stroke="none" /><circle cx="2" cy="56" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A thin divider: lotus buds on a vine. */
export function Garland({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`h-6 w-full ${className}`} aria-hidden>
      <defs>
        <pattern id={`g${id}`} width="36" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12C9 4 9 20 18 12S27 4 36 12" fill="none" stroke="var(--gold)" strokeWidth="1" opacity=".7" />
          <g transform="translate(18 12)" fill="none" stroke="var(--gold)" strokeWidth=".9" strokeLinejoin="round"><g transform="scale(.2)"><Ring n={8} L={50} w={10} vein={false} /></g><circle r="1.4" fill="var(--gold)" stroke="none" /></g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#g${id})`} />
    </svg>
  );
}

/** Ogee (onion-arch) frame for portraits: clips children to the arch and draws a double outline. */
export function OgeeFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const id = useId().replace(/:/g, "");
  const d = "M0 1V.5C0 .3 .3 .22 .5 0C.7 .22 1 .3 1 .5V1Z";
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" className="absolute"><defs><clipPath id={`o${id}`} clipPathUnits="objectBoundingBox"><path d={d} /></clipPath></defs></svg>
      <div className="absolute inset-0" style={{ clipPath: `url(#o${id})` }}>{children}</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none">
        <path d="M0 100V50C0 30 30 22 50 0C70 22 100 30 100 50V100Z" stroke="var(--gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** The Taptajīvanam mark: a lamp flame rising from a lotus. */
export function LogoMark({ className = "", flame = "#f4b26a" }: { className?: string; flame?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M24 3.5c4.6 5.2 7.4 9.6 5.6 14.2-1.1 2.8-3.4 4.1-5.6 4.1s-4.5-1.3-5.6-4.1C16.6 13.1 19.4 8.7 24 3.5Z" fill={flame} />
      <path d="M24 10.5c1.9 2.4 2.9 4.5 2.1 6.4-.4 1-1.2 1.5-2.1 1.5s-1.7-.5-2.1-1.5c-.8-1.9.2-4 2.1-6.4Z" fill="#fff6e8" opacity=".9" />
      <g fill="currentColor">
        <path d="M24 44c-4.6-4.2-6.6-9.2-6-14.2.4-3 2.4-5.6 6-7.6 3.6 2 5.6 4.6 6 7.6.6 5-1.4 10-6 14.2Z" />
        <path d="M22.6 43.8C15.8 42.6 10.6 38.6 8.6 32.4c-.6-1.8-.6-3.6-.2-5.2 4 .2 7.6 1.8 10.2 4.6 2.8 3 4 7 4 12Z" opacity=".85" />
        <path d="M25.4 43.8c6.8-1.2 12-5.2 14-11.4.6-1.8.6-3.6.2-5.2-4 .2-7.6 1.8-10.2 4.6-2.8 3-4 7-4 12Z" opacity=".85" />
        <path d="M21 44.4c-6.6.6-12.4-1.4-16-5.6 3.2-2 7-2.6 10.6-1.6 2.4.7 4.2 2.9 5.4 7.2ZM27 44.4c6.6.6 12.4-1.4 16-5.6-3.2-2-7-2.6-10.6-1.6-2.4.7-4.2 2.9-5.4 7.2Z" opacity=".6" />
      </g>
    </svg>
  );
}

/** Slowly falling flower petals for hero backgrounds (pure CSS, hidden when motion is reduced). */
export function Petals({ n = 14, className = "" }: { n?: number; className?: string }) {
  const cols = ["var(--gold)", "var(--saffron)", "var(--rose-d)", "var(--rose)", "var(--gold)"];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="petal" style={{
          left: `${(i * 37 + 7) % 100}%`, background: cols[i % cols.length], ["--d" as string]: `${16 + ((i * 5) % 12)}s`,
          ["--s" as string]: `${-((i * 3.1) % 18)}s`, ["--dx" as string]: `${((i % 2) * 2 - 1) * (40 + (i * 13) % 80)}px`,
          width: 9 + (i % 4) * 3, height: 9 + (i % 4) * 3, filter: "saturate(.9)",
        } as React.CSSProperties} />
      ))}
    </div>
  );
}


/** A supplied ornament cut out as a recolourable mask (needs <name>.mask.png in /public/ornaments). The colour is the text colour. */
export function OrnMask({ src, className = "", repeat = "no-repeat", size = "contain", pos = "center" }: { src: string; className?: string; repeat?: string; size?: string; pos?: string }) {
  const u = `url(/ornaments/${src}.mask.png)`;
  return <div aria-hidden className={`pointer-events-none ${className}`} style={{ backgroundColor: "currentColor", WebkitMaskImage: u, maskImage: u, WebkitMaskRepeat: repeat, maskRepeat: repeat, WebkitMaskSize: size, maskSize: size, WebkitMaskPosition: pos, maskPosition: pos }} />;
}

/** A supplied full-colour ornament (transparent PNG). */
export function Orn({ src, className = "" }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/ornaments/${src}.png`} alt="" aria-hidden draggable={false} className={`pointer-events-none select-none ${className}`} />;
}

/** Respectful circular frame for Śrīla Gurudeva's cut-out portrait. Never crops the head. */
export function PortraitFrame({ className = "", src = "/legacy/gurudeva.webp", alt = "Śrīla Gour Govinda Swāmī", contain = false }: { className?: string; src?: string; alt?: string; contain?: boolean }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[#e9b85f] via-[#fff1d0] to-[#e9b85f] p-[3px] shadow-[0_18px_40px_rgba(90,40,0,0.35)]">
        <span className="block h-full w-full rounded-full bg-white p-[4px]">
          <span className="relative block h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#fff7e3,#f6d9a0_60%,#e7b66a)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={contain ? "absolute inset-[7%] h-[86%] w-[86%] object-contain object-bottom" : "absolute left-1/2 top-[9%] w-[104%] max-w-none -translate-x-1/2"} />
          </span>
        </span>
      </span>
    </div>
  );
}
