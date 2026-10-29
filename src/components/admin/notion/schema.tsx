"use client";
import { useEffect, useState } from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Database, FileText, Image as ImageIcon, Plus, Youtube, X, ListTree } from "lucide-react";
import { MediaPicker } from "../media-picker";
import { api } from "../ui";

export const TONES = ["orange", "yellow", "green", "blue", "purple", "pink", "red", "gray", "brown"] as const;
export const TONE_BG: Record<string, string> = { gray: "#f1ece6", brown: "#f4e7da", red: "#fbe4e1", orange: "#fdebd6", yellow: "#fbf1cc", green: "#e3f1e5", blue: "#e2eaf8", purple: "#efe6f7", pink: "#f9e3ea" };
const ICONS = ["🪷", "💡", "📌", "⚠️", "🙏", "📿", "🌸", "✨", "📖", "🔔", "🕉️", "❤️"];
const inp = "h-8 rounded-lg border border-line-strong bg-white px-2.5 text-[13px] outline-none focus:border-saffron";
const Bar = ({ children }: { children: React.ReactNode }) => <div contentEditable={false} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line-strong bg-white/70 p-2 text-[12.5px] text-ink-3">{children}</div>;

const Callout = createReactBlockSpec(
  { type: "callout", propSchema: { tone: { default: "orange" }, icon: { default: "🪷" } }, content: "inline" },
  { render: ({ block, editor, contentRef }) => {
    const [pick, setPick] = useState(false);
    return (
      <div className="relative flex w-full gap-3 rounded-2xl p-4" style={{ background: TONE_BG[block.props.tone] || TONE_BG.orange }}>
        <button contentEditable={false} onClick={() => setPick(!pick)} className="h-7 text-[20px] leading-none">{block.props.icon}</button>
        {pick && <div contentEditable={false} className="absolute left-2 top-11 z-20 w-[230px] rounded-xl border border-line bg-white p-2 shadow-xl">
          <div className="grid grid-cols-6 gap-1">{ICONS.map((i) => <button key={i} onClick={() => { editor.updateBlock(block, { props: { icon: i } } as any); setPick(false); }} className="rounded p-1 text-[18px] hover:bg-band">{i}</button>)}</div>
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line pt-2">{TONES.map((t) => <button key={t} title={t} onClick={() => editor.updateBlock(block, { props: { tone: t } } as any)} className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: TONE_BG[t] }} />)}</div>
        </div>}
        <div ref={contentRef} className="min-w-0 flex-1 text-[16px] leading-[1.75]" />
      </div>
    );
  } }
);

const Sloka = createReactBlockSpec(
  { type: "sloka", propSchema: { source: { default: "" } }, content: "inline" },
  { render: ({ block, editor, contentRef }) => (
    <div className="w-full rounded-2xl border border-[#e3cf9f] bg-[#fdf6e8] px-6 py-5 text-center">
      <div ref={contentRef} className="whitespace-pre-line text-[18px] font-medium leading-[1.8] text-[#7a3a06]" />
      <input contentEditable={false} value={block.props.source} placeholder="Source (e.g. Bhagavad-gītā 2.13)" onChange={(e) => editor.updateBlock(block, { props: { source: e.target.value } } as any)} className="mt-2 w-full bg-transparent text-center text-[13px] font-medium text-saffron outline-none placeholder:text-ink-3" />
    </div>
  ) }
);

const PullQuote = createReactBlockSpec(
  { type: "pullQuote", propSchema: { source: { default: "" } }, content: "inline" },
  { render: ({ block, editor, contentRef }) => (
    <div className="w-full rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-sm)]">
      <div className="flex text-[20px] font-medium leading-[1.6] text-ink"><span>“</span><div ref={contentRef} className="flex-1" /><span>”</span></div>
      <input contentEditable={false} value={block.props.source} placeholder="Source: lecture, place, date" onChange={(e) => editor.updateBlock(block, { props: { source: e.target.value } } as any)} className="mt-3 w-full bg-transparent text-[13px] font-medium text-saffron outline-none placeholder:text-ink-3" />
    </div>
  ) }
);

