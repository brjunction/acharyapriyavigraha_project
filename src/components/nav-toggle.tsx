"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/** Brings the top bar back on pages that start with it hidden (page setting). The visitor "hide the bar" button was removed. */
export function NavToggle() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const sync = () => setHidden(document.documentElement.classList.contains("nav-hidden"));
    sync(); window.addEventListener("tj:nav", sync); return () => window.removeEventListener("tj:nav", sync);
  }, []);
  if (!hidden) return null;
  return <button onClick={() => { document.documentElement.classList.remove("nav-hidden"); window.dispatchEvent(new Event("tj:nav")); }} className="fixed left-1/2 top-0 z-50 flex -translate-x-1/2 items-center gap-1 rounded-b-xl border border-t-0 border-line bg-white/95 px-3 py-1 text-[12px] font-medium text-ink-2 shadow-md backdrop-blur hover:text-saffron"><ChevronDown size={14} />Menu</button>;
}
/** Hides the top bar on one page (set in page settings). */
export function HideNavOnPage() {
  useEffect(() => { const h = document.documentElement; h.classList.add("nav-hidden"); window.dispatchEvent(new Event("tj:nav")); return () => { h.classList.remove("nav-hidden"); window.dispatchEvent(new Event("tj:nav")); }; }, []);
  return null;
}
