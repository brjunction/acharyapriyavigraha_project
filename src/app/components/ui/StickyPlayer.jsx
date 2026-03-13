"use client";

import { useState } from "react";
import AudioPlayer from "./AudioPlayer";

export default function StickyPlayer({ audioUrl, title, type, typeStyle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-[#8c2044] border-b border-stone-800 shadow-sm">
      <div className="max-w-10xl mx-auto px-6">
        {/* ── Control bar — always visible ── */}
        <div className="flex items-center gap-3 py-4">
          {/* Type badge */}
          <span
            className={`
            shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border
            text-[10px] font-bold tracking-wider uppercase
            ${typeStyle.pill} text-[#8c2044] border-[#8c2044]/50
            ring-1 ring-white/30
          `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
            {type}
          </span>

          {/* Title */}
          <p className="flex-1 min-w-0 text-sm font-semibold text-white truncate">
            {title}
          </p>

          {/* Toggle button */}
          <button
            onClick={() => setOpen((o) => !o)}
            className={`
    shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg border
    text-xs font-bold tracking-wide transition-all
    ${
      open
        ? "bg-white/30 text-white border-white hover:bg-white/40 hover:text-white"
        : "bg-white text-[#8c2044] border-white/50 hover:bg-white/50 hover:text-[#8c2044]"
    }
  `}
          >
            {open ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                Hide Player
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Show Player
              </>
            )}
          </button>
        </div>

        {/* ── Collapsible player ── */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "300px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div className="pb-4">
            {audioUrl ? (
              <AudioPlayer audioUrl={audioUrl} title={title} />
            ) : (
              <div className="h-20 rounded-xl bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center gap-2 text-xs text-stone-400">
                <svg
                  className="w-4 h-4 text-stone-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
                Audio not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
