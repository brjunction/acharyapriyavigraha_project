"use client";
import { Sun, Moon, Coffee, Monitor, RotateCcw } from "lucide-react";
import { usePrefs } from "./providers";
import { LANGUAGES } from "@/lib/data";

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: React.ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-xl bg-band p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)} aria-pressed={value === o.v}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-1.5 py-1.5 text-[12.5px] transition ${value === o.v ? "bg-surface font-medium text-ink shadow-[var(--shadow-sm)]" : "text-ink-3 hover:text-ink"}`}>{o.label}</button>
      ))}
    </div>
  );
}
const Row = ({ label, children, aside }: { label: string; children: React.ReactNode; aside?: React.ReactNode }) => (
  <div><div className="mb-1.5 flex items-center justify-between text-[12.5px] font-medium text-ink-2"><span>{label}</span>{aside}</div>{children}</div>
);

export function SettingsPanel({ compact = false }: { compact?: boolean }) {
  const { prefs, set, reset } = usePrefs();
  return (
    <div className="space-y-4">
      {!compact && <div className="flex items-center justify-between"><p className="font-serif text-lg">Settings</p><button onClick={reset} className="flex items-center gap-1 text-[12px] text-ink-3 hover:text-saffron"><RotateCcw size={12} />Reset</button></div>}
      <Row label="Language">
        <select value={prefs.lang} onChange={(e) => set("lang", e.target.value)} className="h-9 w-full rounded-xl border border-line bg-surface px-3 text-[13.5px] text-ink outline-none focus:border-saffron">
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}{l.native !== l.name ? ` · ${l.name}` : ""}</option>)}
        </select>
      </Row>
      <Row label="Reading size" aside={<span className="tabular text-ink-3">{prefs.size}px</span>}>
        <div className="flex items-center gap-3"><span className="text-xs text-ink-3">A</span>
          <input type="range" min={14} max={24} value={prefs.size} onChange={(e) => set("size", +e.target.value)} className="flex-1 accent-[var(--saffron)]" aria-label="Reading size" />
          <span className="text-lg text-ink-3">A</span></div>
      </Row>
      <Row label="Reading font (transcripts, books)">
        <Seg value={prefs.font} onChange={(v) => set("font", v)} options={[{ v: "sans", label: "Inter" }, { v: "serif", label: <span style={{ fontFamily: "var(--font-reading-serif)" }}>Gentium</span> }]} />
      </Row>
      <Row label="Line spacing">
        <Seg value={prefs.leading} onChange={(v) => set("leading", v)} options={[{ v: "compact", label: "Compact" }, { v: "comfortable", label: "Comfortable" }, { v: "spacious", label: "Spacious" }]} />
      </Row>
      <Row label="Audio speed">
        <Seg value={prefs.speed} onChange={(v) => set("speed", v)} options={[0.75, 1, 1.25, 1.5, 2].map((v) => ({ v, label: `${v}×` }))} />
      </Row>
      <div className="space-y-1 border-t border-line pt-3">
        {([["diacritics", "Show diacritics (Śrīmad)"], ["reduceMotion", "Reduce motion"]] as const).map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-center justify-between rounded-lg py-1.5 text-[13.5px]">
            {l}
            <span className="relative inline-flex">
              <input type="checkbox" checked={prefs[k] as boolean} onChange={(e) => set(k, e.target.checked)} className="peer sr-only" />
              <span className="h-5 w-9 rounded-full bg-line-strong transition peer-checked:bg-saffron" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
