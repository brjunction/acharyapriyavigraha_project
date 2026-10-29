"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Search, X, Flower2, Sparkles, Sunset, UserRound, Lightbulb, Network, Users2, Scale, MapPin, Crown, Home, type LucideIcon } from "lucide-react";
import { TATTVA } from "@/lib/data";
import { MENUS } from "@/lib/nav";
import { norm } from "./search";

const ACC = ["teal", "indigo", "rose", "leaf", "gold", "saffron"];
const ICON: Record<string, LucideIcon> = {
  "krsna-tattva": Sparkles, "gaura-tattva": Sunset, "guru-tattva": Network, "jiva-tattva": UserRound, bhakti: Flower2,
  obstacles: Lightbulb, practice: Home, philosophy: Scale, "holy-places": MapPin, personalities: Crown,
};

export function TopicExplorer() {
  const [i, setI] = useState(4);
  const [q, setQ] = useState("");
  const idx = MENUS.find((m) => m.key === "tattva")!.groups.find((g) => g.title === "Indexes")!.links;
  const total = TATTVA.reduce((n, t) => n + t.children.length, 0);
  const t = TATTVA[i];
  const nq = norm(q.trim());
  const found = useMemo(() => nq ? TATTVA.flatMap((x, k) => x.children.filter((c) => norm(c).includes(nq) || norm(x.name).includes(nq)).map((c) => ({ c, x, k }))) : [], [nq]);
  const accOf = (k: number) => ACC[k % ACC.length];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Top bar: search and the other ways in */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-page/60 px-4 py-3">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-saffron">
          <Search size={15} className="text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${total} topics under ${TATTVA.length} subjects`} className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-ink-3" />
          {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={14} className="text-ink-3" /></button>}
        </label>
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
          <span className="mr-1 text-ink-3">Or go by</span>
          {idx.filter((x) => !x.soon).map((x) => <Link key={x.href} href={x.href} className="rounded-full border border-line bg-surface px-3 py-1 text-ink-2 transition hover:border-saffron hover:text-saffron">{x.label}</Link>)}
        </div>
      </div>

      {nq ? (
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">{found.length} result{found.length === 1 ? "" : "s"}</p>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {found.map(({ c, x, k }) => (
              <Link key={x.slug + c} href={`/tattva/${x.slug}`} className={`acc-${accOf(k)} group flex items-center gap-2.5 rounded-xl border border-line px-3 py-2 transition hover:bg-[var(--acc-tint)]`}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--acc)]" />
                <span className="min-w-0"><span className="block truncate text-[12.5px] font-medium text-ink">{c}</span><span className="block truncate text-[11px] text-ink-3">{x.name}</span></span>
              </Link>
            ))}
          </div>
          {!found.length && <p className="py-8 text-center text-[12.5px] text-ink-3">No topic matches. Try another word, or browse the subjects.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[290px_minmax(0,1fr)]">
          <ul className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line p-2 lg:block lg:border-b-0 lg:border-r lg:bg-page/40 lg:p-2.5">
            {TATTVA.map((x, k) => { const I = ICON[x.slug] ?? Network; const on = k === i; return (
              <li key={x.slug} className={`acc-${accOf(k)} shrink-0`}>
                <button onMouseEnter={() => setI(k)} onFocus={() => setI(k)} onClick={() => setI(k)} aria-pressed={on}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${on ? "bg-[var(--acc-tint)]" : "hover:bg-band"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${on ? "border-transparent bg-[var(--acc)] text-white" : "border-[color-mix(in_srgb,var(--acc)_18%,transparent)] bg-[var(--acc-soft)] text-[var(--acc)]"}`}><I size={14} strokeWidth={1.8} /></span>
                  <span className="min-w-0 flex-1"><span className={`block whitespace-nowrap text-[12.5px] font-semibold lg:whitespace-normal ${on ? "text-[var(--acc)]" : "text-ink"}`}>{x.name}</span><span className="hidden text-[11px] text-ink-3 lg:block">{x.children.length} topics</span></span>
                  <ChevronRight size={14} className={`hidden lg:block ${on ? "text-[var(--acc)]" : "text-ink-3"}`} />
                </button>
              </li>
            ); })}
          </ul>
          <div key={t.slug} className={`acc-${accOf(i)} fade-in p-5 sm:p-7`}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><span className="h-1 w-1 rounded-full bg-[var(--acc)]" />Subject {String(i + 1).padStart(2, "0")} of {TATTVA.length}</p>
                <h3 className="mt-1 text-[17.5px] tracking-[-0.02em]">{t.name}</h3>
                <p className="mt-0.5 text-[12px] text-ink-3">{t.count} passages, lectures and quotes · {t.children.length} topics</p>
              </div>
              <Link href={`/tattva/${t.slug}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--acc)] px-4 py-1.5 text-[12px] font-medium text-white">Open {t.name}<ArrowRight size={13} /></Link>
            </div>
            <ol className="mt-4 grid gap-x-3 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
              {t.children.map((c, n) => (
                <li key={c}>
                  <Link href={`/tattva/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition hover:bg-[var(--acc-tint)]">
                    <span className="w-5 text-[11px] font-semibold tabular text-[var(--acc)]">{String(n + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">{c}</span>
                    <ArrowRight size={13} className="text-ink-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-[var(--acc)] group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
