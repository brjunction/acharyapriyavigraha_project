"use client";
/* The Guru-paramparā as in Harināmāmṛta-vyākaraṇam (its AcaryaList, as it is): a vertical line of succession with numbers, or the same names A–Z.
   Added here: the section names along the line, and each name opens his biography. */
import Link from "next/link";
import { useState } from "react";

export type Link_ = { slug: string; title: string; subtitle: string | null; summary: string | null; cover: string | null; section: string | null };
export function Chain({ items, sections }: { items: Link_[]; sections: Record<string, string> }) {
  const [view, setView] = useState<"parampara" | "az">("parampara");
  const list = view === "az" ? [...items].sort((a, b) => a.title.replace(/^Śrī(la)?\s+/, "").localeCompare(b.title.replace(/^Śrī(la)?\s+/, ""))) : items;
  let last = "";
  return (
    <div>
      <div className="lib-tabs mb-6" role="tablist" aria-label="Order">
        <button role="tab" aria-selected={view === "parampara"} onClick={() => setView("parampara")}>Disciplic succession</button>
        <button role="tab" aria-selected={view === "az"} onClick={() => setView("az")}>A–Z</button>
      </div>
      <ol className={view === "parampara" ? "acarya-line" : "grid gap-2 sm:grid-cols-2"}>
        {list.map((i, n) => { const head = view === "parampara" && i.section && i.section !== last ? sections[i.section] : null; if (view === "parampara") last = i.section || last;
          return (
            <li key={i.slug} id={i.slug} className="scroll-mt-28">
              {head && <p className="relative z-[1] mb-1 mt-3 pl-11 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-saffron)] first:mt-0">{head}</p>}
              <Link href={`/gaudiya/biographies/${i.slug}`} className="acarya-row lift">
                {view === "parampara" && <span className="acarya-dot">{n + 1}</span>}
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-medium">{i.title}</span>
                  {i.subtitle && <span className="block text-xs text-[var(--fg-muted)]">{i.subtitle}</span>}
                </span>
                <span className="ml-auto shrink-0 text-xs text-[var(--accent)]">Read →</span>
              </Link>
            </li>); })}
      </ol>
    </div>);
}
