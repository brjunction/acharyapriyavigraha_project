"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { ALL_LANGUAGES, REGIONS, STATUS_LABEL, type LangStatus } from "@/lib/languages";

const TONE: Record<LangStatus, string> = { live: "bg-ok-soft text-ok", building: "bg-gold-soft text-gold", planned: "bg-band text-ink-3" };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Directory of every language site, built to stay usable at 100+ languages. */
export function LanguageDirectory() {
  const [q, setQ] = useState(""); const [region, setRegion] = useState("all"); const [status, setStatus] = useState<"all" | LangStatus>("all");
  const list = useMemo(() => ALL_LANGUAGES.filter((l) => (region === "all" || l.region === region) && (status === "all" || l.status === status) && (!q.trim() || norm(`${l.native} ${l.name} ${l.code}`).includes(norm(q.trim())))), [q, region, status]);
  const count = (s: LangStatus) => ALL_LANGUAGES.filter((l) => l.status === s).length;
  return (
    <div className="acc-rose">
      <div className="sticky top-[62px] z-20 -mx-5 border-b border-line bg-page/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-[var(--acc)] sm:max-w-sm">
            <Search size={15} className="text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${ALL_LANGUAGES.length} languages, e.g. Telugu or తెలుగు`} aria-label="Search languages" className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-3" />
          </label>
          <div className="flex rounded-full border border-line bg-surface p-0.5 text-[11.5px]">
            {([["all", `All ${ALL_LANGUAGES.length}`], ["live", `Live ${count("live")}`], ["building", `In progress ${count("building")}`], ["planned", `Planned ${count("planned")}`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setStatus(k)} className={`rounded-full px-3 py-1.5 transition ${status === k ? "bg-[var(--acc)] font-medium text-white" : "text-ink-2 hover:text-ink"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="scrollbar-none -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1">
          <button onClick={() => setRegion("all")} className={`chip shrink-0 ${region === "all" ? "!border-[var(--acc)] !bg-acc-soft !text-[var(--acc)]" : ""}`}>All regions</button>
          {REGIONS.map((r) => <button key={r.key} onClick={() => setRegion(r.key)} className={`chip shrink-0 ${region === r.key ? "!border-[var(--acc)] !bg-acc-soft !text-[var(--acc)]" : ""}`}>{r.title}</button>)}
        </div>
      </div>

      <div className="pt-8">
        {REGIONS.map((r) => {
          const items = list.filter((l) => l.region === r.key);
          if (!items.length) return null;
          return (
            <section key={r.key} className="mb-10">
              <div className="mb-3 flex items-baseline gap-3"><h2 className="text-[16.5px] tracking-[-0.02em]">{r.title}</h2><span className="text-[11.5px] text-ink-3">{items.length} · {r.blurb}</span></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((l) => (
                  <Link key={l.code} href={l.code === "en" ? "/" : `/${l.code}`} className="card card-hover group flex flex-col p-4" dir={l.rtl ? "rtl" : undefined}>
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="text-[16.5px] font-semibold leading-tight tracking-[-0.02em] group-hover:text-[var(--acc)]">{l.native}</p><p className="mt-0.5 text-[11.5px] text-ink-3" dir="ltr">{l.name} · /{l.code}</p></div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${TONE[l.status]}`}>{STATUS_LABEL[l.status]}</span>
                    </div>
                    {l.status !== "planned" ? (
                      <div className="mt-4" dir="ltr"><div className="mb-1 flex justify-between text-[11px] text-ink-3"><span>Interface</span><span className="tabular">{l.ui}%</span></div><div className="h-1 overflow-hidden rounded-full bg-band"><div className="h-full rounded-full bg-[var(--acc)]" style={{ width: `${l.ui}%` }} /></div></div>
                    ) : <p className="mt-4 text-[11.5px] text-ink-3" dir="ltr">Not started. Help begin this language.</p>}
                    <span className="mt-3 flex items-center gap-1 text-[11.5px] font-medium text-[var(--acc)]" dir="ltr">{l.status === "planned" ? "Open portal" : "Open site"}<ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {!list.length && <p className="py-16 text-center text-ink-3">No language matches. <button onClick={() => { setQ(""); setRegion("all"); setStatus("all"); }} className="text-[var(--acc)]">Clear filters</button></p>}
      </div>
    </div>
  );
}
