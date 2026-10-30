"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X, BookOpen } from "lucide-react";

export type LibBook = { slug: string; title: string; subtitle: string | null; author: string | null; category: string | null; cover_url: string | null; language: string; description: string | null; chapters: number };
const LANG: Record<string, string> = { en: "English", hi: "Hindi", or: "Odia", bn: "Bengali", ru: "Russian", id: "Indonesian", nl: "Dutch", es: "Spanish" };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The library: shelves you can pick, search, language, and covers in a calm grid. */
export function BookLibrary({ books }: { books: LibBook[] }) {
  const [q, setQ] = useState(""); const [shelf, setShelf] = useState(""); const [lang, setLang] = useState("");
  const shelves = useMemo(() => Array.from(new Set(books.map((b) => b.category || "Books"))), [books]);
  const langs = useMemo(() => Array.from(new Set(books.map((b) => b.language))), [books]);
  const list = books.filter((b) => (!shelf || (b.category || "Books") === shelf) && (!lang || b.language === lang) && (!q || fold(`${b.title} ${b.subtitle || ""} ${b.author || ""} ${b.description || ""}`).includes(fold(q))));
  const groups = shelf || q ? [[shelf || "Results", list]] as [string, LibBook[]][] : shelves.map((s) => [s, list.filter((b) => (b.category || "Books") === s)] as [string, LibBook[]]).filter(([, xs]) => xs.length);
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6">
        <nav className="text-[12px] text-ink-3"><Link href="/teachings" className="hover:text-ink">His Teachings</Link> <span className="mx-1">/</span> Books</nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-[28px] leading-tight text-ink sm:text-[32px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Books</h1><p className="mt-1 text-[14px] text-ink-2">{books.length} books to read online, chapter by chapter.</p></div>
          <label className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books…" className="h-9 w-full rounded-md border border-line-strong bg-white pl-9 pr-8 text-[13px] outline-none focus:border-ink/40 focus:ring-[3px] focus:ring-ink/10" />{q && <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-1.5 border-b border-line pb-3">
          {["", ...shelves].map((s) => <button key={s || "all"} onClick={() => setShelf(s)} className={`h-8 rounded-full px-3 text-[13px] transition ${shelf === s ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}>{s || "All shelves"}</button>)}
          {langs.length > 1 && <select value={lang} onChange={(e) => setLang(e.target.value)} className="ml-auto h-8 rounded-md border border-line bg-white px-2 text-[12.5px] text-ink-2"><option value="">All languages</option>{langs.map((l) => <option key={l} value={l}>{LANG[l] || l}</option>)}</select>}
        </div>
        {!list.length ? <p className="py-20 text-center text-[13.5px] text-ink-3">No book matches.</p> : groups.map(([g, xs]) => (
          <section key={g} className="mt-10">
            <h2 className="mb-5 flex items-baseline gap-2 text-[15px] font-semibold text-ink">{g}<span className="text-[12px] font-normal text-ink-3">{xs.length}</span></h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">{xs.map((b) => (
              <Link key={b.slug} href={`/books/${b.slug}`} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-[2px_6px_6px_2px] bg-band shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_24px_-14px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5">
                  {b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt={b.title} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#7a3206] to-[#3f1503] p-3 text-center text-[#f3d9a4]"><BookOpen size={20} /><span className="text-[12px] leading-snug" style={{ fontFamily: "var(--font-reading-serif)" }}>{b.title}</span></div>}
                </div>
                <p className="mt-2.5 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:underline">{b.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-ink-3">{[b.chapters ? `${b.chapters} chapters` : null, LANG[b.language] && b.language !== "en" ? LANG[b.language] : null].filter(Boolean).join(" · ") || b.author}</p>
              </Link>))}</div>
          </section>))}
      </div>
    </div>
  );
}
