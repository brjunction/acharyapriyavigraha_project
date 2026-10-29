"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Plus, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2, FileText, Folder, Settings2, ExternalLink, Image as ImageIcon, MoreHorizontal, Pencil } from "lucide-react";
import { LAYOUTS } from "@/lib/content/book-layouts";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Empty, Modal, api, toast, cn } from "../ui";
import { MediaPicker } from "../media-picker";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false, loading: () => <p className="p-6 text-zinc-500">Opening the editor…</p> });
type B = { id: string; slug: string; title: string; subtitle?: string; author?: string; category?: string; cover_url?: string; icon?: string; status: string; layout: string; chapters: number };
type N = { id: string; parent_id: string | null; kind: string; position: number; title: string; slug: string; status: string; has_text: boolean };

/* ------------------------------------------------------------------ bookshelf */
export function BooksPanel() {
  const [books, setBooks] = useState<B[] | null>(null); const [nw, setNw] = useState(false); const [f, setF] = useState({ title: "", author: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva", category: "" });
  const load = () => api<B[]>("/api/admin/books").then(setBooks).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const cats = useMemo(() => Array.from(new Set((books || []).map((b) => b.category || "Books"))), [books]);
  return (
    <div>
      <PageHeader icon={BookOpen} title="Books" description="Every book with its cover, shelf and chapters. Chapters can hold chapters, as deep as the book needs."><Btn kind="primary" onClick={() => setNw(true)}><Plus />New book</Btn></PageHeader>
      {books && !books.length && <Empty icon={BookOpen} title="No books yet" text="Make the first book, then add its parts and chapters."><Btn kind="primary" onClick={() => setNw(true)}><Plus />New book</Btn></Empty>}
      {cats.map((c) => (
        <section key={c} className="mb-8">
          <h2 className="mb-3 text-[14px] font-semibold text-zinc-500">{c}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">{(books || []).filter((b) => (b.category || "Books") === c).map((b) => (
            <Link key={b.id} href={`/admin/books/${b.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px_10px_10px_3px] border border-zinc-200 bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
                {b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-white"><span className="text-[28px]">{b.icon || "📖"}</span><span className="text-[14px] font-semibold leading-snug">{b.title}</span></div>}
                <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />{b.status !== "published" && <Badge className="absolute right-2 top-2">Draft</Badge>}</div>
              <p className="mt-2 truncate text-[14px] font-medium">{b.title}</p><p className="text-[12.5px] text-zinc-500">{b.chapters} chapters · {LAYOUTS.find((l) => l[0] === b.layout)?.[1]}</p>
            </Link>))}</div>
        </section>))}
      {nw && <Modal title="New book" onClose={() => setNw(false)}>
        <div className="space-y-4"><Field label="Title"><Input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field><Field label="Author"><Input value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} /></Field>
          <Field label="Shelf" hint="Books on the same shelf are shown together, e.g. “Gopal Jiu Publications”, “Translations”, “Magazines”."><Input list="shelves" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /><datalist id="shelves">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field></div>
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setNw(false)}>Cancel</Btn><Btn kind="primary" onClick={async () => { try { const r = await api<{ id: string }>("/api/admin/books", "POST", f); window.location.href = `/admin/books/${r.id}`; } catch (e: any) { toast(e.message, true); } }}>Create</Btn></div>
      </Modal>}
    </div>
  );
}

/* ------------------------------------------------------------------ one book */
export function BookEditor({ id }: { id: string }) {
  const [book, setBook] = useState<any>(null); const [nodes, setNodes] = useState<N[]>([]); const [cur, setCur] = useState<string | null>(null); const [open, setOpen] = useState<Record<string, boolean>>({});
  const load = useCallback(() => api<{ book: any; nodes: N[] }>(`/api/admin/books/${id}`).then((r) => { setBook(r.book); setNodes(r.nodes); }).catch((e) => toast(e.message, true)), [id]);
  useEffect(() => { load(); }, [load]);
  const kids = (p: string | null) => nodes.filter((n) => n.parent_id === p).sort((a, b) => a.position - b.position);
  const add = async (parent: string | null, kind = "chapter") => { const title = prompt(kind === "part" ? "Name of the part" : "Chapter title"); if (!title) return; const r = await api<{ id: string }>(`/api/admin/books/${id}/nodes`, "POST", { parent_id: parent, title, kind }); if (parent) setOpen((o) => ({ ...o, [parent]: true })); await load(); setCur(r.id); };
  const move = async (n: N, parent: string | null, position: number) => { await api(`/api/admin/books/${id}/nodes`, "PATCH", { id: n.id, parent_id: parent, position }).catch((e) => toast(e.message, true)); load(); };
  const del = async (n: N) => { if (!confirm(`Delete “${n.title}” and everything inside it?`)) return; await api(`/api/admin/nodes/${n.id}`, "DELETE"); if (cur === n.id) setCur(null); load(); };
  if (!book) return <div className="p-10 text-zinc-500">Opening…</div>;
  const number = (() => { const m: Record<string, string> = {}; const walk = (p: string | null, pre: string) => kids(p).forEach((n, i) => { m[n.id] = pre ? `${pre}.${i + 1}` : `${i + 1}`; walk(n.id, m[n.id]); }); walk(null, ""); return m; })();

  const Tree = ({ p, depth }: { p: string | null; depth: number }) => <>{kids(p).map((n, i, arr) => { const ch = kids(n.id); const prev = arr[i - 1]; return (
    <div key={n.id}>
      <div className={cn("group flex h-8 items-center gap-1 rounded-md pr-1 text-[13.5px]", cur === n.id ? "bg-zinc-200/70 font-medium" : "hover:bg-zinc-100")} style={{ paddingLeft: 4 + depth * 14 }}>
        <button onClick={() => setOpen((o) => ({ ...o, [n.id]: !o[n.id] }))} className="flex size-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200"><ChevronRight className={cn("size-3.5 transition", open[n.id] && "rotate-90", !ch.length && "opacity-30")} /></button>
        <button onClick={() => setCur(n.id)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">{n.kind === "part" ? <Folder className="size-4 shrink-0 text-zinc-500" /> : <FileText className="size-4 shrink-0 text-zinc-400" />}<span className="text-[11.5px] tabular-nums text-zinc-400">{number[n.id]}</span><span className="truncate">{n.title}</span>{!n.has_text && n.kind !== "part" && <span className="size-1.5 shrink-0 rounded-full bg-amber-400" title="No text yet" />}</button>
        <span className="hidden items-center group-hover:flex">
          <button title="Move up" onClick={() => move(n, n.parent_id, i - 1)} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200"><ArrowUp className="size-3.5" /></button>
          <button title="Move down" onClick={() => move(n, n.parent_id, i + 1)} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200"><ArrowDown className="size-3.5" /></button>
          {prev && <button title="Put inside the one above" onClick={() => move(n, prev.id, 999)} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200"><ArrowRight className="size-3.5" /></button>}
          {n.parent_id && <button title="Move out one level" onClick={() => { const par = nodes.find((x) => x.id === n.parent_id)!; move(n, par.parent_id, par.position + 1); }} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200"><ArrowLeft className="size-3.5" /></button>}
          <button title="Add a chapter inside" onClick={() => add(n.id)} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200"><Plus className="size-3.5" /></button>
          <button title="Delete" onClick={() => del(n)} className="rounded p-0.5 text-red-500 hover:bg-zinc-200"><Trash2 className="size-3.5" /></button>
        </span>
      </div>
      {open[n.id] && <Tree p={n.id} depth={depth + 1} />}
    </div>); })}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 h-screen w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-3">
        <Link href="/admin/books" className="mb-3 flex items-center gap-1.5 px-1 text-[13px] text-zinc-500 hover:text-zinc-900"><ArrowLeft className="size-4" />All books</Link>
        <button onClick={() => setCur(null)} className={cn("mb-3 flex w-full items-center gap-3 rounded-lg border p-2.5 text-left", !cur ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50")}>
          <span className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[2px_6px_6px_2px] bg-zinc-800 text-[18px]">{book.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover_url} alt="" className="h-full w-full object-cover" /> : book.icon || "📖"}</span>
          <span className="min-w-0"><span className="block truncate text-[14px] font-semibold">{book.title}</span><span className="flex items-center gap-1 text-[12px] text-zinc-500"><Settings2 className="size-3" />Book details & layout</span></span>
        </button>
        <div className="mb-1 flex items-center justify-between px-1 text-[12px] font-medium text-zinc-500"><span>Contents</span><span className="flex gap-1"><button onClick={() => add(null, "part")} className="rounded px-1.5 py-0.5 hover:bg-zinc-100">+ Part</button><button onClick={() => add(null)} className="rounded px-1.5 py-0.5 hover:bg-zinc-100">+ Chapter</button></span></div>
        {nodes.length ? <Tree p={null} depth={0} /> : <p className="px-2 py-3 text-[13px] text-zinc-500">No chapters yet. Add a part (like “Volume One”) or a chapter.</p>}
      </aside>
      <main className="min-w-0 flex-1">{cur ? <NodeEditor key={cur} id={cur} book={book} number={number[cur]} onChanged={load} /> : <BookDetails book={book} onSaved={load} />}</main>
    </div>
  );
}

function BookDetails({ book, onSaved }: { book: any; onSaved: () => void }) {
  const [b, setB] = useState(book); const [busy, setBusy] = useState(false); const [pic, setPic] = useState(false);
  const set = (k: string, v: any) => setB((p: any) => ({ ...p, [k]: v }));
  const save = async (extra: any = {}) => { setBusy(true); try { await api(`/api/admin/books/${book.id}`, "PATCH", { ...b, ...extra }); toast("Saved."); onSaved(); if (extra.status) set("status", extra.status); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between"><h1 className="text-[22px] font-semibold tracking-tight">Book details</h1><div className="flex gap-2">{b.status === "published" && <a href={`/books/${b.slug}`} target="_blank"><Btn><ExternalLink />View</Btn></a>}<Btn onClick={() => save({ status: b.status === "published" ? "draft" : "published" })}>{b.status === "published" ? "Hide" : "Publish"}</Btn><Btn kind="primary" busy={busy} onClick={() => save()}>Save</Btn></div></div>
      <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div><button onClick={() => setPic(true)} className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[3px_10px_10px_3px] border border-dashed border-zinc-300 bg-zinc-50 text-[13px] text-zinc-500 hover:border-zinc-400">{b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1"><ImageIcon className="size-5" />Choose cover</span>}</button>{b.cover_url && <button onClick={() => set("cover_url", "")} className="mt-1 text-[12px] text-zinc-500">Remove cover</button>}
          <Field label="Icon (emoji)" className="mt-4"><Input value={b.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="📖" /></Field></div>
        <div className="space-y-4">
          <Field label="Title"><Input value={b.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={b.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Author"><Input value={b.author || ""} onChange={(e) => set("author", e.target.value)} /></Field><Field label="Shelf"><Input value={b.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Gopal Jiu Publications" /></Field></div>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Publisher"><Input value={b.publisher || ""} onChange={(e) => set("publisher", e.target.value)} /></Field><Field label="Year"><Input value={b.year || ""} onChange={(e) => set("year", e.target.value)} /></Field><Field label="Language"><Select value={b.language} onChange={(e) => set("language", e.target.value)}>{[["en", "English"], ["or", "Odia"], ["hi", "Hindi"], ["bn", "Bengali"], ["ru", "Russian"], ["es", "Spanish"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field></div>
          <Field label="About the book"><Textarea rows={4} value={b.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Web address" hint={`taptajivanam.com/books/${b.slug}`}><Input value={b.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
        </div>
      </div>
      <h2 className="mb-3 mt-8 text-[15px] font-semibold">Layout</h2>
      <div className="grid gap-3 sm:grid-cols-2">{LAYOUTS.map(([k, l, d]) => <button key={k} onClick={() => set("layout", k)} className={cn("rounded-xl border p-4 text-left transition", b.layout === k ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:bg-zinc-50")}><LayoutSketch k={k} /><p className="mt-3 font-medium">{l}</p><p className="text-[13px] text-zinc-500">{d}</p></button>)}</div>
      <div className="mt-10 flex justify-end border-t border-zinc-200 pt-5"><Btn kind="danger" onClick={async () => { if (!confirm("Delete this whole book and all its chapters?")) return; await api(`/api/admin/books/${book.id}`, "DELETE"); window.location.href = "/admin/books"; }}><Trash2 />Delete book</Btn></div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set("cover_url", i[0].url); setPic(false); }} />}
    </div>
  );
}
function LayoutSketch({ k }: { k: string }) {
  const bar = "rounded-full bg-zinc-200"; return (
    <div className="flex h-20 gap-2 rounded-lg bg-zinc-50 p-2.5">
      {k === "classic" && <><div className="w-1/3 space-y-1.5">{[1, 2, 3, 4].map((i) => <div key={i} className={`h-1.5 ${bar}`} />)}</div><div className="flex-1 space-y-1.5"><div className="h-2.5 w-2/3 rounded bg-zinc-300" />{[1, 2, 3].map((i) => <div key={i} className={`h-1.5 ${bar}`} />)}</div></>}
      {k === "scripture" && <div className="flex flex-1 flex-col items-center justify-center gap-1.5"><div className="h-1.5 w-1/2 rounded-full bg-amber-300" /><div className="h-1.5 w-2/3 rounded-full bg-amber-200" /><div className="mt-1 h-1.5 w-5/6 rounded-full bg-zinc-200" /><div className="h-1.5 w-5/6 rounded-full bg-zinc-200" /></div>}
      {k === "cards" && <div className="grid flex-1 grid-cols-3 gap-1.5">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="rounded bg-zinc-200" />)}</div>}
      {k === "single" && <><div className="w-1/4 space-y-1">{[1, 2, 3, 4, 5].map((i) => <div key={i} className={`h-1 ${bar}`} />)}</div><div className="flex-1 space-y-1">{[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className={`h-1 ${bar}`} />)}</div></>}
    </div>
  );
}

function NodeEditor({ id, book, number, onChanged }: { id: string; book: any; number?: string; onChanged: () => void }) {
  const [n, setN] = useState<any>(null); const blocks = useRef<any[]>([]); const [title, setTitle] = useState(""); const [state, setState] = useState("Saved"); const t = useRef<any>(null);
  useEffect(() => { api(`/api/admin/nodes/${id}`).then((r) => { setN(r); setTitle(r.title); blocks.current = r.blocks || []; }).catch((e) => toast(e.message, true)); }, [id]);
  const save = useCallback(async (extra: any = {}) => { setState("Saving…"); try { await api(`/api/admin/nodes/${id}`, "PATCH", { title, blocks: blocks.current, ...extra }); setState("Saved"); if (extra.title !== undefined || extra.kind || extra.status) onChanged(); } catch (e: any) { toast(e.message, true); setState("Not saved"); } }, [id, title, onChanged]);
  const later = () => { setState("Editing…"); clearTimeout(t.current); t.current = setTimeout(() => save(), 1200); };
  if (!n) return <p className="p-8 text-zinc-500">Opening…</p>;
  return (
    <div>
      <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-zinc-200 bg-white/95 px-5 backdrop-blur">
        <span className="truncate text-[13px] text-zinc-500">{book.title} <ChevronRight className="inline size-3.5" /> {number} {title}</span><span className="ml-auto text-[12.5px] text-zinc-400">{state}</span>
        <Select value={n.kind} onChange={(e) => { setN({ ...n, kind: e.target.value }); save({ kind: e.target.value }); }} className="!h-8 !w-36"><option value="part">Part</option><option value="chapter">Chapter</option><option value="section">Section</option></Select>
        <Select value={n.status} onChange={(e) => { setN({ ...n, status: e.target.value }); save({ status: e.target.value }); }} className="!h-8 !w-32"><option value="published">Shown</option><option value="draft">Hidden</option></Select>
      </div>
      <div className="site-canvas mx-auto max-w-[860px] px-6 pb-40 pt-12 sm:px-14">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-saffron">{n.kind === "part" ? "Part" : "Chapter"} {number}</p>
        <input value={title} onChange={(e) => { setTitle(e.target.value); later(); }} onBlur={() => title !== n.title && save({ title })} className="mt-1 w-full bg-transparent text-[34px] font-bold tracking-[-0.03em] outline-none" />
        <div className="-mx-[54px] mt-4"><NotionEditor initial={blocks.current} pageId="" onChange={(b) => { blocks.current = b; later(); }} /></div>
      </div>
    </div>
  );
}
