"use client";
import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Settings2, Paintbrush, X } from "lucide-react";
import { WIDGET, type WField } from "@/lib/cms/widget-defs";
import { WidgetView, Styled, type WStyle } from "@/components/cms/widgets";
import { COLORS } from "@/lib/cms/colors";
import { MediaPicker } from "../media-picker";

const inp = "h-8 w-full rounded-lg border border-line bg-white px-2.5 text-[13px] outline-none focus:border-saffron";
const TONES = ["orange", "yellow", "green", "blue", "purple", "pink", "red", "brown", "gray"];
const parse = (s: string) => { try { return JSON.parse(s || "{}"); } catch { return {}; } };

function Input({ f, v, set }: { f: WField; v: any; set: (v: any) => void }) {
  const [pic, setPic] = useState(false);
  if (f.kind === "area") return <textarea rows={3} value={v ?? ""} onChange={(e) => set(e.target.value)} className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] leading-relaxed outline-none focus:border-saffron" />;
  if (f.kind === "select") return <select value={v ?? ""} onChange={(e) => set(e.target.value)} className={inp}>{f.options!.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  if (f.kind === "tone") return <div className="flex flex-wrap gap-1.5">{TONES.map((t) => <button key={t} title={t} onClick={() => set(t)} className={`h-6 w-6 rounded-full ring-1 ring-black/10 ${v === t ? "ring-2 ring-saffron ring-offset-1" : ""}`} style={{ background: COLORS[t].bg }} />)}</div>;
  if (f.kind === "image") return <div className="flex items-center gap-2">{v ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={v} alt="" className="h-8 w-8 rounded object-cover" /> : null}<button onClick={() => setPic(true)} className="flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-[12.5px] text-ink-2 hover:border-saffron"><ImageIcon size={14} />{v ? "Change" : "Choose picture"}</button>{v && <button onClick={() => set("")} className="text-[12px] text-ink-3">Remove</button>}{pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set(i[0].url); setPic(false); }} />}</div>;
  if (f.kind === "items") return <Items f={f} v={Array.isArray(v) ? v : []} set={set} />;
  return <input type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : "text"} value={v ?? ""} onChange={(e) => set(f.kind === "number" ? Number(e.target.value) : e.target.value)} className={inp} />;
}
function Items({ f, v, set }: { f: WField; v: any[]; set: (v: any[]) => void }) {
  const mv = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= v.length) return; const c = [...v]; [c[i], c[j]] = [c[j], c[i]]; set(c); };
  return (
    <div className="space-y-2">
      {v.map((it, i) => (
        <div key={i} className="flex gap-2 rounded-lg bg-white p-2 ring-1 ring-line">
          <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-2">{f.fields!.map((sf) => <label key={sf.key} className={`block text-[11.5px] text-ink-3 ${sf.kind === "area" ? "sm:col-span-2" : ""}`}>{sf.label}<Input f={sf} v={it[sf.key]} set={(x) => set(v.map((y, j) => (j === i ? { ...y, [sf.key]: x } : y)))} /></label>)}</div>
          <div className="flex flex-col"><button onClick={() => mv(i, -1)} className="p-0.5 text-ink-3"><ArrowUp size={13} /></button><button onClick={() => mv(i, 1)} className="p-0.5 text-ink-3"><ArrowDown size={13} /></button><button onClick={() => set(v.filter((_, j) => j !== i))} className="p-0.5 text-[#a3281e]"><Trash2 size={13} /></button></div>
        </div>))}
      <button onClick={() => set([...v, {}])} className="flex items-center gap-1 text-[12.5px] font-medium text-saffron"><Plus size={13} />Add</button>
    </div>
  );
}

