"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Copy, ChevronUp, ChevronDown, Bold, Italic, Underline, Link2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading2, Heading3,
  Pilcrow, Eye, Search, Image as ImageIcon, Type, Heading, LayoutGrid, Quote, Sparkles, Columns3, Columns2, Database, Play, Headphones, MousePointerClick, Minus, MoveVertical, ListTree, X, Palette, History, Globe,
} from "lucide-react";
import { BLOCKS, DIVIDERS, TONES, uid, type Block } from "@/lib/cms/blocks";
import { BlockView, headingCls, textCls, ALIGN } from "../cms/blocks-view";
import { Btn, Field, Input, Select, Textarea, api, toast } from "./ui";
import { MediaPicker } from "./media-picker";

const ICONS: Record<string, any> = { Heading, Type, Image: ImageIcon, LayoutGrid, Quote, Sparkles, Columns3, Columns2, Database, Play, Headphones, MousePointerClick, Minus, MoveVertical, ListTree };
type Page = { id: string; title: string; path: string; slug: string; parent_id: string | null; type: string; status: string; blocks: Block[]; seo: Record<string, any>; settings: Record<string, any> };
type Opt = { id: string; title: string; path: string };

/** A text area that looks exactly like the published text, and can be typed into. */
function RichEdit({ html, onChange, className, onFocus, placeholder }: { html: string; onChange: (h: string) => void; className: string; onFocus?: () => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html; }, [html]);
  return <div ref={ref} contentEditable suppressContentEditableWarning data-ph={placeholder} className={`${className} min-h-[1.6em] rounded-lg outline-none focus:bg-[#fffaf0] empty:before:text-ink-3 empty:before:content-[attr(data-ph)]`} dangerouslySetInnerHTML={{ __html: html }} onFocus={onFocus} onInput={(e) => onChange((e.target as HTMLElement).innerHTML)} />;
}
const PLAIN = ({ text, onChange, className, onFocus }: { text: string; onChange: (t: string) => void; className: string; onFocus?: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== text) ref.current.innerText = text; }, [text]);
  return <div ref={ref} contentEditable suppressContentEditableWarning className={`${className} rounded-lg outline-none focus:bg-[#fffaf0]`} onFocus={onFocus} onInput={(e) => onChange((e.target as HTMLElement).innerText.replace(/\n/g, " "))}>{text}</div>;
};

const cmd = (c: string, v?: string) => document.execCommand(c, false, v);
const COLORS = ["#2a1a0e", "#853500", "#b9770e", "#1f6f6f", "#2f3d9a", "#a3365a", "#2f6b3f", "#7b3f9e"];

