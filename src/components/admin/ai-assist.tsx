"use client";
/* The AI assistant inside the editors: choose a task (structure, proofread, diacritics, headings, summary, your own),
   it works on the text, and you see the result beside the original before anything is used. */
import { useEffect, useState } from "react";
import { Sparkles, X, Check, AlertTriangle } from "lucide-react";
import { Btn, Textarea, api, toast } from "./ui";

type Task = { key: string; label: string; hint: string };
const STD = new Set(["paragraph", "heading", "quote", "bulletListItem", "numberedListItem", "checkListItem"]);
const words = (s: string) => s.replace(/^#+\s.*$/gm, "").replace(/[*_>#\[\]?]/g, " ").split(/\s+/).filter(Boolean);

async function toMarkdown(blocks: any[]) { const { BlockNoteEditor } = await import("@blocknote/core"); const ed = BlockNoteEditor.create(); return ed.blocksToMarkdownLossy(blocks.filter((b) => STD.has(b.type)) as any); }
async function toBlocks(md: string) { const { BlockNoteEditor } = await import("@blocknote/core"); const ed = BlockNoteEditor.create(); return ed.tryParseMarkdownToBlocks(md); }

/** `blocks` gives the current text; `onReplace` puts the accepted result in; `onSummary` fills the summary field. */
export function AiAssist({ blocks, onReplace, onSummary, context }: { blocks: () => any[]; onReplace: (b: any[]) => void; onSummary?: (s: string) => void; context?: string }) {
  const [cfg, setCfg] = useState<{ ready: boolean; tasks: Task[]; provider: string } | null>(null);
  const [task, setTask] = useState("structure"); const [ins, setIns] = useState(""); const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ before: string; after: string; special: number } | null>(null);
  useEffect(() => { api<any>("/api/admin/ai").then(setCfg).catch(() => setCfg({ ready: false, tasks: [], provider: "" })); }, []);
  const run = async () => {
    const bl = blocks(); const special = bl.filter((b) => !STD.has(b.type)).length;
    const before = await toMarkdown(bl); if (!before.trim()) return toast("There is no text yet.", true);
    setBusy(true);
    try { const r = await api<{ text: string }>("/api/admin/ai", "POST", { task, text: before, instruction: task === "custom" ? ins : undefined, context }); if (task === "summary") { onSummary?.(r.text); toast("Summary written — check it in Details."); } else setRes({ before, after: r.text, special }); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(false); }
  };
  const use = async () => { if (!res) return; onReplace(await toBlocks(res.after)); setRes(null); toast("Used. Read it through, then Save."); };
  if (!cfg) return null;
  const t = cfg.tasks.find((x) => x.key === task);
  const wb = res ? words(res.before).length : 0, wa = res ? words(res.after).length : 0; const drift = wb ? Math.abs(wa - wb) / wb : 0;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500"><Sparkles className="size-3.5 text-[#7c4dff]" />AI assistant</p>
      {!cfg.ready ? <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">Add a Gemini (or other) key in Studio → Settings → AI assistant to use it here.</p> : <>
        <select value={task} onChange={(e) => setTask(e.target.value)} className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-[13px]">{cfg.tasks.filter((x) => x.key !== "summary" || onSummary).map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
        {t && <p className="mt-1.5 text-[11.5px] leading-relaxed text-zinc-500">{t.hint}</p>}
        {task === "custom" && <Textarea rows={3} value={ins} onChange={(e) => setIns(e.target.value)} placeholder="e.g. Put each Q&A turn in its own paragraph" className="mt-2 text-[12.5px]" />}
        <Btn kind="primary" busy={busy} disabled={task === "custom" && !ins.trim()} onClick={run} className="mt-2 w-full"><Sparkles />{busy ? "Working… (a long lecture can take a minute)" : "Run"}</Btn>
      </>}
      {res && <div className="fixed inset-0 z-[120] flex flex-col bg-white">
        <div className="flex h-12 items-center gap-3 border-b border-zinc-200 px-4">
          <p className="flex-1 text-[13.5px] font-semibold">Check the result — {t?.label}</p>
          <Btn size="sm" onClick={() => setRes(null)}><X />Discard</Btn>
          <Btn size="sm" kind="primary" onClick={use}><Check />Use this</Btn>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-[12px] text-zinc-600">
          <span>Words before: {wb.toLocaleString()} · after: {wa.toLocaleString()}</span>
          {drift > 0.02 && task !== "custom" && <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="size-3.5" />The number of words changed by {(drift * 100).toFixed(1)}% — read carefully before using.</span>}
          {res.special > 0 && <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="size-3.5" />{res.special} picture or special blocks are not included in the result.</span>}
          {/\[\?/.test(res.after) && <span className="text-[#7c4dff]">Words marked [?like this?] were unclear to the AI.</span>}
        </div>
        <div className="grid min-h-0 flex-1 md:grid-cols-2">
          <div className="min-h-0 overflow-y-auto border-r border-zinc-200 p-5"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-zinc-400">Before</p><pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-zinc-600">{res.before}</pre></div>
          <div className="min-h-0 overflow-y-auto p-5"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-[#7c4dff]">After — you can edit it here</p><textarea value={res.after} onChange={(e) => setRes({ ...res, after: e.target.value })} className="h-[calc(100%-28px)] min-h-[60vh] w-full resize-none bg-transparent font-sans text-[13.5px] leading-relaxed text-zinc-900 outline-none" /></div>
        </div>
      </div>}
    </div>
  );
}
