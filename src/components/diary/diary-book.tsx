"use client";
/* His Diary — prayers to Śrī Gopāl Jiu. A leather diary that opens, with pages that turn. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, List, Search, X, ScrollText, Languages, BookOpen, Share2 } from "lucide-react";

export type Entry = { slug: string; date: string | null; date_note: string | null; place: string | null; title: string | null; original: string | null; original_lang: string | null; translation: string | null; scan_url: string | null; volume: string | null; page: string | null };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
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

function PageFace({ e, side, scan, n }: { e?: Entry; side: "left" | "right"; scan: boolean; n: number }) {
  if (!e) return <div className="diary-paper h-full" />;
  const odia = e.original_lang === "or";
  return (
    <div className={`diary-paper relative flex h-full flex-col ${side === "left" ? "diary-left" : "diary-right"}`}>
      <div className="diary-lines pointer-events-none absolute inset-x-[9%] bottom-[9%] top-[17%]" />
      <header className="relative px-[9%] pt-[7%]">
        {side === "left" ? <><p className="diary-date">{longDate(e)}</p>{(e.place || e.title) && <p className="diary-place">{[e.title, e.place].filter(Boolean).join(" · ")}</p>}</> : <p className="diary-label">Translation</p>}
      </header>
      <div className="diary-ink relative min-h-0 flex-1 overflow-y-auto px-[9%] pb-[12%] pt-4" key={e.slug + side + scan}>
        {side === "left" ? (scan && e.scan_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.scan_url} alt={`Handwritten page, ${longDate(e)}`} className="diary-scan mx-auto max-h-full w-auto" />
          : e.original ? <p className={`diary-text whitespace-pre-line ${odia ? "diary-odia" : ""}`} lang={e.original_lang || undefined}>{e.original}</p> : <p className="diary-text whitespace-pre-line italic opacity-70">{e.translation}</p>)
          : <p className="diary-text diary-trans whitespace-pre-line">{e.translation || <span className="opacity-60">The translation of this page is being prepared.</span>}</p>}
      </div>
      <footer className="pointer-events-none absolute inset-x-0 bottom-[4%] flex items-center justify-center gap-2 text-[#a07a45]"><Lotus className="h-3 w-6" /><span className="diary-folio">{n}</span><Lotus className="h-3 w-6" /></footer>
    </div>
  );
}

export function DiaryBook({ entries, start = 0 }: { entries: Entry[]; start?: number }) {
  const [open, setOpen] = useState(start > 0); const [opening, setOpening] = useState(false);
  const [i, setI] = useState(Math.max(0, Math.min(entries.length - 1, start))); const [turn, setTurn] = useState<null | { dir: 1 | -1; to: number }>(null);
  const [scan, setScan] = useState(false); const [toc, setToc] = useState(false); const [q, setQ] = useState(""); const [mobileSide, setMobileSide] = useState<"left" | "right">("left");
  const reduce = useRef(false); const touch = useRef<number | null>(null);
  useEffect(() => { reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);
  const go = useCallback((to: number) => {
    if (turn || to < 0 || to >= entries.length || to === i) return;
    if (reduce.current || Math.abs(to - i) > 1) { setI(to); return; }
    setTurn({ dir: to > i ? 1 : -1, to }); setTimeout(() => { setI(to); setTurn(null); }, 950);
  }, [turn, i, entries.length]);
  useEffect(() => { if (!open) return; const u = new URL(location.href); u.searchParams.set("e", entries[i]?.slug || ""); history.replaceState(null, "", u.toString()); }, [i, open, entries]);
  useEffect(() => { const k = (ev: KeyboardEvent) => { if (!open || (ev.target as HTMLElement).tagName === "INPUT") return; if (ev.key === "ArrowRight") go(i + 1); if (ev.key === "ArrowLeft") go(i - 1); if (ev.key === "Escape") setToc(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, go, i]);
  const years = useMemo(() => { const m = new Map<string, number>(); entries.forEach((e, k) => { const y = e.date ? e.date.slice(0, 4) : "—"; if (!m.has(y)) m.set(y, k); }); return [...m.entries()]; }, [entries]);
  const found = q.trim().length > 1 ? entries.map((e, k) => ({ e, k })).filter(({ e }) => fold(`${e.title || ""} ${e.place || ""} ${e.original || ""} ${e.translation || ""} ${e.date || ""}`).includes(fold(q))) : null;
  const e = entries[i]; const next = turn ? entries[turn.to] : undefined;
  const doOpen = () => { if (reduce.current) { setOpen(true); return; } setOpening(true); setTimeout(() => { setOpen(true); setOpening(false); }, 1300); };

  return (
    <section className="diary-stage relative isolate overflow-hidden">
      <style>{CSS}</style>
      <div aria-hidden className="diary-glow" /><div aria-hidden className="diary-mandala" />
      {Array.from({ length: 14 }).map((_, k) => <span key={k} aria-hidden className="diary-mote" style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k * 1.7) % 12}s`, animationDuration: `${14 + (k % 5) * 3}s` }} />)}

      <div className="relative mx-auto flex min-h-[calc(100vh-58px)] max-w-[1180px] flex-col items-center justify-center px-4 py-10">
        {!open ? (
          <div className="flex flex-col items-center">
            <p className="diary-kicker">Śrī Śrīmad Gour Govinda Swāmī Gurudeva</p>
            <div className={`diary-cover-wrap ${opening ? "is-opening" : ""}`} onClick={doOpen} role="button" tabIndex={0} onKeyDown={(k) => k.key === "Enter" && doOpen()} aria-label="Open the diary">
              <div className="diary-cover" style={{ backgroundImage: `${LEATHER}, radial-gradient(120% 90% at 30% 20%, #7a2a1c, #4a140c 60%, #2e0a05)` }}>
                <div className="diary-cover-frame"><Lotus className="diary-emblem" />
                  <h1 className="diary-cover-title">His Diary</h1><p className="diary-cover-sub">Prayers to Śrī Gopāl Jiu</p>
                  <span className="diary-cover-rule" /><p className="diary-cover-count">{entries.length} pages</p></div>
                <span className="diary-strap" />
              </div>
              <div className="diary-pages-edge" />
              <span className="diary-ribbon" />
            </div>
            <button onClick={doOpen} className="diary-open-btn"><BookOpen size={17} />Open the diary</button>
            <p className="mt-3 max-w-md text-center text-[13.5px] text-[#6b4a26]">Throughout his life Śrīla Gurudeva wrote to his beloved Deity. Turn the pages slowly.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex w-full max-w-[1100px] flex-wrap items-center gap-2 text-[13.5px]">
              <button onClick={() => setToc(true)} className="diary-chip"><List size={15} />Contents</button>
              {e?.scan_url && <button onClick={() => setScan(!scan)} className={`diary-chip ${scan ? "is-on" : ""}`}><ScrollText size={15} />{scan ? "Typed text" : "His handwriting"}</button>}
              <span className="md:hidden"><button onClick={() => setMobileSide(mobileSide === "left" ? "right" : "left")} className="diary-chip"><Languages size={15} />{mobileSide === "left" ? "Translation" : "Original"}</button></span>
              <span className="ml-auto hidden text-[#6b4a26] sm:inline">Page {i + 1} of {entries.length}</span>
              <button onClick={() => { navigator.clipboard?.writeText(`${location.origin}/gurudeva/diaries/${e.slug}`); }} className="diary-chip" title="Copy a link to this page"><Share2 size={15} /></button>
            </div>

            <div className="diary-book-wrap" onTouchStart={(t) => (touch.current = t.touches[0].clientX)} onTouchEnd={(t) => { if (touch.current === null) return; const d = t.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1)); touch.current = null; }}>
              <div className="diary-book">
                <div className="diary-spine" aria-hidden />
                {/* Desktop: two pages */}
                <div className={`diary-half diary-half-l ${mobileSide === "right" ? "max-md:hidden" : ""}`}><PageFace e={turn?.dir === -1 ? next : e} side="left" scan={scan} n={(turn?.dir === -1 ? turn.to : i) * 2 + 1} /></div>
                <div className={`diary-half diary-half-r ${mobileSide === "left" ? "max-md:hidden" : ""}`}><PageFace e={turn?.dir === 1 ? next : e} side="right" scan={scan} n={(turn?.dir === 1 ? turn.to : i) * 2 + 2} /></div>
                {turn && <div className={`diary-sheet ${turn.dir === 1 ? "turn-next" : "turn-prev"}`}>
                  <div className="diary-face front">{turn.dir === 1 ? <PageFace e={e} side="right" scan={scan} n={i * 2 + 2} /> : <PageFace e={e} side="left" scan={scan} n={i * 2 + 1} />}</div>
                  <div className="diary-face back">{turn.dir === 1 ? <PageFace e={next} side="left" scan={scan} n={turn.to * 2 + 1} /> : <PageFace e={next} side="right" scan={scan} n={turn.to * 2 + 2} />}</div>
                </div>}
              </div>
              <button onClick={() => go(i - 1)} disabled={i === 0} className="diary-arrow left-0 -translate-x-1/2" aria-label="Previous page"><ChevronLeft size={22} /></button>
              <button onClick={() => go(i + 1)} disabled={i >= entries.length - 1} className="diary-arrow right-0 translate-x-1/2" aria-label="Next page"><ChevronRight size={22} /></button>
            </div>

            <div className="mt-7 w-full max-w-[1100px]">
              <div className="diary-years">{years.map(([y, k], n) => { const end = years[n + 1]?.[1] ?? entries.length; const on = i >= k && i < end; return <button key={y} onClick={() => go(k)} className={on ? "is-on" : ""} style={{ flexGrow: Math.max(1, end - k) }}><span>{y}</span></button>; })}</div>
              <input type="range" min={0} max={entries.length - 1} value={i} onChange={(ev) => setI(Number(ev.target.value))} className="diary-range" aria-label="Move through the diary" />
            </div>
          </>
        )}
      </div>

      {toc && <div className="fixed inset-0 z-[60] flex bg-[#2a1406]/40 backdrop-blur-[2px]" onMouseDown={(ev) => ev.target === ev.currentTarget && setToc(false)}>
        <aside className="diary-toc">
          <div className="flex items-center justify-between"><p className="text-[18px] font-bold text-[#5a1d14]">Contents</p><button onClick={() => setToc(false)} className="rounded-full p-1.5 hover:bg-[#efe1c4]"><X size={18} /></button></div>
          <div className="relative mt-3"><Search size={15} className="absolute left-3 top-2.5 text-[#a07a45]" /><input autoFocus value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Search the diary" className="h-9 w-full rounded-full border border-[#e2cfa6] bg-[#fffaf0] pl-9 pr-3 text-[14px] outline-none focus:border-[#a0522d]" /></div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {(found || entries.map((e2, k) => ({ e: e2, k }))).map(({ e: x, k }, n, arr) => { const y = x.date ? x.date.slice(0, 4) : "Undated"; const showY = !found && (n === 0 || (arr[n - 1].e.date || "").slice(0, 4) !== (x.date || "").slice(0, 4)); return (
              <div key={x.slug}>{showY && <p className="mb-1 mt-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#a0522d]">{y}</p>}
                <button onClick={() => { setToc(false); go(k); }} className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f4e6c8] ${k === i ? "bg-[#f1dfb8]" : ""}`}><span className="block text-[13px] italic text-[#8a6237]">{longDate(x)}</span><span className="line-clamp-1 text-[14px] text-[#3a2410]">{x.title || x.translation?.slice(0, 80) || x.place}</span></button></div>); })}
            {found && !found.length && <p className="p-4 text-center text-[14px] text-[#8a6237]">No page mentions “{q}”.</p>}
          </div>
        </aside>
      </div>}
    </section>
  );
}

const CSS = `
.diary-stage{background:radial-gradient(120% 80% at 50% 0%,#f3e6cc 0%,#e7d2ab 45%,#cfb183 100%);color:#3a2410}
.diary-glow{position:absolute;inset:-20% -10% auto;height:70%;background:radial-gradient(50% 60% at 50% 40%,rgba(255,214,140,.55),transparent 70%);animation:diaryGlow 7s ease-in-out infinite alternate;z-index:-1}
.diary-mandala{position:absolute;left:50%;top:50%;width:1100px;height:1100px;margin:-550px 0 0 -550px;opacity:.07;z-index:-1;background:currentColor;color:#7a3a06;-webkit-mask:url(/ornaments/vector/mandala-gold.svg) center/contain no-repeat;mask:url(/ornaments/vector/mandala-gold.svg) center/contain no-repeat;animation:diarySpin 240s linear infinite}
.diary-mote{position:absolute;bottom:-10px;width:4px;height:4px;border-radius:50%;background:#fff3c8;box-shadow:0 0 8px 2px rgba(255,220,150,.8);opacity:0;animation:diaryMote linear infinite;z-index:-1}
@keyframes diaryMote{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.8}90%{opacity:.6}100%{transform:translateY(-105vh) translateX(40px);opacity:0}}
@keyframes diaryGlow{from{opacity:.7}to{opacity:1}}@keyframes diarySpin{to{transform:rotate(360deg)}}
.diary-kicker{margin-bottom:22px;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#7a4a1c;font-weight:600}
.diary-cover-wrap{position:relative;width:min(380px,78vw);aspect-ratio:3/4.1;perspective:1800px;cursor:pointer;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
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
.diary-open-btn{margin-top:46px;display:inline-flex;align-items:center;gap:8px;height:46px;padding:0 26px;border-radius:999px;background:linear-gradient(180deg,#7a2a1c,#4a140c);color:#f6dca6;font-weight:600;font-size:15px;box-shadow:0 14px 30px -14px rgba(60,20,5,.9),inset 0 1px 0 rgba(255,220,170,.25);transition:transform .25s}
.diary-open-btn:hover{transform:translateY(-2px)}
.diary-chip{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:999px;background:rgba(255,250,238,.75);border:1px solid #dcc394;color:#5a3414;font-weight:500;backdrop-filter:blur(4px)}
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
.diary-lines{background:repeating-linear-gradient(180deg,transparent 0 33px,rgba(120,150,190,.18) 33px 34px);mask:linear-gradient(180deg,transparent,#000 6%,#000 94%,transparent)}
.diary-date{font-family:"Gentium Book Plus",Georgia,serif;font-style:italic;font-size:clamp(15px,1.6vw,19px);color:#7a2a1c}
.diary-place{margin-top:2px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a07a45}
.diary-label{font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;color:#a07a45;font-weight:600}
.diary-text{font-family:"Gentium Book Plus",Georgia,serif;font-size:clamp(15.5px,1.45vw,18px);line-height:34px;color:#2c1a0b}
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
.diary-range{width:100%;margin-top:10px;accent-color:#7a2a1c}
.diary-toc{display:flex;flex-direction:column;width:min(380px,90vw);height:100%;padding:20px;background:#fbf2dc;background-image:${PAPER};box-shadow:20px 0 40px -20px rgba(40,15,5,.6);animation:diaryToc .35s ease}
@keyframes diaryToc{from{transform:translateX(-100%)}to{transform:none}}
@media (max-width:767px){.diary-book{grid-template-columns:1fr;height:72vh}.diary-spine{display:none}.diary-half-l,.diary-half-r{border-radius:6px}.diary-sheet{display:none}.diary-arrow{width:40px;height:40px}}
@media (prefers-reduced-motion:reduce){.diary-mote,.diary-mandala,.diary-glow,.diary-ink{animation:none}}
`;