const Ornament = createReactBlockSpec(
  { type: "ornament", propSchema: { style: { default: "star" } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="flex w-full items-center gap-3 py-3 text-[#c98a2b]">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e3cf9f]" />
      <button contentEditable={false} title="Change style" onClick={() => editor.updateBlock(block, { props: { style: block.props.style === "star" ? "lotus" : block.props.style === "lotus" ? "dots" : "star" } } as any)} className="text-[18px]">{block.props.style === "lotus" ? "❀" : block.props.style === "dots" ? "• • •" : "✦"}</button>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e3cf9f]" />
    </div>
  ) }
);

const Button = createReactBlockSpec(
  { type: "button", propSchema: { label: { default: "Open" }, href: { default: "/" }, align: { default: "left" } }, content: "none" },
  { render: ({ block, editor }) => (
    <div className="w-full" style={{ textAlign: block.props.align as any }}>
      <span className="inline-flex h-11 items-center rounded-full bg-saffron px-6 text-[14.5px] font-medium text-white">{block.props.label}</span>
      <Bar>Words <input className={inp} value={block.props.label} onChange={(e) => editor.updateBlock(block, { props: { label: e.target.value } } as any)} />
        Goes to <input className={`${inp} w-48`} value={block.props.href} placeholder="/gurudeva or https://…" onChange={(e) => editor.updateBlock(block, { props: { href: e.target.value } } as any)} />
        <select className={inp} value={block.props.align} onChange={(e) => editor.updateBlock(block, { props: { align: e.target.value } } as any)}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></Bar>
    </div>
  ) }
);

const yid = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u || "")?.[1] || "";
const YouTube = createReactBlockSpec(
  { type: "youtube", propSchema: { url: { default: "" }, caption: { default: "" } }, content: "none" },
  { render: ({ block, editor }) => {
    const id = yid(block.props.url);
    return (
      <div className="w-full">
        {id ? <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} className="h-full w-full" title="Video" /></div>
          : <div className="flex h-28 items-center justify-center gap-2 rounded-2xl bg-band text-ink-3"><Youtube size={20} />Paste a YouTube link below</div>}
        <Bar><input className={`${inp} flex-1`} value={block.props.url} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => editor.updateBlock(block, { props: { url: e.target.value } } as any)} />
          <input className={`${inp} flex-1`} value={block.props.caption} placeholder="Caption" onChange={(e) => editor.updateBlock(block, { props: { caption: e.target.value } } as any)} /></Bar>
      </div>
    );
  } }
);

