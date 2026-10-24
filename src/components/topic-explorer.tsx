"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TATTVA } from "@/lib/data";
import { Rosette } from "./motifs";

export function TopicExplorer() {
  const [i, setI] = useState(0);
  const t = TATTVA[i];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-sm)] lg:grid-cols-[320px_minmax(0,1fr)]">
      <ul className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line p-2 lg:block lg:border-b-0 lg:border-r lg:p-3">
        {TATTVA.map((x, k) => (
          <li key={x.slug} className="shrink-0">
            <button onMouseEnter={() => setI(k)} onFocus={() => setI(k)} onClick={() => setI(k)}
              className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5 text-left transition ${k === i ? "bg-saffron text-white" : "text-ink-2 hover:bg-band"}`}>
              <span className="font-serif text-[17px] font-bold">{x.name}</span>
              <span className={`hidden text-[12px] tabular lg:inline ${k === i ? "text-white/80" : "text-ink-3"}`}>{x.count}</span>
            </button>
          </li>
        ))}
      </ul>
      <div key={t.slug} className="fade-in relative overflow-hidden p-7 sm:p-10">
        <Rosette className="spin-slow pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 text-saffron/[0.08]" />
        <p className="text-[13px] font-medium text-saffron">{t.count} passages, lectures and quotes</p>
        <h3 className="mt-1 text-[27px] leading-tight">{t.name}</h3>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {t.children.map((c) => (
            <Link key={c} href={`/tattva/${t.slug}`} className="group flex items-center justify-between rounded-xl border border-line bg-page/50 px-4 py-3 transition hover:border-saffron/50 hover:bg-saffron-tint">
              <span className="font-serif text-[17px] font-bold text-ink group-hover:text-saffron">{c}</span>
              <ArrowRight size={15} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-saffron" />
            </Link>
          ))}
        </div>
        <Link href={`/tattva/${t.slug}`} className="btn btn-primary mt-7">Open {t.name}<ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
