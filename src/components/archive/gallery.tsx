"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Img } from "@/lib/archive/config";

/** Photos as a grid; click one to view it large, with arrows, captions and keyboard. */
export function Gallery({ images, masonry }: { images: Img[]; masonry?: boolean }) {
  const [at, setAt] = useState<number | null>(null);
  useEffect(() => { if (at === null) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setAt(null); if (e.key === "ArrowRight") setAt((a) => (a! + 1) % images.length); if (e.key === "ArrowLeft") setAt((a) => (a! - 1 + images.length) % images.length); }; window.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [at, images.length]);
  const m = at !== null ? images[at] : null;
  return (
    <>
      <div className={masonry ? "columns-2 gap-3 sm:columns-3 lg:columns-4 [&>button]:mb-3" : "grid grid-cols-2 gap-2 sm:grid-cols-3"}>
        {images.map((x, i) => (
          <button key={x.url + i} onClick={() => setAt(i)} className="group block w-full break-inside-avoid overflow-hidden rounded-lg bg-band text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.url} alt={x.caption || ""} loading="lazy" className={`w-full transition duration-300 group-hover:opacity-90 ${masonry ? "h-auto" : "aspect-square object-cover"}`} />
            {masonry && x.caption && <span className="block px-2 py-1.5 text-[12px] text-ink-2">{x.caption}</span>}
          </button>))}
      </div>
      {m && <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={() => setAt(null)}>
        <div className="flex items-center justify-between px-4 py-3 text-[12.5px] text-white/70"><span>{at! + 1} / {images.length}</span><button aria-label="Close" className="rounded-full p-2 hover:bg-white/10"><X size={20} className="text-white" /></button></div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt={m.caption || ""} className="max-h-full max-w-full object-contain" />
          {images.length > 1 && <><button onClick={() => setAt((at! - 1 + images.length) % images.length)} className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Previous"><ChevronLeft size={22} /></button>
            <button onClick={() => setAt((at! + 1) % images.length)} className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Next"><ChevronRight size={22} /></button></>}
        </div>
        <p className="min-h-[48px] px-4 py-3 text-center text-[13px] text-white/80" onClick={(e) => e.stopPropagation()}>{m.caption}{m.date ? ` · ${m.date}` : ""}</p>
      </div>}
    </>
  );
}
