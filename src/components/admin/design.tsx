"use client";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FONTS, THEME_DEFAULTS, type Theme } from "@/lib/theme";
import { Btn, api, toast } from "./ui";
import { MediaPicker } from "./media-picker";

const PRESETS: [string, Theme][] = [
  ["Saffron (original)", {}],
  ["Tulasī green", { primary: "#2f6b3f", primaryDeep: "#24532f", primarySoft: "#e5f0e3", page: "#f5f8f3", band: "#e8efe5", headerBg: "#fbfdf9" }],
  ["Lotus pink", { primary: "#a3365a", primaryDeep: "#82294a", primarySoft: "#f9e3ea", page: "#fbf5f5", band: "#f3e7e8", headerBg: "#fffafa" }],
  ["Yamunā blue", { primary: "#2a4f9a", primaryDeep: "#1f3b75", primarySoft: "#e2eaf8", page: "#f4f6fa", band: "#e7ebf3", headerBg: "#fbfcff" }],
  ["Temple gold", { primary: "#8a5a0a", primaryDeep: "#6e4708", primarySoft: "#fbf0d2", page: "#fbf7ee", band: "#f1e8d4", headerBg: "#fffbf2" }],
  ["Maroon", { primary: "#7a1f24", primaryDeep: "#5e171b", primarySoft: "#f6e4e3", page: "#f8f4f1", band: "#efe6e2", headerBg: "#fffaf8" }],
];
const COLS: [keyof Theme, string, string][] = [
  ["primary", "Main colour", "Buttons, links, small titles"], ["primaryDeep", "Main colour, darker", "When a button is pressed"], ["primarySoft", "Main colour, pale", "Soft boxes and highlights"],
  ["page", "Page background", "Behind everything"], ["band", "Band background", "Grey-cream bands and boxes"], ["surface", "Card background", "Inside cards"],
  ["ink", "Text", "Titles"], ["ink2", "Text, softer", "Paragraphs"], ["ink3", "Text, faint", "Dates and small notes"], ["line", "Lines", "Borders and dividers"], ["headerBg", "Top bar", "The menu bar"],
  ["teal", "Teachings colour", "Menu accent"], ["indigo", "Tattva colour", "Menu accent"], ["rose", "Translations colour", "Menu accent"], ["leaf", "About colour", "Menu accent"], ["gold", "Gold accent", "Ornaments"],
];

