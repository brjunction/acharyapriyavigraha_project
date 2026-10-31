"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Plus, Search, Trash2, ExternalLink, ArrowLeft, Image as ImageIcon, UserRound, Layers, FolderOpen, X } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Empty, Modal, api, toast, cn } from "../ui";
import { MediaPicker } from "../media-picker";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false });
type Row = { id: string; slug: string; title: string; subtitle: string | null; author: string | null; series: string | null; series_part: number | null; section: string | null; date: string | null; status: string; cover: string | null; blocks: number };
type F = { name: string; n: number };
type Data = { rows: Row[]; authors: F[]; series: F[]; sections: F[] };

export function ArticlesPanel() {
  const [data, setData] = useState<Data | null>(null); const [f, setF] = useState<Record<string, string>>({}); const [q, setQ] = useState(""); const t = useRef<any>(null);
  const [edit, setEdit] = useState<string | null>(null); const [issueFor, setIssueFor] = useState<string | null>(null); const [authorsOpen, setAuthorsOpen] = useState(false);
  useEffect(() => { const u = new URLSearchParams(location.search); if (u.get("edit")) setEdit(u.get("edit")); else if (u.get("new")) { setIssueFor(u.get("issue")); setEdit("new"); } }, []);
  const load = useCallback(() => { const u = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([, v]) => v))); api<Data>(`/api/admin/articles?${u}`).then(setData).catch((e) => toast(e.message, true)); }, [f]);
  useEffect(() => { load(); }, [load]);
  const pick = (k: string, v: string) => setF((p) => ({ ...p, [k]: p[k] === v ? "" : v }));
  if (edit) return <ArticleEditor id={edit} lists={data} issue={issueFor} onClose={() => { setEdit(null); setIssueFor(null); history.replaceState(null, "", location.pathname); load(); }} />;
  const Facet = ({ k, title, icon: I, items }: { k: string; title: string; icon: any; items: F[] }) => (
    <div className="mb-4"><p className="mb-1 flex items-center gap-1.5 px-2 text-[11.5px] font-medium uppercase tracking-wide text-zinc-500"><I className="size-3.5" />{title}</p>
      {items.length ? items.map((x) => <button key={x.name} onClick={() => pick(k, x.name)} className={cn("flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-zinc-100", f[k] === x.name && "bg-zinc-900 text-white hover:bg-zinc-800")}><span className="truncate">{x.name}</span><span className="text-[11.5px] tabular-nums opacity-60">{x.n}</span></button>) : <p className="px-2 text-[12px] text-zinc-400">None yet</p>}
    </div>);
  const active = Object.entries(f).filter(([k, v]) => v && k !== "q");
  return (
    <div>
      <PageHeader icon={FileText} title="Articles" description="Essays and write-ups, organised by author, series and section. Each article is written in the same editor as pages.">
        <a href="/teachings/articles" target="_blank"><Btn><ExternalLink />View on website</Btn></a><Btn onClick={() => setAuthorsOpen(true)}><UserRound />Authors</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />New article</Btn>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Facet k="author" title="Authors" icon={UserRound} items={data?.authors || []} />
          <Facet k="series" title="Series" icon={Layers} items={data?.series || []} />
          <Facet k="section" title="Sections" icon={FolderOpen} items={data?.sections || []} />
        </aside>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => { setQ(e.target.value); clearTimeout(t.current); t.current = setTimeout(() => setF((p) => ({ ...p, q: e.target.value })), 300); }} placeholder="Search titles and text (no diacritics needed)" className="pl-8" /></div>
            <Select value={f.status || ""} onChange={(e) => setF((p) => ({ ...p, status: e.target.value }))} className="!w-auto"><option value="">Live and hidden</option><option value="published">Live</option><option value="draft">Hidden</option></Select>
          </div>
          {active.length > 0 && <div className="mb-3 flex flex-wrap gap-1.5">{active.map(([k, v]) => <Badge key={k} tone="outline">{v}<button onClick={() => pick(k, v)}><X /></button></Badge>)}</div>}
          {data && !data.rows.length ? <Empty icon={FileText} title={active.length || f.q ? "Nothing matches" : "No articles yet"} text="Write the first one. Give it an author, and a series if it belongs to one."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />New article</Btn></Empty> :
            <Card className="divide-y divide-zinc-100">{data?.rows.map((r) => (
              <button key={r.id} onClick={() => setEdit(r.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50">
                {r.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.cover} alt="" className="size-10 shrink-0 rounded-md object-cover" /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400"><FileText className="size-4" /></span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium">{r.title}</span><span className="block truncate text-[12px] text-zinc-500">{[r.author, r.series && `${r.series}${r.series_part ? ` · part ${r.series_part}` : ""}`, r.section].filter(Boolean).join(" · ") || "No author yet"}</span></span>
                {!r.blocks && <Badge tone="outline">Empty</Badge>}{r.status !== "published" && <Badge>Hidden</Badge>}
              </button>))}</Card>}
        </div>
      </div>
      {authorsOpen && <AuthorsManager onClose={() => { setAuthorsOpen(false); load(); }} />}
    </div>
  );
}

