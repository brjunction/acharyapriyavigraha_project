"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PrefsRoot, ReadingMenu, ThemeButton } from "./prefs";
import { Search, X, Menu, Globe, Download, ChevronRight, Home, ScanSearch, Filter, MonitorDown, CornerDownLeft, Flower2, Headphones, FileText, Music, BookOpen, Quote, Clapperboard, Files, Newspaper, Library, type LucideIcon } from "lucide-react";
import type { FSec } from "@/lib/webfolio/data";

const ICONS: Record<string, LucideIcon> = { Flower2, Headphones, FileText, Music, BookOpen, Quote, Clapperboard, Files, Newspaper, Library, Globe };
export const SecIcon = ({ s, size = 14 }: { s: Pick<FSec, "icon" | "color">; size?: number }) => { const I = ICONS[s.icon] || FileText; return <span className="flex shrink-0 items-center justify-center rounded-lg" style={{ background: `${s.color}1f`, color: s.color, width: size + 12, height: size + 12 }}><I size={size} strokeWidth={2.1} /></span>; };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The WebFolio frame: top bar, contents on the left, the page, and “On this page” on the right. Stays mounted between pages, so moving around is instant. */
export function FolioFrame({ nav, children }: { nav: FSec[]; children: React.ReactNode }) {
  return <PrefsRoot><Inner nav={nav}>{children}</Inner></PrefsRoot>;
}
function Inner({ nav, children }: { nav: FSec[]; children: React.ReactNode }) {
  const path = usePathname(); const [menu, setMenu] = useState(false); const [search, setSearch] = useState(false); const [filter, setFilter] = useState("");
  const [sec, group] = path.split("/").slice(2);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => { if (sec) setOpen((o) => ({ ...o, [sec]: true })); setMenu(false); }, [path, sec]);
  // Remember the last page read, for “Continue reading” on the WebFolio home.
  useEffect(() => { if (!sec || sec === "search" || sec === "download") return; const t = setTimeout(() => { try { localStorage.setItem("tj_folio_last", JSON.stringify({ href: path, title: document.title.replace(/ · WebFolio$/, ""), at: Date.now() })); } catch {} }, 800); return () => clearTimeout(t); }, [path, sec]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || ((e.key === "/" || e.key === "F2") && !(e.target as HTMLElement).closest("input,textarea"))) { e.preventDefault(); setSearch(true); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const f = fold(filter.trim());
  const top = (href: string, I: LucideIcon, label: string, on: boolean) => <Link href={href} className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium transition ${on ? "bg-zinc-100 text-zinc-950" : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"}`}><I size={16} className={on ? "text-zinc-950" : "text-zinc-500"} />{label}</Link>;
  const side = (
    <nav className="flex min-h-full flex-col">
      <div className="space-y-0.5">{top("/webfolio", Home, "Home", path === "/webfolio")}{top("/webfolio/search", ScanSearch, "Research search", sec === "search")}</div>
      <div className="relative mt-4"><Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter contents" className="h-8 w-full rounded-lg border border-zinc-200 bg-white pl-7 pr-2 text-[12.5px] outline-none transition placeholder:text-zinc-400 focus:border-zinc-400" /></div>
      <p className="mb-1.5 mt-5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Contents</p>
      <div className="space-y-0.5">
      {nav.map((s) => { const gs = f ? s.groups.filter((g) => fold(`${g.title} ${s.title}`).includes(f)) : s.groups; if (f && !gs.length) return null; const isOpen = f || open[s.key] || sec === s.key; const here = sec === s.key; const total = s.groups.reduce((a, g) => a + (g.count || 0), 0); return (
        <div key={s.key}>
          <div className={`group flex h-9 items-center rounded-lg pr-1 transition ${here && !group ? "bg-zinc-100" : "hover:bg-zinc-50"}`}>
            <Link href={`/webfolio/${s.key}`} className="flex min-w-0 flex-1 items-center gap-2.5 pl-1.5"><SecIcon s={s} size={13} /><span className={`truncate text-[13.5px] ${here ? "font-semibold text-zinc-950" : "font-medium text-zinc-700"}`}>{s.title}</span></Link>
            {total > 0 && !isOpen && <span className="mr-1 text-[11px] tabular-nums text-zinc-400">{total.toLocaleString()}</span>}
            <button onClick={() => setOpen((o) => ({ ...o, [s.key]: !isOpen }))} aria-label={isOpen ? "Close" : "Open"} className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-900"><ChevronRight size={14} className={`transition ${isOpen ? "rotate-90" : ""}`} /></button>
          </div>
          {isOpen && <div className="relative mb-1 ml-[18px] mt-0.5 border-l border-zinc-200 pl-2">
            {gs.map((g) => { const on = here && group === g.key; return <Link key={g.key} href={`/webfolio/${s.key}/${g.key}`} className={`relative flex h-8 items-center justify-between gap-2 rounded-md px-2 text-[13px] transition ${on ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"}`}>{on && <span className="absolute -left-[9px] top-1.5 h-5 w-[2px] rounded-full" style={{ background: s.color }} />}<span className="truncate">{g.title}</span>{g.count ? <span className={`rounded-full px-1.5 text-[10.5px] tabular-nums ${on ? "bg-white text-zinc-700" : "text-zinc-400"}`}>{g.count.toLocaleString()}</span> : null}</Link>; })}
          </div>}
        </div>); })}
      </div>
      <Link href="/webfolio/download" className="mt-6 block rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 transition hover:border-zinc-300">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-900"><MonitorDown size={15} className="text-[#1a73e8]" />Read offline</span>
        <span className="mt-1 block text-[12px] leading-snug text-zinc-500">Install the WebFolio on Windows, Mac or your phone.</span>
      </Link>
    </nav>
  );
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <button onClick={() => setMenu(true)} className="flex size-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 lg:hidden" aria-label="Contents"><Menu size={20} /></button>
          <Link href="/webfolio" className="flex shrink-0 items-center gap-2.5 lg:w-[248px]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="size-8 rounded-lg" /><span className="leading-none"><span className="block text-[15.5px] font-semibold tracking-tight text-zinc-950">WebFolio</span><span className="mt-0.5 hidden text-[11.5px] text-zinc-500 sm:block">Taptajīvanam</span></span></Link>
          <button onClick={() => setSearch(true)} className="group mx-auto hidden h-11 w-full max-w-[600px] items-center gap-3 rounded-full border border-transparent bg-zinc-100 px-4 text-left text-[14px] text-zinc-500 transition hover:border-zinc-200 hover:bg-white hover:shadow-[0_1px_6px_rgba(32,33,36,.18)] md:flex"><Search size={18} className="text-zinc-500" /><span className="flex-1">Search every word of the WebFolio</span><kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">Ctrl K</kbd></button>
          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <button onClick={() => setSearch(true)} className="flex size-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 md:hidden" aria-label="Search"><Search size={18} /></button>
            <ReadingMenu /><ThemeButton />
            <Link href="/webfolio/download" className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-[#1a73e8] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1765cc] sm:flex"><Download size={15} />Install</Link>
            <Link href="/" title="Back to the website" className="flex size-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100"><Globe size={17} /></Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1520px]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-64px)] w-[288px] shrink-0 overflow-y-auto border-r border-zinc-200 px-3 py-5 [scrollbar-width:thin] lg:block">{side}</aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {menu && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMenu(false)}><aside className="folio-drawer h-full w-[86%] max-w-[330px] overflow-y-auto bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><b className="text-[15px] text-zinc-950">Contents</b><button onClick={() => setMenu(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-zinc-100"><X size={18} /></button></div>{side}</aside></div>}
      {search && <SearchDialog nav={nav} onClose={() => setSearch(false)} />}
    </>
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
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,.35)]">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4"><Search size={16} className="text-zinc-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); } if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { onClose(); router.push(`/webfolio/search?q=${encodeURIComponent(q)}`); return; } if (e.key === "Enter") go(flat[sel]); }} placeholder="Search every word — lectures, books, diary, quotes…" className="h-12 flex-1 bg-transparent text-[14px] outline-none" />
          {busy && <span className="text-[11.5px] text-zinc-400">Searching…</span>}<kbd className="rounded border border-zinc-200 px-1.5 text-[11px] text-zinc-400">Esc</kbd></div>
        <div className="flex-1 overflow-y-auto p-2">
          {!q && <p className="p-6 text-center text-[13px] text-zinc-500">Type a word or a phrase. Diacritics are not needed: “krsna” finds “Kṛṣṇa”.</p>}
          {q.length > 1 && res && !flat.length && <p className="p-6 text-center text-[13px] text-zinc-500">Nothing found for “{q}”.</p>}
          {all.map((g) => <div key={g.title} className="mb-2"><p className="px-2 py-1.5 text-[11.5px] font-medium text-zinc-400">{g.title}</p>
            {g.hits.map((h) => { const i = flat.indexOf(h); return <button key={h.href + i} onMouseEnter={() => setSel(i)} onClick={() => go(h)} className={`block w-full rounded-lg px-3 py-2 text-left ${i === sel ? "bg-zinc-100" : ""}`}>
              <p className="text-[13.5px] font-medium text-zinc-900"><Mark text={h.title} q={q} />{h.sub && <span className="ml-2 text-[11.5px] font-normal text-zinc-500">{h.sub}</span>}</p>
              {h.snippet && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-600"><Mark text={h.snippet} q={q} /></p>}</button>; })}</div>)}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[12px] text-zinc-500"><span className="hidden items-center gap-1.5 sm:flex"><kbd className="rounded border border-zinc-200 bg-white px-1">↑</kbd><kbd className="rounded border border-zinc-200 bg-white px-1">↓</kbd> move <kbd className="ml-2 rounded border border-zinc-200 bg-white px-1"><CornerDownLeft size={11} className="inline" /></kbd> open</span>
          <Link href={`/webfolio/search${q ? `?q=${encodeURIComponent(q)}` : ""}`} onClick={onClose} className="ml-auto inline-flex items-center gap-1.5 font-medium text-[#1a73e8] hover:underline"><ScanSearch size={14} />Research search{q ? ` for “${q}”` : ""} <span className="hidden text-zinc-400 sm:inline">Ctrl ↵</span></Link></div>
      </div>
    </div>
  );
}
