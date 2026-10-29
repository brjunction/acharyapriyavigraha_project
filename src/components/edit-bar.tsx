"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PenLine, PanelsTopLeft, LayoutDashboard, X } from "lucide-react";
import { isDynamic } from "@/lib/cms/dynamic";

/** A small bar for signed-in editors: edit this page, edit menus, open the Studio. Visitors never see it. */
export function EditBar() {
  const path = usePathname();
  const [on, setOn] = useState(false); const [page, setPage] = useState<{ id: string } | null | undefined>(undefined); const [hide, setHide] = useState(false);
  useEffect(() => { setOn(document.cookie.split("; ").some((c) => c === "tj_editor=1")); }, []);
  useEffect(() => { if (!on) return; setPage(undefined); fetch(`/api/admin/pages?path=${encodeURIComponent(path)}`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setPage).catch(() => setOn(false)); }, [on, path]);
  if (!on || hide) return null;
  const make = async () => {
    if (!confirm("This page has a designed layout. Make your own editable page at this address? Your page will be shown here instead once you publish it.")) return;
    const title = document.querySelector("h1")?.textContent?.trim() || "Untitled";
    const r = await fetch("/api/admin/pages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, title }) });
    const j = await r.json(); if (!r.ok) return alert(j.error || "Could not create the page."); window.location.href = `/admin/pages/${j.id}`;
  };
  const btn = "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium transition";
  return (
    <div className="fixed bottom-4 left-1/2 z-[140] flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-white/95 p-1 shadow-[0_12px_40px_-12px_rgba(40,20,5,.45)] backdrop-blur">
      {page ? <a href={`/admin/pages/${page.id}`} className={`${btn} bg-saffron text-white`}><PenLine size={15} />Edit this page</a>
        : page === null && !isDynamic(path) && path !== "/" ? <button onClick={make} className={`${btn} bg-saffron text-white`}><PenLine size={15} />Make this page editable</button> : page === undefined ? <span className={`${btn} text-ink-3`}>…</span> : null}
      <a href="/admin/menus" className={`${btn} text-ink-2 hover:bg-band`}><PanelsTopLeft size={15} />Menus</a>
      <a href="/admin" className={`${btn} text-ink-2 hover:bg-band`}><LayoutDashboard size={15} />Studio</a>
      <button onClick={() => setHide(true)} aria-label="Hide" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:bg-band"><X size={15} /></button>
    </div>
  );
}
