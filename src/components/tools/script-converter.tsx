"use client";
/* Resources › Tools › Script converter: paste text in any script or old font, read it in any other. */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, ScanText, Eraser } from "lucide-react";
import { SCHEMES, checkText, convertText, detectScheme, type Scheme } from "@/lib/script/convert";

type Mode = "auto" | "sanskrit" | "text";
const name = (s: Scheme) => SCHEMES.find((x) => x.value === s)?.label ?? s;
const EXAMPLES: [string, string][] = [["IAST", "dharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ"], ["Balaram font", "Çré Kåñëa Caitanya Prabhu Nityänanda"], ["Devanāgarī", "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे"]];
const SEL = "h-10 max-w-full appearance-none rounded-full border border-line bg-white bg-[length:12px] bg-[right_14px_center] bg-no-repeat pl-4 pr-9 text-[13.5px] text-ink outline-none transition hover:border-line-strong focus:border-ink/40";
const ARROW = { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")" };

export function ScriptConverter() {
  const [from, setFrom] = useState<Scheme | "auto">("auto"); const [to, setTo] = useState<Scheme>("devanagari"); const [mode, setMode] = useState<Mode>("auto");
  const [text, setText] = useState(""); const [out, setOut] = useState(""); const [copied, setCopied] = useState(false);
  useEffect(() => { try { const p = JSON.parse(localStorage.getItem("tj_converter") ?? "{}"); if (p.to) setTo(p.to); if (p.from) setFrom(p.from); if (p.mode) setMode(p.mode); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("tj_converter", JSON.stringify({ from, to, mode })); } catch {} }, [from, to, mode]);
  const detected = useMemo(() => (text.trim() ? detectScheme(text) : null), [text]); const src: Scheme = from === "auto" ? detected ?? "iast" : from;
  const check = useMemo(() => (text.trim() ? checkText(text, src) : null), [text, src]); const sanskrit = mode === "auto" ? check?.sanskrit ?? true : mode === "sanskrit";
  useEffect(() => { let live = true; const t = setTimeout(() => { convertText(text, src, to, sanskrit).then((r) => live && setOut(r)).catch(() => live && setOut("")); }, 120); return () => { live = false; clearTimeout(t); }; }, [text, src, to, sanskrit]);
  const copy = async () => { try { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value as Scheme | "auto")} className={SEL} style={ARROW} aria-label="From"><option value="auto">{detected ? `Recognised: ${name(detected)}` : "Recognise the script"}</option>{SCHEMES.map((s) => <option key={s.value} value={s.value}>{s.label} — {s.sub}</option>)}</select>
        <button type="button" onClick={() => { setFrom(to); setTo(src); setText(out); }} className="flex size-10 items-center justify-center rounded-full border border-line text-ink-2 transition duration-300 hover:rotate-180 hover:border-saffron/40 hover:text-saffron" title="Swap" aria-label="Swap"><ArrowLeftRight size={16} /></button>
        <select value={to} onChange={(e) => setTo(e.target.value as Scheme)} className={SEL} style={ARROW} aria-label="To">{SCHEMES.map((s) => <option key={s.value} value={s.value}>{s.label} — {s.sub}</option>)}</select>
        <span className="inline-flex rounded-full bg-band p-1 text-[12.5px] sm:ml-auto">{([["auto", "Recognise"], ["sanskrit", "Sanskrit"], ["text", "Ordinary text"]] as [Mode, string][]).map(([m, l]) => <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1.5 transition ${mode === m ? "bg-white font-medium text-ink shadow-sm" : "text-ink-2"}`}>{l}</button>)}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-1.5"><span className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">{name(src)}{text && <button onClick={() => setText("")} className="flex items-center gap-1 normal-case tracking-normal text-ink-3 hover:text-ink"><Eraser size={13} />Clear</button>}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} spellCheck={false} placeholder="Paste or type text here — in IAST, Devanāgarī, Bengali, Odia, or text copied from an old Balaram-font book" className="w-full resize-y rounded-2xl border border-line bg-white p-4 text-[17px] leading-relaxed outline-none focus:border-ink/40" /></label>
        <div className="grid gap-1.5"><span className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">{name(to)}<button onClick={copy} disabled={!out} className="flex items-center gap-1 rounded-full border border-line px-3 py-1 normal-case tracking-normal text-ink-2 hover:border-saffron/40 hover:text-saffron disabled:opacity-40">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button></span>
          <textarea value={out} readOnly rows={9} className="w-full resize-y rounded-2xl border border-line bg-[#fffaf2] p-4 text-[17px] leading-relaxed outline-none" /></div>
      </div>
      {check ? <p className="inline-flex w-fit items-center gap-2 rounded-full bg-band px-3 py-1.5 text-[12.5px] text-ink-2"><ScanText size={14} />{check.sanskrit ? "Looks like Sanskrit" : "Looks like ordinary text"}{!check.sure && " (not sure)"} — {check.reasons.join(", ")}</p>
        : <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">Try:{EXAMPLES.map(([l, t]) => <button key={l} onClick={() => setText(t)} className="rounded-full border border-line px-3 py-1 text-ink-2 hover:border-saffron/40 hover:text-saffron">{l}</button>)}</div>}
      <div className="grid gap-2 rounded-2xl border border-line p-5 text-[13.5px] leading-relaxed text-ink-2">
        <p><b className="text-ink">Sanskrit</b> is converted as Sanskrit: IAST words written apart are joined by sandhi in Devanāgarī, Bengali and Odia, compound hyphens are dropped, and a final virāma is kept. <b className="text-ink">Ordinary text</b> (English, or Bengali, Hindi and Odia as languages) is converted letter by letter.</p>
        <p><b className="text-ink">Balaram font</b>: many older books were set in the Balaram font, where ä stands for ā, ç for ś, å for ṛ and so on. Text copied from such files becomes proper diacritics here.</p>
      </div>
    </div>);
}
