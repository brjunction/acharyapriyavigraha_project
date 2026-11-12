"use client";
/* Tick books and act on all of them at once: publish, unpublish, put on a shelf or in a category, change shared details, delete.
   Used by Studio → Books. */
import { useState } from "react";
import { Trash2, X, Pencil, Eye, EyeOff, Check } from "lucide-react";
import { LAYOUTS } from "@/lib/content/book-layouts";
import { Btn, Field, Input, Select, Modal, api, toast, cn } from "../ui";

export type BulkOpt = { shelves?: string[] };

/** A small square tick box, the same everywhere. */
export function Tick({ on, mixed, onChange, label, className = "" }: { on: boolean; mixed?: boolean; onChange: (v: boolean) => void; label: string; className?: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={mixed ? "mixed" : on} aria-label={label} title={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(!on); }}
      className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition", on || mixed ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white hover:border-zinc-500", className)}>
      {on ? <Check className="size-3" strokeWidth={3} /> : mixed ? <span className="h-[2px] w-2 rounded bg-white" /> : null}
    </button>);
}

/** The bar that appears while books are ticked. */
export function BulkBar({ ids, total, onAll, onClear, onDone, opt, library }: { ids: string[]; total: number; onAll: () => void; onClear: () => void; onDone: () => void; opt: BulkOpt; library: "main" | "gaudiya" }) {
  const [busy, setBusy] = useState(""); const [edit, setEdit] = useState(false);
  if (!ids.length) return null;
  const n = ids.length; const word = n === 1 ? "book" : "books";
  const run = async (key: string, body: object, done: (k: number) => string) => {
    setBusy(key);
    try { const r = await api<{ n: number }>("/api/admin/books/bulk", "POST", { ids, ...body }); toast(done(r.n)); onClear(); onDone(); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(""); }
  };
  const set = (fields: Record<string, string>) => run("set", { op: "set", fields }, (k) => `${k} ${k === 1 ? "book" : "books"} changed.`);
  return (
    <>
      <div className="sticky top-2 z-30 mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2 pl-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,.25)] backdrop-blur">
        <p className="mr-1 text-[13px] font-medium tabular-nums">{n} {word} ticked</p>
        {n < total && <button onClick={onAll} className="text-[12.5px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">Tick all {total}</button>}
        <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />
        <Btn size="sm" busy={busy === "publish"} onClick={() => run("publish", { op: "publish" }, (k) => `${k} published.`)}><Eye />Publish</Btn>
        <Btn size="sm" busy={busy === "hide"} onClick={() => run("hide", { op: "hide" }, (k) => `${k} made drafts.`)}><EyeOff />Unpublish</Btn>
          <Select value="" onChange={(e) => { const v = e.target.value; if (!v) return; set({ category: v === "__new" ? (prompt("Name of the new shelf")?.trim() || "") : v === "__none" ? "" : v }); }} className="!h-8 !w-[170px]" aria-label="Put on a shelf">
            <option value="">Put on a shelf…</option>{(opt.shelves || []).map((s) => <option key={s} value={s}>{s}</option>)}<option value="__new">New shelf…</option><option value="__none">No shelf</option>
          </Select>
        <Btn size="sm" onClick={() => setEdit(true)}><Pencil />Change details</Btn>
        <Btn size="sm" busy={busy === "delete"} className="text-red-700 hover:bg-red-50" onClick={() => { if (!confirm(`Delete ${n} ${word} with all their chapters? This cannot be undone.`)) return; run("delete", { op: "delete" }, (k) => `${k} ${k === 1 ? "book" : "books"} deleted.`); }}><Trash2 />Delete</Btn>
        <button onClick={onClear} aria-label="Untick all" title="Untick all" className="ml-auto rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"><X className="size-4" /></button>
      </div>
      {edit && <BulkEdit n={n} opt={opt} library={library} onClose={() => setEdit(false)} onSave={async (fields) => { await set(fields); setEdit(false); }} />}
    </>);
}

type Def = { k: string; label: string; hint?: string; input: (v: string, on: (v: string) => void) => React.ReactNode };

/** Change details on every ticked book. Only the fields you touch change; the rest stay as each book has them. */
function BulkEdit({ n, opt, library, onClose, onSave }: { n: number; opt: BulkOpt; library: string; onClose: () => void; onSave: (f: Record<string, string>) => Promise<void> }) {
  const [f, setF] = useState<Record<string, string>>({}); const [saving, setSaving] = useState(false);
  const text = (ph = "") => (v: string, on: (v: string) => void) => <Input value={v} placeholder={ph} onChange={(e) => on(e.target.value)} />;
  const defs: Def[] = [
    { k: "author", label: "Author", input: text("e.g. Śrī Śrīmad Gour Govinda Swāmī Gurudeva") },
    { k: "publisher", label: "Publication", hint: "Used by the “Publication” filter on the Books page.", input: text("e.g. Gopal Jiu Publications") },
    { k: "year", label: "Year", input: text("e.g. 1996") },
    { k: "language", label: "Language", input: (v, on) => <Select value={v} onChange={(e) => on(e.target.value)}><option value="">Choose…</option>{[["en", "English"], ["hi", "Hindi"], ["or", "Odia"], ["bn", "Bengali"], ["sa", "Sanskrit"], ["ru", "Russian"], ["es", "Spanish"], ["pt", "Portuguese"], ["de", "German"], ["fr", "French"], ["it", "Italian"], ["zh", "Chinese"]].map(([c, l]) => <option key={c} value={c}>{l}</option>)}</Select> },
    { k: "layout", label: "Reading layout", input: (v, on) => <Select value={v} onChange={(e) => on(e.target.value)}><option value="">Choose…</option>{LAYOUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select> },
    { k: "category", label: "Shelf", input: (v: string, on: (v: string) => void) => <><Input list="bulk-shelves" value={v} placeholder="Type or choose a shelf" onChange={(e) => on(e.target.value)} /><datalist id="bulk-shelves">{(opt.shelves || []).map((s) => <option key={s} value={s} />)}</datalist></> },
  ];
  const touched = Object.keys(f);
  return (
    <Modal title={`Change details of ${n} ${n === 1 ? "book" : "books"}`} description="Tick a detail to change it on every ticked book. Details you leave unticked stay as each book has them." onClose={onClose}>
      <div className="divide-y divide-zinc-100">
        {defs.map((d) => { const on = d.k in f; return (
          <div key={d.k} className="grid items-start gap-3 py-2.5 sm:grid-cols-[150px_1fr]">
            <label className="flex cursor-pointer items-center gap-2 pt-2 text-[13px] font-medium"><Tick on={on} label={`Change ${d.label}`} onChange={(v) => setF((x) => { const y = { ...x }; if (v) y[d.k] = ""; else delete y[d.k]; return y; })} />{d.label}</label>
            <div className={on ? "" : "pointer-events-none opacity-40"}>
              <Field label="" hint={d.hint} className="[&>span:first-child]:hidden">{d.input(f[d.k] ?? "", (v) => setF((x) => ({ ...x, [d.k]: v })))}</Field>
            </div>
          </div>); })}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        <p className="mr-auto text-[12.5px] text-zinc-500">{touched.length ? `${touched.length} ${touched.length === 1 ? "detail" : "details"} will change` : "Nothing ticked yet"}</p>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn kind="primary" busy={saving} disabled={!touched.length} onClick={async () => { setSaving(true); try { await onSave(f); } finally { setSaving(false); } }}>Apply to {n} {n === 1 ? "book" : "books"}</Btn>
      </div>
    </Modal>);
}
