"use client";
import { useEffect, useState } from "react";
import { Newspaper, Plus, Trash2, ExternalLink, Image as ImageIcon, ArrowUp, ArrowDown, Link2, X } from "lucide-react";
import { Btn, Badge, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, api, toast } from "../ui";
import { MediaPicker } from "../media-picker";

type Issue = { title: string; url: string; date?: string };
type M = { id: string; title: string; publisher: string | null; description: string | null; cover: string | null; url: string | null; issues: Issue[]; status: string };

export function MagazinesPanel() {
  const [rows, setRows] = useState<M[] | null>(null); const [edit, setEdit] = useState<M | "new" | null>(null);
  const load = () => api<M[]>("/api/admin/magazines").then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const move = async (i: number, d: number) => { if (!rows) return; const r = [...rows]; const [x] = r.splice(i, 1); r.splice(i + d, 0, x); setRows(r); await api("/api/admin/magazines", "POST", { order: r.map((m) => m.id) }); };
  return (
    <div>
      <PageHeader icon={Newspaper} title="Magazines" description="Cards that link to magazines kept elsewhere, such as the Gopāl Jiu magazine. Nothing is copied here: each card opens the magazine's own page, and can list its issues.">
        <a href="/teachings/magazines" target="_blank"><Btn><ExternalLink />View on website</Btn></a><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a magazine</Btn>
      </PageHeader>
      {rows && !rows.length ? <Empty icon={Newspaper} title="No magazines yet" text="Add a card with the magazine's name, a cover and the link to where it is kept."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a magazine</Btn></Empty> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows?.map((m, i) => (
          <div key={m.id} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
            <button onClick={() => setEdit(m)} className="block w-full text-left">
              <div className="aspect-[16/9] bg-zinc-100">{m.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.cover} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-300"><Newspaper className="size-8" /></div>}</div>
              <div className="p-3"><p className="text-[13.5px] font-semibold">{m.title}</p><p className="truncate text-[12px] text-zinc-500">{m.publisher || m.url || "No link yet"}</p>
                <div className="mt-2 flex gap-1.5">{m.issues?.length > 0 && <Badge tone="outline">{m.issues.length} {m.issues.length === 1 ? "issue" : "issues"}</Badge>}{m.status !== "published" && <Badge>Hidden</Badge>}</div></div>
            </button>
            <div className="flex justify-end gap-1 border-t border-zinc-100 px-2 py-1.5"><Btn size="icon" kind="soft" disabled={i === 0} onClick={() => move(i, -1)} title="Move earlier"><ArrowUp /></Btn><Btn size="icon" kind="soft" disabled={i === rows.length - 1} onClick={() => move(i, 1)} title="Move later"><ArrowDown /></Btn></div>
          </div>))}</div>}
      {edit && <MagEditor m={edit} onClose={() => setEdit(null)} onSaved={load} />}
    </div>
  );
}

function MagEditor({ m, onClose, onSaved }: { m: M | "new"; onClose: () => void; onSaved: () => void }) {
  const [a, setA] = useState<any>(m === "new" ? { status: "published", issues: [] } : { ...m, issues: m.issues || [] }); const [busy, setBusy] = useState(false); const [pic, setPic] = useState(false); const [paste, setPaste] = useState("");
  const set = (k: string, v: any) => setA((p: any) => ({ ...p, [k]: v }));
  const setIssue = (i: number, k: string, v: string) => set("issues", a.issues.map((x: Issue, j: number) => (j === i ? { ...x, [k]: v } : x)));
  const addPasted = () => { const lines = paste.split(/\n+/).map((l) => l.trim()).filter(Boolean); const items = lines.map((l) => { const u = l.match(/https?:\/\/\S+/)?.[0] || ""; const t = l.replace(u, "").replace(/[|\-–—:\t]+\s*$/, "").replace(/^\s*[|\-–—:\t]+/, "").trim(); return { title: t || decodeURIComponent(u.split("/").filter(Boolean).pop() || u).replace(/[-_]+/g, " ").replace(/\.\w+$/, ""), url: u }; }).filter((x) => x.url); set("issues", [...a.issues, ...items]); setPaste(""); toast(`${items.length} links added.`); };
  const save = async () => { setBusy(true); try { if (m === "new") await api("/api/admin/magazines", "POST", a); else await api(`/api/admin/magazines/${m.id}`, "PATCH", a); toast("Saved."); onSaved(); onClose(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  return (
    <Sheet width="max-w-2xl" title={m === "new" ? "New magazine" : a.title} onClose={onClose} actions={<Btn size="sm" kind="primary" busy={busy} onClick={save}>Save</Btn>}>
      <div className="space-y-4 p-5">
        <Field label="Name"><Input autoFocus value={a.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Gopāl Jiu magazine" /></Field>
        <Field label="Published by"><Input value={a.publisher || ""} onChange={(e) => set("publisher", e.target.value)} placeholder="e.g. ISKCON Bhubaneswar" /></Field>
        <Field label="Link" hint="Where the card opens, e.g. the magazine's page on ISKCON Desire Tree."><Input value={a.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" /></Field>
        <Field label="A line about it"><Textarea rows={2} value={a.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Cover picture"><div className="flex items-center gap-3">{a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="h-16 rounded border border-zinc-200" />}<Btn size="sm" onClick={() => setPic(true)}><ImageIcon />{a.cover ? "Change" : "Choose"}</Btn>{a.cover && <Btn size="sm" onClick={() => set("cover", null)}>Remove</Btn>}</div><Input className="mt-2" value={a.cover || ""} onChange={(e) => set("cover", e.target.value)} placeholder="…or paste a picture link" /></Field>
        <Field label="Issues (optional)" hint="Each issue opens its own link. Leave empty if the card should only open the main link.">
          <div className="space-y-2">{a.issues.map((x: Issue, i: number) => <div key={i} className="flex gap-2"><Input value={x.title} onChange={(e) => setIssue(i, "title", e.target.value)} placeholder="e.g. Issue 12, Kārttika 2005" className="!w-2/5" /><Input value={x.url} onChange={(e) => setIssue(i, "url", e.target.value)} placeholder="https://…" /><Btn size="icon" onClick={() => set("issues", a.issues.filter((_: any, j: number) => j !== i))}><X /></Btn></div>)}
            <Btn size="sm" onClick={() => set("issues", [...a.issues, { title: "", url: "" }])}><Plus />Add an issue</Btn></div>
          <div className="mt-3 rounded-lg border border-dashed border-zinc-300 p-3"><p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium"><Link2 className="size-3.5" />Add many at once</p><Textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"One per line: Title | https://…  (or just the links)"} /><Btn size="sm" className="mt-2" disabled={!paste.trim()} onClick={addPasted}>Add these links</Btn></div>
        </Field>
        <Field label="Shown on the website"><Select value={a.status} onChange={(e) => set("status", e.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field>
        {m !== "new" && <div className="flex justify-end border-t border-zinc-200 pt-4"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this magazine card?")) return; await api(`/api/admin/magazines/${m.id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set("cover", i[0].url); setPic(false); }} />}
    </Sheet>
  );
}
