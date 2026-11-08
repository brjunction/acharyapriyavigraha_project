"use client";
/* “Suggest an improvement”. Select words in the transcription and the whole paragraph opens in a small editor:
   correct it — words, diacritics, bold, italic — and send. Nothing changes on the website: the suggestion waits in the
   Studio, where a manager sees exactly what changed and accepts or declines it. A note, or information about the
   recording, can be sent too. */
import { useEffect, useRef, useState } from "react";
import { Check, MessageSquarePlus, X, Bold, Italic, RotateCcw } from "lucide-react";

const MARKS = ["ā", "ī", "ū", "ṛ", "ṝ", "ḷ", "ṅ", "ñ", "ṇ", "ṭ", "ḍ", "ś", "ṣ", "ṁ", "ḥ", "Ā", "Ī", "Ū", "Ś", "Ṣ", "Ṛ", "Ṇ"];
/** Only words, bold and italic are kept from the page. */
function walk(n: Node, html: boolean): string {
  if (n.nodeType === 3) { const t = n.textContent || ""; return html ? t.replace(/&/g, "&amp;").replace(/</g, "&lt;") : t; }
  if (n.nodeType !== 1) return ""; const el = n as HTMLElement; const tag = el.tagName; const inner = Array.from(el.childNodes).map((c) => walk(c, html)).join("");
  if (tag === "BR") return html ? "<br>" : " ";
  if (tag === "B" || tag === "STRONG" || el.style.fontWeight === "bold" || Number(el.style.fontWeight) >= 600) return inner.trim() ? (html ? `<b>${inner}</b>` : `**${inner}**`) : inner;
  if (tag === "I" || tag === "EM" || el.style.fontStyle === "italic") return inner.trim() ? (html ? `<i>${inner}</i>` : `*${inner}*`) : inner;
  if (tag === "DIV" || tag === "P") return inner + (html ? "" : " ");
  return inner;
}
const cleanHtml = (h: string) => { const d = document.createElement("div"); d.innerHTML = h; return Array.from(d.childNodes).map((c) => walk(c, true)).join(""); };
const toMd = (el: HTMLElement) => Array.from(el.childNodes).map((c) => walk(c, false)).join("").replace(/\*\*\s*\*\*/g, "").replace(/\s+/g, " ").trim();

