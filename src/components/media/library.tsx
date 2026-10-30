"use client";
/* One library for audio lectures, kīrtanas and videos: filters on the left (each can open into its parts), dense rows on the right. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronDown, ChevronRight, SlidersHorizontal, FileText, PlayCircle, ArrowDownUp, Rows3 } from "lucide-react";
import type { Lecture } from "@/lib/data";
import { PlayButton } from "@/components/lecture";

export type MediaItem = Lecture & { thumb?: string; singer?: string; author?: string; song?: string; video?: boolean };
export type Mode = "audio" | "kirtan" | "video";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const BOOK: Record<string, string> = { SB: "Śrīmad-Bhāgavatam", BG: "Bhagavad-gītā", CC: "Caitanya-caritāmṛta", BS: "Brahma-saṁhitā", NOI: "Nectar of Instruction", ISO: "Śrī Īśopaniṣad" };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** A filter is a tree: each item gives its path (e.g. India › Bhubaneswar). Choosing a branch keeps everything under it. */
type Facet = { k: string; title: string; open?: boolean; get: (l: MediaItem) => string[] | null; label?: (path: string[]) => string; order?: (a: string, b: string, depth: number) => number };
const num = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
function scripturePath(s?: string): string[] | null {
  if (!s) return null; const [b, a, c] = s.split(" ");
  if (b === "CC") { const [ch] = (c || "").split("."); return ["CC", a || "—", ...(ch ? [ch] : [])]; }
  if (!BOOK[b]) return ["Other"];
  const [x, y] = (a || "").split("."); return b === "SB" ? ["SB", ...(x ? [x] : []), ...(y ? [y] : [])] : [b, ...(x ? [x] : [])];
}
const scrLabel = (p: string[]) => { const [b] = p; if (p.length === 1) return BOOK[b] || "Other scriptures"; if (b === "CC") return p.length === 2 ? `${p[1]}-līlā` : `Chapter ${p[2]}`; if (b === "SB") return p.length === 2 ? `Canto ${p[1]}` : `Chapter ${p[2]}`; return `Chapter ${p[1]}`; };
const LILA = ["Ādi", "Adi", "Madhya", "Antya"];

function facetsFor(mode: Mode, items: MediaItem[]): Facet[] {
  const f: Facet[] = [
    { k: "year", title: "Year", open: true, get: (l) => (l.date ? [l.date.slice(0, 4), ...(l.date.length >= 7 ? [l.date.slice(5, 7)] : [])] : ["Undated"]), label: (p) => (p.length === 2 ? MONTHS[Number(p[1]) - 1] : p[0]), order: (a, b, d) => (d === 0 ? (a === "Undated" ? 1 : b === "Undated" ? -1 : b.localeCompare(a)) : a.localeCompare(b)) },
    { k: "place", title: "Place", open: true, get: (l) => (l.place || l.country ? [l.country || "Unknown country", ...(l.place ? [l.place] : [])] : null), order: (a, b, d) => (d === 0 ? (a === "India" ? -1 : b === "India" ? 1 : a.localeCompare(b)) : a.localeCompare(b)) },
    { k: "type", title: mode === "kirtan" ? "Kind of song" : "Type", open: true, get: (l) => (l.type ? [l.type] : null) },
    ...(mode !== "kirtan" ? [{ k: "scripture", title: "Scripture", open: true, get: (l: MediaItem) => scripturePath(l.scripture), label: scrLabel, order: (a: string, b: string, d: number) => (d === 0 ? Object.keys(BOOK).concat("Other").indexOf(a) - Object.keys(BOOK).concat("Other").indexOf(b) : d === 1 && LILA.includes(a) ? LILA.indexOf(a) - LILA.indexOf(b) : num(a, b)) }] : []),
    ...(mode === "kirtan" ? [{ k: "song", title: "Song", get: (l: MediaItem) => (l.song ? [l.song] : null) }, { k: "author", title: "Written by", get: (l: MediaItem) => (l.author ? [l.author] : null) }, { k: "singer", title: "Sung by", get: (l: MediaItem) => (l.singer ? [l.singer] : null) }] : []),
    { k: "series", title: mode === "video" ? "Channel / series" : "Series", get: (l) => (l.series ? [l.series] : null) },
    { k: "topic", title: "Topic", get: (l) => (l.topics?.length ? l.topics.map((t) => t) : null) },
    { k: "language", title: "Language", get: (l) => (l.languages?.length ? [l.languages[0]] : null) },
  ];
  return f.filter((x) => items.some((l) => x.get(l)));
}
/** Topics are many values per item; every other facet is one path. */
const paths = (fc: Facet, l: MediaItem): string[][] => { const v = fc.get(l); if (!v) return []; return fc.k === "topic" ? v.map((t) => [t]) : [v]; };
const under = (p: string[], sel: string[]) => sel.every((s, i) => p[i] === s);

