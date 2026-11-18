import Link from "next/link";
import { nav } from "@/lib/webfolio/data";
import { SecIcon } from "@/components/webfolio/frame";
import { ContinueReading } from "@/components/webfolio/continue";
import { ArrowRight, Search, MonitorDown, WifiOff, Keyboard, Moon } from "lucide-react";

export const revalidate = 600;
/* WebFolio home, like opening a fine book: its cover and title, one search, then the contents — every section as a
   card with its parts one tap away. Reading tips and installing sit quietly below. */
export default async function Home() {
  const n = await nav(); const sum = (k: string) => n.find((s) => s.key === k)?.groups.reduce((a, g) => a + (g.count || 0), 0) || 0;
  const facts = [["lectures", sum("lectures")], ["transcriptions", sum("transcriptions")], ["books", n.find((s) => s.key === "books")?.groups.length || 0], ["topics", n.find((s) => s.key === "tattva")?.groups.filter((g) => g.key !== "verses").length || 0], ["diary pages", n.find((s) => s.key === "gurudeva")?.groups.filter((g) => g.key.startsWith("diary-")).reduce((a, g) => a + (g.count || 0), 0) || 0]] as const;
  const shown = facts.filter(([, v]) => v);
  return (
    <div className="pb-20">
      <section className="border-b border-zinc-200 bg-[#faf6f0] px-5 pb-10 pt-10 sm:px-10 lg:pt-14">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="max-w-[680px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#853500]">The WebFolio · Taptajīvanam</p>
            <h1 className="mt-3 font-serif text-[30px] font-bold leading-[1.15] tracking-[-0.01em] text-zinc-950 sm:text-[38px]">The teachings of Śrīla Gurudeva, as one book.</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">Lectures, transcriptions, books, his diary and every subject he spoke on — one contents, one search, and it works offline once installed.</p>
            {shown.length > 0 && <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">{shown.map(([l, v]) => <div key={l}><dt className="sr-only">{l}</dt><dd><span className="text-[20px] font-semibold tabular-nums text-zinc-950">{v.toLocaleString()}</span> <span className="text-[13px] text-zinc-500">{l}</span></dd></div>)}</dl>}
            <form action="/webfolio/search" className="mt-6 flex h-12 max-w-[620px] items-center gap-3 rounded-xl border border-zinc-300 bg-white pl-4 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition focus-within:border-[#853500]">
              <Search size={18} className="shrink-0 text-zinc-400" /><input name="q" placeholder="Search every word — “krsna” finds “Kṛṣṇa”" className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-zinc-950 outline-none placeholder:text-zinc-400" />
              <kbd className="hidden rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500 sm:block">Ctrl K</kbd>
              <button className="h-9 rounded-lg bg-[#853500] px-4 text-[13.5px] font-medium text-white transition hover:bg-[#6e2c00]">Search</button>
            </form>
            <div className="mt-5 max-w-[620px]"><ContinueReading /></div>
          </div>
          {/* the book's cover */}
          <div className="relative mx-auto hidden w-[230px] md:block" aria-hidden>
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[4px_14px_14px_4px] bg-[#e7dccb]" />
            <div className="relative overflow-hidden rounded-[4px_14px_14px_4px] bg-[#7a3200] shadow-[0_24px_50px_-20px_rgba(70,30,0,.6)]">
              <span className="absolute inset-y-0 left-0 w-3 bg-black/20" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/gurudeva-library-sm.webp" alt="" className="aspect-[3/4] w-full object-cover opacity-90 mix-blend-luminosity" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4a1d00] via-[#4a1d00]/85 to-transparent px-5 pb-5 pt-14 text-white">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/70">Śrī Śrīmad</p>
                <p className="font-serif text-[19px] font-bold leading-tight">Gour Govinda Swāmī</p>
                <p className="mt-1.5 text-[11.5px] text-white/75">WebFolio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-5 pt-10 sm:px-10">
        <h2 className="flex items-baseline justify-between border-b border-zinc-900 pb-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-900">Contents<span className="text-[12px] font-normal normal-case tracking-normal text-zinc-500">{n.length} sections</span></h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {n.map((s, i) => { const c = s.groups.reduce((a, g) => a + (g.count || 0), 0); return (
            <li key={s.key} className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-[0_10px_30px_-16px_rgba(0,0,0,.25)]">
              <div className="flex items-start justify-between gap-3"><SecIcon s={s} size={17} /><span className="text-[12px] tabular-nums text-zinc-400">{String(i + 1).padStart(2, "0")}</span></div>
              <Link href={`/webfolio/${s.key}`} className="mt-3 text-[17px] font-semibold text-zinc-950 after:absolute after:inset-0 group-hover:text-[#853500]">{s.title}</Link>
              <p className="mt-1 text-[13px] leading-snug text-zinc-500">{s.desc}</p>
              {s.groups.length > 0 && <p className="relative z-10 mt-3 flex flex-wrap gap-1.5">{s.groups.slice(0, 5).map((g) => <Link key={g.key} href={`/webfolio/${s.key}/${g.key}`} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[12px] text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-950">{g.title.replace(/^His Diary, /, "Diary ")}</Link>)}{s.groups.length > 5 && <span className="px-1 py-0.5 text-[12px] text-zinc-500">+{s.groups.length - 5}</span>}</p>}
              <p className="mt-auto pt-4 text-[12px] tabular-nums text-zinc-500">{s.groups.length ? `${s.groups.length} ${s.groups.length === 1 ? "part" : "parts"}` : "Being prepared"}{c ? ` · ${c.toLocaleString()} entries` : ""}</p>
            </li>); })}
        </ol>

        <div className="mt-12 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <Link href="/webfolio/download" className="group flex flex-col rounded-2xl border border-zinc-200 bg-[#faf6f0] p-5 transition hover:border-zinc-300">
            <MonitorDown size={20} className="text-[#853500]" />
            <p className="mt-3 text-[15px] font-semibold text-zinc-950">Install the WebFolio</p>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">On Windows, Mac or your phone. Every text stays on your device; save lectures to listen without internet.</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-medium text-zinc-900">Download <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
          </Link>
          <ul className="grid divide-y divide-zinc-200 rounded-2xl border border-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {([[Keyboard, "Ctrl K or /", "Search from anywhere; press ? for every shortcut"], [Moon, "Light, sepia or dark", "Fonts, size and width under the Aa button"], [WifiOff, "Works offline", "Once installed, every page opens without internet"]] as const).map(([I, t, d]) => <li key={t} className="p-5"><I size={17} className="text-zinc-500" /><p className="mt-2.5 text-[13.5px] font-medium text-zinc-900">{t}</p><p className="mt-0.5 text-[12.5px] leading-snug text-zinc-500">{d}</p></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
