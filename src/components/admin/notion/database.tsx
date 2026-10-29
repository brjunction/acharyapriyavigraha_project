"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Table2, Kanban, LayoutGrid, List, CalendarDays, Filter, ArrowUpDown, Search, X, Trash2, ChevronLeft, ChevronRight, Maximize2,
  Type, Hash, CircleDot, Tags, Calendar, CheckSquare, Link2, Paperclip, Headphones, Video, GitMerge, EyeOff, ArrowLeft, ArrowRight, Globe, MoreHorizontal, Copy,
} from "lucide-react";
import { COLORS, OPTION_COLORS, opts, type Opt } from "@/lib/cms/colors";
import { api, toast } from "../ui";
import { MediaPicker } from "../media-picker";

const NotionEditor = dynamic(() => import("./editor"), { ssr: false });

export type Field = { key: string; label: string; type: string; options?: any[]; relation?: string; hidden?: boolean };
type Row = { id: string; slug: string; title: string; data: Record<string, any>; status: string; position: number };
type Cond = { key: string; op: string; value: string };
type View = { id: string; name: string; type: "table" | "board" | "gallery" | "list" | "calendar"; filters: Cond[]; sorts: { key: string; dir: "asc" | "desc" }[]; groupBy?: string; dateKey?: string; hidden?: string[] };
type Db = { id: string; slug: string; name: string; fields: Field[]; views: View[]; settings: Record<string, any>; public: boolean };

