"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock, Newspaper, Layers, ChevronDown } from "lucide-react";
import { Avatar } from "./header";
import type { ACard, Author } from "@/lib/content/articles-public";

const fold = (s: unknown) => String(s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function Pick({ label, value, options, onChange }: { label: string; value: string; options: [string, number][]; onChange: (v: string) => void }) {
  if (!options.length) return null;
  return <label className={`relative flex h-9 items-center rounded-md border px-2.5 text-[13px] ${value ? "border-ink bg-ink text-white" : "border-line text-ink-2"}`}><select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent pr-5 outline-none [&>option]:text-ink"><option value="">{label}</option>{options.map(([o, n]) => <option key={o} value={o}>{o} ({n})</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2" /></label>;
}

/** All articles: authors at the top, then search, section, series and sort, and a calm list. */
export function ArticleLibrary({ items, authors }: { items: ACard[]; authors: Author[] }) {
  const sp = useSearchParams(); const router = useRouter();
  const get = (k: string) => sp.get(k) || "";
  const set = (k: string, v: string) => { const p = new URLSearchParams(sp.toString()); v ? p.set(k, v) : p.delete(k); router.replace(`?${p}`, { scroll: false }); };
  const [q, setQ] = useState(get("q")); const [n, setN] = useState(30);
  const author = get("author"), section = get("section"), series = get("series"), topic = get("topic"), sort = get("sort") || "new";
  useEffect(() => setN(30), [author, section, series, topic, q]);
  const count = (f: (a: ACard) => string | null | undefined) => { const m: Record<string, number> = {}; items.forEach((a) => { const v = f(a); if (v) m[v] = (m[v] || 0) + 1; }); return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])); };
  const sections = useMemo(() => count((a) => a.section), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const seriesL = useMemo(() => count((a) => a.series), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = fold(q.trim());
  const list = useMemo(() => {
    const r = items.filter((a) => (!author || a.author === author) && (!section || a.section === section) && (!series || a.series === series) && (!topic || a.topics?.includes(topic)) && (!f || fold(`${a.title} ${a.subtitle} ${a.summary} ${a.author} ${a.series} ${a.section} ${a.topics?.join(" ")} ${a.mag} ${a.issue}`).includes(f)));
    if (series) return r.sort((a, b) => (a.series_part ?? 999) - (b.series_part ?? 999));
    return sort === "old" ? [...r].reverse() : sort === "az" ? [...r].sort((a, b) => a.title.localeCompare(b.title)) : r;
  }, [items, author, section, series, topic, f, sort]);
  const au = authors.find((a) => a.name === author);
  const any = author || section || series || topic || f;

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
      {authors.length > 0 && <div className="flex gap-2 overflow-x-auto border-b border-line py-4 [scrollbar-width:none]">
        <button onClick={() => set("author", "")} className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] ${!author ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:bg-band"}`}><span className="flex size-7 items-center justify-center rounded-full bg-white/15 text-[11px]">All</span>Every author</button>
        {authors.map((a) => <button key={a.name} onClick={() => set("author", author === a.name ? "" : a.name)} className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] ${author === a.name ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:bg-band"}`}><Avatar name={a.name} photo={a.photo} size={28} />{a.name}<span className={author === a.name ? "text-white/60" : "text-ink-3"}>{a.n}</span></button>)}
      </div>}

      <div className="sticky top-[52px] z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:top-[58px] sm:-mx-6 sm:px-6">
        <label className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search titles, authors, words…" className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-8 text-[13.5px] outline-none focus:border-ink/40" />{q && <button onClick={() => { setQ(""); set("q", ""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
        <Pick label="Section" value={section} options={sections} onChange={(v) => set("section", v)} />
        <Pick label="Series" value={series} options={seriesL} onChange={(v) => set("series", v)} />
        <label className="relative flex h-9 items-center rounded-md border border-line px-2.5 text-[13px] text-ink-2"><select value={sort} onChange={(e) => set("sort", e.target.value === "new" ? "" : e.target.value)} className="appearance-none bg-transparent pr-5 outline-none"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="az">A–Z</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2" /></label>
        {any && <button onClick={() => { setQ(""); router.replace("?", { scroll: false }); }} className="h-9 px-2 text-[12.5px] text-ink-3 hover:text-ink">Reset</button>}
      </div>

      {au && <div className="mt-6 flex items-start gap-4 rounded-xl border border-line p-5"><Avatar name={au.name} photo={au.photo} size={64} /><div className="min-w-0"><p className="text-[16px] font-semibold text-ink">{au.name}</p>{au.role && <p className="text-[12.5px] text-ink-3">{au.role}</p>}{au.bio && <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">{au.bio}</p>}<Link href={`/teachings/articles/authors/${au.slug}`} className="mt-2 inline-block text-[12.5px] text-ink-2 underline underline-offset-2">Author page</Link></div></div>}

      {!any && seriesL.length > 0 && <section className="mt-8"><h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink"><Layers size={14} />Series</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{seriesL.map(([s, c]) => { const first = items.find((a) => a.series === s); return <button key={s} onClick={() => set("series", s)} className="rounded-lg border border-line p-4 text-left hover:border-line-strong"><p className="text-[14px] font-medium text-ink">{s}</p><p className="mt-0.5 text-[12px] text-ink-3">{c} parts{first?.author ? ` · ${first.author}` : ""}</p></button>; })}</div></section>}

      <p className="mb-2 mt-8 text-[12.5px] text-ink-3">{list.length.toLocaleString()} {list.length === 1 ? "article" : "articles"}{series ? ` in “${series}”, in order` : ""}</p>
      <div className="divide-y divide-line border-y border-line">{list.slice(0, n).map((a) => (
        <article key={a.slug} className="group grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_150px]">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
              {a.author && <button onClick={() => set("author", a.author!)} className="flex items-center gap-1.5 text-ink-2 hover:text-ink"><Avatar name={a.author} photo={authors.find((x) => x.name === a.author)?.photo} size={20} />{a.author}</button>}
              {a.section && <><span>·</span><button onClick={() => set("section", a.section!)} className="hover:text-ink">{a.section}</button></>}
              {a.series && <><span>·</span><button onClick={() => set("series", a.series!)} className="hover:text-ink">{a.series}{a.series_part ? `, part ${a.series_part}` : ""}</button></>}
            </div>
            <Link href={`/teachings/articles/${a.slug}`} className="block"><h2 className="text-[18px] font-semibold leading-snug tracking-[-0.01em] text-ink group-hover:underline">{a.title}</h2>{(a.summary || a.subtitle) && <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{a.summary || a.subtitle}</p>}</Link>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">{a.date && <span>{fmt(a.date)}</span>}<span className="flex items-center gap-1"><Clock size={12} />{a.minutes} min read</span>{a.mag && <Link href={`/teachings/magazines/${a.mag_slug}/${a.issue_slug}`} className="flex items-center gap-1 hover:text-ink"><Newspaper size={12} />{a.mag}{a.issue ? `, ${a.issue}` : ""}</Link>}{a.topics?.slice(0, 3).map((t) => <button key={t} onClick={() => set("topic", t)} className="rounded bg-band px-1.5 py-px text-[11px] text-ink-2 hover:bg-line">{t}</button>)}</div>
          </div>
          {a.cover && <Link href={`/teachings/articles/${a.slug}`} className="hidden sm:block">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={a.cover} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" /></Link>}
        </article>))}</div>
      {!list.length && <p className="py-16 text-center text-[13.5px] text-ink-3">{items.length ? "No article matches." : "Articles will appear here as they are published."}</p>}
      {list.length > n && <div className="mt-6 text-center"><button onClick={() => setN(n + 40)} className="h-9 rounded-md border border-line px-4 text-[13px] text-ink-2 hover:bg-band">Show more ({(list.length - n).toLocaleString()} left)</button></div>}
    </div>
  );
}
