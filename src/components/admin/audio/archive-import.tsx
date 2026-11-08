"use client";
/* Studio → Audio → Import from Archive.org.
   Paste a collection link; every MP3 in it is listed with the date, verse and place read from its file name.
   Check or correct the titles, untick what is not wanted, then import. Only the link is stored —
   the sound itself stays on Archive.org, and the website always asks Archive.org for the file's current address. */
import { useMemo, useRef, useState } from "react";
import { Archive, X, Check, AlertTriangle, Loader2, Search, Square } from "lucide-react";
import { Btn, Input, api, toast } from "../ui";
import { AUDIO_KINDS } from "@/lib/content/text";

type Row = { name: string; title: string; date: string | null; date_note: string | null; place: string | null; country: string | null; scripture: string | null; canto: number | null; chapter: number | null; verse: string | null; duration_sec: number | null; size: number | null; exists: boolean; on?: boolean; state?: "saving" | "done" | "error"; note?: string };
const dur = (s: number | null) => (s ? `${Math.floor(s / 3600) ? `${Math.floor(s / 3600)}:` : ""}${String(Math.floor((s % 3600) / 60)).padStart(Math.floor(s / 3600) ? 2 : 1, "0")}:${String(s % 60).padStart(2, "0")}` : "");

export function ArchiveImport({ onClose, onDone }: { onClose: () => void; onDone?: () => void }) {
  const [link, setLink] = useState("https://archive.org/details/SSGGSM1996"); const [item, setItem] = useState(""); const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Row[]>([]); const [busy, setBusy] = useState(""); const [q, setQ] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published"); const [kind, setKind] = useState("lecture"); const [language, setLanguage] = useState("English");
  const stop = useRef(false);
  const load = async () => {
    setBusy("list"); try { const r = await api<{ item: string; title: string; rows: Row[] }>("/api/admin/audios/archive", "POST", { list: link }); setItem(r.item); setTitle(r.title); setRows(r.rows.map((x) => ({ ...x, on: !x.exists }))); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(""); }
  };
  const shown = useMemo(() => { const f = q.trim().toLowerCase(); return f ? rows.filter((r) => (r.name + " " + r.title + " " + (r.place || "")).toLowerCase().includes(f)) : rows; }, [rows, q]);
  const chosen = rows.filter((r) => r.on && !r.exists && r.state !== "done");
  const edit = (name: string, p: Partial<Row>) => setRows((o) => o.map((r) => (r.name === name ? { ...r, ...p } : r)));
  const run = async () => {
    if (!chosen.length) return; if (!confirm(`Add ${chosen.length} recordings from “${title}”? Only their links are stored.`)) return;
    stop.current = false; setBusy("import"); const todo = [...chosen];
    for (let i = 0; i < todo.length && !stop.current; i += 25) {
      const part = todo.slice(i, i + 25); setRows((o) => o.map((r) => (part.some((p) => p.name === r.name) ? { ...r, state: "saving" } : r)));
      try { const r = await api<{ results: { name: string; code?: string; error?: string }[] }>("/api/admin/audios/archive", "POST", { import: { item, rows: part, status, kind, language: language || null } });
        setRows((o) => o.map((x) => { const y = r.results.find((z) => z.name === x.name); return y ? { ...x, state: y.code ? "done" : "error", note: y.code ? `→ /audios/${y.code}` : y.error, exists: !!y.code || x.exists } : x; })); }
      catch (e: any) { setRows((o) => o.map((r) => (part.some((p) => p.name === r.name) ? { ...r, state: "error", note: e.message } : r))); }
    }
    setBusy(""); toast("Recordings added from Archive.org."); onDone?.();
  };
  const allOn = shown.filter((r) => !r.exists).every((r) => r.on);
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/30 p-4 sm:p-8" onClick={() => !busy && onClose()}>
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3"><p className="flex items-center gap-2 text-[15px] font-semibold"><Archive className="size-4" />Import from Archive.org</p><button onClick={() => !busy && onClose()} className="text-zinc-400 hover:text-zinc-900"><X className="size-5" /></button></div>
        <section className="space-y-3 p-5">
          <p className="text-[12.5px] text-zinc-500">Paste the link of a collection on Archive.org. The sound stays there, at no cost to the website; only each file’s lasting link is kept here, and the player always asks Archive.org for the file’s current address.</p>
          <div className="flex flex-wrap gap-2"><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://archive.org/details/…" className="!h-9 min-w-[260px] flex-1" /><Btn onClick={load} disabled={!!busy}>{busy === "list" ? <Loader2 className="animate-spin" /> : <Search />}List the MP3 files</Btn></div>
          {rows.length > 0 && <>
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-[12.5px]">
              <span className="font-medium">{title}</span><span className="text-zinc-500">· {rows.length} MP3 files · {rows.filter((r) => r.exists).length} already here · {chosen.length} chosen</span>
              <span className="ml-auto flex flex-wrap items-center gap-2">
                <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-8 rounded-md border border-zinc-200 bg-white px-2">{AUDIO_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" className="!h-8 !w-28" />
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-8 rounded-md border border-zinc-200 bg-white px-2"><option value="published">Publish</option><option value="draft">Keep as draft</option></select>
              </span>
            </div>
            <div className="flex items-center gap-2"><label className="relative flex-1"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter the list" className="!h-8 pl-8" /></label>
              <button onClick={() => setRows((o) => o.map((r) => (shown.includes(r) && !r.exists ? { ...r, on: !allOn } : r)))} className="h-8 rounded-md border border-zinc-200 px-3 text-[12.5px] hover:bg-zinc-50">{allOn ? "Untick" : "Tick"} {q ? "these" : "all"}</button></div>
            <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-zinc-200 text-[12.5px]">
              <div className="sticky top-0 z-10 grid grid-cols-[24px_1fr_1.2fr_112px_110px_60px] gap-2 border-b border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500"><span /><span>File on Archive.org</span><span>Title here</span><span>Date</span><span>Place</span><span className="text-right">Length</span></div>
              {shown.map((r) => <div key={r.name} className={`grid grid-cols-[24px_1fr_1.2fr_112px_110px_60px] items-center gap-2 border-b border-zinc-100 px-3 py-1 last:border-0 ${r.exists && r.state !== "done" ? "opacity-50" : ""}`}>
                <span>{r.state === "done" ? <Check className="size-3.5 text-emerald-600" /> : r.state === "error" ? <AlertTriangle className="size-3.5 text-red-600" /> : r.state === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <input type="checkbox" disabled={r.exists} checked={!!r.on && !r.exists} onChange={(e) => edit(r.name, { on: e.target.checked })} />}</span>
                <span className="truncate font-mono text-[11.5px] text-zinc-600" title={r.name}>{r.name}</span>
                {r.state === "done" || r.state === "error" ? <span className={`truncate ${r.state === "error" ? "text-red-600" : "text-emerald-700"}`}>{r.note}</span> : r.exists ? <span className="text-zinc-400">Already here</span> : <input value={r.title} onChange={(e) => edit(r.name, { title: e.target.value })} className="h-7 min-w-0 rounded border border-transparent bg-transparent px-1.5 hover:border-zinc-200 focus:border-zinc-400 focus:outline-none" />}
                <input value={r.date || r.date_note || ""} onChange={(e) => { const v = e.target.value.trim(); edit(r.name, /^\d{4}-\d{2}-\d{2}$/.test(v) ? { date: v, date_note: null } : { date: null, date_note: v || null }); }} disabled={r.exists} className="h-7 min-w-0 rounded border border-transparent bg-transparent px-1 tabular-nums hover:border-zinc-200 focus:outline-none" />
                <input value={r.place || ""} onChange={(e) => edit(r.name, { place: e.target.value || null })} disabled={r.exists} placeholder="—" className="h-7 min-w-0 rounded border border-transparent bg-transparent px-1 hover:border-zinc-200 focus:outline-none" />
                <span className="text-right tabular-nums text-zinc-500">{dur(r.duration_sec)}</span>
              </div>)}
            </div>
            <div className="flex items-center justify-between gap-3"><p className="text-[12px] text-zinc-500">Titles, dates and places can be corrected here or later in each recording.</p>
              {busy === "import" ? <Btn onClick={() => { stop.current = true; }}><Square />Stop</Btn> : <Btn kind="primary" onClick={run} disabled={!chosen.length || !!busy}><Archive />Add {chosen.length} recordings</Btn>}</div>
          </>}
        </section>
      </div>
    </div>
  );
}
