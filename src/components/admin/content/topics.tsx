"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Network, Plus, Search, Trash2, ChevronRight, ExternalLink, X, Quote, Headphones, Clapperboard, FileText, Sparkles } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Empty, Modal, api, toast } from "../ui";

type Tp = { name: string; parent: string | null; description: string; counts: Record<string, number> };
type It = { id: string; t: string; kind: string; label: string; date?: string; topics?: string[] };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slug = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const total = (t: Tp) => Object.values(t.counts).reduce((a, b) => a + b, 0);
const TABLE: [string, string, any][] = [["excerpts", "Quotes & compilations", Quote], ["audios", "Lectures & kīrtanas", Headphones], ["videos", "Videos", Clapperboard], ["articles", "Articles", FileText]];
const ICON: Record<string, any> = Object.fromEntries(TABLE.map(([k, , I]) => [k, I]));

/** Tattva topics: a simple tree. Pick a topic, write a line about it, and tick what belongs to it. */
export function TopicsPanel() {
  const [all, setAll] = useState<Tp[] | null>(null); const [sel, setSel] = useState<string | null>(null); const [q, setQ] = useState(""); const [open, setOpen] = useState<Record<string, boolean>>({}); const [add, setAdd] = useState<string | null | false>(false);
  const load = useCallback(() => api<Tp[]>("/api/admin/topics").then(setAll).catch((e) => toast(e.message, true)), []);
  useEffect(() => { load(); }, [load]);
  const names = useMemo(() => new Set((all || []).map((t) => t.name)), [all]);
  const kids = useMemo(() => { const m: Record<string, Tp[]> = {}; (all || []).forEach((t) => (m[t.parent && names.has(t.parent) ? t.parent : ""] ||= []).push(t)); return m; }, [all, names]);
  const cur = all?.find((t) => t.name === sel) || null;
  const row = (t: Tp, d: number): React.ReactNode => { const ch = kids[t.name] || []; return (
    <div key={t.name}>
      <div className={`group flex items-center rounded-md ${sel === t.name ? "bg-zinc-100" : "hover:bg-zinc-50"}`} style={{ paddingLeft: d * 16 }}>
        <button onClick={() => setOpen((o) => ({ ...o, [t.name]: !o[t.name] }))} className={`flex size-7 items-center justify-center text-zinc-400 ${ch.length ? "" : "invisible"}`}><ChevronRight size={14} className={open[t.name] ? "rotate-90" : ""} /></button>
        <button onClick={() => setSel(t.name)} className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5 pr-2 text-left text-[13px]"><span className={`truncate ${sel === t.name ? "font-medium text-zinc-950" : "text-zinc-700"}`}>{t.name}</span><span className="text-[11.5px] tabular-nums text-zinc-400">{total(t) || ""}</span></button>
        <button title={`Add a topic inside ${t.name}`} onClick={() => setAdd(t.name)} className="mr-1 hidden size-6 items-center justify-center rounded text-zinc-400 hover:bg-white hover:text-zinc-900 group-hover:flex"><Plus size={13} /></button>
      </div>
      {open[t.name] && ch.map((c) => row(c, d + 1))}
    </div>); };
  return (
    <div>
      <PageHeader icon={Network} title="Tattva topics" description="Every subject on the website. Quotes, lectures, videos and articles are linked to topics, and each topic gets its own page.">
        <Btn kind="outline" onClick={() => window.open("/tattva", "_blank")}><ExternalLink />See on website</Btn>
        <Btn kind="primary" onClick={() => setAdd(null)}><Plus />New topic</Btn>
      </PageHeader>
      {all && !all.length ? (
        <Card className="p-8"><Empty icon={Network} title="No topics yet" text="Start with a ready list of main tattvas (Kṛṣṇa-tattva, Guru-tattva, Bhakti…) and their sub-topics. You can rename or remove any of them later."><div className="mt-4 flex justify-center gap-2"><Btn kind="primary" onClick={async () => { await api("/api/admin/topics", "POST", { seed: true }); toast("Starter topics added."); load(); }}><Sparkles />Add starter topics</Btn><Btn kind="outline" onClick={() => setAdd(null)}><Plus />Start empty</Btn></div></Empty></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="p-3">
            <label className="relative mb-2 block"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Find among ${all?.length ?? "…"} topics`} className="pl-8" /></label>
            <div className="max-h-[68vh] overflow-y-auto">
              {q ? (all || []).filter((t) => fold(t.name).includes(fold(q))).map((t) => <button key={t.name} onClick={() => setSel(t.name)} className={`flex w-full justify-between rounded-md px-2 py-1.5 text-left text-[13px] ${sel === t.name ? "bg-zinc-100 font-medium" : "hover:bg-zinc-50"}`}><span className="truncate">{t.name}</span><span className="text-[11.5px] text-zinc-400">{total(t) || ""}</span></button>) : (kids[""] || []).map((t) => row(t, 0))}
            </div>
          </Card>
          {cur ? <TopicEditor key={cur.name} t={cur} all={all || []} onChange={(n) => { if (n !== undefined) setSel(n); load(); }} /> : <Card className="flex min-h-[300px] items-center justify-center p-8 text-center text-[13px] text-zinc-500">Choose a topic on the left to edit it,<br />or click <b className="mx-1">New topic</b>.</Card>}
        </div>
      )}
      {add !== false && <NewTopic parent={add} all={all || []} onClose={() => setAdd(false)} onDone={(n, p) => { setAdd(false); if (p) setOpen((o) => ({ ...o, [p]: true })); setSel(n); load(); }} />}
    </div>
  );
}

function NewTopic({ parent, all, onClose, onDone }: { parent: string | null; all: Tp[]; onClose: () => void; onDone: (n: string, p: string | null) => void }) {
  const [name, setName] = useState(""); const [p, setP] = useState(parent || ""); const [d, setD] = useState(""); const [busy, setBusy] = useState(false);
  const save = async () => { if (!name.trim()) return; setBusy(true); try { await api("/api/admin/topics", "POST", { name: name.trim(), parent: p || null, description: d }); onDone(name.trim(), p || null); } catch (e: any) { toast(e.message, true); setBusy(false); } };
  return (
    <Modal title="New topic" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name"><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="e.g. The Holy Name" /></Field>
        <Field label="Inside" hint="Leave as “Main topic” for a top-level tattva."><Select value={p} onChange={(e) => setP(e.target.value)}><option value="">Main topic</option>{all.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}</Select></Field>
        <Field label="A line about it (optional)"><Textarea value={d} onChange={(e) => setD(e.target.value)} rows={2} /></Field>
        <div className="flex justify-end gap-2"><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} onClick={save}>Add topic</Btn></div>
      </div>
    </Modal>
  );
}

function TopicEditor({ t, all, onChange }: { t: Tp; all: Tp[]; onChange: (newName?: string) => void }) {
  const [name, setName] = useState(t.name); const [desc, setDesc] = useState(t.description); const [items, setItems] = useState<It[] | null>(null);
  const [table, setTable] = useState("excerpts"); const [find, setFind] = useState(""); const [res, setRes] = useState<It[] | null>(null);
  const loadItems = useCallback(() => api<It[]>(`/api/admin/topics?items=${encodeURIComponent(t.name)}`).then(setItems).catch(() => setItems([])), [t.name]);
  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { if (find.trim().length < 2) { setRes(null); return; } const h = setTimeout(() => api<It[]>(`/api/admin/topics?table=${table}&find=${encodeURIComponent(find)}`).then(setRes).catch(() => setRes([])), 250); return () => clearTimeout(h); }, [find, table]);
  const patch = async (b: any, msg = "Saved.") => { try { await api("/api/admin/topics", "PATCH", { name: t.name, ...b }); toast(msg); onChange(b.to); } catch (e: any) { toast(e.message, true); } };
  const link = async (i: It, on: boolean) => { try { await api("/api/admin/topics", "POST", { link: { t: i.t, id: i.id, name: t.name, on } }); loadItems(); setRes((r) => r?.map((x) => x.id === i.id ? { ...x, topics: on ? [...(x.topics || []), t.name] : (x.topics || []).filter((y) => y !== t.name) } : x) || null); } catch (e: any) { toast(e.message, true); } };
  const below = (n: string): string[] => all.filter((x) => x.parent === n).flatMap((x) => [x.name, ...below(x.name)]);
  const banned = new Set([t.name, ...below(t.name)]);
  const linked = new Set((items || []).map((i) => i.id));
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" hint="Renaming changes it everywhere it is used."><Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name.trim() !== t.name && patch({ to: name.trim() }, "Renamed everywhere.")} /></Field>
          <Field label="Inside"><Select value={t.parent || ""} onChange={(e) => patch({ parent: e.target.value || null }, "Moved.")}><option value="">Main topic</option>{all.filter((x) => !banned.has(x.name)).map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}</Select></Field>
        </div>
        <Field label="About this topic" hint="Shown at the top of the topic page." className="mt-4"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={() => desc !== t.description && patch({ description: desc })} rows={2} /></Field>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">{TABLE.map(([k, l]) => <Badge key={k} tone="outline">{l}: {t.counts[k] || 0}</Badge>)}</div>
          <div className="flex gap-2"><Btn size="sm" kind="outline" onClick={() => window.open(`/tattva/${slug(t.name)}`, "_blank")}><ExternalLink />Open page</Btn>
            <Btn size="sm" kind="outline" className="text-red-600" onClick={async () => { if (!confirm(`Remove the topic “${t.name}”? Quotes and lectures stay; only this topic is taken off them.`)) return; await api("/api/admin/topics", "DELETE", { name: t.name }); toast("Topic removed."); onChange(""); }}><Trash2 />Remove</Btn></div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[14px] font-semibold text-zinc-950">Add things to “{t.name}”</p>
        <p className="mt-0.5 text-[12.5px] text-zinc-500">Choose what to look in, type a few words, and tick what belongs here.</p>
        <div className="mt-3 flex flex-wrap gap-2"><Select value={table} onChange={(e) => setTable(e.target.value)} className="w-auto">{TABLE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select><label className="relative min-w-[200px] flex-1"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Type words from the title or text" className="pl-8" /></label></div>
        {res && <div className="mt-3 max-h-[320px] divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200">{res.length ? res.map((i) => { const on = linked.has(i.id) || !!i.topics?.includes(t.name); return <label key={i.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] hover:bg-zinc-50"><input type="checkbox" checked={on} onChange={() => link(i, !on)} className="size-4 accent-zinc-900" /><span className="min-w-0 flex-1 truncate">{i.label}</span><span className="text-[11.5px] text-zinc-400">{i.kind}</span></label>; }) : <p className="p-4 text-center text-[12.5px] text-zinc-500">Nothing found.</p>}</div>}
      </Card>

      <Card className="p-5">
        <p className="text-[14px] font-semibold text-zinc-950">On this topic now <span className="font-normal text-zinc-400">{items?.length ?? ""}</span></p>
        {items && !items.length && <p className="mt-2 text-[12.5px] text-zinc-500">Nothing linked yet. Use the box above.</p>}
        <div className="mt-2 divide-y divide-zinc-100">{(items || []).map((i) => { const I = ICON[i.t] || Quote; return <div key={i.id} className="group flex items-center gap-3 py-2 text-[13px]"><I className="size-4 shrink-0 text-zinc-400" /><span className="min-w-0 flex-1 truncate text-zinc-800">{i.label}</span><span className="text-[11.5px] text-zinc-400">{i.kind}</span><button title="Take off this topic" onClick={() => link(i, false)} className="flex size-6 items-center justify-center rounded text-zinc-400 opacity-0 hover:bg-zinc-100 hover:text-red-600 group-hover:opacity-100"><X size={14} /></button></div>; })}</div>
      </Card>
    </div>
  );
}