/** Old names are read as the new ones. */
const norm = (t: string) => ({ short: "text", link: "url", image: "file" } as Record<string, string>)[t] || t;
export const TYPES: [string, string, any][] = [
  ["text", "Text", Type], ["number", "Number", Hash], ["select", "Select", CircleDot], ["multi", "Multi-select", Tags], ["date", "Date", Calendar],
  ["checkbox", "Checkbox", CheckSquare], ["url", "Link", Link2], ["file", "Picture or file", Paperclip], ["audio", "Audio", Headphones], ["video", "Video", Video], ["relation", "Link to another database", GitMerge],
];
const VIEW_ICON = { table: Table2, board: Kanban, gallery: LayoutGrid, list: List, calendar: CalendarDays } as const;
const typeIcon = (t: string) => TYPES.find((x) => x[0] === norm(t))?.[2] || Type;
const uid = () => Math.random().toString(36).slice(2, 10);
const keyOf = (s: string, taken: string[]) => { let k = s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field"; let n = 1; const b = k; while (taken.includes(k)) k = `${b}_${++n}`; return k; };
const Pill = ({ o }: { o: Opt }) => <span className="inline-flex max-w-full truncate rounded px-1.5 py-[1px] text-[12.5px]" style={{ background: COLORS[o.color]?.bg, color: COLORS[o.color]?.text }}>{o.name}</span>;
const fmtDate = (v: string) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function useOutside(ref: React.RefObject<HTMLElement | null>, fn: () => void) {
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) fn(); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [ref, fn]);
}
function Pop({ children, onClose, className = "" }: { children: React.ReactNode; onClose: () => void; className?: string }) {
  const r = useRef<HTMLDivElement>(null); useOutside(r, onClose);
  return <div ref={r} className={`absolute z-40 mt-1 rounded-xl border border-line bg-white p-1.5 text-[13.5px] shadow-[0_16px_40px_-12px_rgba(40,20,5,.35)] ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------ values */
function show(v: any, f: Field, rel: Record<string, Row[]>): React.ReactNode {
  const t = norm(f.type);
  if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return null;
  if (t === "select") { const o = opts(f.options).find((x) => x.name === v) || { name: String(v), color: "gray" }; return <Pill o={o} />; }
  if (t === "multi") return <span className="flex flex-wrap gap-1">{(Array.isArray(v) ? v : [v]).map((n: string) => <Pill key={n} o={opts(f.options).find((x) => x.name === n) || { name: n, color: "gray" }} />)}</span>;
  if (t === "checkbox") return v ? <CheckSquare size={16} className="text-saffron" /> : null;
  if (t === "date") return fmtDate(v);
  if (t === "url" || t === "audio" || t === "video") return <a href={v} target="_blank" onClick={(e) => e.stopPropagation()} className="truncate text-[#2a4f9a] underline decoration-[#2a4f9a]/30">{String(v).replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}</a>;
  if (t === "file") return /\.(png|jpe?g|webp|gif|svg|avif)$|\/api\/media\//i.test(v) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={v} alt="" className="h-7 w-7 rounded object-cover" /> : <span className="truncate">📎 {String(v).split("/").pop()}</span>;
  if (t === "relation") { const list = rel[f.relation || ""] || []; return <span className="flex flex-wrap gap-1">{(Array.isArray(v) ? v : [v]).map((id: string) => <span key={id} className="rounded bg-band px-1.5 text-[12.5px] underline decoration-line-strong">{list.find((r) => r.id === id)?.title || "…"}</span>)}</span>; }
  return <span className="line-clamp-2">{String(v)}</span>;
}

function Editor({ f, v, set, rel, onOptions, close }: { f: Field; v: any; set: (v: any) => void; rel: Record<string, Row[]>; onOptions: (o: Opt[]) => void; close: () => void }) {
  const t = norm(f.type); const [q, setQ] = useState(""); const [media, setMedia] = useState(false);
  const inp = "h-9 w-full rounded-lg border border-line-strong px-2.5 outline-none focus:border-saffron";
  if (t === "select" || t === "multi") {
    const all = opts(f.options); const cur: string[] = t === "multi" ? (Array.isArray(v) ? v : v ? [v] : []) : v ? [v] : [];
    const pick = (n: string) => { if (t === "multi") set(cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]); else { set(cur[0] === n ? "" : n); close(); } };
    const shown = all.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
    return (
      <div className="w-[260px]">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or create an option" className={inp}
          onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { if (!all.some((o) => o.name === q.trim())) onOptions([...all, { name: q.trim(), color: OPTION_COLORS[all.length % OPTION_COLORS.length] }]); pick(q.trim()); setQ(""); } }} />
        <div className="mt-1 max-h-[240px] overflow-y-auto">
          {shown.map((o) => <button key={o.name} onClick={() => pick(o.name)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-band"><Pill o={o} />{cur.includes(o.name) && <span className="text-saffron">✓</span>}</button>)}
          {q.trim() && !all.some((o) => o.name === q.trim()) && <button onClick={() => { onOptions([...all, { name: q.trim(), color: OPTION_COLORS[all.length % OPTION_COLORS.length] }]); pick(q.trim()); setQ(""); }} className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-band">Create <Pill o={{ name: q.trim(), color: OPTION_COLORS[all.length % OPTION_COLORS.length] }} /></button>}
        </div>
      </div>
    );
  }
  if (t === "relation") {
    const list = (rel[f.relation || ""] || []).filter((r) => r.title.toLowerCase().includes(q.toLowerCase())).slice(0, 60); const cur: string[] = Array.isArray(v) ? v : v ? [v] : [];
    return <div className="w-[280px]"><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records" className={inp} /><div className="mt-1 max-h-[260px] overflow-y-auto">{list.map((r) => <button key={r.id} onClick={() => set(cur.includes(r.id) ? cur.filter((x) => x !== r.id) : [...cur, r.id])} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-band"><span className="truncate">{r.title || "Untitled"}</span>{cur.includes(r.id) && <span className="text-saffron">✓</span>}</button>)}{!f.relation && <p className="p-2 text-ink-3">Choose which database to link to in the column menu.</p>}</div></div>;
  }
  if (t === "file") return <div className="w-[300px] space-y-2"><input autoFocus defaultValue={v || ""} onBlur={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (set((e.target as HTMLInputElement).value), close())} placeholder="Paste a link, or upload" className={inp} /><button onClick={() => setMedia(true)} className="w-full rounded-lg bg-band py-2 font-medium hover:brightness-95">Upload or choose a picture</button>{media && <MediaPicker onClose={() => setMedia(false)} onPick={(i) => { set(i[0].url); setMedia(false); close(); }} />}</div>;
  if (t === "date") return <input autoFocus type="date" defaultValue={v ? String(v).slice(0, 10) : ""} onChange={(e) => set(e.target.value)} className={inp} />;
  if (t === "number") return <input autoFocus type="number" defaultValue={v ?? ""} onBlur={(e) => set(e.target.value === "" ? "" : Number(e.target.value))} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className={`${inp} w-[200px]`} />;
  if (t === "text") return <textarea autoFocus defaultValue={v || ""} onBlur={(e) => set(e.target.value)} rows={4} className="w-[340px] rounded-lg border border-line-strong p-2.5 outline-none focus:border-saffron" />;
  return <input autoFocus defaultValue={v || ""} onBlur={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} placeholder="https://…" className={`${inp} w-[320px]`} />;
}

function Cell({ f, row, setVal, rel, onOptions, className = "" }: { f: Field; row: Row; setVal: (k: string, v: any) => void; rel: Record<string, Row[]>; onOptions: (o: Opt[]) => void; className?: string }) {
  const [open, setOpen] = useState(false); const v = row.data?.[f.key];
  if (norm(f.type) === "checkbox") return <div className={className}><input type="checkbox" checked={!!v} onChange={(e) => setVal(f.key, e.target.checked)} className="h-4 w-4 accent-[var(--saffron)]" /></div>;
  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(true)} className="flex min-h-[34px] w-full items-center px-2 text-left text-[13.5px] text-ink-2">{show(v, f, rel) ?? <span className="text-transparent">—</span>}</button>
      {open && <Pop onClose={() => setOpen(false)} className="left-0 top-full"><Editor f={f} v={v} set={(x) => setVal(f.key, x)} rel={rel} onOptions={onOptions} close={() => setOpen(false)} /></Pop>}
    </div>
  );
}

/* ------------------------------------------------------------ filter + sort */
const OPS: Record<string, [string, string][]> = {
  any: [["contains", "contains"], ["is", "is"], ["not", "is not"], ["empty", "is empty"], ["filled", "is not empty"]],
  number: [["eq", "="], ["gt", ">"], ["lt", "<"], ["empty", "is empty"], ["filled", "is not empty"]],
  date: [["before", "is before"], ["after", "is after"], ["is", "is on"], ["empty", "is empty"], ["filled", "is not empty"]],
  checkbox: [["true", "is checked"], ["false", "is not checked"]],
};
const opsFor = (t: string) => OPS[norm(t)] || OPS.any;
function match(r: Row, c: Cond, fields: Field[]) {
  const f = fields.find((x) => x.key === c.key); const raw = c.key === "title" ? r.title : r.data?.[c.key];
  const empty = raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && !raw.length);
  if (c.op === "empty") return empty; if (c.op === "filled") return !empty;
  if (c.op === "true") return !!raw; if (c.op === "false") return !raw;
  const s = Array.isArray(raw) ? raw.join(" ").toLowerCase() : String(raw ?? "").toLowerCase(); const v = (c.value || "").toLowerCase();
  if (c.op === "contains") return s.includes(v); if (c.op === "is") return Array.isArray(raw) ? raw.map((x: any) => String(x).toLowerCase()).includes(v) : s === v || (f?.type === "date" && s.slice(0, 10) === v); if (c.op === "not") return s !== v;
  if (c.op === "eq") return Number(raw) === Number(c.value); if (c.op === "gt") return Number(raw) > Number(c.value); if (c.op === "lt") return Number(raw) < Number(c.value);
  if (c.op === "before") return s < v; if (c.op === "after") return s > v; return true;
}

/* ------------------------------------------------------------ main */
export function DatabaseEditor({ id }: { id: string }) {
  const [db, setDb] = useState<Db | null>(null); const [rows, setRows] = useState<Row[]>([]); const [rel, setRel] = useState<Record<string, Row[]>>({});
  const [vid, setVid] = useState(""); const [q, setQ] = useState(""); const [peek, setPeek] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | "filter" | "sort" | "view" | "props">(null); const [allDbs, setAllDbs] = useState<{ id: string; name: string }[]>([]);
  const dirty = useRef(false); const timer = useRef<any>(null);

  const load = useCallback(async () => {
    const r = await api<{ db: any; rows: Row[] }>(`/api/admin/dbs/${id}`);
    const d = r.db as Db; d.fields = (d.fields || []).map((f) => ({ ...f, type: norm(f.type) }));
    if (!d.views?.length) d.views = [{ id: uid(), name: "Table", type: "table", filters: [], sorts: [] }];
    d.settings ||= {}; setDb(d); setRows(r.rows); setVid((v) => v || d.views[0].id);
    const rels = Array.from(new Set(d.fields.filter((f) => f.type === "relation" && f.relation).map((f) => f.relation!)));
    const out: Record<string, Row[]> = {}; for (const x of rels) out[x] = (await api<{ rows: Row[] }>(`/api/admin/dbs/${x}`).catch(() => ({ rows: [] }))).rows; setRel(out);
  }, [id]);
  useEffect(() => { load().catch((e) => toast(e.message, true)); api("/api/admin/dbs").then(setAllDbs).catch(() => {}); }, [load]);

  const saveDb = (d: Db) => { setDb(d); dirty.current = true; clearTimeout(timer.current); timer.current = setTimeout(() => { api(`/api/admin/dbs/${id}`, "PATCH", { name: d.name, fields: d.fields, views: d.views, settings: d.settings, public: d.public }).then(() => { dirty.current = false; window.dispatchEvent(new Event("tj:pages-changed")); }).catch((e) => toast(e.message, true)); }, 600); };
  const view = db?.views.find((v) => v.id === vid) || db?.views[0];
  const setView = (p: Partial<View>) => db && view && saveDb({ ...db, views: db.views.map((v) => (v.id === view.id ? { ...v, ...p } : v)) });
  const setField = (k: string, p: Partial<Field>) => db && saveDb({ ...db, fields: db.fields.map((f) => (f.key === k ? { ...f, ...p } : f)) });
  const addField = (type = "text", label = "") => { if (!db) return; const name = label || TYPES.find((t) => t[0] === type)![1]; const f: Field = { key: keyOf(name, db.fields.map((x) => x.key)), label: name, type }; saveDb({ ...db, fields: [...db.fields, f] }); return f; };

  const setVal = async (row: Row, k: string, v: any) => {
    const data = { ...row.data, [k]: v }; setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, data } : r)));
    await api(`/api/admin/dbs/${id}/rows`, "PATCH", { row: row.id, data }).catch((e) => toast(e.message, true));
  };
  const setTitle = async (row: Row, title: string) => { setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, title } : r))); await api(`/api/admin/dbs/${id}/rows`, "PATCH", { row: row.id, title }).catch((e) => toast(e.message, true)); };
  const newRow = async (data: Record<string, any> = {}, open = true) => {
    const r = await api<Row>(`/api/admin/dbs/${id}/rows`, "POST", { title: "", data }); const row = { ...r, title: "", data: r.data || data, position: 0, status: r.status || "published" } as Row;
    setRows((rs) => [row, ...rs]); if (open) setPeek(row.id); return row;
  };
  const delRow = async (row: Row) => { if (!confirm(`Delete “${row.title || "Untitled"}”?`)) return; await api(`/api/admin/dbs/${id}/rows`, "DELETE", { row: row.id }); setRows((rs) => rs.filter((r) => r.id !== row.id)); setPeek(null); };

  const shown = useMemo(() => {
    if (!db || !view) return [];
    let rs = rows.filter((r) => view.filters.every((c) => match(r, c, db.fields)));
    if (q) { const n = q.toLowerCase(); rs = rs.filter((r) => (r.title + " " + JSON.stringify(r.data)).toLowerCase().includes(n)); }
    for (const s of [...view.sorts].reverse()) rs = [...rs].sort((a, b) => { const x = s.key === "title" ? a.title : a.data?.[s.key], y = s.key === "title" ? b.title : b.data?.[s.key]; const c = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true }); return s.dir === "asc" ? c : -c; });
    return rs;
  }, [rows, db, view, q]);

  if (!db || !view) return <div className="p-10 text-ink-3">Opening…</div>;
  const visible = db.fields.filter((f) => !(view.hidden || []).includes(f.key));
  const onOptions = (k: string) => (o: Opt[]) => setField(k, { options: o });
  const peekRow = rows.find((r) => r.id === peek);
  const selects = db.fields.filter((f) => f.type === "select" || f.type === "multi");
  const dates = db.fields.filter((f) => f.type === "date");

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-2 pt-12 sm:px-14">
        <div className="flex items-start gap-3">
          <button onClick={() => { const e = prompt("An emoji for this database", db.settings.icon || "🗃️"); if (e !== null) saveDb({ ...db, settings: { ...db.settings, icon: e } }); }} className="text-[44px] leading-none">{db.settings.icon || "🗃️"}</button>
          <div className="min-w-0 flex-1">
            <input value={db.name} onChange={(e) => saveDb({ ...db, name: e.target.value })} className="w-full bg-transparent text-[34px] font-bold tracking-[-0.03em] outline-none" />
            <input value={db.settings.description || ""} onChange={(e) => saveDb({ ...db, settings: { ...db.settings, description: e.target.value } })} placeholder="Add a description" className="w-full bg-transparent text-[14.5px] text-ink-2 outline-none placeholder:text-ink-3" />
          </div>
          <label className="mt-2 flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-ink-2" title="When on, each record has its own page on the website."><Globe size={14} />On website<input type="checkbox" checked={db.public} onChange={(e) => saveDb({ ...db, public: e.target.checked })} /></label>
        </div>
      </div>

      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-line bg-white/95 px-6 py-1.5 backdrop-blur sm:px-14">
        {db.views.map((v) => { const I = VIEW_ICON[v.type]; return <button key={v.id} onClick={() => setVid(v.id)} onDoubleClick={() => { const n = prompt("View name", v.name); if (n) saveDb({ ...db, views: db.views.map((x) => (x.id === v.id ? { ...x, name: n } : x)) }); }} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13.5px] ${v.id === view.id ? "bg-band font-semibold text-ink" : "text-ink-3 hover:bg-band/70"}`}><I size={15} />{v.name}</button>; })}
        <div className="relative"><button onClick={() => setMenu(menu === "view" ? null : "view")} className="flex h-8 items-center rounded-md px-2 text-ink-3 hover:bg-band"><Plus size={15} /></button>
          {menu === "view" && <Pop onClose={() => setMenu(null)} className="left-0 top-full w-[200px]">{(Object.keys(VIEW_ICON) as View["type"][]).map((t) => { const I = VIEW_ICON[t]; return <button key={t} onClick={() => { const v: View = { id: uid(), name: t[0].toUpperCase() + t.slice(1), type: t, filters: [], sorts: [], groupBy: selects[0]?.key, dateKey: dates[0]?.key }; saveDb({ ...db, views: [...db.views, v] }); setVid(v.id); setMenu(null); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 capitalize hover:bg-band"><I size={15} />{t}</button>; })}</Pop>}</div>
        <div className="ml-auto flex items-center gap-1">
          <div className="relative"><button onClick={() => setMenu(menu === "filter" ? null : "filter")} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] ${view.filters.length ? "text-saffron" : "text-ink-3"} hover:bg-band`}><Filter size={14} />Filter{view.filters.length ? ` (${view.filters.length})` : ""}</button>
            {menu === "filter" && <Pop onClose={() => setMenu(null)} className="right-0 top-full w-[440px] p-3">
              {view.filters.map((c, i) => { const f = db.fields.find((x) => x.key === c.key); return (
                <div key={i} className="mb-2 flex items-center gap-1.5">
                  <select value={c.key} onChange={(e) => setView({ filters: view.filters.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)) })} className="h-8 rounded-md border border-line px-1.5"><option value="title">Title</option>{db.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select>
                  <select value={c.op} onChange={(e) => setView({ filters: view.filters.map((x, j) => (j === i ? { ...x, op: e.target.value } : x)) })} className="h-8 rounded-md border border-line px-1.5">{opsFor(f?.type || "text").map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select>
                  {!["empty", "filled", "true", "false"].includes(c.op) && (f && (f.type === "select" || f.type === "multi") ? <select value={c.value} onChange={(e) => setView({ filters: view.filters.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} className="h-8 min-w-0 flex-1 rounded-md border border-line px-1.5"><option value="" />{opts(f.options).map((o) => <option key={o.name}>{o.name}</option>)}</select>
                    : <input type={f?.type === "date" ? "date" : f?.type === "number" ? "number" : "text"} value={c.value} onChange={(e) => setView({ filters: view.filters.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} className="h-8 min-w-0 flex-1 rounded-md border border-line px-2" />)}
                  <button onClick={() => setView({ filters: view.filters.filter((_, j) => j !== i) })} className="p-1 text-ink-3"><X size={14} /></button>
                </div>); })}
              <button onClick={() => setView({ filters: [...view.filters, { key: "title", op: "contains", value: "" }] })} className="flex items-center gap-1 text-[13px] font-medium text-saffron"><Plus size={14} />Add a filter</button>
            </Pop>}</div>
          <div className="relative"><button onClick={() => setMenu(menu === "sort" ? null : "sort")} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] ${view.sorts.length ? "text-saffron" : "text-ink-3"} hover:bg-band`}><ArrowUpDown size={14} />Sort</button>
            {menu === "sort" && <Pop onClose={() => setMenu(null)} className="right-0 top-full w-[330px] p-3">
              {view.sorts.map((s, i) => <div key={i} className="mb-2 flex items-center gap-1.5"><select value={s.key} onChange={(e) => setView({ sorts: view.sorts.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)) })} className="h-8 flex-1 rounded-md border border-line px-1.5"><option value="title">Title</option>{db.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select>
                <select value={s.dir} onChange={(e) => setView({ sorts: view.sorts.map((x, j) => (j === i ? { ...x, dir: e.target.value as any } : x)) })} className="h-8 rounded-md border border-line px-1.5"><option value="asc">A → Z, oldest first</option><option value="desc">Z → A, newest first</option></select>
                <button onClick={() => setView({ sorts: view.sorts.filter((_, j) => j !== i) })} className="p-1 text-ink-3"><X size={14} /></button></div>)}
              <button onClick={() => setView({ sorts: [...view.sorts, { key: "title", dir: "asc" }] })} className="flex items-center gap-1 text-[13px] font-medium text-saffron"><Plus size={14} />Add a sort</button>
            </Pop>}</div>
          <div className="relative"><button onClick={() => setMenu(menu === "props" ? null : "props")} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ink-3 hover:bg-band"><MoreHorizontal size={15} /></button>
            {menu === "props" && <Pop onClose={() => setMenu(null)} className="right-0 top-full w-[260px]">
              <p className="px-2 py-1 text-[11.5px] font-semibold text-ink-3">Columns shown in this view</p>
              {db.fields.map((f) => { const I = typeIcon(f.type); const hid = (view.hidden || []).includes(f.key); return <button key={f.key} onClick={() => setView({ hidden: hid ? (view.hidden || []).filter((x) => x !== f.key) : [...(view.hidden || []), f.key] })} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-band"><I size={14} className="text-ink-3" /><span className="flex-1 truncate text-left">{f.label}</span>{hid ? <EyeOff size={14} className="text-ink-3" /> : <span className="text-saffron">✓</span>}</button>; })}
              {view.type === "board" && <label className="mt-1 block border-t border-line px-2 pt-2 text-[12px] text-ink-3">Group by<select value={view.groupBy || ""} onChange={(e) => setView({ groupBy: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-line px-1.5 text-ink">{selects.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select></label>}
              {view.type === "calendar" && <label className="mt-1 block border-t border-line px-2 pt-2 text-[12px] text-ink-3">Date column<select value={view.dateKey || ""} onChange={(e) => setView({ dateKey: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-line px-1.5 text-ink">{dates.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select></label>}
              {db.views.length > 1 && <button onClick={() => { saveDb({ ...db, views: db.views.filter((v) => v.id !== view.id) }); setVid(db.views[0].id === view.id ? db.views[1].id : db.views[0].id); setMenu(null); }} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-line px-2 py-1.5 text-[#a3281e] hover:bg-band"><Trash2 size={14} />Delete this view</button>}
            </Pop>}</div>
          <div className="relative"><Search size={14} className="absolute left-2 top-2.5 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-8 w-[130px] rounded-md bg-band/60 pl-7 pr-2 text-[13px] outline-none focus:w-[200px] focus:bg-white focus:ring-1 focus:ring-saffron" /></div>
          <button onClick={() => newRow()} className="ml-1 flex h-8 items-center gap-1 rounded-md bg-saffron px-3 text-[13px] font-medium text-white hover:brightness-110"><Plus size={14} />New</button>
        </div>
      </div>

      <div className="px-6 pb-32 pt-3 sm:px-14">
        {view.type === "table" && <TableView {...{ db, rows: shown, visible, rel, setVal, setTitle, newRow, setPeek, onOptions, setField, addField, saveDb, allDbs, delRow }} />}
        {view.type === "board" && <BoardView {...{ db, rows: shown, view, rel, setVal, newRow, setPeek, visible, addField, setView }} />}
        {view.type === "gallery" && <Gallery {...{ db, rows: shown, rel, visible, setPeek, newRow }} />}
        {view.type === "list" && <ListView {...{ rows: shown, visible, rel, setPeek, newRow }} />}
        {view.type === "calendar" && <CalendarView {...{ rows: shown, view, dates, setPeek, newRow, addField, setView }} />}
        <p className="mt-3 text-[12.5px] text-ink-3">{shown.length} of {rows.length} records</p>
      </div>
      {peekRow && <Peek {...{ db, row: peekRow, rel, setVal, setTitle, onOptions, close: () => setPeek(null), delRow, dbId: id, setRows }} />}
    </div>
  );
}

/* ------------------------------------------------------------ table */
function FieldHead({ f, db, setField, saveDb, allDbs }: { f: Field; db: Db; setField: (k: string, p: Partial<Field>) => void; saveDb: (d: Db) => void; allDbs: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false); const I = typeIcon(f.type); const i = db.fields.findIndex((x) => x.key === f.key);
  const move = (d: number) => { const fs = [...db.fields]; const j = i + d; if (j < 0 || j >= fs.length) return; [fs[i], fs[j]] = [fs[j], fs[i]]; saveDb({ ...db, fields: fs }); };
  return (
    <th className="relative min-w-[160px] border-r border-line p-0 text-left font-normal">
      <button onClick={() => setOpen(true)} className="flex h-9 w-full items-center gap-1.5 px-2 text-[13px] text-ink-3 hover:bg-band"><I size={14} />{f.label}</button>
      {open && <Pop onClose={() => setOpen(false)} className="left-0 top-full w-[250px]">
        <input autoFocus value={f.label} onChange={(e) => setField(f.key, { label: e.target.value })} className="mb-1 h-8 w-full rounded-md border border-line px-2 outline-none focus:border-saffron" />
        <p className="px-2 pt-1 text-[11.5px] font-semibold text-ink-3">Type</p>
        <div className="max-h-[200px] overflow-y-auto">{TYPES.map(([t, l, TI]) => <button key={t} onClick={() => setField(f.key, { type: t })} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-band ${f.type === t ? "font-semibold text-saffron" : ""}`}><TI size={14} />{l}</button>)}</div>
        {f.type === "relation" && <select value={f.relation || ""} onChange={(e) => setField(f.key, { relation: e.target.value })} className="my-1 h-8 w-full rounded-md border border-line px-1.5"><option value="">Link to which database?</option>{allDbs.filter((d) => d.id !== db.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}
        {(f.type === "select" || f.type === "multi") && <div className="border-t border-line pt-1"><p className="px-2 py-1 text-[11.5px] font-semibold text-ink-3">Options</p>{opts(f.options).map((o, k) => (
          <div key={k} className="flex items-center gap-1 px-1 py-0.5"><input value={o.name} onChange={(e) => setField(f.key, { options: opts(f.options).map((x, j) => (j === k ? { ...x, name: e.target.value } : x)) })} className="h-7 min-w-0 flex-1 rounded border border-transparent px-1.5 hover:border-line" style={{ background: COLORS[o.color]?.bg, color: COLORS[o.color]?.text }} />
            <select value={o.color} onChange={(e) => setField(f.key, { options: opts(f.options).map((x, j) => (j === k ? { ...x, color: e.target.value } : x)) })} className="h-7 w-[70px] rounded border border-line text-[12px]">{OPTION_COLORS.map((c) => <option key={c}>{c}</option>)}</select>
            <button onClick={() => setField(f.key, { options: opts(f.options).filter((_, j) => j !== k) })} className="p-0.5 text-ink-3"><X size={13} /></button></div>))}
          <button onClick={() => setField(f.key, { options: [...opts(f.options), { name: "New option", color: OPTION_COLORS[opts(f.options).length % 9] }] })} className="flex items-center gap-1 px-2 py-1 text-[12.5px] text-saffron"><Plus size={13} />Add option</button></div>}
        <div className="mt-1 flex border-t border-line pt-1">
          <button onClick={() => move(-1)} title="Move left" className="flex-1 rounded-lg py-1.5 hover:bg-band"><ArrowLeft size={14} className="mx-auto" /></button>
          <button onClick={() => move(1)} title="Move right" className="flex-1 rounded-lg py-1.5 hover:bg-band"><ArrowRight size={14} className="mx-auto" /></button>
          <button onClick={() => { if (confirm(`Delete the column “${f.label}” and its values?`)) { saveDb({ ...db, fields: db.fields.filter((x) => x.key !== f.key) }); setOpen(false); } }} title="Delete column" className="flex-1 rounded-lg py-1.5 text-[#a3281e] hover:bg-band"><Trash2 size={14} className="mx-auto" /></button>
        </div>
      </Pop>}
    </th>
  );
}

function TitleCell({ row, setTitle, setPeek }: { row: Row; setTitle: (r: Row, t: string) => void; setPeek: (id: string) => void }) {
  const [v, setV] = useState(row.title); useEffect(() => setV(row.title), [row.title]);
  return (
    <div className="group/t flex items-center">
      <input value={v} placeholder="Untitled" onChange={(e) => setV(e.target.value)} onBlur={() => v !== row.title && setTitle(row, v)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className="h-[34px] min-w-0 flex-1 bg-transparent px-2 text-[14px] font-medium outline-none placeholder:font-normal placeholder:text-ink-3" />
      {row.status !== "published" && <span className="mr-1 rounded bg-[#fbeccf] px-1 text-[10.5px] text-[#8a5a0a]">draft</span>}
      <button onClick={() => setPeek(row.id)} className="mr-1 hidden h-6 items-center gap-1 rounded border border-line bg-white px-1.5 text-[11.5px] font-medium text-ink-2 shadow-sm group-hover/t:flex"><Maximize2 size={11} />Open</button>
    </div>
  );
}

function TableView({ db, rows, visible, rel, setVal, setTitle, newRow, setPeek, onOptions, setField, addField, saveDb, allDbs, delRow }: any) {
  const [add, setAdd] = useState(false);
  return (
    <div className="overflow-x-auto">
      <table className="w-max min-w-full border-collapse text-[13.5px]">
        <thead><tr className="border-y border-line">
          <th className="min-w-[280px] border-r border-line p-0 text-left font-normal"><span className="flex h-9 items-center gap-1.5 px-2 text-[13px] text-ink-3"><Type size={14} />Title</span></th>
          {visible.map((f: Field) => <FieldHead key={f.key} {...{ f, db, setField, saveDb, allDbs }} />)}
          <th className="relative w-10 p-0"><button onClick={() => setAdd(true)} title="Add a column" className="flex h-9 w-10 items-center justify-center text-ink-3 hover:bg-band"><Plus size={15} /></button>
            {add && <Pop onClose={() => setAdd(false)} className="right-0 top-full w-[220px]"><p className="px-2 py-1 text-[11.5px] font-semibold text-ink-3">Add a column</p>{TYPES.map(([t, l, I]) => <button key={t} onClick={() => { addField(t); setAdd(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-band"><I size={14} />{l}</button>)}</Pop>}</th>
        </tr></thead>
        <tbody>{rows.map((r: Row) => (
          <tr key={r.id} className="group border-b border-line hover:bg-[#fcfaf7]">
            <td className="border-r border-line p-0"><TitleCell row={r} setTitle={setTitle} setPeek={setPeek} /></td>
            {visible.map((f: Field) => <td key={f.key} className="max-w-[320px] border-r border-line p-0 align-top"><Cell f={f} row={r} setVal={(k, v) => setVal(r, k, v)} rel={rel} onOptions={onOptions(f.key)} className="flex min-h-[34px] items-center" /></td>)}
            <td className="p-0 text-center"><button onClick={() => delRow(r)} title="Delete" className="hidden p-1.5 text-ink-3 hover:text-[#a3281e] group-hover:inline"><Trash2 size={13} /></button></td>
          </tr>))}
        </tbody>
      </table>
      <button onClick={() => newRow({}, false)} className="flex h-9 w-full items-center gap-1.5 border-b border-line px-2 text-[13.5px] text-ink-3 hover:bg-band/60"><Plus size={15} />New</button>
    </div>
  );
}

/* ------------------------------------------------------------ board, gallery, list, calendar */
function Card({ r, db, visible, rel, onClick, drag }: { r: Row; db: Db; visible: Field[]; rel: Record<string, Row[]>; onClick: () => void; drag?: boolean }) {
  const cover = db.fields.find((f) => f.type === "file"); const img = cover ? r.data?.[cover.key] : "";
  return (
    <div draggable={drag} onDragStart={(e) => e.dataTransfer.setData("row", r.id)} onClick={onClick} className="cursor-pointer overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(40,20,5,.06)] transition hover:border-line-strong hover:shadow-md">
      {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="aspect-[16/9] w-full object-cover" />}
      <div className="space-y-1 p-2.5"><p className="text-[14px] font-semibold leading-snug">{r.title || <span className="text-ink-3">Untitled</span>}</p>
        {visible.filter((f) => f.type !== "file").slice(0, 3).map((f) => { const s = show(r.data?.[f.key], f, rel); return s ? <div key={f.key} className="text-[12.5px] text-ink-2">{s}</div> : null; })}</div>
    </div>
  );
}
function BoardView({ db, rows, view, rel, setVal, newRow, setPeek, visible, addField, setView }: any) {
  const g: Field | undefined = db.fields.find((f: Field) => f.key === view.groupBy && (f.type === "select" || f.type === "multi")) || db.fields.find((f: Field) => f.type === "select");
  const [over, setOver] = useState<string | null>(null);
  if (!g) return <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-3">A board groups records by a Select column.<br /><button onClick={() => { const f = addField("select", "Status"); if (f) setView({ groupBy: f.key }); }} className="mt-3 rounded-lg bg-saffron px-3 py-1.5 text-[13px] font-medium text-white">Add a “Status” column</button></div>;
  const groups = [...opts(g.options), { name: "", color: "gray" }];
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {groups.map((o) => { const rs = rows.filter((r: Row) => (r.data?.[g.key] || "") === o.name || (Array.isArray(r.data?.[g.key]) && r.data[g.key].includes(o.name)) || (!o.name && (!r.data?.[g.key] || (Array.isArray(r.data[g.key]) && !r.data[g.key].length)))); return (
        <div key={o.name || "_"} onDragOver={(e) => { e.preventDefault(); setOver(o.name); }} onDragLeave={() => setOver(null)} onDrop={(e) => { const id = e.dataTransfer.getData("row"); const r = rows.find((x: Row) => x.id === id); setOver(null); if (r) setVal(r, g.key, g.type === "multi" ? (o.name ? [o.name] : []) : o.name); }}
          className={`w-[270px] shrink-0 rounded-2xl p-2 transition ${over === o.name ? "bg-saffron-soft/70" : "bg-[#f8f4ee]"}`}>
          <p className="mb-2 flex items-center gap-2 px-1 text-[13px]">{o.name ? <Pill o={o} /> : <span className="text-ink-3">No {g.label}</span>}<span className="text-ink-3">{rs.length}</span></p>
          <div className="space-y-2">{rs.map((r: Row) => <Card key={r.id} r={r} db={db} visible={visible.filter((f: Field) => f.key !== g.key)} rel={rel} onClick={() => setPeek(r.id)} drag />)}</div>
          <button onClick={() => newRow(o.name ? { [g.key]: g.type === "multi" ? [o.name] : o.name } : {})} className="mt-2 flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] text-ink-3 hover:bg-white"><Plus size={14} />New</button>
        </div>); })}
    </div>
  );
}
const Gallery = ({ db, rows, rel, visible, setPeek, newRow }: any) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {rows.map((r: Row) => <Card key={r.id} r={r} db={db} visible={visible} rel={rel} onClick={() => setPeek(r.id)} />)}
    <button onClick={() => newRow()} className="flex min-h-[120px] items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-[13.5px] text-ink-3 hover:border-saffron hover:text-saffron"><Plus size={15} />New</button>
  </div>
);
const ListView = ({ rows, visible, rel, setPeek, newRow }: any) => (
  <div className="divide-y divide-line border-y border-line">
    {rows.map((r: Row) => <button key={r.id} onClick={() => setPeek(r.id)} className="flex w-full items-center gap-3 px-2 py-2.5 text-left hover:bg-band/60"><span className="min-w-0 flex-1 truncate font-medium">{r.title || <span className="text-ink-3">Untitled</span>}</span>{visible.slice(0, 3).map((f: Field) => <span key={f.key} className="hidden max-w-[180px] truncate text-[12.5px] text-ink-3 sm:block">{show(r.data?.[f.key], f, rel)}</span>)}</button>)}
    <button onClick={() => newRow()} className="flex w-full items-center gap-1.5 px-2 py-2 text-[13.5px] text-ink-3 hover:bg-band/60"><Plus size={15} />New</button>
  </div>
);
function CalendarView({ rows, view, dates, setPeek, newRow, addField, setView }: any) {
  const [m, setM] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const key = view.dateKey || dates[0]?.key;
  if (!key) return <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-3">A calendar needs a Date column.<br /><button onClick={() => { const f = addField("date", "Date"); if (f) setView({ dateKey: f.key }); }} className="mt-3 rounded-lg bg-saffron px-3 py-1.5 text-[13px] font-medium text-white">Add a “Date” column</button></div>;
  const start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2"><b className="text-[16px]">{m.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b><button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded p-1 hover:bg-band"><ChevronLeft size={16} /></button><button onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded p-1 hover:bg-band"><ChevronRight size={16} /></button><button onClick={() => { const d = new Date(); setM(new Date(d.getFullYear(), d.getMonth(), 1)); }} className="rounded px-2 py-0.5 text-[12.5px] hover:bg-band">Today</button></div>
      <div className="grid grid-cols-7 border-l border-t border-line text-[12.5px]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="border-b border-r border-line px-2 py-1 text-ink-3">{d}</div>)}
        {days.map((d) => { const k = iso(d); const rs = rows.filter((r: Row) => String(r.data?.[key] || "").slice(0, 10) === k); return (
          <div key={k} className={`group min-h-[96px] border-b border-r border-line p-1 ${d.getMonth() !== m.getMonth() ? "bg-[#faf8f5] text-ink-3" : ""}`}>
            <div className="flex items-center justify-between"><span className={`px-1 ${k === iso(new Date()) ? "rounded-full bg-saffron px-1.5 text-white" : ""}`}>{d.getDate()}</span><button onClick={() => newRow({ [key]: k })} className="hidden rounded p-0.5 text-ink-3 hover:bg-band group-hover:block"><Plus size={13} /></button></div>
            {rs.map((r: Row) => <button key={r.id} onClick={() => setPeek(r.id)} className="mt-0.5 block w-full truncate rounded border border-line bg-white px-1.5 py-0.5 text-left text-[12px] font-medium shadow-sm hover:border-saffron">{r.title || "Untitled"}</button>)}
          </div>); })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ record page */
function Peek({ db, row, rel, setVal, setTitle, onOptions, close, delRow, dbId, setRows }: any) {
  const [full, setFull] = useState<{ blocks: any[] } | null>(null); const [title, setT] = useState(row.title); const blocks = useRef<any[]>([]); const t = useRef<any>(null);
  useEffect(() => { setT(row.title); api(`/api/admin/dbs/${dbId}/rows?row=${row.id}`).then((r) => { blocks.current = r.blocks || []; setFull(r); }).catch(() => setFull({ blocks: [] })); }, [row.id]); // eslint-disable-line
  const saveBlocks = () => { clearTimeout(t.current); t.current = setTimeout(() => api(`/api/admin/dbs/${dbId}/rows`, "PATCH", { row: row.id, blocks: blocks.current }).catch((e) => toast(e.message, true)), 900); };
  const status = async (s: string) => { await api(`/api/admin/dbs/${dbId}/rows`, "PATCH", { row: row.id, status: s }).catch((e) => toast(e.message, true)); setRows((rs: Row[]) => rs.map((r) => (r.id === row.id ? { ...r, status: s } : r))); };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/15" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <aside className="flex h-full w-full max-w-[860px] flex-col bg-white shadow-2xl">
        <div className="flex h-11 items-center gap-1 border-b border-line px-3 text-[13px]">
          <button onClick={close} className="rounded p-1.5 hover:bg-band"><ChevronRight size={17} /></button>
          <span className="text-ink-3">{db.name}</span>
          <span className="ml-auto" />
          {db.public && row.slug && <a href={`/d/${db.slug}/${row.slug}`} target="_blank" className="flex items-center gap-1 rounded-md px-2 py-1 text-ink-2 hover:bg-band"><Globe size={14} />View</a>}
          <button onClick={() => status(row.status === "published" ? "draft" : "published")} className={`rounded-md px-2.5 py-1 font-medium ${row.status === "published" ? "text-ink-2 hover:bg-band" : "bg-saffron text-white"}`}>{row.status === "published" ? "Hide (draft)" : "Publish"}</button>
          <button onClick={() => { navigator.clipboard.writeText(`/d/${db.slug}/${row.slug}`); toast("Address copied."); }} title="Copy address" className="rounded p-1.5 hover:bg-band"><Copy size={14} /></button>
          <button onClick={() => delRow(row)} title="Delete" className="rounded p-1.5 text-[#a3281e] hover:bg-band"><Trash2 size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-24 pt-10 sm:px-14">
          <textarea rows={1} value={title} placeholder="Untitled" onChange={(e) => setT(e.target.value)} onBlur={() => title !== row.title && setTitle(row, title)} className="w-full resize-none bg-transparent text-[32px] font-bold leading-tight tracking-[-0.03em] outline-none placeholder:text-[#d9cfc3]" />
          <div className="mt-4 space-y-0.5">
            {db.fields.map((f: Field) => { const I = typeIcon(f.type); return (
              <div key={f.key} className="grid grid-cols-[170px_minmax(0,1fr)] items-start rounded-md hover:bg-[#faf7f2]">
                <span className="flex h-[34px] items-center gap-1.5 px-1.5 text-[13.5px] text-ink-3"><I size={14} />{f.label}</span>
                <Cell f={f} row={row} setVal={(k, v) => setVal(row, k, v)} rel={rel} onOptions={onOptions(f.key)} className="flex min-h-[34px] items-center" />
              </div>); })}
          </div>
          <div className="my-5 border-t border-line" />
          <div className="-mx-[54px]">{full ? <NotionEditor initial={full.blocks} pageId="" onChange={(b) => { blocks.current = b; saveBlocks(); }} /> : <p className="px-[54px] text-ink-3">Opening…</p>}</div>
        </div>
      </aside>
    </div>
  );
}
