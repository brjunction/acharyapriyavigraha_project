"use client";
/* His Diary — a calm reader: dates on the left, one page at a time on the right. */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Search, X, Bookmark, BookmarkCheck, Link2, Check, CalendarDays, Shuffle } from "lucide-react";

export type Entry = { slug: string; date: string | null; date_note: string | null; volume: string | null; page: string | null };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["S", "M", "T", "W", "T", "F", "S"];
const store = { get: (k: string) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }, set: (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const parts = (d: string) => { const [y, m, dd] = d.split("-").map(Number); return { y, m, d: dd, wd: new Date(Date.UTC(y, m - 1, dd)).getUTCDay() }; };
const long = (e: Entry) => (e.date ? (({ y, m, d }) => `${d} ${MONTHS[m - 1]} ${y}`)(parts(e.date)) : e.date_note || "Undated");
const short = (e: Entry) => (e.date ? (({ y, m, d }) => `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`)(parts(e.date)) : e.date_note || "Undated");
const weekday = (e: Entry) => (e.date ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parts(e.date).wd] : "");
const serif = { fontFamily: "var(--font-reading-serif)" } as const;

export function DiaryReader({ entries, start, initialText }: { entries: Entry[]; start?: string; initialText?: string | null }) {
  const [cur, setCur] = useState(() => Math.max(0, entries.findIndex((e) => e.slug === start)));
  const e = entries[cur];
  const [texts, setTexts] = useState<Record<string, string | null>>(start && initialText !== undefined ? { [start]: initialText } : {});
  const asked = useRef(new Set<string>(start && initialText !== undefined ? [start] : []));
  const [q, setQ] = useState(""); const [found, setFound] = useState<{ slug: string; date: string | null; date_note: string | null; snippet: string }[] | null>(null);
  const [saved, setSaved] = useState<string[]>([]); const [tab, setTab] = useState<"dates" | "saved">("dates"); const [drawer, setDrawer] = useState(false); const [copied, setCopied] = useState(false);
  const [openYear, setOpenYear] = useState<string | null>(e?.date?.slice(0, 4) || null); const [month, setMonth] = useState<string | null>(e?.date?.slice(0, 7) || null);

  // Remembered on this device: saved pages, and where the reader stopped.
  useEffect(() => { setSaved(store.get("tj_diary_saved") || []); if (!start) { const last = store.get("tj_diary_last"); const k = entries.findIndex((x) => x.slug === last); if (k > 0) setCur(k); } }, []); // eslint-disable-line
  const go = useCallback((k: number, push = true) => {
    if (k < 0 || k >= entries.length) return; setCur(k); setDrawer(false); setFound(null); setQ("");
    const x = entries[k]; if (x.date) { setOpenYear(x.date.slice(0, 4)); setMonth(x.date.slice(0, 7)); }
    if (push) history.pushState(null, "", `/gurudeva/diaries/${x.slug}`); window.scrollTo({ top: 0, behavior: "smooth" });
  }, [entries]);
  useEffect(() => { const f = () => { const sl = location.pathname.split("/").pop(); const k = entries.findIndex((x) => x.slug === sl); if (k >= 0) go(k, false); }; window.addEventListener("popstate", f); return () => window.removeEventListener("popstate", f); }, [entries, go]);
  // Texts of this page and its neighbours.
  useEffect(() => {
    if (!e) return; store.set("tj_diary_last", e.slug); document.title = `His Diary, ${long(e)} · Taptajīvanam`;
    const want = entries.slice(Math.max(0, cur - 2), cur + 4).map((x) => x.slug).filter((s) => !asked.current.has(s)); if (!want.length) return; want.forEach((s) => asked.current.add(s));
    fetch(`/api/diary?slugs=${want.map(encodeURIComponent).join(",")}`).then((r) => r.json()).then((rows: { slug: string; translation: string | null }[]) => setTexts((t) => { const n = { ...t }; want.forEach((s) => (n[s] = rows.find((r) => r.slug === s)?.translation ?? null)); return n; })).catch(() => want.forEach((s) => asked.current.delete(s)));
  }, [cur, e, entries]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if ((ev.target as HTMLElement).closest("input,textarea")) return; if (ev.key === "ArrowRight" || ev.key === "j") go(cur + 1); if (ev.key === "ArrowLeft" || ev.key === "k") go(cur - 1); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [cur, go]);
  useEffect(() => { const w = q.trim(); if (w.length < 2) { setFound(null); return; } const t = setTimeout(() => fetch(`/api/diary?q=${encodeURIComponent(w)}`).then((r) => r.json()).then(setFound).catch(() => setFound([])), 250); return () => clearTimeout(t); }, [q]);

  const years = useMemo(() => { const m = new Map<string, Entry[]>(); entries.forEach((x) => { const y = x.date ? x.date.slice(0, 4) : "Undated"; m.set(y, [...(m.get(y) || []), x]); }); return [...m.entries()]; }, [entries]);
  const at = (slug: string) => entries.findIndex((x) => x.slug === slug);
  const isSaved = !!e && saved.includes(e.slug);
  const toggleSave = () => { if (!e) return; const n = isSaved ? saved.filter((x) => x !== e.slug) : [...saved, e.slug]; setSaved(n); store.set("tj_diary_saved", n); };
  const copy = () => { navigator.clipboard?.writeText(`${location.origin}/gurudeva/diaries/${e.slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const jumpDate = (d: string) => { if (!d) return; const k = entries.findIndex((x) => x.date && x.date >= d); go(k >= 0 ? k : entries.length - 1); };
  const sameDay = e?.date ? entries.filter((x) => x.slug !== e.slug && x.date?.slice(5) === e.date!.slice(5)) : [];
  const span = years.filter(([y]) => y !== "Undated"); const range = span.length ? `${span[0][0]}–${span[span.length - 1][0]}` : "";

  if (!entries.length) return (
    <div className="mx-auto max-w-[760px] px-5 py-20 text-center"><h1 className="text-[26px] text-ink" style={serif}>His Diary</h1><p className="mt-3 text-[14px] text-ink-2">Throughout his life Śrīla Gurudeva wrote to his beloved Deity, Śrī Gopāl Jiu. The English translations of his diary will appear here, page by page.</p></div>
  );

  const side = (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-line px-3">
        {([["dates", "Dates"], ["saved", `Saved${saved.length ? ` (${saved.length})` : ""}`]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-2 py-2.5 text-[12.5px] ${tab === k ? "border-saffron font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}>{l}</button>)}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
        {tab === "saved" ? (saved.length ? entries.filter((x) => saved.includes(x.slug)).map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${x.slug === e.slug ? "bg-saffron-tint text-saffron" : "text-ink-2 hover:bg-band"}`}><BookmarkCheck size={13} className="text-saffron" />{short(x)}</button>)
          : <p className="px-2 py-4 text-[12.5px] leading-relaxed text-ink-3">Pages you save appear here, on this device.</p>)
        : years.map(([y, es]) => (
          <div key={y}>
            <button onClick={() => setOpenYear(openYear === y ? null : y)} className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] ${openYear === y ? "font-semibold text-ink" : "text-ink-2 hover:bg-band"}`}>
              <ChevronDown size={14} className={`text-ink-3 transition ${openYear === y ? "" : "-rotate-90"}`} /><span className="flex-1 tabular-nums">{y}</span><span className="text-[11.5px] font-normal text-ink-3">{es.length}</span></button>
            {openYear === y && (y === "Undated" ? <div className="mb-1 ml-5">{es.map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className={`block w-full rounded px-2 py-1 text-left text-[12.5px] ${x.slug === e.slug ? "bg-saffron-tint text-saffron" : "text-ink-2 hover:bg-band"}`}>{x.date_note || "Undated page"}</button>)}</div> : (
              <div className="mb-1 ml-5">{MONTHS.map((mn, i) => { const key = `${y}-${String(i + 1).padStart(2, "0")}`; const ms = es.filter((x) => x.date?.startsWith(key)); if (!ms.length) return null; return (
                <div key={key}>
                  <button onClick={() => setMonth(month === key ? null : key)} className={`flex w-full items-center rounded px-2 py-1 text-left text-[12.5px] ${month === key ? "text-ink" : "text-ink-2 hover:bg-band"}`}><span className="flex-1">{mn}</span><span className="text-[11px] text-ink-3">{ms.length}</span></button>
                  {month === key && <MonthGrid y={Number(y)} m={i + 1} entries={ms} current={e.slug} onPick={(sl) => go(at(sl))} />}
                </div>); })}</div>))}
          </div>))}
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line py-5">
          <div>
            <nav className="text-[12px] text-ink-3"><Link href="/gurudeva" className="hover:text-saffron">Śrīla Gurudeva</Link> <span className="mx-1">/</span> His Diary</nav>
            <h1 className="mt-1.5 text-[24px] leading-tight text-ink" style={serif}>His Diary</h1>
            <p className="mt-0.5 text-[12.5px] text-ink-3">Prayers to Śrī Gopāl Jiu · {entries.length.toLocaleString()} pages{range ? ` · ${range}` : ""}</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label className="relative flex-1 sm:w-72 sm:flex-none"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search the diary" className="h-9 w-full rounded-lg border border-line-strong bg-white pl-9 pr-8 text-[13px] outline-none focus:border-saffron" />
              {q && <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
            <label className="relative hidden sm:block" title="Go to a date"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input type="date" min={entries.find((x) => x.date)?.date || undefined} onChange={(x) => jumpDate(x.target.value)} className="h-9 rounded-lg border border-line-strong bg-white pl-9 pr-2 text-[13px] text-ink-2 outline-none focus:border-saffron" /></label>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden border-r border-line lg:block"><div className="sticky top-[58px] h-[calc(100dvh-58px)]">{side}</div></aside>

          <main className="min-w-0 px-0 pb-24 pt-6 lg:px-12 lg:pt-8">
            {found ? (
              <div className="mx-auto max-w-[720px]">
                <p className="mb-3 text-[12.5px] text-ink-3">{found.length ? `${found.length >= 60 ? "First 60" : found.length} page${found.length === 1 ? "" : "s"} mention “${q}”` : `No page mentions “${q}”.`}</p>
                <div className="divide-y divide-line rounded-xl border border-line">{found.map((f) => (
                  <button key={f.slug} onClick={() => go(at(f.slug))} className="block w-full px-4 py-3 text-left hover:bg-band/60"><span className="text-[12.5px] font-medium text-saffron">{short({ ...f, volume: null, page: null })}</span><span className="mt-0.5 line-clamp-2 block text-[13.5px] leading-snug text-ink-2">{f.snippet}</span></button>))}</div>
              </div>
            ) : (
              <article className="mx-auto max-w-[680px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">{weekday(e)}{e.volume ? ` · Notebook ${e.volume}${e.page ? `, page ${e.page}` : ""}` : ""}</p>
                    <h2 className="mt-1 text-[26px] leading-tight text-ink sm:text-[28px]" style={serif}>{long(e)}</h2>
                  </div>
                  <div className="flex shrink-0 gap-1 pt-1">
                    <IconBtn onClick={toggleSave} title={isSaved ? "Saved" : "Save this page"} on={isSaved}>{isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}</IconBtn>
                    <IconBtn onClick={copy} title="Copy link">{copied ? <Check size={16} /> : <Link2 size={16} />}</IconBtn>
                    <IconBtn onClick={() => go(Math.floor(Math.random() * entries.length))} title="Any page"><Shuffle size={16} /></IconBtn>
                  </div>
                </div>
                <div className="mt-6 border-t border-line pt-6">
                  {texts[e.slug] === undefined ? <div className="space-y-3">{[96, 88, 92, 70, 84, 40].map((w, k) => <span key={k} className="block h-3.5 animate-pulse rounded bg-band" style={{ width: `${w}%` }} />)}</div>
                    : <p className="whitespace-pre-line text-[17px] leading-[1.85] text-ink" style={serif}>{texts[e.slug] || <span className="text-ink-3">The translation of this page is being prepared.</span>}</p>}
                </div>
                <nav className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-5">
                  {cur > 0 ? <button onClick={() => go(cur - 1)} className="group rounded-xl border border-line p-3 text-left transition hover:border-saffron"><span className="flex items-center gap-1 text-[11.5px] text-ink-3"><ChevronLeft size={13} />Previous page</span><span className="mt-0.5 block text-[14px] font-medium text-ink group-hover:text-saffron">{short(entries[cur - 1])}</span></button> : <span />}
                  {cur < entries.length - 1 && <button onClick={() => go(cur + 1)} className="group rounded-xl border border-line p-3 text-right transition hover:border-saffron"><span className="flex items-center justify-end gap-1 text-[11.5px] text-ink-3">Next page<ChevronRight size={13} /></span><span className="mt-0.5 block text-[14px] font-medium text-ink group-hover:text-saffron">{short(entries[cur + 1])}</span></button>}
                </nav>
                {sameDay.length > 0 && <div className="mt-8"><p className="text-[12px] font-medium text-ink-3">The same day in other years</p><div className="mt-2 flex flex-wrap gap-1.5">{sameDay.map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className="rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-2 hover:border-saffron hover:text-saffron">{short(x)}</button>)}</div></div>}
                <p className="mt-8 text-[11.5px] text-ink-3">Page {cur + 1} of {entries.length}. Use ← and → to move between pages.</p>
              </article>
            )}
          </main>
        </div>
      </div>

      {/* Phone: dates in a drawer, previous/next at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <button disabled={cur === 0} onClick={() => go(cur - 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={18} /></button>
        <button onClick={() => setDrawer(true)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-line text-[13px] font-medium"><CalendarDays size={15} className="text-saffron" />{short(e)}</button>
        <button disabled={cur === entries.length - 1} onClick={() => go(cur + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line disabled:opacity-30" aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
      {drawer && <div className="fixed inset-0 z-[60] bg-black/30 lg:hidden" onClick={() => setDrawer(false)}>
        <div className="absolute inset-x-0 bottom-0 h-[75dvh] rounded-t-2xl bg-white shadow-2xl" onClick={(x) => x.stopPropagation()}>
          <div className="flex items-center justify-between px-4 pt-3"><p className="text-[14px] font-semibold">Choose a date</p><button onClick={() => setDrawer(false)} className="p-1"><X size={18} /></button></div>
          <div className="h-[calc(75dvh-44px)]">{side}</div>
        </div>
      </div>}
    </div>
  );
}

function IconBtn({ children, onClick, title, on }: { children: React.ReactNode; onClick: () => void; title: string; on?: boolean }) {
  return <button onClick={onClick} title={title} aria-label={title} className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${on ? "border-saffron bg-saffron-tint text-saffron" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"}`}>{children}</button>;
}

/** A small calendar of one month: days with a page are clickable. */
function MonthGrid({ y, m, entries, current, onPick }: { y: number; m: number; entries: Entry[]; current: string; onPick: (slug: string) => void }) {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const byDay = new Map(entries.map((x) => [parts(x.date!).d, x]));
  return (
    <div className="mx-1 mb-2 mt-1 rounded-lg border border-line p-2">
      <div className="grid grid-cols-7 text-center text-[10px] text-ink-3">{WD.map((d, i) => <span key={i} className="py-0.5">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => { const x = byDay.get(i + 1); const on = x?.slug === current; return x
          ? <button key={i} onClick={() => onPick(x.slug)} className={`h-7 rounded-md text-[11.5px] font-semibold tabular-nums transition ${on ? "bg-saffron text-white" : "bg-saffron-tint text-saffron hover:bg-saffron hover:text-white"}`}>{i + 1}</button>
          : <span key={i} className="flex h-7 items-center justify-center text-[11.5px] tabular-nums text-ink-3/50">{i + 1}</span>; })}
      </div>
    </div>
  );
}
