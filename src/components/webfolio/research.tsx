"use client";
/* Research search: every place a word or phrase is found in the WebFolio, as a hit list with the words around it. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Headphones, BookOpen, Quote, Newspaper, NotebookPen, Flower2, Clapperboard, ChevronDown, Copy, Check, Loader2, ScanSearch } from "lucide-react";

type Hit = { href: string; title: string; sub?: string; snippet?: string; snips?: string[]; n: number };
type Group = { key: string; title: string; hits: Hit[] };
const META: Record<string, [any, string]> = { lectures: [Headphones, "#b45309"], books: [BookOpen, "#0f766e"], compilations: [Quote, "#a16207"], articles: [Newspaper, "#0e7490"], diary: [NotebookPen, "#853500"], gurudeva: [Flower2, "#be185d"], videos: [Clapperboard, "#b91c1c"] };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
function Mark({ text, words }: { text: string; words: string[] }) {
  if (!text || !words.length) return <>{text}</>;
  let folded = ""; const map: number[] = []; for (let k = 0; k < text.length; k++) { const c = fold(text[k]); for (let x = 0; x < c.length; x++) { folded += c[x]; map.push(k); } }
  const marks: [number, number][] = []; for (const w of words) { let p = folded.indexOf(w); while (p >= 0) { marks.push([map[p], map[p + w.length - 1] + 1]); p = folded.indexOf(w, p + w.length); } }
  marks.sort((a, b) => a[0] - b[0]); const out: React.ReactNode[] = []; let last = 0;
  marks.forEach(([a, b], i) => { if (a < last) return; out.push(text.slice(last, a), <mark key={i} className="rounded-sm bg-amber-100 px-0.5 font-medium text-zinc-950">{text.slice(a, b)}</mark>); last = b; });
  out.push(text.slice(last)); return <>{out}</>;
}

export function Research() { return <Suspense><Inner /></Suspense>; }
function Inner() {
  const sp = useSearchParams(); const router = useRouter();
  const [q, setQ] = useState(sp.get("q") || ""); const [mode, setMode] = useState(sp.get("mode") === "all" ? "all" : "phrase");
  const [res, setRes] = useState<{ groups: Group[]; total: number; places: number } | null>(null); const [busy, setBusy] = useState(false);
  const [only, setOnly] = useState<string>("all"); const [sort, setSort] = useState<"places" | "title">("places"); const [open, setOpen] = useState<Record<string, boolean>>({}); const [copied, setCopied] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const run = (qq = q, m = mode) => { const t = qq.trim(); router.replace(`/webfolio/search${t ? `?q=${encodeURIComponent(t)}${m === "all" ? "&mode=all" : ""}` : ""}`, { scroll: false }); if (t.length < 2) { setRes(null); return; } setBusy(true); setOnly("all"); setOpen({}); fetch(`/api/webfolio/search?full=1&mode=${m}&q=${encodeURIComponent(t)}`).then((r) => r.json()).then(setRes).catch(() => setRes({ groups: [], total: 0, places: 0 })).finally(() => setBusy(false)); };
  useEffect(() => { if (q) run(); else inp.current?.focus(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const words = useMemo(() => { const f = fold((sp.get("q") || "").trim()).replace(/\s+/g, " "); return f.length < 2 ? [] : mode === "all" ? f.split(" ").filter((w) => w.length > 1) : [f]; }, [sp, mode]);
  const hits = useMemo(() => { if (!res) return []; const xs = res.groups.filter((g) => only === "all" || g.key === only).flatMap((g) => g.hits.map((h) => ({ ...h, g: g.key, gt: g.title }))); return sort === "title" ? xs.sort((a, b) => a.title.localeCompare(b.title)) : xs.sort((a, b) => b.n - a.n); }, [res, only, sort]);
  const copyList = () => { navigator.clipboard?.writeText(hits.map((h) => `${h.title} — ${h.gt}${h.sub ? `, ${h.sub}` : ""} (${h.n}×)\n${location.origin}${h.href}`).join("\n\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="px-5 py-8 sm:px-10 lg:py-12">
      <div className="mx-auto max-w-[920px]">
        <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]"><ScanSearch size={22} /></span><div><h1 className="text-[26px] font-semibold tracking-[-0.025em] text-zinc-950 sm:text-[30px]">Research search</h1><p className="text-[13.5px] text-zinc-500">Every place a word or phrase is found, in every text of the WebFolio.</p></div></div>
        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="mt-6">
          <div className="flex h-14 items-center gap-3 rounded-full border border-zinc-200 bg-white pl-5 pr-2 shadow-[0_1px_6px_rgba(32,33,36,.12)] transition focus-within:shadow-[0_2px_10px_rgba(32,33,36,.22)]">
            <Search size={19} className="shrink-0 text-zinc-400" />
            <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="A word, a name, a verse, a phrase…" className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-zinc-950 outline-none placeholder:text-zinc-400" />
            {q && <button type="button" onClick={() => { setQ(""); setRes(null); inp.current?.focus(); }} className="flex size-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100" aria-label="Clear"><X size={17} /></button>}
            <button className="flex h-10 items-center gap-2 rounded-full bg-[#1a73e8] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1765cc]">{busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}<span className="hidden sm:inline">Search</span></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 pl-2 text-[12.5px]">
            <span className="text-zinc-500">Find</span>
            {[["phrase", "the exact phrase"], ["all", "all the words"]].map(([k, l]) => <button key={k} type="button" onClick={() => { setMode(k); if (q.trim()) run(q, k); }} className={`h-7 rounded-full border px-3 font-medium transition ${mode === k ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1765cc]" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>{l}</button>)}
            <span className="ml-1 text-zinc-400">· diacritics not needed: “krsna” finds “Kṛṣṇa”</span>
          </div>
        </form>

        {!res && !busy && <div className="mt-10 grid gap-3 sm:grid-cols-3">{["Holy Name", "Gopāl Jiu", "sādhu-saṅga", "Prabhupāda", "Jagannātha", "separation"].map((x) => <button key={x} onClick={() => { setQ(x); run(x); }} className="rounded-xl border border-zinc-200 px-4 py-3 text-left text-[13.5px] text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"><Search size={13} className="mb-1.5 text-zinc-400" />{x}</button>)}</div>}

        {busy && !res && <div className="mt-10 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-100" />)}</div>}

        {res && <div className={`mt-8 transition ${busy ? "opacity-50" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <p className="text-[13.5px] text-zinc-600">{res.total ? <><b className="font-semibold text-zinc-950">{res.places.toLocaleString()}</b> places in <b className="font-semibold text-zinc-950">{res.total.toLocaleString()}</b> texts</> : `Nothing found for “${sp.get("q")}”.`}</p>
            {res.total > 0 && <div className="flex items-center gap-2"><label className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 pl-2.5 pr-1 text-[12.5px] text-zinc-600">Sort<select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-transparent font-medium text-zinc-900 outline-none"><option value="places">Most found</option><option value="title">A to Z</option></select></label>
              <button onClick={copyList} className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-50">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy list"}</button></div>}
          </div>
          {res.total > 0 && <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <Chip on={only === "all"} onClick={() => setOnly("all")} label="All" n={res.total} />
            {res.groups.map((g) => { const [I, c] = META[g.key] || [Search, "#555"]; return <Chip key={g.key} on={only === g.key} onClick={() => setOnly(g.key)} label={g.title} n={g.hits.length} icon={<I size={13} style={{ color: c }} />} />; })}
          </div>}
          <ol className="mt-4 space-y-3">
            {hits.map((h, i) => { const [I, c] = META[h.g] || [Search, "#555"]; const more = (h.snips?.length || 0) > 1; const id = h.href + i; return (
              <li key={id} className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-[0_6px_20px_-12px_rgba(0,0,0,.25)]">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c}1f`, color: c }}><I size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <Link href={h.href} className="text-[15.5px] font-semibold leading-snug text-[#1a0dab] hover:underline [.folio[data-theme=dark]_&]:text-[#8ab4f8]"><Mark text={h.title} words={words} /></Link>
                    <p className="mt-0.5 text-[12.5px] text-zinc-500">{h.gt}{h.sub ? ` · ${h.sub}` : ""}</p>
                    <div className="mt-2 space-y-1.5">{(open[id] ? h.snips || [h.snippet || ""] : [h.snippet || ""]).map((s, k) => <p key={k} className="text-[13.5px] leading-relaxed text-zinc-700"><Mark text={s} words={words} /></p>)}</div>
                    {more && <button onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#1a73e8] hover:underline">{open[id] ? "Fewer places" : `Show ${Math.min(h.n, h.snips!.length) - 1} more place${h.snips!.length > 2 ? "s" : ""}`}<ChevronDown size={13} className={open[id] ? "rotate-180" : ""} /></button>}
                  </div>
                  <span title="Times found" className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11.5px] font-semibold tabular-nums text-zinc-700">{h.n}×</span>
                </div>
              </li>); })}
          </ol>
        </div>}
      </div>
    </div>
  );
}
const Chip = ({ on, onClick, label, n, icon }: { on: boolean; onClick: () => void; label: string; n: number; icon?: React.ReactNode }) => <button onClick={onClick} className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition ${on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-300"}`}>{!on && icon}{label}<span className={`tabular-nums ${on ? "text-white/70" : "text-zinc-400"}`}>{n}</span></button>;
