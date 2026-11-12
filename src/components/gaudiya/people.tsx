"use client";
/* A searchable list of people in groups — used for Ācāryas and Biographies. */
import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Portrait } from "./portrait";

export type Person = { slug: string; title: string; subtitle: string | null; cover: string | null; summary: string | null; books?: number };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function People({ groups, empty }: { groups: [string, Person[]][]; empty: string }) {
  const [q, setQ] = useState(""); const f = fold(q.trim());
  const shown = groups.map(([g, ps]) => [g, f ? ps.filter((p) => fold(`${p.title} ${p.subtitle || ""} ${p.summary || ""}`).includes(f)) : ps] as [string, Person[]]).filter(([, ps]) => ps.length);
  return (
    <div>
      <label className="relative mb-8 mt-6 block max-w-md"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a name" className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-10 text-[14.5px] outline-none focus:border-ink/40" />{q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" aria-label="Clear"><X size={16} /></button>}</label>
      {!shown.length && <p className="rounded-xl border border-dashed border-line p-10 text-center text-[13.5px] text-ink-3">{q ? "No one by that name yet." : empty}</p>}
      {shown.map(([g, ps]) => (
        <section key={g} className="mb-10">
          <h2 className="mb-3 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-3">{g}<span className="h-px flex-1 bg-line" /><span className="font-normal normal-case tracking-normal">{ps.length}</span></h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ps.map((p) => (
            <Link key={p.slug} href={`/gaudiya/biographies/${p.slug}`} className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-[#fff7ea]">
              <Portrait src={p.cover} name={p.title} size={52} />
              <span className="min-w-0 pt-0.5"><span className="block text-[14.5px] font-medium leading-snug text-ink group-hover:text-saffron">{p.title}</span>{p.subtitle && <span className="mt-0.5 block text-[12.5px] text-ink-3">{p.subtitle}</span>}{!!p.books && <span className="mt-1 inline-block rounded-full bg-band px-2 py-0.5 text-[11.5px] text-ink-2">{p.books} {p.books === 1 ? "book" : "books"}</span>}</span>
            </Link>))}</div>
        </section>))}
    </div>);
}
