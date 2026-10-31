"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X, BookOpen, ArrowRight, CalendarHeart, Loader2 } from "lucide-react";
import type { Entry } from "./diary-reader";

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (e: { date: string | null; date_note: string | null }) => (e.date ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(e.date.split("-").map(Number)) : e.date_note || "Undated");

/** His Diary: volumes by year, months inside each, “on this day”, continue reading and search. */
export function DiaryHome({ entries }: { entries: Entry[] }) {
  const years = useMemo(() => { const m: Record<string, Entry[]> = {}; entries.forEach((e) => (m[e.date?.slice(0, 4) || "Undated"] ||= []).push(e)); return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])); }, [entries]);
  const [open, setOpen] = useState<string | null>(null); const [last, setLast] = useState<{ href: string; title: string } | null>(null);
  const [q, setQ] = useState(""); const [res, setRes] = useState<{ title: string; href: string; snippet: string }[] | null>(null); const [busy, setBusy] = useState(false);
  const [today, setToday] = useState<Entry[]>([]);
  useEffect(() => { try { setLast(JSON.parse(localStorage.getItem("tj_last_diary") || "null")); } catch {} const d = new Date(); const md = `-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; setToday(entries.filter((e) => e.date?.endsWith(md))); setOpen((o) => o || years[years.length - 1]?.[0] || null); }, [entries, years]);
  useEffect(() => { if (q.trim().length < 2) { setRes(null); return; } setBusy(true); const h = setTimeout(() => fetch(`/api/diary?reader=1&q=${encodeURIComponent(q.trim())}`).then((r) => r.json()).then(setRes).catch(() => setRes([])).finally(() => setBusy(false)), 300); return () => clearTimeout(h); }, [q]);
  const sel = years.find(([y]) => y === open);
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-[#efe4cf] bg-[#fbf7ef]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <nav className="text-[12px] text-ink-3"><Link href="/gurudeva" className="hover:text-ink">Śrīla Gurudeva</Link> <span className="mx-1">/</span> His Diary</nav>
            <p className="mb-3 mt-6 text-[11.5px] font-medium uppercase tracking-[0.3em] text-saffron">His Diary</p>
            <h1 className="text-[30px] leading-[1.15] text-ink sm:text-[40px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Prayers to Śrī Gopāl Jiu</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">Throughout his life Śrīla Gurudeva wrote to his beloved Deity, Śrī Gopāl Jiu, day after day. Read them in order, by year and month, with the original beside the translation.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {last ? <Link href={last.href} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90"><BookOpen size={15} />Continue: {last.title}</Link> : entries[0] && <Link href={`/gurudeva/diaries/${entries[0].slug}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90"><BookOpen size={15} />Begin reading</Link>}
              {entries.length > 0 && <Link href={`/gurudeva/diaries/${entries[entries.length - 1].slug}`} className="inline-flex h-10 items-center rounded-md border border-line-strong bg-white px-4 text-[13.5px] text-ink hover:bg-band">The last page</Link>}
            </div>
            <p className="mt-4 text-[12.5px] text-ink-3">{entries.length.toLocaleString()} pages · {years.length} {years.length === 1 ? "year" : "years"}{years.length ? ` · ${years[0][0]}–${years[years.length - 1][0]}` : ""}</p>
          </div>
          <div className="relative mx-auto w-full max-w-[380px]">
            <div className="rotate-[-2deg] rounded-[6px_14px_14px_6px] bg-gradient-to-br from-[#5b2a12] to-[#2d1206] p-7 text-[#f1dfbd] shadow-[0_30px_60px_-25px_rgba(60,20,0,0.6)]">
              <div className="rounded-[4px] border border-[#f1dfbd]/30 px-6 py-10 text-center"><p className="text-[11px] uppercase tracking-[0.3em] text-[#e8c766]">Śrī Gopāl Jiu</p><p className="mt-4 text-[26px] leading-tight" style={{ fontFamily: "var(--font-reading-serif)" }}>Dear Gopāl,</p><p className="mt-3 text-[13px] italic text-[#f1dfbd]/70">— from his diary</p></div>
            </div>
            <span className="absolute inset-y-6 left-1 w-2 rotate-[-2deg] rounded-l bg-black/25" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        <div className="sticky top-[52px] z-20 -mx-4 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
          <label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search every page of the diary" className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-9 text-[14px] outline-none focus:border-ink/40" />{busy ? <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-3" /> : q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"><X size={15} /></button>}</label>
        </div>
        {res ? <section className="mt-6"><p className="mb-2 text-[12.5px] text-ink-3">{res.length ? `${res.length} pages` : "Nothing found."}</p><div className="divide-y divide-line border-y border-line">{res.map((r) => <Link key={r.href} href={r.href} className="block py-4 hover:bg-band/40"><p className="text-[14px] font-medium text-ink">{r.title}</p><p className="mt-1 text-[13.5px] leading-relaxed text-ink-2" style={{ fontFamily: "var(--font-reading-serif)" }}>{r.snippet}</p></Link>)}</div></section> : <>
          {today.length > 0 && <section className="mt-8 rounded-xl border border-[#eadcc0] bg-[#fbf7ef] p-5"><p className="flex items-center gap-2 text-[13px] font-semibold text-ink"><CalendarHeart size={16} className="text-saffron" />On this day</p><div className="mt-3 flex flex-wrap gap-2">{today.map((e) => <Link key={e.slug} href={`/gurudeva/diaries/${e.slug}`} className="rounded-md border border-[#eadcc0] bg-white px-3 py-1.5 text-[13px] text-ink hover:border-saffron">{when(e)}</Link>)}</div></section>}
          <section className="mt-10">
            <h2 className="mb-4 text-[15px] font-semibold text-ink">Volumes, by year</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">{years.map(([y, xs]) => (
              <button key={y} onClick={() => setOpen(y)} className="group text-left">
                <span className={`relative flex aspect-[3/4] flex-col items-center justify-center rounded-[2px_6px_6px_2px] bg-gradient-to-br text-center shadow-[0_10px_22px_-14px_rgba(0,0,0,0.5)] transition group-hover:-translate-y-0.5 ${open === y ? "from-[#7a3a10] to-[#3a1405] ring-2 ring-ink ring-offset-2" : "from-[#6b3313] to-[#2d1206]"}`}>
                  <span className="text-[22px] text-[#f1dfbd]" style={{ fontFamily: "var(--font-reading-serif)" }}>{y}</span><span className="mt-1 text-[11px] text-[#f1dfbd]/70">{xs.length} pages</span>
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-black/25" />
                </span>
              </button>))}</div>
          </section>
          {sel && <section className="mt-10">
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2"><h2 className="text-[18px] text-ink" style={{ fontFamily: "var(--font-reading-serif)" }}>{sel[0]}</h2><span className="text-[12.5px] text-ink-3">{sel[1].length} pages</span></div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from(new Set(sel[1].map((e) => e.date?.slice(5, 7) || "00"))).map((m) => { const xs = sel[1].filter((e) => (e.date?.slice(5, 7) || "00") === m); return (
              <div key={m}><p className="mb-2 flex items-baseline justify-between text-[13px] font-semibold text-ink">{m === "00" ? "Undated" : MON[Number(m) - 1]}<span className="text-[11.5px] font-normal text-ink-3">{xs.length}</span></p>
                <div className="flex flex-wrap gap-1.5">{xs.map((e) => <Link key={e.slug} href={`/gurudeva/diaries/${e.slug}`} title={when(e)} className="flex h-8 min-w-8 items-center justify-center rounded-md border border-line px-2 text-[12.5px] tabular-nums text-ink-2 hover:border-ink hover:text-ink">{e.date ? Number(e.date.slice(8, 10)) : "•"}</Link>)}</div></div>); })}</div>
            <Link href={`/gurudeva/diaries/${sel[1][0].slug}`} className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-ink">Read {sel[0]} from the beginning<ArrowRight size={14} /></Link>
          </section>}
          {!entries.length && <p className="py-16 text-center text-[13.5px] text-ink-3">The diary pages are being added.</p>}
        </>}
      </div>
    </div>
  );
}
