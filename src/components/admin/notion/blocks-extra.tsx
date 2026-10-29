"use client";
import { useEffect, useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, BookOpen, Headphones, ChevronRight } from "lucide-react";
import { MediaPicker } from "../media-picker";
import { api } from "../ui";
import { PageIcon } from "../../page-icon";
import { TONE_BG } from "./schema-tones";

const inp = "h-8 w-full rounded-lg border border-line bg-white px-2.5 text-[13px] outline-none focus:border-saffron";
const area = "w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] leading-relaxed outline-none focus:border-saffron";
type Col = { key: string; label: string; area?: boolean; image?: boolean };
const parse = (s: string) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };

/** Edits a list of small items (timeline events, cards, questions…). */
function Items({ value, cols, onChange, add }: { value: string; cols: Col[]; onChange: (v: string) => void; add: string }) {
  const items = parse(value); const [pic, setPic] = useState<number | null>(null);
  const set = (i: number, p: Record<string, any>) => onChange(JSON.stringify(items.map((x, j) => (j === i ? { ...x, ...p } : x))));
  const mv = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; onChange(JSON.stringify(c)); };
  return (
    <div contentEditable={false} className="mt-3 space-y-2 rounded-xl border border-dashed border-line-strong bg-[#fcfaf6] p-2.5">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 rounded-lg bg-white p-2 ring-1 ring-line">
          <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-2">
            {cols.map((c) => c.image ? <button key={c.key} onClick={() => setPic(i)} className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2 text-[12.5px] text-ink-2">{it[c.key] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it[c.key]} alt="" className="h-6 w-6 rounded object-cover" /> : <ImageIcon size={14} />}{it[c.key] ? "Change picture" : c.label}</button>
              : c.area ? <textarea key={c.key} rows={2} value={it[c.key] || ""} placeholder={c.label} onChange={(e) => set(i, { [c.key]: e.target.value })} className={`${area} sm:col-span-2`} />
              : <input key={c.key} value={it[c.key] || ""} placeholder={c.label} onChange={(e) => set(i, { [c.key]: e.target.value })} className={inp} />)}
          </div>
          <div className="flex flex-col"><button onClick={() => mv(i, -1)} className="p-0.5 text-ink-3"><ArrowUp size={13} /></button><button onClick={() => mv(i, 1)} className="p-0.5 text-ink-3"><ArrowDown size={13} /></button><button onClick={() => onChange(JSON.stringify(items.filter((_, j) => j !== i)))} className="p-0.5 text-[#a3281e]"><Trash2 size={13} /></button></div>
        </div>))}
      <button onClick={() => onChange(JSON.stringify([...items, {}]))} className="flex items-center gap-1 px-1 text-[12.5px] font-medium text-saffron"><Plus size={13} />{add}</button>
      {pic !== null && <MediaPicker onClose={() => setPic(null)} onPick={(x) => { const k = cols.find((c) => c.image)!.key; set(pic, { [k]: x[0].url }); setPic(null); }} />}
    </div>
  );
}
const up = (editor: any, block: any, p: Record<string, any>) => editor.updateBlock(block, { props: p });

