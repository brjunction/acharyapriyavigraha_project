"use client";
/* The Gauḍīya library, browsed the Harināmāmṛta-vyākaraṇam way (its LibraryBrowser, as it is):
   section tabs, categories as cards with a tinted header that open and close, views By section / By ācārya / A–Z, search, Expand all / Collapse all. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronsDownUp, ChevronsUpDown, Layers, Search, X } from "lucide-react";
import Select from "@/components/hnv/select";

export type LibBook = { slug: string; href: string; title: string; titleDeva: string; author: string; chapters: number; category: string; section: string; order: number; language: string; subject?: string | null; kind?: string };
const LANG: Record<string, string> = { en: "English", hi: "Hindi · हिन्दी", or: "Odia · ଓଡ଼ିଆ", bn: "Bengali · বাংলা", sa: "Sanskrit · संस्कृतम्", ru: "Russian" };
type View = "category" | "sections" | "author" | "subject" | "language" | "kind" | "az";
export type Cat = { slug: string; name: string; description: string | null; parent: string | null; position: number };
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function BookRow({ b, sub }: { b: LibBook; sub?: string }) {
  const ready = b.chapters > 0; const line = sub ?? b.author;
  return (
    <li><Link href={b.href} className={`lib-book ${ready ? "ready" : ""}`}>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2"><span className="font-medium">{b.title}</span>{b.titleDeva && <span className="font-devanagari text-sm text-[var(--fg-muted)]">{b.titleDeva}</span>}</span>
        {line && <span className="block truncate text-xs text-[var(--fg-muted)]">{line}</span>}
      </span>
      {ready ? <span className="lib-ready" title={`${b.chapters} chapters`}><BookOpen size={11} /> {b.chapters}</span> : <span className="shrink-0 text-[11px] text-[var(--fg-muted)]">Soon</span>}
    </Link></li>);
}
function CategoryCard({ name, books, open, onToggle }: { name: string; books: LibBook[]; open: boolean; onToggle: () => void }) {
  return (
    <div className="lib-cat">
      <button type="button" onClick={onToggle} aria-expanded={open} className="lib-cat-head"><span className="min-w-0 flex-1 truncate">{name}</span><span className="text-xs font-normal tabular-nums text-[var(--fg-muted)]">{books.length}</span><ChevronDown size={15} className={`shrink-0 text-[var(--fg-muted)] transition-transform ${open ? "rotate-180" : ""}`} /></button>
      {open && <ul className="grid p-1.5 sm:grid-cols-2">{books.map((b) => <BookRow key={b.slug} b={b} />)}</ul>}
    </div>);
}

export default function LibraryBrowser({ books, label = "Library", allLabel = "Everything", storeKey = "tj:gaudiya", categories = [], defaultView = "sections" }: { books: LibBook[]; label?: string; allLabel?: string; storeKey?: string; categories?: Cat[]; defaultView?: View }) {
  const [view, setView] = useState<View>(categories.length ? defaultView : "sections"); const [q, setQ] = useState(""); const [sec, setSec] = useState(""); const [cat, setCat] = useState("all"); const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const tree = useMemo(() => {
    const secs: { name: string; order: number; cats: { name: string; order: number; books: LibBook[] }[] }[] = [];
    for (const b of books) { const sName = b.section || "Other", cName = b.category || "Other"; let s = secs.find((x) => x.name === sName); if (!s) secs.push((s = { name: sName, order: b.order, cats: [] })); s.order = Math.min(s.order, b.order);
      let c = s.cats.find((x) => x.name === cName); if (!c) s.cats.push((c = { name: cName, order: b.order, books: [] })); c.order = Math.min(c.order, b.order); c.books.push(b); }
    for (const s of secs) { s.cats.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)); for (const c of s.cats) c.books.sort((a, b) => a.title.localeCompare(b.title)); }
    return secs.sort((a, b) => a.order - b.order);
  }, [books]);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(storeKey) ?? "{}"); if (["category", "sections", "author", "subject", "language", "kind", "az"].includes(v.view) && (v.view !== "category" || categories.length)) setView(v.view); if (v.sec && (v.sec === "all" || tree.some((s) => s.name === v.sec))) setSec(v.sec); } catch {} }, [tree, storeKey, categories.length]);
  const current = sec || (tree.length > 1 ? "all" : tree[0]?.name) || "all";
  const remember = (p: { view?: View; sec?: string }) => { try { localStorage.setItem(storeKey, JSON.stringify({ view, sec: current, ...p })); } catch {} };
  const pickSec = (s: string) => { setSec(s); setCat("all"); setOpenCats(new Set()); remember({ sec: s }); };
  const f = plain(q.trim()); const matches = useMemo(() => (f ? books.filter((b) => plain(`${b.title} ${b.titleDeva} ${b.author} ${b.category} ${b.section} ${b.subject || ""}`).includes(f)) : []), [books, f]);
  const shownSecs = current === "all" ? tree : tree.filter((s) => s.name === current); const catOptions = current === "all" ? [] : tree.find((s) => s.name === current)?.cats ?? [];
  const allKeys = view === "sections" ? shownSecs.flatMap((s) => s.cats.map((c) => `${s.name}::${c.name}`)) : [];
  const isOpen = (key: string, i: number) => openCats.has(key) || (!openCats.has(`-${key}`) && (cat !== "all" || current !== "all" || i < 2));
  const toggleCat = (key: string, i: number) => setOpenCats((o) => { const n = new Set(o); if (isOpen(key, i)) { n.delete(key); n.add(`-${key}`); } else { n.add(key); n.delete(`-${key}`); } return n; });
  const flat = (list: LibBook[], by: Exclude<View, "sections">) => { const m = new Map<string, LibBook[]>(); for (const b of list) { const k = by === "author" ? b.author || "Unknown author" : by === "subject" ? (() => { const c = categories.find((x) => x.slug === b.subject); const p = c?.parent ? categories.find((x) => x.slug === c.parent) : null; return c ? (p ? `${p.name} › ${c.name}` : c.name) : "Not yet in a category"; })() : by === "language" ? LANG[b.language] || b.language.toUpperCase() : by === "kind" ? b.kind || "Books" : (plain(b.title)[0] ?? "#").toUpperCase(); m.set(k, [...(m.get(k) ?? []), b]); } return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])); };
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-lg font-semibold">{label} <span className="text-sm font-normal text-[var(--fg-muted)]">· {books.length} books</span></h2>
        <label className="ui-trigger w-full sm:w-64 !pr-2"><Search size={14} className="text-[var(--fg-muted)]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a book or ācārya" className="dict-noring min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Search the library" />{q && <button type="button" onClick={() => setQ("")} aria-label="Clear" className="text-[var(--fg-muted)]"><X size={14} /></button>}</label>
        <Select value={view} onChange={(v) => { setView(v as View); remember({ view: v as View }); }} icon={<Layers size={15} />} label="View" width={240} align="right" searchable={false} options={[...(categories.length ? [{ value: "category", label: "By category" }] : []), { value: "sections", label: "By section" }, { value: "author", label: "Groups by ācārya" }, { value: "subject", label: "Groups by subject (category)" }, { value: "language", label: "Groups by language" }, { value: "kind", label: "Groups by kind (books, scriptures, songs)" }, { value: "az", label: "A–Z" }]} />
      </div>
      {!books.length ? <p className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--fg-muted)]">The books are being added.</p>
      : f ? (matches.length ? <div className="lib-cat"><p className="lib-cat-head !cursor-default">{matches.length} match{matches.length === 1 ? "" : "es"} for “{q}”</p><ul className="grid p-1.5 sm:grid-cols-2">{matches.map((b) => <BookRow key={b.slug} b={b} sub={[b.author, b.category].filter(Boolean).join(" · ")} />)}</ul></div>
        : <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--fg-muted)]">No book matches “{q}”.</p>)
      : view === "category" ? <CategoryIndex books={books} categories={categories} />
      : view === "sections" ? (<>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="lib-tabs" role="tablist" aria-label="Sections">
            {tree.length > 1 && <button role="tab" aria-selected={current === "all"} onClick={() => pickSec("all")}>{allLabel} <span>{books.length}</span></button>}
            {tree.map((s) => <button key={s.name} role="tab" aria-selected={current === s.name} onClick={() => pickSec(s.name)}>{s.name} <span>{s.cats.reduce((n, c) => n + c.books.length, 0)}</span></button>)}
          </div>
          <span className="ml-auto flex gap-1.5"><button type="button" onClick={() => setOpenCats(new Set(allKeys))} className="ui-btn ui-btn-sm"><ChevronsUpDown size={14} /> Expand all</button><button type="button" onClick={() => setOpenCats(new Set(allKeys.map((k) => `-${k}`)))} className="ui-btn ui-btn-sm"><ChevronsDownUp size={14} /> Collapse all</button></span>
          {catOptions.length > 1 && <Select value={cat} onChange={setCat} label="Ācārya" width={260} align="right" searchable={catOptions.length > 8} options={[{ value: "all", label: "All" }, ...catOptions.map((c) => ({ value: c.name, label: c.name, badge: String(c.books.length) }))]} />}
        </div>
        <div className="grid gap-6">{shownSecs.map((s) => (
          <div key={s.name} className="lib-sec">
            <div className="lib-sec-head"><span className="lib-sec-bar" aria-hidden /><span className="text-base font-semibold sm:text-lg">{s.name}</span><span className="text-xs tabular-nums text-[var(--fg-muted)]">{s.cats.length} {s.cats.length === 1 ? "group" : "groups"} · {s.cats.reduce((n, c) => n + c.books.length, 0)} books</span></div>
            <div className="grid gap-2.5 p-2.5 sm:p-3">{s.cats.filter((c) => cat === "all" || c.name === cat).map((c, i) => { const key = `${s.name}::${c.name}`; return <CategoryCard key={key} name={c.name} books={c.books} open={isOpen(key, i)} onToggle={() => toggleCat(key, i)} />; })}</div>
          </div>))}</div>
      </>) : (
        <div className="lib-sec"><div className="grid gap-2.5 p-2.5 sm:p-3">{flat(books, view as Exclude<View, "sections">).map(([k, list], i) => <CategoryCard key={`${view}-${k}`} name={k} books={list} open={isOpen(`${view}-${k}`, i)} onToggle={() => toggleCat(`${view}-${k}`, i)} />)}</div></div>
      )}
    </section>);
}

/** The library index, category by category (as in Gauḍīya Grantha Mandira): each category with a line about it, its subcategories and its books. */
function CategoryIndex({ books, categories }: { books: LibBook[]; categories: Cat[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const tops = categories.filter((c) => !c.parent).sort((a, b) => a.position - b.position);
  const subs = (p: string) => categories.filter((c) => c.parent === p).sort((a, b) => a.position - b.position);
  const inCat = (slug: string) => books.filter((b) => b.subject === slug || subs(slug).some((x) => x.slug === b.subject));
  const loose = books.filter((b) => !b.subject || !categories.some((c) => c.slug === b.subject));
  return (
    <div className="lib-sec">
      <div className="lib-sec-head"><span className="lib-sec-bar" aria-hidden /><span className="text-base font-semibold sm:text-lg">Library index</span><span className="text-xs tabular-nums text-[var(--fg-muted)]">{books.length} texts in {tops.length} categories</span></div>
      <div className="grid gap-2.5 p-2.5 sm:p-3">
        {tops.map((c) => { const xs = inCat(c.slug); const ss = subs(c.slug); const on = open === c.slug; return (
          <div key={c.slug} className="lib-cat">
            <button type="button" onClick={() => setOpen(on ? null : c.slug)} aria-expanded={on} className="lib-cat-head !items-start">
              <span className="min-w-0 flex-1"><span className="block">{c.name}</span>{c.description && <span className="block text-[12.5px] font-normal text-[var(--fg-muted)]">{c.description}</span>}
                {ss.length > 0 && <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] font-normal text-[var(--fg-muted)]">Subcategories »{ss.map((x) => <span key={x.slug} className="text-[var(--fg)]">{x.name}{x.description ? ` (${x.description})` : ""}</span>)}</span>}</span>
              <span className="pt-0.5 text-xs font-normal tabular-nums text-[var(--fg-muted)]">{xs.length}</span><ChevronDown size={15} className={`mt-0.5 shrink-0 text-[var(--fg-muted)] transition-transform ${on ? "rotate-180" : ""}`} />
            </button>
            {on && (xs.length ? <div className="p-1.5">{[{ slug: c.slug, name: "" }, ...ss].map((x) => { const ys = books.filter((b) => b.subject === x.slug); return ys.length ? <div key={x.slug}>{x.name && <p className="px-2.5 pb-0.5 pt-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-muted)]">{x.name}</p>}<ul className="grid sm:grid-cols-2">{ys.map((b) => <BookRow key={b.slug} b={b} />)}</ul></div> : null; })}</div>
              : <p className="px-4 py-3 text-[13px] text-[var(--fg-muted)]">No texts in this category yet.</p>)}
          </div>); })}
        {loose.length > 0 && <CategoryCard name="Not yet in a category" books={loose} open={open === "-"} onToggle={() => setOpen(open === "-" ? null : "-")} />}
      </div>
    </div>);
}
