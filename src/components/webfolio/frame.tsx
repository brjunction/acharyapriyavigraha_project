"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Menu, Globe, Download, ChevronRight, Flower2, Headphones, FileText, Music, BookOpen, Quote, Clapperboard, Files, type LucideIcon } from "lucide-react";
import type { FSec } from "@/lib/webfolio/data";

const ICONS: Record<string, LucideIcon> = { Flower2, Headphones, FileText, Music, BookOpen, Quote, Clapperboard, Files };
export const SecIcon = ({ s, size = 14 }: { s: Pick<FSec, "icon" | "color">; size?: number }) => { const I = ICONS[s.icon] || FileText; return <span className="flex shrink-0 items-center justify-center rounded-md" style={{ background: `${s.color}14`, color: s.color, width: size + 10, height: size + 10 }}><I size={size} strokeWidth={2} /></span>; };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The WebFolio frame: top bar, contents on the left, the page, and “On this page” on the right. Stays mounted between pages, so moving around is instant. */
export function FolioFrame({ nav, children }: { nav: FSec[]; children: React.ReactNode }) {
  const path = usePathname(); const [menu, setMenu] = useState(false); const [search, setSearch] = useState(false); const [filter, setFilter] = useState("");
  const [sec, group] = path.split("/").slice(2);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => { if (sec) setOpen((o) => ({ ...o, [sec]: true })); setMenu(false); }, [path, sec]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea"))) { e.preventDefault(); setSearch(true); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const f = fold(filter.trim());
  const side = (
    <nav className="space-y-5 pb-10">
      <button onClick={() => setSearch(true)} className="flex h-9 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] text-zinc-500 hover:border-zinc-300"><Search size={15} /><span className="flex-1 text-left">Search WebFolio</span><kbd className="rounded border border-zinc-200 px-1.5 text-[11px]">Ctrl K</kbd></button>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter contents…" className="h-8 w-full rounded-md border border-transparent bg-zinc-100/70 px-2.5 text-[12.5px] outline-none placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white" />
      {nav.map((s) => { const gs = f ? s.groups.filter((g) => fold(`${g.title} ${s.title}`).includes(f)) : s.groups; if (f && !gs.length) return null; const isOpen = f || open[s.key] || sec === s.key; return (
        <div key={s.key}>
          <button onClick={() => setOpen((o) => ({ ...o, [s.key]: !isOpen }))} className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left">
            <SecIcon s={s} size={13} /><span className={`flex-1 text-[13px] font-semibold ${sec === s.key ? "text-zinc-950" : "text-zinc-700"}`}>{s.title}</span><ChevronRight size={14} className={`text-zinc-400 transition ${isOpen ? "rotate-90" : ""}`} />
          </button>
          {isOpen && <div className="ml-[11px] mt-1 border-l border-zinc-200 pl-2">
            <Link href={`/webfolio/${s.key}`} className={`block rounded-md px-2 py-1 text-[13px] ${sec === s.key && !group ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-600 hover:text-zinc-950"}`}>Overview</Link>
            {gs.map((g) => <Link key={g.key} href={`/webfolio/${s.key}/${g.key}`} className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 text-[13px] ${sec === s.key && group === g.key ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-600 hover:text-zinc-950"}`}><span className="truncate">{g.title}</span>{g.count ? <span className="text-[11px] tabular-nums text-zinc-400">{g.count}</span> : null}</Link>)}
          </div>}
        </div>); })}
    </nav>
  );
  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur">
        <button onClick={() => setMenu(true)} className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden" aria-label="Contents"><Menu size={20} /></button>
        <Link href="/webfolio" className="flex items-center gap-2.5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="size-7 rounded-md" /><span className="text-[15px] font-semibold tracking-tight">WebFolio</span></Link>
        <span className="hidden text-zinc-300 sm:block">/</span><span className="hidden text-[13px] text-zinc-500 sm:block">Taptajīvanam</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setSearch(true)} className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden" aria-label="Search"><Search size={18} /></button>
          <Link href="/webfolio/download" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-100"><Download size={15} /><span className="hidden sm:inline">Download</span></Link>
          <Link href="/" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-100"><Globe size={15} /><span className="hidden sm:inline">Website</span></Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[280px] shrink-0 overflow-y-auto border-r border-zinc-100 px-4 py-5 [scrollbar-width:thin] lg:block">{side}</aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {menu && <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMenu(false)}><aside className="h-full w-[85%] max-w-[320px] overflow-y-auto bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><b className="text-[15px]">Contents</b><button onClick={() => setMenu(false)}><X size={18} /></button></div>{side}</aside></div>}
      {search && <SearchDialog nav={nav} onClose={() => setSearch(false)} />}
    </div>
  );
}

type Hit = { href: string; title: string; sub?: string; snippet?: string };
function Mark({ text, q }: { text: string; q: string }) {
  const f = fold(q.trim()); if (f.length < 2 || !text) return <>{text}</>;
  let folded = ""; const map: number[] = []; for (let k = 0; k < text.length; k++) { const c = fold(text[k]); for (let x = 0; x < c.length; x++) { folded += c[x]; map.push(k); } }
  const out: React.ReactNode[] = []; let last = 0, p = folded.indexOf(f);
  while (p >= 0) { const a = map[p], b = map[p + f.length - 1] + 1; out.push(text.slice(last, a), <mark key={a} className="rounded bg-amber-100 px-0.5 text-inherit">{text.slice(a, b)}</mark>); last = b; p = folded.indexOf(f, p + f.length); }
  out.push(text.slice(last)); return <>{out}</>;
}
function SearchDialog({ nav, onClose }: { nav: FSec[]; onClose: () => void }) {
  const router = useRouter(); const [q, setQ] = useState(""); const [res, setRes] = useState<{ title: string; hits: Hit[] }[] | null>(null); const [busy, setBusy] = useState(false); const [sel, setSel] = useState(0); const t = useRef<any>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  useEffect(() => { clearTimeout(t.current); if (q.trim().length < 2) { setRes(null); return; } setBusy(true); t.current = setTimeout(() => fetch(`/api/webfolio/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((r) => { setRes(r.groups); setSel(0); }).catch(() => setRes([])).finally(() => setBusy(false)), 220); }, [q]);
  const f = fold(q.trim());
  const quick: Hit[] = useMemo(() => (f.length < 1 ? [] : nav.flatMap((s) => [{ href: `/webfolio/${s.key}`, title: s.title, sub: "Section" }, ...s.groups.map((g) => ({ href: `/webfolio/${s.key}/${g.key}`, title: g.title, sub: s.title }))]).filter((h) => fold(`${h.title} ${h.sub}`).includes(f)).slice(0, 6)), [f, nav]);
  const all = [...(quick.length ? [{ title: "Go to", hits: quick }] : []), ...(res || [])]; const flat = all.flatMap((g) => g.hits);
  const go = (h?: Hit) => { if (!h) return; onClose(); router.push(h.href); };
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-[10vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4"><Search size={16} className="text-zinc-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); } if (e.key === "Enter") go(flat[sel]); }} placeholder="Search every word — lectures, books, diary, quotes…" className="h-12 flex-1 bg-transparent text-[14px] outline-none" />
          {busy && <span className="text-[11.5px] text-zinc-400">Searching…</span>}<kbd className="rounded border border-zinc-200 px-1.5 text-[11px] text-zinc-400">Esc</kbd></div>
        <div className="flex-1 overflow-y-auto p-2">
          {!q && <p className="p-6 text-center text-[13px] text-zinc-500">Type a word or a phrase. Diacritics are not needed: “krsna” finds “Kṛṣṇa”.</p>}
          {q.length > 1 && res && !flat.length && <p className="p-6 text-center text-[13px] text-zinc-500">Nothing found for “{q}”.</p>}
          {all.map((g) => <div key={g.title} className="mb-2"><p className="px-2 py-1.5 text-[11.5px] font-medium text-zinc-400">{g.title}</p>
            {g.hits.map((h) => { const i = flat.indexOf(h); return <button key={h.href + i} onMouseEnter={() => setSel(i)} onClick={() => go(h)} className={`block w-full rounded-lg px-3 py-2 text-left ${i === sel ? "bg-zinc-100" : ""}`}>
              <p className="text-[13.5px] font-medium text-zinc-900"><Mark text={h.title} q={q} />{h.sub && <span className="ml-2 text-[11.5px] font-normal text-zinc-500">{h.sub}</span>}</p>
              {h.snippet && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-600"><Mark text={h.snippet} q={q} /></p>}</button>; })}</div>)}
        </div>
      </div>
    </div>
  );
}
