"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Search, X, PanelLeftClose, PanelLeft, ArrowUp, ArrowDown, Loader2, FileText, Folder, Headphones, BookOpen, Quote, Clapperboard, Globe } from "lucide-react";
import { MiniPlayer } from "@/components/lecture";

type T = { id: string; title: string; sub?: string; leaf?: boolean; count?: number };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’'`]/g, "").toLowerCase();
const icon = (id: string) => id.startsWith("a:") ? <Headphones className="size-3.5" /> : id.startsWith("bn:") || id.startsWith("book:") ? <BookOpen className="size-3.5" /> : id.startsWith("ex") ? <Quote className="size-3.5" /> : id.startsWith("v") ? <Clapperboard className="size-3.5" /> : id.startsWith("p:") ? <FileText className="size-3.5" /> : <Folder className="size-3.5" />;

function Node({ n, depth, current, open, toggle }: { n: T; depth: number; current: string; open: Record<string, boolean>; toggle: (id: string) => void }) {
  const [kids, setKids] = useState<T[] | null>(null); const isOpen = !!open[n.id];
  useEffect(() => { if (isOpen && !kids) fetch(`/api/folio/tree?id=${encodeURIComponent(n.id)}`).then((r) => r.json()).then(setKids).catch(() => setKids([])); }, [isOpen, kids, n.id]);
  const leaf = n.leaf || (kids !== null && !kids.length && !n.id.startsWith("sec:"));
  return (
    <div>
      <div className={`group flex min-h-[30px] items-center rounded-md pr-1 text-[12.5px] ${current === n.id ? "bg-[#853500]/10 font-medium text-[#6b2a00]" : "text-zinc-700 hover:bg-zinc-100"}`} style={{ paddingLeft: 4 + depth * 12 }}>
        <button onClick={() => toggle(n.id)} aria-label="Open" className={`flex size-5 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 ${leaf ? "invisible" : ""}`}><ChevronRight className={`size-3.5 transition ${isOpen ? "rotate-90" : ""}`} /></button>
        <Link href={`/webfolio?n=${encodeURIComponent(n.id)}`} className="flex min-w-0 flex-1 items-center gap-1.5 py-1 leading-snug"><span className="shrink-0 text-zinc-400">{icon(n.id)}</span><span className="min-w-0 flex-1"><span className="line-clamp-2">{n.title}</span>{n.sub && <span className="block truncate text-[11.5px] font-normal text-zinc-400">{n.sub}</span>}</span>{n.count ? <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">{n.count}</span> : null}</Link>
      </div>
      {isOpen && (kids ? kids.map((k) => <Node key={k.id} n={k} depth={depth + 1} current={current} open={open} toggle={toggle} />) : <p className="flex items-center gap-1.5 py-1 text-[11.5px] text-zinc-400" style={{ paddingLeft: 30 + depth * 12 }}><Loader2 className="size-3 animate-spin" />Loading…</p>)}
    </div>
  );
}

/** Highlights every match of the search words in the document, ignoring diacritics. */
function useHighlight(q: string | null, dep: string) {
  const [marks, setMarks] = useState<HTMLElement[]>([]); const [i, setI] = useState(0);
  useEffect(() => {
    const root = document.querySelector(".folio-doc"); if (!root) return;
    root.querySelectorAll("mark.fhl").forEach((m) => m.replaceWith(document.createTextNode(m.textContent || ""))); root.normalize();
    const f = q ? fold(q.trim()) : ""; if (f.length < 2) { setMarks([]); return; }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes: Text[] = []; while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const found: HTMLElement[] = [];
    for (const t of nodes) {
      const s = t.data; let folded = "", map: number[] = [];
      for (let k = 0; k < s.length; k++) { const c = fold(s[k]); for (let x = 0; x < c.length; x++) { folded += c[x]; map.push(k); } }
      const hits: [number, number][] = []; let p = folded.indexOf(f); while (p >= 0) { hits.push([map[p], map[p + f.length - 1] + 1]); p = folded.indexOf(f, p + f.length); }
      if (!hits.length) continue; let node = t; let offset = 0;
      for (const [a, b] of hits) { const r = node.splitText(a - offset); const after = r.splitText(b - a); const m = document.createElement("mark"); m.className = "fhl rounded bg-amber-200 px-0.5 text-inherit"; m.textContent = r.data; r.replaceWith(m); found.push(m); node = after; offset = b; }
    }
    setMarks(found); setI(0); if (found[0]) found[0].scrollIntoView({ block: "center" });
  }, [q, dep]);
  const go = (d: number) => { if (!marks.length) return; const n = (i + d + marks.length) % marks.length; marks.forEach((m) => m.classList.remove("ring-2", "ring-[#853500]")); marks[n].classList.add("ring-2", "ring-[#853500]"); marks[n].scrollIntoView({ block: "center", behavior: "smooth" }); setI(n); };
  return { count: marks.length, i, go };
}

export function FolioShell({ sections, current, children }: { sections: T[]; current: string; children: React.ReactNode }) {
  const router = useRouter(); const sp = useSearchParams(); const hl = sp.get("hl");
  const [open, setOpen] = useState<Record<string, boolean>>({}); const [side, setSide] = useState(true); const [srch, setSrch] = useState(false);
  useEffect(() => { try { setOpen(JSON.parse(localStorage.getItem("folio_open") || "{}")); } catch {} if (window.innerWidth < 768) setSide(false); }, []);
  useEffect(() => { if (window.innerWidth < 768) setSide(false); }, [current]);
  const toggle = useCallback((id: string) => setOpen((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem("folio_open", JSON.stringify(n)); } catch {} return n; }), []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "F2" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); setSrch(true); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const h = useHighlight(hl, current);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "F3" || (e.key === "Enter" && (e.target as HTMLElement).tagName !== "INPUT" && h.count)) { e.preventDefault(); h.go(e.shiftKey ? -1 : 1); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [h]);
  return (
    <div className="flex h-dvh flex-col bg-white text-zinc-900">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 px-3 sm:px-4">
        <button onClick={() => setSide(!side)} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Contents">{side ? <PanelLeftClose className="size-5" /> : <PanelLeft className="size-5" />}</button>
        <Link href="/webfolio" className="flex shrink-0 items-center gap-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="size-8 rounded-lg" /><span className="leading-tight"><b className="block text-[13px]">WebFolio</b><span className="hidden text-[11.5px] text-zinc-500 sm:block">Taptajīvanam archive</span></span></Link>
        <button onClick={() => setSrch(true)} className="ml-auto flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 text-[12.5px] sm:h-9 sm:max-w-md sm:px-3 sm:text-[13px] text-zinc-500 shadow-xs hover:bg-zinc-100"><Search className="size-4" /><span className="flex-1 truncate text-left">Search every word…</span><kbd className="hidden rounded sm:inline border border-zinc-300 bg-white px-1.5 text-[11px] font-medium">F2</kbd></button>
        {hl && <div className="hidden items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-[12px] md:flex"><span className="text-zinc-500">“{hl}”</span><b className="tabular-nums">{h.count ? `${h.i + 1}/${h.count}` : "0"}</b><button onClick={() => h.go(-1)} className="rounded p-0.5 hover:bg-zinc-100"><ArrowUp className="size-3.5" /></button><button onClick={() => h.go(1)} className="rounded p-0.5 hover:bg-zinc-100"><ArrowDown className="size-3.5" /></button><button onClick={() => router.push(`/webfolio?n=${encodeURIComponent(current)}`)} className="rounded p-0.5 hover:bg-zinc-100"><X className="size-3.5" /></button></div>}
        <Link href="/" className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] text-zinc-600 hover:bg-zinc-100 sm:flex"><Globe className="size-4" />Website</Link>
      </header>
      <div className="flex min-h-0 flex-1">
        {side && <button aria-label="Close contents" onClick={() => setSide(false)} className="fixed inset-0 top-14 z-20 bg-black/20 md:hidden" />}
        {side && <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50/60 p-2 max-md:fixed max-md:bottom-0 max-md:top-14 max-md:left-0 max-md:z-30 max-md:w-[85vw] max-md:bg-white max-md:shadow-xl">
          <p className="px-2 pb-1 pt-2 text-[11.5px] font-medium uppercase tracking-wide text-zinc-400">Contents</p>
          {sections.map((s) => <Node key={s.id} n={s} depth={0} current={current} open={open} toggle={toggle} />)}
        </aside>}
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-10 sm:py-10">{children}</main>
      </div>
      {srch && <SearchDialog onClose={() => setSrch(false)} onPick={(id, q) => { setSrch(false); router.push(`/webfolio?n=${encodeURIComponent(id)}&hl=${encodeURIComponent(q)}`); }} />}
      <MiniPlayer />
    </div>
  );
}

