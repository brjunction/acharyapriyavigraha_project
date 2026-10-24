import { MenuHub } from "@/components/sections";
import { Img } from "@/components/ui";
import { Rosette, CutOut } from "@/components/motifs";
import { IMG } from "@/lib/data";

export const metadata = { title: "Śrīla Gurudeva" };

export default function Page() {
  return (
    <MenuHub menuKey="gurudeva" aside={
      <div className="relative mx-auto hidden h-72 w-64 lg:block">
        <Rosette className="spin-slow absolute inset-0 h-full w-full text-saffron/30" />
        <CutOut src="/legacy/gurudeva.webp" alt="Śrīla Gurudeva" className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto object-contain" />
      </div>
    } />
  );
}
