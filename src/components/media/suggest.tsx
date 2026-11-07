"use client";
/* “Suggest an improvement”: visitors send a suggestion about the transcription (select the words first and they are quoted),
   or more information about the recording. It goes to the Studio to be reviewed. */
import { useEffect, useRef, useState } from "react";
import { Check, MessageSquarePlus, X } from "lucide-react";

export function SuggestButton({ slug, label = "Suggest an improvement", about = "transcript", className = "" }: { slug: string; label?: string; about?: "transcript" | "info"; className?: string }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState({ about: about as string, quote: "", text: "", name: "", email: "", website: "" });
  const [state, setState] = useState<"" | "sending" | "sent" | string>("");
  // the visitor's name and email are remembered on this device, so many suggestions can be sent one after another
  useEffect(() => { try { const w = JSON.parse(localStorage.getItem("tj_suggest_who") || "{}"); setF((x) => ({ ...x, name: w.name || "", email: w.email || "" })); } catch {} }, []);
  const start = (quote?: string) => { const sel = quote ?? (typeof window !== "undefined" ? String(window.getSelection() || "").trim().slice(0, 1500) : ""); setF((x) => ({ ...x, about: sel ? "transcript" : about, quote: sel, text: "" })); setState(""); setOpen(true); };
  // “Suggest” from a selection in the transcription opens this form with the words already quoted
  useEffect(() => { if (about !== "transcript") return; const h = (e: Event) => start((e as CustomEvent).detail?.quote || ""); window.addEventListener("tj-suggest", h); return () => window.removeEventListener("tj-suggest", h); });
  const send = async () => {
    setState("sending");
    try { const r = await fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, slug }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not send."); try { localStorage.setItem("tj_suggest_who", JSON.stringify({ name: f.name, email: f.email })); } catch {} setState("sent"); setF((x) => ({ ...x, quote: "", text: "" })); }
    catch (e: any) { setState(e.message); }
  };
  const inp = "w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-saffron";
  return (<>
    <button onClick={() => start()} className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 hover:border-saffron hover:text-saffron ${className}`}><MessageSquarePlus size={14} />{label}</button>
    {open && <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/20 p-3 sm:items-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.4)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="text-[16px] font-semibold text-ink">Share a suggestion</p><button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-3 hover:text-ink"><X size={18} /></button></div>
        {state === "sent" ? <div className="py-6 text-center"><Check className="mx-auto mb-2 text-ok" /><p className="text-[14px] text-ink">Thank you — your suggestion has been received.</p><div className="mt-4 flex justify-center gap-3"><button onClick={() => setState("")} className="rounded-full bg-saffron px-4 py-2 text-[13px] font-semibold text-white">Send another</button><button onClick={() => setOpen(false)} className="rounded-full border border-line px-4 py-2 text-[13px] text-ink-2">Close</button></div>{f.name && <p className="mt-3 text-[12px] text-ink-3">Sending as {f.name}</p>}</div> : <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-band p-0.5 text-[12.5px]">{([["transcript", "The transcription"], ["info", "About the recording"]] as const).map(([k, l]) => <button key={k} onClick={() => setF({ ...f, about: k })} className={`rounded-md px-2 py-1.5 ${f.about === k ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>
          {f.about === "transcript" && <label className="block text-[12px] text-ink-3">The passage <span className="text-ink-3/70">(select it on the page before pressing the button)</span><textarea value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} rows={2} className={`${inp} mt-1`} /></label>}
          <label className="block text-[12px] text-ink-3">{f.about === "transcript" ? "Your suggestion" : "What you know — date, place, verse, who is speaking, the occasion…"}<textarea value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} rows={4} className={`${inp} mt-1`} /></label>
          <div className="grid gap-2 sm:grid-cols-2"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name (optional)" className={inp} /><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email, if we may ask you (optional)" className={inp} /></div>
          <input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {state && state !== "sending" && <p className="text-[12.5px] text-red-600">{state}</p>}
          <button onClick={send} disabled={state === "sending" || f.text.trim().length < 3} className="w-full rounded-full bg-saffron py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50">{state === "sending" ? "Sending…" : "Send"}</button>
        </div>}
      </div>
    </div>}
  </>);
}

/** Select any words inside this area and a small “Suggest” button appears beside them. */
export function SelectToSuggest({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null); const [at, setAt] = useState<{ x: number; y: number; q: string } | null>(null);
  useEffect(() => {
    const check = () => setTimeout(() => {
      const sel = window.getSelection(); const q = String(sel || "").trim();
      if (!sel || !q || q.length < 2 || !box.current || !sel.rangeCount || !box.current.contains(sel.getRangeAt(0).commonAncestorContainer)) { setAt(null); return; }
      const r = sel.getRangeAt(0).getBoundingClientRect(); setAt({ x: r.left + r.width / 2, y: r.top, q: q.slice(0, 1500) });
    }, 10);
    const hide = () => setAt(null);
    document.addEventListener("mouseup", check); document.addEventListener("touchend", check); document.addEventListener("keyup", check); window.addEventListener("scroll", hide, { passive: true });
    return () => { document.removeEventListener("mouseup", check); document.removeEventListener("touchend", check); document.removeEventListener("keyup", check); window.removeEventListener("scroll", hide); };
  }, []);
  return (
    <div ref={box} className="relative">
      {children}
      {at && <button onMouseDown={(e) => e.preventDefault()} onClick={() => { window.dispatchEvent(new CustomEvent("tj-suggest", { detail: { quote: at.q } })); setAt(null); }}
        className="fixed z-[90] flex -translate-x-1/2 -translate-y-[calc(100%+8px)] items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,.5)]" style={{ left: at.x, top: at.y }}>
        <MessageSquarePlus size={14} />Suggest
      </button>}
    </div>
  );
}