const Gallery = createReactBlockSpec(
  { type: "gallery", propSchema: { images: { default: "[]" }, cols: { default: 3 } }, content: "none" },
  { render: ({ block, editor }) => {
    const [open, setOpen] = useState(false);
    let imgs: { url: string; caption?: string }[] = []; try { imgs = JSON.parse(block.props.images); } catch {}
    const save = (x: typeof imgs) => editor.updateBlock(block, { props: { images: JSON.stringify(x) } } as any);
    return (
      <div className="w-full">
        {imgs.length ? <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${block.props.cols}, minmax(0,1fr))` }}>{imgs.map((im, i) => <div key={i} className="group relative">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={im.url} alt="" className="aspect-square w-full rounded-xl object-cover" /><button contentEditable={false} onClick={() => save(imgs.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"><X size={13} /></button></div>)}</div>
          : <button contentEditable={false} onClick={() => setOpen(true)} className="flex h-32 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-band/50 text-ink-2"><ImageIcon size={19} />Choose pictures</button>}
        <Bar><button onClick={() => setOpen(true)} className="flex items-center gap-1 font-medium text-saffron"><Plus size={14} />Add pictures</button>
          Per row <select className={inp} value={block.props.cols} onChange={(e) => editor.updateBlock(block, { props: { cols: Number(e.target.value) } } as any)}>{[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></Bar>
        {open && <MediaPicker multiple onClose={() => setOpen(false)} onPick={(i) => save([...imgs, ...i.map((x) => ({ url: x.url, caption: x.alt }))])} />}
      </div>
    );
  } }
);

/** A page inside this page, like Notion. Clicking opens it. */
const SubPage = createReactBlockSpec(
  { type: "subpage", propSchema: { pageId: { default: "" }, title: { default: "Untitled" }, icon: { default: "📄" } }, content: "none" },
  { render: ({ block }) => {
    const [t, setT] = useState<{ title: string; icon?: string } | null>(null);
    useEffect(() => { if (block.props.pageId) api(`/api/admin/pages/${block.props.pageId}`).then((p) => setT({ title: p.title, icon: p.settings?.icon })).catch(() => setT({ title: "(page removed)" })); }, [block.props.pageId]);
    return <a contentEditable={false} href={`/admin/pages/${block.props.pageId}`} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-[16px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:bg-band"><span className="text-[18px] no-underline">{t?.icon || block.props.icon || <FileText size={17} />}</span>{t?.title || block.props.title}</a>;
  } }
);

const DatabaseBlock = createReactBlockSpec(
  { type: "database", propSchema: { db: { default: "" }, view: { default: "table" }, title: { default: "" }, limit: { default: 50 } }, content: "none" },
  { render: ({ block, editor }) => {
    const [dbs, setDbs] = useState<{ id: string; slug: string; name: string; rows: number }[]>([]);
    useEffect(() => { api("/api/admin/dbs").then(setDbs).catch(() => {}); }, []);
    const cur = dbs.find((d) => d.slug === block.props.db);
    return (
      <div contentEditable={false} className="w-full rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Database size={17} className="text-saffron" />
          <select className={inp} value={block.props.db} onChange={(e) => editor.updateBlock(block, { props: { db: e.target.value } } as any)}><option value="">Choose a database…</option>{dbs.map((d) => <option key={d.slug} value={d.slug}>{d.name} ({d.rows})</option>)}</select>
          <div className="flex rounded-lg bg-band p-0.5">{["table", "list", "gallery", "board"].map((v) => <button key={v} onClick={() => editor.updateBlock(block, { props: { view: v } } as any)} className={`rounded-md px-2.5 py-1 text-[12.5px] capitalize ${block.props.view === v ? "bg-white font-semibold shadow-sm" : "text-ink-3"}`}>{v}</button>)}</div>
          {cur && <a href={`/admin/databases/${cur.id}`} className="ml-auto text-[12.5px] font-medium text-saffron">Open database →</a>}
          <button onClick={async () => { const name = prompt("Name of the new database"); if (!name) return; const r = await api<{ id: string; slug: string }>("/api/admin/dbs", "POST", { name }); editor.updateBlock(block, { props: { db: r.slug } } as any); setDbs(await api("/api/admin/dbs")); }} className="text-[12.5px] font-medium text-ink-2 hover:text-saffron">+ New database</button>
        </div>
        <input value={block.props.title} placeholder="Title above the database (optional)" onChange={(e) => editor.updateBlock(block, { props: { title: e.target.value } } as any)} className="mt-3 w-full bg-transparent text-[17px] font-bold outline-none placeholder:font-normal placeholder:text-ink-3" />
        <p className="mt-1 text-[12.5px] text-ink-3">{cur ? `${cur.rows} records, shown as ${block.props.view} on the live page.` : "Pick a database, or make a new one."}</p>
      </div>
    );
  } }
);

const Toc = createReactBlockSpec(
  { type: "toc", propSchema: {}, content: "none" },
  { render: () => <div contentEditable={false} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-3 text-[14px] text-ink-3"><ListTree size={16} />Table of contents: the headings of this page (and chapters of a book) appear here.</div> }
);

export const schema = BlockNoteSchema.create({
  blockSpecs: { ...defaultBlockSpecs, callout: Callout(), sloka: Sloka(), pullQuote: PullQuote(), ornament: Ornament(), button: Button(), youtube: YouTube(), gallery: Gallery(), subpage: SubPage(), database: DatabaseBlock(), toc: Toc() },
});
export type Editor = typeof schema.BlockNoteEditor;