type Passage = { quote: string; html?: string; text?: string };
export function SuggestButton({ slug, label = "Suggest an improvement", about = "transcript", className = "" }: { slug: string; label?: string; about?: "transcript" | "info"; className?: string }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState({ about: about as string, quote: "", text: "", name: "", email: "", website: "" });
  const [p, setP] = useState<Passage | null>(null); const [mode, setMode] = useState<"edit" | "note">("note");
  const [state, setState] = useState<"" | "sending" | "sent" | string>(""); const opened = useRef(0); const ed = useRef<HTMLDivElement>(null);
  useEffect(() => { try { const w = JSON.parse(localStorage.getItem("tj_suggest_who") || "{}"); setF((x) => ({ ...x, name: w.name || "", email: w.email || "" })); } catch {} }, []);
  const start = (pass?: Passage) => {
    const sel = pass?.quote ?? (typeof window !== "undefined" ? String(window.getSelection() || "").trim().slice(0, 1500) : "");
    setP(pass?.html ? pass : null); setMode(pass?.html ? "edit" : "note");
    setF((x) => ({ ...x, about: sel ? "transcript" : about, quote: sel, text: "" })); setState(""); opened.current = Date.now(); setOpen(true);
  };
  useEffect(() => { if (open && mode === "edit" && p?.html && ed.current) ed.current.innerHTML = cleanHtml(p.html); }, [open, mode, p]);
  useEffect(() => { if (about !== "transcript") return; const h = (e: Event) => start((e as CustomEvent).detail as Passage); window.addEventListener("tj-suggest", h); return () => window.removeEventListener("tj-suggest", h); });
  const cmd = (c: string, v?: string) => { ed.current?.focus(); document.execCommand(c, false, v); };
  const send = async () => {
    const proposed = mode === "edit" && ed.current ? toMd(ed.current) : ""; const original = mode === "edit" && p ? (p.text || "").replace(/\s+/g, " ").trim() : "";
    if (mode === "edit" && proposed.replace(/\*/g, "") === original && !proposed.includes("*") && !f.text.trim()) { setState("Nothing has been changed in the passage yet."); return; }
    setState("sending");
    try { const r = await fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, slug, proposed, original, t: Date.now() - opened.current }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not send."); try { localStorage.setItem("tj_suggest_who", JSON.stringify({ name: f.name, email: f.email })); } catch {} setState("sent"); setF((x) => ({ ...x, quote: "", text: "" })); }
    catch (e: any) { setState(e.message); }
  };
  const inp = "w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-saffron";
  const canSend = mode === "edit" ? true : f.text.trim().length >= 3;
  return (<>
    <button onClick={() => start()} className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 hover:border-saffron hover:text-saffron ${className}`}><MessageSquarePlus size={14} />{label}</button>
    {open && <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/20 p-3 sm:items-center" onClick={() => setOpen(false)}>
      <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.4)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="text-[16px] font-semibold text-ink">Suggest an improvement</p><button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-3 hover:text-ink"><X size={18} /></button></div>
        {state === "sent" ? <div className="py-6 text-center"><Check className="mx-auto mb-2 text-ok" /><p className="text-[14px] text-ink">Thank you. Your suggestion will be reviewed by the team before anything is changed.</p><div className="mt-4 flex justify-center gap-3"><button onClick={() => setOpen(false)} className="rounded-full bg-saffron px-4 py-2 text-[13px] font-semibold text-white">Close</button></div></div> : <div className="space-y-3">
          {p?.html ? <div className="grid grid-cols-2 gap-1 rounded-lg bg-band p-0.5 text-[12.5px]">{([["edit", "Correct the passage"], ["note", "Write a note"]] as const).map(([k, l]) => <button key={k} onClick={() => setMode(k)} className={`rounded-md px-2 py-1.5 ${mode === k ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>
            : <div className="grid grid-cols-2 gap-1 rounded-lg bg-band p-0.5 text-[12.5px]">{([["transcript", "The transcription"], ["info", "About the recording"]] as const).map(([k, l]) => <button key={k} onClick={() => setF({ ...f, about: k })} className={`rounded-md px-2 py-1.5 ${f.about === k ? "bg-white font-medium text-ink shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>}
          {mode === "edit" && p?.html ? <div>
            <p className="mb-1.5 text-[12px] text-ink-3">Correct the words below — spelling, diacritics, italics, or words added or removed. Your version is sent for review.</p>
            <div className="rounded-xl border border-line focus-within:border-saffron">
              <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("bold")} title="Bold" className="flex size-8 items-center justify-center rounded-md text-ink-2 hover:bg-band"><Bold size={15} /></button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("italic")} title="Italic" className="flex size-8 items-center justify-center rounded-md text-ink-2 hover:bg-band"><Italic size={15} /></button>
                <span className="mx-1 h-5 w-px bg-line" />
                {MARKS.map((m) => <button key={m} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("insertText", m)} className="h-8 min-w-7 rounded-md px-1 text-[14px] text-ink-2 hover:bg-band">{m}</button>)}
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { if (ed.current && p.html) ed.current.innerHTML = cleanHtml(p.html); }} title="Start again" className="ml-auto flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-band"><RotateCcw size={14} /></button>
              </div>
              <div ref={ed} contentEditable suppressContentEditableWarning className="max-h-[40dvh] min-h-[120px] overflow-y-auto px-3.5 py-3 text-[15px] leading-[1.75] text-ink outline-none" onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }} />
            </div>
            <label className="mt-2 block text-[12px] text-ink-3">A note for the team <span className="text-ink-3/70">(optional)</span><textarea value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} rows={2} className={`${inp} mt-1`} /></label>
          </div> : <>
            {f.about === "transcript" && f.quote && <blockquote className="rounded-md border-l-2 border-line-strong bg-band/60 px-3 py-2 text-[13px] text-ink-2">{f.quote}</blockquote>}
            <label className="block text-[12px] text-ink-3">{f.about === "transcript" ? "Your suggestion" : "What you know — date, place, verse, who is speaking, the occasion…"}<textarea value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} rows={4} className={`${inp} mt-1`} /></label>
          </>}
          <div className="grid gap-2 sm:grid-cols-2"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name (optional)" className={inp} /><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email, if we may ask you (optional)" className={inp} /></div>
          <input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {state && state !== "sending" && <p className="text-[12.5px] text-red-600">{state}</p>}
          <button onClick={send} disabled={state === "sending" || !canSend} className="w-full rounded-full bg-saffron py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50">{state === "sending" ? "Sending…" : "Send for review"}</button>
          <p className="text-center text-[11.5px] text-ink-3">Suggestions are reviewed by the team; nothing on the page changes until then.</p>
        </div>}
      </div>
    </div>}
  </>);
}

/** Select any words inside this area and a small “Suggest” button appears beside them; it opens their whole paragraph to correct. */
export function SelectToSuggest({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null); const [at, setAt] = useState<{ x: number; y: number; q: string; el: HTMLElement | null } | null>(null);
  useEffect(() => {
    const check = () => setTimeout(() => {
      const sel = window.getSelection(); const q = String(sel || "").trim();
      if (!sel || !q || q.length < 2 || !box.current || !sel.rangeCount || !box.current.contains(sel.getRangeAt(0).commonAncestorContainer)) { setAt(null); return; }
      const node = sel.getRangeAt(0).startContainer; const el = (node.nodeType === 1 ? (node as HTMLElement) : node.parentElement)?.closest("p, li, blockquote, h2, h3, h4") as HTMLElement | null;
      const r = sel.getRangeAt(0).getBoundingClientRect(); setAt({ x: r.left + r.width / 2, y: r.top, q: q.slice(0, 1500), el: el && box.current.contains(el) ? el : null });
    }, 10);
    const hide = () => setAt(null);
    document.addEventListener("mouseup", check); document.addEventListener("touchend", check); document.addEventListener("keyup", check); window.addEventListener("scroll", hide, { passive: true });
    return () => { document.removeEventListener("mouseup", check); document.removeEventListener("touchend", check); document.removeEventListener("keyup", check); window.removeEventListener("scroll", hide); };
  }, []);
  return (
    <div ref={box} className="relative">
      {children}
      {at && <button onMouseDown={(e) => e.preventDefault()} onClick={() => { const d = { quote: at.q, html: at.el?.innerHTML, text: at.el?.textContent || "" }; setAt(null); try { window.getSelection()?.removeAllRanges(); } catch {} window.dispatchEvent(new CustomEvent("tj-suggest", { detail: d })); }}
        className="fixed z-[90] flex -translate-x-1/2 -translate-y-[calc(100%+8px)] items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,.5)]" style={{ left: at.x, top: at.y }}>
        <MessageSquarePlus size={14} />Suggest a correction
      </button>}
    </div>
  );
}