/** Authors: a photo, a role and a few lines about each, shown on the website beside their articles. */
function AuthorsManager({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<{ name: string; extra: any; used?: number }[] | null>(null); const [sel, setSel] = useState<string | null>(null); const [x, setX] = useState<any>(null); const [pic, setPic] = useState(false); const [nw, setNw] = useState("");
  const load = useCallback(async () => {
    const [v, a] = await Promise.all([api<any[]>("/api/admin/vocab?kind=author"), api<Data>("/api/admin/articles")]);
    const names = new Set([...v.map((r) => r.name), ...a.authors.map((r) => r.name)]);
    setRows([...names].sort().map((n) => ({ name: n, extra: v.find((r) => r.name === n)?.extra || {}, used: a.authors.find((r) => r.name === n)?.n || 0 })));
  }, []);
  useEffect(() => { load(); }, [load]);
  const open = (n: string) => { const r = rows?.find((y) => y.name === n); setSel(n); setX({ name: n, ...(r?.extra || {}) }); };
  const save = async () => { if (!x || !sel) return; if (x.name.trim() && x.name.trim() !== sel) await api("/api/admin/vocab", "PATCH", { kind: "author", from: sel, to: x.name.trim() }); await api("/api/admin/vocab", "POST", { kind: "author", name: x.name.trim(), extra: { photo: x.photo || null, role: x.role || null, bio: x.bio || null, position: x.position === "" || x.position == null ? null : Number(x.position) } }); toast("Saved."); setSel(x.name.trim()); load(); };
  return (
    <Modal wide title="Authors" description="Give each author a photo, a role (e.g. Śrīla Gurudeva, Śrīla Guru Mahārāja, disciple) and a few lines. Lower numbers are shown first." onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <div>
          <div className="flex gap-1.5"><Input value={nw} onChange={(e) => setNw(e.target.value)} placeholder="New author" /><Btn size="icon" onClick={async () => { if (!nw.trim()) return; await api("/api/admin/vocab", "POST", { kind: "author", name: nw.trim(), extra: {} }); setNw(""); await load(); open(nw.trim()); }}><Plus /></Btn></div>
          <div className="mt-2 max-h-[52vh] overflow-y-auto">{rows?.map((r) => <button key={r.name} onClick={() => open(r.name)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-zinc-100", sel === r.name && "bg-zinc-100 font-medium")}>{r.extra?.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.extra.photo} alt="" className="size-6 rounded-full object-cover" /> : <span className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-[10px]">{r.name[0]}</span>}<span className="flex-1 truncate">{r.name}</span><span className="text-[11.5px] text-zinc-400">{r.used}</span></button>)}</div>
        </div>
        {x ? <div className="space-y-3">
          <div className="flex items-center gap-3">{x.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.photo} alt="" className="size-16 rounded-full object-cover" /> : <span className="flex size-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400"><UserRound className="size-6" /></span>}<Btn size="sm" onClick={() => setPic(true)}><ImageIcon />{x.photo ? "Change photo" : "Add photo"}</Btn>{x.photo && <Btn size="sm" onClick={() => setX({ ...x, photo: null })}>Remove</Btn>}</div>
          <Field label="Name" hint="Renaming changes it on every article."><Input value={x.name} onChange={(e) => setX({ ...x, name: e.target.value })} /></Field>
          <div className="grid grid-cols-[1fr_90px] gap-2"><Field label="Role"><Input value={x.role || ""} onChange={(e) => setX({ ...x, role: e.target.value })} placeholder="e.g. Disciple of Śrīla Gurudeva" /></Field><Field label="Order"><Input type="number" value={x.position ?? ""} onChange={(e) => setX({ ...x, position: e.target.value })} /></Field></div>
          <Field label="About"><Textarea rows={4} value={x.bio || ""} onChange={(e) => setX({ ...x, bio: e.target.value })} /></Field>
          <div className="flex justify-end"><Btn kind="primary" onClick={save}>Save</Btn></div>
        </div> : <p className="flex items-center justify-center text-[13px] text-zinc-500">Choose an author on the left.</p>}
      </div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { setX({ ...x, photo: i[0].url }); setPic(false); }} />}
    </Modal>
  );
}

