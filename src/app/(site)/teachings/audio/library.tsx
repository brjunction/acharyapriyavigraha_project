"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, List, CalendarRange } from "lucide-react";
import { LECTURES } from "@/lib/data";
import { LectureRow } from "@/components/lecture";
import { norm } from "@/components/search";

type K = "year" | "scripture" | "type" | "place";
const KEYS: { k: K; title: string }[] = [{ k: "year", title: "Year" }, { k: "scripture", title: "Scripture" }, { k: "type", title: "Type" }, { k: "place", title: "Place" }];
const scr = (s?: string) => (s ? ({ SB: "Śrīmad-Bhāgavatam", BG: "Bhagavad-gītā", CC: "Caitanya-caritāmṛta" } as Record<string, string>)[s.split(" ")[0]] ?? "Other" : "None");
const val = (l: (typeof LECTURES)[0], k: K) => (k === "year" ? l.date.slice(0, 4) : k === "scripture" ? scr(l.scripture) : k === "type" ? l.type : l.place);

export function AudioLibrary() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<K, Set<string>>>({ year: new Set(), scripture: new Set(), type: new Set(), place: new Set() });
  const [text, setText] = useState(false);
  const [view, setView] = useState<"list" | "year">("list");
  const [sheet, setSheet] = useState(false);

  const facets = useMemo(() => Object.fromEntries(KEYS.map(({ k }) => {
    const m = new Map<string, number>(); LECTURES.forEach((l) => m.set(val(l, k), (m.get(val(l, k)) ?? 0) + 1));
    const arr = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return [k, k === "year" ? arr.reverse() : arr];
  })) as Record<K, [string, number][]>, []);

  const list = LECTURES.filter((l) => (!q || norm(`${l.title} ${l.place} ${l.scripture ?? ""} ${l.topics.join(" ")} ${l.date}`).includes(norm(q)))
    && KEYS.every(({ k }) => !f[k].size || f[k].has(val(l, k))) && (!text || l.transcribed));
  const toggle = (k: K, v: string) => setF((p) => { const n = new Set(p[k]); if (n.has(v)) n.delete(v); else n.add(v); return { ...p, [k]: n }; });
  const chips = KEYS.flatMap(({ k }) => [...f[k]].map((v) => ({ k, v })));
  const clear = () => { setF({ year: new Set(), scripture: new Set(), type: new Set(), place: new Set() }); setText(false); };
  const byYear = list.reduce<Record<string, typeof list>>((a, l) => { (a[l.date.slice(0, 4)] ??= []).push(l); return a; }, {});

  const Filters = (
    <div className="space-y-6">
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-[14px]">
        With transcription
        <span className="relative inline-flex"><input type="checkbox" checked={text} onChange={(e) => setText(e.target.checked)} className="peer sr-only" />
          <span className="h-5 w-9 rounded-full bg-line-strong transition peer-checked:bg-saffron" /><span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" /></span>
      </label>
      {KEYS.map(({ k, title }) => (
        <div key={k}>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">{title}</p>
          <div className="flex flex-wrap gap-1.5">
            {facets[k].map(([v, n]) => (
              <button key={v} onClick={() => toggle(k, v)} aria-pressed={f[k].has(v)}
                className={`rounded-full border px-3 py-1 text-[13px] transition ${f[k].has(v) ? "border-saffron bg-saffron text-white" : "border-line bg-surface text-ink-2 hover:border-saffron/50"}`}>
                {v} <span className="tabular opacity-60">{n}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="hidden lg:block"><div className="sticky top-24">{Filters}</div></aside>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-4 focus-within:border-saffron">
            <Search size={18} className="text-saffron" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title, place, verse, topic or date" className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
            {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={16} className="text-ink-3" /></button>}
          </div>
          <button onClick={() => setSheet(true)} className="btn btn-ghost !h-12 lg:hidden"><SlidersHorizontal size={16} />Filters</button>
          <div className="flex rounded-xl border border-line bg-surface p-1">
            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] ${view === "list" ? "bg-saffron-soft font-medium text-saffron" : "text-ink-3"}`}><List size={15} />List</button>
            <button onClick={() => setView("year")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] ${view === "year" ? "bg-saffron-soft font-medium text-saffron" : "text-ink-3"}`}><CalendarRange size={15} />By year</button>
          </div>
        </div>
        <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 text-[13px]">
          <span className="text-ink-3">{list.length} lectures</span>
          {chips.map(({ k, v }) => <button key={k + v} onClick={() => toggle(k, v)} className="flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-saffron">{v}<X size={12} /></button>)}
          {(chips.length > 0 || text) && <button onClick={clear} className="text-ink-3 underline-offset-2 hover:underline">Clear all</button>}
        </div>
        <div className="mt-2">
          {view === "list" ? <div className="card px-2">{list.map((l) => <LectureRow key={l.slug} l={l} />)}</div> :
            Object.keys(byYear).sort().reverse().map((y) => (
              <section key={y} className="mb-8">
                <div className="sticky top-[72px] z-10 flex items-baseline gap-3 bg-page/95 py-3 backdrop-blur"><h2 className="text-[26px] text-saffron">{y}</h2><span className="text-[13px] text-ink-3">{byYear[y].length} lectures</span></div>
                <div className="card px-2">{byYear[y].map((l) => <LectureRow key={l.slug} l={l} />)}</div>
              </section>
            ))}
          {!list.length && <p className="card p-12 text-center text-ink-2">No lectures match these filters. Remove a filter to see more.</p>}
        </div>
      </div>
      {sheet && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/40 lg:hidden" onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} className="rise max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-page p-6">
            <div className="mb-5 flex items-center justify-between"><p className="font-serif text-xl font-bold">Filters</p><button onClick={() => setSheet(false)} className="btn btn-primary !h-9">Show {list.length}</button></div>
            {Filters}
          </div>
        </div>
      )}
    </div>
  );
}
