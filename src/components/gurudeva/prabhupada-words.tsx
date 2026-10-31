"use client";
import { useState } from "react";
import { CONVERSATION as C, LETTER as L } from "@/lib/prabhupada";

const hl = (t: string) => t.split(/(«[^»]+»)/).map((x, k) => x.startsWith("«") ? <mark key={k} className="rounded bg-[#fbf0d2] px-0.5 font-medium text-ink">{x.slice(1, -1)}</mark> : <span key={k}>{x}</span>);
/** The conversation and the letter, one at a time, as a page to read. */
export function PrabhupadaWords() {
  const [tab, setTab] = useState<"c" | "l">("c");
  return (
    <div>
      <div className="flex gap-1 border-b border-line">{([["c", "Room conversation, 1977"], ["l", "Letter, 1976"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-3 py-2 text-[13px] ${tab === k ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}>{l}</button>)}</div>
      {tab === "c" ? <div className="pt-6">
        <p className="text-[16px] font-semibold text-ink">{C.title}</p><p className="mt-0.5 text-[12.5px] text-ink-3">{C.speakers}</p>
        <div className="mt-5 space-y-3 text-[16px] leading-[1.8] text-ink-2">{C.lines.map(([w, l], i) => <p key={i}><span className={`mr-2 font-sans text-[12.5px] font-semibold ${w === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{w}</span>{hl(l)}</p>)}</div>
      </div> : <div className="pt-6">
        <p className="text-[16px] font-semibold text-ink">{L.title}</p><p className="mt-0.5 text-[12.5px] text-ink-3">Letter {L.ref}</p>
        <article className="mt-5 rounded-2xl border border-[#eadcc0] bg-[#fffdf8] p-6 text-[16px] leading-[1.85] text-ink-2 sm:p-10"><p className="mb-4">{L.salutation}</p>{L.paras.map((p, i) => <p key={i} className="mb-4">{hl(p)}</p>)}<p className="mt-6 text-ink-3">{L.closing[0]}<br />{L.closing[1]}</p></article>
      </div>}
    </div>
  );
}
