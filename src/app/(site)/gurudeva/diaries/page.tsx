import { PlayCircle } from "lucide-react";
import { DIARY, fmtDate } from "@/lib/data";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Daily Diary" };

export default function Diaries() {
  return (
    <>
      <PageHead eyebrow="Śrīla Gurudeva · Diaries" title="Daily Diary" intro="Daily Shorts from HH Haladhara Swāmī Mahārāja's YouTube channel, brought in automatically each day. Swipe through them on a phone." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-4">
          {DIARY.map((d, i) => (
            <a key={d.date} href="#" className="group relative aspect-[9/16] w-56 shrink-0 snap-start overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-maroon to-maroon-deep">
              <PlayCircle size={52} strokeWidth={1.2} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 transition group-hover:scale-110" />
              {i === 0 && <span className="absolute left-3 top-3 rounded-full bg-saffron px-2.5 py-0.5 text-[11px] font-medium text-white">Today</span>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 text-white"><p className="font-serif text-lg">{d.title}</p><p className="text-xs text-white/70">{fmtDate(d.date)}</p></div>
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-3">The real site embeds each YouTube Short. Here they appear as placeholders.</p>
      </div>
    </>
  );
}