function Snip({ text, q }: { text: string; q: string }) {
  const f = fold(q.trim()); if (f.length < 2) return <>{text}</>;
  let folded = "", map: number[] = []; for (let k = 0; k < text.length; k++) { const c = fold(text[k]); for (let x = 0; x < c.length; x++) { folded += c[x]; map.push(k); } }
  const out: React.ReactNode[] = []; let last = 0, p = folded.indexOf(f);
  while (p >= 0) { const a = map[p], b = map[p + f.length - 1] + 1; out.push(text.slice(last, a), <mark key={a} className="rounded bg-amber-200 px-0.5">{text.slice(a, b)}</mark>); last = b; p = folded.indexOf(f, p + f.length); }
  out.push(text.slice(last)); return <>{out}</>;
}

function SearchDialog({ onClose, onPick }: { onClose: () => void; onPick: (id: string, q: string) => void }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState<{ total: number; groups: { title: string; hits: { id: string; title: string; sub: string; snippet: string }[] }[] } | null>(null); const [busy, setBusy] = useState(false); const [sel, setSel] = useState(0); const t = useRef<any>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  useEffect(() => { clearTimeout(t.current); if (q.trim().length < 2) { setRes(null); return; } setBusy(true); t.current = setTimeout(() => fetch(`/api/folio/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((r) => { setRes(r); setSel(0); }).finally(() => setBusy(false)), 250); }, [q]);
  const flat = res?.groups.flatMap((g) => g.hits) || [];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[8vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4"><Search className="size-4 text-zinc-400" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); } if (e.key === "Enter" && flat[sel]) onPick(flat[sel].id, q); }} placeholder="Search every word, e.g. krsna, gopal jiu, sb 1.2.6…" className="h-12 flex-1 bg-transparent text-[14px] outline-none" />{busy && <Loader2 className="size-4 animate-spin text-zinc-400" />}<kbd className="rounded border border-zinc-200 px-1.5 text-[11px] text-zinc-500">Esc</kbd></div>
        <div className="flex-1 overflow-y-auto p-2">
          {!res && <p className="p-6 text-center text-[13px] text-zinc-500">Type at least two letters. Diacritics are not needed: “krsna” finds “Kṛṣṇa”.</p>}
          {res && !res.total && <p className="p-6 text-center text-[13px] text-zinc-500">No results for “{q}”.</p>}
          {res && res.total > 0 && <p className="px-2 pb-2 text-[11.5px] text-zinc-500">{res.total} places found</p>}
          {res?.groups.map((g) => (
            <div key={g.title} className="mb-2"><p className="px-2 py-1.5 text-[11.5px] font-medium uppercase tracking-wide text-zinc-400">{g.title} · {g.hits.length}</p>
              {g.hits.map((h) => { const i = flat.indexOf(h); return (
                <button key={h.id} onMouseEnter={() => setSel(i)} onClick={() => onPick(h.id, q)} className={`block w-full rounded-lg px-3 py-2 text-left ${i === sel ? "bg-zinc-100" : ""}`}>
                  <p className="text-[13px] font-medium text-zinc-900"><Snip text={h.title} q={q} /> {h.sub && <span className="ml-1 text-[11.5px] font-normal text-zinc-500">{h.sub}</span>}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-600"><Snip text={h.snippet} q={q} /></p>
                </button>); })}
            </div>))}
        </div>
      </div>
    </div>
  );
}
