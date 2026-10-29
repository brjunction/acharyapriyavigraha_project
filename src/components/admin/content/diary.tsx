"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotebookPen, Plus, Search, Trash2, Image as ImageIcon, Upload, ExternalLink } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, api, toast } from "../ui";
import { MediaPicker } from "../media-picker";

type R = { id: string; slug: string; date: string | null; date_note: string | null; place: string | null; title: string | null; volume: string | null; page: string | null; status: string; preview: string; has_scan: boolean; has_original: boolean; has_translation: boolean };

export function DiaryPanel() {
  const [rows, setRows] = useState<R[] | null>(null); const [q, setQ] = useState(""); const [edit, setEdit] = useState<string | null>(null); const [imp, setImp] = useState(false); const t = useRef<any>(null);
  const load = useCallback((qq = q) => api<R[]>(`/api/admin/diary${qq ? `?q=${encodeURIComponent(qq)}` : ""}`).then(setRows).catch((e) => toast(e.message, true)), [q]);
  useEffect(() => { load(); }, []); // eslint-disable-line
  const years = Array.from(new Set((rows || []).map((r) => (r.date ? r.date.slice(0, 4) : "Undated"))));
  return (
    <div>
      <PageHeader icon={NotebookPen} title="His Diary" description="The diary Śrīla Gurudeva wrote throughout his life as prayers to Śrī Gopāl Jiu. Each entry keeps his original words, the translation and, if you have it, a picture of the handwritten page.">
        <a href="/gurudeva/diaries" target="_blank"><Btn><ExternalLink />Open the diary</Btn></a><Btn onClick={() => setImp(true)}><Upload />Import</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add an entry</Btn>
      </PageHeader>
      <div className="relative mb-4"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => { setQ(e.target.value); clearTimeout(t.current); t.current = setTimeout(() => load(e.target.value), 300); }} placeholder="Search the diary (no diacritics needed)" className="pl-8" /></div>
      {rows && !rows.length ? <Empty icon={NotebookPen} title="No entries yet" text="Add the first page of the diary, or import many from a spreadsheet."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add an entry</Btn></Empty> :
        years.map((y) => <section key={y} className="mb-6"><h2 className="mb-2 text-[14px] font-semibold text-zinc-500">{y}</h2>
          <Card className="divide-y divide-zinc-100">{(rows || []).filter((r) => (r.date ? r.date.slice(0, 4) : "Undated") === y).map((r) => (
            <button key={r.id} onClick={() => setEdit(r.id)} className="flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-zinc-50">
              <span className="w-24 shrink-0 text-[13px] tabular-nums text-zinc-500">{r.date ? new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : r.date_note || "—"}</span>
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{r.title || r.place || "Entry"}</span><span className="line-clamp-1 text-[13px] text-zinc-500">{r.preview}</span></span>
              <span className="flex shrink-0 gap-1">{r.has_original && <Badge tone="outline">Original</Badge>}{r.has_translation && <Badge tone="outline">Translation</Badge>}{r.has_scan && <Badge tone="blue">Scan</Badge>}{r.status !== "published" && <Badge>Hidden</Badge>}</span>
            </button>))}</Card></section>)}
      {edit && <EntryEditor id={edit} onClose={() => setEdit(null)} onSaved={() => load()} />}
      {imp && <DiaryImport onClose={() => setImp(false)} onDone={() => { setImp(false); load(); }} />}
    </div>
  );
}