export function DesignEditor() {
  const [t, setT] = useState<Theme>({}); const [busy, setBusy] = useState(false); const [pic, setPic] = useState(false);
  useEffect(() => { api<Record<string, any>>("/api/admin/settings").then((s) => setT(s.theme || {})).catch(() => {}); }, []);
  const v = (k: keyof Theme) => (t[k] as string) || (THEME_DEFAULTS as any)[k];
  const set = (k: keyof Theme, x: any) => setT((p) => ({ ...p, [k]: x }));
  const save = async () => { setBusy(true); try { await api("/api/admin/settings", "PUT", { theme: t }); toast("Design saved. The website uses it now."); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-[28px] font-bold tracking-[-0.03em]">Design</h1><p className="text-ink-3">Colours, letters and backgrounds of the whole website. Every page follows these.</p></div>
        <div className="flex gap-2"><Btn onClick={() => setT({})}><RotateCcw size={15} />Original</Btn><Btn kind="primary" busy={busy} onClick={save}>Save design</Btn></div></div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Ready-made looks</p>
      <div className="mb-6 flex flex-wrap gap-2">{PRESETS.map(([n, p]) => <button key={n} onClick={() => setT({ ...t, ...Object.fromEntries(Object.keys(THEME_DEFAULTS).map((k) => [k, undefined])), ...p })} className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] hover:border-saffron"><span className="h-4 w-4 rounded-full" style={{ background: p.primary || THEME_DEFAULTS.primary }} />{n}</button>)}</div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 font-bold">Colours</h2>
            <div className="grid gap-3 sm:grid-cols-2">{COLS.map(([k, l, h]) => <label key={k} className="flex items-center gap-3 rounded-xl border border-line p-2.5"><input type="color" value={v(k)} onChange={(e) => set(k, e.target.value)} className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent" /><span className="min-w-0 flex-1"><b className="block text-[13.5px]">{l}</b><span className="text-[12px] text-ink-3">{h}</span></span>{t[k] && <button onClick={() => set(k, undefined)} title="Back to original" className="text-ink-3"><RotateCcw size={13} /></button>}</label>)}</div></section>
          <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 font-bold">Letters</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12.5px] font-semibold text-ink-2">Text font<select value={t.bodyFont || "Inter"} onChange={(e) => set("bodyFont", e.target.value === "Inter" ? undefined : e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-2 font-normal">{FONTS.map((f) => <option key={f}>{f}</option>)}</select></label>
              <label className="text-[12.5px] font-semibold text-ink-2">Title font<select value={t.headingFont || "Inter"} onChange={(e) => set("headingFont", e.target.value === "Inter" ? undefined : e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-2 font-normal">{FONTS.map((f) => <option key={f}>{f}</option>)}</select></label>
              <label className="text-[12.5px] font-semibold text-ink-2">Text size: {t.baseSize || 16}px<input type="range" min={14} max={19} value={t.baseSize || 16} onChange={(e) => set("baseSize", Number(e.target.value) === 16 ? undefined : Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="text-[12.5px] font-semibold text-ink-2">Title weight: {t.headingWeight || 650}<input type="range" min={400} max={800} step={50} value={t.headingWeight || 650} onChange={(e) => set("headingWeight", Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="text-[12.5px] font-semibold text-ink-2">Corner roundness: {t.radius ?? "original"}<input type="range" min={0} max={32} value={t.radius ?? 16} onChange={(e) => set("radius", Number(e.target.value))} className="mt-2 w-full" /></label>
            </div></section>
          <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-1 font-bold">Background picture for every page</h2><p className="mb-3 text-[13px] text-ink-3">A very faint picture behind the whole website. Pages can also have their own background (page settings → Look).</p>
            <div className="flex flex-wrap items-center gap-3"><Btn onClick={() => setPic(true)}>{t.pageImage ? "Change picture" : "Choose picture"}</Btn>{t.pageImage && <><Btn onClick={() => set("pageImage", undefined)}>Remove</Btn><label className="text-[12.5px] text-ink-2">Strength {t.pageImageOpacity ?? 10}%<input type="range" min={3} max={40} value={t.pageImageOpacity ?? 10} onChange={(e) => set("pageImageOpacity", Number(e.target.value))} className="ml-2 align-middle" /></label></>}</div></section>
        </div>
        <Preview t={t} v={v} />
      </div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set("pageImage", i[0].url); setPic(false); }} />}
    </div>
  );
}

function Preview({ t, v }: { t: Theme; v: (k: keyof Theme) => string }) {
  const f = (x?: string) => (x ? `"${x}", system-ui` : undefined);
  return (
    <div className="sticky top-6 h-fit overflow-hidden rounded-2xl border border-line shadow-lg" style={{ background: v("page"), fontFamily: f(t.bodyFont), color: v("ink2"), fontSize: (t.baseSize || 16) * 0.9 }}>
      {fontLinkTag(t)}
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ background: v("headerBg"), borderColor: v("line") }}><b style={{ color: v("primary") }}>Taptajīvanam</b><span className="flex gap-3 text-[12px]" style={{ color: v("ink") }}><span>Śrīla Gurudeva</span><span>Teachings</span><span>About</span></span></div>
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: v("primary") }}>His teachings</p>
        <h3 className="mt-1 text-[24px] leading-tight" style={{ color: v("ink"), fontFamily: f(t.headingFont), fontWeight: t.headingWeight || 650 }}>Hear, read and remember</h3>
        <p className="mt-2 text-[0.95em] leading-relaxed">Lectures, books and letters, each with its exact source.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">{["Audio lectures", "Books"].map((x) => <div key={x} className="border p-3" style={{ background: v("surface"), borderColor: v("line"), borderRadius: t.radius ?? 16 }}><b style={{ color: v("ink") }}>{x}</b><p className="text-[0.85em]" style={{ color: v("ink3") }}>1985–1996</p></div>)}</div>
        <div className="mt-4 p-3 text-[0.9em]" style={{ background: v("primarySoft"), borderRadius: t.radius ?? 16, color: v("primary") }}>“Kṛṣṇa sent him.”</div>
        <div className="mt-4 flex gap-2"><span className="rounded-full px-4 py-2 text-[13px] font-medium text-white" style={{ background: v("primary") }}>Listen now</span><span className="rounded-full border px-4 py-2 text-[13px]" style={{ borderColor: v("line"), color: v("ink") }}>Read</span></div>
        <div className="mt-4 h-10" style={{ background: v("band"), borderRadius: t.radius ?? 16 }} />
      </div>
    </div>
  );
}
function fontLinkTag(t: Theme) {
  const fams = [t.bodyFont, t.headingFont].filter((x) => x && x !== "Inter");
  return fams.length ? <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${fams.map((x) => `family=${x!.replace(/ /g, "+")}:wght@400;600;700`).join("&")}&display=swap`} /> : null;
}
