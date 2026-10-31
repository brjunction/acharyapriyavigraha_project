import Link from "next/link";
import { ChevronRight, FileText, Newspaper, UsersRound } from "lucide-react";

const TABS = [["/teachings/articles", "Articles", FileText], ["/teachings/magazines", "Magazines", Newspaper], ["/teachings/articles/authors", "Authors", UsersRound]] as const;
/** Title, a line, numbers and tabs between articles, magazines and authors. */
export function WritingsHeader({ at, title, intro, stats, crumbs = [] }: { at: string; title: string; intro: string; stats: string[]; crumbs?: [string, string][] }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pt-5 sm:px-6">
        
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-[24px] leading-tight text-ink sm:text-[26px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{title}</h1><p className="mt-1 max-w-2xl text-[13.5px] text-ink-2">{intro}</p></div>
          {stats.length > 0 && <p className="text-[12.5px] text-ink-3">{stats.join(" · ")}</p>}
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto [scrollbar-width:none]">{TABS.map(([h, l, I]) => <Link key={h} href={h} className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] transition ${at === h ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}><I size={14} />{l}</Link>)}</div>
      </div>
    </div>
  );
}
/** A round photo for an author, or their initials. */
export function Avatar({ name, photo, size = 36 }: { name: string; photo?: string | null; size?: number }) {
  const ini = name.replace(/^(Śrī|Śrīla|Śrīmad|His|Her|HH|HG)\s+/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt="" className="shrink-0 rounded-full border border-line object-cover object-top" style={{ width: size, height: size }} /> : <span className="flex shrink-0 items-center justify-center rounded-full bg-band font-medium text-ink-2" style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>;
}
