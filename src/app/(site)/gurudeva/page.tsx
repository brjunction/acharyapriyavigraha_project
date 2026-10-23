import { MenuHub } from "@/components/sections";
import { Img } from "@/components/ui";
import { Rosette } from "@/components/motifs";
import { IMG } from "@/lib/data";

export const metadata = { title: "Śrīla Gurudeva" };

export default function Page() {
  return (
    <MenuHub menuKey="gurudeva" aside={
      <div className="relative mx-auto hidden h-64 w-64 lg:block">
        <Rosette className="spin-slow absolute inset-0 h-full w-full text-saffron/30" />
        <div className="absolute inset-[18px] overflow-hidden rounded-full border-4 border-surface shadow-[var(--shadow-lg)]"><Img src={IMG.ggs} alt="Śrīla Gurudeva" className="h-full w-full object-cover" /></div>
      </div>
    } />
  );
}
