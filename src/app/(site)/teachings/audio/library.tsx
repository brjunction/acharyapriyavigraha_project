"use client";
import { useMemo, useState } from "react";
import { Search, X, List, CalendarRange, ChevronDown, ArrowDownUp } from "lucide-react";
import { LECTURES, type Lecture } from "@/lib/data";
import { LectureRow } from "@/components/lecture";
import { norm } from "@/components/search";

const BOOK: Record<string, string> = { SB: "Śrīmad-Bhāgavatam", BG: "Bhagavad-gītā", CC: "Caitanya-caritāmṛta" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const scr = (s?: string) => (s ? BOOK[s.split(" ")[0]] ?? "Other scriptures" : "No verse");
/** “SB 1.2.6” → “Canto 1”, “BG 18.66” → “Chapter 18”, “CC Madhya 15.104” → “Madhya-līlā”. */
const part = (s?: string) => { if (!s) return ""; const [b, a, c] = s.split(" "); if (b === "CC") return a ? `${a}-līlā` : ""; const n = (c ?? a ?? "").split(".")[0]; return b === "SB" && n ? `Canto ${n}` : b === "BG" && n ? `Chapter ${n}` : ""; };

type K = "year" | "month" | "place" | "scripture" | "part" | "type" | "topic" | "language" | "series";
const DEFS: { k: K; title: string; all: string; get: (l: Lecture) => string[] }[] = [
  { k: "year", title: "Year", all: "All years", get: (l) => [l.date.slice(0, 4)].filter(Boolean) },
  { k: "month", title: "Month", all: "All months", get: (l) => (l.date.length >= 7 ? [MONTHS[Number(l.date.slice(5, 7)) - 1]] : []) },
  { k: "place", title: "Place", all: "All places", get: (l) => [l.place].filter(Boolean) },
  { k: "scripture", title: "Scripture", all: "All scriptures", get: (l) => [scr(l.scripture)] },
  { k: "part", title: "Canto / chapter", all: "All cantos and chapters", get: (l) => [part(l.scripture)].filter(Boolean) },
  { k: "type", title: "Kind", all: "All kinds", get: (l) => [l.type].filter(Boolean) },
  { k: "topic", title: "Topic", all: "All topics", get: (l) => l.topics },
  { k: "language", title: "Language", all: "All languages", get: (l) => l.languages },
  { k: "series", title: "Series", all: "All series", get: (l) => (l.series ? [l.series] : []) },
];
const SORTS = [["new", "Newest first"], ["old", "Oldest first"], ["title", "Title A–Z"], ["long", "Longest first"]] as const;

function Drop({ title, all, value, options, onChange }: { title: string; all: string; value: string; options: [string, number][]; onChange: (v: string) => void }) {
  return (
    <label className="relative block">
      <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`h-11 w-full appearance-none rounded-xl border bg-surface pl-3.5 pr-9 text-[14px] outline-none transition focus:border-saffron ${value ? "border-saffron/60 font-medium text-saffron" : "border-line text-ink-2"}`}>
        <option value="">{all}</option>
        {options.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute bottom-3.5 right-3 text-ink-3" />
    </label>
  );
}

export function AudioLibrary({ lectures = LECTURES }: { lectures?: Lecture[] }) {
  const [q, setQ] = useState(""); const [f, setF] = useState<Partial<Record<K, string>>>({}); const [text, setText] = useState(false);
  const [view, setView] = useState<"list" | "year">("list"); const [sort, setSort] = useState<(typeof SORTS)[number][0]>("new"); const [more, setMore] = useState(false);
  const defs = DEFS.filter((d) => lectures.some((l) => d.get(l).length));
  const pass = (l: Lecture, skip?: K) => (!q || norm(`${l.title} ${l.place} ${l.scripture ?? ""} ${l.topics.join(" ")} ${l.date} ${l.series ?? ""}`).includes(norm(q)))
    && (!text || l.transcribed) && defs.every((d) => d.k === skip || !f[d.k] || d.get(l).includes(f[d.k]!));
  /** Each dropdown counts what is left after the other filters, so no choice leads to nothing. */
  const options = useMemo(() => Object.fromEntries(defs.map((d) => {
    const m = new Map<string, number>(); lectures.forEach((l) => { if (pass(l, d.k)) d.get(l).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1)); });
    let arr = [...m.entries()];
    arr = d.k === "month" ? arr.sort((a, b) => MONTHS.indexOf(a[0]) - MONTHS.indexOf(b[0])) : d.k === "part" ? arr.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })) : arr.sort((a, b) => a[0].localeCompare(b[0]));
    return [d.k, d.k === "year" ? arr.reverse() : arr];
  })) as Record<K, [string, number][]>, [lectures, f, q, text]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => {
    const l = lectures.filter((x) => pass(x));
    return l.sort((a, b) => sort === "new" ? b.date.localeCompare(a.date) : sort === "old" ? a.date.localeCompare(b.date) : sort === "title" ? a.title.localeCompare(b.title) : b.duration - a.duration);
  }, [lectures, f, q, text, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = Object.entries(f).filter(([, v]) => v) as [K, string][];
  const byYear = list.reduce<Record<string, Lecture[]>>((a, l) => { (a[l.date.slice(0, 4) || "Undated"] ??= []).push(l); return a; }, {});
  const main = defs.filter((d) => ["year", "place", "scripture", "topic"].includes(d.k)); const extra = defs.filter((d) => !main.includes(d));

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="rounded-3xl border border-line bg-[#fdfaf4] p-4 sm:p-6">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 focus-within:border-saffron">
          <Search size={18} className="text-saffron" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, place, verse, topic or date" className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
          {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={16} className="text-ink-3" /></button>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {main.map((d) => <Drop key={d.k} title={d.title} all={d.all} value={f[d.k] || ""} options={options[d.k]} onChange={(v) => setF((p) => ({ ...p, [d.k]: v }))} />)}
        </div>
        {more && <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{extra.map((d) => <Drop key={d.k} title={d.title} all={d.all} value={f[d.k] || ""} options={options[d.k]} onChange={(v) => setF((p) => ({ ...p, [d.k]: v }))} />)}</div>}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px]">
          {extra.length > 0 && <button onClick={() => setMore(!more)} className="font-medium text-saffron">{more ? "Fewer filters" : `More filters (${extra.map((d) => d.title.toLowerCase()).join(", ")})`}</button>}
          <label className="flex cursor-pointer items-center gap-2 text-ink-2"><input type="checkbox" checked={text} onChange={(e) => setText(e.target.checked)} className="h-4 w-4 accent-[var(--saffron)]" />With transcription</label>
          <span className="ml-auto flex items-center gap-2">
            <label className="relative flex items-center gap-1.5 text-ink-3"><ArrowDownUp size={14} /><select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 appearance-none rounded-lg border border-line bg-surface pl-2 pr-7 text-ink-2 outline-none">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-2" /></label>
            <span className="flex rounded-lg border border-line bg-surface p-0.5">
              <button onClick={() => setView("list")} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 ${view === "list" ? "bg-saffron-soft font-medium text-saffron" : "text-ink-3"}`}><List size={14} />List</button>
              <button onClick={() => setView("year")} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 ${view === "year" ? "bg-saffron-soft font-medium text-saffron" : "text-ink-3"}`}><CalendarRange size={14} />By year</button>
            </span>
          </span>
        </div>
      </div>
      <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2 text-[13px]">
        <span className="font-medium text-ink-2">{list.length.toLocaleString()} lectures</span>
        {active.map(([k, v]) => <button key={k} onClick={() => setF((p) => ({ ...p, [k]: "" }))} className="flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-saffron">{v}<X size={12} /></button>)}
        {(active.length > 0 || text || q) && <button onClick={() => { setF({}); setText(false); setQ(""); }} className="text-ink-3 underline-offset-2 hover:underline">Clear all</button>}
      </div>
      <div className="mt-2">
        {view === "list" ? <div className="card px-2">{list.slice(0, 400).map((l) => <LectureRow key={l.slug} l={l} />)}</div> :
          Object.keys(byYear).sort().reverse().map((y) => (
            <section key={y} className="mb-8">
              <div className="sticky top-[72px] z-10 flex items-baseline gap-3 bg-page/95 py-3 backdrop-blur"><h2 className="text-[26px] text-saffron">{y}</h2><span className="text-[13px] text-ink-3">{byYear[y].length} lectures</span></div>
              <div className="card px-2">{byYear[y].map((l) => <LectureRow key={l.slug} l={l} />)}</div>
            </section>
          ))}
        {list.length > 400 && view === "list" && <p className="mt-3 text-center text-[13px] text-ink-3">Showing the first 400. Choose a year or place to narrow the list.</p>}
        {!list.length && <p className="card p-12 text-center text-ink-2">No lectures match these filters. Remove a filter to see more.</p>}
      </div>
    </div>
  );
}
