"use client";
import { setTitle as setTitleLive } from "./page-titles";
import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, MoreHorizontal, ImagePlus, Smile, History, Globe, X, FileText, ChevronRight, Trash2 } from "lucide-react";
import { PAGE_TEMPLATES } from "@/lib/cms/templates";
import { slugify } from "@/lib/cms/blocks";
import { Btn, Field, Input, Select, Textarea, api, toast } from "../ui";
import { MediaPicker } from "../media-picker";
import { PageIcon } from "../../page-icon";

const NotionEditor = dynamic(() => import("./editor"), { ssr: false, loading: () => <p className="py-6 text-ink-3">Opening the editor…</p> });
const EMOJI = ["📄", "📖", "📑", "🪷", "🌸", "🙏", "📿", "🕉️", "✨", "🔔", "🎧", "🎬", "🖼️", "💬", "🗂️", "🗃️", "📜", "🏛️", "🛕", "🌺", "🌼", "🦚", "🐄", "🌿", "📅", "📰", "📣", "❤️", "⭐", "🔥", "📍", "🎵"];
const TYPES: [string, string][] = [["page", "Page"], ["book", "Book"], ["chapter", "Chapter of a book"], ["collection", "Collection (lists the pages inside)"]];
/** The editor only re-renders when the page itself changes, not on every save. */
const MemoEditor = memo(function MemoEditor({ initial, pageId, onDoc }: { initial: any[]; pageId: string; onDoc: React.MutableRefObject<(b: any[]) => void> }) {
  return <NotionEditor initial={initial} pageId={pageId} onChange={(b) => onDoc.current(b)} />;
}, (a, b) => a.pageId === b.pageId);
type Page = { id: string; title: string; path: string; slug: string; parent_id: string | null; type: string; status: string; blocks: any[]; seo: Record<string, any>; settings: Record<string, any> };
type Lite = { id: string; parent_id: string | null; title: string; path: string; icon?: string; type: string; position: number; status: string };

