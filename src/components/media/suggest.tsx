"use client";
/* “Suggest an improvement”. Select words in the transcription and the whole paragraph opens in a small editor:
   correct it — words, diacritics, bold, italic — and send. Nothing changes on the website: the suggestion waits in the
   Studio, where a manager sees exactly what changed and accepts or declines it. A note, or information about the
   recording, can be sent too. */
import { useEffect, useRef, useState } from "react";
import { Check, MessageSquarePlus, X, Bold, Italic, RotateCcw, Undo2, Redo2, RemoveFormatting } from "lucide-react";

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

/** A small rich text box: Bold, Italic, Clear formatting, Undo, Redo — and IAST by tapping Shift after a letter. */
function Rich({ boxRef, minH = 110, placeholder, onInput, onReset }: { boxRef: React.RefObject<HTMLDivElement | null>; minH?: number; placeholder?: string; onInput?: () => void; onReset?: () => void }) {
  const cmd = (c: string) => { boxRef.current?.focus(); document.execCommand(c, false); onInput?.(); };
  const b = "inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12.5px] text-ink-2 hover:bg-band";
  return (
    <div className="rounded-xl border border-line focus-within:border-saffron">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("bold")} title="Bold (Ctrl+B)" className={b}><Bold size={14} /><span className="max-sm:hidden">Bold</span></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("italic")} title="Italic (Ctrl+I)" className={b}><Italic size={14} /><span className="max-sm:hidden">Italic</span></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("removeFormat")} title="Clear formatting" className={b}><RemoveFormatting size={14} /><span className="max-sm:hidden">Plain</span></button>
        <span className="mx-1 h-5 w-px bg-line" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("undo")} title="Undo (Ctrl+Z)" className={b}><Undo2 size={14} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd("redo")} title="Redo (Ctrl+Y)" className={b}><Redo2 size={14} /></button>
        {onReset && <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onReset} title="Start again" className={`${b} ml-auto text-ink-3`}><RotateCcw size={13} /><span className="max-sm:hidden">Start again</span></button>}
      </div>
      <div ref={boxRef} contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={onInput} className="overflow-y-auto px-3.5 py-3 text-[15px] leading-[1.75] text-ink outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 empty:before:text-ink-3 empty:before:content-[attr(data-placeholder)]" style={{ minHeight: minH, maxHeight: "40dvh" }} onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }} />
      <p className="border-t border-line px-3 py-1.5 text-[11.5px] text-ink-3">Diacritics: type a letter, then tap <kbd className="rounded border border-line px-1">Shift</kbd> — a → ā, r → ṛ, n → ṇ → ṅ → ñ, s → ś → ṣ</p>
    </div>
  );
}

type Passage = { quote: string; html?: string; text?: string };
export function SuggestButton({ slug, label = "Suggest an improvement", about = "transcript", className = "" }: { slug: string; label?: string; about?: "transcript" | "info"; className?: string }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState({ about: about as string, quote: "", text: "", name: "", email: "", website: "" });
  const [p, setP] = useState<Passage | null>(null); const [mode, setMode] = useState<"edit" | "note">("note");
  const [state, setState] = useState<"" | "sending" | "sent" | string>(""); const opened = useRef(0); const ed = useRef<HTMLDivElement>(null); const note = useRef<HTMLDivElement>(null); const [noteLen, setNoteLen] = useState(0);
  useEffect(() => { try { const w = JSON.parse(localStorage.getItem("tj_suggest_who") || "{}"); setF((x) => ({ ...x, name: w.name || "", email: w.email || "" })); } catch {} }, []);
  const start = (pass?: Passage) => {
    const sel = pass?.quote ?? (typeof window !== "undefined" ? String(window.getSelection() || "").trim().slice(0, 1500) : "");
    setP(pass?.html ? pass : null); setMode(pass?.html ? "edit" : "note");
    setF((x) => ({ ...x, about: sel ? "transcript" : about, quote: sel, text: "" })); setState(""); opened.current = Date.now(); setOpen(true);
  };
  useEffect(() => { if (open && mode === "edit" && p?.html && ed.current) ed.current.innerHTML = cleanHtml(p.html); }, [open, mode, p]);
  useEffect(() => { if (about !== "transcript") return; const h = (e: Event) => start((e as CustomEvent).detail as Passage); window.addEventListener("tj-suggest", h); return () => window.removeEventListener("tj-suggest", h); });
  const send = async () => {
    const noteMd = note.current ? toMd(note.current) : ""; const proposed = mode === "edit" && ed.current ? toMd(ed.current) : ""; const original = mode === "edit" && p ? (p.text || "").replace(/\s+/g, " ").trim() : "";
    if (mode === "edit" && proposed.replace(/\*/g, "") === original && !proposed.includes("*") && !noteMd) { setState("Nothing has been changed in the passage yet."); return; }
    setState("sending");
    try { const r = await fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, text: noteMd, slug, proposed, original, t: Date.now() - opened.current }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not send."); try { localStorage.setItem("tj_suggest_who", JSON.stringify({ name: f.name, email: f.email })); } catch {} setState("sent"); setF((x) => ({ ...x, quote: "", text: "" })); setNoteLen(0); }
    catch (e: any) { setState(e.message); }
  };
  const inp = "w-full rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-saffron";
  const canSend = mode === "edit" ? true : noteLen >= 3;
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
            <Rich boxRef={ed} minH={120} onReset={() => { if (ed.current && p.html) ed.current.innerHTML = cleanHtml(p.html); }} />
            <p className="mb-1 mt-3 text-[12px] text-ink-3">A note for the team <span className="text-ink-3/70">(optional)</span></p>
            <Rich boxRef={note} minH={60} onInput={() => setNoteLen((note.current?.textContent || "").trim().length)} />
          </div> : <>
            {f.about === "transcript" && f.quote && <blockquote className="rounded-md border-l-2 border-line-strong bg-band/60 px-3 py-2 text-[13px] text-ink-2">{f.quote}</blockquote>}
            {f.about === "transcript" && !f.quote && <p className="rounded-lg bg-band/60 px-3 py-2 text-[12.5px] leading-relaxed text-ink-2">To correct a passage directly, close this, <b>select the words</b> in the transcription and press <b>Suggest a correction</b> — the whole paragraph opens to edit.</p>}
            <p className="mb-1 text-[12px] text-ink-3">{f.about === "transcript" ? "Your suggestion" : "What you know — date, place, verse, who is speaking, the occasion…"}</p>
            <Rich boxRef={note} minH={110} onInput={() => setNoteLen((note.current?.textContent || "").trim().length)} />
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
