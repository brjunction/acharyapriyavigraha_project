"use client";
/* A lecture can have two transcriptions: the devotees' (checked) and an automatic one (e.g. TwinMind). The devotees' is shown first;
   the automatic one when it is the only one, clearly marked — and a switch when both exist. */
import { useState } from "react";
import { Bot, Users } from "lucide-react";

export function TranscriptSwitch({ devotee, auto, source, first = "d" }: { devotee: React.ReactNode | null; auto: React.ReactNode | null; source?: string | null; first?: "d" | "a" }) {
  const [v, setV] = useState<"d" | "a">(devotee && auto ? first : devotee ? "d" : "a");
  const note = <p className="mb-4 flex items-start gap-2 rounded-lg border border-[#e9d8ff] bg-[#f8f3ff] px-3 py-2 text-[12.5px] leading-relaxed text-[#4b2a85]"><Bot size={15} className="mt-0.5 shrink-0" />Automatic transcription{source ? ` (${source})` : ""} — not yet checked by devotees. It may contain mistakes.</p>;
  return (
    <div>
      {devotee && auto && <div className="mb-4 inline-flex rounded-full border border-line bg-band/60 p-0.5 text-[12.5px]">
        <button onClick={() => setV("d")} className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${v === "d" ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3"}`}><Users size={13} />Devotees</button>
        <button onClick={() => setV("a")} className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${v === "a" ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3"}`}><Bot size={13} />AI / automatic</button>
      </div>}
      {v === "a" && note}
      <div className={v === "d" ? "" : "hidden"}>{devotee}</div>
      <div className={v === "a" ? "" : "hidden"}>{auto}</div>
    </div>
  );
}