export function NotionPage({ pageId }: { pageId: string }) {
  const [page, setPage] = useState<Page | null>(null);
  const [all, setAll] = useState<Lite[]>([]);
  const [title, setTitle] = useState(""); const [settings, setSettings] = useState<Record<string, any>>({});
  const [seo, setSeo] = useState<Record<string, any>>({}); const [slug, setSlug] = useState(""); const [parent, setParent] = useState(""); const [type, setType] = useState("page");
  const blocks = useRef<any[]>([]); const [ver, setVer] = useState(0);
  const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false); const [drawer, setDrawer] = useState(false);
  const [emoji, setEmoji] = useState(false); const [iconPic, setIconPic] = useState(false); const [cover, setCover] = useState(false); const [fresh, setFresh] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null); const lastMeta = useRef(""); const onDoc = useRef<(b: any[]) => void>(() => {});

  useEffect(() => {
    api<Page>(`/api/admin/pages/${pageId}`).then((p) => {
      setPage(p); setTitle(p.title === "Untitled" ? "" : p.title); setSettings(p.settings || {}); setSeo(p.seo || {}); setSlug(p.slug); setParent(p.parent_id || ""); setType(p.type);
      blocks.current = p.blocks || []; setVer((v) => v + 1);
      const empty = !p.blocks?.length || (p.blocks.length === 1 && !(p.blocks[0].content || []).length);
      setFresh(empty && p.title === "Untitled"); if (p.title === "Untitled") setTimeout(() => titleRef.current?.focus(), 50);
    }).catch((e) => toast(e.message, true));
    const l = () => api<Lite[]>("/api/admin/pages").then(setAll).catch(() => {}); l();
    window.addEventListener("tj:pages-changed", l); return () => window.removeEventListener("tj:pages-changed", l);
  }, [pageId]);

  const save = useCallback(async (extra: Record<string, any> = {}, msg?: string) => {
    if (!page) return; setSaving(true);
    try {
      const r = await api<{ path: string }>(`/api/admin/pages/${pageId}`, "PATCH", { title: title.trim() || "Untitled", blocks: blocks.current, seo, settings, slug, parent_id: parent || null, type, ...extra });
      setPage((p) => p && { ...p, ...extra, path: r.path, title: title.trim() || "Untitled" }); setDirty(false);
      if (msg) toast(msg);
      const meta = JSON.stringify([title.trim(), settings.icon, settings.redirect, slug, parent, type, extra.status]);
      if (meta !== lastMeta.current) { lastMeta.current = meta; window.dispatchEvent(new Event("tj:pages-changed")); }
    } catch (e: any) { toast(e.message, true); } finally { setSaving(false); }
  }, [page, pageId, title, seo, settings, slug, parent, type]);
  useEffect(() => { if (!dirty) return; const t = setTimeout(() => save(), 1500); return () => clearTimeout(t); }, [dirty, save]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save({}, "Saved."); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [save]);
  useEffect(() => { const el = titleRef.current; if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }, [title]);

  const crumbs = useMemo(() => { const by = Object.fromEntries(all.map((p) => [p.id, p])); const out: Lite[] = []; let c = page?.parent_id ? by[page.parent_id] : undefined; while (c) { out.unshift(c); c = c.parent_id ? by[c.parent_id] : undefined; } return out; }, [all, page]);
  const children = useMemo(() => all.filter((p) => p.parent_id === pageId).sort((a, b) => a.position - b.position), [all, pageId]);
  const linked = new Set(blocks.current.filter((b) => b.type === "subpage").map((b) => b.props.pageId));
  if (!page) return <div className="p-10 text-ink-3">Opening…</div>;
  const setS = (k: string, v: any) => { setSettings((s) => ({ ...s, [k]: v })); setDirty(true); };
  const onTitle = (v: string) => { const old = slugify(title || "untitled"); if (slug === old || slug.startsWith("untitled")) setSlug(slugify(v || "untitled")); setTitle(v); setTitleLive(pageId, { title: v.trim() || "Untitled", icon: settings.icon, path: page?.path }); setDirty(true); };
  const useTemplate = async (k: string) => { const t = PAGE_TEMPLATES.find((x) => x.key === k)!; blocks.current = t.blocks(); setType(t.type); if (!settings.icon) setSettings((s) => ({ ...s, icon: t.icon })); setFresh(false); setVer((v) => v + 1); setDirty(true); };
  const full = !!settings.fullWidth;
  onDoc.current = (b) => { blocks.current = b; if (!dirty) setDirty(true); if (fresh) setFresh(false); };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 bg-white/95 px-3 backdrop-blur sm:px-4">
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 text-[13.5px] text-ink-2">
          {crumbs.map((c) => <span key={c.id} className="flex min-w-0 items-center gap-0.5"><Link href={`/admin/pages/${c.id}`} className="truncate rounded px-1.5 py-1 hover:bg-band"><PageIcon icon={c.icon} size={15} className="mr-1" />{c.title}</Link><ChevronRight size={13} className="shrink-0 text-ink-3" /></span>)}
          <span className="truncate px-1.5 font-medium text-ink"><PageIcon icon={settings.icon} size={15} className="mr-1" />{title || "Untitled"}</span>
        </nav>
        <span className="hidden text-[12.5px] text-ink-3 sm:inline">{saving ? "Saving…" : dirty ? "Editing…" : "Saved"}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${page.status === "published" ? "bg-[#e3f3e6] text-[#256a39]" : "bg-[#fbeccf] text-[#8a5a0a]"}`}>{page.status === "published" ? "Live" : "Draft"}</span>
        {page.status === "published" && <a href={page.path} target="_blank" title="View on the website" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-band"><Eye size={17} /></a>}
        <button onClick={() => save({ status: page.status === "published" ? "draft" : "published" }, page.status === "published" ? "Hidden from the website." : "Published. It is live now.")} className={`h-8 rounded-lg px-3 text-[13px] font-medium ${page.status === "published" ? "text-ink-2 hover:bg-band" : "bg-saffron text-white hover:brightness-110"}`}>{page.status === "published" ? "Unpublish" : "Publish"}</button>
        <button onClick={() => setDrawer(true)} title="Page settings" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-band"><MoreHorizontal size={18} /></button>
      </header>

      {settings.cover && <div className="group relative h-[28vh] min-h-[160px] w-full overflow-hidden">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={settings.cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: `center ${settings.coverY ?? 50}%` }} />
        <div className="absolute bottom-3 right-4 hidden gap-1.5 group-hover:flex"><button onClick={() => setCover(true)} className="rounded-lg bg-white/90 px-2.5 py-1 text-[12.5px] font-medium">Change cover</button><button onClick={() => setS("coverY", ((settings.coverY ?? 50) + 25) % 125)} className="rounded-lg bg-white/90 px-2.5 py-1 text-[12.5px] font-medium">Reposition</button><button onClick={() => setS("cover", "")} className="rounded-lg bg-white/90 px-2.5 py-1 text-[12.5px] font-medium">Remove</button></div></div>}

      <div className={`site-canvas mx-auto px-6 pb-40 sm:px-14 ${full ? "max-w-none" : "max-w-[900px]"}`}>
        <div className={`group relative ${settings.cover ? (settings.icon ? "-mt-10" : "pt-8") : "pt-16"}`}>
          {settings.icon && <button onClick={() => setEmoji(true)} className="mb-2 block rounded-xl leading-none hover:bg-band/60"><PageIcon icon={settings.icon} size={72} /></button>}
          <div className="mb-1 flex gap-1 text-[13px] text-ink-3 opacity-0 transition group-hover:opacity-100">
            {!settings.icon && <button onClick={() => setEmoji(true)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-band"><Smile size={15} />Add icon</button>}
            {!settings.cover && <button onClick={() => setCover(true)} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-band"><ImagePlus size={15} />Add cover</button>}
          </div>
          {emoji && <div className="absolute left-0 top-full z-40 w-[300px] rounded-xl border border-line bg-white p-2 shadow-xl"><div className="grid grid-cols-8 gap-1">{EMOJI.map((e) => <button key={e} onClick={() => { setS("icon", e); setEmoji(false); }} className="rounded p-1 text-[20px] hover:bg-band">{e}</button>)}</div><div className="mt-2 flex justify-between border-t border-line pt-2 text-[12.5px]"><button onClick={() => { setIconPic(true); setEmoji(false); }} className="font-medium text-saffron">Upload a picture</button><button onClick={() => { setS("icon", ""); setEmoji(false); }} className="text-ink-3 hover:text-ink">Remove</button><button onClick={() => setEmoji(false)} className="text-ink-3 hover:text-ink">Close</button></div></div>}
          <textarea ref={titleRef} rows={1} value={title} onChange={(e) => onTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (document.querySelector(".tj-editor [contenteditable=true]") as HTMLElement)?.focus(); } }} placeholder="Untitled" className="w-full resize-none overflow-hidden bg-transparent text-[34px] font-bold leading-[1.2] tracking-[-0.03em] text-ink outline-none placeholder:text-[#d9cfc3] sm:text-[40px]" />
        </div>
        <div className="-mx-[54px] mt-3">
          <MemoEditor key={ver} initial={blocks.current} pageId={pageId} onDoc={onDoc} />
        </div>
        {fresh && <div className="mt-6"><p className="mb-2 text-[13px] text-ink-3">Press <kbd className="rounded border border-line bg-band px-1">/</kbd> for every element, or start with a template:</p>
          <div className="grid gap-1.5 sm:grid-cols-2">{PAGE_TEMPLATES.filter((t) => t.key !== "blank").map((t) => <button key={t.key} onClick={() => useTemplate(t.key)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-band"><span className="text-[18px]">{t.icon}</span><span><span className="block text-[14px] font-medium">{t.name}</span><span className="block text-[12px] text-ink-3">{t.desc}</span></span></button>)}</div></div>}
        {children.filter((c) => !linked.has(c.id)).length > 0 && <div className="mt-10 border-t border-line pt-4"><p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3">{type === "book" || type === "chapter" ? "Chapters" : "Pages inside"}</p>
          {children.filter((c) => !linked.has(c.id)).map((c) => <Link key={c.id} href={`/admin/pages/${c.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[15px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:bg-band"><span className="no-underline">{c.icon ? <PageIcon icon={c.icon} size={17} /> : <FileText size={16} className="text-ink-3" />}</span>{c.title}{c.status !== "published" && <span className="text-[11.5px] font-normal text-[#8a5a0a] no-underline">draft</span>}</Link>)}</div>}
      </div>

      {iconPic && <MediaPicker onClose={() => setIconPic(false)} onPick={(i) => { setS("icon", i[0].url); setIconPic(false); }} />}
      {cover && <MediaPicker onClose={() => setCover(false)} onPick={(i) => { setS("cover", i[0].url); setCover(false); }} />}
      {drawer && <Drawer onClose={() => setDrawer(false)} {...{ page, all, title, slug, setSlug: (v: string) => { setSlug(v); setDirty(true); }, parent, setParent: (v: string) => { setParent(v); setDirty(true); }, type, setType: (v: string) => { setType(v); setDirty(true); }, seo, setSeo: (s: any) => { setSeo(s); setDirty(true); }, settings, setS, onRestore: (b: any[]) => { blocks.current = b; setVer((v) => v + 1); setDirty(true); } }} />}
    </div>
  );
}

const PAGE_BG: Record<string, string> = { cream: "#fdf8ef", saffron: "#fdf1e2", tulasi: "#f1f7ef", lotus: "#fbf0f2", sky: "#f0f5fc", gold: "#fbf3dc", lilac: "#f5f0fa", stone: "#f3f1ee" };

function Drawer({ onClose, page, all, title, slug, setSlug, parent, setParent, type, setType, seo, setSeo, settings, setS, onRestore }: any) {
  const [vers, setVers] = useState<{ id: string; created_at: string }[] | null>(null); const [bgPic, setBgPic] = useState(false);
  const s = (k: string, v: any) => setSeo({ ...seo, [k]: v });
  const parents = (all as Lite[]).filter((p) => p.id !== page.id && !p.path.startsWith(page.path + "/"));
  const pp = parents.find((p) => p.id === parent)?.path || "";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="h-full w-full max-w-[380px] overflow-y-auto border-l border-line bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-[16px] font-bold">Page settings</h2><button onClick={onClose} className="rounded p-1 hover:bg-band"><X size={18} /></button></div>
        <div className="space-y-4">
          <Field label="What is this page?"><Select value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          <Field label="Web address" hint={`taptajivanam.com${pp}/${slug}`}><Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} /></Field>
          <Field label="Send visitors to another website" hint="Leave empty for a normal page. If filled, opening this page goes straight to that address."><Input value={settings.redirect || ""} onChange={(e) => setS("redirect", e.target.value.trim())} placeholder="https://…" /></Field>
          <Field label="Sits inside" hint="Choose a book to make this a chapter, or any page to make this a sub-page."><Select value={parent} onChange={(e) => setParent(e.target.value)}><option value="">Top level</option>{parents.map((p) => <option key={p.id} value={p.id}>{"  ".repeat(p.path.split("/").length - 2)}{p.title}</option>)}</Select></Field>
          <div className="rounded-2xl border border-line p-3.5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">Look of this page</p>
            <p className="mb-1 text-[12.5px] text-ink-3">Background</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => setS("bg", "")} title="None" className={`h-7 w-7 rounded-full border border-dashed border-line-strong ${!settings.bg ? "ring-2 ring-saffron" : ""}`} />
              {Object.entries(PAGE_BG).map(([k, c]) => <button key={k} title={k} onClick={() => setS("bg", k)} className={`h-7 w-7 rounded-full ring-1 ring-black/10 ${settings.bg === k ? "ring-2 ring-saffron ring-offset-1" : ""}`} style={{ background: c }} />)}
              <input type="color" value={settings.bg?.startsWith("#") ? settings.bg : "#fdf6e8"} onChange={(e) => setS("bg", e.target.value)} title="Any colour" className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12.5px]"><button onClick={() => setBgPic(true)} className="rounded-lg border border-line px-2.5 py-1 hover:border-saffron">{settings.bgImage ? "Change background picture" : "Background picture"}</button>{settings.bgImage && <button onClick={() => setS("bgImage", "")} className="text-ink-3">Remove</button>}</div>
            {settings.bgImage && <label className="mt-2 block text-[12.5px] text-ink-3">Strength {settings.bgOpacity ?? 12}%<input type="range" min={4} max={60} value={settings.bgOpacity ?? 12} onChange={(e) => setS("bgOpacity", Number(e.target.value))} className="w-full" /></label>}
            <p className="mb-1 mt-3 text-[12.5px] text-ink-3">Title</p>
            <div className="flex flex-wrap gap-1 rounded-lg bg-band p-0.5">{[["", "Plain"], ["center", "Centred"], ["banner", "On the cover picture"], ["ornate", "With ornaments"]].map(([k, l]) => <button key={k} onClick={() => setS("titleStyle", k)} className={`rounded-md px-2 py-1 text-[12px] ${(settings.titleStyle || "") === k ? "bg-white font-semibold shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>
            <p className="mb-1 mt-3 text-[12.5px] text-ink-3">Reading width</p>
            <div className="flex flex-wrap gap-1 rounded-lg bg-band p-0.5">{[["narrow", "Narrow"], ["", "Normal"], ["wide", "Wide"], ["full", "Full"]].map(([k, l]) => <button key={k} onClick={() => setS("width", k)} className={`rounded-md px-2 py-1 text-[12px] ${(settings.width || "") === k ? "bg-white font-semibold shadow-sm" : "text-ink-3"}`}>{l}</button>)}</div>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[13.5px]">Full width<input type="checkbox" checked={!!settings.fullWidth} onChange={(e) => setS("fullWidth", e.target.checked)} /></label>
          <label className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[13.5px]">Hide the top menu bar on this page<input type="checkbox" checked={!!settings.hideNav} onChange={(e) => setS("hideNav", e.target.checked)} /></label>
          <label className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[13.5px]">Show the title on the website<input type="checkbox" checked={settings.hideTitle !== true} onChange={(e) => setS("hideTitle", !e.target.checked)} /></label>
          <div className="rounded-2xl border border-line p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron"><Globe size={13} />Search engines</p>
            <div className="mb-3 rounded-xl bg-band/70 p-3"><p className="truncate text-[15px] text-[#1a4fb0]">{seo.title || title || "Untitled"}</p><p className="truncate text-[12px] text-[#2f7a3f]">taptajivanam.com{page.path}</p><p className="line-clamp-2 text-[12.5px] text-ink-2">{seo.description || "The first lines of the page appear here."}</p></div>
            <div className="space-y-3"><Field label="Title in search results"><Input value={seo.title || ""} onChange={(e) => s("title", e.target.value)} placeholder={title} /></Field>
              <Field label="Description" hint="About 150 characters."><Textarea value={seo.description || ""} onChange={(e) => s("description", e.target.value)} rows={3} /></Field>
              <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={!!seo.noindex} onChange={(e) => s("noindex", e.target.checked)} />Hide from search engines</label></div>
          </div>
          <Btn onClick={async () => setVers(await api(`/api/admin/pages/${page.id}/versions`).catch(() => []))}><History size={15} />Earlier versions</Btn>
          {vers && <div className="space-y-1">{vers.length ? vers.map((v) => <button key={v.id} onClick={async () => { const r = await api<{ blocks: any[] }>(`/api/admin/pages/${page.id}/versions?v=${v.id}`); onRestore(r.blocks); toast("Earlier version restored."); onClose(); }} className="block w-full rounded-lg border border-line px-3 py-1.5 text-left text-[13px] hover:bg-band">{new Date(v.created_at).toLocaleString()}</button>) : <p className="text-[13px] text-ink-3">No earlier versions yet.</p>}</div>}
          {bgPic && <MediaPicker onClose={() => setBgPic(false)} onPick={(i) => { setS("bgImage", i[0].url); setBgPic(false); }} />}
          <Btn kind="danger" onClick={async () => { if (!confirm("Delete this page and every page inside it?")) return; await api(`/api/admin/pages/${page.id}`, "DELETE"); window.dispatchEvent(new Event("tj:pages-changed")); window.location.href = "/admin"; }}><Trash2 size={15} />Delete page</Btn>
        </div>
      </aside>
    </div>
  );
}
