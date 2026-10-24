"use client";
import { useEffect, useState } from "react";
import { Palette, X, Copy, RotateCcw } from "lucide-react";

const TOKENS = [
  { key: "--nav-bg", label: "Navigation bar", def: "#fbe2b8" },
  { key: "--nav-strip", label: "Strip above the hero", def: "#f6f4f1" },
] as const;
const PRESETS = ["#fdf3e1", "#fcebd0", "#fbe2b8", "#f9d9a0", "#f6cd87", "#fff7ea", "#fde7d3", "#f8e2c0"];

/** A private colour panel: open any page with ?tune=1 (it is then remembered in this browser). */
export function ColorTuner() {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const [v, setV] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tune") === "1") localStorage.setItem("tune", "1");
      if (p.get("tune") === "0") localStorage.removeItem("tune");
      if (localStorage.getItem("tune") === "1") setOn(true);
      const saved = JSON.parse(localStorage.getItem("tune-colors") || "{}") as Record<string, string>;
      setV(saved);
      Object.entries(saved).forEach(([k, c]) => document.documentElement.style.setProperty(k, c));
    } catch {}
  }, []);

  const set = (k: string, c: string) => {
    setV((o) => { const n = { ...o, [k]: c }; try { localStorage.setItem("tune-colors", JSON.stringify(n)); } catch {} return n; });
    document.documentElement.style.setProperty(k, c);
  };
  const reset = () => { TOKENS.forEach((t) => document.documentElement.style.removeProperty(t.key)); setV({}); try { localStorage.removeItem("tune-colors"); } catch {} };
  const copy = async () => {
    const txt = TOKENS.map((t) => `${t.label}: ${v[t.key] || t.def}`).join("\n");
    try { await navigator.clipboard.writeText(txt); setCopied("Copied"); setTimeout(() => setCopied(""), 1500); } catch { setCopied("Select and copy the text below"); }
  };

  if (!on) return null;
  if (!open) return <button onClick={() => setOpen(true)} aria-label="Open colour panel" className="fixed bottom-4 left-4 z-[90] flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg"><Palette size={19} /></button>;
  return (
    <div className="fixed bottom-4 left-4 z-[90] w-[290px] rounded-2xl border border-line-strong bg-surface p-4 text-[13px] shadow-[0_20px_50px_-20px_rgba(0,0,0,.5)]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold"><Palette size={16} />Colour panel</span>
        <span className="flex gap-1">
          <button onClick={reset} aria-label="Reset" title="Reset" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-band"><RotateCcw size={14} /></button>
          <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-band"><X size={15} /></button>
        </span>
      </div>
      {TOKENS.map((t) => { const c = v[t.key] || t.def; return (
        <div key={t.key} className="mt-4">
          <p className="text-[12px] font-medium text-ink-2">{t.label}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="color" value={c} onChange={(e) => set(t.key, e.target.value)} aria-label={t.label} className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-0.5" />
            <input value={c} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && set(t.key, e.target.value)} spellCheck={false} className="h-9 w-24 rounded-lg border border-line bg-white px-2 font-mono text-[12.5px]" />
          </div>
          {t.key === "--nav-bg" && <div className="mt-2 flex flex-wrap gap-1.5">{PRESETS.map((p) => <button key={p} onClick={() => set(t.key, p)} aria-label={p} title={p} className="h-6 w-6 rounded-full border border-black/10" style={{ background: p }} />)}</div>}
        </div>
      ); })}
      <button onClick={copy} className="btn mt-4 !h-9 w-full justify-center border border-line-strong text-[12.5px]"><Copy size={14} />{copied || "Copy colours to tell me"}</button>
      <p className="mt-2 text-[11px] leading-snug text-ink-3">Pick a colour; the page changes at once. Send me the hex codes (for example #fbe2b8).</p>
    </div>
  );
}
