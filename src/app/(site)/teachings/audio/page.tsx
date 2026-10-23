"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { LECTURES, STATS } from "@/lib/data";
import { LectureRow } from "@/components/lecture";
import { PageHead } from "@/components/ui";

type F = { year: Set<string>; place: Set<string>; type: Set<string>; scripture: Set<string>; text: boolean };

export default function Audio() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>({ year: new Set(), place: new Set(), type: new Set(), scripture: new Set(), text: false });
  const [view, setView] = useState<"list" | "year">("list");
  const [show, setShow] = useState(false);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const scr = (s?: string) => (s ? s.split(" ")[0] : "Other");

  const facets = useMemo(() => {
    const c = (fn: (l: (typeof LECTURES)[0]) => string) => {
      const m = new Map<string, number>(); LECTURES.forEach((l) => m.set(fn(l), (m.get(fn(l)) ?? 0) + 1));
      return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    };
    return { year: c((l) => l.date.slice(0, 4)).reverse(), place: c((l) => l.place), type: c((l) => l.type), scripture: c((l) => scr(l.scripture)) };
  }, []);

  const list = LECTURES.filter((l) =>
    (!q || norm(`${l.title} ${l.place} ${l.scripture} ${l.topics.join(" ")}`).includes(norm(q))) &&
    (!f.year.size || f.year.has(l.date.slice(0, 4))) && (!f.place.size || f.place.has(l.place)) &&
    (!f.type.size || f.type.has(l.type)) && (!f.scripture.size || f.scripture.has(scr(l.scripture))) && (!f.text || l.transcribed));

  const toggle = (k: keyof Omit<F, "text">, v: string) => setF((p) => { const n = new Set(p[k]); n.has(v) ? n.delete(v) : n.add(v); return { ...p, [k]: n }; });
  const active = [...f.year, ...f.place, ...f.type, ...f.scripture].length + (f.text ? 1 : 0);

  const Facet = ({ k, title }: { k: keyof Omit<F, "text">; title: string }) => (
    <div className="border-b border-line py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {facets[k].map(([v, n]) => (
          <button key={v} onClick={() => toggle(k, v)}
            className={`rounded-full border px-2.5 py-1 text-[12.5px] transition ${f[k].has(v) ? "border-maroon bg-maroon text-paper" : "border-line bg-card text-ink-2 hover:border-gold"}`}>
            {v} <span className="opacity-60">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const byYear = list.reduce<Record<string, typeof list>>((a, l) => { (a[l.date.slice(0, 4)] ??= []).push(l); return a; }, {});

  return (
    <>
      <PageHead eyebrow="His Teachings · Audio" title="Audio lectures" intro={`${STATS.lectures.toLocaleString()} recorded lectures from 1985 to 1996. Combine any filters. Press play and keep browsing: the player follows you.`} />
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className={`${show ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-20">
            <div className="flex items-center justify-between"><p className="font-serif text-xl">Filters</p>
              {active > 0 && <button onClick={() => setF({ year: new Set(), place: new Set(), type: new Set(), scripture: new Set(), text: false })} className="text-xs text-saffron">Clear {active}</button>}</div>
            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-line bg-card px-3 py-2.5 text-sm">
              Has transcription <input type="checkbox" checked={f.text} onChange={(e) => setF({ ...f, text: e.target.checked })} className="accent-[var(--saffron)]" />
            </label>
            <Facet k="year" title="Year" /><Facet k="scripture" title="Scripture" /><Facet k="type" title="Type" /><Facet k="place" title="Place" />
          </div>
        </aside>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-card px-3 focus-within:border-gold">
              <Search size={17} className="text-ink-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title, place, verse, topic…" className="h-11 flex-1 bg-transparent text-sm outline-none" />
              {q && <button onClick={() => setQ("")}><X size={16} className="text-ink-3" /></button>}
            </div>
            <button onClick={() => setShow(!show)} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2.5 text-sm lg:hidden"><SlidersHorizontal size={16} />Filters</button>
            <div className="flex rounded-xl border border-line bg-card p-1 text-sm">
              {(["list", "year"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 capitalize ${view === v ? "bg-paper-2 font-medium" : "text-ink-3"}`}>{v === "year" ? "By year" : "List"}</button>)}
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-3">{list.length} lectures shown (prototype sample)</p>
          <div className="mt-2">
            {view === "list" ? list.map((l) => <LectureRow key={l.slug} l={l} />) :
              Object.keys(byYear).sort().reverse().map((y) => (
                <div key={y} className="mb-6"><p className="sticky top-16 z-10 bg-paper/90 py-2 font-serif text-3xl text-gold backdrop-blur">{y}</p>{byYear[y].map((l) => <LectureRow key={l.slug} l={l} />)}</div>
              ))}
            {!list.length && <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">No lectures match. Try removing a filter.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
