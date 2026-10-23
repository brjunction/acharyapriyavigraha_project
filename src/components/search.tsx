"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, Headphones, Network, Quote, ScrollText, FileText, ArrowRight } from "lucide-react";
import { usePrefs } from "./providers";
import { LECTURES, QUOTE_CATEGORIES, TATTVA, fmtDate } from "@/lib/data";
import { MENUS } from "@/lib/nav";

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/krishna/g, "krsna").replace(/gaura|gaur/g, "gour");

type R = { href: string; label: string; kind: string; sub?: string; icon: typeof Search };

export function SearchPalette() {
  const { search, setSearch } = usePrefs();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (search) { setQ(""); setSel(0); requestAnimationFrame(() => input.current?.focus()); document.body.style.overflow = "hidden"; } else document.body.style.overflow = ""; }, [search]);

  const results = useMemo<{ title: string; items: R[] }[]>(() => {
    const n = norm(q.trim());
    const pages: R[] = MENUS.flatMap((m) => [{ href: m.href, label: m.label, kind: "Section", icon: m.icon }, ...m.groups.flatMap((g) => g.links.map((l) => ({ href: l.href, label: l.label, kind: m.label, sub: l.desc, icon: l.icon })))]);
    if (!n) return [{ title: "Go to", items: pages.filter((p) => ["/teachings/audio", "/teachings/quotes", "/gurudeva/timeline", "/gurudeva/letters", "/tattva", "/thank-list"].includes(p.href)) }];
    const out: { title: string; items: R[] }[] = [];
    if (/^(sb|bg|cc)\b/.test(n)) out.push({ title: "Verse", items: [{ href: `/search?q=${encodeURIComponent(q)}`, label: `${q.toUpperCase()}: every lecture and quote on this verse`, kind: "Verse", icon: ScrollText }] });
    const lec = LECTURES.filter((l) => norm(`${l.title} ${l.place} ${l.country} ${l.scripture ?? ""} ${l.date} ${l.topics.join(" ")}`).includes(n)).slice(0, 5)
      .map((l) => ({ href: `/teachings/audio/${l.slug}`, label: l.title, kind: "Lecture", sub: `${fmtDate(l.date)}, ${l.place}`, icon: Headphones }));
    if (lec.length) out.push({ title: "Lectures", items: lec });
    const top = TATTVA.flatMap((t) => [{ c: t.name, t }, ...t.children.map((c) => ({ c, t }))]).filter(({ c }) => norm(c).includes(n)).slice(0, 4)
      .map(({ c, t }) => ({ href: `/tattva/${t.slug}`, label: c, kind: "Topic", sub: t.name === c ? "Tattva-kośa" : t.name, icon: Network }));
    if (top.length) out.push({ title: "Topics", items: top });
    const qc = QUOTE_CATEGORIES.filter((c) => norm(c).includes(n)).slice(0, 3).map((c) => ({ href: "/teachings/quotes", label: c, kind: "Quotes", icon: Quote }));
    if (qc.length) out.push({ title: "Quote subjects", items: qc });
    const pg = pages.filter((p) => norm(p.label + " " + (p.sub ?? "")).includes(n)).slice(0, 5);
    if (pg.length) out.push({ title: "Pages", items: pg });
    out.push({ title: "Everything", items: [{ href: `/search?q=${encodeURIComponent(q)}`, label: `Search all teachings for “${q}”`, kind: "Full text", sub: "transcripts, books, letters", icon: FileText }] });
    return out;
  }, [q]);
  const flat = results.flatMap((g) => g.items);
  const go = (h: string) => { setSearch(false); router.push(h); };

  if (!search) return null;
  let idx = -1;
  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center bg-[rgb(40_18_4/0.45)] px-3 pt-[10vh] backdrop-blur-[2px]" onClick={() => setSearch(false)}>
      <div onClick={(e) => e.stopPropagation()} className="mega-enter w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search size={19} className="text-saffron" />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              if (e.key === "Enter" && flat[sel]) go(flat[sel].href);
            }}
            placeholder="Search lectures, quotes, verses, places, dates…" className="h-[60px] flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3" />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-3">Esc</kbd>
        </div>
        <div className="max-h-[56vh] overflow-y-auto p-2">
          {results.map((g) => (
            <div key={g.title} className="mb-1">
              <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">{g.title}</p>
              {g.items.map((r) => { idx++; const i = idx; const I = r.icon; return (
                <button key={r.href + r.label} onMouseEnter={() => setSel(i)} onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${sel === i ? "bg-saffron-tint" : ""}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sel === i ? "bg-saffron text-white" : "bg-band text-saffron"}`}><I size={16} strokeWidth={1.8} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14.5px] font-medium text-ink">{r.label}</span>{r.sub && <span className="block truncate text-[12.5px] text-ink-3">{r.sub}</span>}</span>
                  {sel === i ? <CornerDownLeft size={15} className="text-saffron" /> : <ArrowRight size={14} className="text-ink-3 opacity-0" />}
                </button>
              ); })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line bg-page/60 px-5 py-2.5 text-[11.5px] text-ink-3">
          <span>Spelling-tolerant: “krishna”, “gaura”, “bhubaneswar 1993”, “SB 1.2.6”</span>
          <span className="hidden sm:inline">↑ ↓ to move · Enter to open</span>
        </div>
      </div>
    </div>
  );
}
