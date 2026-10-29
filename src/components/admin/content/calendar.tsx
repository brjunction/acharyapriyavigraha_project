"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Download, Upload, FileSpreadsheet, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { CAL_KINDS } from "@/lib/content/calendar";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Modal, Empty, api, toast, cn } from "../ui";

type E = { id: string; date: string; title: string; kind: string; fasting: string | null; paran: string | null; description: string | null; location: string; link: string | null };
const TONE: Record<string, "amber" | "green" | "blue" | "red" | "neutral"> = { ekadashi: "green", festival: "amber", appearance: "blue", disappearance: "neutral", fast: "red", other: "neutral" };

export function CalendarPanel() {
  const [year, setYear] = useState(new Date().getFullYear()); const [loc, setLoc] = useState(""); const [data, setData] = useState<{ rows: E[]; locations: { location: string; n: number }[]; years: { y: number; n: number }[] } | null>(null);
  const [edit, setEdit] = useState<Partial<E> | null>(null); const [imp, setImp] = useState(false);
  const load = useCallback(() => api(`/api/admin/calendar?year=${year}${loc ? `&location=${encodeURIComponent(loc)}` : ""}`).then(setData).catch((e) => toast(e.message, true)), [year, loc]);
  useEffect(() => { load(); }, [load]);
  const months = Array.from({ length: 12 }, (_, m) => (data?.rows || []).filter((r) => Number(String(r.date).slice(5, 7)) === m + 1));
  const save = async () => { try { if (edit!.id) await api(`/api/admin/calendar/${edit!.id}`, "PATCH", edit); else await api("/api/admin/calendar", "POST", edit); setEdit(null); load(); toast("Saved."); } catch (e: any) { toast(e.message, true); } };
  return (
    <div>
      <PageHeader icon={CalendarDays} title="Vaiṣṇava calendar" description="Festivals, Ekādaśīs, appearance and disappearance days. Fill a whole year in Excel and import it, or add single days here.">
        <a href="/api/admin/calendar/file?type=template&format=xlsx"><Btn><FileSpreadsheet />Excel template</Btn></a>
        <a href={`/api/admin/calendar/file?type=export&format=xlsx&year=${year}`}><Btn><Download />Export {year}</Btn></a>
        <Btn onClick={() => setImp(true)}><Upload />Import</Btn>
        <Btn kind="primary" onClick={() => setEdit({ date: `${year}-01-01`, kind: "festival", location: loc || "Bhubaneswar" })}><Plus />Add a day</Btn>
      </PageHeader>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border border-zinc-200 shadow-xs"><button onClick={() => setYear(year - 1)} className="p-2 hover:bg-zinc-50"><ChevronLeft className="size-4" /></button><span className="w-16 text-center text-[14px] font-semibold tabular-nums">{year}</span><button onClick={() => setYear(year + 1)} className="p-2 hover:bg-zinc-50"><ChevronRight className="size-4" /></button></div>
        <Select value={loc} onChange={(e) => setLoc(e.target.value)} className="!w-auto"><option value="">All places</option>{data?.locations.map((l) => <option key={l.location} value={l.location}>{l.location} ({l.n})</option>)}</Select>
        <span className="text-[12.5px] text-zinc-500">{data?.rows.length || 0} days in {year}</span>
        <span className="ml-auto flex flex-wrap gap-1">{data?.years.map((y) => <button key={y.y} onClick={() => setYear(y.y)} className={cn("rounded-md px-2 py-1 text-[12px]", y.y === year ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600")}>{y.y}</button>)}</span>
      </div>
      {data && !data.rows.length ? <Empty icon={CalendarDays} title={`Nothing for ${year} yet`} text="Download the Excel template, fill the year, and import it here."><div className="flex gap-2"><a href="/api/admin/calendar/file?type=template&format=xlsx"><Btn><FileSpreadsheet />Excel template</Btn></a><Btn kind="primary" onClick={() => setImp(true)}><Upload />Import</Btn></div></Empty> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{months.map((list, m) => (
          <Card key={m} className="p-4"><p className="mb-2 font-semibold">{new Date(year, m, 1).toLocaleDateString("en-GB", { month: "long" })}</p>
            {list.length ? <ul className="space-y-1">{list.map((e) => <li key={e.id}><button onClick={() => setEdit({ ...e, date: String(e.date).slice(0, 10) })} className="flex w-full items-start gap-2.5 rounded-md px-1.5 py-1 text-left hover:bg-zinc-50"><span className="w-6 shrink-0 text-right text-[12.5px] font-semibold tabular-nums text-zinc-500">{Number(String(e.date).slice(8, 10))}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium leading-snug">{e.title}</span>{(e.fasting || e.paran) && <span className="block text-[11.5px] text-zinc-500">{[e.fasting, e.paran && `Break fast ${e.paran}`].filter(Boolean).join(" · ")}</span>}</span><Badge tone={TONE[e.kind]}>{CAL_KINDS.find(([k]) => k === e.kind)?.[1]}</Badge></button></li>)}</ul> : <p className="text-[12.5px] text-zinc-400">—</p>}
          </Card>))}</div>)}
      {edit && <Modal title={edit.id ? "Edit day" : "Add a day"} onClose={() => setEdit(null)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date"><Input type="date" value={edit.date || ""} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
          <Field label="Kind"><Select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })}>{CAL_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
          <Field label="Event" className="sm:col-span-2"><Input value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="e.g. Rādhāṣṭamī" /></Field>
          <Field label="Fasting"><Input value={edit.fasting || ""} onChange={(e) => setEdit({ ...edit, fasting: e.target.value })} placeholder="e.g. Fast till noon" /></Field>
          <Field label="Break fast (pāraṇa)"><Input value={edit.paran || ""} onChange={(e) => setEdit({ ...edit, paran: e.target.value })} placeholder="06:10–09:45" /></Field>
          <Field label="Calendar for"><Input value={edit.location || ""} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></Field>
          <Field label="Link (optional)"><Input value={edit.link || ""} onChange={(e) => setEdit({ ...edit, link: e.target.value })} /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-between">{edit.id ? <Btn kind="danger" onClick={async () => { if (!confirm("Delete this day?")) return; await api(`/api/admin/calendar/${edit.id}`, "DELETE"); setEdit(null); load(); }}><Trash2 />Delete</Btn> : <span />}<div className="flex gap-2"><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn kind="primary" onClick={save}>Save</Btn></div></div>
      </Modal>}
      {imp && <Importer onClose={() => setImp(false)} onDone={() => { setImp(false); load(); }} year={year} />}
    </div>
  );
}

function Importer({ onClose, onDone, year }: { onClose: () => void; onDone: () => void; year: number }) {
  const [file, setFile] = useState<File | null>(null); const [replace, setReplace] = useState(""); const [busy, setBusy] = useState(false); const ref = useRef<HTMLInputElement>(null);
  return (
    <Modal title="Import the calendar" description="Choose an Excel (.xlsx) or CSV file made from the template. Days with the same date, event and place are updated instead of added twice." onClose={onClose}>
      <button onClick={() => ref.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 p-8 text-[13px] text-zinc-600 hover:border-zinc-400"><FileSpreadsheet className="size-6" />{file ? file.name : "Choose a file"}</button>
      <input ref={ref} type="file" accept=".xlsx,.csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <label className="mt-4 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!replace} onChange={(e) => setReplace(e.target.checked ? String(year) : "")} className="size-4 accent-zinc-900" />First remove all of {year} for the places in this file (use when sending a corrected full year)</label>
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!file} onClick={async () => { setBusy(true); const fd = new FormData(); fd.append("file", file!); try { const r = await api<{ added: number; updated: number; skipped: number }>(`/api/admin/calendar/file${replace ? `?replaceYear=${replace}` : ""}`, "POST", fd); toast(`${r.added} added, ${r.updated} updated${r.skipped ? `, ${r.skipped} rows skipped (no date or event)` : ""}.`); onDone(); } catch (e: any) { toast(e.message, true); setBusy(false); } }}><Upload />Import</Btn></div>
    </Modal>
  );
}
