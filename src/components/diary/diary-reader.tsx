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
const serif = {} as const;

export function DiaryReader({ entries, start, initialText }: { entries: Entry[]; start?: string; initialText?: string | null }) {
  const [cur, setCur] = useState(() => Math.max(0, entries.findIndex((e) => e.slug === start)));
  const e = entries[cur];
  const [texts, setTexts] = useState<Record<string, string | null>>(start && initialText !== undefined ? { [start]: initialText } : {});
  const asked = useRef(new Set<string>(start && initialText !== undefined ? [start] : []));
  const [q, setQ] = useState(""); const [found, setFound] = useState<{ slug: string; date: string | null; date_note: string | null; snippet: string }[] | null>(null);
  const [saved, setSaved] = useState<string[]>([]); const [copied, setCopied] = useState(false);
  const [openYear, setOpenYear] = useState<string | null>(e?.date?.slice(0, 4) || null); const [month, setMonth] = useState<string | null>(e?.date?.slice(0, 7) || null);

  // Remembered on this device: saved pages, and where the reader stopped.
  useEffect(() => { setSaved(store.get("tj_diary_saved") || []); if (!start) { const last = store.get("tj_diary_last"); const k = entries.findIndex((x) => x.slug === last); if (k > 0) setCur(k); } }, []); // eslint-disable-line
  const go = useCallback((k: number, push = true) => {
    if (k < 0 || k >= entries.length) return; setCur(k); setFound(null); setQ("");
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

  const yearList = years.filter(([y]) => y !== "Undated");
  const yEntries = years.find(([y]) => y === openYear)?.[1] || [];
  const monthsOf = MONTHS.map((_, i) => yEntries.filter((x) => x.date?.slice(5, 7) === String(i + 1).padStart(2, "0")));
  const dayList = month ? entries.filter((x) => x.date?.startsWith(month)) : [];
  const savedList = entries.filter((x) => saved.includes(x.slug));
  const [showSaved, setShowSaved] = useState(false);
  const maxM = Math.max(1, ...monthsOf.map((m) => m.length));

  return (
    <div className="bg-white pb-20 lg:pb-0">
      <div className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-6">
        <nav className="text-[12px] text-ink-3"><Link href="/gurudeva" className="hover:text-saffron">Śrīla Gurudeva</Link> <span className="mx-1">/</span> His Diary</nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-[28px] leading-tight text-ink sm:text-[34px]" style={serif}>His Diary</h1><p className="mt-1 text-[14px] text-ink-2">Prayers to Śrī Gopāl Jiu — {entries.length.toLocaleString()} pages{range ? `, ${range}` : ""}.</p></div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label className="relative flex-1 sm:w-64 sm:flex-none"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search the diary" className="h-10 w-full rounded-full border border-line-strong bg-white pl-9 pr-8 text-[13px] outline-none focus:border-saffron" />{q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
            <label className="relative" title="Go to a date"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input type="date" onChange={(x) => jumpDate(x.target.value)} className="h-10 w-[150px] rounded-full border border-line-strong bg-white pl-9 pr-2 text-[12.5px] text-ink-2 outline-none focus:border-saffron" /></label>
          </div>
        </div>
      </div>

      {/* The navigator: years, then the months of that year, then the days that have a page */}
      <div className="sticky top-[52px] z-20 mt-6 border-y border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
            {yearList.map(([y, es]) => <button key={y} onClick={() => { setOpenYear(y); setShowSaved(false); const f = es[0]; setMonth(f.date!.slice(0, 7)); }} className={`shrink-0 rounded-full px-3 py-1 text-[13px] tabular-nums transition ${openYear === y && !showSaved ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}>{y}</button>)}
            {years.some(([y]) => y === "Undated") && <button onClick={() => { setOpenYear("Undated"); setShowSaved(false); }} className={`shrink-0 rounded-full px-3 py-1 text-[13px] ${openYear === "Undated" && !showSaved ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}>Undated</button>}
            <span className="mx-1 h-5 w-px shrink-0 bg-line" />
            <button onClick={() => setShowSaved(!showSaved)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] ${showSaved ? "bg-saffron text-white" : "text-ink-2 hover:bg-band"}`}><Bookmark size={13} />Saved{saved.length ? ` ${saved.length}` : ""}</button>
          </div>
          {showSaved ? (
            <div className="flex gap-1.5 overflow-x-auto border-t border-line py-2.5 [scrollbar-width:none]">{savedList.length ? savedList.map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className={`shrink-0 rounded-full border px-3 py-1 text-[12.5px] ${x.slug === e.slug ? "border-saffron text-saffron" : "border-line text-ink-2 hover:border-line-strong"}`}>{short(x)}</button>) : <p className="py-1 text-[12.5px] text-ink-3">Save a page with the bookmark button to find it here, on this device.</p>}</div>
          ) : openYear === "Undated" ? (
            <div className="flex gap-1.5 overflow-x-auto border-t border-line py-2.5 [scrollbar-width:none]">{yEntries.map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className={`shrink-0 rounded-full border px-3 py-1 text-[12.5px] ${x.slug === e.slug ? "border-saffron text-saffron" : "border-line text-ink-2"}`}>{x.date_note || "Undated page"}</button>)}</div>
          ) : <>
            <div className="grid grid-cols-6 gap-1 border-t border-line py-2 sm:grid-cols-12">
              {monthsOf.map((ms, i) => { const key = `${openYear}-${String(i + 1).padStart(2, "0")}`; const on = month === key; return (
                <button key={i} disabled={!ms.length} onClick={() => { setMonth(key); go(at(ms[0].slug)); }} className={`group rounded-md px-1 pb-1 pt-1.5 text-center transition disabled:cursor-default ${on ? "bg-saffron-tint" : "enabled:hover:bg-band"}`}>
                  <span className={`block text-[12px] ${on ? "font-semibold text-saffron" : ms.length ? "text-ink-2" : "text-ink-3/50"}`}>{MONTHS[i].slice(0, 3)}</span>
                  <span className="mx-auto mt-1 block h-1 w-8 overflow-hidden rounded-full bg-band"><span className="block h-full rounded-full bg-saffron" style={{ width: `${(ms.length / maxM) * 100}%`, opacity: on ? 1 : 0.45 }} /></span>
                </button>); })}
            </div>
            {dayList.length > 0 && <div className="flex gap-1 overflow-x-auto border-t border-line py-2 [scrollbar-width:none]">
              {dayList.map((x) => { const d = parts(x.date!); const on = x.slug === e.slug; return <button key={x.slug} onClick={() => go(at(x.slug))} title={long(x)} className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full text-[12.5px] tabular-nums transition ${on ? "bg-saffron font-semibold text-white" : "text-ink-2 hover:bg-band"}`}>{d.d}</button>; })}
            </div>}
          </>}
        </div>
      </div>

      <main className="mx-auto max-w-[720px] px-4 pb-24 pt-10 sm:px-6">
        {found ? (
          <div>
            <p className="mb-3 text-[13px] text-ink-3">{found.length ? `${found.length >= 60 ? "First 60" : found.length} page${found.length === 1 ? "" : "s"} mention “${q}”` : `No page mentions “${q}”.`}</p>
            <div className="divide-y divide-line">{found.map((f) => <button key={f.slug} onClick={() => go(at(f.slug))} className="block w-full py-3.5 text-left"><span className="text-[13px] font-medium text-saffron">{short({ ...f, volume: null, page: null })}</span><span className="mt-1 line-clamp-2 block text-[14.5px] leading-snug text-ink-2" style={serif}>{f.snippet}</span></button>)}</div>
          </div>
        ) : (
          <article>
            <header className="flex items-center justify-between gap-3">
              <button disabled={cur === 0} onClick={() => go(cur - 1)} aria-label="Previous page" className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-strong disabled:opacity-30 sm:flex"><ChevronLeft size={18} /></button>
              <div className="flex-1 text-center">
                <p className="text-[13px] text-ink-3">{weekday(e)}</p>
                <h2 className="mt-1 text-[30px] leading-tight text-ink sm:text-[36px]" style={serif}>{long(e)}</h2>
                {e.volume && <p className="mt-1 text-[12.5px] text-ink-3">Notebook {e.volume}{e.page ? `, page ${e.page}` : ""}</p>}
              </div>
              <button disabled={cur === entries.length - 1} onClick={() => go(cur + 1)} aria-label="Next page" className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-strong disabled:opacity-30 sm:flex"><ChevronRight size={18} /></button>
            </header>
            <div className="mt-5 flex justify-center gap-1.5">
              <IconBtn onClick={toggleSave} title={isSaved ? "Saved" : "Save this page"} on={isSaved}>{isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}</IconBtn>
              <IconBtn onClick={copy} title="Copy link">{copied ? <Check size={15} /> : <Link2 size={15} />}</IconBtn>
              <IconBtn onClick={() => go(Math.floor(Math.random() * entries.length))} title="Open any page"><Shuffle size={15} /></IconBtn>
            </div>
            <div className="mt-8">
              {texts[e.slug] === undefined ? <div className="space-y-3.5">{[96, 88, 92, 70, 84, 40].map((w, k) => <span key={k} className="block h-4 animate-pulse rounded bg-band" style={{ width: `${w}%` }} />)}</div>
                : <p className="whitespace-pre-line text-[18px] leading-[1.9] text-ink" style={serif}>{texts[e.slug] || <span className="text-ink-3">The translation of this page is being prepared.</span>}</p>}
            </div>
            <nav className="mt-12 grid grid-cols-2 gap-3">
              {cur > 0 ? <button onClick={() => go(cur - 1)} className="group rounded-2xl border border-line p-4 text-left transition hover:border-line-strong"><span className="flex items-center gap-1 text-[12px] text-ink-3"><ChevronLeft size={13} />Previous</span><span className="mt-1 block text-[15px] text-ink group-hover:text-saffron" style={serif}>{long(entries[cur - 1])}</span></button> : <span />}
              {cur < entries.length - 1 && <button onClick={() => go(cur + 1)} className="group rounded-2xl border border-line p-4 text-right transition hover:border-line-strong"><span className="flex items-center justify-end gap-1 text-[12px] text-ink-3">Next<ChevronRight size={13} /></span><span className="mt-1 block text-[15px] text-ink group-hover:text-saffron" style={serif}>{long(entries[cur + 1])}</span></button>}
            </nav>
            {sameDay.length > 0 && <div className="mt-10 text-center"><p className="text-[13px] text-ink-3">The same day in other years</p><div className="mt-2 flex flex-wrap justify-center gap-1.5">{sameDay.map((x) => <button key={x.slug} onClick={() => go(at(x.slug))} className="rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-2 hover:border-saffron hover:text-saffron">{x.date!.slice(0, 4)}</button>)}</div></div>}
          </article>
        )}
      </main>

      {/* Phone: previous and next at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-white/95 px-3 py-2 backdrop-blur sm:hidden">
        <button disabled={cur === 0} onClick={() => go(cur - 1)} className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-line text-[13px] disabled:opacity-30"><ChevronLeft size={16} />Previous</button>
        <button disabled={cur === entries.length - 1} onClick={() => go(cur + 1)} className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-line text-[13px] disabled:opacity-30">Next<ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, on }: { children: React.ReactNode; onClick: () => void; title: string; on?: boolean }) {
  return <button onClick={onClick} title={title} aria-label={title} className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${on ? "border-saffron bg-saffron-tint text-saffron" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"}`}>{children}</button>;
}