const SORTS = [["new", "Newest first"], ["old", "Oldest first"], ["title", "Title A–Z"], ["long", "Longest first"]] as const;
const GROUPS = [["none", "No grouping"], ["year", "By year"], ["place", "By place"], ["scripture", "By scripture"]] as const;
const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const date = (d: string) => { if (!d) return "Undated"; const [y, m, dd] = d.split("-").map(Number); return dd ? `${dd} ${MONTHS[m - 1].slice(0, 3)} ${y}` : m ? `${MONTHS[m - 1].slice(0, 3)} ${y}` : String(y); };

export function MediaLibrary({ items, mode }: { items: MediaItem[]; mode: Mode }) {
  const facets = useMemo(() => facetsFor(mode, items), [mode, items]);
  const [sel, setSel] = useState<Record<string, string[]>>({}); const [q, setQ] = useState(""); const [text, setText] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number][0]>("new"); const [group, setGroup] = useState<(typeof GROUPS)[number][0]>("none"); const [limit, setLimit] = useState(100); const [drawer, setDrawer] = useState(false);
  // Filters live in the address, so any view can be shared or bookmarked.
  useEffect(() => { const u = new URLSearchParams(location.search); const o: Record<string, string[]> = {}; facets.forEach((f) => { const v = u.get(f.k); if (v) o[f.k] = v.split("/"); }); if (u.get("q")) setQ(u.get("q")!); if (u.get("text")) setText(true); setSel(o); }, []); // eslint-disable-line
  useEffect(() => { const u = new URLSearchParams(); Object.entries(sel).forEach(([k, v]) => v.length && u.set(k, v.join("/"))); if (q) u.set("q", q); if (text) u.set("text", "1"); history.replaceState(null, "", `${location.pathname}${u.size ? `?${u}` : ""}`); setLimit(100); }, [sel, q, text]);

  const pass = (l: MediaItem, skip?: string) => (!q || fold(`${l.title} ${l.place} ${l.country} ${l.scripture ?? ""} ${l.topics.join(" ")} ${l.date} ${l.series ?? ""} ${l.type} ${l.singer ?? ""} ${l.song ?? ""}`).includes(fold(q)))
    && (!text || l.transcribed) && facets.every((f) => f.k === skip || !sel[f.k]?.length || paths(f, l).some((p) => under(p, sel[f.k])));
  const list = useMemo(() => items.filter((l) => pass(l)).sort((a, b) => sort === "new" ? b.date.localeCompare(a.date) : sort === "old" ? (a.date || "9").localeCompare(b.date || "9") : sort === "title" ? a.title.localeCompare(b.title) : b.duration - a.duration), [items, sel, q, text, sort]); // eslint-disable-line
  const active = facets.filter((f) => sel[f.k]?.length);
  const transcribed = items.filter((l) => l.transcribed).length;
  const noun = mode === "video" ? "videos" : mode === "kirtan" ? "recordings" : "lectures";

  const groups = useMemo(() => {
    if (group === "none") return [["", list]] as [string, MediaItem[]][];
    const key = (l: MediaItem) => group === "year" ? (l.date ? l.date.slice(0, 4) : "Undated") : group === "place" ? [l.place, l.country].filter(Boolean).join(", ") || "Place not known" : (() => { const p = scripturePath(l.scripture); return p ? `${BOOK[p[0]] || "Other scriptures"}${p[1] && p[0] !== "BG" ? ` · ${scrLabel(p.slice(0, 2))}` : ""}` : "No verse"; })();
    const m = new Map<string, MediaItem[]>(); list.forEach((l) => m.set(key(l), [...(m.get(key(l)) || []), l]));
    return [...m.entries()];
  }, [list, group]);

  const clearAll = () => { setSel({}); setText(false); setQ(""); };
  const chip = (f: Facet) => sel[f.k].map((_, i) => (f.label || ((p: string[]) => p[p.length - 1]))(sel[f.k].slice(0, i + 1))).join(" › ");

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-5 sm:px-6">
      {/* Toolbar: search, then one drop-down per filter — no sidebar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}…`} className="h-9 w-full rounded-md border border-line-strong bg-white pl-9 pr-8 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none focus:border-ink/40 focus:ring-[3px] focus:ring-ink/10" />{q && <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"><X size={14} /></button>}</label>
        {facets.map((f) => <FilterButton key={f.k} f={f} label={sel[f.k]?.length ? chip(f) : ""} items={items.filter((l) => pass(l, f.k))} value={sel[f.k] || []} onChange={(v) => setSel((s) => ({ ...s, [f.k]: v }))} />)}
        {mode !== "kirtan" && transcribed > 0 && <button onClick={() => setText(!text)} className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] ${text ? "border-ink bg-ink text-white" : "border-dashed border-line-strong text-ink-2 hover:bg-band"}`}><FileText size={14} />Has transcription</button>}
        {(active.length > 0 || text || q) && <button onClick={clearAll} className="flex h-9 items-center gap-1 px-2 text-[13px] text-ink-3 hover:text-ink">Reset<X size={13} /></button>}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 pb-1">
        <p className="text-[13px] text-ink-3"><b className="font-medium text-ink">{list.length.toLocaleString()}</b> {noun}</p>
        <span className="flex items-center gap-1.5"><Pick icon={Rows3} value={group} onChange={(v) => setGroup(v as any)} options={GROUPS.filter(([g]) => g !== "scripture" || mode !== "kirtan")} /><Pick icon={ArrowDownUp} value={sort} onChange={(v) => setSort(v as any)} options={SORTS} /></span>
      </div>
      {mode !== "video" && list.length > 0 && <div className="hidden grid-cols-[32px_minmax(0,1fr)_110px_150px_110px_64px] gap-x-3 border-b border-line py-2 text-[12px] font-medium text-ink-3 md:grid"><span /><span>Title</span><span>Date</span><span>Place</span><span>Verse</span><span className="text-right">Length</span></div>}
      {!list.length ? <p className="py-20 text-center text-[13.5px] text-ink-3">Nothing matches. Remove a filter to see more.</p> : (() => { let left = limit; return groups.map(([g, xs]) => { if (left <= 0) return null; const show = xs.slice(0, left); left -= show.length; return (
        <div key={g || "all"}>
          {g && <div className="sticky top-[52px] z-10 flex items-baseline gap-2 border-b border-line bg-white/95 pb-2 pt-5 backdrop-blur sm:top-[58px]"><h2 className="text-[14px] font-semibold text-ink">{g}</h2><span className="text-[12px] text-ink-3">{xs.length}</span></div>}
          {mode === "video" ? <div className="grid gap-x-4 gap-y-6 py-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{show.map((l) => <VideoCard key={l.slug} l={l} />)}</div>
            : <div className="divide-y divide-line">{show.map((l) => <Row key={l.slug} l={l} mode={mode} />)}</div>}
        </div>); }); })()}
      {list.length > limit && <div className="py-6 text-center"><button onClick={() => setLimit((n) => n + 200)} className="h-9 rounded-md border border-line px-4 text-[13px] font-medium text-ink-2 hover:bg-band">Show more ({(list.length - limit).toLocaleString()} left)</button></div>}
    </div>
  );
}

/** A filter as a drop-down button (shadcn style): the options open as a list with counts; each can open into its parts. */
function FilterButton({ f, label, items, value, onChange }: { f: Facet; label: string; items: MediaItem[]; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("mousedown", h); document.addEventListener("keydown", k); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); }; }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] transition ${label ? "border-line-strong bg-white text-ink" : "border-dashed border-line-strong text-ink-2 hover:bg-band"}`}>
        {f.title}{label && <><span className="mx-0.5 h-4 w-px bg-line-strong" /><span className="max-w-[160px] truncate rounded bg-band px-1.5 text-[12px] font-medium">{label}</span></>}<ChevronDown size={13} className="text-ink-3" />
      </button>
      {open && <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-[280px] rounded-lg border border-line bg-white p-1.5 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.25)]">
        <FacetBox f={f} items={items} value={value} onChange={(v) => onChange(v)} />
        {value.length > 0 && <button onClick={() => { onChange([]); setOpen(false); }} className="mt-1 w-full rounded-md border-t border-line px-2 py-1.5 text-center text-[12.5px] text-ink-2 hover:bg-band">Clear {f.title.toLowerCase()}</button>}
      </div>}
    </div>
  );
}

function Pick({ icon: I, value, onChange, options }: { icon: typeof Rows3; value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[] }) {
  return <label className="relative flex items-center"><I size={13} className="pointer-events-none absolute left-2.5 text-ink-3" /><select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 appearance-none rounded-lg border border-line bg-white pl-7 pr-7 text-[12.5px] text-ink-2 outline-none hover:border-line-strong">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2 text-ink-3" /></label>;
}

/** One filter: a header that opens and closes, then its options as a tree with counts. */
function FacetBox({ f, items, value, onChange }: { f: Facet; items: MediaItem[]; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(true); const [find, setFind] = useState("");
  const counts = useMemo(() => { const m = new Map<string, number>(); items.forEach((l) => { const seen = new Set<string>(); paths(f, l).forEach((p) => p.forEach((_, i) => { const k = p.slice(0, i + 1).join("\u0001"); if (!seen.has(k)) { seen.add(k); m.set(k, (m.get(k) || 0) + 1); } })); }); return m; }, [items, f]);
  const kids = (prefix: string[]) => { const d = prefix.length; const out = new Set<string>(); counts.forEach((_, k) => { const p = k.split("\u0001"); if (p.length === d + 1 && under(p, prefix)) out.add(p[d]); }); return [...out].sort((a, b) => (f.order ? f.order(a, b, d) : a.localeCompare(b))); };
  const label = (p: string[]) => (f.label ? f.label(p) : p[p.length - 1]);
  const top = kids([]);
  const node = (p: string[], depth: number): React.ReactNode => { const on = value.length >= p.length && under(value, p); const exact = value.join("/") === p.join("/"); const n = counts.get(p.join("\u0001")) || 0; const sub = on ? kids(p) : [];
    return (
      <div key={p.join("/")}>
        <button onClick={() => onChange(exact ? p.slice(0, -1) : p)} className={`flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-[13px] transition ${exact ? "bg-band font-medium text-ink" : on ? "font-medium text-ink" : "text-ink-2 hover:bg-band"}`} style={{ paddingLeft: 8 + depth * 14 }}>
          {f.k !== "topic" && depth < 2 && (counts.size > top.length || depth > 0) ? <ChevronRight size={12} className={`shrink-0 text-ink-3 transition ${on ? "rotate-90" : ""}`} /> : <span className="w-3 shrink-0" />}
          <span className="min-w-0 flex-1 truncate">{label(p)}</span><span className="text-[11px] tabular-nums text-ink-3">{n}</span></button>
        {sub.length > 0 && sub.map((c) => node([...p, c], depth + 1))}
      </div>); };
  void open; void setOpen;
  return (
    <div>
      {top.length > 8 && <input value={find} onChange={(e) => setFind(e.target.value)} placeholder={`Find ${f.title.toLowerCase()}…`} className="mb-1 h-8 w-full rounded-md border-b border-line px-2 text-[12.5px] outline-none" />}
      <div className="max-h-[320px] overflow-y-auto [scrollbar-width:thin]">{(find ? top.filter((t) => fold(label([t])).includes(fold(find))) : top).map((t) => node([t], 0))}</div>
    </div>
  );
}

function Row({ l, mode }: { l: MediaItem; mode: Mode }) {
  const where = [l.place, l.country && l.country !== "India" ? l.country : ""].filter(Boolean).join(", ");
  return (
    <div className="group grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-3 py-2.5 md:grid-cols-[32px_minmax(0,1fr)_110px_150px_110px_64px]">
      <PlayButton l={l} size={30} />
      <div className="min-w-0">
        <Link href={l.href || `/teachings/audio/${l.slug}`} className="line-clamp-2 text-[14px] leading-snug text-ink hover:underline md:line-clamp-1">{l.title}</Link>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-ink-3"><span>{mode === "kirtan" ? [l.singer, l.author && `by ${l.author}`].filter(Boolean).join(" · ") || l.type : l.type}</span>{l.transcribed && <span className="inline-flex items-center gap-0.5 rounded border border-line px-1 text-[10.5px] text-ink-2"><FileText size={10} />Text</span>}<span className="md:hidden">· {date(l.date)}{where ? ` · ${where}` : ""}</span></p>
      </div>
      <span className="hidden text-[12.5px] tabular-nums text-ink-2 md:block">{date(l.date)}</span>
      <span className="hidden truncate text-[12.5px] text-ink-2 md:block">{where || "—"}</span>
      <span className="hidden truncate text-[12.5px] text-ink-2 md:block">{l.scripture || "—"}</span>
      <span className="text-right text-[12.5px] tabular-nums text-ink-3">{dur(l.duration)}</span>
    </div>
  );
}
function VideoCard({ l }: { l: MediaItem }) {
  return (
    <Link href={l.href || "#"} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-band">{l.thumb ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.thumb} alt="" loading="lazy" className="aspect-video w-full object-cover transition group-hover:opacity-90" /> : <div className="flex aspect-video items-center justify-center text-ink-3"><PlayCircle size={28} /></div>}
        {l.duration > 0 && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] tabular-nums text-white">{dur(l.duration)}</span>}</div>
      <h3 className="mt-2 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:text-saffron">{l.title}</h3>
      <p className="mt-0.5 truncate text-[12px] text-ink-3">{[date(l.date), l.place, l.scripture].filter(Boolean).join(" · ")}</p>
    </Link>
  );
}