export function PageEditor({ pageId }: { pageId: string }) {
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<null | { at: number }>(null);
  const [media, setMedia] = useState<null | { multi?: boolean; done: (i: { url: string; alt: string }[]) => void }>(null);
  const [panel, setPanel] = useState<"block" | "page">("block");
  const [colorOpen, setColorOpen] = useState(false);
  const [pages, setPages] = useState<Opt[]>([]);
  const [dbs, setDbs] = useState<{ slug: string; name: string }[]>([]);
  const [seo, setSeo] = useState<Record<string, any>>({});
  const [slug, setSlug] = useState(""); const [parent, setParent] = useState<string>("");
  const dirtyRef = useRef(false); dirtyRef.current = dirty;

  useEffect(() => {
    api<Page>(`/api/admin/pages/${pageId}`).then((p) => { setPage(p); setBlocks(p.blocks || []); setTitle(p.title); setSeo(p.seo || {}); setSlug(p.slug); setParent(p.parent_id || ""); }).catch((e) => toast(e.message, true));
    api<Opt[]>("/api/admin/pages").then(setPages).catch(() => {});
    api<any[]>("/api/admin/dbs").then(setDbs).catch(() => {});
  }, [pageId]);

  const save = useCallback(async (status?: string, quiet = false) => {
    if (!page) return; setSaving(true);
    try {
      const r = await api<{ path: string }>(`/api/admin/pages/${pageId}`, "PATCH", { title, blocks, seo, slug, parent_id: parent || null, ...(status ? { status } : {}) });
      setDirty(false); if (status) setPage((p) => p && { ...p, status, path: r.path }); else setPage((p) => p && { ...p, path: r.path });
      if (!quiet) toast(status === "published" ? "Published. It is live now." : status === "draft" ? "Moved back to draft." : "Saved.");
    } catch (e: any) { toast(e.message, true); } finally { setSaving(false); }
  }, [page, pageId, title, blocks, seo, slug, parent]);

  useEffect(() => { if (!dirty) return; const t = setTimeout(() => save(undefined, true), 6000); return () => clearTimeout(t); }, [dirty, save]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); } };
    const b = (e: BeforeUnloadEvent) => { if (dirtyRef.current) e.preventDefault(); };
    window.addEventListener("keydown", k); window.addEventListener("beforeunload", b); return () => { window.removeEventListener("keydown", k); window.removeEventListener("beforeunload", b); };
  }, [save]);

  const edit = (id: string, patch: Record<string, any>) => { setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...patch } } : b))); setDirty(true); };
  const move = (i: number, d: number) => setBlocks((bs) => { const j = i + d; if (j < 0 || j >= bs.length) return bs; const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; setDirty(true); return c; });
  const del = (id: string) => { setBlocks((bs) => bs.filter((b) => b.id !== id)); setSel(null); setDirty(true); };
  const dup = (i: number) => setBlocks((bs) => { const c = [...bs]; c.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(bs[i])), id: uid() }); setDirty(true); return c; });
  const insert = (at: number, type: string) => { const d = BLOCKS.find((x) => x.type === type)!.make(); setBlocks((bs) => { const c = [...bs]; c.splice(at, 0, d); return c; }); setSel(d.id); setPanel("block"); setDirty(true); };
  const selected = blocks.find((b) => b.id === sel) || null;

  if (!page) return <div className="p-10 text-ink-3">Opening the page…</div>;
  const parentOpts = pages.filter((p) => p.id !== page.id && !p.path.startsWith(page.path + "/"));

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/pages" className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2 hover:text-saffron"><ArrowLeft size={16} />All pages</Link>
          <input value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} aria-label="Page name" className="h-10 min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-2 text-[18px] font-bold tracking-[-0.02em] outline-none hover:border-line focus:border-saffron" />
          <span className={`hidden rounded-full px-3 py-1 text-[12px] font-semibold sm:inline ${page.status === "published" ? "bg-[#e3f3e6] text-[#256a39]" : "bg-[#fbeccf] text-[#8a5a0a]"}`}>{page.status === "published" ? "Live" : "Draft"}</span>
          <span className="hidden text-[12.5px] text-ink-3 sm:inline">{saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</span>
          {page.status === "published" && <Link href={page.path} target="_blank" className="flex h-10 items-center gap-1.5 rounded-xl border border-line-strong px-3 text-[14px] text-ink-2 hover:bg-band"><Eye size={16} />View</Link>}
          <Btn onClick={() => save()} busy={saving}>Save</Btn>
          {page.status === "published" ? <Btn kind="soft" onClick={() => save("draft")}>Unpublish</Btn> : null}
          <Btn kind="primary" onClick={() => save("published")}>{page.status === "published" ? "Update live page" : "Publish"}</Btn>
        </div>
        <div className="flex flex-wrap items-center gap-1 border-t border-line px-4 py-1.5 sm:px-6" onMouseDown={(e) => e.preventDefault()}>
          {[[Bold, "bold", "Bold"], [Italic, "italic", "Italic"], [Underline, "underline", "Underline"]].map(([I, c, t]: any) => <button key={c} title={t} onClick={() => cmd(c)} className="tb"><I size={16} /></button>)}
          <span className="mx-1 h-5 w-px bg-line" />
          <button title="Normal text" onClick={() => cmd("formatBlock", "p")} className="tb"><Pilcrow size={16} /></button>
          <button title="Heading" onClick={() => cmd("formatBlock", "h2")} className="tb"><Heading2 size={16} /></button>
          <button title="Smaller heading" onClick={() => cmd("formatBlock", "h3")} className="tb"><Heading3 size={16} /></button>
          <button title="Bullets" onClick={() => cmd("insertUnorderedList")} className="tb"><List size={16} /></button>
          <button title="Numbers" onClick={() => cmd("insertOrderedList")} className="tb"><ListOrdered size={16} /></button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button title="Align left" onClick={() => cmd("justifyLeft")} className="tb"><AlignLeft size={16} /></button>
          <button title="Centre" onClick={() => cmd("justifyCenter")} className="tb"><AlignCenter size={16} /></button>
          <button title="Align right" onClick={() => cmd("justifyRight")} className="tb"><AlignRight size={16} /></button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button title="Add a link" onClick={() => { const u = window.prompt("Where should the link go? (a web address, or a page such as /gurudeva)"); if (u) cmd("createLink", u); }} className="tb"><Link2 size={16} /></button>
          <div className="relative">
            <button title="Text colour" onClick={() => setColorOpen((o) => !o)} className="tb"><Palette size={16} /></button>
            {colorOpen && <div className="absolute left-0 top-9 z-40 flex gap-1.5 rounded-xl border border-line bg-surface p-2 shadow-xl">{COLORS.map((c) => <button key={c} onClick={() => { cmd("foreColor", c); setColorOpen(false); }} className="h-6 w-6 rounded-full border border-black/10" style={{ background: c }} aria-label={c} />)}</div>}
          </div>
          <span className="ml-auto text-[12px] text-ink-3">Click any text to type. Press Ctrl+S to save.</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-8 sm:px-6">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[820px] rounded-3xl border border-line bg-white px-5 py-8 shadow-[var(--shadow-md)] sm:px-10 sm:py-10">
            <Inserter onClick={() => setPicker({ at: 0 })} />
            {blocks.map((b, i) => (
              <div key={b.id}>
                <div onMouseDown={() => { setSel(b.id); setPanel("block"); }} className={`group relative rounded-xl px-2 py-2 transition ${sel === b.id ? "ring-2 ring-saffron/70" : "hover:ring-1 hover:ring-line-strong"}`}>
                  <div className={`absolute -top-3.5 right-2 z-10 flex gap-0.5 rounded-lg border border-line bg-surface p-0.5 shadow-md ${sel === b.id ? "flex" : "hidden group-hover:flex"}`}>
                    <button title="Move up" onClick={() => move(i, -1)} className="tb"><ChevronUp size={15} /></button>
                    <button title="Move down" onClick={() => move(i, 1)} className="tb"><ChevronDown size={15} /></button>
                    <button title="Duplicate" onClick={() => dup(i)} className="tb"><Copy size={14} /></button>
                    <button title="Delete" onClick={() => del(b.id)} className="tb text-[#a3281e]"><Trash2 size={14} /></button>
                  </div>
                  <EditableBlock b={b} edit={edit} pick={(multi, done) => setMedia({ multi, done })} dbs={dbs} />
                </div>
                <Inserter onClick={() => setPicker({ at: i + 1 })} />
              </div>
            ))}
            {!blocks.length && <p className="py-10 text-center text-ink-3">This page is empty. Press the + above to add your first block.</p>}
          </div>
        </main>

        <aside className="sticky top-[132px] hidden h-[calc(100vh-150px)] w-[320px] shrink-0 overflow-y-auto rounded-3xl border border-line bg-surface p-4 lg:block">
          <div className="mb-4 flex rounded-xl bg-band p-1 text-[13.5px] font-medium">
            {(["block", "page"] as const).map((t) => <button key={t} onClick={() => setPanel(t)} className={`flex-1 rounded-lg py-1.5 ${panel === t ? "bg-white shadow-sm" : "text-ink-3"}`}>{t === "block" ? "This block" : "Page settings"}</button>)}
          </div>
          {panel === "block" ? (selected ? <Inspector b={selected} edit={edit} pick={(multi, done) => setMedia({ multi, done })} dbs={dbs} pages={pages} /> : <p className="text-[13.5px] leading-relaxed text-ink-3">Click a block on the page to change its look here: colours, size, borders, pictures and links.</p>)
            : <PageSettings page={page} slug={slug} setSlug={(v) => { setSlug(v); setDirty(true); }} parent={parent} setParent={(v) => { setParent(v); setDirty(true); }} parentOpts={parentOpts} seo={seo} setSeo={(s) => { setSeo(s); setDirty(true); }} title={title} blocks={blocks} onRestore={(bl) => { setBlocks(bl); setDirty(true); }} />}
        </aside>
      </div>

      {picker && <BlockPicker onClose={() => setPicker(null)} onPick={(t) => { insert(picker.at, t); setPicker(null); }} />}
      {media && <MediaPicker multiple={media.multi} onClose={() => setMedia(null)} onPick={(i) => { media.done(i); setDirty(true); }} />}
      <style>{`.tb{display:inline-flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:8px;color:var(--ink-2)}.tb:hover{background:var(--band)}`}</style>
    </div>
  );
}

