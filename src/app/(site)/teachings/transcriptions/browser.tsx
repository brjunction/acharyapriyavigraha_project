"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X, FileText, ArrowRight } from "lucide-react";
import { LECTURES, fmtDate } from "@/lib/data";
import { norm } from "@/components/search";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const kind = (l: { type: string; scripture?: string }) => {
  if (l.type === "Lecture") { const k = l.scripture?.split(" ")[0]; return k === "SB" ? "Śrīmad-Bhāgavatam lecture" : k === "BG" ? "Bhagavad-gītā lecture" : k === "CC" ? "Caitanya-caritāmṛta lecture" : "Discussion"; }
  return l.type === "Questions & Answers" ? "Questions & answers" : l.type;
};
const ALL = LECTURES.filter((l) => l.transcribed);

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, number][] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink outline-none focus:border-saffron">
        <option value="">All</option>
        {options.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
      </select>
    </label>
  );
}

export function TranscriptionBrowser() {
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [bk, setBk] = useState("");
  const [topic, setTopic] = useState("");
  const [place, setPlace] = useState("");
  const [lang, setLang] = useState("");
  useEffect(() => { const p = new URLSearchParams(window.location.search); setYear(p.get("year") ?? ""); setMonth(p.get("month") ?? ""); setBk(p.get("type") ?? ""); setTopic(p.get("topic") ?? ""); }, []);

  const base = ALL.filter((l) => (!q || norm(`${l.title} ${l.place} ${l.scripture ?? ""} ${l.topics.join(" ")} ${l.date}`).includes(norm(q))));
  const match = (l: (typeof ALL)[0], skip?: string) =>
    (skip === "year" || !year || l.date.startsWith(year)) && (skip === "month" || !month || l.date.slice(5, 7) === month) && (skip === "bk" || !bk || kind(l) === bk)
    && (skip === "topic" || !topic || l.topics.includes(topic)) && (skip === "place" || !place || l.place === place) && (skip === "lang" || !lang || l.languages.includes(lang));
  const list = base.filter((l) => match(l)).sort((a, b) => b.date.localeCompare(a.date));
  const count = (f: (l: (typeof ALL)[0]) => string[], skip: string) => {
    const m = new Map<string, number>(); base.filter((l) => match(l, skip)).forEach((l) => f(l).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1))); return m;
  };
  const years = useMemo(() => [...count((l) => [l.date.slice(0, 4)], "year").entries()].sort((a, b) => b[0].localeCompare(a[0])), [q, year, month, bk, topic, place, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const monthsAvail = count((l) => [l.date.slice(5, 7)], "month");
  const books = [...count((l) => [kind(l)], "bk").entries()].sort();
  const topics = [...count((l) => l.topics, "topic").entries()].sort();
  const places = [...count((l) => [l.place], "place").entries()].sort();
  const langs = [...count((l) => l.languages, "lang").entries()].sort();
  const active = [year, month && MONTHS[+month - 1], bk, topic, place, lang].filter(Boolean);
  const clear = () => { setYear(""); setMonth(""); setBk(""); setTopic(""); setPlace(""); setLang(""); setQ(""); };
  const grouped = list.reduce<Record<string, typeof list>>((a, l) => { const k = `${l.date.slice(0, 4)}-${l.date.slice(5, 7)}`; (a[k] ??= []).push(l); return a; }, {});

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-4 focus-within:border-saffron">
          <Search size={17} className="text-saffron" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search within transcriptions: title, verse, place, topic" className="h-11 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-ink-3" />
          {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={15} className="text-ink-3" /></button>}
        </div>
        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Year</p>
        <div className="flex flex-wrap gap-1.5">
          {years.map(([y, n]) => <button key={y} onClick={() => { setYear(year === y ? "" : y); }} aria-pressed={year === y} className={`rounded-full border px-3 py-1 text-[12.5px] transition ${year === y ? "border-saffron bg-saffron text-white" : "border-line bg-surface text-ink-2 hover:border-saffron/50"}`}>{y} <span className="tabular opacity-60">{n}</span></button>)}
        </div>
        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Month</p>
        <div className="flex flex-wrap gap-1.5">
          {MONTHS.map((m, i) => { const k = String(i + 1).padStart(2, "0"); const n = monthsAvail.get(k) ?? 0; return (
            <button key={m} disabled={!n && month !== k} onClick={() => setMonth(month === k ? "" : k)} aria-pressed={month === k} className={`rounded-full border px-3 py-1 text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-35 ${month === k ? "border-saffron bg-saffron text-white" : "border-line bg-surface text-ink-2 hover:border-saffron/50"}`}>{m.slice(0, 3)}{n ? <span className="tabular opacity-60"> {n}</span> : null}</button>
          ); })}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Type" value={bk} onChange={setBk} options={books} />
          <Select label="Topic" value={topic} onChange={setTopic} options={topics} />
          <Select label="Place" value={place} onChange={setPlace} options={places} />
          <Select label="Language" value={lang} onChange={setLang} options={langs} />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="font-medium text-ink">{list.length} transcriptions</span>
        {active.map((a) => <span key={a} className="rounded-full bg-saffron-soft px-2.5 py-1 text-saffron">{a}</span>)}
        {(active.length > 0 || q) && <button onClick={clear} className="text-ink-3 underline-offset-2 hover:underline">Clear all</button>}
      </div>
      <div className="mt-3">
        {Object.keys(grouped).sort().reverse().map((k) => (
          <section key={k} className="mb-7">
            <h2 className="mb-2 text-[14px] font-semibold text-saffron">{MONTHS[+k.slice(5) - 1]} {k.slice(0, 4)} <span className="font-normal text-ink-3">· {grouped[k].length}</span></h2>
            <div className="card divide-y divide-line">
              {grouped[k].map((l) => (
                <Link key={l.slug} href={`/teachings/audio/${l.slug}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-saffron-tint">
                  <span className="mega-ic !h-9 !w-9"><FileText size={16} strokeWidth={1.7} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-ink group-hover:text-saffron">{l.title}</span>
                    <span className="block truncate text-[12px] text-ink-3">{fmtDate(l.date)} · {l.place} · {l.scripture ?? "No verse"} · {l.topics.join(", ")}</span>
                  </span>
                  <ArrowRight size={15} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-saffron" />
                </Link>
              ))}
            </div>
          </section>
        ))}
        {!list.length && <p className="card p-12 text-center text-ink-2">No transcriptions match. Remove a selection to see more.</p>}
      </div>
    </div>
  );
}
