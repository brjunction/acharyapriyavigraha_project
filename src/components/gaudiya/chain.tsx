"use client";
/* The Guru-paramparā as one gentle descending line: each ācārya appears as you scroll, the line draws itself, and every name opens his page. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Portrait } from "./portrait";

export type Link_ = { slug: string; title: string; subtitle: string | null; summary: string | null; cover: string | null; section: string | null };
export function Chain({ items, sections }: { items: Link_[]; sections: Record<string, string> }) {
  const root = useRef<HTMLOListElement>(null); const [seen, setSeen] = useState<Set<string>>(new Set()); const [prog, setProg] = useState(0);
  useEffect(() => {
    const els = root.current?.querySelectorAll("[data-slug]") || [];
    const io = new IntersectionObserver((es) => setSeen((s) => { const n = new Set(s); es.forEach((e) => e.isIntersecting && n.add((e.target as HTMLElement).dataset.slug!)); return n; }), { rootMargin: "0px 0px -12% 0px" });
    els.forEach((e) => io.observe(e));
    const sc = () => { const r = root.current?.getBoundingClientRect(); if (!r) return; setProg(Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / r.height))); };
    sc(); addEventListener("scroll", sc, { passive: true }); return () => { io.disconnect(); removeEventListener("scroll", sc); };
  }, []);
  let last = "";
  return (
    <ol ref={root} className="relative mx-auto max-w-[760px] pb-10">
      <span aria-hidden className="absolute bottom-0 left-[27px] top-0 w-px bg-line sm:left-1/2" />
      <span aria-hidden className="absolute left-[27px] top-0 w-px origin-top bg-gradient-to-b from-saffron/70 to-[#d99a4e] transition-[height] duration-300 sm:left-1/2" style={{ height: `${prog * 100}%` }} />
      {items.map((a, i) => { const head = a.section && a.section !== last ? sections[a.section] : null; last = a.section || last; const right = i % 2 === 1; const on = seen.has(a.slug); const end = i === items.length - 1;
        return (<li key={a.slug} id={a.slug} data-slug={a.slug} className="scroll-mt-32">
          {head && <div className="relative z-10 my-8 flex justify-start pl-14 sm:justify-center sm:pl-0"><span className="rounded-full border border-saffron/30 bg-[#fff7ea] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-saffron">{head}</span></div>}
          <div className={`relative flex items-center py-3 transition-all duration-700 ease-out sm:py-4 ${on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} ${right ? "sm:flex-row-reverse" : ""}`}>
            <Link href={`/gaudiya/acharyas/${a.slug}`} className="relative z-10 shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2" aria-label={a.title}><span className={`block rounded-full transition duration-500 hover:scale-105 ${end ? "ring-[6px] ring-saffron/25" : ""}`}><Portrait src={a.cover} name={a.title} size={end ? 64 : 54} ring /></span></Link>
            <Link href={`/gaudiya/acharyas/${a.slug}`} className={`group ml-4 min-w-0 flex-1 rounded-xl p-3 transition hover:bg-[#fff7ea] sm:ml-0 sm:w-[calc(50%-56px)] sm:flex-none ${right ? "sm:mr-auto sm:text-right" : "sm:ml-auto"}`}>
              <span className={`block font-semibold leading-snug text-ink group-hover:text-saffron ${end ? "text-[18px]" : "text-[15.5px]"}`}>{a.title}</span>
              {a.subtitle && <span className="mt-0.5 block text-[12.5px] text-ink-3">{a.subtitle}</span>}
              {a.summary && <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-ink-2">{a.summary}</span>}
            </Link>
          </div>
        </li>); })}
    </ol>);
}
