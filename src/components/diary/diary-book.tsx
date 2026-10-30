"use client";
/* His Diary — prayers to Śrī Gopāl Jiu. A leather diary that opens, with pages that turn. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, List, Search, X, BookOpen, Share2, Bookmark, BookmarkCheck, Shuffle, History, CalendarDays } from "lucide-react";

/** The index of the diary: the texts are fetched page by page as the reader turns them. */
export type Entry = { slug: string; date: string | null; date_note: string | null; volume: string | null; page: string | null };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const store = { get: (k: string) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }, set: (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const longDate = (e: Entry) => (e.date ? new Date(e.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : e.date_note || "");
const PAPER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .32 0 0 0 0 .16 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E")`;
const LEATHER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='l'%3E%3CfeTurbulence type='turbulence' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .22 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23l)'/%3E%3C/svg%3E")`;

function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M60 64C49 50 49 26 60 8c11 18 11 42 0 56Z" /><path d="M60 64C44 58 34 42 34 22c14 6 24 22 26 42Z" /><path d="M60 64c16-6 26-22 26-42-14 6-24 22-26 42Z" />
      <path d="M58 65C40 66 20 58 10 44c18-2 36 6 48 21Z" /><path d="M62 65c18 1 38-7 48-21-18-2-36 6-48 21Z" /><path d="M30 68h60" strokeLinecap="round" />
    </svg>
  );
}

function PageFace({ e, side, n, text }: { e?: Entry; side: "left" | "right"; n: number; text?: string | null }) {
  if (!e) return <div className={`diary-paper flex h-full items-center justify-center ${side === "left" ? "diary-left" : "diary-right"}`}><Lotus className="h-6 w-12 text-[#d9c39a]" /></div>;
  return (
    <div className={`diary-paper relative flex h-full flex-col ${side === "left" ? "diary-left" : "diary-right"}`}>
      <div className="diary-lines pointer-events-none absolute inset-x-[9%] bottom-[9%] top-[15%]" />
      <header className="relative px-[9%] pt-[7%]"><p className="diary-date">{longDate(e)}</p></header>
      <div className="diary-ink relative min-h-0 flex-1 overflow-y-auto px-[9%] pb-[12%] pt-3" key={e.slug}>
        {text === undefined ? <div className="space-y-3 pt-2" aria-label="Loading">{[92, 80, 88, 60].map((w, k) => <span key={k} className="block h-3 rounded bg-[#ecdcbb]" style={{ width: `${w}%` }} />)}</div>
          : <p className="diary-text whitespace-pre-line">{text || <span className="opacity-60">The translation of this page is being prepared.</span>}</p>}
      </div>
      <footer className="pointer-events-none absolute inset-x-0 bottom-[4%] flex items-center justify-center gap-2 text-[#a07a45]"><Lotus className="h-3 w-6" /><span className="diary-folio">{n}</span><Lotus className="h-3 w-6" /></footer>
    </div>
  );
}

