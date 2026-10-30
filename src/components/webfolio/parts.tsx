"use client";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

/** “On this page”: the headings of the article, with the one being read marked. */
export function OnThisPage() {
  const [hs, setHs] = useState<{ id: string; text: string; sub: boolean }[]>([]); const [at, setAt] = useState("");
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("#folio-article h2[id], #folio-article h3[id]"));
    setHs(els.map((e) => ({ id: e.id, text: e.textContent || "", sub: e.tagName === "H3" })));
    const io = new IntersectionObserver((xs) => xs.forEach((x) => x.isIntersecting && setAt(x.target.id)), { rootMargin: "-15% 0px -75% 0px" });
    els.forEach((e) => io.observe(e)); return () => io.disconnect();
  }, []);
  if (hs.length < 2) return null;
  return (
    <div className="sticky top-20 max-h-[calc(100dvh-110px)] overflow-y-auto text-[12.5px] [scrollbar-width:thin]">
      <p className="mb-2 font-medium text-zinc-900">On this page</p>
      <ul className="space-y-1 border-l border-zinc-200">{hs.slice(0, 300).map((h) => <li key={h.id}><a href={`#${h.id}`} className={`-ml-px block border-l py-0.5 leading-snug ${h.sub ? "pl-6" : "pl-3"} ${at === h.id ? "border-zinc-900 text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}>{h.text}</a></li>)}</ul>
    </div>
  );
}
/** Copies the text of the page, to paste anywhere. */
export function CopyPage() {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { const el = document.getElementById("folio-article"); navigator.clipboard?.writeText(el?.innerText || ""); setOk(true); setTimeout(() => setOk(false), 1500); }} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-50">{ok ? <Check size={14} /> : <Copy size={14} />}{ok ? "Copied" : "Copy page"}</button>;
}
