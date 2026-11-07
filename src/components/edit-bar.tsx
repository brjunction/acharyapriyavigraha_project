"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PenLine, PanelsTopLeft, LayoutDashboard, Minus, Image as ImageIcon, MoreHorizontal, Files, Megaphone, Settings, Headphones, Clapperboard, BookOpen, FileText, Clock, NotebookPen, Users, Music, Newspaper, Network, Library } from "lucide-react";
import { isDynamic, adminOf } from "@/lib/cms/dynamic";

/** Which part of the Studio looks after the page you are on. */
const CONTEXT: [string, string, string, typeof PenLine][] = [
  ["/teachings/audio", "/admin/audio", "audio lectures", Headphones], ["/teachings/videos", "/admin/videos", "videos", Clapperboard], ["/teachings/kirtans", "/admin/kirtans", "kīrtanas", Music],
  ["/teachings/books", "/admin/books", "books", BookOpen], ["/teachings/articles", "/admin/articles", "articles", FileText], ["/teachings/magazines", "/admin/magazines", "magazines", Newspaper],
  ["/teachings", "/admin/compilations", "compilations", Library], ["/gurudeva/timeline", "/admin/timeline", "the timeline", Clock], ["/gurudeva/diaries", "/admin/diary", "the diary", NotebookPen],
  ["/guru-maharaja/timeline", "/admin/timeline", "the timeline", Clock], ["/guru-maharaja/schedule", "/admin/schedule", "the schedule", Clock], ["/tattva", "/admin/topics", "topics", Network], ["/webfolio", "/admin/webfolio", "the WebFolio", Library],
];
const MORE: [string, string, typeof PenLine][] = [
  ["/admin/pages", "All pages", Files], ["/admin/site-pages", "Site pages", Files], ["/admin/announcements", "Announcements", Megaphone], ["/admin/audio", "Audio lectures", Headphones], ["/admin/videos", "Videos & YouTube", Clapperboard],
  ["/admin/books", "Books", BookOpen], ["/admin/articles", "Articles", FileText], ["/admin/timeline", "Timeline", Clock], ["/admin/diary", "Diary", NotebookPen], ["/admin/topics", "Topics", Network], ["/admin/users", "People & access", Users], ["/admin/settings", "Site settings", Settings],
];
const MIN_KEY = "editbar_min";

/** A small bar for signed-in editors, to edit from the page itself. It folds into a pen button and remembers that. Visitors never see it. */
export function EditBar() {
  const path = usePathname();
  const [on, setOn] = useState(false); const [page, setPage] = useState<{ id: string } | null | undefined>(undefined);
  const [min, setMinS] = useState(false); const [more, setMore] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setOn(document.cookie.split("; ").some((c) => c === "tj_editor=1")); try { setMinS(localStorage.getItem(MIN_KEY) === "1"); } catch {} }, []);
  useEffect(() => { if (!on) return; setPage(undefined); fetch(`/api/admin/pages?path=${encodeURIComponent(path)}`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setPage).catch(() => setOn(false)); }, [on, path]);
  useEffect(() => { if (!more) return; const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMore(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [more]);
  if (!on) return null;
  const setMin = (v: boolean) => { setMinS(v); setMore(false); try { localStorage.setItem(MIN_KEY, v ? "1" : "0"); } catch {} };
  if (min) return (
    <button onClick={() => setMin(false)} title="Editing tools" aria-label="Show the editing tools"
      className="fixed bottom-4 left-4 z-[140] flex size-11 items-center justify-center rounded-full bg-saffron text-white shadow-[0_10px_30px_-10px_rgba(40,20,5,.6)] transition hover:scale-105"><PenLine size={18} /></button>
  );
  const make = async () => {
    if (!confirm("This page has a designed layout. Make your own editable page at this address? Your page will be shown here instead once you publish it.")) return;
    const title = document.querySelector("h1")?.textContent?.trim() || "Untitled";
    const r = await fetch("/api/admin/pages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, title }) });
    const j = await r.json(); if (!r.ok) return alert(j.error || "Could not create the page."); window.location.href = `/admin/pages/${j.id}`;
  };
  const ctx = CONTEXT.find(([p]) => path === p || path.startsWith(p + "/"));
  const btn = "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition";
  return (
    <div ref={ref}>
    <div className="fixed bottom-4 left-4 z-[140] flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full border border-line bg-white/95 p-1 shadow-[0_12px_40px_-12px_rgba(40,20,5,.45)] backdrop-blur [scrollbar-width:none]">
      {page ? <a href={`/admin/pages/${page.id}`} className={`${btn} bg-saffron text-white`}><PenLine size={15} />Edit this page</a>
        : page === null && !isDynamic(path) && path !== "/" ? <button onClick={make} className={`${btn} bg-saffron text-white`}><PenLine size={15} />Make this page editable</button> : page === null && isDynamic(path) && adminOf(path) ? <a href={adminOf(path)![0]} className={`${btn} bg-saffron text-white`}><PenLine size={15} />Manage {adminOf(path)![1]}</a> : page === undefined ? <span className={`${btn} text-ink-3`}>…</span> : null}
      {ctx && !(isDynamic(path) && adminOf(path)) && (() => { const I = ctx[3]; return <a href={ctx[1]} className={`${btn} text-ink-2 hover:bg-band`}><I size={15} />Manage {ctx[2]}</a>; })()}
      <a href="/admin/menus" className={`${btn} text-ink-2 hover:bg-band`}><PanelsTopLeft size={15} />Menus</a>
      <a href="/admin/media" className={`${btn} text-ink-2 hover:bg-band`}><ImageIcon size={15} />Photos & files</a>
      <a href="/admin" className={`${btn} text-ink-2 hover:bg-band`}><LayoutDashboard size={15} />Studio</a>
      <button onClick={() => setMore(!more)} aria-expanded={more} className={`${btn} text-ink-2 hover:bg-band ${more ? "bg-band" : ""}`}><MoreHorizontal size={15} />More</button>
      <button onClick={() => setMin(true)} title="Fold away (click the pen to bring it back)" aria-label="Fold away" className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-band"><Minus size={16} /></button>
    </div>
      {more && (
        <div className="fixed bottom-[68px] left-4 z-[141] w-[260px] rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_50px_-14px_rgba(40,20,5,.45)]">
          {MORE.map(([h, l, I]) => <a key={h} href={h} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-ink-2 hover:bg-band hover:text-ink"><I size={15} className="text-saffron" />{l}</a>)}
        </div>)}
    </div>
  );
}
