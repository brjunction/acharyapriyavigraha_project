"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { MagCover } from "./mag-cover";

type Issue = { slug: string; number: string | null; title: string | null; date: string | null; year: number | null; cover: string | null; n?: number; toc?: { title: string; page: number }[] | null };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** All issues of a magazine by year, with one search across their titles and contents. */
export function IssueGrid({ mag, issues }: { mag: string; issues: Issue[] }) {
  const [q, setQ] = useState(""); const f = fold(q.trim());
  const yearOf = (i: Issue) => i.year || (i.date ? Number(i.date.slice(0, 4)) : 0);
  const hits = useMemo(() => !f ? issues : issues.filter((i) => fold([i.number, i.title, ...(i.toc || []).map((t) => t.title)].filter(Boolean).join(" ")).includes(f)), [issues, f]);
  const years = [...new Set(hits.map(yearOf))].sort((a, b) => b - a);
  const label = (i: Issue) => (i.number && i.title ? `${i.number} · ${i.title}` : i.title || i.number || "Issue");
  return (
    <>
      <div className="sticky top-[52px] z-20 -mx-4 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 sm:max-w-[360px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Find in ${issues.length} issues — titles and contents`} className="h-9 w-full rounded-full border border-line bg-white pl-9 pr-8 text-[13px] outline-none focus:border-ink/40" />{q && <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
          {years.length > 1 && <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none]">{years.map((y) => <a key={y} href={`#y-${y}`} className="shrink-0 rounded-md px-2.5 py-1 text-[12.5px] tabular-nums text-ink-2 hover:bg-band hover:text-ink">{y || "Undated"}</a>)}</nav>}
        </div>
      </div>
      {f && <p className="mt-4 text-[12.5px] text-ink-3">{hits.length ? `${hits.length} ${hits.length === 1 ? "issue" : "issues"} with “${q}”` : `No issue with “${q}”.`}</p>}
      {years.map((y) => { const list = hits.filter((i) => yearOf(i) === y); return (
        <section key={y} id={`y-${y}`} className="scroll-mt-32 pt-8">
          <h2 className="mb-5 flex items-baseline gap-2 border-b border-line pb-2 text-[15px] font-semibold tabular-nums text-ink">{y || "Undated"}<span className="text-[12px] font-normal text-ink-3">{list.length}</span></h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">{list.map((i) => { const match = f ? (i.toc || []).filter((t) => fold(t.title).includes(f)).slice(0, 2) : []; return (
            <Link key={i.slug} href={`/teachings/magazines/${mag}/${i.slug}`} className="group" title={(i.toc || []).map((t) => t.title).join(" · ") || undefined}><MagCover src={i.cover} label={label(i)} className="transition group-hover:-translate-y-0.5" />
              <span className="mt-2 block text-[13.5px] font-medium leading-snug text-ink group-hover:underline">{label(i)}</span>
              <span className="block text-[12px] text-ink-3">{[i.date ? new Date(i.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null, i.n ? `${i.n} articles` : null].filter(Boolean).join(" · ")}</span>
              {match.map((t) => <span key={t.title} className="mt-1 block text-[12px] leading-snug text-saffron">p. {t.page} · {t.title}</span>)}
            </Link>); })}</div>
        </section>); })}
    </>
  );
}
