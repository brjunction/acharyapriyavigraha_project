import Link from "next/link";
import { ChevronRight, AudioLines, Music2, Video } from "lucide-react";

const TABS = [["/teachings/audio", "Audio lectures", AudioLines], ["/teachings/kirtans", "Kīrtanas & bhajanas", Music2], ["/teachings/videos", "Videos", Video]] as const;
/** Title, one line about it, a few numbers, and tabs between the three media libraries. */
export function MediaHeader({ at, title, intro, stats }: { at: string; title: string; intro: string; stats: string[] }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pt-5 sm:px-6">
        <nav className="flex items-center gap-1 text-[12px] text-ink-3"><Link href="/teachings" className="hover:text-saffron">His Teachings</Link><ChevronRight size={12} /><span className="text-ink-2">{title}</span></nav>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-[24px] leading-tight text-ink sm:text-[26px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{title}</h1><p className="mt-1 max-w-2xl text-[13.5px] text-ink-2">{intro}</p></div>
          {stats.length > 0 && <p className="text-[12.5px] text-ink-3">{stats.join(" · ")}</p>}
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto [scrollbar-width:none]">{TABS.map(([h, l, I]) => <Link key={h} href={h} className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] transition ${at === h ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}><I size={14} />{l}</Link>)}</div>
      </div>
    </div>
  );
}
