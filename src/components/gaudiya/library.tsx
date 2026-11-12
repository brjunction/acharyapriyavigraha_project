"use client";
/* The Gauḍīya library as one page: the ācāryas across the top (tap one to see only his works), a search, language,
   and the books standing on shelves — one shelf per ācārya. */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Portrait } from "./portrait";
import { Cover } from "./cover";

export type LBook = { slug: string; title: string; cover: string | null; language: string; acharya: string | null; kind: string; words: number };
export type LAcharya = { slug: string; title: string; cover: string | null };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LANG: Record<string, string> = { en: "English", hi: "हिन्दी", or: "ଓଡ଼ିଆ", bn: "বাংলা", sa: "संस्कृत", ru: "Русский" };

export function GaudiyaLibrary({ books, acharyas, empty }: { books: LBook[]; acharyas: LAcharya[]; empty: string }) {
  const [who, setWho] = useState(""); const [q, setQ] = useState(""); const [lang, setLang] = useState("");
  const authors = useMemo(() => acharyas.filter((a) => books.some((b) => b.acharya === a.slug)), [acharyas, books]);
  const langs = useMemo(() => [...new Set(books.map((b) => b.language))], [books]);
  const f = fold(q.trim());
  const shown = books.filter((b) => (!who || b.acharya === who) && (!lang || b.language === lang) && (!f || fold(`${b.title} ${acharyas.find((a) => a.slug === b.acharya)?.title || ""}`).includes(f)));
  const shelves: [LAcharya | null, LBook[]][] = [...authors.map((a) => [a, shown.filter((b) => b.acharya === a.slug)] as [LAcharya, LBook[]]), [null, shown.filter((b) => !b.acharya || !authors.some((a) => a.slug === b.acharya))] as [null, LBook[]]].filter(([, xs]) => xs.length);
  const filtered = !!(who || lang || f);
  return (
    <div>
      {authors.length > 0 && <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6">
        <div className="flex w-max gap-1 sm:gap-2">{authors.map((a) => { const on = who === a.slug; return (
          <button key={a.slug} onClick={() => setWho(on ? "" : a.slug)} className="group flex w-[86px] flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center transition hover:bg-[#fff4e2] sm:w-[100px]" aria-pressed={on}>
            <span className={`rounded-full p-[3px] transition ${on ? "bg-gradient-to-br from-saffron to-[#e0a54f]" : "bg-transparent group-hover:bg-[#f1d7ad]"}`}><Portrait src={a.cover} name={a.title} size={60} /></span>
            <span className={`line-clamp-2 text-[11.5px] leading-tight ${on ? "font-semibold text-ink" : "text-ink-2"}`}>{a.title.replace(/^Śrīla\s+/, "")}</span>
          </button>); })}</div>
      </div>}

      <div className="sticky top-[52px] z-20 -mx-4 mt-2 flex flex-wrap items-center gap-2 bg-white/90 px-4 py-3 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
        <label className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a book or an ācārya" className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-9 text-[14px] outline-none transition focus:border-ink/40" />{q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" aria-label="Clear"><X size={15} /></button>}</label>
        {langs.length > 1 && <div className="-mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:px-0">{["", ...langs].map((l) => <button key={l || "all"} onClick={() => setLang(l)} className={`h-10 shrink-0 rounded-full px-3.5 text-[13px] transition ${lang === l ? "bg-ink text-white" : "border border-line text-ink-2 hover:bg-band"}`}>{l ? LANG[l] || l.toUpperCase() : "All languages"}</button>)}</div>}
      </div>
      {filtered && <p className="mt-2 rounded-lg bg-band px-4 py-2.5 text-[13px] text-ink-2">Showing <b className="font-semibold text-ink">{shown.length}</b> of {books.length}, chosen by your filters. <button onClick={() => { setWho(""); setQ(""); setLang(""); }} className="font-medium text-saffron underline underline-offset-2">Show all</button></p>}

      {!books.length ? <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-16 text-center"><p className="text-[15px] text-ink-2">{empty}</p></div>
        : !shown.length ? <p className="py-16 text-center text-[13.5px] text-ink-3">Nothing matches.</p>
        : shelves.map(([a, xs]) => (
          <section key={a?.slug || "other"} className="mt-10">
            <div className="mb-4 flex items-end gap-3">
              {a && <Portrait src={a.cover} name={a.title} size={36} />}
              <h2 className="min-w-0 flex-1 text-[17px] font-semibold leading-tight text-ink">{a ? a.title : "Other books"}<span className="ml-2 text-[13px] font-normal text-ink-3">{xs.length}</span></h2>
              {a && <Link href={`/gaudiya/acharyas/${a.slug}`} className="hidden shrink-0 items-center gap-1 text-[12.5px] text-ink-3 hover:text-saffron sm:flex">His life<ArrowRight size={13} /></Link>}
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                {xs.map((b) => <Link key={b.slug} href={`/books/${b.slug}`} className="group block"><Cover src={b.cover} title={b.title} /><span className="mt-2.5 line-clamp-2 block text-[12.5px] font-medium leading-snug text-ink group-hover:text-saffron">{b.title}</span>{langs.length > 1 && <span className="text-[11px] text-ink-3">{LANG[b.language] || b.language}</span>}</Link>)}
              </div>
              <span aria-hidden className="mt-5 block h-[6px] rounded-full bg-gradient-to-b from-[#ecd9bd] to-[#f8efe2] shadow-[0_6px_10px_-6px_rgba(120,70,20,0.45)]" />
            </div>
          </section>))}
    </div>);
}
