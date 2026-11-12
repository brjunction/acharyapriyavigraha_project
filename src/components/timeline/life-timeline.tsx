"use client";
/* Life timeline: Simple (the timeline alone) or Advanced (with search and filters beside it). The choice is remembered. */
import { useEffect, useState } from "react";
import { TimelineChapters } from "./chapters";
import type { Era, LifeEvent } from "@/lib/content/timeline-shared";

export function LifeTimeline({ eras, events, recordings }: { eras: Era[]; events: LifeEvent[]; recordings: Record<number, number> }) {
  const [adv, setAdv] = useState(false);
  useEffect(() => { try { setAdv(localStorage.getItem("tj_tl_adv") === "1"); } catch {} }, []);
  const mode = (v: boolean) => { setAdv(v); try { localStorage.setItem("tj_tl_adv", v ? "1" : "0"); } catch {} };
  return <TimelineChapters eras={eras} events={events} recordings={recordings} advanced={adv} onMode={mode} />;
}
