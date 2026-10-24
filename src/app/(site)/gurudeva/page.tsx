import { MenuHub } from "@/components/sections";
import { Img } from "@/components/ui";
import { Rosette, PortraitFrame } from "@/components/motifs";
import { IMG } from "@/lib/data";

export const metadata = { title: "Śrīla Gurudeva" };

export default function Page() {
  return (
    <MenuHub menuKey="gurudeva" aside={
      <div className="relative mx-auto hidden h-64 w-64 lg:block">
        <Rosette className="spin-slow absolute inset-0 h-full w-full text-saffron/30" />
        <PortraitFrame photo src="/photos/gurudeva-portrait.webp" className="absolute inset-[14px]" />
      </div>
    } />
  );
}
