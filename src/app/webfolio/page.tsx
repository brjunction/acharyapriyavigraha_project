import Link from "next/link";
import { nav } from "@/lib/webfolio/data";
import { SecIcon } from "@/components/webfolio/frame";
import { ContinueReading } from "@/components/webfolio/continue";
import { ArrowRight, Search, MonitorDown, WifiOff, Keyboard, Moon } from "lucide-react";

export const revalidate = 600;
export default async function Home() {
  const n = await nav(); const total = (k: string) => n.find((s) => s.key === k)?.groups.reduce((a, g) => a + (g.count || 0), 0) || 0;
  const stats: [string, number][] = [["Lectures", total("lectures")], ["Transcriptions", total("transcriptions")], ["Books", n.find((s) => s.key === "books")?.groups.length || 0], ["Compilation entries", total("compilations")]];
  return (
    <div className="px-5 pb-16 pt-10 sm:px-10 lg:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-[12px] font-medium text-zinc-600"><span className="size-1.5 rounded-full bg-[#34a853]" />Read, search and keep — even offline</span>
          <h1 className="mx-auto mt-5 max-w-[760px] text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-zinc-950 sm:text-[52px]">The teachings of Śrīla Gurudeva, as one book.</h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15.5px] leading-relaxed text-zinc-600 sm:text-[17px]">Every lecture, transcription, book, compilation and page of His Diary — one contents, one search.</p>
          <form action="/webfolio/search" className="mx-auto mt-8 flex h-14 max-w-[640px] items-center gap-3 rounded-full border border-zinc-200 bg-white pl-5 pr-2 shadow-[0_1px_6px_rgba(32,33,36,.14)] transition focus-within:shadow-[0_2px_12px_rgba(32,33,36,.24)]">
            <Search size={19} className="shrink-0 text-zinc-400" /><input name="q" placeholder="Search every word — try “Gopāl Jiu”" className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-zinc-950 outline-none placeholder:text-zinc-400" />
            <button className="h-10 rounded-full bg-[#1a73e8] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1765cc]">Search</button>
          </form>
          <dl className="mx-auto mt-10 grid max-w-[760px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4">{stats.map(([l, v]) => <div key={l} className="bg-white px-4 py-4"><dd className="text-[24px] font-semibold tabular-nums tracking-tight text-zinc-950">{v.toLocaleString()}</dd><dt className="text-[12.5px] text-zinc-500">{l}</dt></div>)}</dl>
        </section>

        <ContinueReading />

        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-[20px] font-semibold tracking-tight text-zinc-950">Contents</h2><p className="text-[13px] text-zinc-500">{n.length} sections</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {n.map((s) => { const c = s.groups.reduce((a, g) => a + (g.count || 0), 0); return (
              <Link key={s.key} href={`/webfolio/${s.key}`} className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_-18px_rgba(0,0,0,.35)]">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100" style={{ background: s.color }} />
                <div className="flex items-start justify-between"><SecIcon s={s} size={18} /><ArrowRight size={17} className="text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-900" /></div>
                <h3 className="mt-4 text-[16px] font-semibold text-zinc-950">{s.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">{s.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{s.groups.slice(0, 4).map((g) => <span key={g.key} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11.5px] text-zinc-600">{g.title.replace(/^His Diary, /, "")}</span>)}{s.groups.length > 4 && <span className="px-1 text-[11.5px] text-zinc-400">+{s.groups.length - 4}</span>}</div>
                <p className="mt-4 border-t border-zinc-100 pt-3 text-[12px] text-zinc-500">{s.groups.length} parts{c ? ` · ${c.toLocaleString()} entries` : ""}</p>
              </Link>); })}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <Link href="/webfolio/download" className="group flex flex-col justify-between rounded-2xl bg-zinc-950 p-6 text-white transition hover:bg-zinc-900 [.folio[data-theme=dark]_&]:bg-[#1f2a44]">
            <div><MonitorDown size={22} className="text-[#8ab4f8]" /><h3 className="mt-4 text-[19px] font-semibold">Install the WebFolio</h3><p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-white/70">On Windows, Mac or your phone. Keep every text on your device and save lectures to listen without internet.</p></div>
            <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-zinc-950">Download <ArrowRight size={14} /></span>
          </Link>
          <div className="grid gap-3">
            {[[Keyboard, "Ctrl K or F2", "Search from anywhere"], [Moon, "Light, sepia or dark", "With fonts, size and width — the Aa button"], [WifiOff, "Works offline", "Once installed, every page opens without internet"]].map(([I, t, d]: any) => <div key={t} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700"><I size={18} /></span><div><p className="text-[14px] font-semibold text-zinc-950">{t}</p><p className="text-[12.5px] text-zinc-500">{d}</p></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
