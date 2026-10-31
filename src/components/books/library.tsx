"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, BookOpen, Languages, LayoutGrid, List as ListIcon, ArrowRight } from "lucide-react";
import { langName, langNative } from "@/lib/content/book-langs";

export type LibBook = { slug: string; title: string; subtitle: string | null; author: string | null; category: string | null; cover_url: string | null; language: string; description: string | null; chapters: number; work?: string | null; size?: string | null };
export type Shelf = { name: string; color: string | null; description: string | null; size?: string | null };
const GRIDS: Record<string, string> = { small: "grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 lg:grid-cols-8", medium: "grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6", large: "grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5" };
const SCALE: Record<string, string> = { small: "w-[78%]", medium: "w-[90%]", large: "w-full" };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const shelfOf = (b: LibBook) => b.category || "Books";

/** The library: reading language, shelves, search, and every book once (with its other languages beside it). */
export function BookLibrary({ books, shelves: meta }: { books: LibBook[]; shelves: Shelf[] }) {
  const sp = useSearchParams(); const router = useRouter();
  const [q, setQ] = useState(""); const shelf = sp.get("shelf") || ""; const [lang, setLang] = useState(""); const [view, setView] = useState<"grid" | "list">("grid");
  const [recent, setRecent] = useState<{ slug: string; href: string; title: string; book: string; cover: string | null; index: number; total: number }[]>([]);
  useEffect(() => { try { setLang(localStorage.getItem("tj_book_lang") || ""); setView((localStorage.getItem("tj_book_view") as any) || "grid"); setRecent(JSON.parse(localStorage.getItem("tj_last_books") || "[]").slice(0, 4)); } catch {} }, []);
  const pickLang = (l: string) => { setLang(l); try { localStorage.setItem("tj_book_lang", l); } catch {} };
  const pickView = (v: "grid" | "list") => { setView(v); try { localStorage.setItem("tj_book_view", v); } catch {} };
  const setShelf = (s: string) => router.replace(s ? `?shelf=${encodeURIComponent(s)}` : "?", { scroll: false });
  const color = (n: string) => meta.find((m) => m.name === n)?.color || null;

  const langs = useMemo(() => { const m: Record<string, number> = {}; books.forEach((b) => (m[b.language] = (m[b.language] || 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [books]);
  // one card per work: the reader's language if there is one, otherwise the first
  const works = useMemo(() => {
    const g: Record<string, LibBook[]> = {}; books.forEach((b) => (g[b.work || b.slug] ||= []).push(b));
    return Object.values(g).map((xs) => ({ main: xs.find((x) => x.language === lang) || xs.find((x) => x.language === "en") || xs[0], all: xs }));
  }, [books, lang]);
  const list = works.filter(({ main, all }) => (!lang || all.some((x) => x.language === lang)) && (!shelf || shelfOf(main) === shelf) && (!q || all.some((b) => fold(`${b.title} ${b.subtitle || ""} ${b.author || ""} ${b.description || ""}`).includes(fold(q)))));
  const order = [...meta.map((m) => m.name), ...Array.from(new Set(books.map(shelfOf))).filter((s) => !meta.some((m) => m.name === s))].filter((s) => books.some((b) => shelfOf(b) === s));
  const groups: [string, typeof list][] = shelf || q ? [[shelf || "Results", list]] : order.map((s) => [s, list.filter((w) => shelfOf(w.main) === s)] as [string, typeof list]).filter(([, xs]) => xs.length);

  return (
    <div className="bg-white">
      <div className="border-b border-line">
        <div className="mx-auto max-w-[1240px] px-4 pb-0 pt-5 sm:px-6">
          
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="text-[24px] leading-tight text-ink sm:text-[26px]">Books</h1><p className="mt-1 text-[13.5px] text-ink-2">Read online, chapter by chapter — in any language they are published in.</p></div>
            <p className="text-[12.5px] text-ink-3">{works.length} books · {langs.length} {langs.length === 1 ? "language" : "languages"}</p>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {["", ...order].map((s) => <button key={s || "all"} onClick={() => setShelf(s)} className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-[13px] transition ${shelf === s ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}>{s && <span className="size-2 rounded-full" style={{ background: color(s) || "#c8c8c8" }} />}{s || "All books"}</button>)}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        <div className="sticky top-[52px] z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
          <label className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, authors and descriptions" className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-8 text-[13.5px] outline-none focus:border-ink/40" />{q && <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
          <label className="relative flex h-9 items-center gap-1.5 rounded-md border border-line px-2.5 text-[13px] text-ink-2"><Languages size={15} className="text-ink-3" /><select value={lang} onChange={(e) => pickLang(e.target.value)} className="appearance-none bg-transparent pr-1 outline-none"><option value="">All languages</option>{langs.map(([l, n]) => <option key={l} value={l}>{langNative(l)}{langNative(l) !== langName(l) ? ` (${langName(l)})` : ""} · {n}</option>)}</select></label>
          <div className="flex rounded-md border border-line p-0.5">{([["grid", LayoutGrid], ["list", ListIcon]] as const).map(([v, I]) => <button key={v} onClick={() => pickView(v)} className={`flex size-8 items-center justify-center rounded ${view === v ? "bg-band text-ink" : "text-ink-3"}`} aria-label={v}><I size={15} /></button>)}</div>
        </div>

        {recent.length > 0 && !q && !shelf && <section className="mt-8">
          <h2 className="mb-3 text-[13px] font-semibold text-ink">Continue reading</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recent.map((r) => <Link key={r.slug} href={r.href} className="group flex items-center gap-3 rounded-lg border border-line p-3 hover:border-line-strong">
            <span className="h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-band shadow-sm">{r.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.cover} alt="" className="h-full w-full object-cover" />}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{r.book}</span><span className="block truncate text-[12px] text-ink-3">{r.title}</span><span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-band"><span className="block h-full rounded-full bg-ink/70" style={{ width: `${Math.round(((r.index + 1) / r.total) * 100)}%` }} /></span></span>
            <ArrowRight size={14} className="text-ink-3 transition group-hover:translate-x-0.5" /></Link>)}</div>
        </section>}

        {!list.length ? <p className="py-20 text-center text-[13.5px] text-ink-3">No book matches. {lang && <button onClick={() => pickLang("")} className="underline">Show all languages</button>}</p> : groups.map(([g, xs]) => (
          <section key={g} className="mt-10">
            <div className="mb-5 flex items-baseline gap-2.5 border-b border-line pb-2"><span className="size-2.5 translate-y-[-1px] rounded-full" style={{ background: color(g) || "#c8c8c8" }} /><h2 className="text-[15px] font-semibold text-ink">{g}</h2><span className="text-[12px] text-ink-3">{xs.length}</span>{meta.find((m) => m.name === g)?.description && <span className="hidden truncate text-[12.5px] text-ink-3 sm:inline">— {meta.find((m) => m.name === g)?.description}</span>}</div>
            {view === "grid" ? <div className={`grid ${GRIDS[meta.find((m) => m.name === g)?.size || "small"] || GRIDS.small}`}>{xs.map(({ main: b, all }) => (
              <div key={b.slug} className="group">
                <Link href={`/books/${b.slug}`} className={`block ${b.size ? SCALE[b.size] || "" : ""}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2px_6px_6px_2px] bg-band shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_24px_-14px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_16px_30px_-14px_rgba(0,0,0,0.4)]">
                    {b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt={b.title} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#5b3a1e] to-[#2b1a0c] p-3 text-center text-[#efe2c8]"><BookOpen size={20} /><span className="text-[12px] leading-snug">{b.title}</span></div>}
                    <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12.5px] font-medium leading-snug text-ink group-hover:underline">{b.title}</p>
                </Link>
                <p className="mt-0.5 truncate text-[12px] text-ink-3">{b.chapters ? `${b.chapters} chapters` : b.author}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{all.map((x) => <Link key={x.slug} href={`/books/${x.slug}`} title={langName(x.language)} className={`rounded px-1.5 py-px text-[10.5px] font-medium uppercase tracking-wide ${x.slug === b.slug ? "bg-ink text-white" : "bg-band text-ink-2 hover:bg-line"}`}>{x.language}</Link>)}</div>
              </div>))}</div>
            : <div className="divide-y divide-line rounded-lg border border-line">{xs.map(({ main: b, all }) => (
              <div key={b.slug} className="flex items-center gap-4 p-3 hover:bg-band/40">
                <Link href={`/books/${b.slug}`} className="h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-band shadow-sm">{b.cover_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />}</Link>
                <div className="min-w-0 flex-1"><Link href={`/books/${b.slug}`} className="text-[14px] font-medium text-ink hover:underline">{b.title}</Link>{b.description && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-ink-3">{b.description}</p>}<p className="mt-1 text-[11.5px] text-ink-3">{[b.author, b.chapters ? `${b.chapters} chapters` : null].filter(Boolean).join(" · ")}</p></div>
                <div className="hidden shrink-0 gap-1 sm:flex">{all.map((x) => <Link key={x.slug} href={`/books/${x.slug}`} className={`rounded px-2 py-0.5 text-[11.5px] ${x.slug === b.slug ? "bg-ink text-white" : "bg-band text-ink-2"}`}>{langNative(x.language)}</Link>)}</div>
              </div>))}</div>}
          </section>))}
      </div>
    </div>
  );
}
