"use client";
/* The Gauḍīya library: one slim bar of ācāryas (like the Videos bar — swipe on phones, arrows on laptops, a panel with every ācārya),
   and below it either the whole library or one ācārya's dashboard: a little about him, his biography, his books. Switching is instant (no reload). */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Search, X, BookUser, GitBranch } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Portrait } from "./portrait";
import LibraryBrowser, { type LibBook } from "./library-browser";

export type HubBook = { slug: string; title: string; author: string; acharya: string | null; kind: string; category: string; chapters: number; language: string; order: number };
export type HubAcharya = { slug: string; title: string; subtitle: string | null; cover: string | null; summary: string | null; inChain: boolean; order: number };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LANG: Record<string, string> = { en: "English", hi: "Hindi · हिन्दी", or: "Odia · ଓଡ଼ିଆ", bn: "Bengali · বাংলা", sa: "Sanskrit · संस्कृतम्", ru: "Russian" };
const short = (t: string) => t.replace(/^(Śrīla|Śrī Śrīmad|Śrīpāda)\s+/, "");

export function AcharyaHub({ books, acharyas, base = "/gaudiya", what = "library" }: { books: HubBook[]; acharyas: HubAcharya[]; base?: string; what?: string }) {
  const [sel, setSel] = useState(""); const ref = useRef<HTMLDivElement>(null); const [edge, setEdge] = useState({ l: false, r: false }); const [panel, setPanel] = useState(false); const [q, setQ] = useState("");
  // ācāryas with books first (in paramparā order, then by name)
  const count = useMemo(() => { const m: Record<string, number> = {}; books.forEach((b) => b.acharya && (m[b.acharya] = (m[b.acharya] || 0) + 1)); return m; }, [books]);
  const withBooks = useMemo(() => acharyas.filter((a) => count[a.slug]).sort((a, b) => (a.order < 0 ? 999 : a.order) - (b.order < 0 ? 999 : b.order) || a.title.localeCompare(b.title)), [acharyas, count]);
  useEffect(() => { const a = new URLSearchParams(location.search).get("a") || ""; setSel(a); const p = () => setSel(new URLSearchParams(location.search).get("a") || ""); addEventListener("popstate", p); return () => removeEventListener("popstate", p); }, []);
  const go = (slug: string) => { setSel(slug); setPanel(false); history.pushState(null, "", slug ? `${base}?a=${slug}` : base); window.scrollTo({ top: 0 }); };
  const measure = useCallback(() => { const el = ref.current; if (!el) return; setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }); }, []);
  useEffect(() => { ref.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" }); measure(); }, [sel, measure]);
  useEffect(() => { addEventListener("resize", measure); return () => removeEventListener("resize", measure); }, [measure]);
  useEffect(() => { if (!panel) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setPanel(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [panel]);
  const slide = (d: number) => ref.current?.scrollBy({ left: d * Math.max(240, (ref.current?.clientWidth || 600) * 0.7), behavior: "smooth" });
  const chip = (on: boolean) => `flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition ${on ? "bg-gradient-to-b from-[#7a3305] to-[#592300] text-[#fff3dc] shadow-[0_2px_8px_-3px_rgba(89,35,0,.6)]" : "bg-[#f6efe5] text-[#3d2a1a] hover:bg-[#efe2cf]"}`;
  const a = acharyas.find((x) => x.slug === sel);
  const lib = (list: HubBook[], bySection: (b: HubBook) => [string, string]): LibBook[] => list.map((b) => { const [section, category] = bySection(b); return { slug: b.slug, href: `/books/${b.slug}`, title: b.title, titleDeva: "", author: b.author, chapters: b.chapters, category, section, order: b.order, language: b.language }; });
  const f = fold(q.trim());
  return (
    <div className="hnv">
      <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-3 sm:px-5">
          <button onClick={() => setPanel(true)} title="Every ācārya" className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#e8d9c3] bg-white px-2.5 text-[13px] font-medium text-[#592300] hover:border-[#c9a77d]"><LayoutGrid size={15} /><span className="max-sm:hidden">Ācāryas</span></button>
          <span className="h-5 w-px shrink-0 bg-line" />
          <div className="relative min-w-0 flex-1">
            {edge.l && <button onClick={() => slide(-1)} aria-label="Scroll left" className="absolute left-0 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,.18)] hover:bg-band sm:flex"><ChevronLeft size={17} /></button>}
            {edge.l && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-10 bg-gradient-to-r from-white to-transparent" />}
            <div ref={ref} onScroll={measure} className="flex gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button onClick={() => go("")} aria-current={!sel ? "page" : undefined} className={chip(!sel)}>All</button>
              {withBooks.map((x) => <button key={x.slug} onClick={() => go(x.slug)} aria-current={sel === x.slug ? "page" : undefined} className={chip(sel === x.slug)}>{short(x.title)}<span className={`text-[11px] tabular-nums ${sel === x.slug ? "text-white/70" : "text-ink-3"}`}>{count[x.slug]}</span></button>)}
            </div>
            {edge.r && <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l from-white to-transparent" />}
            {edge.r && <button onClick={() => slide(1)} aria-label="Scroll right" className="absolute right-0 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,.18)] hover:bg-band sm:flex"><ChevronRight size={17} /></button>}
          </div>
        </div>
      </div>

      {panel && <Portal><div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/25 sm:items-start sm:pt-24" onClick={() => setPanel(false)}>
        <div className="flex max-h-[80dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.45)] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <label className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input ref={(el) => { if (el && innerWidth >= 640) el.focus(); }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Find an ācārya (${acharyas.length})`} className="h-9 w-full rounded-lg bg-band pl-9 pr-3 text-[13.5px] outline-none focus:bg-white focus:ring-1 focus:ring-line" /></label>
            <button onClick={() => setPanel(false)} aria-label="Close" className="flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-band hover:text-ink"><X size={18} /></button>
          </div>
          <div className="overflow-y-auto p-2">
            <button onClick={() => go("")} className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-[14px] ${!sel ? "bg-[#f6efe5] font-semibold" : "hover:bg-[#f6efe5]"}`}>The whole {what}</button>
            {[["With books here", withBooks], ["Every other ācārya", acharyas.filter((x) => !count[x.slug])]].map(([h, list]) => { const xs = (list as HubAcharya[]).filter((x) => !f || fold(`${x.title} ${x.subtitle || ""}`).includes(f)); return xs.length ? <div key={h as string} className="border-t border-line/70 py-1">
              <p className="px-3 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{h as string}</p>
              <div className="grid sm:grid-cols-2">{xs.map((x) => <button key={x.slug} onClick={() => go(x.slug)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${sel === x.slug ? "bg-[#f6efe5]" : "hover:bg-[#faf5ee]"}`}><Portrait src={x.cover} name={x.title} size={30} /><span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{x.title}</span>{count[x.slug] ? <span className="text-[12px] tabular-nums text-ink-3">{count[x.slug]}</span> : null}</button>)}</div>
            </div> : null; })}
          </div>
        </div>
      </div></Portal>}

      <div className="mx-auto max-w-6xl px-5 py-6">
        {a ? (<>
          <section className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-[#fcfaf7] p-4 sm:flex-nowrap sm:items-center sm:p-5">
            <Portrait src={a.cover} name={a.title} size={64} />
            <div className="min-w-0 flex-1 basis-[60%]">
              <h2 className="text-[19px] font-semibold leading-tight text-ink">{a.title}</h2>
              {a.subtitle && <p className="mt-0.5 text-[13.5px] text-ink-2">{a.subtitle}</p>}
              {a.summary && <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-2">{a.summary}</p>}
            </div>
            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:flex-col">
              <Link href={`/gaudiya/biographies/${a.slug}`} className="ui-btn ui-btn-primary"><BookUser size={15} />Read his biography</Link>
              {a.inChain && <Link href={`/gaudiya/parampara#${a.slug}`} className="ui-btn"><GitBranch size={15} />In the Guru-paramparā</Link>}
            </div>
          </section>
          {count[a.slug] ? <LibraryBrowser label="His books" allLabel="All his books" storeKey={`tj:gaudiya:${base}:a`} books={lib(books.filter((b) => b.acharya === a.slug), (b) => [b.kind, LANG[b.language] || b.language.toUpperCase()])} />
            : <p className="rounded-xl border border-dashed border-line p-8 text-center text-[14px] text-ink-3">His books are being added.</p>}
        </>) : (
          <LibraryBrowser label={what === "library" ? "Library" : what[0].toUpperCase() + what.slice(1)} allLabel="Everything" storeKey={`tj:gaudiya:${base}`} books={lib(books, (b) => [b.kind, b.author || "Other books"])} />
        )}
      </div>
    </div>);
}
