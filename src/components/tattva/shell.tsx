"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search, X, PanelLeft } from "lucide-react";

export type TNode = { name: string; slug: string; parent: string | null; total: number };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Tattva: every topic in a collapsible tree on the left, the chosen topic on the right. */
export function TattvaShell({ topics, children }: { topics: TNode[]; children: React.ReactNode }) {
  const path = usePathname(); const cur = path.split("/")[2] || ""; const [open, setOpen] = useState<Record<string, boolean>>({}); const [q, setQ] = useState(""); const [side, setSide] = useState(false);
  const kids = useMemo(() => { const m: Record<string, TNode[]> = {}; topics.forEach((t) => (m[t.parent || ""] ||= []).push(t)); return m; }, [topics]);
  useEffect(() => { const by = Object.fromEntries(topics.map((t) => [t.slug, t])); const byName = Object.fromEntries(topics.map((t) => [t.name, t])); let t = by[cur]; const add: Record<string, boolean> = {}; while (t?.parent) { add[t.parent] = true; t = byName[t.parent]; } setOpen((o) => ({ ...o, ...add })); setSide(false); }, [cur, topics]);
  const f = fold(q.trim());
  const row = (t: TNode, d: number): React.ReactNode => { const ch = kids[t.name] || []; const on = open[t.name]; return (
    <div key={t.name}>
      <div className={`flex items-center rounded-md ${cur === t.slug ? "bg-band" : "hover:bg-band/60"}`} style={{ paddingLeft: d * 14 }}>
        <button onClick={() => setOpen((o) => ({ ...o, [t.name]: !on }))} className={`flex size-6 shrink-0 items-center justify-center text-ink-3 ${ch.length ? "" : "invisible"}`}><ChevronRight size={13} className={`transition ${on ? "rotate-90" : ""}`} /></button>
        <Link href={`/tattva/${t.slug}`} className={`flex min-w-0 flex-1 items-center justify-between gap-2 py-1 pr-2 text-[13px] ${cur === t.slug ? "font-medium text-ink" : "text-ink-2"}`}><span className="truncate">{t.name}</span>{t.total > 0 && <span className="text-[11px] tabular-nums text-ink-3">{t.total}</span>}</Link>
      </div>
      {on && ch.map((c) => row(c, d + 1))}
    </div>); };
  const tree = (
    <div>
      <label className="relative mb-3 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a topic" className="h-8 w-full rounded-md border border-line bg-white pl-8 pr-7 text-[12.5px] outline-none focus:border-ink/40" />{q && <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3"><X size={13} /></button>}</label>
      <Link href="/tattva" className={`mb-1 block rounded-md px-2 py-1 text-[13px] ${!cur ? "bg-band font-medium" : "text-ink-2 hover:bg-band/60"}`}>All topics, A–Z</Link>
      {f ? topics.filter((t) => fold(t.name).includes(f)).map((t) => <Link key={t.name} href={`/tattva/${t.slug}`} className="flex justify-between rounded-md px-2 py-1 text-[13px] text-ink-2 hover:bg-band/60"><span className="truncate">{t.name}</span><span className="text-[11px] text-ink-3">{t.total || ""}</span></Link>) : (kids[""] || []).map((t) => row(t, 0))}
    </div>
  );
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-[74px] max-h-[calc(100dvh-100px)] overflow-y-auto pr-1 [scrollbar-width:thin]"><p className="mb-2 text-[12px] font-medium text-ink-3">Tattva · {topics.length} topics</p>{tree}</div></aside>
        <div className="min-w-0">
          <button onClick={() => setSide(true)} className="mb-4 flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-[12.5px] lg:hidden"><PanelLeft size={14} />All topics</button>
          {children}
        </div>
      </div>
      {side && <div className="fixed inset-0 z-[60] bg-black/30 lg:hidden" onClick={() => setSide(false)}><aside className="h-full w-[85%] max-w-[320px] overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>{tree}</aside></div>}
    </div>
  );
}
