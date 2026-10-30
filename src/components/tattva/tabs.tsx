"use client";
import { Children, isValidElement, useState } from "react";

/** Quotes | Lectures | Videos | Articles for one topic. */
export function TopicTabs({ tabs, children }: { tabs: { id: string; label: string; n: number }[]; children: React.ReactNode }) {
  const [on, setOn] = useState(tabs[0]?.id);
  return (
    <div className="mt-6">
      <div className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">{tabs.map((t) => <button key={t.id} onClick={() => setOn(t.id)} className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-[13px] transition ${on === t.id ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}>{t.label}<span className="ml-1.5 rounded bg-band px-1.5 py-px text-[11px] tabular-nums text-ink-3">{t.n}</span></button>)}</div>
      <div className="mt-4">{Children.toArray(children).map((c) => isValidElement<{ "data-tab": string }>(c) ? <div key={c.props["data-tab"]} hidden={c.props["data-tab"] !== on}>{c}</div> : null)}</div>
    </div>
  );
}
