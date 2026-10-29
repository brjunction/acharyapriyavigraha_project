"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X, ChevronDown, Play } from "lucide-react";

export type Item = { title: string; slug: string; data: Record<string, any> };
const yid = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u || "")?.[1] || "";
const vals = (v: any): string[] => (Array.isArray(v) ? v : v ? [String(v)] : []);

export function CollectionBrowser({ kind, base, items, facets, dateKey, lectureTitles }: { kind: string; base: string; items: Item[]; facets: { key: string; label: string }[]; dateKey?: string; lectureTitles: Record<string, string> }) {
  const [q, setQ] = useState(""); const [f, setF] = useState<Record<string, string>>({}); const [year, setYear] = useState(""); const [play, setPlay] = useState("");
  const years = useMemo(() => dateKey ? Array.from(new Set(items.map((i) => String(i.data?.[dateKey] || "").slice(0, 4)).filter(Boolean))).sort().reverse() : [], [items, dateKey]);
  const list = items.filter((i) => (!q || (i.title + " " + JSON.stringify(i.data)).toLowerCase().includes(q.toLowerCase())) && facets.every((x) => !f[x.key] || vals(i.data?.[x.key]).includes(f[x.key])) && (!year || String(i.data?.[dateKey!] || "").startsWith(year)));
  const optsFor = (k: string) => { const m = new Map<string, number>(); items.forEach((i) => vals(i.data?.[k]).forEach((v) => m.set(v, (m.get(v) || 0) + 1))); return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])); };
  const shownFacets = facets.filter((x) => optsFor(x.key).length > 0);
  const src = (i: Item) => [i.data?.source, i.data?.verse].filter(Boolean).join(" · ");
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="rounded-3xl border border-line bg-[#fdfaf4] p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 focus-within:border-saffron"><Search size={18} className="text-saffron" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none" />{q && <button onClick={() => setQ("")} aria-label="Clear"><X size={16} className="text-ink-3" /></button>}</div>
        {(shownFacets.length > 0 || years.length > 0) && <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {years.length > 0 && <Sel label="Year" all="All years" value={year} set={setYear} options={years.map((y) => [y, items.filter((i) => String(i.data?.[dateKey!] || "").startsWith(y)).length])} />}
          {shownFacets.map((x) => <Sel key={x.key} label={x.label} all={`All`} value={f[x.key] || ""} set={(v) => setF((p) => ({ ...p, [x.key]: v }))} options={optsFor(x.key)} />)}
        </div>}
      </div>
      <p className="mb-3 mt-5 text-[13px] font-medium text-ink-2">{list.length.toLocaleString()} {list.length === 1 ? "entry" : "entries"}</p>
      {kind === "videos" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((i) => { const id = yid(i.data?.video); return (
          <article key={i.slug} className="card overflow-hidden">
            <div className="relative aspect-video bg-black">{play === i.slug && id ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={i.title} allow="autoplay; encrypted-media" allowFullScreen className="h-full w-full" />
              : <button onClick={() => setPlay(i.slug)} className="group h-full w-full">{id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />}<span className="absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron/90 text-white transition group-hover:scale-110"><Play size={22} fill="currentColor" className="ml-1" /></span></span></button>}</div>
            <Link href={`${base}#${i.slug}`} id={i.slug} className="block p-4"><p className="line-clamp-2 font-semibold leading-snug hover:text-saffron">{i.title}</p><p className="mt-1 text-[12.5px] text-ink-3">{[i.data?.category, i.data?.date && new Date(i.data.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</p></Link>
          </article>); })}</div>
      ) : kind === "verses" ? (
        <div className="grid gap-4 lg:grid-cols-2">{list.map((i) => (
          <Link key={i.slug} href={`${base}/${i.slug}`} className="card block p-6 transition hover:-translate-y-0.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">{i.data?.reference || i.title}</p>
            {i.data?.devanagari && <p className="mt-3 whitespace-pre-line text-center text-[18px] leading-[1.8] text-[#7a3a06]">{i.data.devanagari}</p>}
            {i.data?.transliteration && <p className="mt-2 whitespace-pre-line text-center text-[15px] italic leading-[1.8] text-ink-2">{i.data.transliteration}</p>}
            {i.data?.translation && <p className="mt-3 border-t border-line pt-3 text-[15px] leading-relaxed text-ink">{i.data.translation}</p>}
          </Link>))}</div>
      ) : kind === "letters" ? (
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">{list.map((i) => <Link key={i.slug} href={`${base}/${i.slug}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-band/50"><span className="font-semibold">{i.title}</span><span className="text-[13px] text-ink-3">{[i.data?.from && `From ${i.data.from}`, i.data?.to && `to ${i.data.to}`, i.data?.date && new Date(i.data.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</span></Link>)}</div>
      ) : (
        <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4">{list.map((i) => (
          <Link key={i.slug} id={i.slug} href={`${base}/${i.slug}`} className="card block break-inside-avoid p-6 transition hover:-translate-y-0.5">
            {kind !== "quotes" && kind !== "nectar-drops" && <p className="mb-2 text-[16px] font-bold leading-snug">{i.title}</p>}
            <p className={`whitespace-pre-line leading-[1.7] text-ink ${kind === "quotes" || kind === "nectar-drops" ? "text-[17.5px] font-medium" : "line-clamp-6 text-[15px] text-ink-2"}`}>{kind === "quotes" ? `“${i.data?.text || i.title}”` : i.data?.text || ""}</p>
            {(src(i) || i.data?.lecture) && <p className="mt-3 text-[12.5px] font-medium text-saffron">{src(i) || vals(i.data?.lecture).map((x) => lectureTitles[x]).filter(Boolean).join(", ")}</p>}
            {vals(i.data?.topics).length > 0 && <p className="mt-2 flex flex-wrap gap-1">{vals(i.data.topics).map((t) => <span key={t} className="rounded-full bg-band px-2 py-0.5 text-[11.5px] text-ink-2">{t}</span>)}</p>}
          </Link>))}</div>
      )}
      {!list.length && <p className="card p-12 text-center text-ink-2">Nothing matches. Remove a filter to see more.</p>}
    </div>
  );
}

function Sel({ label, all, value, set, options }: { label: string; all: string; value: string; set: (v: string) => void; options: [string, number][] }) {
  return <label className="relative block"><span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</span>
    <select value={value} onChange={(e) => set(e.target.value)} className={`h-11 w-full appearance-none rounded-xl border bg-surface pl-3.5 pr-9 text-[14px] outline-none focus:border-saffron ${value ? "border-saffron/60 font-medium text-saffron" : "border-line text-ink-2"}`}><option value="">{all}</option>{options.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}</select>
    <ChevronDown size={16} className="pointer-events-none absolute bottom-3.5 right-3 text-ink-3" /></label>;
}
