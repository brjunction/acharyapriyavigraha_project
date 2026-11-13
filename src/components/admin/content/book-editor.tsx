"use client";
/* One book in the Studio, made simple: a list of chapters you can read like a contents page, a quiet writing screen, and the book's details with a cover you can crop. */
import { keepSource } from "@/lib/content/book-source";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, ExternalLink, FileUp, Image as ImageIcon, X, Check, Upload, Link2, Pencil, MoreHorizontal, Undo2, Redo2, Bold, Italic, Underline, RemoveFormatting, AlignLeft, AlignCenter, AlignRight, AlignJustify, FileText, Download } from "lucide-react";
import { LAYOUTS } from "@/lib/content/book-layouts";
import { BOOK_LANGS, langName } from "@/lib/content/book-langs";
import { AiAssist } from "../ai-assist";
import { Btn, Badge, Field, Input, Select, Textarea, Modal, api, toast, cn } from "../ui";
import { MediaPicker } from "../media-picker";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false, loading: () => <p className="p-6 text-zinc-500">Opening the editor…</p> });
type N = { id: string; parent_id: string | null; kind: string; position: number; title: string; slug: string; status: string; has_text: boolean; has_draft?: boolean; draft_title?: string; heads?: number };

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
        <div className="mx-auto flex max-w-4xl gap-1 px-5">{([["chapters", `Contents (${nodes.length})`], ["details", "Cover & details"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-3 py-2 text-[13px]", tab === k ? "border-zinc-900 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-900")}>{l}</button>)}</div>
      </div>
      <div className="mx-auto max-w-4xl px-5 py-8">
        {tab === "chapters" ? <Chapters bookId={id} order={order} num={num} depth={depth} kids={kids} nodes={nodes} onOpen={setWriting} onChanged={load} /> : <Details book={book} onSaved={load} />}
      </div>
      {writing && <Writer bookTitle={book.title} bookId={id} id={writing} order={order} num={num} onGo={setWriting} onClose={() => { setWriting(null); load(); }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ The contents: drag to reorder, select many, publish when ready */
type Row = { id: string; depth: number };
/** A flat list with depths → parent and position of every chapter. */
const toItems = (flat: Row[]) => { const stack: string[] = []; const count = new Map<string, number>(); return flat.map((r) => { stack.length = r.depth; const parent = r.depth ? stack[r.depth - 1] || null : null; const k = parent || ""; const position = count.get(k) || 0; count.set(k, position + 1); stack[r.depth] = r.id; return { id: r.id, parent_id: parent, position }; }); };
const blockEnd = (flat: Row[], i: number) => { let e = i + 1; while (e < flat.length && flat[e].depth > flat[i].depth) e++; return e; };
const clampDepths = (flat: Row[]) => flat.map((r, i, a) => { const d = i === 0 ? 0 : Math.min(r.depth, a[i - 1].depth + 1); a[i] = { ...r, depth: Math.max(0, d) }; return a[i]; });
let pendingSave: (() => Promise<void>) | null = null;   // the open chapter saves itself before the contents change

function Chapters({ bookId, order, num, depth, nodes, onOpen, onChanged }: { bookId: string; order: N[]; num: Record<string, string>; depth: Record<string, number>; kids: (p: string | null) => N[]; nodes: N[]; onOpen: (id: string) => void; onChanged: () => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set()); const [closed, setClosed] = useState<Set<string>>(new Set()); const [q, setQ] = useState(""); const [busy, setBusy] = useState("");
  const [drag, setDrag] = useState<string | null>(null); const [drop, setDrop] = useState<{ at: number; depth: number } | null>(null); const [edit, setEdit] = useState<string | null>(null); const [menu, setMenu] = useState<string | null>(null);
  const [title, setTitle] = useState(""); const listRef = useRef<HTMLDivElement>(null); const [word, setWord] = useState(false);
  const flat: Row[] = order.map((n) => ({ id: n.id, depth: depth[n.id] })); const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const hasKids = (id: string) => nodes.some((n) => n.parent_id === id);
  const hiddenByParent = (n: N): boolean => { let p = n.parent_id; while (p) { if (closed.has(p)) return true; p = by[p]?.parent_id ?? null; } return false; };
  const f = q.trim().toLowerCase(); const visible = order.filter((n) => (f ? (n.draft_title || n.title).toLowerCase().includes(f) : !hiddenByParent(n)));
  const pending = nodes.filter((n) => n.has_draft || n.status !== "published").length;
  const run = async (label: string, body: any, ok?: string) => { setBusy(label); try { if (pendingSave) await pendingSave(); const r = await api<any>(`/api/admin/books/${bookId}/tree`, "POST", body); if (ok) toast(ok.replace("{n}", String(r?.n ?? ""))); setSel(new Set()); onChanged(); return r; } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  const save = (next: Row[]) => run("Saving the order…", { op: "order", items: toItems(clampDepths(next)) });
  const moveBlock = (id: string, at: number, d: number) => { const i = flat.findIndex((r) => r.id === id); if (i < 0) return; const e = blockEnd(flat, i); const blk = flat.slice(i, e); const rest = [...flat.slice(0, i), ...flat.slice(e)]; const ins = at > i ? at - blk.length : at; if (ins < 0) return; const shift = d - blk[0].depth; save([...rest.slice(0, ins), ...blk.map((r) => ({ ...r, depth: r.depth + shift })), ...rest.slice(ins)]); };
  const indent = (ids: string[], dir: 1 | -1) => { let cur = [...flat];
    for (const id of order.map((n) => n.id).filter((x) => ids.includes(x))) { const i = cur.findIndex((r) => r.id === id); const e = blockEnd(cur, i); const blk = cur.slice(i, e);
      if (dir === 1) { if (!i || cur[i - 1].depth < blk[0].depth) continue; cur = [...cur.slice(0, i), ...blk.map((r) => ({ ...r, depth: r.depth + 1 })), ...cur.slice(e)]; }
      else { if (!blk[0].depth) continue; let p = i - 1; while (p >= 0 && cur[p].depth >= blk[0].depth) p--; const rest = [...cur.slice(0, i), ...cur.slice(e)]; const pe = blockEnd(rest, p); cur = [...rest.slice(0, pe), ...blk.map((r) => ({ ...r, depth: r.depth - 1 })), ...rest.slice(pe)]; } }
    save(cur); };
  const onOver = (e: React.DragEvent, n: N) => { e.preventDefault(); if (!drag || drag === n.id) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const before = e.clientY < r.top + r.height / 2; const i = flat.findIndex((x) => x.id === n.id);
    let at = before ? i : closed.has(n.id) || f ? blockEnd(flat, i) : i + 1; const di = flat.findIndex((x) => x.id === drag); const de = blockEnd(flat, di); if (at > di && at < de) return setDrop(null);
    const rest = flat.filter((_, k) => k < di || k >= de); const insR = at > di ? at - (de - di) : at; const prev = rest[insR - 1], next = rest[insR];
    const want = Math.round((e.clientX - (listRef.current?.getBoundingClientRect().left || 0) - 70) / 22); const max = prev ? prev.depth + 1 : 0, min = next ? Math.max(0, next.depth - 1) : 0; setDrop({ at, depth: Math.max(min, Math.min(max, want)) }); };
  const toggle = (id: string) => setSel((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });
  const rename = async (n: N, t: string) => { setEdit(null); if (!t.trim() || t === (n.draft_title || n.title)) return; await api(`/api/admin/nodes/${n.id}`, "PATCH", { title: t.trim() }).catch((e) => toast(e.message, true)); onChanged(); };
  const add = async (parent: string | null, t = title) => { if (!t.trim()) return; try { const r = await api<{ id: string }>(`/api/admin/books/${bookId}/nodes`, "POST", { parent_id: parent, title: t.trim(), kind: "chapter" }); setTitle(""); if (parent) setClosed((c) => { const x = new Set(c); x.delete(parent); return x; }); onChanged(); return r.id; } catch (e: any) { toast(e.message, true); } };
  const ids = [...sel]; const ib = "flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-900";
  const MenuItem = ({ label, on, danger }: { label: string; on: () => void; danger?: boolean }) => <button onClick={() => { setMenu(null); on(); }} className={cn("block w-full rounded px-2.5 py-1.5 text-left text-[13px] hover:bg-zinc-100", danger && "text-red-600")}>{label}</button>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-[16px] font-semibold">Contents</h2><p className="text-[12.5px] text-zinc-500">Drag ⋮⋮ to move a chapter, and drag left or right to change its level. Tick several to work on them together.</p></div>
        <Link href={`/admin/books/import?into=${bookId}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-[12.5px] font-medium hover:bg-zinc-50"><FileUp className="size-4" />Replace from an EPUB or Word file</Link>
        <Btn size="sm" onClick={() => setWord(true)}><FileUp />Add chapters from Word (quick)</Btn>
      </div>
      {word && <WordImport bookId={bookId} onClose={() => setWord(false)} onDone={() => { setWord(false); onChanged(); }} />}
      {pending > 0 && <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900"><span className="size-2 rounded-full bg-amber-500" /><span className="flex-1">{pending} {pending === 1 ? "chapter has" : "chapters have"} changes that are not on the website yet.</span><Btn size="sm" kind="primary" busy={busy === "pub"} onClick={() => run("pub", { op: "publish" }, "{n} chapters published.")}>Publish all changes</Btn></div>}
      <div className="sticky top-[97px] z-10 -mx-1 mb-2 flex flex-wrap items-center gap-2 bg-white/95 px-1 py-2 backdrop-blur">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a chapter" className="!h-8 max-w-[220px]" />
        <Btn size="sm" onClick={() => setClosed(new Set())}>Open all</Btn><Btn size="sm" onClick={() => setClosed(new Set(nodes.filter((n) => hasKids(n.id)).map((n) => n.id)))}>Close all</Btn>
        <Btn size="sm" onClick={() => setSel(sel.size === order.length ? new Set() : new Set(order.map((n) => n.id)))}>{sel.size === order.length && order.length ? "Untick all" : "Tick all"}</Btn>
        {busy && <span className="text-[12px] text-zinc-500">{busy === "pub" ? "Publishing…" : busy}</span>}
      </div>
      {ids.length > 0 && <div className="sticky top-[145px] z-10 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-[12.5px] text-white shadow-lg">
        <span className="mr-2 font-medium">{ids.length} ticked</span>
        {([["Move in", () => indent(ids, 1)], ["Move out", () => indent(ids, -1)], ["Publish", () => run("pub", { op: "publish", ids }, "{n} published.")], ["Hide", () => run("Hiding…", { op: "hide", ids })], ["Show", () => run("Showing…", { op: "show", ids })], ["Undo their changes", () => confirm("Throw away the unpublished changes of the ticked chapters?") && run("…", { op: "discard", ids })]] as [string, () => void][]).map(([l, fn]) => <button key={l} onClick={fn} className="rounded px-2 py-1 hover:bg-white/15">{l}</button>)}
        <button onClick={() => confirm(`Delete ${ids.length} chapters and everything inside them? This cannot be undone.`) && run("Deleting…", { op: "delete", ids }, "{n} deleted.")} className="rounded px-2 py-1 text-red-300 hover:bg-white/15">Delete</button>
        <button onClick={() => setSel(new Set())} className="ml-auto rounded px-2 py-1 hover:bg-white/15">Clear</button>
      </div>}
      <div ref={listRef} className="rounded-xl border border-zinc-200 py-1" onDragEnd={() => { setDrag(null); setDrop(null); }}>
        {visible.length ? visible.map((n) => { const i = flat.findIndex((x) => x.id === n.id); const d = depth[n.id]; const kidsHere = hasKids(n.id); const t = n.draft_title || n.title;
          const line = (at: number) => drop && drag && drop.at === at ? <div className="pointer-events-none relative h-0"><div className="absolute -top-px right-2 h-0.5 rounded bg-blue-500" style={{ left: 70 + drop.depth * 22 }}><span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-blue-500" /></div></div> : null;
          return (<div key={n.id}>{line(i)}
            <div draggable={!f} onDragStart={(e) => { setDrag(n.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", n.id); }} onDragOver={(e) => onOver(e, n)} onDrop={(e) => { e.preventDefault(); if (drag && drop) moveBlock(drag, drop.at, drop.depth); setDrag(null); setDrop(null); }}
              className={cn("group relative flex h-10 items-center gap-1 pr-2", sel.has(n.id) ? "bg-blue-50" : "hover:bg-zinc-50", drag === n.id && "opacity-40")}>
              <span className="flex w-[50px] shrink-0 items-center justify-end gap-0.5">
                <input type="checkbox" checked={sel.has(n.id)} onChange={() => toggle(n.id)} className={cn("size-3.5 accent-zinc-900", !sel.size && "opacity-0 group-hover:opacity-100")} aria-label="Tick" />
                {!f && <span title="Drag to move" className="cursor-grab px-1 text-[14px] leading-none text-zinc-300 hover:text-zinc-600 active:cursor-grabbing">⋮⋮</span>}
              </span>
              <span style={{ width: d * 22 }} className="shrink-0" />
              <button onClick={() => setClosed((c) => { const x = new Set(c); if (x.has(n.id)) x.delete(n.id); else x.add(n.id); return x; })} className={cn("flex size-5 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200", !kidsHere && "invisible")}><ChevronRight className={cn("size-3.5 transition", !closed.has(n.id) && "rotate-90")} /></button>
              <span className="w-9 shrink-0 text-[11.5px] tabular-nums text-zinc-400">{num[n.id]}</span>
              {edit === n.id ? <input autoFocus defaultValue={t} onBlur={(e) => rename(n, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEdit(null); }} className="h-8 min-w-0 flex-1 rounded border border-zinc-300 px-2 text-[14px] outline-none" />
                : <button onClick={() => onOpen(n.id)} onDoubleClick={() => setEdit(n.id)} className={cn("min-w-0 flex-1 truncate text-left text-[14px]", d === 0 ? "font-medium text-zinc-900" : "text-zinc-700")} title="Click to write · double-click to rename">{t}</button>}
              <span className="flex shrink-0 items-center gap-1.5">
                {n.has_draft && <span title="Changes not published yet" className="flex items-center gap-1 text-[11px] text-amber-700"><span className="size-1.5 rounded-full bg-amber-500" />Changed</span>}
                {n.status !== "published" && <Badge>Not on website</Badge>}{!n.has_text && !kidsHere && <span className="text-[11px] text-zinc-400">empty</span>}
                {(n.heads || 0) > 0 && <span title="Headings inside this page, shown in the contents" className="hidden text-[11px] text-zinc-400 sm:inline">{n.heads} headings</span>}
              </span>
              <span className="flex items-center opacity-0 group-hover:opacity-100"><button className={ib} title="Rename" onClick={() => setEdit(n.id)}><Pencil className="size-3.5" /></button><button className={ib} title="More" onClick={() => setMenu(menu === n.id ? null : n.id)}><MoreHorizontal className="size-4" /></button></span>
              {menu === n.id && <div className="absolute right-2 top-9 z-30 w-64 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg" onMouseLeave={() => setMenu(null)}>
                <MenuItem label="Write" on={() => onOpen(n.id)} /><MenuItem label="Rename" on={() => setEdit(n.id)} />
                <MenuItem label="Add a sub-chapter inside" on={async () => { const t = prompt("Title of the sub-chapter"); if (t) await add(n.id, t); }} />
                <MenuItem label="Move in (under the one above)" on={() => indent([n.id], 1)} /><MenuItem label="Move out one level" on={() => indent([n.id], -1)} />
                <MenuItem label="Keep inside the page above, as a heading" on={() => confirm(`“${t}” stops being its own page: its title becomes a heading inside the page above it, followed by its text. It still shows in the contents. Continue?`) && run("Joining…", { op: "merge", id: n.id }, "Joined. Publish the page above to show it.")} />
                {n.has_draft && <MenuItem label="Publish this chapter" on={() => run("pub", { op: "publish", ids: [n.id] }, "Published.")} />}
                <MenuItem label={n.status === "published" ? "Hide from the website" : "Show on the website"} on={() => run("…", { op: n.status === "published" ? "hide" : "show", ids: [n.id] })} />
                <MenuItem danger label="Delete" on={() => confirm(`Delete “${t}” and everything inside it?`) && run("Deleting…", { op: "delete", ids: [n.id] })} />
              </div>}
            </div>
            {i === flat.length - 1 && line(flat.length)}
          </div>); }) : <p className="p-6 text-center text-[13px] text-zinc-500">{f ? "No chapter has that in its title." : "No chapters yet. Add the first one below, or replace the contents from an EPUB or Word file."}</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-zinc-300 p-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add(null)} placeholder="Title of a new chapter (added at the end)" className="min-w-[220px] flex-1" />
        <Btn kind="primary" disabled={!title.trim()} onClick={() => add(null)}><Plus />Add chapter</Btn>
      </div>
      {order.length > 0 && <div className="mt-8 flex justify-end"><button className="text-[12.5px] text-red-600 hover:underline" onClick={() => { const w = prompt(`This deletes all ${order.length} chapters of this book with their text (the book itself stays). Type DELETE to confirm.`); if (w === "DELETE") run("Deleting…", { op: "delete-all" }, "All chapters deleted."); }}>Delete all chapters…</button></div>}
    </div>
  );
}

/** A Word file → chapters (Heading 1) and sub-chapters (Heading 2), with their text. */
function WordImport({ bookId, onClose, onDone }: { bookId: string; onClose: () => void; onDone: () => void }) {
  const [parts, setParts] = useState<{ level: number; title: string; html: string }[] | null>(null); const [prog, setProg] = useState(""); const [busy, setBusy] = useState(false); const [file, setFile] = useState<File | null>(null);
  const read = async (f: File) => {
    setFile(f);
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
    if (file) { setProg("Keeping the Word file as a backup…"); try { await keepSource(bookId, file, file.name); } catch { toast("The chapters were added, but the Word file could not be kept as a backup.", true); } }
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

/* ------------------------------------------------------------------ Writing one chapter: a fixed toolbar, drafts saved quietly, published when you say */
const STYLES: [string, string, any][] = [["text", "Text", { type: "paragraph", props: { textAlignment: "left" } }], ["h2", "Heading — shown in the contents", { type: "heading", props: { level: 2 } }], ["h3", "Small heading", { type: "heading", props: { level: 3 } }], ["verse", "Verse (centred lines)", { type: "paragraph", props: { textAlignment: "center" } }], ["quote", "Quotation", { type: "quote", props: {} }]];
function Toolbar({ ed }: { ed: any }) {
  const [, tick] = useState(0); useEffect(() => { if (!ed) return; const a = ed.onSelectionChange?.(() => tick((x) => x + 1)); const b = ed.onChange?.(() => tick((x) => x + 1)); return () => { a?.(); b?.(); }; }, [ed]);
  if (!ed) return <div className="h-11" />;
  const blocks = (): any[] => { try { return ed.getSelection()?.blocks || [ed.getTextCursorPosition().block]; } catch { return []; } };
  const b0 = blocks()[0]; const st = (() => { try { return ed.getActiveStyles(); } catch { return {}; } })();
  const cur = !b0 ? "" : b0.type === "heading" ? (b0.props.level <= 2 ? "h2" : "h3") : b0.type === "quote" ? "quote" : b0.type === "paragraph" && b0.props.textAlignment === "center" ? "verse" : b0.type === "paragraph" ? "text" : "";
  const each = (f: (b: any) => void) => { for (const b of blocks()) { try { f(b); } catch {} } ed.focus(); };
  const btn = (on: boolean) => cn("flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[13px] text-zinc-700 hover:bg-zinc-100", on && "bg-zinc-900 text-white hover:bg-zinc-800");
  const keep = (e: React.MouseEvent) => e.preventDefault();
  return (
    <div className="flex flex-wrap items-center gap-0.5 py-1.5" onMouseDown={keep}>
      <button className={btn(false)} title="Undo (Ctrl Z)" onClick={() => { try { ed.undo(); } catch {} }}><Undo2 className="size-4" /></button><button className={btn(false)} title="Redo (Ctrl Y)" onClick={() => { try { ed.redo(); } catch {} }}><Redo2 className="size-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <select value={cur} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { const s = STYLES.find((x) => x[0] === e.target.value); if (s) each((b) => ed.updateBlock(b, s[2])); }} className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-[13px]">{!cur && <option value="">—</option>}{STYLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button className={btn(!!st.bold)} title="Bold (Ctrl B)" onClick={() => ed.toggleStyles({ bold: true })}><Bold className="size-4" /></button>
      <button className={btn(!!st.italic)} title="Italic (Ctrl I)" onClick={() => ed.toggleStyles({ italic: true })}><Italic className="size-4" /></button>
      <button className={btn(!!st.underline)} title="Underline (Ctrl U)" onClick={() => ed.toggleStyles({ underline: true })}><Underline className="size-4" /></button>
      <button className={btn(false)} title="Plain text: remove bold, italic and underline" onClick={() => { try { ed.removeStyles({ bold: true, italic: true, underline: true, strike: true }); } catch {} ed.focus(); }}><RemoveFormatting className="size-4" /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as [string, any][]).map(([a, I]) => <button key={a} className={btn((b0?.props?.textAlignment || "left") === a)} title={`Align ${a}`} onClick={() => each((b) => ed.updateBlock(b, { props: { textAlignment: a } }))}><I className="size-4" /></button>)}
      <span className="ml-2 hidden text-[11.5px] text-zinc-400 xl:inline">Shift + Enter: new line in the same verse</span>
    </div>);
}

function Writer({ bookTitle, bookId, id, order, num, onGo, onClose }: { bookTitle: string; bookId: string; id: string; order: N[]; num: Record<string, string>; onGo: (id: string) => void; onClose: () => void }) {
  const [n, setN] = useState<any>(null); const ed = useRef<any>(null); const [edState, setEd] = useState<any>(null); const [rev, setRev] = useState(0); const [title, setTitle] = useState(""); const [state, setState] = useState<"saved" | "unsaved" | "saving" | "error">("saved"); const [draft, setDraft] = useState(false); const [heads, setHeads] = useState<{ id: string; text: string; level: number }[]>([]); const t = useRef<any>(null); const dirty = useRef(false); const titleRef = useRef("");
  const load = useCallback(() => { setN(null); setEd(null); ed.current = null; api(`/api/admin/nodes/${id}`).then((r) => { setN(r); setTitle(r.title); titleRef.current = r.title; setDraft(!!r.has_draft); setRev((x) => x + 1); }).catch((e) => toast(e.message, true)); }, [id]);
  useEffect(() => { load(); }, [load]);
  const readHeads = () => { try { setHeads((ed.current?.document || []).filter((b: any) => b.type === "heading").map((b: any) => ({ id: b.id, level: b.props.level, text: (b.content || []).map((c: any) => c.text || "").join("") }))); } catch {} };
  const save = useCallback(async () => { clearTimeout(t.current); if (!dirty.current || !ed.current) return; dirty.current = false; setState("saving");
    try { await api(`/api/admin/nodes/${id}`, "PATCH", { title: titleRef.current, blocks: ed.current.document }); setState("saved"); setDraft(true); readHeads(); } catch (e: any) { dirty.current = true; setState("error"); toast(e.message, true); } }, [id]);
  useEffect(() => { pendingSave = save; return () => { if (pendingSave === save) pendingSave = null; }; }, [save]);
  useEffect(() => { const w = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); save(); } }; window.addEventListener("beforeunload", w); return () => window.removeEventListener("beforeunload", w); }, [save]);
  const later = () => { dirty.current = true; setState("unsaved"); clearTimeout(t.current); t.current = setTimeout(save, 1500); };
  const publish = async () => { await save(); try { await api(`/api/admin/nodes/${id}`, "PATCH", { publish: true }); setDraft(false); setN((x: any) => ({ ...x, status: "published" })); toast("Published: this chapter is on the website now."); } catch (e: any) { toast(e.message, true); } };
  const discard = async () => { if (!confirm("Throw away the changes made since this chapter was last published?")) return; clearTimeout(t.current); dirty.current = false; await api(`/api/admin/nodes/${id}`, "PATCH", { discard: true }); load(); };
  const split = async (h: { id: string; text: string }) => { if (!confirm(`Make “${h.text}” its own page under this chapter? Its text (up to the next heading of the same size) goes with it.`)) return; dirty.current = true; await save(); try { await api(`/api/admin/books/${bookId}/tree`, "POST", { op: "split", id, block: h.id }); toast("It is now its own page, under this chapter (not published yet)."); load(); } catch (e: any) { toast(e.message, true); } };
  const k = order.findIndex((x) => x.id === id); const prev = order[k - 1], next = order[k + 1];
  const go = async (to?: N) => { if (!to) return; await save(); onGo(to.id); };
  const live = n?.status === "published" && !draft;
  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 px-3">
        <button onClick={async () => { await save(); onClose(); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-zinc-600 hover:bg-zinc-100"><X className="size-4" />Close</button>
        <p className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-500">{bookTitle} · {num[id]} {title}</p>
        <span className="hidden text-[12px] text-zinc-500 sm:inline">{state === "saving" ? "Saving draft…" : state === "unsaved" ? "Typing…" : state === "error" ? <span className="text-red-600">Not saved — retrying when you type</span> : draft ? <span className="flex items-center gap-1"><Check className="size-3.5" />Draft saved · not on the website yet</span> : n?.status === "published" ? "Same as on the website" : "Not on the website yet"}</span>
        {draft && <Btn size="sm" onClick={discard}>Undo changes</Btn>}
        <Btn size="sm" kind={live ? "ghost" : "primary"} disabled={live && state === "saved"} onClick={publish}>{live && state === "saved" ? "Published" : "Publish"}</Btn>
        <Btn size="sm" disabled={!prev} onClick={() => go(prev)} title="Previous chapter"><ChevronLeft /></Btn><Btn size="sm" disabled={!next} onClick={() => go(next)} title="Next chapter"><ChevronRight /></Btn>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[250px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50/60 p-2 lg:block">{order.map((x) => <button key={x.id} onClick={() => go(x)} className={cn("flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]", x.id === id ? "bg-white font-medium shadow-xs" : "text-zinc-600 hover:bg-white")} style={{ paddingLeft: 8 + (num[x.id].split(".").length - 1) * 12 }}><span className="shrink-0 tabular-nums text-zinc-400">{num[x.id]}</span><span className="truncate">{x.draft_title || x.title}</span>{x.has_draft && <span className="ml-auto mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />}</button>)}</aside>
        <div className="site-canvas min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/95 px-4 backdrop-blur sm:px-8"><Toolbar ed={edState} /></div>
          {n ? <div className="mx-auto max-w-[820px] px-6 pb-40 pt-8 sm:px-14">
            <input value={title} onChange={(e) => { setTitle(e.target.value); titleRef.current = e.target.value; later(); }} className="w-full bg-transparent text-[28px] font-semibold tracking-tight outline-none" placeholder="Chapter title" />
            <details className="mt-2 rounded-lg border border-zinc-200 bg-white p-3"><summary className="cursor-pointer text-[12.5px] font-medium text-zinc-600">AI assistant for this chapter</summary><div className="mt-2 max-w-sm"><AiAssist blocks={() => ed.current?.document || []} context={title} onReplace={async (bl) => { dirty.current = true; await api(`/api/admin/nodes/${id}`, "PATCH", { title: titleRef.current, blocks: bl }); dirty.current = false; load(); }} /></div></details>
            <div className="-mx-[54px] mt-4"><NotionEditor key={`${id}-${rev}`} initial={n.blocks || []} pageId="" onReady={(e) => { ed.current = e; setEd(e); setTimeout(readHeads, 0); }} onDirty={later} /></div>
          </div> : <p className="p-8 text-zinc-500">Opening…</p>}
        </div>
        <aside className="hidden w-[250px] shrink-0 overflow-y-auto border-l border-zinc-200 p-3 xl:block">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-zinc-500">In this page</p>
          <p className="mt-1 text-[11.5px] leading-snug text-zinc-400">Headings (the “Heading” style) show in the book’s contents and stay in this page.</p>
          <div className="mt-3 space-y-1">{heads.length ? heads.map((h) => <div key={h.id} className="group rounded-md px-2 py-1.5 hover:bg-zinc-50" style={{ paddingLeft: h.level > 2 ? 18 : 8 }}><button onClick={() => { const el = document.querySelector(`[data-id="${h.id}"]`); el?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className={cn("block w-full truncate text-left text-[12.5px]", h.level > 2 ? "text-zinc-500" : "text-zinc-800")}>{h.text || "(empty heading)"}</button><button onClick={() => split(h)} className="mt-0.5 hidden text-[11.5px] text-blue-600 hover:underline group-hover:block">Make it its own page</button></div>) : <p className="text-[12px] text-zinc-400">No headings in this page.</p>}</div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Translations */
/** Link this book with the same book in other languages, so readers can switch between them. */
function Translations({ book, set }: { book: any; set: (k: string, v: any) => void }) {
  const [all, setAll] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/admin/books").then((r) => setAll(Array.isArray(r) ? r : (r as any).books || [])).catch(() => {}); }, []);
  const same = all.filter((x) => x.id !== book.id && book.work && x.work === book.work);
  const cur = "translation_of" in book ? book.translation_of : same[0]?.id || "";
  return (
    <Field label="Same book in other languages" hint="Pick the original (or any other language) of this book. Readers can then switch language, or read both side by side.">
      <Select value={cur || ""} onChange={(e) => set("translation_of", e.target.value || null)}>
        <option value="">Not linked — a book on its own</option>
        {all.filter((x) => x.id !== book.id).map((x) => <option key={x.id} value={x.id}>{x.title} · {langName(x.language)}</option>)}
      </Select>
      {same.length > 0 && <p className="mt-1.5 text-[12px] text-zinc-500">Linked now with: {same.map((x) => `${x.title} (${langName(x.language)})`).join(", ")}</p>}
    </Field>
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
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Publisher"><Input value={b.publisher || ""} onChange={(e) => set("publisher", e.target.value)} /></Field><Field label="Year"><Input value={b.year || ""} onChange={(e) => set("year", e.target.value)} /></Field><Field label="Language"><Select value={b.language} onChange={(e) => set("language", e.target.value)}>{BOOK_LANGS.map(([k, l, n]) => <option key={k} value={k}>{l}{n !== l ? ` · ${n}` : ""}</option>)}</Select></Field></div>
          <Translations book={b} set={set} />
          <Field label="About the book" hint="Shown on the book’s first page"><Textarea rows={4} value={b.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="How the book is shown"><div className="grid gap-2 sm:grid-cols-2">{LAYOUTS.map(([k, l, d]) => <button key={k} onClick={() => set("layout", k)} className={cn("rounded-lg border p-3 text-left", b.layout === k ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:bg-zinc-50")}><p className="text-[13px] font-medium">{l}</p><p className="text-[12px] text-zinc-500">{d}</p></button>)}</div></Field>
          <details className="text-[12.5px]"><summary className="cursor-pointer text-zinc-500">Web address</summary><Input className="mt-2" value={b.slug} onChange={(e) => set("slug", e.target.value)} /><p className="mt-1 text-zinc-400">taptajivanam.com/books/{b.slug}</p></details>
          <Originals bookId={book.id} />
          <ToIssue bookId={book.id} />
          <div className="flex justify-between border-t border-zinc-200 pt-4"><Btn kind="danger" onClick={async () => { if (!confirm("Delete this whole book and all its chapters?")) return; await api(`/api/admin/books/${book.id}`, "DELETE"); window.location.href = "/admin/books"; }}><Trash2 />Delete book</Btn><Btn kind="primary" busy={busy} onClick={save}>Save details</Btn></div>
        </div>
      </div>
      {crop && <CoverCropper onClose={() => setCrop(false)} onDone={(url) => { set("cover_url", url); setCrop(false); api(`/api/admin/books/${book.id}`, "PATCH", { ...b, cover_url: url }).then(onSaved); }} />}
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(i) => { if (i[0]) { set("cover_url", i[0].url); api(`/api/admin/books/${book.id}`, "PATCH", { ...b, cover_url: i[0].url }).then(onSaved); } setPick(false); }} />}
    </div>
  );
}

/** The original files this book was made from (Word, EPUB…), kept as a backup: download to edit, or add another. Studio only. */
function Originals({ bookId }: { bookId: string }) {
  const [rows, setRows] = useState<{ id: string; filename: string; size: number; created_at: string }[] | null>(null); const [busy, setBusy] = useState(""); const inp = useRef<HTMLInputElement>(null);
  const load = useCallback(() => api<any[]>(`/api/admin/books/${bookId}/source`).then(setRows).catch(() => setRows([])), [bookId]);
  useEffect(() => { load(); }, [load]);
  const add = async (f?: File) => { if (!f) return; setBusy("0%"); try { await keepSource(bookId, f, f.name, (d) => setBusy(`${Math.round(d * 100)}%`)); toast("Kept as a backup."); load(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); if (inp.current) inp.current.value = ""; } };
  const mb = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-2"><p className="flex-1 text-[13px] font-medium">Original files</p>
        <input ref={inp} type="file" accept=".docx,.doc,.epub,.pdf,.odt,.rtf,.txt,.html,.zip" className="hidden" onChange={(e) => add(e.target.files?.[0])} />
        <Btn size="sm" busy={!!busy} onClick={() => inp.current?.click()}><Upload />{busy ? `Keeping… ${busy}` : "Add a file"}</Btn></div>
      <p className="mt-1 text-[12.5px] text-zinc-500">The Word or EPUB file this book was made from, kept as a backup. Only the Studio can see it; download it to edit and import again.</p>
      {rows && rows.length > 0 && <ul className="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-100">{rows.map((r) => (
        <li key={r.id} className="flex items-center gap-2 px-3 py-2 text-[13px]"><FileText className="size-4 shrink-0 text-zinc-400" /><span className="min-w-0 flex-1 truncate">{r.filename}</span><span className="shrink-0 text-[12px] text-zinc-500">{mb(r.size)} · {new Date(r.created_at).toLocaleDateString()}</span>
          <a href={`/api/admin/books/${bookId}/source?sid=${r.id}`} className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-200 px-2 text-[12px] hover:bg-zinc-50"><Download className="size-3.5" />Download</a>
          <button onClick={async () => { if (!confirm(`Remove ${r.filename} from the backups?`)) return; try { await api(`/api/admin/books/${bookId}/source?sid=${r.id}`, "DELETE"); load(); } catch (e: any) { toast(e.message, true); } }} aria-label="Remove" className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-700"><Trash2 className="size-3.5" /></button></li>))}</ul>}
      {rows && !rows.length && <p className="mt-2 text-[12.5px] text-zinc-400">No original file yet. Books imported from now on keep theirs automatically.</p>}
    </div>);
}

/** A book that is really one issue of a magazine (Gopal Jiu, Kṛṣṇa Kathāmṛta…) moves to Magazines: each chapter becomes an article of that issue. */
function ToIssue({ bookId }: { bookId: string }) {
  const [open, setOpen] = useState(false); const [mags, setMags] = useState<any[]>([]); const [f, setF] = useState({ magazine_id: "", number: "", date: "" }); const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) api<any[]>("/api/admin/magazines").then((r) => { setMags(r); setF((x) => ({ ...x, magazine_id: x.magazine_id || r[0]?.id || "" })); }).catch(() => {}); }, [open]);
  if (!open) return <button onClick={() => setOpen(true)} className="text-[12.5px] text-zinc-500 underline hover:text-zinc-900">This is a magazine issue — move it to Magazines…</button>;
  return (<div className="space-y-3 rounded-lg border border-zinc-200 p-4"><p className="text-[13px] font-medium">Move to Magazines as one issue</p><p className="text-[12.5px] text-zinc-500">Each main chapter becomes one article of the issue (sub-chapters become headings inside it). The book is then removed from Books.</p>
    {mags.length ? <div className="grid gap-2 sm:grid-cols-3"><Select value={f.magazine_id} onChange={(e) => setF({ ...f, magazine_id: e.target.value })}>{mags.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select><Input value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} placeholder="Issue 12" /><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div> : <p className="text-[12.5px] text-amber-800">Make the magazine first in Studio → Magazines.</p>}
    <div className="flex gap-2"><Btn onClick={() => setOpen(false)}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!f.magazine_id} onClick={async () => { if (!confirm("Move this book to Magazines as an issue? The book itself is removed.")) return; setBusy(true); try { const r = await api<any>(`/api/admin/books/${bookId}/tree`, "POST", { op: "to-issue", ...f }); toast(`Moved: ${r.n} articles.`); window.location.href = "/admin/magazines"; } catch (e: any) { toast(e.message, true); setBusy(false); } }}>Move to Magazines</Btn></div></div>);
}

/** Choose a picture (file, drag and drop, paste, or link), then move and zoom it inside the cover frame — in any shape. */
export function CoverCropper({ onClose, onDone, ratio: start = 3 / 4 }: { onClose: () => void; onDone: (url: string) => void; ratio?: number }) {
  const [ratio, setRatio] = useState(start); const [shape, setShape] = useState("3:4");
  const [src, setSrc] = useState<string | null>(null); const [zoom, setZoom] = useState(1); const [pos, setPos] = useState({ x: 0, y: 0 }); const [busy, setBusy] = useState(false); const [link, setLink] = useState(""); const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const img = useRef<HTMLImageElement>(null); const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const W = ratio >= 1 ? 340 : 300, H = W / ratio;
  const SHAPES: [string, number | null][] = [["3:4", 3 / 4], ["2:3", 2 / 3], ["A5 / A4", 1 / Math.SQRT2], ["5:8", 5 / 8], ["Square", 1], ["Wide 4:3", 4 / 3], ["As the picture", null]];
  const pickShape = (k: string, r: number | null) => { setShape(k); setRatio(r ?? (nat ? nat.w / nat.h : 3 / 4)); setPos({ x: 0, y: 0 }); setZoom(1); };
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
            onPointerUp={() => (drag.current = null)} onWheel={(e) => setZoom((z) => Math.min(4, Math.max(0.3, z - e.deltaY / 800)))}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={img} src={src} crossOrigin="anonymous" alt="" draggable={false} onLoad={(e) => { setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }); setZoom(1); }} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none" style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, width: nat ? nat.w * base() * zoom : "auto", visibility: nat ? "visible" : "hidden" }} />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1">{SHAPES.map(([k, r]) => <button key={k} onClick={() => pickShape(k, r)} className={cn("rounded-md border px-2 py-1 text-[12px]", shape === k ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>{k}</button>)}</div>
          <div className="mt-3 flex w-full max-w-[300px] items-center gap-3 text-[12px] text-zinc-500">Zoom<input type="range" min={0.3} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-zinc-900" /></div>
          <button onClick={() => setSrc(null)} className="mt-2 text-[12.5px] text-zinc-500 underline">Choose another picture</button>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!src} onClick={done}><Check />Use this cover</Btn></div>
    </Modal>
  );
}
