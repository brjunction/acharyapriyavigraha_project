"use client";
/* Tick many items in any Studio list, then publish, unpublish or delete them together.
   useTicks() keeps what is ticked; <TickBar> shows the actions while anything is ticked; <DraftsButton> publishes every draft at once. */
import { useState } from "react";
import { Eye, EyeOff, Trash2, X } from "lucide-react";
import { Btn, api, toast } from "../ui";
export { Tick } from "./book-bulk";

export function useTicks() {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const tick = (ids: string[], v: boolean) => setSel((x) => { const y = new Set(x); ids.forEach((i) => (v ? y.add(i) : y.delete(i))); return y; });
  return { sel, ids: [...sel], has: (id: string) => sel.has(id), tick, clear: () => setSel(new Set()) };
}

const run = async (body: object) => api<{ n: number }>("/api/admin/bulk", "POST", body);

export function TickBar({ kind, word, ids, total, onAll, onClear, onDone, note }: { kind: string; word: [string, string]; ids: string[]; total: number; onAll: () => void; onClear: () => void; onDone: () => void; note?: string }) {
  const [busy, setBusy] = useState("");
  if (!ids.length) return null;
  const w = (n: number) => (n === 1 ? word[0] : word[1]);
  const go = async (op: string, msg: (n: number) => string) => {
    setBusy(op);
    try { const r = await run({ kind, op, ids }); toast(msg(r.n)); onClear(); onDone(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); }
  };
  return (
    <div className="sticky top-2 z-30 mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2 pl-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,.25)] backdrop-blur">
      <p className="mr-1 text-[13px] font-medium tabular-nums">{ids.length} {w(ids.length)} ticked</p>
      {ids.length < total && <button onClick={onAll} className="text-[12.5px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">Tick all {total}</button>}
      <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />
      <Btn size="sm" kind="primary" busy={busy === "publish"} onClick={() => go("publish", (n) => `${n} ${w(n)} published.`)}><Eye />Publish</Btn>
      <Btn size="sm" busy={busy === "hide"} onClick={() => go("hide", (n) => `${n} ${w(n)} made drafts.`)}><EyeOff />Unpublish</Btn>
      <Btn size="sm" busy={busy === "delete"} className="text-red-700 hover:bg-red-50" onClick={() => { if (!confirm(`Delete ${ids.length} ${w(ids.length)}? This cannot be undone.`)) return; go("delete", (n) => `${n} ${w(n)} deleted.`); }}><Trash2 />Delete</Btn>
      {note && <span className="text-[12px] text-zinc-500">{note}</span>}
      <button onClick={onClear} aria-label="Untick all" title="Untick all" className="ml-auto rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"><X className="size-4" /></button>
    </div>);
}

/** “Publish all N drafts” — shown only while there are drafts. */
export function DraftsButton({ kind, n, word, extra, onDone }: { kind: string; n: number; word: string; extra?: object; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!n) return null;
  return <Btn size="sm" busy={busy} onClick={async () => { if (!confirm(`Publish all ${n} draft ${word} now? They appear on the website at once.`)) return; setBusy(true); try { const r = await run({ kind, op: "publish", drafts: true, ...extra }); toast(`${r.n} published.`); onDone(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } }}><Eye />Publish all {n} drafts</Btn>;
}
