"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, BookOpen, FileText, ChevronRight } from "lucide-react";
import { TEMPLATES } from "@/lib/cms/blocks";
import { Btn, Field, Input, Modal, Select, api, toast } from "./ui";

type Row = { id: string; parent_id: string | null; title: string; path: string; type: string; status: string; updated_at: string };

export function PagesManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mk, setMk] = useState<null | { parent?: string }>(null);
  const sp = useSearchParams();
  const load = () => api<Row[]>("/api/admin/pages").then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); if (sp.get("new")) setMk({}); }, []); // eslint-disable-line
  const depth = (p: string) => p.split("/").length - 2;
  const del = async (r: Row) => { if (!confirm(`Delete “${r.title}” and everything inside it?`)) return; await api(`/api/admin/pages/${r.id}`, "DELETE").catch((e) => toast(e.message, true)); load(); };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-[26px] font-bold tracking-[-0.03em]">Pages & books</h1><p className="text-ink-3">Click a page to edit it exactly as visitors see it.</p></div><Btn kind="primary" onClick={() => setMk({})}><Plus size={16} />New page</Btn></div>
      <div className="card divide-y divide-line">
        {!rows ? <p className="p-5 text-ink-3">Loading…</p> : !rows.length ? <p className="p-6 text-ink-3">No pages yet. Press “New page” and pick a template.</p> : rows.map((r) => (
          <div key={r.id} className="group flex items-center gap-2 px-3 py-2.5 hover:bg-band/60" style={{ paddingLeft: 12 + depth(r.path) * 22 }}>
            {depth(r.path) > 0 && <ChevronRight size={13} className="text-ink-3" />}
            {r.type === "book" ? <BookOpen size={17} className="text-saffron" /> : <FileText size={17} className="text-ink-3" />}
            <Link href={`/admin/pages/${r.id}`} className="min-w-0 flex-1"><span className="font-medium">{r.title}</span> <span className="ml-1 text-[11.5px] text-ink-3">{r.path}</span></Link>
            <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${r.status === "published" ? "bg-[#e3f3e6] text-[#256a39]" : "bg-[#fbeccf] text-[#8a5a0a]"}`}>{r.status === "published" ? "Live" : "Draft"}</span>
            <button onClick={() => setMk({ parent: r.id })} title="Add a page or chapter inside" className="rounded-lg p-1.5 text-ink-3 opacity-0 hover:bg-white group-hover:opacity-100"><Plus size={16} /></button>
            <button onClick={() => del(r)} title="Delete" className="rounded-lg p-1.5 text-[#a3281e] opacity-0 hover:bg-white group-hover:opacity-100"><Trash2 size={15} /></button>
          </div>))}
      </div>
      {mk && <NewPage parent={mk.parent} rows={rows || []} onClose={() => setMk(null)} />}
    </div>
  );
}

function NewPage({ parent, rows, onClose }: { parent?: string; rows: Row[]; onClose: () => void }) {
  const [tpl, setTpl] = useState("article"); const [title, setTitle] = useState(""); const [par, setPar] = useState(parent || ""); const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { const r = await api<{ id: string }>("/api/admin/pages", "POST", { template: tpl, title: title || undefined, parent_id: par || null }); window.location.href = `/admin/pages/${r.id}`; } catch (e: any) { toast(e.message, true); setBusy(false); } };
  return (
    <Modal title="New page" onClose={onClose} wide>
      <div className="grid gap-2 sm:grid-cols-2">{TEMPLATES.map((t) => <button key={t.key} onClick={() => setTpl(t.key)} className={`rounded-2xl border p-3.5 text-left transition ${tpl === t.key ? "border-saffron bg-saffron-soft/60" : "border-line hover:bg-band/60"}`}><b className="block text-[13.5px]">{t.name}</b><span className="text-[12px] text-ink-3">{t.desc}</span></button>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Name"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave empty for a default name" /></Field>
        <Field label="Put it inside"><Select value={par} onChange={(e) => setPar(e.target.value)}><option value="">Top level</option>{rows.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</Select></Field></div>
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} onClick={go}>Create and open</Btn></div>
    </Modal>
  );
}
