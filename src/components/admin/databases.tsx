"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Database as Db, ArrowLeft } from "lucide-react";
import { Btn, Field, Input, Modal, Select, Textarea, api, toast } from "./ui";

const TYPES = [["text", "Long text"], ["short", "Short text"], ["number", "Number"], ["date", "Date"], ["link", "Web link"], ["image", "Picture address"], ["select", "Choice"]];
const keyOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field";

export function DatabasesList() {
  const [rows, setRows] = useState<any[] | null>(null); const [name, setName] = useState<string | null>(null);
  const load = () => api<any[]>("/api/admin/dbs").then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-[28px] font-bold tracking-[-0.03em]">Databases</h1><p className="text-ink-3">Tables of your own records: quotes, lectures, places, anything. Show them on any page.</p></div><Btn kind="primary" onClick={() => setName("")}><Plus size={16} />New database</Btn></div>
      <div className="grid gap-3 sm:grid-cols-2">{!rows ? <p className="text-ink-3">Loading…</p> : rows.length ? rows.map((d) => <Link key={d.id} href={`/admin/databases/${d.id}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-saffron-soft text-saffron"><Db size={20} /></span><span><b className="block">{d.name}</b><span className="text-[13px] text-ink-3">{d.rows} records</span></span></Link>) : <p className="card p-8 text-center text-ink-3 sm:col-span-2">No databases yet.</p>}</div>
      {name !== null && <Modal title="New database" onClose={() => setName(null)}><Field label="Name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Quotes" /></Field>
        <div className="mt-4 flex justify-end gap-2"><Btn onClick={() => setName(null)}>Cancel</Btn><Btn kind="primary" onClick={async () => { try { const r = await api<{ id: string }>("/api/admin/dbs", "POST", { name, fields: [{ key: "text", label: "Text", type: "text" }, { key: "source", label: "Source", type: "short" }] }); window.location.href = `/admin/databases/${r.id}`; } catch (e: any) { toast(e.message, true); } }}>Create</Btn></div></Modal>}
    </div>
  );
}

export function DatabaseEditor({ id }: { id: string }) {
  const [d, setD] = useState<any>(null); const [rows, setRows] = useState<any[]>([]); const [ed, setEd] = useState<any | null>(null); const [fieldsOpen, setFO] = useState(false);
  const load = () => api<{ db: any; rows: any[] }>(`/api/admin/dbs/${id}`).then((r) => { setD(r.db); setRows(r.rows); }).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, [id]); // eslint-disable-line
  if (!d) return <p className="text-ink-3">Loading…</p>;
  const fields: any[] = d.fields || [];
  const saveRow = async () => { try { ed.id ? await api(`/api/admin/dbs/${id}/rows`, "PATCH", { row: ed.id, title: ed.title, data: ed.data, status: ed.status }) : await api(`/api/admin/dbs/${id}/rows`, "POST", { title: ed.title, data: ed.data }); setEd(null); load(); toast("Saved."); } catch (e: any) { toast(e.message, true); } };
  return (
    <div>
      <Link href="/admin/databases" className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-saffron"><ArrowLeft size={15} />All databases</Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-[28px] font-bold tracking-[-0.03em]">{d.name}</h1><div className="flex gap-2"><Btn onClick={() => setFO(true)}>Columns</Btn><Btn kind="primary" onClick={() => setEd({ title: "", data: {}, status: "published" })}><Plus size={16} />Add a record</Btn></div></div>
      <div className="card overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[14px]"><thead className="bg-band/70 text-[12.5px] text-ink-3"><tr><th className="px-4 py-2.5">Title</th>{fields.slice(0, 3).map((f) => <th key={f.key} className="px-4 py-2.5">{f.label}</th>)}<th /></tr></thead>
        <tbody className="divide-y divide-line">{rows.map((r) => <tr key={r.id} className="cursor-pointer hover:bg-band/50" onClick={() => setEd(r)}><td className="px-4 py-2.5 font-medium">{r.title}</td>{fields.slice(0, 3).map((f) => <td key={f.key} className="max-w-[260px] truncate px-4 py-2.5 text-ink-2">{String(r.data?.[f.key] ?? "")}</td>)}
          <td className="px-3"><button onClick={async (e) => { e.stopPropagation(); if (confirm("Delete this record?")) { await api(`/api/admin/dbs/${id}/rows`, "DELETE", { row: r.id }); load(); } }} className="text-[#a3281e]"><Trash2 size={15} /></button></td></tr>)}
          {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-ink-3">No records yet.</td></tr>}</tbody></table></div>
      {ed && <Modal title={ed.id ? "Edit record" : "New record"} wide onClose={() => setEd(null)}><div className="space-y-3.5">
        <Field label="Title"><Input value={ed.title} onChange={(e) => setEd({ ...ed, title: e.target.value })} /></Field>
        {fields.map((f) => <Field key={f.key} label={f.label}>{f.type === "text" ? <Textarea value={ed.data?.[f.key] ?? ""} onChange={(e) => setEd({ ...ed, data: { ...ed.data, [f.key]: e.target.value } })} /> : f.type === "select" ? <Select value={ed.data?.[f.key] ?? ""} onChange={(e) => setEd({ ...ed, data: { ...ed.data, [f.key]: e.target.value } })}><option value="">—</option>{(f.options || []).map((o: string) => <option key={o}>{o}</option>)}</Select> : <Input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={ed.data?.[f.key] ?? ""} onChange={(e) => setEd({ ...ed, data: { ...ed.data, [f.key]: e.target.value } })} />}</Field>)}
        {ed.id && <Field label="Visible on the website"><Select value={ed.status} onChange={(e) => setEd({ ...ed, status: e.target.value })}><option value="published">Yes</option><option value="draft">Hidden (draft)</option></Select></Field>}
        <div className="flex justify-end gap-2"><Btn onClick={() => setEd(null)}>Cancel</Btn><Btn kind="primary" onClick={saveRow}>Save</Btn></div></div></Modal>}
      {fieldsOpen && <ColumnsModal d={d} onClose={() => setFO(false)} onSaved={() => { setFO(false); load(); }} />}
    </div>
  );
}

function ColumnsModal({ d, onClose, onSaved }: { d: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any[]>(d.fields || []); const [name, setName] = useState(d.name);
  const up = (i: number, p: any) => setF(f.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <Modal title="Columns" onClose={onClose} wide><div className="space-y-3">
      <Field label="Database name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      {f.map((c, i) => <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_170px_auto]"><Input value={c.label} onChange={(e) => up(i, { label: e.target.value, key: c.key && d.fields?.[i] ? c.key : keyOf(e.target.value) })} placeholder="Column name" />
        <Select value={c.type} onChange={(e) => up(i, { type: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
        <button onClick={() => setF(f.filter((_, j) => j !== i))} className="px-2 text-[#a3281e]"><Trash2 size={16} /></button>
        {c.type === "select" && <Input className="sm:col-span-3" value={(c.options || []).join(", ")} onChange={(e) => up(i, { options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Choices, separated by commas" />}</div>)}
      <Btn onClick={() => setF([...f, { key: `field_${f.length + 1}`, label: "", type: "short" }])}><Plus size={15} />Add a column</Btn>
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" onClick={async () => { try { await api(`/api/admin/dbs/${d.id}`, "PATCH", { name, fields: f.filter((x) => x.label) }); toast("Saved."); onSaved(); } catch (e: any) { toast(e.message, true); } }}>Save columns</Btn></div></div></Modal>
  );
}
