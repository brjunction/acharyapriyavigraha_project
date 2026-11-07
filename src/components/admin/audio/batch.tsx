"use client";
/* Studio → Audio → Batch transcriptions:
   1. bring in many automatic transcriptions (TwinMind or others) at once — each file is matched to its recording by its name;
   2. let the AI tidy them all (structure, paragraphs, headings, verses, speakers, spelling, diacritics), one after another.
   The automatic transcription is kept apart from the devotees' own. */
import { useEffect, useRef, useState } from "react";
import { Bot, FileUp, Sparkles, X, Check, AlertTriangle, Loader2, Square } from "lucide-react";
import { Btn, Input, api, toast } from "../ui";
import { docxToBlocks } from "./panel";

type Found = { file: File; name: string; audio: { id: string; title: string; code: string | null } | null; state?: "saving" | "saved" | "error"; note?: string };
async function fileToBlocks(f: File) {
  if (/\.docx$/i.test(f.name)) return docxToBlocks(f);
  const { BlockNoteEditor } = await import("@blocknote/core"); const ed = BlockNoteEditor.create(); return ed.tryParseMarkdownToBlocks(await f.text());
}

export function BatchTranscripts({ onClose }: { onClose: () => void }) {
  const [counts, setCounts] = useState<any>(null); const [source, setSource] = useState("TwinMind"); const [found, setFound] = useState<Found[]>([]); const [busy, setBusy] = useState("");
  const [jobs, setJobs] = useState<{ id: string; title: string; state: string; note?: string }[]>([]); const stop = useRef(false);
  const load = () => api<any>("/api/admin/audios/machine").then(setCounts).catch(() => {});
  useEffect(() => { load(); }, []);
  const pick = async (files: FileList | null) => {
    if (!files?.length) return; setBusy("match");
    try { const list = [...files]; const r = await api<{ results: { name: string; audio: any }[] }>("/api/admin/audios/machine", "POST", { match: list.map((f) => f.name) }); setFound(list.map((f, i) => ({ file: f, name: f.name, audio: r.results[i]?.audio || null }))); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(""); }
  };
  const saveAll = async () => {
    setBusy("save"); const next = [...found];
    for (let i = 0; i < next.length; i++) { const x = next[i]; if (!x.audio || x.state === "saved") continue; next[i] = { ...x, state: "saving" }; setFound([...next]);
      try { const blocks = await fileToBlocks(x.file); await api("/api/admin/audios/machine", "POST", { save: { id: x.audio.id, blocks, source } }); next[i] = { ...x, state: "saved" }; } catch (e: any) { next[i] = { ...x, state: "error", note: e.message }; }
      setFound([...next]); }
    setBusy(""); load(); toast("Automatic transcriptions brought in.");
  };
  const tidy = async (scope: "auto-untidied" | "auto") => {
    const r = await api<{ rows: { id: string; title: string }[] }>("/api/admin/audios/machine", "POST", { list: scope }); if (!r.rows.length) return toast("Nothing to tidy.");
    if (!confirm(`Let the AI tidy ${r.rows.length} automatic transcriptions, one after another? You can stop at any time.`)) return;
    stop.current = false; setBusy("ai"); const js: { id: string; title: string; state: string; note?: string }[] = r.rows.map((x) => ({ ...x, state: "waiting" })); setJobs(js);
    for (let i = 0; i < js.length; i++) { if (stop.current) break; js[i] = { ...js[i], state: "working" }; setJobs([...js]);
      try { const o = await api<{ words: { before: number; after: number } }>("/api/admin/audios/machine", "POST", { ai: js[i].id }); js[i] = { ...js[i], state: "done", note: `${o.words.after.toLocaleString()} words` }; } catch (e: any) { js[i] = { ...js[i], state: "error", note: e.message }; }
      setJobs([...js]); }
    setBusy(""); load();
  };
  const matched = found.filter((x) => x.audio).length;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/30 p-4 sm:p-8" onClick={() => !busy && onClose()}>
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3"><p className="flex items-center gap-2 text-[15px] font-semibold"><Bot className="size-4" />Batch transcriptions</p><button onClick={() => !busy && onClose()} className="text-zinc-400 hover:text-zinc-900"><X className="size-5" /></button></div>
        {counts && <p className="border-b border-zinc-100 bg-zinc-50 px-5 py-2 text-[12.5px] text-zinc-600">{counts.all} recordings · {counts.devotee} with a devotee transcription · {counts.auto} with an automatic one ({counts.untidied} not yet tidied by AI)</p>}
        <section className="space-y-3 p-5">
          <p className="text-[13.5px] font-semibold">1 · Bring in automatic transcriptions</p>
          <p className="text-[12.5px] text-zinc-500">Choose many files at once (.txt, .md or .docx). Each is matched to its recording by its name: the address code (e.g. <code>19661011BBSR1</code>) or the file name (e.g. <code>1977_10_11_Bhubaneswar_Bhagavatam_10_66</code>). They are kept as the automatic transcription, separate from the devotees’ own.</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-[13px] font-medium hover:bg-zinc-50"><FileUp className="size-4" />Choose files<input type="file" multiple accept=".txt,.md,.markdown,.docx" className="hidden" onChange={(e) => pick(e.target.files)} /></label>
            <span className="text-[12.5px] text-zinc-500">Source</span><Input value={source} onChange={(e) => setSource(e.target.value)} className="!h-9 !w-40" />
            {busy === "match" && <Loader2 className="size-4 animate-spin text-zinc-400" />}
          </div>
          {found.length > 0 && <>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 text-[12.5px]">{found.map((x) => <div key={x.name} className="flex items-center gap-2 border-b border-zinc-100 px-3 py-1.5 last:border-0">
              {x.state === "saved" ? <Check className="size-3.5 text-emerald-600" /> : x.state === "error" ? <AlertTriangle className="size-3.5 text-red-600" /> : x.state === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : x.audio ? <span className="size-2 rounded-full bg-emerald-500" /> : <span className="size-2 rounded-full bg-zinc-300" />}
              <span className="w-1/2 truncate font-mono text-zinc-600">{x.name}</span><span className={`min-w-0 flex-1 truncate ${x.audio ? "" : "text-zinc-400"}`}>{x.note || (x.audio ? `→ ${x.audio.title}` : "No matching recording — rename the file with its code")}</span></div>)}</div>
            <Btn kind="primary" busy={busy === "save"} disabled={!matched || !!busy} onClick={saveAll}><Check />Bring in {matched} of {found.length}</Btn>
          </>}
        </section>
        <section className="space-y-3 border-t border-zinc-200 p-5">
          <p className="text-[13.5px] font-semibold">2 · Let the AI tidy them</p>
          <p className="text-[12.5px] text-zinc-500">Paragraphs, headings for the parts of each lecture, verses set apart, speakers named in questions and answers, spelling and diacritics — without changing his words. If an answer comes back much shorter than the text, it is not used.</p>
          <div className="flex flex-wrap gap-2">
            <Btn kind="primary" disabled={!!busy || !counts?.untidied} onClick={() => tidy("auto-untidied")}><Sparkles />Tidy {counts?.untidied ?? 0} not yet tidied</Btn>
            <Btn disabled={!!busy || !counts?.auto} onClick={() => tidy("auto")}>Tidy all {counts?.auto ?? 0} again</Btn>
            {busy === "ai" && <Btn onClick={() => { stop.current = true; }}><Square />Stop after this one</Btn>}
          </div>
          {jobs.length > 0 && <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-200 text-[12.5px]">{jobs.map((j) => <div key={j.id} className="flex items-center gap-2 border-b border-zinc-100 px-3 py-1.5 last:border-0">
            {j.state === "done" ? <Check className="size-3.5 text-emerald-600" /> : j.state === "error" ? <AlertTriangle className="size-3.5 text-red-600" /> : j.state === "working" ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-2 rounded-full bg-zinc-300" />}
            <span className="min-w-0 flex-1 truncate">{j.title}</span><span className={`truncate text-right ${j.state === "error" ? "text-red-600" : "text-zinc-500"}`}>{j.note || j.state}</span></div>)}</div>}
          {jobs.length > 0 && <p className="text-[12px] text-zinc-500">{jobs.filter((j) => j.state === "done").length} done · {jobs.filter((j) => j.state === "error").length} not done · {jobs.filter((j) => j.state === "waiting").length} waiting</p>}
        </section>
      </div>
    </div>
  );
}
