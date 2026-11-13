import Link from "next/link";
import { BookOpen, FileText, Newspaper } from "lucide-react";

const TABS = [["/teachings/books", "Books", BookOpen], ["/teachings/magazines", "Magazines", Newspaper], ["/teachings/articles", "Articles", FileText]] as const;
/** Books · Magazines · Articles — the three ways into reading, the same on each of their pages. */
export function ReadTabs({ at }: { at: string }) {
  return <nav aria-label="Read" className="inline-flex rounded-full bg-band p-1">{TABS.map(([h, l, I]) => { const on = at === h || (h !== "/teachings/books" && at.startsWith(h)); return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition ${on ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-ink-2 hover:text-ink"}`}><I size={14} />{l}</Link>; })}</nav>;
}
/** Books · Magazines · Articles, then the title, a line and numbers. */
export function WritingsHeader({ at, title, intro, stats, crumbs = [] }: { at: string; title: string; intro: string; stats: string[]; crumbs?: [string, string][] }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pb-5 pt-5 sm:px-6">
        <ReadTabs at={at} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-[24px] leading-tight text-ink sm:text-[26px]">{title}</h1><p className="mt-1 max-w-2xl text-[13.5px] text-ink-2">{intro}</p></div>
          {stats.length > 0 && <p className="text-[12.5px] text-ink-3">{stats.join(" · ")}</p>}
        </div>

      </div>
    </div>
  );
}
/** A round photo for an author, or their initials. */
export function Avatar({ name, photo, size = 36 }: { name: string; photo?: string | null; size?: number }) {
  const ini = name.replace(/^(Śrī|Śrīla|Śrīmad|His|Her|HH|HG)\s+/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt="" className="shrink-0 rounded-full border border-line object-cover object-top" style={{ width: size, height: size }} /> : <span className="flex shrink-0 items-center justify-center rounded-full bg-band font-medium text-ink-2" style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>;
}
