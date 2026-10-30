"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NotebookPen, Plus, Search, Trash2, Upload, ExternalLink, Download, ChevronLeft, ChevronRight, Eye, EyeOff, BookCopy, AlertTriangle } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, api, toast } from "../ui";

type R = { id: string; slug: string; date: string | null; date_note: string | null; volume: string | null; page: string | null; status: string; preview: string; has_translation: boolean };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const yearOf = (r: R) => (r.date ? r.date.slice(0, 4) : "Undated");

/** His Diary in the Studio: years and months on the left, pages in order, bulk tools, Excel import. */
export function DiaryPanel() {
  const [rows, setRows] = useState<R[] | null>(null); const [q, setQ] = useState(""); const [year, setYear] = useState<string>(""); const [month, setMonth] = useState<number>(0);
  const [vol, setVol] = useState(""); const [need, setNeed] = useState(""); const [sel, setSel] = useState<string[]>([]);
  const [edit, setEdit] = useState<string | null>(null); const [imp, setImp] = useState(false);
  const load = useCallback(() => api<R[]>("/api/admin/diary").then(setRows).catch((e) => toast(e.message, true)), []);
  useEffect(() => { load(); }, [load]);
  const all = rows || [];
  const years = useMemo(() => { const m = new Map<string, R[]>(); all.forEach((r) => m.set(yearOf(r), [...(m.get(yearOf(r)) || []), r])); return [...m.entries()]; }, [all]);
  const volumes = useMemo(() => Array.from(new Set(all.map((r) => r.volume).filter(Boolean))) as string[], [all]);
  const shown = useMemo(() => all.filter((r) => (!year || yearOf(r) === year) && (!month || (r.date && Number(r.date.slice(5, 7)) === month)) && (!vol || r.volume === vol)
    && (!need || (need === "empty" && !r.has_translation) || (need === "hidden" && r.status !== "published") || (need === "undated" && !r.date))
    && (!q || fold(`${r.preview} ${r.date || ""} ${r.date_note || ""}`).includes(fold(q)))), [all, year, month, vol, need, q]);
  const dupes = useMemo(() => { const c = new Map<string, number>(); all.forEach((r) => r.date && c.set(r.date, (c.get(r.date) || 0) + 1)); return new Set([...c].filter(([, n]) => n > 1).map(([d]) => d)); }, [all]);
  const stats = { total: all.length, empty: all.filter((r) => !r.has_translation).length, hidden: all.filter((r) => r.status !== "published").length, undated: all.filter((r) => !r.date).length };
  const bulk = async (set: Record<string, string | null>) => { await api("/api/admin/diary", "PATCH", { ids: sel, set }).catch((e) => toast(e.message, true)); toast(`${sel.length} entries updated.`); setSel([]); load(); };
  const order = shown.map((r) => r.id);

  return (
    <div>
      <PageHeader icon={NotebookPen} title="His Diary" description="The diary Śrīla Gurudeva wrote as prayers to Śrī Gopāl Jiu. Each entry is one page: its date (or the date as written), the notebook it is in, and its English translation.">
        <a href="/gurudeva/diaries" target="_blank"><Btn><ExternalLink />Open the diary</Btn></a><Btn onClick={() => setImp(true)}><Upload />Import</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a page</Btn>
      </PageHeader>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {([["", "All pages", stats.total], ["empty", "Without translation", stats.empty], ["undated", "Without a date", stats.undated], ["hidden", "Hidden", stats.hidden]] as const).map(([k, l, n]) => (
          <button key={k} onClick={() => setNeed(k)} className={`rounded-xl border p-3 text-left transition ${need === k ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"}`}><p className="text-[20px] font-semibold tabular-nums">{n}</p><p className="text-[12px] text-zinc-500">{l}</p></button>))}
      </div>
      {rows && !rows.length ? <Empty icon={NotebookPen} title="No pages yet" text="Add the first page of the diary, or import many from Excel."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a page</Btn></Empty> :
      <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-1 px-2 text-[11.5px] font-medium text-zinc-500">Years</p>
          <div className="max-h-[60vh] space-y-0.5 overflow-y-auto max-lg:flex max-lg:gap-1 max-lg:space-y-0 max-lg:overflow-x-auto">
            <button onClick={() => { setYear(""); setMonth(0); }} className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[13px] ${!year ? "bg-zinc-200/70 font-medium" : "hover:bg-zinc-100"}`}>All years<span className="text-[11.5px] text-zinc-500">{all.length}</span></button>
            {years.map(([y, rs]) => (
              <div key={y}>
                <button onClick={() => { setYear(y); setMonth(0); }} className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[13px] tabular-nums ${year === y && !month ? "bg-zinc-200/70 font-medium" : "hover:bg-zinc-100"}`}>{y}<span className="text-[11.5px] text-zinc-500">{rs.length}</span></button>
                {year === y && y !== "Undated" && <div className="ml-3 border-l border-zinc-200 pl-1 max-lg:hidden">{MONTHS.map((m, i) => { const n = rs.filter((r) => Number(r.date?.slice(5, 7)) === i + 1).length; return n ? <button key={m} onClick={() => setMonth(i + 1)} className={`flex w-full justify-between rounded px-2 py-0.5 text-[12px] ${month === i + 1 ? "bg-zinc-200/70 font-medium" : "text-zinc-600 hover:bg-zinc-100"}`}>{m}<span className="text-zinc-400">{n}</span></button> : null; })}</div>}
              </div>))}
          </div>
          {volumes.length > 0 && <><p className="mb-1 mt-4 px-2 text-[11.5px] font-medium text-zinc-500">Notebooks</p><Select value={vol} onChange={(e) => setVol(e.target.value)}><option value="">All notebooks</option>{volumes.map((v) => <option key={v} value={v}>Notebook {v}</option>)}</Select></>}
        </aside>
        <div className="min-w-0">
          <div className="relative mb-3"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the text or a date (no diacritics needed)" className="pl-8" /></div>
          {sel.length > 0 && <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
            <span className="px-1 text-[12.5px] font-medium">{sel.length} selected</span>
            <Btn size="sm" onClick={() => { const v = prompt("Put these pages in notebook… (empty to clear)"); if (v !== null) bulk({ volume: v.trim() || null }); }}><BookCopy />Set notebook</Btn>
            <Btn size="sm" onClick={() => bulk({ status: "published" })}><Eye />Show</Btn><Btn size="sm" onClick={() => bulk({ status: "draft" })}><EyeOff />Hide</Btn>
            <Btn size="sm" kind="danger" onClick={async () => { if (!confirm(`Delete ${sel.length} pages? This cannot be undone.`)) return; await api("/api/admin/diary", "DELETE", { ids: sel }); setSel([]); load(); }}><Trash2 />Delete</Btn>
            <button onClick={() => setSel([])} className="ml-auto px-2 text-[12px] text-zinc-500">Clear</button>
          </div>}
          <Card className="divide-y divide-zinc-100">
            <label className="flex items-center gap-3 px-4 py-2 text-[12px] text-zinc-500"><input type="checkbox" checked={!!shown.length && sel.length === shown.length} onChange={(e) => setSel(e.target.checked ? order : [])} />{shown.length} pages{year ? ` in ${month ? `${MONTHS[month - 1]} ` : ""}${year}` : ""}</label>
            {shown.slice(0, 500).map((r) => (
              <div key={r.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-50">
                <input type="checkbox" className="mt-1" checked={sel.includes(r.id)} onChange={(e) => setSel((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))} />
                <button onClick={() => setEdit(r.id)} className="flex min-w-0 flex-1 items-start gap-4 text-left">
                  <span className="w-28 shrink-0 text-[12.5px] tabular-nums text-zinc-600">{r.date ? new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : r.date_note || "—"}{r.volume && <span className="block text-[11px] text-zinc-400">Nb. {r.volume}{r.page ? `, p. ${r.page}` : ""}</span>}</span>
                  <span className="line-clamp-2 min-w-0 flex-1 text-[13px] text-zinc-700">{r.preview || <i className="text-zinc-400">No translation yet</i>}</span>
                  <span className="flex shrink-0 gap-1">{r.date && dupes.has(r.date) && <Badge tone="amber">Same date</Badge>}{!r.has_translation && <Badge tone="outline">Empty</Badge>}{r.status !== "published" && <Badge>Hidden</Badge>}</span>
                </button>
              </div>))}
          </Card>
          {shown.length > 500 && <p className="mt-2 text-center text-[12px] text-zinc-500">Showing the first 500. Choose a year or month to see the rest.</p>}
        </div>
      </div>}
      {edit && <EntryEditor id={edit} order={order} onGo={setEdit} onClose={() => setEdit(null)} onSaved={load} />}
      {imp && <DiaryImport onClose={() => setImp(false)} onDone={() => { setImp(false); load(); }} />}
    </div>
  );
}

