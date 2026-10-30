"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Trash2, ExternalLink, ArrowLeft, Image as ImageIcon, ArrowUp, ArrowDown, Star, Eye, EyeOff, FolderInput, ListTree, X, Link2 } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, Modal, api, toast, cn } from "../ui";
import { MediaPicker } from "../media-picker";
import { COLLECTIONS, has, labelOf, hintOf, whenOf, type Collection, type FieldKey, type Img, type Chapter } from "@/lib/archive/config";
import { ArchiveIcon } from "@/components/archive/icon";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false, loading: () => <p className="px-[54px] py-6 text-zinc-500">Opening the editor…</p> });
type Row = { id: string; section: string | null; slug: string; title: string; subtitle: string | null; person: string | null; recipient: string | null; date: string | null; year: number | null; date_label: string | null; place: string | null; country: string | null; thumb: string | null; photos: number; summary: string | null; status_label: string | null; featured: boolean; position: number; status: string };
type Sec = { key: string; title: string; description: string | null };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ArchivePanel({ coll }: { coll: string }) {
  const c = COLLECTIONS[coll];
  const [data, setData] = useState<{ items: Row[]; sections: Sec[] } | null>(null); const [sec, setSec] = useState(""); const [q, setQ] = useState(""); const [hidden, setHidden] = useState(false);
  const [edit, setEdit] = useState<string | null>(null); const [secs, setSecs] = useState(false); const [sel, setSel] = useState<string[]>([]);
  const load = useCallback(() => api(`/api/admin/archive/${coll}`).then(setData).catch((e) => toast(e.message, true)), [coll]);
  useEffect(() => { load(); }, [load]);
  const items = data?.items || []; const sections = data?.sections || [];
  const shown = useMemo(() => items.filter((r) => (!sec || (sec === "_none" ? !sections.some((s) => s.key === r.section) : r.section === sec)) && (!hidden || r.status !== "published") && (!q || fold([r.title, r.subtitle, r.person, r.recipient, r.place, r.country, r.year].join(" ")).includes(fold(q)))), [items, sec, q, hidden, sections]);
  const loose = items.filter((r) => !sections.some((s) => s.key === r.section)).length;
  const move = async (r: Row, d: number) => { const list = shown; const i = list.findIndex((x) => x.id === r.id); const j = i + d; if (j < 0 || j >= list.length) return; const ids = list.map((x) => x.id); [ids[i], ids[j]] = [ids[j], ids[i]]; await api(`/api/admin/archive/${coll}`, "PATCH", { order: ids }); load(); };
  const bulk = async (set: Record<string, string | null>) => { await api(`/api/admin/archive/${coll}`, "PATCH", { ids: sel, set }).catch((e) => toast(e.message, true)); setSel([]); load(); };

  if (edit) return <ItemEditor c={c} id={edit} sections={sections} defSection={sec && sec !== "_none" ? sec : sections[0]?.key || ""} onClose={() => { setEdit(null); load(); }} />;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white"><ArchiveIcon name={c.icon} className="size-5 text-zinc-700" /></span>
          <div><h1 className="text-[20px] font-semibold tracking-tight text-zinc-950">{c.label}</h1><p className="mt-0.5 max-w-2xl text-[13px] text-zinc-500">{c.intro}</p></div></div>
        <div className="flex flex-wrap gap-2"><a href={c.base} target="_blank"><Btn><ExternalLink />View on website</Btn></a><Btn onClick={() => setSecs(true)}><ListTree />Sections</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add {c.singular}</Btn></div>
      </div>
      <div className="mb-3 flex gap-1 overflow-x-auto border-b border-zinc-200 [scrollbar-width:none]">
        {[["", "All", items.length] as const, ...sections.map((s) => [s.key, s.title, items.filter((r) => r.section === s.key).length] as const), ...(loose ? [["_none", "No section", loose] as const] : [])].map(([k, l, n]) => (
          <button key={k} onClick={() => setSec(k)} className={cn("-mb-px shrink-0 border-b-2 px-3 py-2 text-[13px] transition", sec === k ? "border-zinc-900 font-medium text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-900")}>{l} <span className="text-[11.5px] text-zinc-400">{n}</span></button>))}
      </div>
      {sec && sec !== "_none" && <p className="mb-3 text-[12.5px] text-zinc-500">{sections.find((s) => s.key === sec)?.description}</p>}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${c.label.toLowerCase()}`} className="pl-8" /></div>
        <label className="flex items-center gap-2 text-[12.5px] text-zinc-600"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />Only hidden</label>
      </div>
      {sel.length > 0 && <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
        <span className="px-1 text-[12.5px] font-medium">{sel.length} selected</span>
        <Select className="!h-8 !w-auto" value="" onChange={(e) => e.target.value && bulk({ section: e.target.value })}><option value="">Move to section…</option>{sections.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}</Select>
        <Btn size="sm" onClick={() => bulk({ status: "published" })}><Eye />Show</Btn><Btn size="sm" onClick={() => bulk({ status: "draft" })}><EyeOff />Hide</Btn>
        <button onClick={() => setSel([])} className="ml-auto px-2 text-[12px] text-zinc-500">Clear</button>
      </div>}
      {data && !items.length ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center"><ArchiveIcon name={c.icon} className="size-8 text-zinc-300" /><p className="mt-3 text-[14px] font-medium">Nothing here yet</p><p className="mt-1 max-w-md text-[13px] text-zinc-500">Add the first {c.singular}. Sections ({sections.map((s) => s.title).join(", ")}) can be renamed or added under “Sections”.</p><Btn kind="primary" className="mt-4" onClick={() => setEdit("new")}><Plus />Add {c.singular}</Btn></Card>
      ) : (
        <Card className="divide-y divide-zinc-100">
          {shown.map((r, i) => (
            <div key={r.id} className="group flex items-center gap-3 px-3 py-2 hover:bg-zinc-50">
              <input type="checkbox" checked={sel.includes(r.id)} onChange={(e) => setSel((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))} />
              <button onClick={() => setEdit(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                {r.thumb ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.thumb} alt="" className={cn("size-10 shrink-0 object-cover", c.layout === "people" || c.layout === "quotes" ? "rounded-full" : "rounded-md")} /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400"><ImageIcon className="size-4" /></span>}
                <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[13.5px] font-medium text-zinc-900">{r.title}</span>{r.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}</span>
                  <span className="block truncate text-[12px] text-zinc-500">{[c.layout === "letters" ? [r.person, r.recipient].filter(Boolean).join(" → ") : r.person, r.subtitle, whenOf(r as any, true), [r.place, r.country].filter(Boolean).join(", "), r.photos ? `${r.photos} photos` : "", r.status_label].filter(Boolean).join(" · ")}</span></span>
                {!sec && <span className="hidden shrink-0 text-[11.5px] text-zinc-400 md:block">{sections.find((s) => s.key === r.section)?.title || "No section"}</span>}
                {r.status !== "published" && <Badge>Hidden</Badge>}
              </button>
              {sec && <span className="flex shrink-0 opacity-0 transition group-hover:opacity-100"><button disabled={i === 0} onClick={() => move(r, -1)} className="rounded p-1 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30" title="Move up"><ArrowUp className="size-3.5" /></button><button disabled={i === shown.length - 1} onClick={() => move(r, 1)} className="rounded p-1 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30" title="Move down"><ArrowDown className="size-3.5" /></button></span>}
            </div>))}
          {data && items.length > 0 && !shown.length && <p className="p-8 text-center text-[13px] text-zinc-500">Nothing matches.</p>}
        </Card>)}
      {secs && <SectionsEditor coll={coll} sections={sections} onClose={() => setSecs(false)} onSaved={() => { setSecs(false); load(); }} />}
    </div>
  );
}

function SectionsEditor({ coll, sections, onClose, onSaved }: { coll: string; sections: Sec[]; onClose: () => void; onSaved: () => void }) {
  const [list, setList] = useState<(Sec & { key: string })[]>(sections.map((s) => ({ ...s }))); const [busy, setBusy] = useState(false);
  const set = (i: number, k: string, v: string) => setList((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const mv = (i: number, d: number) => setList((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; });
  return (
    <Modal wide title="Sections" description="Sections group the items on the website, in this order. Removing a section moves its items to the first section." onClose={onClose}>
      <div className="space-y-2">{list.map((s, i) => (
        <div key={s.key || i} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-2">
          <div className="flex flex-col"><button onClick={() => mv(i, -1)} className="rounded p-0.5 hover:bg-zinc-100"><ArrowUp className="size-3.5" /></button><button onClick={() => mv(i, 1)} className="rounded p-0.5 hover:bg-zinc-100"><ArrowDown className="size-3.5" /></button></div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2"><Input value={s.title} onChange={(e) => set(i, "title", e.target.value)} placeholder="Section name" /><Input value={s.description || ""} onChange={(e) => set(i, "description", e.target.value)} placeholder="Short description (optional)" /></div>
          <button onClick={() => setList((l) => l.filter((_, j) => j !== i))} className="rounded p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600" title="Remove"><Trash2 className="size-4" /></button>
        </div>))}</div>
      <Btn size="sm" className="mt-3" onClick={() => setList((l) => [...l, { key: "", title: "", description: "", position: l.length }])}><Plus />Add a section</Btn>
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} onClick={async () => { setBusy(true); try { await api(`/api/admin/archive/${coll}/sections`, "POST", { sections: list }); toast("Sections saved."); onSaved(); } catch (e: any) { toast(e.message, true); setBusy(false); } }}>Save sections</Btn></div>
    </Modal>
  );
}

function ItemEditor({ c, id, sections, defSection, onClose }: { c: Collection; id: string; sections: Sec[]; defSection: string; onClose: () => void }) {
  const [a, setA] = useState<any>(id === "new" ? { status: "published", section: defSection, images: [], chapters: [], links: [], tags: [], related: [], body: [] } : null);
  const [cur, setCur] = useState(id); const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false); const [pick, setPick] = useState<null | "cover" | "images">(null); const body = useRef<any[] | null>(null);
  useEffect(() => { if (id !== "new") api(`/api/admin/archive/${c.key}/${id}`).then(setA).catch((e) => toast(e.message, true)); }, [id, c.key]);
  const set = (k: string, v: any) => { setA((p: any) => ({ ...p, [k]: v })); setDirty(true); };
  const save = async () => {
    if (!a.title?.trim()) return toast("Please give a title.", true); setBusy(true);
    const payload = { ...a, body: body.current || a.body || [] };
    try { if (cur === "new") { const r = await api<{ id: string; slug: string }>(`/api/admin/archive/${c.key}`, "POST", payload); setCur(r.id); setA((p: any) => ({ ...p, slug: r.slug })); } else { const r = await api<{ slug: string }>(`/api/admin/archive/${c.key}/${cur}`, "PATCH", payload); if (r.slug) setA((p: any) => ({ ...p, slug: r.slug })); } toast("Saved."); setDirty(false); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(false); }
  };
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  if (!a) return <p className="p-6 text-zinc-500">Opening…</p>;
  const F = (k: FieldKey, fb: string, el: React.ReactNode) => has(c, k) ? <Field label={labelOf(c, k, fb)} hint={hintOf(c, k)}>{el}</Field> : null;
  const inp = (k: FieldKey, fb: string, ph?: string, type = "text") => F(k, fb, <Input type={type} value={a[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={ph} />);
  const wide = has(c, "body");
  return (
    <div className="-mx-4 -my-8 sm:-mx-8">
      <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-8">
        <Btn size="sm" kind="ghost" onClick={() => { if (!dirty || confirm("Leave without saving?")) onClose(); }}><ArrowLeft />{c.label}</Btn>
        <span className="flex-1 truncate text-[12.5px] text-zinc-500">{dirty ? "Unsaved changes" : cur === "new" ? `New ${c.singular}` : "Saved"}</span>
        <Select value={a.status} onChange={(e) => set("status", e.target.value)} className="!h-8 !w-auto"><option value="published">Live</option><option value="draft">Hidden</option></Select>
        {a.slug && a.status === "published" && <a href={`${c.base}/${a.slug}`} target="_blank"><Btn size="sm"><ExternalLink />View</Btn></a>}
        <Btn size="sm" kind="primary" busy={busy} onClick={save}>Save</Btn>
      </div>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <textarea value={a.title || ""} onChange={(e) => set("title", e.target.value)} rows={1} placeholder={c.layout === "people" ? "Initiated name" : c.layout === "chain" ? "Name of the ācārya" : "Title"} className="w-full resize-none bg-transparent text-[28px] font-bold leading-tight tracking-tight outline-none [field-sizing:content] placeholder:text-zinc-300" />
          {has(c, "subtitle") && <input value={a.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder={labelOf(c, "subtitle", "Subtitle")} className="mt-1 w-full bg-transparent text-[15px] text-zinc-500 outline-none placeholder:text-zinc-300" />}
          {has(c, "summary") && <Field label={labelOf(c, "summary", "Summary")} hint={hintOf(c, "summary")} className="mt-5"><Textarea rows={2} value={a.summary || ""} onChange={(e) => set("summary", e.target.value)} /></Field>}
          {has(c, "images") && <ImagesEditor c={c} images={a.images || []} cover={a.cover} onChange={(v) => set("images", v)} onCover={(u) => set("cover", u)} onAdd={() => setPick("images")} />}
          {has(c, "chapters") && <ChaptersEditor label={labelOf(c, "chapters", "Chapters")} hint={hintOf(c, "chapters")} value={a.chapters || []} onChange={(v) => set("chapters", v)} />}
          {wide && <><p className="mt-6 text-[12px] font-medium text-zinc-700">{labelOf(c, "body", "Full text")} <span className="font-normal text-zinc-400">— type “/” for headings, pictures, quotes, videos…</span></p>
            <div className="site-canvas -mx-[54px] mt-1 min-h-[40vh] rounded-lg"><NotionEditor initial={a.body || []} pageId="" onChange={(b) => { body.current = b; setDirty(true); }} /></div></>}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <Card className="space-y-4 p-4">
            <Field label="Section"><Select value={a.section || ""} onChange={(e) => set("section", e.target.value)}><option value="">—</option>{sections.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}</Select></Field>
            {inp("person", "Person")}{inp("person_role", "Role")}{inp("recipient", "To")}
            {has(c, "status_label") && <Field label={labelOf(c, "status_label", "Status")}><Input list="dl-status" value={a.status_label || ""} onChange={(e) => set("status_label", e.target.value)} /><datalist id="dl-status">{["Ongoing", "Completed", "Upcoming", "Planned"].map((x) => <option key={x} value={x} />)}</datalist></Field>}
            {(has(c, "date") || has(c, "year") || has(c, "date_label")) && <div className="grid grid-cols-2 gap-2">{inp("date", "Date", "", "date")}{inp("year", "Year", "", "number")}<div className="col-span-2">{inp("date_label", "Date as written", "e.g. Kārttika 1986")}</div></div>}
            {inp("place", "Place")}{inp("region", "City / state")}{inp("country", "Country")}
            {has(c, "cover") && <Field label={labelOf(c, "cover", "Picture")} hint={hintOf(c, "cover")}><div className="flex items-center gap-3">{a.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="size-16 rounded-md object-cover" /> : <span className="flex size-16 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-400"><ImageIcon className="size-5" /></span>}<div className="flex flex-col gap-1.5"><Btn size="sm" onClick={() => setPick("cover")}>{a.cover ? "Change" : "Choose or upload"}</Btn>{a.cover && <Btn size="sm" onClick={() => set("cover", null)}>Remove</Btn>}</div></div><Input className="mt-2" value={a.cover || ""} onChange={(e) => set("cover", e.target.value)} placeholder="…or paste a link" /></Field>}
            {inp("media", "Audio or video", "https://…")}
            {has(c, "links") && <Field label={labelOf(c, "links", "Links")} hint={hintOf(c, "links") || "One per line: Label | https://…"}><Textarea rows={3} value={(a.links || []).map((l: any) => `${l.label} | ${l.url}`).join("\n")} onChange={(e) => set("links", e.target.value.split("\n").map((l) => { const [x, ...y] = l.split("|"); return { label: x.trim(), url: y.join("|").trim() }; }).filter((l) => l.label || l.url))} /></Field>}
            {has(c, "tags") && <Field label="Tags" hint="Separate with commas"><Input value={(a.tags || []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((x) => x.trimStart()))} /></Field>}
            <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!a.featured} onChange={(e) => set("featured", e.target.checked)} /><Star className="size-3.5 text-amber-500" />Feature it (shown first)</label>
          </Card>
          {has(c, "related") && c.related && <RelatedPicker c={c} coll={c.related} value={a.related || []} onChange={(v) => set("related", v)} />}
          {cur !== "new" && <Btn size="sm" kind="danger" onClick={async () => { if (!confirm(`Delete this ${c.singular}?`)) return; await api(`/api/admin/archive/${c.key}/${cur}`, "DELETE"); onClose(); }}><Trash2 />Delete {c.singular}</Btn>}
        </aside>
      </div>
      {pick && <MediaPicker multiple={pick === "images"} onClose={() => setPick(null)} onPick={(xs) => { if (pick === "cover") set("cover", xs[0]?.url || null); else set("images", [...(a.images || []), ...xs.map((x) => ({ url: x.url, caption: x.alt || "" }))]); setPick(null); }} />}
    </div>
  );
}

function ImagesEditor({ c, images, cover, onChange, onCover, onAdd }: { c: Collection; images: Img[]; cover: string | null; onChange: (v: Img[]) => void; onCover: (u: string) => void; onAdd: () => void }) {
  const [paste, setPaste] = useState("");
  const up = (i: number, k: keyof Img, v: string) => onChange(images.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const mv = (i: number, d: number) => { const n = [...images]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-end justify-between"><div><p className="text-[12px] font-medium text-zinc-700">{labelOf(c, "images", "Photos")} <span className="text-zinc-400">({images.length})</span></p>{hintOf(c, "images") && <p className="text-[11.5px] text-zinc-500">{hintOf(c, "images")}</p>}</div><Btn size="sm" onClick={onAdd}><Plus />Add photos</Btn></div>
      {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{images.map((m, i) => (
        <div key={m.url + i} className="group overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="relative aspect-square bg-zinc-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={m.url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition group-hover:opacity-100"><span className="flex gap-0.5"><button onClick={() => mv(i, -1)} className="rounded bg-white/90 p-1"><ArrowUp className="size-3 -rotate-90" /></button><button onClick={() => mv(i, 1)} className="rounded bg-white/90 p-1"><ArrowDown className="size-3 -rotate-90" /></button></span><button onClick={() => onChange(images.filter((_, j) => j !== i))} className="rounded bg-white/90 p-1 text-red-600"><X className="size-3" /></button></div>
            {has(c, "cover") && <button onClick={() => onCover(m.url)} className={cn("absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10.5px]", cover === m.url ? "bg-zinc-900 text-white" : "bg-white/90 opacity-0 group-hover:opacity-100")}>{cover === m.url ? "Cover" : "Make cover"}</button>}
          </div>
          <input value={m.caption || ""} onChange={(e) => up(i, "caption", e.target.value)} placeholder="Caption" className="w-full border-t border-zinc-100 px-2 py-1.5 text-[12px] outline-none" />
        </div>))}</div>}
      <div className="mt-2 flex gap-2"><Input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="…or paste picture links (one per line or separated by spaces)" /><Btn size="sm" disabled={!paste.trim()} onClick={() => { onChange([...images, ...paste.split(/\s+/).filter((u) => /^https?:\/\/|^\//.test(u)).map((url) => ({ url, caption: "" }))]); setPaste(""); }}><Link2 />Add</Btn></div>
    </div>
  );
}

function ChaptersEditor({ label, hint, value, onChange }: { label: string; hint?: string; value: Chapter[]; onChange: (v: Chapter[]) => void }) {
  const up = (i: number, k: keyof Chapter, v: string) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="mt-6">
      <p className="text-[12px] font-medium text-zinc-700">{label}</p>{hint && <p className="text-[11.5px] text-zinc-500">{hint}</p>}
      <div className="mt-2 space-y-2">{value.map((ch, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 p-3"><div className="flex gap-2"><Input value={ch.title} onChange={(e) => up(i, "title", e.target.value)} placeholder="Chapter title" className="font-medium" /><button onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-2 text-zinc-400 hover:text-red-600"><Trash2 className="size-4" /></button></div>
          <Textarea rows={4} className="mt-2" value={ch.text} onChange={(e) => up(i, "text", e.target.value)} placeholder="What to tell in this chapter" /></div>))}</div>
      <Btn size="sm" className="mt-2" onClick={() => onChange([...value, { title: "", text: "" }])}><Plus />Add a chapter</Btn>
    </div>
  );
}

function RelatedPicker({ c, coll, value, onChange }: { c: Collection; coll: string; value: string[]; onChange: (v: string[]) => void }) {
  const [all, setAll] = useState<Row[]>([]); const [q, setQ] = useState("");
  useEffect(() => { api(`/api/admin/archive/${coll}`).then((d) => setAll(d.items)).catch(() => {}); }, [coll]);
  const picked = all.filter((r) => value.includes(r.id)); const found = q ? all.filter((r) => !value.includes(r.id) && fold(`${r.title} ${r.person || ""}`).includes(fold(q))).slice(0, 8) : [];
  return (
    <Card className="p-4"><p className="text-[12.5px] font-medium">{labelOf(c, "related", "Related")}</p>{hintOf(c, "related") && <p className="text-[11.5px] text-zinc-500">{hintOf(c, "related")}</p>}
      <div className="mt-2 space-y-1">{picked.map((r) => <div key={r.id} className="flex items-center gap-2 rounded-md bg-zinc-50 px-2 py-1 text-[12.5px]"><span className="min-w-0 flex-1 truncate">{r.title}{r.person ? ` — ${r.person}` : ""}</span><button onClick={() => onChange(value.filter((x) => x !== r.id))}><X className="size-3.5 text-zinc-400" /></button></div>)}</div>
      <Input className="mt-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search to add…" />
      {found.map((r) => <button key={r.id} onClick={() => { onChange([...value, r.id]); setQ(""); }} className="block w-full truncate rounded px-2 py-1 text-left text-[12.5px] hover:bg-zinc-100">{r.title}{r.person ? ` — ${r.person}` : ""}</button>)}
    </Card>
  );
}