function DL({ id, value, onChange, opts, placeholder }: { id: string; value: string; onChange: (v: string) => void; opts: F[]; placeholder?: string }) {
  return <><Input list={id} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /><datalist id={id}>{opts.map((o) => <option key={o.name} value={o.name} />)}</datalist></>;
}

function ArticleEditor({ id, lists, onClose, issue }: { id: string; lists: Data | null; onClose: () => void; issue?: string | null }) {
  const [a, setA] = useState<any>(id === "new" ? { status: "published", topics: [], body: [], issue_id: issue || null } : null);
  const [issues, setIssues] = useState<any[]>([]); useEffect(() => { api<any[]>("/api/admin/issues").then(setIssues).catch(() => {}); }, []); const [cur, setCur] = useState(id);
  const [busy, setBusy] = useState(false); const [pic, setPic] = useState(false); const [dirty, setDirty] = useState(false); const body = useRef<any[] | null>(null);
  useEffect(() => { if (id !== "new") api(`/api/admin/articles/${id}`).then((r) => setA({ ...r, date: r.date?.slice(0, 10) || "" })).catch((e) => toast(e.message, true)); }, [id]);
  const set = (k: string, v: any) => { setA((p: any) => ({ ...p, [k]: v })); setDirty(true); };
  const save = async () => {
    if (!a.title?.trim()) return toast("Please give a title.", true); setBusy(true);
    const payload = { ...a, body: body.current || a.body || [] };
    try { if (cur === "new") { const r = await api<{ id: string; slug: string }>("/api/admin/articles", "POST", payload); setCur(r.id); setA((p: any) => ({ ...p, slug: r.slug })); } else await api(`/api/admin/articles/${cur}`, "PATCH", payload); toast("Saved."); setDirty(false); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(false); }
  };
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  if (!a) return <p className="p-6 text-zinc-500">Opening…</p>;
  return (
    <div className="-mx-4 -my-8 sm:-mx-8">
      <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-8">
        <Btn size="sm" kind="ghost" onClick={() => { if (!dirty || confirm("Leave without saving?")) onClose(); }}><ArrowLeft />Articles</Btn>
        <span className="flex-1 truncate text-[12.5px] text-zinc-500">{dirty ? "Unsaved changes" : cur === "new" ? "New article" : "Saved"}</span>
        <Select value={a.status} onChange={(e) => set("status", e.target.value)} className="!h-8 !w-auto"><option value="published">Live</option><option value="draft">Hidden</option></Select>
        {a.slug && a.status === "published" && <a href={`/teachings/articles/${a.slug}`} target="_blank"><Btn size="sm"><ExternalLink />View</Btn></a>}
        <Btn size="sm" kind="primary" busy={busy} onClick={save}>Save</Btn>
      </div>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="mb-6 aspect-[3/1] w-full rounded-xl object-cover" />}
          <textarea value={a.title || ""} onChange={(e) => set("title", e.target.value)} rows={1} placeholder="Title" className="w-full resize-none bg-transparent text-[30px] font-bold leading-tight tracking-tight outline-none [field-sizing:content] placeholder:text-zinc-300" />
          <input value={a.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Subtitle (optional)" className="mt-1 w-full bg-transparent text-[16px] text-zinc-500 outline-none placeholder:text-zinc-300" />
          <div className="site-canvas -mx-[54px] mt-6 min-h-[50vh]"><NotionEditor initial={a.body || []} pageId="" onChange={(b) => { body.current = b; setDirty(true); }} /></div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <Card className="space-y-4 p-4">
            <Field label="Author"><DL id="dl-author" value={a.author} onChange={(v) => set("author", v)} opts={lists?.authors || []} placeholder="Who wrote it" /></Field>
            <div className="grid grid-cols-[1fr_72px] gap-2"><Field label="Series"><DL id="dl-series" value={a.series} onChange={(v) => set("series", v)} opts={lists?.series || []} placeholder="If part of a series" /></Field><Field label="Part"><Input type="number" min={1} value={a.series_part ?? ""} onChange={(e) => set("series_part", e.target.value)} /></Field></div>
            <Field label="Section"><DL id="dl-section" value={a.section} onChange={(v) => set("section", v)} opts={lists?.sections || []} placeholder="e.g. Tattva, Pastimes" /></Field>
            <Field label="Published in a magazine" hint="Choose the issue; the article then appears in that issue's contents."><Select value={a.issue_id || ""} onChange={(e) => set("issue_id", e.target.value || null)}><option value="">Not in a magazine</option>{Array.from(new Set(issues.map((i) => i.magazine))).map((mg) => <optgroup key={mg} label={mg}>{issues.filter((i) => i.magazine === mg).map((i) => <option key={i.id} value={i.id}>{i.label}{i.date ? ` (${i.date.slice(0, 7)})` : ""}</option>)}</optgroup>)}</Select></Field>
            <Field label="Date"><Input type="date" value={a.date || ""} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="Cover picture"><div className="flex flex-wrap gap-2"><Btn size="sm" onClick={() => setPic(true)}><ImageIcon />{a.cover ? "Change" : "Choose"}</Btn>{a.cover && <Btn size="sm" onClick={() => set("cover", null)}>Remove</Btn>}</div>
              <Input className="mt-2" value={a.cover || ""} onChange={(e) => set("cover", e.target.value)} placeholder="…or paste a picture link" /></Field>
            <Field label="Summary" hint="Shown in lists and search results."><Textarea rows={3} value={a.summary || ""} onChange={(e) => set("summary", e.target.value)} /></Field>
            <Field label="Topics" hint="Separate with commas."><Input value={(a.topics || []).join(", ")} onChange={(e) => set("topics", e.target.value.split(",").map((x: string) => x.trimStart()))} /></Field>
            <Field label="First published in (optional)"><Input value={a.source || ""} onChange={(e) => set("source", e.target.value)} placeholder="e.g. Gopāl Jiu magazine, 2004" /><Input className="mt-2" value={a.source_url || ""} onChange={(e) => set("source_url", e.target.value)} placeholder="https://…" /></Field>
          </Card>
          {cur !== "new" && <Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this article?")) return; await api(`/api/admin/articles/${cur}`, "DELETE"); onClose(); }}><Trash2 />Delete article</Btn>}
        </aside>
      </div>
      {pic && <MediaPicker onClose={() => setPic(false)} onPick={(i) => { set("cover", i[0].url); setPic(false); }} />}
    </div>
  );
}