function EntryEditor({ id, order, onGo, onClose, onSaved }: { id: string; order: string[]; onGo: (id: string) => void; onClose: () => void; onSaved: () => void }) {
  const [e, setE] = useState<any>(null); const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false);
  useEffect(() => { setDirty(false); if (id === "new") setE({ status: "published" }); else { setE(null); api(`/api/admin/diary/${id}`).then((r) => setE({ ...r, date: r.date ? String(r.date).slice(0, 10) : "" })).catch((x) => toast(x.message, true)); } }, [id]);
  if (!e) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, v: any) => { setDirty(true); setE((p: any) => ({ ...p, [k]: v })); };
  const save = async (then?: "next" | "again") => {
    setBusy(true);
    try {
      if (id === "new") await api("/api/admin/diary", "POST", e); else if (dirty) await api(`/api/admin/diary/${id}`, "PATCH", e);
      toast("Saved."); onSaved(); setDirty(false);
      if (then === "again") setE({ status: "published", volume: e.volume }); else if (then === "next") { const k = order.indexOf(id); if (order[k + 1]) onGo(order[k + 1]); else onClose(); } else onClose();
    } catch (x: any) { toast(x.message, true); } finally { setBusy(false); }
  };
  const k = order.indexOf(id); const prev = order[k - 1], next = order[k + 1];
  const nav = (to?: string) => { if (!to) return; if (dirty && !confirm("Leave without saving the changes?")) return; onGo(to); };
  return (
    <Sheet width="max-w-3xl" title={id === "new" ? "New diary page" : <span className="flex items-center gap-2"><button disabled={!prev} onClick={() => nav(prev)} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30" title="Previous page"><ChevronLeft className="size-4" /></button>{e.date || e.date_note || "Diary page"}<button disabled={!next} onClick={() => nav(next)} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30" title="Next page"><ChevronRight className="size-4" /></button></span>}
      onClose={onClose} actions={<>{id === "new" ? <Btn size="sm" busy={busy} onClick={() => save("again")}>Save and add next</Btn> : next && <Btn size="sm" busy={busy} onClick={() => save("next")}>Save and open next</Btn>}<Btn size="sm" kind="primary" busy={busy} onClick={() => save()}>Save</Btn></>}>
      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Date" className="sm:col-span-1"><Input type="date" value={e.date || ""} onChange={(x) => set("date", x.target.value)} /></Field>
          <Field label="Or as written" hint="If not exact" className="sm:col-span-1"><Input value={e.date_note || ""} onChange={(x) => set("date_note", x.target.value)} placeholder="Kārttika 1979" /></Field>
          <Field label="Notebook"><Input value={e.volume || ""} onChange={(x) => set("volume", x.target.value)} placeholder="e.g. 3" /></Field>
          <Field label="Page"><Input value={e.page || ""} onChange={(x) => set("page", x.target.value)} /></Field>
        </div>
        {!e.date && !e.date_note && <p className="flex items-center gap-1.5 text-[12px] text-amber-700"><AlertTriangle className="size-3.5" />Without a date the page goes to “Undated” at the end of the diary.</p>}
        <Field label="English translation"><Textarea rows={20} value={e.translation || ""} onChange={(x) => set("translation", x.target.value)} className="text-[14px] leading-[1.8]" placeholder="The English translation of this diary page" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Notes for the team" hint="Not shown on the website"><Input value={e.notes || ""} onChange={(x) => set("notes", x.target.value)} /></Field><Field label="Shown on the website"><Select value={e.status} onChange={(x) => set("status", x.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field></div>
        {id !== "new" && <div className="flex items-center justify-between border-t border-zinc-200 pt-4"><a href={`/gurudeva/diaries?e=${e.slug}`} target="_blank" className="text-[12.5px] text-zinc-600 hover:text-zinc-900">See it in the diary →</a><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this page?")) return; await api(`/api/admin/diary/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
    </Sheet>
  );
}

function DiaryImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [items, setItems] = useState<any[] | null>(null); const [busy, setBusy] = useState(false);
  const HEAD: Record<string, string> = { date: "date", "date as written": "date_note", date_note: "date_note", notebook: "volume", volume: "volume", page: "page", translation: "translation" };
  const fromRows = (rows: string[][]) => { const head = rows[0].map((h) => HEAD[h.trim().toLowerCase()] || ""); setItems(rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()]).filter(([h, v]) => h && v))).filter((x) => x.translation)); };
  const read = async (f: File) => {
    if (/\.xlsx$/i.test(f.name)) { const fd = new FormData(); fd.append("file", f); try { fromRows((await api<{ rows: string[][] }>("/api/admin/diary/sheet", "POST", fd)).rows); } catch (e: any) { toast(e.message, true); } return; }
    const text = (await f.text()).replace(/^﻿/, ""); const out: string[][] = []; let row: string[] = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; } else cell += c; }
    if (cell || row.length) { row.push(cell); out.push(row); } fromRows(out);
  };
  return (
    <Modal title="Import diary pages" description="Download the Excel template, fill one row per page (Date, Date as written, Notebook, Page, Translation) and choose the file. CSV files with the same columns work too." onClose={onClose}>
      <a href="/api/admin/diary/sheet"><Btn size="sm"><Download />Download the template</Btn></a>
      <input type="file" accept=".xlsx,.csv" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="mt-4 block text-[13px]" />
      {items && <p className="mt-3 text-[13px]">{items.length} pages with a translation found.</p>}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!items?.length} onClick={async () => { setBusy(true); const r = await api<{ added: number }>("/api/admin/diary", "POST", { import: items }).catch((x) => { toast(x.message, true); return { added: 0 }; }); toast(`${r.added} pages added.`); onDone(); }}><Upload />Import</Btn></div>
    </Modal>
  );
}
