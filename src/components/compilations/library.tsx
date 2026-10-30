"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Shuffle, Copy, Check, Link2, ArrowRight } from "lucide-react";

export type CompItem = { slug: string; title?: string | null; text?: string | null; source?: string | null; href?: string | null; reference?: string | null; translation?: string | null; topics?: string[] | null };
const fold = (s: unknown) => String(s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slug = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** A large set of quotes (or desires, instructions…): search, topics A–Z, and a page for every entry. */
export function CompilationLibrary({ items, base, kind }: { items: CompItem[]; base: string; kind: "quote" | "card" }) {
  const sp = useSearchParams(); const router = useRouter();
  const [q, setQ] = useState(sp.get("q") || ""); const topic = sp.get("topic") || ""; const [letter, setLetter] = useState(""); const [n, setN] = useState(40); const [pick, setPick] = useState<string | null>(null);
  const counts = useMemo(() => { const m: Record<string, number> = {}; items.forEach((i) => i.topics?.forEach((t) => (m[t] = (m[t] || 0) + 1))); return m; }, [items]);
  const topics = useMemo(() => Object.keys(counts).sort((a, b) => fold(a).localeCompare(fold(b))), [counts]);
  const has = useMemo(() => new Set(topics.map((t) => fold(t)[0]?.toUpperCase())), [topics]);
  const set = (k: string, v: string) => { const p = new URLSearchParams(sp.toString()); v ? p.set(k, v) : p.delete(k); router.replace(`${base}${p.size ? `?${p}` : ""}`, { scroll: false }); };
  useEffect(() => setN(40), [q, topic]);
  const f = fold(q.trim());
  const list = useMemo(() => items.filter((i) => (!topic || i.topics?.includes(topic)) && (!f || fold(`${i.title} ${i.text} ${i.translation} ${i.source} ${i.reference} ${i.topics?.join(" ")}`).includes(f))), [items, topic, f]);
  const shown = pick ? list.filter((i) => i.slug === pick) : list.slice(0, n);
  const letterTopics = letter ? topics.filter((t) => fold(t)[0]?.toUpperCase() === letter) : [];

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
      <div className="sticky top-[52px] z-20 sm:top-[58px] -mx-4 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => { setQ(e.target.value); setPick(null); }} onBlur={() => set("q", q.trim())} placeholder="Search words, a source or a topic" className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-8 text-[13.5px] outline-none focus:border-ink/40" />{q && <button onClick={() => { setQ(""); set("q", ""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
          <button onClick={() => { const r = list[Math.floor(Math.random() * list.length)]; if (r) setPick(r.slug); }} className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-[13px] text-ink-2 hover:bg-band"><Shuffle size={14} />Random</button>
        </div>
        <div className="mt-2.5 flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
          <span className="mr-1.5 shrink-0 text-[12px] text-ink-3">Topics</span>
          {LETTERS.map((L) => <button key={L} disabled={!has.has(L)} onClick={() => setLetter(letter === L ? "" : L)} className={`size-7 shrink-0 rounded text-[12.5px] tabular-nums transition ${letter === L ? "bg-ink text-white" : has.has(L) ? "text-ink-2 hover:bg-band" : "text-ink-3/40"}`}>{L}</button>)}
        </div>
        {letter && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line pt-2.5">{letterTopics.map((t) => <button key={t} onClick={() => { set("topic", topic === t ? "" : t); setLetter(""); setPick(null); }} className={`rounded-md border px-2.5 py-1 text-[12.5px] ${topic === t ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:bg-band"}`}>{t} <span className="opacity-60">{counts[t]}</span></button>)}</div>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
        <span>{pick ? "1 chosen at random" : `${list.length.toLocaleString()} ${list.length === 1 ? "entry" : "entries"}`}</span>
        {topic && <span className="flex items-center gap-1 rounded-md bg-band px-2 py-0.5 text-ink-2">{topic}<button onClick={() => set("topic", "")}><X size={12} /></button></span>}
        {topic && <Link href={`/tattva/${slug(topic)}`} className="flex items-center gap-1 text-ink-2 hover:text-ink">Everything on {topic}<ArrowRight size={12} /></Link>}
        {pick && <button onClick={() => setPick(null)} className="text-ink-2 underline">Show all</button>}
      </div>

      {!topic && !f && !pick && topics.length > 0 && (
        <details className="mt-4 rounded-lg border border-line"><summary className="cursor-pointer px-4 py-2.5 text-[13px] font-medium text-ink">All {topics.length} topics, A–Z</summary>
          <div className="columns-2 gap-6 border-t border-line px-4 py-3 sm:columns-3 lg:columns-5">{topics.map((t) => <button key={t} onClick={() => set("topic", t)} className="flex w-full justify-between py-0.5 text-left text-[12.5px] text-ink-2 hover:text-ink"><span className="truncate">{t}</span><span className="pl-2 text-ink-3">{counts[t]}</span></button>)}</div>
        </details>
      )}

      <div className={`mt-5 ${kind === "quote" ? "columns-1 gap-4 md:columns-2 xl:columns-3" : "space-y-3"}`}>
        {shown.map((i) => <Card key={i.slug} i={i} base={base} kind={kind} onTopic={(t) => { set("topic", t); setPick(null); window.scrollTo({ top: 0 }); }} />)}
      </div>
      {!list.length && <p className="py-16 text-center text-[13.5px] text-ink-3">Nothing found. Try fewer words, or another topic.</p>}
      {!pick && list.length > n && <div className="mt-6 text-center"><button onClick={() => setN(n + 60)} className="h-9 rounded-md border border-line px-4 text-[13px] text-ink-2 hover:bg-band">Show more ({(list.length - n).toLocaleString()} left)</button></div>}
    </div>
  );
}

function Card({ i, base, kind, onTopic }: { i: CompItem; base: string; kind: string; onTopic: (t: string) => void }) {
  const [done, setDone] = useState("");
  const copy = async (what: "text" | "link") => { const url = `${location.origin}${base}/${i.slug}`; try { await navigator.clipboard.writeText(what === "link" ? url : `“${i.text || i.translation}”\n— Śrī Śrīmad Gour Govinda Swāmī Gurudeva${i.source ? `, ${i.source}` : ""}\n${url}`); setDone(what); setTimeout(() => setDone(""), 1500); } catch {} };
  return (
    <article className="group mb-4 break-inside-avoid rounded-lg border border-line bg-white p-4 transition hover:border-line-strong">
      {(i.title || i.reference) && <Link href={`${base}/${i.slug}`} className="mb-1.5 block text-[14px] font-medium text-ink hover:underline">{i.title || i.reference}</Link>}
      {i.translation && <p className="text-[14px] font-medium leading-[1.65] text-ink">{i.translation}</p>}
      {i.text && <Link href={`${base}/${i.slug}`} className={`block whitespace-pre-line leading-[1.7] text-ink ${kind === "quote" ? "text-[15px]" : "line-clamp-6 text-[14px] text-ink-2"}`}>{kind === "quote" ? `“${i.text}”` : i.text}</Link>}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {i.source && (i.href ? <Link href={i.href} className="text-[12px] text-ink-3 hover:text-ink">{i.source}</Link> : <p className="text-[12px] text-ink-3">{i.source}</p>)}
          {!!i.topics?.length && <div className="mt-1.5 flex flex-wrap gap-1">{i.topics.slice(0, 4).map((t) => <button key={t} onClick={() => onTopic(t)} className="rounded bg-band px-1.5 py-0.5 text-[11px] text-ink-2 hover:bg-line">{t}</button>)}</div>}
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-60 transition group-hover:opacity-100">
          <button title="Copy with source" onClick={() => copy("text")} className="flex size-7 items-center justify-center rounded text-ink-3 hover:bg-band hover:text-ink">{done === "text" ? <Check size={14} /> : <Copy size={14} />}</button>
          <button title="Copy link" onClick={() => copy("link")} className="flex size-7 items-center justify-center rounded text-ink-3 hover:bg-band hover:text-ink">{done === "link" ? <Check size={14} /> : <Link2 size={14} />}</button>
        </div>
      </div>
    </article>
  );
}
