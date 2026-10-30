"use client";
/* One book in the Studio, made simple: a list of chapters you can read like a contents page, a quiet writing screen, and the book's details with a cover you can crop. */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus, Trash2, ExternalLink, FileUp, Image as ImageIcon, IndentIncrease, IndentDecrease, X, Check, Upload, Link2 } from "lucide-react";
import { LAYOUTS } from "@/lib/content/book-layouts";
import { Btn, Badge, Field, Input, Select, Textarea, Modal, api, toast, cn } from "../ui";
import { MediaPicker } from "../media-picker";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false, loading: () => <p className="p-6 text-zinc-500">Opening the editor…</p> });
type N = { id: string; parent_id: string | null; kind: string; position: number; title: string; slug: string; status: string; has_text: boolean };

export function BookEditor({ id }: { id: string }) {
  const [book, setBook] = useState<any>(null); const [nodes, setNodes] = useState<N[]>([]); const [tab, setTab] = useState<"chapters" | "details">("chapters"); const [writing, setWriting] = useState<string | null>(null);
  const load = useCallback(() => api<{ book: any; nodes: N[] }>(`/api/admin/books/${id}`).then((r) => { setBook(r.book); setNodes(r.nodes); }).catch((e) => toast(e.message, true)), [id]);
  useEffect(() => { load(); }, [load]);
  if (!book) return <div className="p-10 text-zinc-500">Opening…</div>;
  const kids = (p: string | null) => nodes.filter((n) => n.parent_id === p).sort((a, b) => a.position - b.position);
  const order: N[] = []; const num: Record<string, string> = {}; const depth: Record<string, number> = {};
  const walk = (p: string | null, pre: string, d: number) => kids(p).forEach((n, i) => { num[n.id] = pre ? `${pre}.${i + 1}` : `${i + 1}`; depth[n.id] = d; order.push(n); walk(n.id, num[n.id], d + 1); }); walk(null, "", 0);
  const publish = async (status: string) => { await api(`/api/admin/books/${id}`, "PATCH", { ...book, status }).then(() => { toast(status === "published" ? "The book is on the website." : "The book is hidden."); load(); }).catch((e) => toast(e.message, true)); };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-5">
          <Link href="/admin/books" className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-zinc-600 hover:bg-zinc-100"><ArrowLeft className="size-4" />Books</Link>
          <span className="flex h-9 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[2px_4px_4px_2px] bg-zinc-800">{book.cover_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover_url} alt="" className="h-full w-full object-cover" />}</span>
          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{book.title}</p>
          {book.status === "published" ? <Badge tone="green">On the website</Badge> : <Badge>Hidden</Badge>}
          {book.status === "published" && <a href={`/books/${book.slug}`} target="_blank"><Btn size="sm"><ExternalLink />View</Btn></a>}
          <Btn size="sm" kind={book.status === "published" ? "ghost" : "primary"} onClick={() => publish(book.status === "published" ? "draft" : "published")}>{book.status === "published" ? "Hide" : "Publish"}</Btn>
        </div>
        <div className="mx-auto flex max-w-4xl gap-1 px-5">{([["chapters", `Chapters (${nodes.length})`], ["details", "Cover & details"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-3 py-2 text-[13px]", tab === k ? "border-zinc-900 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-900")}>{l}</button>)}</div>
      </div>
      <div className="mx-auto max-w-4xl px-5 py-8">
        {tab === "chapters" ? <Chapters bookId={id} order={order} num={num} depth={depth} kids={kids} nodes={nodes} onOpen={setWriting} onChanged={load} /> : <Details book={book} onSaved={load} />}
      </div>
      {writing && <Writer bookTitle={book.title} id={writing} order={order} num={num} onGo={setWriting} onClose={() => { setWriting(null); load(); }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ The contents, as a list anyone can manage */
function Chapters({ bookId, order, num, depth, kids, nodes, onOpen, onChanged }: { bookId: string; order: N[]; num: Record<string, string>; depth: Record<string, number>; kids: (p: string | null) => N[]; nodes: N[]; onOpen: (id: string) => void; onChanged: () => void }) {
  const [title, setTitle] = useState(""); const [under, setUnder] = useState<string>(""); const [busy, setBusy] = useState(false); const [word, setWord] = useState(false);
  const add = async () => { if (!title.trim()) return; setBusy(true); try { await api(`/api/admin/books/${bookId}/nodes`, "POST", { parent_id: under || null, title, kind: "chapter" }); setTitle(""); onChanged(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  const move = async (n: N, parent: string | null, position: number) => { await api(`/api/admin/books/${bookId}/nodes`, "PATCH", { id: n.id, parent_id: parent, position }).catch((e) => toast(e.message, true)); onChanged(); };
  const del = async (n: N) => { if (!confirm(`Delete “${n.title}” and everything inside it?`)) return; await api(`/api/admin/nodes/${n.id}`, "DELETE"); onChanged(); };
  const rename = async (n: N, t: string) => { if (!t.trim() || t === n.title) return; await api(`/api/admin/nodes/${n.id}`, "PATCH", { title: t }).catch((e) => toast(e.message, true)); onChanged(); };
  const ib = "flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-[16px] font-semibold">Chapters</h2><p className="text-[13px] text-zinc-500">Click a chapter to write or paste its text. Use the arrows to reorder, or to put a chapter inside the one above it.</p></div>
        <Btn onClick={() => setWord(true)}><FileUp />Import the whole book from Word</Btn>
      </div>
      <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {order.length ? order.map((n) => { const sib = kids(n.parent_id); const i = sib.findIndex((x) => x.id === n.id); const prev = sib[i - 1]; return (
          <div key={n.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-zinc-50" style={{ paddingLeft: 12 + depth[n.id] * 24 }}>
            <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-zinc-400">{num[n.id]}</span>
            <input defaultValue={n.title} onBlur={(e) => rename(n, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className={cn("min-w-0 flex-1 rounded px-1.5 py-1 text-[14px] outline-none focus:bg-white focus:ring-1 focus:ring-zinc-300", depth[n.id] === 0 ? "font-medium" : "")} />
            {!n.has_text && <span className="hidden text-[11.5px] text-amber-600 sm:inline">No text yet</span>}
            {n.status !== "published" && <Badge>Hidden</Badge>}
            <span className="flex items-center opacity-60 group-hover:opacity-100">
              <button className={ib} title="Move up" disabled={i === 0} onClick={() => move(n, n.parent_id, i - 1)}><ArrowUp className="size-3.5" /></button>
              <button className={ib} title="Move down" disabled={i === sib.length - 1} onClick={() => move(n, n.parent_id, i + 1)}><ArrowDown className="size-3.5" /></button>
              <button className={ib} title="Put inside the chapter above" disabled={!prev} onClick={() => prev && move(n, prev.id, 999)}><IndentIncrease className="size-3.5" /></button>
              <button className={ib} title="Move out one level" disabled={!n.parent_id} onClick={() => { const par = nodes.find((x) => x.id === n.parent_id); if (par) move(n, par.parent_id, par.position + 1); }}><IndentDecrease className="size-3.5" /></button>
              <button className={ib} title="Delete" onClick={() => del(n)}><Trash2 className="size-3.5" /></button>
            </span>
            <Btn size="sm" onClick={() => onOpen(n.id)}>Write</Btn>
          </div>); }) : <p className="p-6 text-center text-[13px] text-zinc-500">No chapters yet. Add the first one below, or import the whole book from a Word file.</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-zinc-300 p-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Title of a new chapter" className="min-w-[220px] flex-1" />
        <Select value={under} onChange={(e) => setUnder(e.target.value)} className="!w-auto max-w-[240px]"><option value="">As a main chapter</option>{order.map((n) => <option key={n.id} value={n.id}>Inside {num[n.id]} {n.title.slice(0, 40)}</option>)}</Select>
        <Btn kind="primary" busy={busy} disabled={!title.trim()} onClick={add}><Plus />Add chapter</Btn>
      </div>
      {word && <WordImport bookId={bookId} onClose={() => setWord(false)} onDone={() => { setWord(false); onChanged(); }} />}
    </div>
  );
}

/** A Word file → chapters (Heading 1) and sub-chapters (Heading 2), with their text. */
function WordImport({ bookId, onClose, onDone }: { bookId: string; onClose: () => void; onDone: () => void }) {
  const [parts, setParts] = useState<{ level: number; title: string; html: string }[] | null>(null); const [prog, setProg] = useState(""); const [busy, setBusy] = useState(false);
  const read = async (f: File) => {
    try {
      // @ts-expect-error browser build has no types
      const mammoth = (await import("mammoth/mammoth.browser.min.js")).default;
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() }, { styleMap: ["p[style-name='Title'] => h1:fresh"] });
      const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").body.firstElementChild!; const out: { level: number; title: string; html: string }[] = [];
      for (const el of Array.from(doc.children)) { const t = el.tagName; if (t === "H1" || t === "H2") out.push({ level: t === "H1" ? 1 : 2, title: el.textContent?.trim() || "Untitled", html: "" }); else { if (!out.length) out.push({ level: 1, title: "Introduction", html: "" }); out[out.length - 1].html += el.outerHTML; } }
      setParts(out);
    } catch { toast("This Word file could not be read.", true); }
  };
  const go = async () => {
    if (!parts) return; setBusy(true);
    const { BlockNoteEditor } = await import("@blocknote/core"); const ed = BlockNoteEditor.create(); let lastTop: string | null = null;
    for (const [i, p] of parts.entries()) {
      setProg(`${i + 1} of ${parts.length}: ${p.title}`);
      const r: { id: string } = await api<{ id: string }>(`/api/admin/books/${bookId}/nodes`, "POST", { parent_id: p.level === 2 ? lastTop : null, title: p.title, kind: "chapter" });
      if (p.level === 1) lastTop = r.id;
      if (p.html.trim()) await api(`/api/admin/nodes/${r.id}`, "PATCH", { blocks: await ed.tryParseHTMLToBlocks(p.html.replace(/<img[^>]*>/g, "")) });
    }
    toast(`${parts.length} chapters added.`); onDone();
  };
  return (
    <Modal title="Import the whole book from Word" description="In the Word file, use Heading 1 for chapter titles and Heading 2 for sub-chapters. Everything under a heading becomes that chapter’s text. Chapters are added after the ones already here." onClose={onClose}>
      <input type="file" accept=".docx" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="text-[13px]" />
      {parts && <div className="mt-4 max-h-64 overflow-y-auto rounded-md border border-zinc-200 p-2 text-[13px]">{parts.map((p, i) => <p key={i} className={p.level === 2 ? "pl-5 text-zinc-600" : "font-medium"}>{p.title} <span className="text-[11.5px] font-normal text-zinc-400">{p.html ? `${p.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length} words` : "no text"}</span></p>)}</div>}
      {prog && <p className="mt-3 text-[12.5px] text-zinc-600">Adding {prog}</p>}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!parts?.length} onClick={go}><FileUp />Add {parts?.length || ""} chapters</Btn></div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Writing one chapter, full screen */
function Writer({ bookTitle, id, order, num, onGo, onClose }: { bookTitle: string; id: string; order: N[]; num: Record<string, string>; onGo: (id: string) => void; onClose: () => void }) {
  const [n, setN] = useState<any>(null); const blocks = useRef<any[]>([]); const [title, setTitle] = useState(""); const [state, setState] = useState("Saved"); const t = useRef<any>(null);
  useEffect(() => { setN(null); api(`/api/admin/nodes/${id}`).then((r) => { setN(r); setTitle(r.title); blocks.current = r.blocks || []; }).catch((e) => toast(e.message, true)); }, [id]);
  const save = useCallback(async (extra: any = {}) => { setState("Saving…"); try { await api(`/api/admin/nodes/${id}`, "PATCH", { title, blocks: blocks.current, ...extra }); setState("Saved"); } catch (e: any) { toast(e.message, true); setState("Not saved"); } }, [id, title]);
  const later = () => { setState("Unsaved"); clearTimeout(t.current); t.current = setTimeout(() => save(), 1500); };
  const k = order.findIndex((x) => x.id === id); const prev = order[k - 1], next = order[k + 1];
  const go = async (to?: N) => { if (!to) return; clearTimeout(t.current); await save(); onGo(to.id); };
  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 px-4">
        <button onClick={async () => { clearTimeout(t.current); await save(); onClose(); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-zinc-600 hover:bg-zinc-100"><X className="size-4" />Close</button>
        <p className="min-w-0 flex-1 truncate text-center text-[12.5px] text-zinc-500">{bookTitle} · {num[id]} {title}</p>
        <span className="text-[12px] text-zinc-400">{state === "Saved" ? <span className="flex items-center gap-1"><Check className="size-3.5" />Saved</span> : state}</span>
        {n && <Select value={n.status} onChange={(e) => { setN({ ...n, status: e.target.value }); save({ status: e.target.value }); }} className="!h-8 !w-32"><option value="published">Shown</option><option value="draft">Hidden</option></Select>}
        <Btn size="sm" disabled={!prev} onClick={() => go(prev)}><ChevronLeft /></Btn><Btn size="sm" disabled={!next} onClick={() => go(next)}><ChevronRight /></Btn>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50/60 p-2 lg:block">{order.map((x) => <button key={x.id} onClick={() => go(x)} className={cn("flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]", x.id === id ? "bg-white font-medium shadow-xs" : "text-zinc-600 hover:bg-zinc-100")} style={{ paddingLeft: 8 + (num[x.id].split(".").length - 1) * 12 }}><span className="w-8 shrink-0 tabular-nums text-zinc-400">{num[x.id]}</span><span className="truncate">{x.title}</span></button>)}</aside>
        <div className="site-canvas min-w-0 flex-1 overflow-y-auto">{n ? <div className="mx-auto max-w-[820px] px-6 pb-40 pt-10 sm:px-14">
          <p className="text-[12.5px] text-zinc-500">Chapter {num[id]}</p>
          <input value={title} onChange={(e) => { setTitle(e.target.value); later(); }} className="mt-1 w-full bg-transparent text-[28px] font-semibold tracking-tight outline-none" placeholder="Chapter title" />
          <p className="mt-1 text-[12px] text-zinc-400">Type “/” for headings, verses, pictures and more. Paste from Word or Google Docs keeps bold, italics and headings.</p>
          <div className="-mx-[54px] mt-4"><NotionEditor key={id} initial={blocks.current} pageId="" onChange={(b) => { blocks.current = b; later(); }} /></div>
        </div> : <p className="p-8 text-zinc-500">Opening…</p>}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Cover & details */
function Details({ book, onSaved }: { book: any; onSaved: () => void }) {
  const [b, setB] = useState(book); const [busy, setBusy] = useState(false); const [crop, setCrop] = useState(false); const [pick, setPick] = useState(false);
  const set = (k: string, v: any) => setB((p: any) => ({ ...p, [k]: v }));
  const save = async () => { setBusy(true); try { await api(`/api/admin/books/${book.id}`, "PATCH", b); toast("Saved."); onSaved(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-[200px_minmax(0,1fr)]">
        <div>
          <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[3px_8px_8px_3px] border border-zinc-200 bg-zinc-50">{b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="size-8 text-zinc-300" />}</div>
          <div className="mt-3 grid gap-2"><Btn onClick={() => setCrop(true)}><Upload />{b.cover_url ? "Change cover" : "Add a cover"}</Btn><Btn onClick={() => setPick(true)}><ImageIcon />From Pictures & files</Btn>{b.cover_url && <Btn onClick={() => set("cover_url", null)}>Remove cover</Btn>}</div>
        </div>
        <div className="space-y-4">
          <Field label="Title"><Input value={b.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={b.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Author"><Input value={b.author || ""} onChange={(e) => set("author", e.target.value)} /></Field><Field label="Shelf" hint="Books on the same shelf are shown together"><Input value={b.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Books about Śrīla Gurudeva" /></Field></div>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Publisher"><Input value={b.publisher || ""} onChange={(e) => set("publisher", e.target.value)} /></Field><Field label="Year"><Input value={b.year || ""} onChange={(e) => set("year", e.target.value)} /></Field><Field label="Language"><Select value={b.language} onChange={(e) => set("language", e.target.value)}>{[["en", "English"], ["hi", "Hindi"], ["or", "Odia"], ["bn", "Bengali"], ["ru", "Russian"], ["id", "Indonesian"], ["nl", "Dutch"], ["es", "Spanish"]].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field></div>
          <Field label="About the book" hint="Shown on the book’s first page"><Textarea rows={4} value={b.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="How the book is shown"><div className="grid gap-2 sm:grid-cols-2">{LAYOUTS.map(([k, l, d]) => <button key={k} onClick={() => set("layout", k)} className={cn("rounded-lg border p-3 text-left", b.layout === k ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:bg-zinc-50")}><p className="text-[13px] font-medium">{l}</p><p className="text-[12px] text-zinc-500">{d}</p></button>)}</div></Field>
          <details className="text-[12.5px]"><summary className="cursor-pointer text-zinc-500">Web address</summary><Input className="mt-2" value={b.slug} onChange={(e) => set("slug", e.target.value)} /><p className="mt-1 text-zinc-400">taptajivanam.com/books/{b.slug}</p></details>
          <div className="flex justify-between border-t border-zinc-200 pt-4"><Btn kind="danger" onClick={async () => { if (!confirm("Delete this whole book and all its chapters?")) return; await api(`/api/admin/books/${book.id}`, "DELETE"); window.location.href = "/admin/books"; }}><Trash2 />Delete book</Btn><Btn kind="primary" busy={busy} onClick={save}>Save details</Btn></div>
        </div>
      </div>
      {crop && <CoverCropper onClose={() => setCrop(false)} onDone={(url) => { set("cover_url", url); setCrop(false); api(`/api/admin/books/${book.id}`, "PATCH", { ...b, cover_url: url }).then(onSaved); }} />}
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(i) => { if (i[0]) { set("cover_url", i[0].url); api(`/api/admin/books/${book.id}`, "PATCH", { ...b, cover_url: i[0].url }).then(onSaved); } setPick(false); }} />}
    </div>
  );
}

/** Choose a picture (file, drag and drop, paste, or link), then move and zoom it inside the cover frame. */
export function CoverCropper({ onClose, onDone, ratio = 3 / 4 }: { onClose: () => void; onDone: (url: string) => void; ratio?: number }) {
  const [src, setSrc] = useState<string | null>(null); const [zoom, setZoom] = useState(1); const [pos, setPos] = useState({ x: 0, y: 0 }); const [busy, setBusy] = useState(false); const [link, setLink] = useState(""); const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const img = useRef<HTMLImageElement>(null); const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const W = 300, H = W / ratio;
  const file = (f?: File | null) => { if (f && f.type.startsWith("image/")) { setNat(null); setSrc(URL.createObjectURL(f)); setZoom(1); setPos({ x: 0, y: 0 }); } };
  useEffect(() => { const p = (e: ClipboardEvent) => file(Array.from(e.clipboardData?.files || [])[0]); window.addEventListener("paste", p); return () => window.removeEventListener("paste", p); }, []);
  const base = () => (nat ? Math.max(W / nat.w, H / nat.h) : 1);
  const done = async () => {
    const i = img.current; if (!i) return; setBusy(true);
    try {
      const c = document.createElement("canvas"); const OUT = 900; c.width = OUT; c.height = OUT / ratio; const k = OUT / W; const s = base() * zoom;
      const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(i, (W / 2 + pos.x - (i.naturalWidth * s) / 2) * k, (H / 2 + pos.y - (i.naturalHeight * s) / 2) * k, i.naturalWidth * s * k, i.naturalHeight * s * k);
      const blob: Blob = await new Promise((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error("This picture cannot be cropped here (its website does not allow it). Download it and choose the file instead."))), "image/jpeg", 0.88));
      const fd = new FormData(); fd.append("file", new File([blob], "cover.jpg", { type: "image/jpeg" })); const r = await api<{ url: string }>("/api/admin/media", "POST", fd); onDone(r.url);
    } catch (e: any) { toast(e.message || "The cover could not be saved.", true); setBusy(false); }
  };
  return (
    <Modal title="Cover" description="Choose a picture, then drag it and zoom until the cover looks right." onClose={onClose}>
      {!src ? (
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); file(e.dataTransfer.files[0]); }} className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <Upload className="size-6 text-zinc-400" /><p className="text-[13px] text-zinc-600">Drop a picture here, paste one (Ctrl V), or</p>
          <label className="cursor-pointer rounded-md bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white">Choose a file<input type="file" accept="image/*" className="hidden" onChange={(e) => file(e.target.files?.[0])} /></label>
          <div className="mt-2 flex w-full gap-2"><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste a link to a picture" /><Btn disabled={!link} onClick={() => { setSrc(link); setZoom(1); setPos({ x: 0, y: 0 }); }}><Link2 />Use</Btn></div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative cursor-grab touch-none overflow-hidden rounded-[3px_8px_8px_3px] bg-zinc-100 shadow-inner active:cursor-grabbing" style={{ width: W, height: H }}
            onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; }}
            onPointerMove={(e) => { if (drag.current) setPos({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y }); }}
            onPointerUp={() => (drag.current = null)} onWheel={(e) => setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY / 800)))}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={img} src={src} crossOrigin="anonymous" alt="" draggable={false} onLoad={(e) => { setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }); setZoom(1); }} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none" style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, width: nat ? nat.w * base() * zoom : "auto", visibility: nat ? "visible" : "hidden" }} />
          </div>
          <div className="mt-4 flex w-full max-w-[300px] items-center gap-3 text-[12px] text-zinc-500">Zoom<input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-zinc-900" /></div>
          <button onClick={() => setSrc(null)} className="mt-2 text-[12.5px] text-zinc-500 underline">Choose another picture</button>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!src} onClick={done}><Check />Use this cover</Btn></div>
    </Modal>
  );
}