export function DiaryBook({ entries, start = 0 }: { entries: Entry[]; start?: number }) {
  const empty = entries.length === 0;
  const [open, setOpen] = useState(start > 0); const [opening, setOpening] = useState(false);
  const [two, setTwo] = useState(true);
  const step = two ? 2 : 1;
  const [i, setI] = useState(Math.max(0, Math.min(entries.length - 1, start))); const [turn, setTurn] = useState<null | { dir: 1 | -1; to: number }>(null);
  const [toc, setToc] = useState(false); const [q, setQ] = useState(""); const [found, setFound] = useState<{ slug: string; date: string | null; date_note: string | null; snippet: string }[] | null>(null);
  const [texts, setTexts] = useState<Record<string, string | null>>({}); const asked = useRef(new Set<string>());
  const [saved, setSaved] = useState<string[]>([]); const [lastSlug, setLastSlug] = useState<string | null>(null);
  useEffect(() => { setSaved(store.get("tj_diary_saved") || []); setLastSlug(store.get("tj_diary_last")); }, []);
  const reduce = useRef(false); const touch = useRef<number | null>(null);
  useEffect(() => { reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; const m = window.matchMedia("(min-width: 768px)"); const f = () => setTwo(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  // On a two-page spread the left page is always an even entry.
  useEffect(() => { if (two && i % 2) setI(i - 1); }, [two, i]);
  const snap = useCallback((k: number) => (two ? k - (k % 2) : k), [two]);
  const go = useCallback((raw: number) => {
    const to = snap(raw);
    if (turn || to < 0 || to >= entries.length || to === i) return;
    if (reduce.current || !two || Math.abs(to - i) > step) { setI(to); return; }
    setTurn({ dir: to > i ? 1 : -1, to }); setTimeout(() => { setI(to); setTurn(null); }, 950);
  }, [turn, i, entries.length, snap, two, step]);
  // Fetch the texts around the open page (a few ahead, a few behind).
  useEffect(() => {
    if (!open || empty) return;
    const want = entries.slice(Math.max(0, i - 4), i + 8).map((e) => e.slug).filter((sl) => !asked.current.has(sl));
    if (!want.length) return; want.forEach((sl) => asked.current.add(sl));
    fetch(`/api/diary?slugs=${want.map(encodeURIComponent).join(",")}`).then((r) => r.json()).then((rows: { slug: string; translation: string | null }[]) => setTexts((t) => { const n = { ...t }; want.forEach((sl) => (n[sl] = rows.find((r) => r.slug === sl)?.translation ?? null)); return n; })).catch(() => want.forEach((sl) => asked.current.delete(sl)));
    store.set("tj_diary_last", entries[i]?.slug);
  }, [i, open, entries, empty]);
  // Search the whole diary on the server.
  useEffect(() => { const w = q.trim(); if (w.length < 2) { setFound(null); return; } const t = setTimeout(() => fetch(`/api/diary?q=${encodeURIComponent(w)}`).then((r) => r.json()).then(setFound).catch(() => setFound([])), 250); return () => clearTimeout(t); }, [q]);
  const isSaved = (sl?: string) => !!sl && saved.includes(sl);
  const toggleSave = (sl?: string) => { if (!sl) return; const n = saved.includes(sl) ? saved.filter((x) => x !== sl) : [...saved, sl]; setSaved(n); store.set("tj_diary_saved", n); };
  const at = (slug: string) => entries.findIndex((e) => e.slug === slug);
  const jump = (k: number) => { if (k < 0) return; setToc(false); if (!open) { setI(snap(k)); setOpen(true); window.scrollTo({ top: 0 }); } else go(k); };
  useEffect(() => { if (!open || empty) return; const u = new URL(location.href); u.searchParams.set("e", entries[i]?.slug || ""); history.replaceState(null, "", u.toString()); }, [i, open, entries, empty]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if (!open || (ev.target as HTMLElement).tagName === "INPUT") return; if (ev.key === "ArrowRight") go(i + step); if (ev.key === "ArrowLeft") go(i - step); if (ev.key === "Escape") setToc(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, go, i, step]);
  const years = useMemo(() => { const m = new Map<string, number>(); entries.forEach((e, k) => { const y = e.date ? e.date.slice(0, 4) : "—"; if (!m.has(y)) m.set(y, k); }); return [...m.entries()]; }, [entries]);
  const doOpen = () => { if (empty) return; if (reduce.current) { setOpen(true); return; } setOpening(true); setTimeout(() => { setOpen(true); setOpening(false); }, 1300); };
  const L = (k: number) => entries[k]; const R = (k: number) => (two ? entries[k + 1] : undefined);
  // What sits underneath while a sheet turns.
  const leftIdx = turn?.dir === -1 ? turn.to : i; const rightIdx = turn?.dir === 1 ? turn.to : i;
  const last = entries.length - 1;
  const tx = (e?: Entry) => (e ? texts[e.slug] : null);

  return (
    <section className="diary-stage relative">
      <style>{CSS}</style>
      <div className="relative mx-auto flex min-h-[calc(100vh-58px)] max-w-[1180px] flex-col items-center justify-center px-3 py-8 sm:px-4 sm:py-10">
        {!open ? (
          <div className="flex flex-col items-center">
            <p className="diary-kicker">Śrī Śrīmad Gour Govinda Swāmī Gurudeva</p>
            <div className={`diary-cover-wrap ${opening ? "is-opening" : ""}`} onClick={doOpen} role="button" tabIndex={0} onKeyDown={(k) => k.key === "Enter" && doOpen()} aria-label="Open the diary">
              <div className="diary-cover" style={{ backgroundImage: `${LEATHER}, radial-gradient(120% 90% at 30% 20%, #7a2a1c, #4a140c 60%, #2e0a05)` }}>
                <div className="diary-cover-frame"><Lotus className="diary-emblem" />
                  <h1 className="diary-cover-title">His Diary</h1><p className="diary-cover-sub">Prayers to Śrī Gopāl Jiu</p>
                  <span className="diary-cover-rule" /><p className="diary-cover-count">{empty ? "Pages coming soon" : `${entries.length} pages`}</p></div>
                <span className="diary-strap" />
              </div>
              <div className="diary-pages-edge" />
              <span className="diary-ribbon" />
            </div>
            {empty ? <p className="mt-12 max-w-md text-center text-[13px] text-[#6b4a26]">Throughout his life Śrīla Gurudeva wrote to his beloved Deity. The English translations of his diary will appear here, page by page.</p>
              : <><button onClick={doOpen} className="diary-open-btn"><BookOpen size={16} />Open the diary</button>
                <p className="mt-3 max-w-md text-center text-[13px] text-[#6b4a26]">Throughout his life Śrīla Gurudeva wrote to his beloved Deity. Turn the pages slowly.</p>
                <DiaryIndex entries={entries} saved={saved} last={lastSlug} onOpen={(sl) => jump(at(sl))} onSearch={() => { setOpen(true); setToc(true); }} /></>}
          </div>
        ) : (
          <>
            <div className="mb-4 flex w-full max-w-[1100px] flex-wrap items-center gap-2 text-[12.5px]">
              <button onClick={() => setOpen(false)} className="diary-chip" title="Back to the cover and index"><BookOpen size={14} />Index</button>
              <button onClick={() => setToc(true)} className="diary-chip"><List size={14} />Contents &amp; search</button>
              <button onClick={() => toggleSave(entries[i]?.slug)} className={`diary-chip ${isSaved(entries[i]?.slug) ? "is-on" : ""}`} title="Keep this page in your saved pages">{isSaved(entries[i]?.slug) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}<span className="max-sm:hidden">{isSaved(entries[i]?.slug) ? "Saved" : "Save page"}</span></button>
              <button onClick={() => jump(Math.floor(Math.random() * entries.length))} className="diary-chip" title="Open any page"><Shuffle size={14} /></button>
              <span className="text-[#8a6237] max-md:hidden">{entries[i]?.volume ? `Notebook ${entries[i].volume}` : ""}</span>
              <span className="ml-auto text-[#6b4a26]">{two && R(i) ? `Pages ${i + 1}–${i + 2}` : `Page ${i + 1}`} of {entries.length}</span>
              <button onClick={() => { navigator.clipboard?.writeText(`${location.origin}/gurudeva/diaries/${entries[i].slug}`); }} className="diary-chip" title="Copy a link to this page"><Share2 size={14} /></button>
            </div>

            <div className="diary-book-wrap" onTouchStart={(t) => (touch.current = t.touches[0].clientX)} onTouchEnd={(t) => { if (touch.current === null) return; const d = t.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(i + (d < 0 ? step : -step)); touch.current = null; }}>
              <div className="diary-book">
                <div className="diary-spine" aria-hidden />
                <div className="diary-half diary-half-l"><PageFace e={L(leftIdx)} text={tx(L(leftIdx))} side="left" n={leftIdx + 1} /></div>
                {two && <div className="diary-half diary-half-r"><PageFace e={R(rightIdx)} text={tx(R(rightIdx))} side="right" n={rightIdx + 2} /></div>}
                {turn && <div className={`diary-sheet ${turn.dir === 1 ? "turn-next" : "turn-prev"}`}>
                  <div className="diary-face front">{turn.dir === 1 ? <PageFace e={R(i)} text={tx(R(i))} side="right" n={i + 2} /> : <PageFace e={L(i)} text={tx(L(i))} side="left" n={i + 1} />}</div>
                  <div className="diary-face back">{turn.dir === 1 ? <PageFace e={L(turn.to)} text={tx(L(turn.to))} side="left" n={turn.to + 1} /> : <PageFace e={R(turn.to)} text={tx(R(turn.to))} side="right" n={turn.to + 2} />}</div>
                </div>}
              </div>
              <button onClick={() => go(i - step)} disabled={i === 0} className="diary-arrow left-0 -translate-x-1/2" aria-label="Previous page"><ChevronLeft size={20} /></button>
              <button onClick={() => go(i + step)} disabled={i + step > last} className="diary-arrow right-0 translate-x-1/2" aria-label="Next page"><ChevronRight size={20} /></button>
            </div>

            <div className="mt-7 w-full max-w-[1100px]">
              {years.length > 1 && <div className="diary-years">{years.map(([y, k], n) => { const end = years[n + 1]?.[1] ?? entries.length; const on = i >= k && i < end; return <button key={y} onClick={() => go(k)} className={on ? "is-on" : ""} style={{ flexGrow: Math.max(1, end - k) }}><span>{y}</span></button>; })}</div>}
              {entries.length > 1 && <input type="range" min={0} max={last} step={step} value={i} onChange={(ev) => setI(snap(Number(ev.target.value)))} className="diary-range" aria-label="Move through the diary" />}
            </div>
          </>
        )}
      </div>

      {toc && <div className="fixed inset-0 z-[60] flex bg-[#2a1406]/40" onMouseDown={(ev) => ev.target === ev.currentTarget && setToc(false)}>
        <aside className="diary-toc">
          <div className="flex items-center justify-between"><p className="text-[15px] font-bold text-[#5a1d14]">Contents</p><button onClick={() => setToc(false)} className="rounded-full p-1.5 hover:bg-[#efe1c4]"><X size={17} /></button></div>
          <div className="relative mt-3"><Search size={14} className="absolute left-3 top-2.5 text-[#a07a45]" /><input autoFocus value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Search the diary" className="h-9 w-full rounded-full border border-[#e2cfa6] bg-[#fffaf0] pl-9 pr-3 text-[13px] outline-none focus:border-[#a0522d]" /></div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {found ? found.map((f) => (
              <button key={f.slug} onClick={() => jump(at(f.slug))} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f4e6c8]"><span className="block text-[12px] italic text-[#8a6237]">{longDate({ ...f, volume: null, page: null })}</span><span className="line-clamp-2 text-[12.5px] text-[#3a2410]">{f.snippet}</span></button>))
            : entries.map((x, k, arr) => { const y = x.date ? x.date.slice(0, 4) : "Undated"; const showY = k === 0 || (arr[k - 1].date || "").slice(0, 4) !== (x.date || "").slice(0, 4); const here = k === i || (two && k === i + 1); return (
              <div key={x.slug}>{showY && <p className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a0522d]">{y}</p>}
                <button onClick={() => jump(k)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left hover:bg-[#f4e6c8] ${here ? "bg-[#f1dfb8]" : ""}`}><span className="flex-1 text-[12.5px] text-[#3a2410]">{longDate(x)}</span>{isSaved(x.slug) && <BookmarkCheck size={13} className="text-[#a0522d]" />}<span className="text-[11px] text-[#a07a45]">{k + 1}</span></button></div>); })}
            {found && !found.length && <p className="p-4 text-center text-[13px] text-[#8a6237]">No page mentions “{q}”.</p>}{found && found.length > 0 && <p className="px-3 pt-2 text-[11.5px] text-[#a07a45]">{found.length >= 60 ? "First 60 pages" : `${found.length} pages`} mention “{q}”.</p>}
          </div>
        </aside>
      </div>}
    </section>
  );
}

/** Ways into the diary from the cover: continue, on this day, saved pages, and every year by month. */
function DiaryIndex({ entries, saved, last, onOpen, onSearch }: { entries: Entry[]; saved: string[]; last: string | null; onOpen: (slug: string) => void; onSearch: () => void }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { const d = new Date(); setToday(`${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); }, []);
  const byYear = useMemo(() => { const m = new Map<string, Entry[]>(); entries.forEach((e) => { const y = e.date ? e.date.slice(0, 4) : "Undated"; m.set(y, [...(m.get(y) || []), e]); }); return [...m.entries()]; }, [entries]);
  const onDay = today ? entries.filter((e) => e.date?.slice(5) === today) : [];
  const lastE = last ? entries.find((e) => e.slug === last) : null; const savedE = entries.filter((e) => saved.includes(e.slug));
  const short = (e: Entry) => (e.date ? new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : e.date_note || "Undated");
  const [yr, setYr] = useState<string | null>(null);
  return (
    <div className="mt-14 w-full max-w-[980px] text-left">
      <div className="grid gap-3 sm:grid-cols-3">
        <Way icon={History} title="Continue reading" empty="You have not opened a page yet.">{lastE && <button onClick={() => onOpen(lastE.slug)} className="diary-link">{short(lastE)}</button>}</Way>
        <Way icon={CalendarDays} title="On this day" empty="No page was written on today’s date.">{onDay.map((e) => <button key={e.slug} onClick={() => onOpen(e.slug)} className="diary-link">{short(e)}</button>)}</Way>
        <Way icon={Bookmark} title="Your saved pages" empty="Save a page while reading to find it here.">{savedE.slice(0, 6).map((e) => <button key={e.slug} onClick={() => onOpen(e.slug)} className="diary-link">{short(e)}</button>)}</Way>
      </div>
      <div className="mt-8 flex items-end justify-between gap-3 border-b border-[#ead7ae] pb-2">
        <h2 className="text-[17px] font-semibold text-[#5a1d14]" style={{ fontFamily: "var(--font-reading-serif)" }}>Every year, by month</h2>
        <button onClick={onSearch} className="diary-chip"><Search size={14} />Search the diary</button>
      </div>
      <div className="mt-3 divide-y divide-[#f1e4c8]">
        {byYear.map(([y, es]) => { const months = Array.from({ length: 12 }, (_, m) => es.filter((e) => e.date && Number(e.date.slice(5, 7)) === m + 1)); const max = Math.max(1, ...months.map((x) => x.length)); return (
          <div key={y} className="py-2">
            <div className="grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-3">
              <button onClick={() => setYr(yr === y ? null : y)} className="text-left text-[15px] font-semibold tabular-nums text-[#7a2a1c]" style={{ fontFamily: "var(--font-reading-serif)" }}>{y}</button>
              {y === "Undated" ? <button onClick={() => onOpen(es[0].slug)} className="text-left text-[12.5px] text-[#8a6237] hover:underline">Pages without a date</button> :
              <div className="grid grid-cols-12 gap-1">{months.map((ms, m) => <button key={m} disabled={!ms.length} onClick={() => onOpen(ms[0].slug)} title={ms.length ? `${MONTHS[m]} ${y}: ${ms.length} page${ms.length > 1 ? "s" : ""}` : `${MONTHS[m]} ${y}`} className="group flex flex-col items-center gap-1 disabled:cursor-default">
                <span className="h-6 w-full rounded-[4px] border border-[#ead7ae] transition group-enabled:hover:border-[#7a2a1c]" style={{ background: ms.length ? `rgba(122,42,28,${0.15 + 0.75 * (ms.length / max)})` : "transparent" }} />
                <span className="text-[9.5px] uppercase tracking-wide text-[#a07a45] max-sm:hidden">{MONTHS[m][0]}</span></button>)}</div>}
              <span className="text-right text-[12px] tabular-nums text-[#8a6237]">{es.length}</span>
            </div>
            {yr === y && <div className="ml-[76px] mt-2 flex flex-wrap gap-1.5">{es.map((e) => <button key={e.slug} onClick={() => onOpen(e.slug)} className={`rounded-full border px-2.5 py-0.5 text-[12px] ${saved.includes(e.slug) ? "border-[#7a2a1c] text-[#7a2a1c]" : "border-[#ead7ae] text-[#5a3414]"} hover:bg-[#f4e6c8]`}>{e.date ? new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : e.date_note || "—"}</button>)}</div>}
          </div>); })}
      </div>
      <p className="mt-3 text-[11.5px] text-[#a07a45]">Darker months hold more pages. Click a year to see every date in it.</p>
    </div>
  );
}
function Way({ icon: I, title, empty, children }: { icon: typeof History; title: string; empty: string; children: React.ReactNode }) {
  const has = Array.isArray(children) ? children.length > 0 : !!children;
  return <div className="rounded-2xl border border-[#ead7ae] bg-[#fffaf0] p-4"><p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#a0522d]"><I size={14} />{title}</p><div className="mt-2 flex flex-wrap gap-1.5">{has ? children : <p className="text-[12.5px] text-[#8a6237]">{empty}</p>}</div></div>;
}

const CSS = `
.diary-stage{background:#ffffff;color:#3a2410}
.diary-kicker{margin-bottom:22px;text-align:center;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#7a4a1c;font-weight:600}
.diary-cover-wrap{position:relative;width:min(340px,72vw);aspect-ratio:3/4.1;perspective:1800px;cursor:pointer;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.diary-cover-wrap:hover{transform:translateY(-6px) rotateX(4deg) rotateY(-6deg)}
.diary-cover{position:absolute;inset:0;border-radius:6px 16px 16px 6px;transform-origin:left center;transform-style:preserve-3d;box-shadow:0 2px 0 #2a0904,0 40px 60px -30px rgba(40,15,5,.85),inset 6px 0 14px rgba(0,0,0,.45),inset -2px 0 0 rgba(255,220,160,.12);z-index:2;transition:transform 1.25s cubic-bezier(.6,.05,.25,1)}
.is-opening .diary-cover{transform:rotateY(-165deg)}
.is-opening{transform:translateX(30%)!important}
.diary-cover-frame{position:absolute;inset:7%;border:1.5px solid rgba(232,190,110,.75);outline:1px solid rgba(232,190,110,.45);outline-offset:6px;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:10%}
.diary-emblem{width:46%;color:#e9be6e;filter:drop-shadow(0 1px 0 rgba(0,0,0,.5))}
.diary-cover-title{font-family:"Gentium Book Plus",Georgia,serif;font-size:clamp(34px,6vw,46px);font-weight:700;line-height:1;background:linear-gradient(180deg,#fff2c9,#e6b65c 45%,#a8701e 55%,#f3d58e);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.diary-cover-sub{font-family:"Gentium Book Plus",Georgia,serif;font-style:italic;font-size:16px;color:#e9c98a}
.diary-cover-rule{width:44%;height:1px;background:linear-gradient(90deg,transparent,#e9be6e,transparent)}
.diary-cover-count{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#cf9f5b}
.diary-strap{position:absolute;right:-6px;top:44%;width:34px;height:13%;border-radius:4px;background:linear-gradient(180deg,#5a1d14,#3a0f09);box-shadow:0 4px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,200,150,.2)}
.diary-pages-edge{position:absolute;inset:1.2% -1.4% 1.2% 1.6%;border-radius:4px 14px 14px 4px;background:repeating-linear-gradient(90deg,#f6ead0 0 2px,#e4d1a8 2px 3px);z-index:1;box-shadow:0 30px 50px -30px rgba(40,15,5,.7)}
.diary-ribbon{position:absolute;left:62%;bottom:-38px;width:14px;height:64px;background:linear-gradient(180deg,#b8862f,#8a5a14);clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%);z-index:0}
.diary-open-btn{margin-top:46px;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 22px;border-radius:999px;background:linear-gradient(180deg,#7a2a1c,#4a140c);color:#f6dca6;font-weight:600;font-size:14px;box-shadow:0 14px 30px -14px rgba(60,20,5,.9),inset 0 1px 0 rgba(255,220,170,.25);transition:transform .25s}
.diary-open-btn:hover{transform:translateY(-2px)}
.diary-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;background:#fffaf0;border:1px solid #dcc394;color:#5a3414;font-weight:500}
.diary-chip:hover,.diary-chip.is-on{background:#5a1d14;color:#f6dca6;border-color:#5a1d14}
.diary-book-wrap{position:relative;width:min(1100px,100%);animation:diaryIn .9s cubic-bezier(.2,.8,.2,1)}
@keyframes diaryIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.diary-book{position:relative;display:grid;grid-template-columns:1fr 1fr;height:min(74vh,720px);perspective:2600px;filter:drop-shadow(0 36px 40px rgba(60,25,5,.45));border-radius:8px}
.diary-book::before{content:"";position:absolute;inset:-12px -14px;border-radius:14px;background:linear-gradient(180deg,#6a2216,#3d0e08);z-index:-1;box-shadow:inset 0 0 0 1px rgba(255,200,140,.18)}
.diary-spine{position:absolute;left:50%;top:0;bottom:0;width:60px;margin-left:-30px;background:linear-gradient(90deg,transparent,rgba(80,40,10,.22) 45%,rgba(60,30,8,.35) 50%,rgba(80,40,10,.22) 55%,transparent);z-index:3;pointer-events:none}
.diary-half{position:relative;min-width:0;overflow:hidden}
.diary-half-l{border-radius:6px 0 0 6px}.diary-half-r{border-radius:0 6px 6px 0}
.diary-paper{background-color:#fbf2dc;background-image:${PAPER},radial-gradient(130% 100% at 50% 50%,transparent 60%,rgba(150,100,40,.18));}
.diary-left{box-shadow:inset -18px 0 28px -18px rgba(90,50,15,.45)}.diary-right{box-shadow:inset 18px 0 28px -18px rgba(90,50,15,.45)}
.diary-lines{background:repeating-linear-gradient(180deg,transparent 0 29px,rgba(120,150,190,.18) 29px 30px);mask:linear-gradient(180deg,transparent,#000 6%,#000 94%,transparent)}
.diary-date{font-family:"Gentium Book Plus",Georgia,serif;font-style:italic;font-size:clamp(15px,1.6vw,19px);color:#7a2a1c}
.diary-place{margin-top:2px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a07a45}
.diary-label{font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:#a07a45;font-weight:600}
.diary-text{font-family:"Gentium Book Plus",Georgia,serif;font-size:clamp(14.5px,1.3vw,16.5px);line-height:30px;color:#2c1a0b}
.diary-odia{font-family:"Noto Serif Oriya","Noto Sans Oriya","Gentium Book Plus",serif;font-size:clamp(16px,1.5vw,19px);color:#2a1606}
.diary-trans{color:#3b2814}
.diary-scan{filter:sepia(.25) contrast(1.05);border-radius:2px;box-shadow:0 6px 20px -8px rgba(60,30,5,.5)}
.diary-folio{font-family:"Gentium Book Plus",Georgia,serif;font-size:13px;font-style:italic}
.diary-ink{animation:diaryInk 1.4s ease both}
@keyframes diaryInk{from{opacity:0;-webkit-mask:linear-gradient(180deg,#000 0%,transparent 0%);mask:linear-gradient(180deg,#000 0%,transparent 0%)}to{opacity:1}}
.diary-ink::-webkit-scrollbar{width:6px}.diary-ink::-webkit-scrollbar-thumb{background:#dcc394;border-radius:6px}
.diary-sheet{position:absolute;top:0;bottom:0;width:50%;transform-style:preserve-3d;z-index:5}
.diary-sheet.turn-next{left:50%;transform-origin:left center;animation:diaryNext .95s cubic-bezier(.45,.05,.3,1) forwards}
.diary-sheet.turn-prev{left:0;transform-origin:right center;animation:diaryPrev .95s cubic-bezier(.45,.05,.3,1) forwards}
.diary-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.diary-face.back{transform:rotateY(180deg)}
.diary-face::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(60,30,5,0),rgba(60,30,5,.25));opacity:0;animation:diaryShade .95s ease forwards}
@keyframes diaryNext{0%{transform:rotateY(0)}100%{transform:rotateY(-180deg)}}
@keyframes diaryPrev{0%{transform:rotateY(0)}100%{transform:rotateY(180deg)}}
@keyframes diaryShade{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
.diary-arrow{position:absolute;top:50%;margin-top:-24px;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#fffaf0;color:#5a1d14;border:1px solid #dcc394;box-shadow:0 10px 24px -12px rgba(60,25,5,.7);z-index:6;transition:transform .2s}
.diary-arrow:hover:not(:disabled){transform:scale(1.08)}.diary-arrow:disabled{opacity:.35}
.diary-years{display:flex;gap:3px;height:30px}.diary-years button{min-width:34px;border-radius:6px;background:rgba(255,250,238,.55);border:1px solid #dcc394;font-size:11.5px;color:#7a4a1c;overflow:hidden;transition:background .2s}
.diary-years button.is-on{background:#5a1d14;color:#f6dca6;border-color:#5a1d14}
.diary-link{border-radius:999px;background:#f4e6c8;padding:3px 10px;font-size:12.5px;color:#5a1d14}.diary-link:hover{background:#5a1d14;color:#f6dca6}
.diary-range{width:100%;margin-top:10px;accent-color:#7a2a1c}
.diary-toc{display:flex;flex-direction:column;width:min(380px,90vw);height:100%;padding:20px;background:#fbf2dc;background-image:${PAPER};box-shadow:20px 0 40px -20px rgba(40,15,5,.6);animation:diaryToc .35s ease}
@keyframes diaryToc{from{transform:translateX(-100%)}to{transform:none}}
@media (max-width:767px){.diary-book{grid-template-columns:1fr;height:70vh}.diary-spine{display:none}.diary-half-l,.diary-half-r{border-radius:6px}.diary-sheet{display:none}.diary-arrow{width:40px;height:40px}}
@media (prefers-reduced-motion:reduce){.diary-ink{animation:none}}
`;
