"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X, Loader2, Headphones, Music2, Video, BookOpen, FileText, Quote, Network, NotebookPen, HandHeart, History, ArrowRight } from "lucide-react";

const ICON: Record<string, any> = { lecture: Headphones, kirtan: Music2, video: Video, book: BookOpen, chapter: BookOpen, article: FileText, quote: Quote, topic: Network, diary: NotebookPen, archive: HandHeart, life: History };
type G = { type: string; label: string; hits: { type: string; title: string; href: string; sub: string; snippet: string }[] };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
function mark(text: string, q: string) {
  const words = fold(q).split(/\s+/).filter((w) => w.length > 1); if (!words.length || !text) return text;
  const f = fold(text); const out: React.ReactNode[] = []; let i = 0, k = 0;
  while (i < text.length) { let hit = -1, len = 0; for (const w of words) { const j = f.indexOf(w, i); if (j >= 0 && (hit < 0 || j < hit)) { hit = j; len = w.length; } } if (hit < 0) break; out.push(text.slice(i, hit), <mark key={k++} className="rounded-sm bg-[#fbf0d2] px-0.5 text-ink">{text.slice(hit, hit + len)}</mark>); i = hit + len; }
  out.push(text.slice(i)); return out;
}

/** Search everything: results grouped by kind, a tab for each, every word highlighted. */
export function SearchResults() {
  const sp = useSearchParams(); const router = useRouter();
  const q = sp.get("q") || ""; const type = sp.get("type") || "";
  const [text, setText] = useState(q); const [all, setAll] = useState<G[] | null>(null); const [one, setOne] = useState<G[] | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => setText(q), [q]);
  useEffect(() => { if (q.trim().length < 2) { setAll(null); return; } setBusy(true); fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`).then((r) => r.json()).then((d) => setAll(d.groups)).finally(() => setBusy(false)); }, [q]);
  useEffect(() => { if (!type || q.trim().length < 2) { setOne(null); return; } setBusy(true); fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=60`).then((r) => r.json()).then((d) => setOne(d.groups)).finally(() => setBusy(false)); }, [q, type]);
  const go = (o: { q?: string; type?: string }) => { const p = new URLSearchParams(); const nq = o.q ?? q; const nt = o.type ?? type; if (nq) p.set("q", nq); if (nt) p.set("type", nt); router.push(`/search?${p}`, { scroll: false }); };
  const groups = type ? one : all; const total = (all || []).reduce((n, g) => n + g.hits.length, 0);
  return (
    <div className="bg-white">
      <div className="border-b border-line bg-[#fbf7ef]">
        <div className="mx-auto max-w-[1000px] px-4 pb-6 pt-10 sm:px-6">
          <p className="mb-3 text-center text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px]">Search the archive</p>
          <form onSubmit={(e) => { e.preventDefault(); go({ q: text.trim(), type: "" }); }} className="relative mx-auto max-w-2xl">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="A word, a verse, a place, a year…" className="h-14 w-full rounded-full border border-line-strong bg-white pl-12 pr-28 text-[16px] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.4)] outline-none focus:border-ink/40" />
            {text && <button type="button" onClick={() => setText("")} className="absolute right-24 top-1/2 -translate-y-1/2 text-ink-3"><X size={16} /></button>}
            <button className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white">Search</button>
          </form>
          {all && all.length > 0 && <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            <button onClick={() => go({ type: "" })} className={`rounded-full border px-3 py-1 text-[12.5px] ${!type ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:bg-band"}`}>Everything</button>
            {all.map((g) => { const I = ICON[g.type] || FileText; return <button key={g.type} onClick={() => go({ type: g.type })} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] ${type === g.type ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:bg-band"}`}><I size={13} />{g.label}<span className="opacity-60">{g.hits.length}{g.hits.length >= 8 ? "+" : ""}</span></button>; })}
          </div>}
        </div>
      </div>
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
        {busy && <p className="flex items-center justify-center gap-2 py-10 text-[13px] text-ink-3"><Loader2 size={15} className="animate-spin" />Searching…</p>}
        {!busy && q.trim().length < 2 && <p className="py-16 text-center text-[14px] text-ink-3">Type at least two letters. Every word is matched, with or without diacritics.</p>}
        {!busy && groups && !groups.length && <p className="py-16 text-center text-[14px] text-ink-3">Nothing found for “{q}”. Try fewer or different words.</p>}
        {!busy && !type && total > 0 && <p className="mb-6 text-[12.5px] text-ink-3">Showing the best matches in each part of the archive. Choose a part above to see all of it.</p>}
        {!busy && groups?.map((g) => { const I = ICON[g.type] || FileText; return (
          <section key={g.type} className="mb-10">
            <div className="mb-2 flex items-center justify-between border-b border-line pb-2"><h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><I size={15} className="text-ink-3" />{g.label}</h2>{!type && g.hits.length >= 8 && <button onClick={() => go({ type: g.type })} className="flex items-center gap-1 text-[12.5px] text-ink-2 hover:text-ink">See all<ArrowRight size={13} /></button>}</div>
            <ul className="divide-y divide-line">{g.hits.map((h, i) => <li key={h.href + i}><Link href={h.href} className="group block py-3"><span className="block text-[15px] font-medium text-ink group-hover:underline">{mark(h.title, q)}</span>{h.sub && <span className="block text-[12px] text-ink-3">{h.sub}</span>}{h.snippet && <span className="mt-1 line-clamp-2 block text-[13.5px] leading-relaxed text-ink-2" style={{ fontFamily: "var(--font-reading-serif)" }}>{mark(h.snippet, q)}</span>}</Link></li>)}</ul>
          </section>); })}
      </div>
    </div>
  );
}
