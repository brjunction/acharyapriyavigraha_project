"use client";
/* His Diary — its own reading view (shown by default): one page at a time on paper, the contents of every volume and year,
   and a reading panel like an e-reader: paper, aged paper, saffron and dawn gradients, white, sepia, night; several fonts;
   size, spacing, width and alignment; the original beside or below the translation. Choices are remembered on this device. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, List, Type, X, BookOpen, Languages, Search } from "lucide-react";

export type JEntry = { slug: string; date: string | null; date_note: string | null; volume: string | null; page: string | null };
export type JPage = JEntry & { title: string | null; place: string | null; translation: string | null; original: string | null; original_lang: string | null; scan_url: string | null; notes: string | null };
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const when = (e: JEntry) => (e.date ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(e.date.split("-").map(Number)) : e.date_note || "Undated");
const weekday = (e: JEntry) => (e.date ? WD[new Date(`${e.date}T12:00:00Z`).getUTCDay()] : "");
const paras = (t: string | null) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .32 0 0 0 0 .18 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

type Theme = { label: string; page: React.CSSProperties; ink: string; soft: string; around: string; dark?: boolean };
const THEMES: Record<string, Theme> = {
  paper: { label: "Paper", page: { backgroundColor: "#fbf6ea", backgroundImage: NOISE }, ink: "#2b2118", soft: "#8a7560", around: "#efe6d3" },
  aged: { label: "Aged paper", page: { backgroundColor: "#f3e5c4", backgroundImage: `${NOISE}, radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(120,80,30,.22))` }, ink: "#3a2a17", soft: "#8b6a43", around: "#e2d0a8" },
  saffron: { label: "Saffron", page: { backgroundImage: `${NOISE}, linear-gradient(160deg, #fff4e0, #fde3bd 55%, #f8cf98)` }, ink: "#3d1f05", soft: "#9a5a1c", around: "#f6dcb5" },
  dawn: { label: "Dawn", page: { backgroundImage: `${NOISE}, linear-gradient(170deg, #fff6f0, #fde4dc 50%, #f6d9e8)` }, ink: "#35202a", soft: "#9b6475", around: "#f3dde3" },
  white: { label: "White", page: { backgroundColor: "#ffffff" }, ink: "#1d1d1f", soft: "#77777c", around: "#f2f2f4" },
  sepia: { label: "Sepia", page: { backgroundColor: "#f4ecd8" }, ink: "#5b4636", soft: "#8f7a66", around: "#e9dfc6" },
  dusk: { label: "Dusk", page: { backgroundImage: "linear-gradient(170deg, #2b1d18, #3a2419 60%, #45281a)" }, ink: "#f3e3cc", soft: "#c9a888", around: "#1d1411", dark: true },
  night: { label: "Night", page: { backgroundColor: "#111111" }, ink: "#d8d8d8", soft: "#8a8a8a", around: "#000000", dark: true },
};
const FONTS: Record<string, [string, string]> = {
  sans: ["Sans", "var(--font-sans, Inter), system-ui, sans-serif"], literata: ["Literata", "Literata, Georgia, serif"], noto: ["Noto Serif", "'Noto Serif', Georgia, serif"],
  atkinson: ["Atkinson (easy to read)", "'Atkinson Hyperlegible', system-ui, sans-serif"], lora: ["Lora", "Lora, Georgia, serif"],
};
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600&family=Noto+Serif:wght@400;600&family=Atkinson+Hyperlegible:wght@400;700&family=Lora:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Oriya:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&display=swap";
type S = { theme: string; font: string; size: number; lead: number; width: "narrow" | "normal" | "wide"; align: "left" | "justify"; orig: "off" | "side" | "below" };
const DEF: S = { theme: "paper", font: "sans", size: 19, lead: 1.8, width: "normal", align: "justify", orig: "off" };

export function DiaryJournal({ e, list }: { e: JPage; list: JEntry[] }) {
  const router = useRouter(); const [s, setS] = useState<S>(DEF); const [panel, setPanel] = useState<"" | "toc" | "type">(""); const [q, setQ] = useState("");
  useEffect(() => { try { setS({ ...DEF, ...JSON.parse(localStorage.getItem("tj_journal") || "{}") }); } catch {} }, []);
  const set = (p: Partial<S>) => setS((o) => { const n = { ...o, ...p }; try { localStorage.setItem("tj_journal", JSON.stringify(n)); } catch {} return n; });
  const i = list.findIndex((x) => x.slug === e.slug); const prev = list[i - 1], next = list[i + 1];
  useEffect(() => { try { localStorage.setItem("tj_diary_last", JSON.stringify(e.slug)); } catch {} }, [e.slug]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if ((ev.target as HTMLElement).closest("input,textarea,select")) return; if (ev.key === "ArrowRight" && next) router.push(`/gurudeva/diaries/${next.slug}`); if (ev.key === "ArrowLeft" && prev) router.push(`/gurudeva/diaries/${prev.slug}`); if (ev.key === "Escape") setPanel(""); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [prev, next, router]);
  // contents: volume (or year) → month → day, every volume
  const tree = useMemo(() => { const vols = new Map<string, Map<string, JEntry[]>>(); list.forEach((x) => { const v = x.volume ? `Volume ${x.volume}` : x.date ? x.date.slice(0, 4) : "Undated"; const m = x.date ? x.date.slice(0, 7) : "undated"; if (!vols.has(v)) vols.set(v, new Map()); const mm = vols.get(v)!; mm.set(m, [...(mm.get(m) || []), x]); }); return [...vols.entries()]; }, [list]);
  const curVol = e.volume ? `Volume ${e.volume}` : e.date ? e.date.slice(0, 4) : "Undated";
  const T = THEMES[s.theme] || THEMES.paper; const width = s.width === "narrow" ? 600 : s.width === "wide" ? 900 : 720;
  const orig = paras(e.original); const tr = paras(e.translation); const showOrig = s.orig !== "off" && orig.length > 0;
  // even edges only where lines are long enough (phones keep a calm left edge)
  const body = (ps: string[], lang?: string | null) => <div lang={lang || undefined} className={s.align === "justify" ? "text-left sm:text-justify" : "text-left"} style={{ hyphens: "auto" }}>{ps.map((p, k) => <p key={k} className="mb-[1em] whitespace-pre-line">{p}</p>)}</div>;
  const found = q.trim().length > 1 ? list.filter((x) => when(x).toLowerCase().includes(q.toLowerCase()) || (x.date || "").includes(q)).slice(0, 40) : null;
  const btn = `flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition ${T.dark ? "text-white/80 hover:bg-white/10" : "text-black/70 hover:bg-black/5"}`;
  const toc = (
    <div className="space-y-1">
      <label className="relative mb-2 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" /><input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Find a date — 1975, May 1975…" className="h-9 w-full rounded-lg border border-black/10 bg-white/70 pl-8 pr-2 text-[13px] text-zinc-900 outline-none" /></label>
      {found ? found.map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} onClick={() => setPanel("")} className="block rounded px-2 py-1 text-[13px] hover:bg-black/5">{when(x)}</Link>) :
        tree.map(([v, months]) => (
          <details key={v} open={v === curVol} className="rounded-lg">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-[13.5px] font-semibold hover:bg-black/5">{v}<span className="text-[11.5px] font-normal opacity-60">{[...months.values()].reduce((a, b) => a + b.length, 0)}</span></summary>
            <div className="ml-2 border-l border-black/10 pl-2">{[...months.entries()].map(([m, xs]) => (
              <details key={m} open={e.date?.slice(0, 7) === m}>
                <summary className="flex cursor-pointer list-none items-center justify-between rounded px-2 py-1 text-[13px] hover:bg-black/5">{m === "undated" ? "Undated" : `${MON[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`}<span className="text-[11px] opacity-60">{xs.length}</span></summary>
                <div className="ml-2 grid grid-cols-3 gap-1 py-1">{xs.map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} onClick={() => setPanel("")} className={`rounded px-1.5 py-1 text-center text-[12px] tabular-nums ${x.slug === e.slug ? "bg-[#c2621d] text-white" : "hover:bg-black/5"}`}>{x.date ? Number(x.date.slice(8, 10)) : "·"}</Link>)}</div>
              </details>))}</div>
          </details>))}
    </div>);
  const seg = (on: boolean) => `rounded-md px-2 py-1.5 text-[12.5px] ${on ? "bg-white font-medium text-zinc-900 shadow-sm" : "text-zinc-500"}`;
  const typePanel = (
    <div className="space-y-4 text-zinc-900">
      <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Page</p>
        <div className="grid grid-cols-4 gap-1.5">{Object.entries(THEMES).map(([k, t]) => <button key={k} onClick={() => set({ theme: k })} className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[10.5px] ${s.theme === k ? "border-zinc-900" : "border-zinc-200"}`}><span className="h-8 w-full rounded" style={{ ...t.page, border: "1px solid rgba(0,0,0,.08)" }} />{t.label}</button>)}</div></div>
      <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Font</p>
        <div className="grid grid-cols-2 gap-1">{Object.entries(FONTS).map(([k, [l, f]]) => <button key={k} onClick={() => set({ font: k })} className={`rounded-md border px-2 py-1.5 text-left text-[13px] ${s.font === k ? "border-zinc-900" : "border-zinc-200"}`} style={{ fontFamily: f }}>{l}</button>)}</div></div>
      <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Size · {s.size}</p><input type="range" min={14} max={30} value={s.size} onChange={(ev) => set({ size: Number(ev.target.value) })} className="w-full accent-[#c2621d]" /></div>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{([[1.55, "Compact"], [1.8, "Normal"], [2.1, "Airy"]] as const).map(([v, l]) => <button key={l} onClick={() => set({ lead: v })} className={seg(s.lead === v)}>{l}</button>)}</div>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{(["narrow", "normal", "wide"] as const).map((w) => <button key={w} onClick={() => set({ width: w })} className={seg(s.width === w)}>{w[0].toUpperCase() + w.slice(1)}</button>)}</div>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-0.5">{(["justify", "left"] as const).map((a) => <button key={a} onClick={() => set({ align: a })} className={seg(s.align === a)}>{a === "justify" ? "Even edges" : "Left aligned"}</button>)}</div>
      {orig.length > 0 && <div><p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">The original</p><div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-0.5">{([["off", "Hide"], ["side", "Beside"], ["below", "Below"]] as const).map(([k, l]) => <button key={k} onClick={() => set({ orig: k })} className={seg(s.orig === k)}>{l}</button>)}</div></div>}
      <button onClick={() => set(DEF)} className="w-full rounded-md py-1.5 text-[12px] text-zinc-500 hover:bg-zinc-100">Reset</button>
    </div>);
  return (
    <div className="min-h-[calc(100vh-58px)] transition-colors duration-300" style={{ background: T.around }}>
      <link rel="stylesheet" href={FONT_LINK} precedence="default" />
      <div className="sticky top-[52px] z-30 border-b border-black/5 backdrop-blur sm:top-[58px]" style={{ background: `${T.around}e6` }}>
        <div className="mx-auto flex max-w-[1240px] items-center gap-1 px-3 py-1.5 sm:px-6">
          <button onClick={() => setPanel(panel === "toc" ? "" : "toc")} className={btn}><List size={16} /><span className="max-sm:hidden">Contents</span></button>
          <Link href="/gurudeva/diaries" className={`${btn} min-w-0`}><span className="truncate">His Diary</span></Link>
          <span className="ml-auto" />
          {orig.length > 0 && <button onClick={() => set({ orig: s.orig === "off" ? "side" : "off" })} className={btn} title="The original beside the translation"><Languages size={16} /><span className="max-sm:hidden">{s.orig === "off" ? "Original" : "Hide original"}</span></button>}
          <button onClick={() => setPanel(panel === "type" ? "" : "type")} className={btn} title="Reading style"><Type size={16} /><span className="max-sm:hidden">Aa</span></button>
          <Link href={`/gurudeva/diaries/${e.slug}?view=book`} className={btn} title="Open in the book reader"><BookOpen size={16} /></Link>
        </div>
      </div>
      {panel && <div className="fixed inset-0 z-[70]" onClick={() => setPanel("")}><aside className={`absolute top-0 h-full w-[88%] max-w-[340px] overflow-y-auto bg-[#fffaf2] p-4 shadow-2xl ${panel === "toc" ? "left-0" : "right-0"}`} onClick={(ev) => ev.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="text-[14px] font-semibold text-zinc-900">{panel === "toc" ? `Contents · ${list.length} pages` : "Reading style"}</p><button onClick={() => setPanel("")} className="text-zinc-400 hover:text-zinc-900"><X size={18} /></button></div>
        <div className="text-zinc-800">{panel === "toc" ? toc : typePanel}</div>
      </aside></div>}
      <div className="relative mx-auto px-3 py-6 sm:px-6 sm:py-10" style={{ maxWidth: (showOrig && s.orig === "side" ? width * 1.9 : width) + 120 }}>
        {prev && <Link href={`/gurudeva/diaries/${prev.slug}`} aria-label={`Previous: ${when(prev)}`} className="fixed left-2 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-md backdrop-blur hover:bg-white md:flex"><ChevronLeft size={20} /></Link>}
        {next && <Link href={`/gurudeva/diaries/${next.slug}`} aria-label={`Next: ${when(next)}`} className="fixed right-2 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-md backdrop-blur hover:bg-white md:flex"><ChevronRight size={20} /></Link>}
        <article className="rounded-[6px] px-6 py-9 shadow-[0_1px_2px_rgba(0,0,0,.06),0_30px_60px_-30px_rgba(60,35,10,.45)] sm:px-14 sm:py-14" style={{ ...T.page, color: T.ink }}>
          <header className="mb-8 text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: T.soft }}>{[weekday(e), e.place].filter(Boolean).join(" · ") || "His Diary"}</p>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]" style={{ fontFamily: FONTS[s.font]?.[1] }}>{when(e)}</h1>
            {e.title && <p className="mt-1 text-[15px]" style={{ color: T.soft }}>{e.title}</p>}
            <div className="mx-auto mt-5 flex items-center justify-center gap-2" aria-hidden><span className="h-px w-12" style={{ background: T.soft, opacity: .4 }} /><span className="size-1.5 rotate-45" style={{ background: T.soft }} /><span className="h-px w-12" style={{ background: T.soft, opacity: .4 }} /></div>
          </header>
          <div className={showOrig && s.orig === "side" ? "grid gap-10 md:grid-cols-2" : ""} style={{ fontFamily: FONTS[s.font]?.[1], fontSize: `clamp(${s.size - 3}px, 4.3vw, ${s.size}px)`, lineHeight: s.lead }}>
            {showOrig && s.orig === "side" && <div className="opacity-90">{body(orig, e.original_lang)}</div>}
            <div className="mx-auto" style={{ maxWidth: showOrig && s.orig === "side" ? undefined : width }}>{tr.length ? body(tr) : <p className="text-center opacity-70">The translation of this page is being prepared.</p>}</div>
            {showOrig && s.orig === "below" && <div className="mx-auto mt-8 border-t pt-8 opacity-90" style={{ maxWidth: width, borderColor: `${T.soft}55` }}>{body(orig, e.original_lang)}</div>}
          </div>
          {e.notes && <p className="mx-auto mt-8 border-t pt-4 text-[13px] opacity-75" style={{ maxWidth: width, borderColor: `${T.soft}55` }}>{e.notes}</p>}
          {e.scan_url && /* eslint-disable-next-line @next/next/no-img-element */ <figure className="mx-auto mt-10" style={{ maxWidth: width }}><img src={e.scan_url} alt={`The page in his own hand, ${when(e)}`} className="w-full rounded shadow" loading="lazy" /><figcaption className="mt-2 text-center text-[12px]" style={{ color: T.soft }}>The page in his own hand</figcaption></figure>}
          <footer className="mt-10 text-center text-[11.5px] tabular-nums" style={{ color: T.soft }}>{[e.volume ? `Volume ${e.volume}` : null, e.page ? `page ${e.page}` : null, `${i + 1} of ${list.length}`].filter(Boolean).join(" · ")}</footer>
        </article>
        <nav className="mt-6 grid grid-cols-2 gap-3">
          {prev ? <Link href={`/gurudeva/diaries/${prev.slug}`} className="rounded-xl bg-white/70 px-4 py-3 text-zinc-800 shadow-sm hover:bg-white"><span className="block text-[11px] text-zinc-500">Previous page</span><span className="text-[14px] font-medium">{when(prev)}</span></Link> : <span />}
          {next ? <Link href={`/gurudeva/diaries/${next.slug}`} className="rounded-xl bg-white/70 px-4 py-3 text-right text-zinc-800 shadow-sm hover:bg-white"><span className="block text-[11px] text-zinc-500">Next page</span><span className="text-[14px] font-medium">{when(next)}</span></Link> : <span />}
        </nav>
        <p className="mt-4 hidden text-center text-[12px] md:block" style={{ color: T.dark ? "#888" : "#9a8a76" }}>← → to turn the page</p>
      </div>
    </div>
  );
}
