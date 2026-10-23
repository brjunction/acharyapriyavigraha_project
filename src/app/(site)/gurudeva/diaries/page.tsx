import { PlayCircle } from "lucide-react";
import { DIARY, fmtDate } from "@/lib/data";
import { Container, PageHero } from "@/components/ui";
import { PaisleyField } from "@/components/motifs";

export const metadata = { title: "Daily Diary" };

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Daily Diary" }]} icon={PlayCircle} title="Daily Diary" intro="A short every day from HH Haladhara Swāmī Mahārāja's YouTube channel, brought in automatically. Swipe through them on a phone." />
      <Container className="py-12">
        <div className="scrollbar-none -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4">
          {DIARY.map((d, i) => (
            <a key={d.date} href="#" className="group relative aspect-[9/16] w-60 shrink-0 snap-start overflow-hidden rounded-3xl bg-[#2f2622]">
              <PaisleyField className="text-white/[0.05]" scale={0.6} />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-saffron"><PlayCircle size={34} strokeWidth={1.2} /></span>
              {i === 0 && <span className="absolute left-4 top-4 rounded-full bg-saffron px-2.5 py-0.5 text-[11.5px] font-medium text-white">Today</span>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white"><p className="font-serif text-[19px] font-bold">{d.title}</p><p className="text-[12.5px] text-white/70">{fmtDate(d.date)}</p></div>
            </a>
          ))}
        </div>
        <p className="mt-4 text-[13.5px] text-ink-3">On the live site each card plays the YouTube short. Shown here as placeholders.</p>
      </Container>
    </>
  );
}
