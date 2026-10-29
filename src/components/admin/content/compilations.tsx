"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Quote, Plus, Search, Trash2, Eye, EyeOff, Tag, Upload, ScrollText, BookHeart, ListChecks, Flower2, Droplet, Lightbulb, MessageCircleQuestion, HeartHandshake, Gift } from "lucide-react";
import { durText, parseDur } from "@/lib/content/text";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, api, toast, cn } from "../ui";
import { LecturePicker, TopicsInput } from "./shared";

/** Every kind of compilation and which fields it uses. */
export const KINDS: { k: string; label: string; one: string; icon: any; fields: string[]; route: string }[] = [
  { k: "quote", label: "Quotes", one: "quote", icon: Quote, fields: ["text", "source", "lecture", "verse_ref", "topics"], route: "/teachings/quotes" },
  { k: "verse", label: "Verses", one: "verse", icon: ScrollText, fields: ["verse_ref", "original", "transliteration", "translation", "text", "lecture", "topics"], route: "/teachings/verses" },
  { k: "story", label: "Stories & anecdotes", one: "story", icon: BookHeart, fields: ["title", "text", "source", "lecture", "topics"], route: "/teachings/stories" },
  { k: "instruction", label: "Instructions", one: "instruction", icon: ListChecks, fields: ["text", "source", "lecture", "topics"], route: "/teachings/instructions" },
  { k: "desire", label: "Desires", one: "desire", icon: Flower2, fields: ["text", "source", "lecture", "topics"], route: "/teachings/desires" },
  { k: "nectar", label: "Nectar drops", one: "nectar drop", icon: Droplet, fields: ["text", "source", "lecture", "day", "topics"], route: "/teachings/nectar-drops" },
  { k: "analogy", label: "Analogies", one: "analogy", icon: Lightbulb, fields: ["title", "text", "source", "lecture", "topics"], route: "/teachings/analogies" },
  { k: "qa", label: "Questions & answers", one: "question", icon: MessageCircleQuestion, fields: ["title", "text", "source", "lecture", "topics"], route: "/teachings/questions-and-answers" },
  { k: "memory", label: "Memories", one: "memory", icon: HeartHandshake, fields: ["title", "text", "author", "date", "topics"], route: "/gurudeva/memories" },
  { k: "glorification", label: "Glorifications", one: "glorification", icon: Gift, fields: ["title", "text", "author", "date", "topics"], route: "/gurudeva/glorifications" },
];
const LBL: Record<string, string> = { title: "Title", text: "Text", source: "Source (lecture, place, date)", verse_ref: "Verse reference", original: "Original verse", transliteration: "Transliteration", translation: "Translation", author: "Offered by", date: "Date" };
type R = { id: string; kind: string; title: string; text: string; source: string | null; verse_ref: string | null; author: string | null; date: string | null; topics: string[]; status: string; lecture: string | null; at_sec: number | null };