function StyleForm({ s, set }: { s: WStyle; set: (s: WStyle) => void }) {
  const [pic, setPic] = useState(false);
  const seg = (k: keyof WStyle, opts: [string, string][]) => <div className="flex flex-wrap gap-1 rounded-lg bg-band p-0.5">{opts.map(([v, l]) => <button key={v} onClick={() => set({ ...s, [k]: v || undefined })} className={`rounded-md px-2 py-0.5 text-[12px] ${(s[k] || "") === v ? "bg-white font-semibold shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>;
  return (
    <div className="grid gap-2.5 text-[12px] text-ink-3 sm:grid-cols-2">
      <label className="block">Background<div className="mt-1 flex flex-wrap items-center gap-1.5"><button onClick={() => set({ ...s, bg: undefined })} className={`h-6 w-6 rounded-full border border-dashed border-line-strong ${!s.bg ? "ring-2 ring-saffron" : ""}`} title="None" />{TONES.map((t) => <button key={t} title={t} onClick={() => set({ ...s, bg: t })} className={`h-6 w-6 rounded-full ring-1 ring-black/10 ${s.bg === t ? "ring-2 ring-saffron ring-offset-1" : ""}`} style={{ background: COLORS[t].bg }} />)}<input type="color" value={s.bg?.startsWith("#") ? s.bg : "#fdf6e8"} onChange={(e) => set({ ...s, bg: e.target.value })} title="Any colour" className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent" /></div></label>
      <label className="block">Background picture<div className="mt-1 flex items-center gap-2"><button onClick={() => setPic(true)} className="h-7 rounded-lg border border-line px-2 text-ink-2">{s.bgImage ? "Change" : "Choose"}</button>{s.bgImage && <button onClick={() => set({ ...s, bgImage: undefined })}>Remove</button>}</div>{pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set({ ...s, bgImage: i[0].url }); setPic(false); }} />}</label>
      <label className="block">Space inside{seg("pad", [["", "Auto"], ["none", "None"], ["sm", "Small"], ["md", "Medium"], ["lg", "Large"]])}</label>
      <label className="block">Width{seg("width", [["", "Normal"], ["wide", "Wide"], ["full", "Full page"]])}</label>
      <label className="block">Frame{seg("frame", [["", "None"], ["card", "Card"], ["gold", "Gold"], ["indic", "Indian"]])}</label>
      <label className="block">Text position{seg("align", [["", "As designed"], ["left", "Left"], ["center", "Centre"]])}</label>
    </div>
  );
}

/** Which panel is open on which block, kept outside the block so it survives the editor redrawing it. */
const OPEN = new Map<string, "" | "edit" | "style">();
export const Widget = createReactBlockSpec(
  { type: "widget", propSchema: { kind: { default: "sectionHead" }, data: { default: "{}" }, style: { default: "{}" } }, content: "none" },
  { render: ({ block, editor }) => {
    const def = WIDGET[block.props.kind]; const d = parse(block.props.data); const s = parse(block.props.style) as WStyle;
    const [tab, setTabState] = useState<"" | "edit" | "style">(() => OPEN.get(block.id) ?? (Object.keys(d).length ? "" : "edit"));
    const setTab = (t: "" | "edit" | "style") => { OPEN.set(block.id, t); setTabState(t); };
    const setD = (k: string, v: any) => editor.updateBlock(block, { props: { data: JSON.stringify({ ...d, [k]: v }) } } as any);
    if (!def) return <div className="text-ink-3">Unknown element</div>;
    return (
      <div contentEditable={false} className="group/w relative w-full">
        <div className={`absolute -top-3 right-2 z-10 gap-0.5 rounded-lg border border-line bg-white p-0.5 shadow-md group-hover/w:flex group-focus-within/w:flex ${tab ? "flex" : "hidden"}`}>
          <span className="px-2 py-1 text-[11.5px] font-semibold text-ink-3">{def.title}</span>
          <button onClick={() => setTab(tab === "edit" ? "" : "edit")} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[12px] ${tab === "edit" ? "bg-saffron text-white" : "hover:bg-band"}`}><Settings2 size={13} />Edit</button>
          <button onClick={() => setTab(tab === "style" ? "" : "style")} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[12px] ${tab === "style" ? "bg-saffron text-white" : "hover:bg-band"}`}><Paintbrush size={13} />Look</button>
        </div>
        <div className={tab ? "pointer-events-none" : ""}><Styled s={s}>{def.live ? <div className="my-6 rounded-2xl border border-dashed border-line-strong bg-band/40 p-6 text-center text-[14px] text-ink-3">{def.title}: filled from the website when the page is shown.</div> : <WidgetView kind={def.kind} d={d} id={block.id} />}</Styled></div>
        {tab && <div className="relative z-20 -mt-2 mb-3 rounded-2xl border border-saffron/40 bg-[#fffaf3] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between"><p className="text-[12.5px] font-semibold text-saffron">{tab === "edit" ? def.title : `Look of “${def.title}”`}</p><button onClick={() => setTab("")} className="rounded p-0.5 text-ink-3 hover:bg-band"><X size={15} /></button></div>
          {tab === "edit" ? <div className="grid gap-2.5 sm:grid-cols-2">{def.fields.map((f) => <label key={f.key} className={`block text-[12px] text-ink-3 ${f.kind === "items" || f.kind === "area" ? "sm:col-span-2" : ""}`}>{f.label}<div className="mt-1"><Input f={f} v={d[f.key]} set={(v) => setD(f.key, v)} /></div></label>)}</div>
            : <StyleForm s={s} set={(x) => editor.updateBlock(block, { props: { style: JSON.stringify(x) } } as any)} />}
        </div>}
      </div>
    );
  } }
);