const Inserter = ({ onClick }: { onClick: () => void }) => (
  <div className="group/ins relative my-1 flex h-5 items-center"><span className="h-px w-full bg-transparent transition group-hover/ins:bg-saffron/30" /><button onClick={onClick} aria-label="Add a block here" className="absolute left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-line-strong bg-white text-ink-3 opacity-0 shadow-sm transition hover:bg-saffron hover:text-white group-hover/ins:opacity-100 focus:opacity-100"><Plus size={14} /></button></div>
);

function BlockPicker({ onPick, onClose }: { onPick: (t: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const list = BLOCKS.filter((b) => (b.label + b.hint).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#2a1a0e]/45 p-4 pt-[10vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-5 shadow-2xl">
        <div className="relative mb-4"><Search size={16} className="absolute left-3.5 top-3 text-ink-3" /><Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to add? (text, picture, quote…)" className="pl-10" /></div>
        <div className="grid max-h-[55vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {list.map((b) => { const I = ICONS[b.icon] || Type; return (
            <button key={b.type} onClick={() => onPick(b.type)} className="flex items-center gap-3 rounded-2xl border border-line p-3 text-left transition hover:border-saffron hover:bg-saffron-soft/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron-soft text-saffron"><I size={19} /></span>
              <span><span className="block text-[14.5px] font-semibold">{b.label}</span><span className="block text-[12.5px] text-ink-3">{b.hint}</span></span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

function EditableBlock({ b, edit, pick, dbs }: { b: Block; edit: (id: string, p: Record<string, any>) => void; pick: (m: boolean, d: (i: { url: string; alt: string }[]) => void) => void; dbs: { slug: string; name: string }[] }) {
  const d = b.data;
  if (b.type === "heading") return (
    <div className={`acc-${d.tone || "saffron"}`}>
      <PLAIN text={d.text || ""} onChange={(t) => edit(b.id, { text: t })} className={headingCls(d)} />
      {d.rule !== false && <span className={`mt-3 block h-[3px] w-14 rounded-full bg-gradient-to-r from-[var(--acc)] to-transparent ${d.align === "center" ? "mx-auto" : d.align === "right" ? "ml-auto" : ""}`} />}
    </div>
  );
  if (b.type === "text") return <RichEdit html={d.html} onChange={(h) => edit(b.id, { html: h })} className={textCls(d)} placeholder="Type here…" />;
  if (b.type === "callout") return <RichEdit html={d.html} onChange={(h) => edit(b.id, { html: h })} className={`acc-${d.tone || "saffron"} cms-text rounded-2xl border border-[color-mix(in_srgb,var(--acc)_30%,white)] bg-[var(--acc-tint)] p-5 text-[15.5px] leading-[1.75] text-ink-2 sm:p-6`} />;
  if (b.type === "quote") return (
    <blockquote className={d.style === "plain" ? "border-l-4 border-saffron pl-5" : "card p-6 sm:p-8"}>
      <PLAIN text={d.text || ""} onChange={(t) => edit(b.id, { text: t })} className="text-[19px] font-medium leading-[1.6] text-ink sm:text-[22px]" />
      <PLAIN text={d.source || ""} onChange={(t) => edit(b.id, { source: t })} className="mt-3 text-[13px] font-medium text-saffron" />
    </blockquote>
  );
  if (b.type === "image" && !d.src) return <button onClick={() => pick(false, (i) => edit(b.id, { src: i[0].url, alt: i[0].alt }))} className="flex h-44 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-band/50 text-[14.5px] font-medium text-ink-2 hover:border-saffron hover:text-saffron"><ImageIcon size={20} />Choose a picture</button>;
  if (b.type === "gallery" && !(d.images || []).length) return <button onClick={() => pick(true, (i) => edit(b.id, { images: i.map((x) => ({ src: x.url, alt: x.alt })) }))} className="flex h-36 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-band/50 text-[14.5px] font-medium text-ink-2 hover:border-saffron hover:text-saffron"><LayoutGrid size={20} />Choose pictures for the gallery</button>;
  if (b.type === "columns") return (
    <div className={`grid items-start gap-6 ${d.split === "wide-left" ? "md:grid-cols-[1.6fr_1fr]" : d.split === "wide-right" ? "md:grid-cols-[1fr_1.6fr]" : "md:grid-cols-2"}`}>
      {(["left", "right"] as const).map((k) => <RichEdit key={k} html={d[k]} onChange={(h) => edit(b.id, { [k]: h })} className={textCls(d)} />)}
    </div>
  );
  if (b.type === "database") return <div className="rounded-2xl border border-dashed border-line-strong bg-band/40 p-5 text-[14px] text-ink-2"><Database size={18} className="mb-1 inline text-saffron" /> <b>{dbs.find((x) => x.slug === d.db)?.name || "Choose a database →"}</b> shown as {d.view}. The rows appear on the live page.</div>;
  if (b.type === "toc") return <div className="rounded-2xl border border-dashed border-line-strong bg-band/40 p-4 text-[14px] text-ink-3">A list of this page’s headings appears here.</div>;
  return <div className="pointer-events-none"><BlockView block={b} /></div>;
}

function Seg({ value, opts, onChange }: { value: any; opts: [any, string][]; onChange: (v: any) => void }) {
  return <div className="flex flex-wrap gap-1 rounded-xl bg-band p-1">{opts.map(([v, l]) => <button key={String(v)} onClick={() => onChange(v)} className={`rounded-lg px-2.5 py-1 text-[12.5px] font-medium ${value === v ? "bg-white shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>;
}
const Tones = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">{TONES.map((t) => <button key={t} onClick={() => onChange(t)} aria-label={t} title={t} className={`acc-${t} h-7 w-7 rounded-full bg-[var(--acc)] ${value === t ? "ring-2 ring-offset-2 ring-[var(--acc)]" : ""}`} />)}</div>
);

function Inspector({ b, edit, pick, dbs, pages }: { b: Block; edit: (id: string, p: Record<string, any>) => void; pick: (m: boolean, d: (i: { url: string; alt: string }[]) => void) => void; dbs: { slug: string; name: string }[]; pages: Opt[] }) {
  const d = b.data; const set = (p: Record<string, any>) => edit(b.id, p);
  const align = <Field label="Alignment"><Seg value={d.align || "left"} onChange={(v) => set({ align: v })} opts={[["left", "Left"], ["center", "Centre"], ["right", "Right"], ["justify", "Justify"]]} /></Field>;
  const def = BLOCKS.find((x) => x.type === b.type);
  return (
    <div className="space-y-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">{def?.label}</p>
      {b.type === "heading" && <>
        <Field label="Size"><Seg value={d.level} onChange={(v) => set({ level: v })} opts={[[1, "Biggest"], [2, "Large"], [3, "Medium"], [4, "Small"]]} /></Field>{align}
        <Field label="Colour"><Tones value={d.tone || "saffron"} onChange={(v) => set({ tone: v })} /></Field>
        <Field label="Line under the heading"><Seg value={d.rule !== false} onChange={(v) => set({ rule: v })} opts={[[true, "Show"], [false, "Hide"]]} /></Field></>}
      {b.type === "text" && <>{align}<Field label="Text size"><Seg value={d.size || "md"} onChange={(v) => set({ size: v })} opts={[["sm", "Small"], ["md", "Normal"], ["lg", "Large"]]} /></Field></>}
      {b.type === "callout" && <Field label="Colour"><Tones value={d.tone || "saffron"} onChange={(v) => set({ tone: v })} /></Field>}
      {b.type === "quote" && <Field label="Style"><Seg value={d.style || "card"} onChange={(v) => set({ style: v })} opts={[["card", "Card"], ["plain", "Plain"]]} /></Field>}
      {b.type === "image" && <>
        <Btn onClick={() => pick(false, (i) => set({ src: i[0].url, alt: d.alt || i[0].alt }))}><ImageIcon size={15} />{d.src ? "Change picture" : "Choose picture"}</Btn>
        <Field label="Describe the picture" hint="Helps people who cannot see it, and search engines."><Input value={d.alt || ""} onChange={(e) => set({ alt: e.target.value })} /></Field>
        <Field label="Caption"><Input value={d.caption || ""} onChange={(e) => set({ caption: e.target.value })} /></Field>
        <Field label="Width"><Seg value={d.width} onChange={(v) => set({ width: v })} opts={[["small", "Small"], ["narrow", "Medium"], ["wide", "Wide"], ["full", "Full"]]} /></Field>
        <Field label="Position"><Seg value={d.align} onChange={(v) => set({ align: v })} opts={[["left", "Left"], ["center", "Centre"], ["right", "Right"]]} /></Field>
        <Field label="Border"><Seg value={d.frame} onChange={(v) => set({ frame: v })} opts={[["none", "None"], ["gold", "Gold"], ["indic", "Indian"], ["shadow", "Shadow"], ["round", "Round"]]} /></Field></>}
      {b.type === "gallery" && <>
        <Btn onClick={() => pick(true, (i) => set({ images: [...(d.images || []), ...i.map((x) => ({ src: x.url, alt: x.alt }))] }))}><Plus size={15} />Add pictures</Btn>
        <Field label="Pictures per row"><Seg value={d.cols} onChange={(v) => set({ cols: v })} opts={[[2, "2"], [3, "3"], [4, "4"], [5, "5"]]} /></Field>
        <Field label="Border"><Seg value={d.frame} onChange={(v) => set({ frame: v })} opts={[["none", "None"], ["gold", "Gold"], ["indic", "Indian"], ["shadow", "Shadow"]]} /></Field>
        <div className="grid grid-cols-4 gap-1.5">{(d.images || []).map((im: any, i: number) => <button key={i} title="Remove" onClick={() => set({ images: d.images.filter((_: any, j: number) => j !== i) })} className="group relative aspect-square overflow-hidden rounded-lg">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={im.src} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex"><X size={16} /></span></button>)}</div></>}
      {b.type === "columns" && <>
        <Field label="Column widths"><Seg value={d.split || "even"} onChange={(v) => set({ split: v })} opts={[["even", "Equal"], ["wide-left", "Wide left"], ["wide-right", "Wide right"]]} /></Field>
        {(["left", "right"] as const).map((k) => <Field key={k} label={`Picture in ${k} column`}><div className="flex gap-2"><Btn onClick={() => pick(false, (i) => set({ [`${k}Image`]: i[0].url })) }>{d[`${k}Image`] ? "Change" : "Choose"}</Btn>{d[`${k}Image`] && <Btn onClick={() => set({ [`${k}Image`]: "" })}>Remove</Btn>}</div></Field>)}</>}
      {b.type === "cards" && <>{(d.items || []).map((c: any, i: number) => (
        <div key={i} className="space-y-2 rounded-xl border border-line p-3">
          <Input value={c.title} onChange={(e) => set({ items: d.items.map((x: any, j: number) => j === i ? { ...x, title: e.target.value } : x) })} placeholder="Title" />
          <Input value={c.text} onChange={(e) => set({ items: d.items.map((x: any, j: number) => j === i ? { ...x, text: e.target.value } : x) })} placeholder="A short line" />
          <Select value={c.href} onChange={(e) => set({ items: d.items.map((x: any, j: number) => j === i ? { ...x, href: e.target.value } : x) })}><option value="/">Home</option>{pages.map((p) => <option key={p.id} value={p.path}>{p.title}</option>)}</Select>
          <div className="flex items-center justify-between"><Tones value={c.tone} onChange={(v) => set({ items: d.items.map((x: any, j: number) => j === i ? { ...x, tone: v } : x) })} /><button onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} className="text-[#a3281e]"><Trash2 size={15} /></button></div>
        </div>))}
        <Btn onClick={() => set({ items: [...(d.items || []), { title: "New card", text: "A short line.", href: "/", tone: "saffron" }] })}><Plus size={15} />Add a card</Btn></>}
      {b.type === "database" && <>
        <Field label="Which database?"><Select value={d.db} onChange={(e) => set({ db: e.target.value })}><option value="">Choose…</option>{dbs.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</Select></Field>
        <Field label="Show as"><Seg value={d.view} onChange={(v) => set({ view: v })} opts={[["list", "List"], ["table", "Table"], ["cards", "Cards"]]} /></Field>
        <Field label="Title above (optional)"><Input value={d.title || ""} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="How many rows"><Input type="number" value={d.limit} onChange={(e) => set({ limit: Number(e.target.value) })} /></Field></>}
      {b.type === "video" && <><Field label="YouTube link"><Input value={d.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" /></Field><Field label="Caption"><Input value={d.caption || ""} onChange={(e) => set({ caption: e.target.value })} /></Field></>}
      {b.type === "audio" && <><Field label="Audio link" hint="A direct link to an audio file."><Input value={d.url || ""} onChange={(e) => set({ url: e.target.value })} /></Field><Field label="Title"><Input value={d.title || ""} onChange={(e) => set({ title: e.target.value })} /></Field></>}
      {b.type === "button" && <><Field label="Words on the button"><Input value={d.label} onChange={(e) => set({ label: e.target.value })} /></Field>
        <Field label="Where it goes"><Input value={d.href} onChange={(e) => set({ href: e.target.value })} placeholder="/gurudeva or https://…" /></Field>
        <Field label="Colour"><Tones value={d.tone} onChange={(v) => set({ tone: v })} /></Field><Field label="Position"><Seg value={d.align} onChange={(v) => set({ align: v })} opts={[["left", "Left"], ["center", "Centre"], ["right", "Right"]]} /></Field></>}
      {b.type === "divider" && <Field label="Style"><div className="grid gap-1.5">{DIVIDERS.map(([k, l]) => <button key={k} onClick={() => set({ style: k })} className={`rounded-lg border px-3 py-2 text-left text-[13px] ${d.style === k ? "border-saffron bg-saffron-soft" : "border-line"}`}>{l}</button>)}</div></Field>}
      {b.type === "spacer" && <Field label="Height"><input type="range" min={8} max={240} value={d.h} onChange={(e) => set({ h: Number(e.target.value) })} className="w-full" /></Field>}
    </div>
  );
}

function PageSettings({ page, slug, setSlug, parent, setParent, parentOpts, seo, setSeo, title, blocks, onRestore }: { page: Page; slug: string; setSlug: (v: string) => void; parent: string; setParent: (v: string) => void; parentOpts: Opt[]; seo: Record<string, any>; setSeo: (s: Record<string, any>) => void; title: string; blocks: Block[]; onRestore: (b: Block[]) => void }) {
  const [vers, setVers] = useState<{ id: string; created_at: string }[] | null>(null);
  const s = (k: string, v: any) => setSeo({ ...seo, [k]: v });
  const plain = useMemo(() => blocks.filter((b) => b.type === "text").map((b) => String(b.data.html).replace(/<[^>]+>/g, " ")).join(" ").replace(/\s+/g, " ").trim().slice(0, 155), [blocks]);
  return (
    <div className="space-y-4">
      <Field label="Web address" hint={`taptajivanam.com${parent ? (parentOpts.find((p) => p.id === parent)?.path || "") : ""}/${slug}`}><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></Field>
      <Field label="Sits inside" hint="Choose a book or page to make this a chapter or sub-page."><Select value={parent} onChange={(e) => setParent(e.target.value)}><option value="">Top level</option>{parentOpts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select></Field>
      <div className="rounded-2xl border border-line p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron"><Globe size={13} />Search engines</p>
        <div className="mb-3 rounded-xl bg-band/70 p-3"><p className="truncate text-[15px] text-[#1a4fb0]">{seo.title || title}</p><p className="truncate text-[12px] text-[#2f7a3f]">taptajivanam.com{page.path}</p><p className="line-clamp-2 text-[12.5px] text-ink-2">{seo.description || plain || "A short description appears here."}</p></div>
        <div className="space-y-3"><Field label="Title in search results"><Input value={seo.title || ""} onChange={(e) => s("title", e.target.value)} placeholder={title} /></Field>
          <Field label="Description" hint="About 150 characters. Leave empty to use the first paragraph."><Textarea value={seo.description || ""} onChange={(e) => s("description", e.target.value)} rows={3} /></Field>
          <Field label="Share picture (address)"><Input value={seo.image || ""} onChange={(e) => s("image", e.target.value)} placeholder="/api/media/…" /></Field>
          <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={!!seo.noindex} onChange={(e) => s("noindex", e.target.checked)} />Hide this page from search engines</label></div>
      </div>
      <Btn onClick={async () => setVers(await api(`/api/admin/pages/${page.id}/versions`).catch(() => []))}><History size={15} />Earlier versions</Btn>
      {vers && <div className="space-y-1">{vers.length ? vers.map((v) => <button key={v.id} onClick={async () => { const r = await api<{ blocks: Block[] }>(`/api/admin/pages/${page.id}/versions?v=${v.id}`); onRestore(r.blocks); toast("Earlier version loaded. Press Save to keep it."); }} className="block w-full rounded-lg border border-line px-3 py-1.5 text-left text-[13px] hover:bg-band">{new Date(v.created_at).toLocaleString()}</button>) : <p className="text-[13px] text-ink-3">No earlier versions yet.</p>}</div>}
    </div>
  );
}
