import { Image as ImageIcon } from "lucide-react";
import { GALLERY_TAGS, IMG } from "@/lib/data";
import { Container, Img, PageHero } from "@/components/ui";

export const metadata = { title: "Gallery" };

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Gallery" }]} icon={ImageIcon} title="Gallery" intro="Albums by theme, place and year. Tags combine, for example Bhubaneswar and 1993." />
      <Container className="py-12">
        <div className="flex flex-wrap gap-2">{["All albums", "1985", "1986", "1991", "1993", "1995"].map((y, i) => <span key={y} className={`rounded-full border px-3.5 py-1.5 text-[13.5px] ${i === 0 ? "border-saffron bg-saffron text-white" : "border-line bg-surface text-ink-2"}`}>{y}</span>)}</div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {GALLERY_TAGS.map((t, i) => (
            <a key={t} href="#" className="group overflow-hidden rounded-[14px] border border-line bg-surface">
              <div className="overflow-hidden"><Img src={i === 0 ? IMG.ggs : i % 3 === 0 ? IMG.banner(1) : IMG.ggsSite} alt={t} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" /></div>
              <div className="p-4"><p className="font-serif text-[17px] font-bold leading-tight group-hover:text-saffron">{t}</p><p className="mt-0.5 text-[12.5px] text-ink-3">Album</p></div>
            </a>
          ))}
        </div>
      </Container>
    </>
  );
}
