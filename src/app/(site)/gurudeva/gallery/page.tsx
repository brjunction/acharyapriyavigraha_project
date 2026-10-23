import { GALLERY_TAGS, IMG } from "@/lib/data";
import { Img } from "@/components/chrome";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Gallery" };

export default function Gallery() {
  return (
    <>
      <PageHead eyebrow="Śrīla Gurudeva · Remembrance" title="Gallery" intro="Albums by theme, place and year. Tags can be combined, for example Bhubaneswar + 1993." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">{["All", "1985", "1986", "1991", "1993", "1995"].map((y, i) => <span key={y} className={`rounded-full border px-3 py-1.5 text-sm ${i === 0 ? "border-maroon bg-maroon text-paper" : "border-line bg-card"}`}>{y}</span>)}</div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {GALLERY_TAGS.map((t, i) => (
            <a key={t} href="#" className="group overflow-hidden rounded-2xl border border-line bg-card">
              <Img src={i % 2 ? IMG.ggs : IMG.banner((i % 5) + 1)} alt={t} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-3"><p className="font-serif text-[16px] leading-tight">{t}</p><p className="text-xs text-ink-3">album</p></div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
