"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { MENUS } from "@/lib/nav";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 12 }, (_, i) => String(1996 - i));
const TYPES = ["Śrīmad-Bhāgavatam lecture", "Bhagavad-gītā lecture", "Caitanya-caritāmṛta lecture", "Discussion", "Questions & answers", "Darśana", "Festival", "House program"];
const TOPICS = ["Guru-tattva", "The Holy Name", "Separation", "Sādhu-saṅga", "Humility", "Surrender", "Prema"];

function Sel({ label, v, set, opts }: { label: string; v: string; set: (x: string) => void; opts: string[][] }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-saffron">
        <option value="">Any</option>
        {opts.map(([val, text]) => <option key={val} value={val}>{text ?? val}</option>)}
      </select>
    </label>
  );
}

export function TeachingsOrganiser({ lists = true }: { lists?: boolean }) {
  const router = useRouter();
  const [y, setY] = useState(""); const [m, setM] = useState(""); const [b, setB] = useState(""); const [t, setT] = useState("");
  const go = () => {
    const p = new URLSearchParams(); if (y) p.set("year", y); if (m) p.set("month", m); if (b) p.set("type", b); if (t) p.set("topic", t);
    router.push(`/teachings/transcriptions${p.size ? `?${p}` : ""}`);
  };
  const menu = MENUS.find((x) => x.key === "teachings")!;
  const tone = ["acc-teal", "acc-indigo", "acc-gold"];
  return (
    <div>
      <div className="card p-5 sm:p-6">
        <p className="text-[15px] font-semibold">Find a lecture</p>
        <p className="mt-0.5 text-[13px] text-ink-3">Choose any combination. Every selector is optional.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <Sel label="Year" v={y} set={setY} opts={YEARS.map((x) => [x, x])} />
          <Sel label="Month" v={m} set={setM} opts={MONTHS.map((x, i) => [String(i + 1).padStart(2, "0"), x])} />
          <Sel label="Type" v={b} set={setB} opts={TYPES.map((x) => [x, x])} />
          <Sel label="Topic" v={t} set={setT} opts={TOPICS.map((x) => [x, x])} />
          <button onClick={go} className="btn btn-primary !h-11 justify-center"><Search size={16} />Find</button>
        </div>
      </div>
      {lists && <div className="stagger mt-6 grid gap-5 lg:grid-cols-3">
        {menu.groups.map((g, i) => (
          <section key={g.title} className={`${tone[i % 3]} card overflow-hidden`}>
            <h3 className="flex items-center gap-2 border-b border-line bg-[var(--acc-tint)] px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--acc)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />{g.title}</h3>
            <ul className="divide-y divide-line">
              {g.links.map((l) => { const I = l.icon; return (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="group flex items-center gap-3 px-5 py-3 transition hover:bg-[var(--acc-tint)]">
                    <span className="mega-ic !h-9 !w-9"><I size={18} strokeWidth={1.8} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium text-ink">{l.label}{l.soon && <span className="ml-2 rounded-full bg-band px-1.5 text-[10px] font-normal text-ink-3">soon</span>}</span><span className="block truncate text-[12px] text-ink-3">{l.desc}</span></span>
                    <ArrowRight size={14} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-[var(--acc)]" />
                  </Link>
                </li>
              ); })}
            </ul>
          </section>
        ))}
      </div>}
    </div>
  );
}