export const Timeline = createReactBlockSpec(
  { type: "timeline", propSchema: { items: { default: '[{"year":"1929","title":"Appearance","text":""}]' } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="w-full">
      <ol className="ml-2 border-l-2 border-[#e3cf9f]">{parse(block.props.items).map((it, i) => <li key={i} className="relative pb-5 pl-6"><span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-saffron ring-4 ring-white" /><p className="text-[12px] font-bold uppercase tracking-[0.1em] text-saffron">{it.year}</p><p className="font-semibold text-ink">{it.title}</p><p className="text-[14px] text-ink-2">{it.text}</p></li>)}</ol>
      <Items value={block.props.items} cols={[{ key: "year", label: "Year or date" }, { key: "title", label: "Title" }, { key: "text", label: "A few lines", area: true }]} onChange={(v) => up(editor, block, { items: v })} add="Add an event" />
    </div>
  ) }
);

export const Verse = createReactBlockSpec(
  { type: "verse", propSchema: { reference: { default: "" }, original: { default: "" }, transliteration: { default: "" }, translation: { default: "" }, purport: { default: "" } }, content: "none" },
  { render: ({ block, editor }) => {
    const p = block.props; const F = (k: keyof typeof p, label: string, cls: string, rows = 2) => <textarea rows={rows} value={p[k] as string} placeholder={label} onChange={(e) => up(editor, block, { [k]: e.target.value })} className={`w-full resize-none bg-transparent outline-none placeholder:text-ink-3/70 ${cls}`} />;
    return (
      <div contentEditable={false} className="w-full rounded-2xl border border-[#e3cf9f] bg-[#fdf6e8] px-6 py-5 text-center">
        <input value={p.reference} placeholder="Reference, e.g. Bhagavad-gītā 2.13" onChange={(e) => up(editor, block, { reference: e.target.value })} className="w-full bg-transparent text-center text-[12px] font-bold uppercase tracking-[0.14em] text-saffron outline-none placeholder:normal-case placeholder:tracking-normal" />
        {F("original", "Original verse (Devanāgarī or Bengali)", "mt-2 text-center text-[18px] leading-[1.8] text-[#7a3a06]", 3)}
        {F("transliteration", "Transliteration", "text-center text-[15px] italic leading-[1.8] text-ink-2", 3)}
        <div className="my-2 border-t border-[#ead7ae]" />
        {F("translation", "Translation", "text-left text-[15.5px] font-medium leading-relaxed text-ink", 3)}
        {F("purport", "Explanation (optional)", "mt-1 text-left text-[14.5px] leading-relaxed text-ink-2", 3)}
      </div>
    );
  } }
);

export const ImageText = createReactBlockSpec(
  { type: "imageText", propSchema: { url: { default: "" }, side: { default: "left" }, caption: { default: "" } }, content: "inline" },
  { render: ({ block, editor, contentRef }) => {
    const [pick, setPick] = useState(false);
    return (
      <div className={`flex w-full flex-col gap-5 sm:flex-row ${block.props.side === "right" ? "sm:flex-row-reverse" : ""}`}>
        <div contentEditable={false} className="sm:w-[40%]">
          {block.props.url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={block.props.url} alt="" className="w-full rounded-2xl" /> : <button onClick={() => setPick(true)} className="flex aspect-[4/3] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-band/50 text-ink-2"><ImageIcon size={18} />Choose a picture</button>}
          <div className="mt-1.5 flex gap-2 text-[12px]"><button onClick={() => setPick(true)} className="text-saffron">Picture</button><button onClick={() => up(editor, block, { side: block.props.side === "left" ? "right" : "left" })} className="text-ink-3">Swap sides</button></div>
          {pick && <MediaPicker onClose={() => setPick(false)} onPick={(i) => { up(editor, block, { url: i[0].url }); setPick(false); }} />}
        </div>
        <div ref={contentRef} className="min-w-0 flex-1 self-center text-[16.5px] leading-[1.8]" />
      </div>
    );
  } }
);

export const LinkCards = createReactBlockSpec(
  { type: "linkCards", propSchema: { items: { default: "[]" }, cols: { default: 3 } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="w-full">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.props.cols}, minmax(0,1fr))` }}>{parse(block.props.items).map((it, i) => <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">{it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt="" className="aspect-[16/10] w-full object-cover" />}<div className="p-3"><p className="font-semibold">{it.title || "Card title"}</p><p className="text-[13px] text-ink-3">{it.text}</p></div></div>)}</div>
      <Items value={block.props.items} cols={[{ key: "title", label: "Title" }, { key: "href", label: "Goes to (/page or https://)" }, { key: "text", label: "A short line", area: true }, { key: "image", label: "Picture", image: true }]} onChange={(v) => up(editor, block, { items: v })} add="Add a card" />
      <div contentEditable={false} className="mt-1 text-[12px] text-ink-3">Per row <select value={block.props.cols} onChange={(e) => up(editor, block, { cols: Number(e.target.value) })} className="rounded border border-line">{[2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></div>
    </div>
  ) }
);

export const Faq = createReactBlockSpec(
  { type: "faq", propSchema: { items: { default: '[{"q":"","a":""}]' } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="w-full">
      <div className="divide-y divide-line rounded-2xl border border-line">{parse(block.props.items).map((it, i) => <div key={i} className="flex items-center gap-2 px-4 py-3 font-medium"><ChevronRight size={15} className="text-saffron" />{it.q || "A question"}</div>)}</div>
      <Items value={block.props.items} cols={[{ key: "q", label: "Question" }, { key: "a", label: "Answer", area: true }]} onChange={(v) => up(editor, block, { items: v })} add="Add a question" />
    </div>
  ) }
);

export const Stats = createReactBlockSpec(
  { type: "stats", propSchema: { items: { default: '[{"n":"1,595","label":"Lectures"}]' } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{parse(block.props.items).map((it, i) => <div key={i} className="rounded-2xl bg-[#fdf6e8] p-4 text-center"><p className="text-[28px] font-bold text-saffron">{it.n}</p><p className="text-[13px] text-ink-2">{it.label}</p></div>)}</div>
      <Items value={block.props.items} cols={[{ key: "n", label: "Number" }, { key: "label", label: "What it counts" }]} onChange={(v) => up(editor, block, { items: v })} add="Add a number" />
    </div>
  ) }
);

export const Banner = createReactBlockSpec(
  { type: "banner", propSchema: { image: { default: "" }, title: { default: "" }, text: { default: "" }, label: { default: "" }, href: { default: "" }, tone: { default: "orange" } }, content: "none" },
  { render: ({ block, editor }) => {
    const [pick, setPick] = useState(false); const p = block.props;
    return (
      <div contentEditable={false} className="relative w-full overflow-hidden rounded-3xl" style={{ background: TONE_BG[p.tone] || TONE_BG.orange }}>
        {p.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="relative space-y-2 p-8 text-center">
          <input value={p.title} placeholder="Banner title" onChange={(e) => up(editor, block, { title: e.target.value })} className="w-full bg-transparent text-center text-[26px] font-bold outline-none placeholder:text-ink-3/60" />
          <textarea rows={2} value={p.text} placeholder="A line or two" onChange={(e) => up(editor, block, { text: e.target.value })} className="w-full resize-none bg-transparent text-center text-[15px] text-ink-2 outline-none placeholder:text-ink-3/60" />
          <div className="mx-auto flex max-w-md gap-2"><input value={p.label} placeholder="Button words" onChange={(e) => up(editor, block, { label: e.target.value })} className={inp} /><input value={p.href} placeholder="Goes to" onChange={(e) => up(editor, block, { href: e.target.value })} className={inp} /></div>
          <div className="flex justify-center gap-2 text-[12px]"><button onClick={() => setPick(true)} className="text-saffron">Background picture</button>{["orange", "yellow", "green", "blue", "purple", "pink"].map((t) => <button key={t} onClick={() => up(editor, block, { tone: t })} className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: TONE_BG[t] }} />)}</div>
        </div>
        {pick && <MediaPicker onClose={() => setPick(false)} onPick={(i) => { up(editor, block, { image: i[0].url }); setPick(false); }} />}
      </div>
    );
  } }
);

/** Book chapters: the chapters inside this page, shown as a contents list. Add a chapter right here. */
export const Chapters = createReactBlockSpec(
  { type: "chapters", propSchema: { style: { default: "numbered" }, pageId: { default: "" } }, content: "none" },
  { render: ({ block, editor }) => {
    const [kids, setKids] = useState<{ id: string; title: string; icon?: string; parent_id: string; position: number; status: string }[]>([]);
    const pid = block.props.pageId || (typeof window !== "undefined" ? location.pathname.split("/").pop() : "");
    const load = () => api<any[]>("/api/admin/pages").then((all) => setKids(all.filter((p) => p.parent_id === pid).sort((a, b) => a.position - b.position))).catch(() => {});
    useEffect(() => { if (!block.props.pageId && pid) up(editor, block, { pageId: pid }); load(); const h = () => load(); window.addEventListener("tj:pages-changed", h); return () => window.removeEventListener("tj:pages-changed", h); }, [pid]); // eslint-disable-line
    const add = async () => { const title = prompt("Chapter name"); if (!title) return; const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: pid, template: "chapter", title }); window.dispatchEvent(new Event("tj:pages-changed")); load(); void r; };
    return (
      <div contentEditable={false} className="w-full rounded-2xl border border-[#e3cf9f] bg-[#fdfaf3] p-5">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-saffron"><BookOpen size={15} />Chapters</p>
        <ol className="space-y-1">{kids.map((k, i) => <li key={k.id}><a href={`/admin/pages/${k.id}`} className="flex items-baseline gap-3 rounded-lg px-2 py-2 hover:bg-white">
          {block.props.style === "numbered" && <span className="w-8 shrink-0 text-right text-[13px] font-bold text-saffron">{i + 1}.</span>}<span className="flex-1 border-b border-dotted border-[#d9c39a] pb-0.5 text-[15.5px] font-medium text-ink">{k.icon ? <PageIcon icon={k.icon} size={15} className="mr-1.5" /> : null}{k.title}</span>{k.status !== "published" && <span className="text-[11px] text-[#8a5a0a]">draft</span>}</a></li>)}</ol>
        {!kids.length && <p className="px-2 text-[13.5px] text-ink-3">No chapters yet.</p>}
        <div className="mt-3 flex items-center gap-3 text-[13px]"><button onClick={add} className="flex items-center gap-1 rounded-lg bg-saffron px-3 py-1.5 font-medium text-white"><Plus size={14} />Add a chapter</button>
          <select value={block.props.style} onChange={(e) => up(editor, block, { style: e.target.value })} className="h-8 rounded-md border border-line px-1.5 text-ink-2"><option value="numbered">Numbered contents</option><option value="cards">Chapter cards</option></select>
          <span className="text-ink-3">Open a chapter to add chapters inside it.</span></div>
      </div>
    );
  } }
);

/** One lecture from the Library, with a play button. */
export const Lecture = createReactBlockSpec(
  { type: "lecture", propSchema: { slug: { default: "" }, title: { default: "" } }, content: "none" },
  { render: ({ block, editor }) => {
    const [rows, setRows] = useState<{ slug: string; title: string }[]>([]); const [q, setQ] = useState("");
    useEffect(() => { api<any[]>("/api/admin/library").then(async (l) => { const a = l.find((x) => x.slug === "audio-lectures"); if (a) setRows((await api<{ rows: any[] }>(`/api/admin/dbs/${a.id}`)).rows); }).catch(() => {}); }, []);
    return (
      <div contentEditable={false} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron-soft text-saffron"><Headphones size={19} /></span>
        {block.props.slug ? <div className="min-w-0 flex-1"><p className="truncate font-semibold">{block.props.title}</p><button onClick={() => up(editor, block, { slug: "", title: "" })} className="text-[12px] text-saffron">Choose another lecture</button></div>
          : <div className="min-w-0 flex-1"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={rows.length ? "Search the lectures…" : "Add lectures to the Library first"} className={inp} />
            {q && <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-line">{rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())).slice(0, 30).map((r) => <button key={r.slug} onClick={() => up(editor, block, { slug: r.slug, title: r.title })} className="block w-full truncate px-2.5 py-1.5 text-left text-[13px] hover:bg-band">{r.title}</button>)}</div>}</div>}
      </div>
    );
  } }
);
