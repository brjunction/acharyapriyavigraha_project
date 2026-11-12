import Link from "next/link";
import { nav } from "@/lib/webfolio/data";
import { SecIcon } from "@/components/webfolio/frame";
import { ContinueReading } from "@/components/webfolio/continue";
import { ArrowRight, Search, MonitorDown, WifiOff, Keyboard, Moon } from "lucide-react";

export const revalidate = 600;
/* WebFolio home: like the first pages of a book — the title, one search, then the contents: every section with its
   parts, numbered, each part one tap away. Installing and the reading tips sit quietly at the side. */
export default async function Home() {
  const n = await nav(); const sum = (k: string) => n.find((s) => s.key === k)?.groups.reduce((a, g) => a + (g.count || 0), 0) || 0;
  const facts = [["lectures", sum("lectures")], ["transcriptions", sum("transcriptions")], ["books", n.find((s) => s.key === "books")?.groups.length || 0], ["diary pages", n.find((s) => s.key === "gurudeva")?.groups.filter((g) => g.key.startsWith("diary-")).reduce((a, g) => a + (g.count || 0), 0) || 0]] as const;
  return (
    <div className="px-5 pb-20 pt-10 sm:px-10 lg:pt-14">
      <div className="mx-auto max-w-[1120px]">
        <header className="max-w-[720px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-500">The WebFolio</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-zinc-950 sm:text-[34px]">The teachings of Śrīla Gurudeva, as one book.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">{facts.some(([, v]) => v) ? `${facts.filter(([, v]) => v).map(([l, v]) => `${v.toLocaleString()} ${l}`).join(" · ")}. ` : ""}One contents, one search, and it works offline once installed.</p>
          <form action="/webfolio/search" className="mt-6 flex h-12 max-w-[620px] items-center gap-3 rounded-xl border border-zinc-300 bg-white pl-4 pr-1.5 transition focus-within:border-zinc-900">
            <Search size={18} className="shrink-0 text-zinc-400" /><input name="q" placeholder="Search every word" className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-zinc-950 outline-none placeholder:text-zinc-400" />
            <kbd className="hidden rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500 sm:block">Ctrl K</kbd>
            <button className="h-9 rounded-lg bg-zinc-900 px-4 text-[13.5px] font-medium text-white transition hover:bg-zinc-700">Search</button>
          </form>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-labelledby="contents">
            <h2 id="contents" className="border-b border-zinc-900 pb-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-900">Contents</h2>
            <ol>
              {n.map((s, i) => { const c = s.groups.reduce((a, g) => a + (g.count || 0), 0); return (
                <li key={s.key} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 border-b border-zinc-200 py-5 sm:grid-cols-[36px_minmax(0,1fr)_auto]">
                  <span className="pt-0.5 text-[13px] tabular-nums text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <Link href={`/webfolio/${s.key}`} className="group inline-flex items-center gap-2.5"><SecIcon s={s} size={15} /><span className="text-[17px] font-semibold text-zinc-950 group-hover:underline">{s.title}</span></Link>
                    <p className="mt-1 text-[13.5px] text-zinc-500">{s.desc}</p>
                    {s.groups.length > 0 && <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                      {s.groups.slice(0, 8).map((g) => <Link key={g.key} href={`/webfolio/${s.key}/${g.key}`} className="text-zinc-700 underline-offset-2 hover:text-zinc-950 hover:underline">{g.title.replace(/^His Diary, /, "Diary ")}</Link>)}
                      {s.groups.length > 8 && <Link href={`/webfolio/${s.key}`} className="text-zinc-500 hover:text-zinc-950">+{s.groups.length - 8} more</Link>}
                    </p>}
                  </div>
                  <span className="col-start-2 mt-2 text-[12.5px] tabular-nums text-zinc-500 sm:col-start-3 sm:mt-0.5 sm:text-right">{s.groups.length} parts{c ? <><br className="max-sm:hidden" /><span className="sm:hidden"> · </span>{c.toLocaleString()} entries</> : null}</span>
                </li>); })}
            </ol>
          </section>

          <aside className="space-y-4 lg:pt-[42px]">
            <ContinueReading />
            <Link href="/webfolio/download" className="group block rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-400">
              <MonitorDown size={20} className="text-zinc-700" />
              <p className="mt-3 text-[15px] font-semibold text-zinc-950">Install the WebFolio</p>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">On Windows, Mac or your phone. Every text stays on your device; save lectures to listen without internet.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-zinc-900">Download <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
            </Link>
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
              {([[Keyboard, "Ctrl K or F2", "Search from anywhere"], [Moon, "Light, sepia or dark", "Fonts, size and width: the Aa button"], [WifiOff, "Works offline", "Once installed, every page opens without internet"]] as const).map(([I, t, d]) => <li key={t} className="flex items-start gap-3 p-4"><I size={16} className="mt-0.5 shrink-0 text-zinc-500" /><div><p className="text-[13.5px] font-medium text-zinc-950">{t}</p><p className="text-[12.5px] text-zinc-500">{d}</p></div></li>)}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