export function CompilationsPanel() {
  const [kind, setKind] = useState("quote"); const def = KINDS.find((x) => x.k === kind)!;
  const [q, setQ] = useState(""); const [qq, setQq] = useState(""); const t = useRef<any>(null); const [page, setPage] = useState(1);
  const [data, setData] = useState<{ rows: R[]; total: number; kinds: { kind: string; n: number }[] } | null>(null);
  const [edit, setEdit] = useState<string | null>(null); const [sel, setSel] = useState<Set<string>>(new Set()); const [imp, setImp] = useState(false);
  const load = useCallback(() => { const u = new URLSearchParams({ kind, page: String(page), ...(q && { q }) }); api(`/api/admin/excerpts?${u}`).then(setData).catch((e) => toast(e.message, true)); }, [kind, q, page]);
  useEffect(() => { load(); }, [load]);
  const n = (k: string) => data?.kinds.find((x) => x.kind === k)?.n || 0;
  const bulk = async (b: any, m: string) => { await api("/api/admin/excerpts/bulk", "POST", { ids: [...sel], ...b }).then(() => { toast(m); setSel(new Set()); load(); }).catch((e) => toast(e.message, true)); };
  return (
    <div>
      <PageHeader icon={Quote} title="Compilations" description="Small pieces taken from the lectures, each tied to its source and minute, so each can be found by search and shown on its own.">
        <Btn onClick={() => setImp(true)}><Upload />Import</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a {def.one}</Btn>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="space-y-0.5">{KINDS.map((x) => <button key={x.k} onClick={() => { setKind(x.k); setPage(1); setSel(new Set()); }} className={cn("flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-[13px]", kind === x.k ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-600 hover:bg-zinc-50")}><x.icon className="size-4 text-zinc-500" /><span className="flex-1 text-left">{x.label}</span><span className="text-[11.5px] tabular-nums text-zinc-400">{n(x.k) || ""}</span></button>)}</nav>
        <div>
          <div className="mb-3 relative"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={qq} onChange={(e) => { setQq(e.target.value); clearTimeout(t.current); t.current = setTimeout(() => { setQ(e.target.value); setPage(1); }, 300); }} placeholder={`Search ${def.label.toLowerCase()} (no diacritics needed)`} className="pl-8" /></div>
          {sel.size > 0 && <BulkTopics n={sel.size} bulk={bulk} onClear={() => setSel(new Set())} />}
          {data && !data.rows.length ? <Empty icon={def.icon} title={`No ${def.label.toLowerCase()} yet`} text="Add them one by one while listening, or import a spreadsheet."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a {def.one}</Btn></Empty> : (
            <Card className="divide-y divide-zinc-100">{data?.rows.map((r) => (
              <div key={r.id} className={cn("flex gap-3 px-4 py-3.5 hover:bg-zinc-50", sel.has(r.id) && "bg-zinc-50")}>
                <input type="checkbox" checked={sel.has(r.id)} onChange={() => setSel((s) => { const x = new Set(s); if (x.has(r.id)) x.delete(r.id); else x.add(r.id); return x; })} className="mt-1 size-4 accent-zinc-900" />
                <button onClick={() => setEdit(r.id)} className="min-w-0 flex-1 text-left">
                  {(r.title || r.verse_ref) && <p className="text-[13px] font-medium">{r.title || r.verse_ref}</p>}
                  <p className={cn("line-clamp-2 text-[13px] leading-relaxed", r.title ? "text-zinc-600" : "text-zinc-900")}>{r.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-zinc-500">{r.lecture ? <span>🎧 {r.lecture}{r.at_sec ? ` · ${durText(r.at_sec)}` : ""}</span> : r.source || r.author}{r.topics?.map((x) => <Badge key={x} tone="outline">{x}</Badge>)}{r.status !== "published" && <Badge>Hidden</Badge>}</p>
                </button>
              </div>))}</Card>)}
          {data && data.total > 60 && <div className="mt-4 flex justify-center gap-2"><Btn size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn><span className="self-center text-[12.5px] text-zinc-500">Page {page} of {Math.ceil(data.total / 60)}</span><Btn size="sm" disabled={page * 60 >= data.total} onClick={() => setPage(page + 1)}>Next</Btn></div>}
        </div>
      </div>
      {edit && <ExcerptEditor id={edit} def={def} onClose={() => setEdit(null)} onSaved={load} />}
      {imp && <ExcerptImport def={def} onClose={() => setImp(false)} onDone={() => { setImp(false); load(); }} />}
    </div>
  );
}

function BulkTopics({ n, bulk, onClear }: { n: number; bulk: (b: any, m: string) => void; onClear: () => void }) {
  const [t, setT] = useState("");
  return <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12.5px]"><b>{n} selected</b><Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Topic" className="!h-8 !w-44" /><Btn size="sm" onClick={() => t && bulk({ addTopic: t }, "Topic added.")}><Tag />Add topic</Btn>
    <Btn size="sm" onClick={() => bulk({ set: { status: "published" } }, "Live.")}><Eye />Make live</Btn><Btn size="sm" onClick={() => bulk({ set: { status: "draft" } }, "Hidden.")}><EyeOff />Hide</Btn><Btn size="sm" kind="danger" onClick={() => confirm(`Delete ${n}?`) && bulk({ delete: true }, "Deleted.")}><Trash2 />Delete</Btn><button onClick={onClear} className="ml-auto text-zinc-500">Clear</button></div>;
}

function ExcerptEditor({ id, def, onClose, onSaved }: { id: string; def: (typeof KINDS)[number]; onClose: () => void; onSaved: () => void }) {
  const [e, setE] = useState<any>(id === "new" ? { kind: def.k, topics: [], status: "published", text: "" } : null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (id !== "new") api(`/api/admin/excerpts/${id}`).then((r) => setE({ ...r, date: r.date?.slice(0, 10) || "" })).catch((x) => toast(x.message, true)); }, [id]);
  if (!e) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, v: any) => setE((p: any) => ({ ...p, [k]: v })); const d = KINDS.find((x) => x.k === e.kind) || def;
  const save = async (again = false) => { setBusy(true); try { if (id === "new") await api("/api/admin/excerpts", "POST", e); else await api(`/api/admin/excerpts/${id}`, "PATCH", e); toast("Saved."); onSaved(); if (again) setE({ kind: e.kind, topics: e.topics, status: "published", text: "", audio_id: e.audio_id, lecture: e.lecture, source: e.source }); else onClose(); } catch (x: any) { toast(x.message, true); } finally { setBusy(false); } };
  const big = (k: string) => ["text", "original", "transliteration", "translation"].includes(k);
  return (
    <Sheet width="max-w-2xl" title={id === "new" ? `New ${d.one}` : e.title || e.verse_ref || d.one} onClose={onClose} actions={<>{id === "new" && <Btn size="sm" busy={busy} onClick={() => save(true)}>Save and add another</Btn>}<Btn size="sm" kind="primary" busy={busy} onClick={() => save()}>Save</Btn></>}>
      <div className="space-y-5 p-5">
        <Field label="Kind"><Select value={e.kind} onChange={(x) => set("kind", x.target.value)}>{KINDS.map((k) => <option key={k.k} value={k.k}>{k.label}</option>)}</Select></Field>
        {d.fields.map((f) => f === "lecture" ? (
          <div key={f} className="grid gap-4 sm:grid-cols-[1fr_140px]"><Field label="From which lecture" hint="Readers can jump to this minute of the recording."><LecturePicker value={e.audio_id} label={e.lecture} onChange={(id, t) => setE((p: any) => ({ ...p, audio_id: id, lecture: t }))} /></Field><Field label="At minute"><Input value={durText(e.at_sec)} onChange={(x) => set("at_sec", parseDur(x.target.value))} placeholder="23:15" /></Field></div>
        ) : f === "topics" ? <Field key={f} label="Topics"><TopicsInput value={e.topics || []} onChange={(v) => set("topics", v)} /></Field>
          : f === "day" ? <Field key={f} label="Day of the year to show it" hint="For the daily nectar drop. Leave empty to use it at random."><Input type="number" min={1} max={366} value={e.day_of_year ?? ""} onChange={(x) => set("day_of_year", x.target.value)} /></Field>
          : f === "date" ? <Field key={f} label="Date"><Input type="date" value={e.date || ""} onChange={(x) => set("date", x.target.value)} /></Field>
          : <Field key={f} label={f === "text" && d.k === "verse" ? "His explanation" : f === "text" ? (d.k === "qa" ? "Answer" : d.one[0].toUpperCase() + d.one.slice(1)) : f === "title" && d.k === "qa" ? "Question" : LBL[f]}>{big(f) ? <Textarea rows={f === "text" ? 6 : 3} value={e[f] || ""} onChange={(x) => set(f, x.target.value)} className={f === "original" ? "text-[14.5px]" : ""} /> : <Input value={e[f] || ""} onChange={(x) => set(f, x.target.value)} />}</Field>)}
        <Field label="Shown on the website"><Select value={e.status} onChange={(x) => set("status", x.target.value)}><option value="published">Yes, live</option><option value="draft">No, hidden</option></Select></Field>
        {id !== "new" && <div className="flex justify-end border-t border-zinc-200 pt-4"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this entry?")) return; await api(`/api/admin/excerpts/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
    </Sheet>
  );
}

function ExcerptImport({ def, onClose, onDone }: { def: (typeof KINDS)[number]; onClose: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<string[][] | null>(null); const [map, setMap] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  const cols = [...def.fields.filter((f) => f !== "lecture" && f !== "day"), ...(def.fields.includes("day") ? ["day_of_year"] : [])];
  const read = async (f: File) => { const text = await f.text(); const sep = (text.split("\n")[0].match(/\t/g)?.length || 0) > 0 ? "\t" : ","; const r = text.split(/\r?\n/).filter((l) => l.trim()).map((l) => { const out: string[] = []; let c = "", q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"' && l[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; } else if (ch === '"') q = true; else if (ch === sep) { out.push(c); c = ""; } else c += ch; } out.push(c); return out; });
    setRows(r); setMap((r[0] || []).map((h) => cols.find((c) => h.toLowerCase().replace(/[^a-z]/g, "").startsWith(c.replace(/_/g, "").slice(0, 4))) || "")); };
  return (
    <Modal wide title={`Import ${def.label.toLowerCase()}`} description="A CSV with one entry per row. Topics can be separated by semicolons." onClose={onClose}>
      <input type="file" accept=".csv,.tsv,.txt" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="text-[13px]" />
      {rows && <><div className="mt-4 max-h-[40vh] overflow-auto rounded-lg border border-zinc-200">{(rows[0] || []).map((h, i) => <div key={i} className="grid grid-cols-[1fr_1fr_200px] items-center gap-2 border-b border-zinc-100 px-3 py-2 text-[12.5px]"><b>{h}</b><span className="truncate text-zinc-500">{rows[1]?.[i]}</span><Select className="!h-8" value={map[i] || ""} onChange={(e) => setMap(map.map((m, j) => (j === i ? e.target.value : m)))}><option value="">Skip</option>{cols.map((c) => <option key={c} value={c}>{LBL[c] || c}</option>)}</Select></div>)}</div>
        <div className="mt-4 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} onClick={async () => { setBusy(true); const items = rows.slice(1).map((r) => { const o: any = { kind: def.k }; map.forEach((k, i) => { if (k && r[i]?.trim()) o[k] = k === "topics" ? r[i].split(/[;|]/).map((x) => x.trim()) : r[i].trim(); }); return o; });
          let added = 0; for (let i = 0; i < items.length; i += 300) added += (await api<{ added: number }>("/api/admin/excerpts/bulk", "POST", { import: items.slice(i, i + 300) })).added; toast(`${added} added.`); onDone(); }}><Upload />Import {rows.length - 1}</Btn></div></>}
    </Modal>
  );
}
