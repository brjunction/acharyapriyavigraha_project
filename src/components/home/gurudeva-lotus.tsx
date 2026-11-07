import { VMask } from "@/components/motifs";

/* The home hero's portrait: Śrīla Gurudeva in a round frame, a golden mandala turning slowly behind him,
   and a warm glow in the colours of the photograph (saffron robe, golden sky). */
export function GurudevaLotus({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group/halo relative aspect-square w-full">
      <div aria-hidden className="absolute inset-[-6%] rounded-full bg-[radial-gradient(closest-side,rgba(255,214,150,.55),rgba(232,145,60,.25)_45%,transparent_72%)] transition duration-1000 group-hover/halo:scale-105" />
      <div aria-hidden className="absolute inset-[-20%]"><VMask name="mandala-gold" className="hx-mandala h-full w-full text-[#ffd98a] opacity-[0.26]" /></div>
      <div aria-hidden className="absolute inset-[-6%]"><VMask name="mandala-gold" className="hx-mandala-rev h-full w-full text-[#fff1cf] opacity-[0.14]" /></div>
      <div className="gd-portrait absolute inset-[13%] overflow-hidden rounded-full shadow-[0_34px_80px_-26px_rgba(70,10,4,.85)] ring-[6px] ring-[#fff3df]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover/halo:scale-[1.04]" style={{ objectPosition: "center 22%" }} fetchPriority="high" />
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-[11%] rounded-full ring-1 ring-[#f3c35e]/70" />
    </div>
  );
}
