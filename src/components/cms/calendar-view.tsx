"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type E = { date: string; title: string; kind: string; fasting: string | null; paran: string | null; description: string | null; location: string; link: string | null };
const DOT: Record<string, string> = { ekadashi: "bg-emerald-600", festival: "bg-saffron", appearance: "bg-[#2a4f9a]", disappearance: "bg-zinc-500", fast: "bg-red-600", other: "bg-zinc-400" };
const NAME: Record<string, string> = { ekadashi: "Ekādaśī", festival: "Festival", appearance: "Appearance", disappearance: "Disappearance", fast: "Fast", other: "" };

export function CalendarView({ events }: { events: E[] }) {
  const places = useMemo(() => Array.from(new Set(events.map((e) => e.location))), [events]);
  const [place, setPlace] = useState(places.includes("Bhubaneswar") ? "Bhubaneswar" : places[0] || ""); const today = new Date();
  const [m, setM] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const ev = events.filter((e) => !place || e.location === place);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const upcoming = ev.filter((e) => e.date >= iso(today)).slice(0, 8);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-full border border-line p-2 hover:bg-band" aria-label="Previous month"><ChevronLeft size={18} /></button>
          <h2 className="w-52 text-center text-[22px] font-bold">{m.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
          <button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-full border border-line p-2 hover:bg-band" aria-label="Next month"><ChevronRight size={18} /></button>
          {places.length > 1 && <label className="ml-auto flex items-center gap-2 text-[14px] text-ink-2"><MapPin size={16} className="text-saffron" /><select value={place} onChange={(e) => setPlace(e.target.value)} className="h-10 rounded-xl border border-line bg-surface px-3">{places.map((p) => <option key={p}>{p}</option>)}</select></label>}
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-line bg-surface text-[13px]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="border-b border-line bg-band/60 py-2 text-center font-semibold text-ink-3">{d}</div>)}
          {days.map((d) => { const k = iso(d); const es = ev.filter((e) => e.date === k); const out = d.getMonth() !== m.getMonth(); return (
            <div key={k} className={`min-h-[96px] border-b border-r border-line p-1.5 [&:nth-child(7n)]:border-r-0 ${out ? "bg-band/30 text-ink-3" : ""}`}>
              <span className={`inline-flex size-7 items-center justify-center rounded-full text-[13px] ${k === iso(today) ? "bg-saffron font-bold text-white" : ""}`}>{d.getDate()}</span>
              {es.map((e, i) => <button key={i} onClick={() => setOpen(open === k + i ? null : k + i)} className="mt-0.5 flex w-full items-start gap-1 rounded px-1 py-0.5 text-left text-[12px] leading-tight hover:bg-band"><span className={`mt-1 size-1.5 shrink-0 rounded-full ${DOT[e.kind] || DOT.other}`} /><span className="line-clamp-2 font-medium text-ink">{e.title}</span></button>)}
            </div>); })}
        </div>
        {open && (() => { const k = open.slice(0, 10); const e = ev.filter((x) => x.date === k)[Number(open.slice(10))]; return e ? <div className="card mt-4 p-5"><p className="text-[13px] text-ink-3">{new Date(e.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><p className="mt-1 text-[19px] font-bold">{e.title}</p>{e.fasting && <p className="mt-2 text-[15px]"><b>Fasting:</b> {e.fasting}</p>}{e.paran && <p className="text-[15px]"><b>Break fast:</b> {e.paran}</p>}{e.description && <p className="mt-2 whitespace-pre-line text-[15px] text-ink-2">{e.description}</p>}{e.link && <a href={e.link} className="mt-2 inline-block text-saffron underline">More</a>}</div> : null; })()}
      </div>
      <aside>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-saffron">Coming days</h3>
        <ul className="space-y-2">{upcoming.map((e, i) => { const d = new Date(e.date); return <li key={i} className="card flex gap-3 p-3.5"><span className="w-12 shrink-0 text-center"><b className="block text-[22px] leading-none text-saffron">{d.getDate()}</b><span className="text-[11.5px] uppercase text-ink-3">{d.toLocaleDateString("en-GB", { month: "short" })}</span></span><span className="min-w-0"><b className="block text-[14.5px] leading-snug">{e.title}</b><span className="text-[12.5px] text-ink-3">{[NAME[e.kind], e.fasting, e.paran && `Break fast ${e.paran}`].filter(Boolean).join(" · ")}</span></span></li>; })}
          {!upcoming.length && <li className="text-[14px] text-ink-3">No upcoming days entered yet.</li>}</ul>
        <div className="mt-5 flex flex-wrap gap-3 text-[12.5px] text-ink-3">{Object.entries(NAME).filter(([, l]) => l).map(([k, l]) => <span key={k} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${DOT[k]}`} />{l}</span>)}</div>
      </aside>
    </div>
  );
}
