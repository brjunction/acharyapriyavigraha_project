"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GURUDEVA_TABS } from "./tabs";


const PROJECT = ["/gurudeva/iskcon-bhubaneswar", "/gurudeva/temples", "/gurudeva/projects-in-his-relation", "/gurudeva/taptajivanam-projects"];

/** One row of tabs across every part of Śrīla Gurudeva’s section, so you can move between them anywhere. */
export function GurudevaNav() {
  const path = usePathname(); const ref = useRef<HTMLDivElement>(null);
  const cur = PROJECT.some((p) => path.startsWith(p)) ? "/gurudeva/projects" : [...GURUDEVA_TABS].map((t) => t[0]).filter((h) => h === "/gurudeva" ? path === h : path === h || path.startsWith(h + "/")).pop() || "";
  useEffect(() => { ref.current?.querySelector("[data-on]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [cur]);
  return (
    <div className="border-b border-line bg-white">
      <div ref={ref} className="mx-auto flex max-w-[1240px] gap-0.5 overflow-x-auto px-3 [scrollbar-width:none] sm:px-5">
        {GURUDEVA_TABS.map(([h, l, I]) => <Link key={h} href={h} {...(cur === h ? { "data-on": "" } : {})} className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[12.5px] transition ${cur === h ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}><I size={14} />{l}</Link>)}
      </div>
    </div>
  );
}