function EntryEditor({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [e, setE] = useState<any>(id === "new" ? { status: "published", original_lang: "or" } : null); const [busy, setBusy] = useState(false); const [pic, setPic] = useState(false);
  useEffect(() => { if (id !== "new") api(`/api/admin/diary/${id}`).then((r) => setE({ ...r, date: r.date?.slice(0, 10) || "" })).catch((x) => toast(x.message, true)); }, [id]);
  if (!e) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, v: any) => setE((p: any) => ({ ...p, [k]: v }));
  const save = async (again = false) => { setBusy(true); try { if (id === "new") await api("/api/admin/diary", "POST", e); else await api(`/api/admin/diary/${id}`, "PATCH", e); toast("Saved."); onSaved(); if (again) setE({ status: "published", original_lang: e.original_lang, volume: e.volume, place: e.place }); else onClose(); } catch (x: any) { toast(x.message, true); } finally { setBusy(false); } };
  return (
    <Sheet width="max-w-3xl" title={id === "new" ? "New diary entry" : e.title || e.date || "Diary entry"} onClose={onClose} actions={<>{id === "new" && <Btn size="sm" busy={busy} onClick={() => save(true)}>Save and add next</Btn>}<Btn size="sm" kind="primary" busy={busy} onClick={() => save()}>Save</Btn></>}>
      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Date"><Input type="date" value={e.date || ""} onChange={(x) => set("date", x.target.value)} /></Field><Field label="If the date is not exact"><Input value={e.date_note || ""} onChange={(x) => set("date_note", x.target.value)} placeholder="e.g. Kārttika 1979" /></Field><Field label="Place"><Input value={e.place || ""} onChange={(x) => set("place", x.target.value)} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Heading (optional)" className="sm:col-span-1"><Input value={e.title || ""} onChange={(x) => set("title", x.target.value)} /></Field><Field label="Diary volume"><Input value={e.volume || ""} onChange={(x) => set("volume", x.target.value)} placeholder="e.g. Diary 3" /></Field><Field label="Page"><Input value={e.page || ""} onChange={(x) => set("page", x.target.value)} /></Field></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="His original words"><div className="space-y-2"><Select value={e.original_lang || "or"} onChange={(x) => set("original_lang", x.target.value)} className="!h-8"><option value="or">Odia</option><option value="en">English</option><option value="hi">Hindi</option><option value="bn">Bengali</option><option value="sa">Sanskrit</option></Select><Textarea rows={14} value={e.original || ""} onChange={(x) => set("original", x.target.value)} className="text-[16px] leading-[1.9]" /></div></Field>
          <Field label="Translation (English)"><div className="space-y-2"><div className="h-8" /><Textarea rows={14} value={e.translation || ""} onChange={(x) => set("translation", x.target.value)} className="text-[15px] leading-[1.8]" /></div></Field>
        </div>
        <Field label="Picture of the handwritten page" hint="Readers can open it beside the text.">
          <div className="flex items-center gap-3">{e.scan_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.scan_url} alt="" className="h-20 rounded border border-zinc-200" />}<Btn onClick={() => setPic(true)}><ImageIcon />{e.scan_url ? "Change" : "Choose picture"}</Btn>{e.scan_url && <Btn onClick={() => set("scan_url", null)}>Remove</Btn>}</div></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Notes for the team"><Input value={e.notes || ""} onChange={(x) => set("notes", x.target.value)} /></Field><Field label="Shown on the website"><Select value={e.status} onChange={(x) => set("status", x.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field></div>
        {id !== "new" && <div className="flex justify-end border-t border-zinc-200 pt-4"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this entry?")) return; await api(`/api/admin/diary/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set("scan_url", i[0].url); setPic(false); }} />}
    </Sheet>
  );
}

function DiaryImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<string[][] | null>(null); const [busy, setBusy] = useState(false);
  const COLS = ["date", "date_note", "place", "title", "original", "translation", "volume", "page"];
  const read = async (f: File) => { const text = (await f.text()).replace(/^﻿/, ""); const out: string[][] = []; let row: string[] = [], cell = "", q = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; } else cell += c; } if (cell || row.length) { row.push(cell); out.push(row); } setRows(out); };
  return (
    <Modal title="Import diary entries" description={`A CSV whose first row has these column names: ${COLS.join(", ")}. Long texts can have line breaks inside quotes.`} onClose={onClose}>
      <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="text-[13.5px]" />
      {rows && <p className="mt-3 text-[13.5px]">{rows.length - 1} entries found.</p>}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!rows} onClick={async () => { setBusy(true); const head = rows![0].map((h) => h.trim().toLowerCase()); const items = rows!.slice(1).map((r) => Object.fromEntries(COLS.map((c) => [c, r[head.indexOf(c)]?.trim() || null]).filter(([, v]) => v))); const r = await api<{ added: number }>("/api/admin/diary", "POST", { import: items }).catch((x) => { toast(x.message, true); return { added: 0 }; }); toast(`${r.added} entries added.`); onDone(); }}><Upload />Import</Btn></div>
    </Modal>
  );
}
