"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type A = { id: string; title: string; body: string; kind: string; cta_label?: string; cta_url?: string };
export function Announcement() {
  const [a, setA] = useState<A | null>(null);
  useEffect(() => {
    fetch("/api/announcement").then((r) => r.json()).then((x: A | null) => {
      if (!x) return;
      try { if (localStorage.getItem("tj_seen_" + x.id)) return; } catch {}
      setTimeout(() => setA(x), 1200);
    }).catch(() => {});
  }, []);
  if (!a) return null;
  const close = () => { try { localStorage.setItem("tj_seen_" + a.id, "1"); } catch {} setA(null); };
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-[#2a1a0e]/50 p-4 backdrop-blur-sm" onClick={close} role="dialog" aria-modal="true" aria-label={a.title}>
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#d9a441]/60 bg-[#fffaf0] p-7 text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-ink-3 hover:bg-band"><X size={18} /></button>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">{a.kind === "event" ? "Event" : a.kind === "new" ? "New on the site" : a.kind === "urgent" ? "Important" : "Announcement"}</p>
        <h2 className="text-[22px] font-bold tracking-[-0.02em]">{a.title}</h2>
        {a.body && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{a.body}</p>}
        <div className="mt-5 flex justify-center gap-2">
          {a.cta_url && <Link href={a.cta_url} onClick={close} className="rounded-xl bg-saffron px-5 py-2.5 text-[14px] font-medium text-white">{a.cta_label || "Learn more"}</Link>}
          <button onClick={close} className="rounded-xl border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink-2">Close</button>
        </div>
      </div>
    </div>
  );
}
