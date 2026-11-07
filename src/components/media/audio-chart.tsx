"use client";
/* All Audios — Systematic Chart: every recording on one page, year by year, in small type, with the columns you choose. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Columns3, Printer, Search } from "lucide-react";

export type ChartRow = { slug: string; code: string | null; file: string | null; title: string; kind: string; type: string | null; date: string | null; dateNote: string | null; place: string | null; country: string | null; verse: string | null; language: string | null; series: string | null; seconds: number; transcribed: boolean };
const COLS = [["date", "Date"], ["code", "Code"], ["title", "Title"], ["file", "File name"], ["place", "Place"], ["verse", "Verse"], ["type", "Type"], ["language", "Language"], ["series", "Series"], ["length", "Length"], ["text", "Transcript"]] as const;
type Col = (typeof COLS)[number][0];
const DEF: Col[] = ["date", "code", "title", "place", "verse", "type", "length", "text"];
const SIZES: [string, number][] = [["XS", 10.5], ["S", 11.5], ["M", 12.5], ["L", 13.5]];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (d: string | null) => (d ? `${+d.slice(8, 10)} ${MON[+d.slice(5, 7) - 1]}` : "");
const len = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function AudioChart({ rows }: { rows: ChartRow[] }) {
  const [cols, setCols] = useState<Col[]>(DEF); const [sz, setSz] = useState(11.5); const [q, setQ] = useState(""); const [shut, setShut] = useState<Set<string>>(new Set()); const [pick, setPick] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("tj_chart") || "{}"); if (Array.isArray(s.cols)) setCols(s.cols); if (s.sz) setSz(s.sz); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("tj_chart", JSON.stringify({ cols, sz })); } catch {} }, [cols, sz]);
  const list = useMemo(() => { const w = fold(q).split(/\s+/).filter(Boolean); return w.length ? rows.filter((r) => { const t = fold([r.title, r.place, r.verse, r.type, r.code, r.file, r.date, r.series].filter(Boolean).join(" ")); return w.every((x) => t.includes(x)); }) : rows; }, [rows, q]);
  const years = useMemo(() => { const m = new Map<string, ChartRow[]>(); list.forEach((r) => { const y = r.date?.slice(0, 4) || "Undated"; m.set(y, [...(m.get(y) || []), r]); }); return [...m.entries()]; }, [list]);
  const on = (c: Col) => cols.includes(c); const cell = "px-2 py-[3px] align-top";
  const href = (r: ChartRow) => (r.code ? `/audios/${r.code}` : `/teachings/audio/${r.slug}`);
  return (
    <div className="mx-auto max-w-[1500px] px-3 pb-16 pt-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">All Audios — Systematic Chart</h1>
          <p className="mt-1 text-[13px] text-ink-3">{rows.length ? `${rows.length.toLocaleString()} recordings · ${years.length} ${years.length === 1 ? "year" : "years"} · everything at once` : "Every recording, year by year, on one page."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <label className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find in the chart" className="h-8 w-48 rounded-md border border-line bg-white pl-8 pr-2 text-[12.5px] outline-none focus:border-saffron" /></label>
          <div className="flex rounded-md border border-line bg-band/60 p-0.5" title="Text size">{SIZES.map(([l, v]) => <button key={l} onClick={() => setSz(v)} className={`rounded px-2 py-1 text-[11.5px] font-medium ${sz === v ? "bg-white text-ink shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>
          <div className="relative"><button onClick={() => setPick(!pick)} className="flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[12.5px] text-ink-2 hover:border-line-strong"><Columns3 size={14} />Columns</button>
            {pick && <div className="absolute right-0 top-10 z-30 w-52 rounded-lg border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,.3)]">{COLS.map(([k, l]) => <label key={k} className="flex items-center gap-2 rounded px-2 py-1 text-[12.5px] hover:bg-band"><input type="checkbox" checked={on(k)} onChange={() => setCols((c) => (c.includes(k) ? c.filter((x) => x !== k) : COLS.map(([x]) => x).filter((x) => c.includes(x) || x === k)))} />{l}</label>)}<button onClick={() => setCols(DEF)} className="mt-1 w-full rounded px-2 py-1 text-left text-[12px] text-ink-3 hover:bg-band">Reset</button></div>}
          </div>
          <button onClick={() => setShut(shut.size ? new Set() : new Set(years.map(([y]) => y)))} className="h-8 rounded-md border border-line bg-white px-2.5 text-[12.5px] text-ink-2 hover:border-line-strong">{shut.size ? "Open all years" : "Fold all years"}</button>
          <button onClick={() => window.print()} className="flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[12.5px] text-ink-2 hover:border-line-strong"><Printer size={14} />Print</button>
        </div>
      </header>
      {!rows.length ? <p className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-[14px] text-ink-3">The recordings will appear here, year by year, as soon as they are added to the archive.</p> : (
        <>
          <nav className="mb-4 flex flex-wrap gap-1 print:hidden">{years.map(([y, rs]) => <a key={y} href={`#y${y}`} className="rounded-full border border-line px-2.5 py-0.5 text-[11.5px] text-ink-2 hover:border-saffron hover:text-saffron">{y} <span className="text-ink-3">({rs.length})</span></a>)}</nav>
          <div className="overflow-x-auto rounded-xl border border-line" style={{ fontSize: sz }}>
            <table className="w-full border-collapse leading-snug">
              <thead className="sticky top-0 bg-band text-left text-ink-3"><tr><th className={`${cell} w-8 font-semibold`}>#</th>{COLS.filter(([k]) => on(k)).map(([k, l]) => <th key={k} className={`${cell} whitespace-nowrap font-semibold`}>{l}</th>)}</tr></thead>
              {years.map(([y, rs]) => (
                <tbody key={y} id={`y${y}`}>
                  <tr className="border-t border-line bg-[#fdf3e3]"><td colSpan={cols.length + 1} className="px-2 py-1.5"><button onClick={() => setShut((s) => { const n = new Set(s); if (n.has(y)) n.delete(y); else n.add(y); return n; })} className="flex items-center gap-1.5 font-semibold text-[#853500]">{shut.has(y) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}{y} <span className="font-normal text-ink-3">({rs.length} {rs.length === 1 ? "audio" : "audios"})</span></button></td></tr>
                  {!shut.has(y) && rs.map((r, i) => (
                    <tr key={r.slug} className="border-t border-line/70 hover:bg-band/50">
                      <td className={`${cell} tabular-nums text-ink-3`}>{i + 1}</td>
                      {on("date") && <td className={`${cell} whitespace-nowrap tabular-nums`}>{day(r.date) || r.dateNote || ""}</td>}
                      {on("code") && <td className={`${cell} whitespace-nowrap font-mono text-ink-2`}>{r.code || ""}</td>}
                      {on("title") && <td className={`${cell} min-w-[220px]`}><Link href={href(r)} className="text-ink hover:text-saffron hover:underline">{r.title}</Link></td>}
                      {on("file") && <td className={`${cell} break-all font-mono text-ink-2`}>{r.file ? `${r.file}.mp3` : ""}</td>}
                      {on("place") && <td className={`${cell} whitespace-nowrap`}>{[r.place, r.country].filter(Boolean).join(", ")}</td>}
                      {on("verse") && <td className={`${cell} whitespace-nowrap`}>{r.verse || ""}</td>}
                      {on("type") && <td className={`${cell} whitespace-nowrap`}>{r.type || ""}</td>}
                      {on("language") && <td className={`${cell} whitespace-nowrap`}>{r.language || ""}</td>}
                      {on("series") && <td className={cell}>{r.series || ""}</td>}
                      {on("length") && <td className={`${cell} whitespace-nowrap tabular-nums`}>{len(r.seconds)}</td>}
                      {on("text") && <td className={`${cell} whitespace-nowrap`}>{r.transcribed ? "✓" : ""}</td>}
                    </tr>))}
                </tbody>))}
            </table>
          </div>
        </>)}
    </div>
  );
}
