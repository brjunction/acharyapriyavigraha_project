"use client";
/* Studio → Videos → Page sections: how the Videos page is organised. Each section has a design and a colour,
   is fed by playlists or channels, and every video in it can be reordered, moved to another section or removed. */
import { useCallback, useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, Eye, EyeOff, Home, ChevronsUp, ChevronsDown, Youtube, Unlink, Check, LayoutGrid, GripVertical, X, Copy, FolderInput } from "lucide-react";
import { Btn, Badge, Card, Input, Select, Textarea, Empty, api, toast, cn } from "../ui";
import { LAYOUTS, COLORS } from "@/lib/video-layouts";

type Sec = { id: string; name: string; slug: string; intro: string | null; layout: string; color: string; position: number; on_home: boolean; on_tabs: boolean; hidden: boolean; videos: number; kinds: string[] };
const KINDS: [string, string][] = [["lecture", "Lectures"], ["short", "Shorts"], ["daily-diary", "Daily diary"], ["kirtan", "Kīrtanas"], ["festival", "Festivals"], ["darshan", "Darśanas"], ["documentary", "Documentaries"], ["memory", "Memories"], ["other", "Other"]];
type Src = { id: string; name: string | null; url: string; kind: string; avatar: string | null; section_id: string | null; new_on_top: boolean; last_synced_at: string | null };
type It = { youtube_id: string; slug: string | null; title: string | null; duration_sec: number | null; status: string | null; kind?: string | null };
const SW: Record<string, string> = { saffron: "#c2621d", rose: "#b8435a", teal: "#1f7a75", indigo: "#4252a8", leaf: "#3f7d3a", gold: "#b08414", plum: "#7b3f9e" };
const dur = (s?: number | null) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

/** Small drawings of each design, so the choice is clear at a glance. */
function Sketch({ k }: { k: string }) {
  const b = "rounded-[3px] bg-current opacity-30"; const s = "rounded-[3px] bg-current opacity-20";
  return (
    <div className="flex h-12 w-full gap-1 p-1.5">
      {k === "featured" && <><div className={`${b} w-[62%]`} /><div className="flex flex-1 flex-col gap-1"><div className={`${s} flex-1`} /><div className={`${s} flex-1`} /><div className={`${s} flex-1`} /></div></>}
      {k === "spotlight" && <div className="flex w-full flex-col gap-1"><div className={`${b} flex-[2]`} /><div className="flex flex-1 gap-1"><div className={`${s} flex-1`} /><div className={`${s} flex-1`} /><div className={`${s} flex-1`} /><div className={`${s} flex-1`} /></div></div>}
      {k === "row" && <div className="flex w-full items-center gap-1"><div className={`${b} h-[70%] flex-1`} /><div className={`${b} h-[70%] flex-1`} /><div className={`${b} h-[70%] flex-1`} /><div className={`${s} h-[70%] w-3`} /></div>}
      {k === "grid" && <div className="grid w-full grid-cols-4 gap-1">{Array.from({ length: 8 }).map((_, i) => <div key={i} className={b} />)}</div>}
      {k === "shorts" && <div className="flex w-full gap-1">{Array.from({ length: 6 }).map((_, i) => <div key={i} className={`${b} flex-1`} />)}</div>}
      {k === "carousel" && <div className="relative w-full"><div className={`${b} h-full`} /><div className="absolute inset-x-0 bottom-1 flex justify-center gap-1"><span className="size-1 rounded-full bg-current" /><span className="size-1 rounded-full bg-current opacity-40" /><span className="size-1 rounded-full bg-current opacity-40" /></div></div>}
      {k === "list" && <div className="flex w-full flex-col gap-1">{[0, 1, 2].map((i) => <div key={i} className="flex flex-1 gap-1"><div className={`${b} w-1/4`} /><div className={`${s} flex-1`} /></div>)}</div>}
      {k === "channels" && <div className="flex w-full items-center justify-around">{[0, 1, 2, 3].map((i) => <div key={i} className={`${b} size-7 rounded-full`} />)}</div>}
      {k === "playlists" && <div className="flex w-full gap-1.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="relative flex-1"><div className={`${s} absolute inset-x-1 -top-0.5 h-1`} /><div className={`${b} h-full`} /></div>)}</div>}
    </div>
  );
}

export function VideoSections({ onSources }: { onSources: () => void }) {
  // Everything is edited here first (instant), then sent at once with Publish.
  const [d, setD] = useState<{ sections: Sec[]; sources: Src[] } | null>(null);
  const [secs, setSecs] = useState<Sec[]>([]); const [deleted, setDeleted] = useState<string[]>([]);
  const [itemsOf, setItemsOf] = useState<Record<string, It[]>>({}); const [touched, setTouched] = useState<Set<string>>(new Set()); const [adds, setAdds] = useState<Record<string, string[]>>({});
  const [dirty, setDirty] = useState(false); const [publishing, setPublishing] = useState(false);
  const [cur, setCur] = useState<string | null>(null); const [name, setName] = useState(""); const [links, setLinks] = useState(""); const [busy, setBusy] = useState(""); const [log, setLog] = useState<{ ok: boolean; note: string }[]>([]); const [show, setShow] = useState(100);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [last, setLast] = useState(-1); const [drag, setDrag] = useState<number | null>(null); const [over, setOver] = useState<number | null>(null);
  const API = "/api/admin/videos/sections";
  const loadAll = useCallback(async (keepCur?: string | null) => {
    try { const r = await api<any>(API); setD(r); setSecs(r.sections); setDeleted([]); setItemsOf({}); setTouched(new Set()); setAdds({}); setDirty(false); setCur((c) => keepCur ?? c ?? r.sections[0]?.id ?? null); } catch (e: any) { toast(e.message, true); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);
  // A section's videos are fetched once, when it is first opened.
  useEffect(() => { if (!cur || itemsOf[cur]) return; api<any>(`${API}?id=${cur}`).then((r) => setItemsOf((m) => (m[cur] ? m : { ...m, [cur]: r.items }))).catch((e) => toast(e.message, true)); }, [cur, itemsOf]);
  useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);
  const post = async (body: any) => { try { return await api<any>(API, "POST", body); } catch (e: any) { toast(e.message, true); } };
  const publish = async () => {
    setPublishing(true);
    const items: Record<string, string[]> = {}; touched.forEach((id) => { if (itemsOf[id] && !deleted.includes(id)) items[id] = itemsOf[id].map((x) => x.youtube_id); });
    const r = await post({ publish: { sections: secs.map((x, i) => ({ id: x.id, name: x.name, intro: x.intro, layout: x.layout, color: x.color, on_home: x.on_home, hidden: x.hidden, kinds: x.kinds, position: i, on_tabs: x.on_tabs })), deleted, items, adds } });
    setPublishing(false); if (r) { toast("Published — the website shows it now."); await loadAll(cur); }
  };
  /** Server actions that read YouTube publish pending changes first, then reload. */
  const server = async (body: any) => { if (dirty) await publish(); const r = await post(body); await loadAll(cur); return r; };
  const s = secs.find((x) => x.id === cur);
  const items = (cur && itemsOf[cur]) || [];
  const mark = (id?: string | null) => { if (id) setTouched((t) => new Set(t).add(id)); setDirty(true); };
  const setItems = (next: It[], id = cur) => { if (!id) return; setItemsOf((m) => ({ ...m, [id]: next })); mark(id); };
  const mv = (i: number, j: number) => { if (j < 0 || j >= items.length) return; const c = [...items]; const [x] = c.splice(i, 1); c.splice(j, 0, x); setItems(c); };
  const moveSec = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= secs.length) return; const c = [...secs]; [c[i], c[j]] = [c[j], c[i]]; setSecs(c); setDirty(true); };
  const up = (p: Partial<Sec>) => { setSecs((xs) => xs.map((x) => (x.id === cur ? { ...x, ...p } : x))); setDirty(true); };
  // Tick many: a click ticks one; Shift+click ticks everything between.
  const tick = (i: number, shift: boolean) => setSel((old) => { const n = new Set(old); const y = items[i].youtube_id; if (shift && last >= 0) { const [a, z] = [Math.min(last, i), Math.max(last, i)]; for (let k = a; k <= z; k++) n.add(items[k].youtube_id); } else if (n.has(y)) n.delete(y); else n.add(y); setLast(i); return n; });
  const sendTo = (to: string, moving: It[]) => { if (itemsOf[to]) { const have = new Set(itemsOf[to].map((x) => x.youtube_id)); setItems([...itemsOf[to], ...moving.filter((x) => !have.has(x.youtube_id))], to); } else { setAdds((a) => ({ ...a, [to]: [...(a[to] || []), ...moving.map((x) => x.youtube_id)] })); setDirty(true); } };
  const bulk = (op: string, to?: string) => {
    const picked = items.filter((x) => sel.has(x.youtube_id)); const rest = items.filter((x) => !sel.has(x.youtube_id));
    if (op === "top") setItems([...picked, ...rest]); else if (op === "bottom") setItems([...rest, ...picked]); else if (op === "drop") setItems(rest);
    else if (to) { sendTo(to, picked); if (op === "move") setItems(rest); }
    setSel(new Set());
  };
  const dropOne = (yt: string) => setItems(items.filter((x) => x.youtube_id !== yt));
  const drop = (to: number) => { if (drag === null || drag === to) return; const c = [...items]; const [x] = c.splice(drag, 1); c.splice(to, 0, x); setItems(c); setDrag(null); setOver(null); };
  const attached = (d?.sources || []).filter((x) => x.section_id === cur); const free = (d?.sources || []).filter((x) => !x.section_id);

  return (
    <div>
    {/* Publish bar: changes are made here instantly and go to the website in one step */}
    <div className={cn("sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 transition", dirty ? "border-amber-300 bg-amber-50 shadow-sm" : "border-zinc-200 bg-white")}>
      <span className={cn("size-2.5 rounded-full", dirty ? "bg-amber-500" : "bg-emerald-500")} />
      <p className="flex-1 text-[13px]">{dirty ? <><b>Unpublished changes.</b> Keep arranging — nothing is sent until you publish.</> : "Everything is published."}</p>
      {dirty && <Btn size="sm" disabled={publishing} onClick={() => confirm("Throw away the changes made since the last publish?") && loadAll(cur)}>Discard</Btn>}
      <Btn kind="primary" busy={publishing} disabled={!dirty} onClick={publish}><Check />Publish</Btn>
    </div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      {[["1", "Sections", "Each section is a tab and a block on the Videos page — Shorts, SG Diary, GGS Enhanced… Order them on the left."], ["2", "What goes in", "Tick kinds (e.g. Shorts + Daily diary) and/or paste playlist or channel links. New videos join by themselves."], ["3", "Arrange", "Drag to reorder. Tick many videos to move them to the top, to another section, or remove them."]].map(([n, t, x]) => (
        <div key={n} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[12px] font-semibold text-white">{n}</span><span><span className="block text-[13px] font-semibold">{t}</span><span className="block text-[12px] leading-snug text-zinc-500">{x}</span></span></div>))}
    </div>
    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <Card className="p-3">
          <p className="mb-2 text-[13px] font-semibold">New section</p>
          <div className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SG Diary, GGS Enhanced, Shorts" onKeyDown={(e) => e.key === "Enter" && name.trim() && post({ create: { name } }).then((r) => { setName(""); if (r?.id) { setSecs((xs) => [...xs, { ...r, videos: 0, kinds: [] }]); setItemsOf((m) => ({ ...m, [r.id]: [] })); setCur(r.id); } })} />
            <Btn kind="primary" disabled={!name.trim()} onClick={() => post({ create: { name } }).then((r) => { setName(""); if (r?.id) { setSecs((xs) => [...xs, { ...r, videos: 0, kinds: [] }]); setItemsOf((m) => ({ ...m, [r.id]: [] })); setCur(r.id); } })}><Plus /></Btn></div>
        </Card>
        <Card className="overflow-hidden">
          <p className="border-b border-zinc-100 px-3 py-2.5 text-[12px] font-medium text-zinc-500">Order on the Videos page — tabs follow this order</p>
          {secs.length ? secs.map((x, i) => (
            <div key={x.id} className={cn("group flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5 last:border-0", x.id === cur ? "bg-zinc-50" : "hover:bg-zinc-50/60", x.hidden && "opacity-50")}>
              <span className="size-3 shrink-0 rounded-full" style={{ background: SW[x.color] }} />
              <button onClick={() => { setCur(x.id); setShow(100); setLog([]); setSel(new Set()); }} className="min-w-0 flex-1 text-left"><span className="block truncate text-[13.5px] font-medium">{x.name}</span><span className="block text-[11.5px] text-zinc-500">{LAYOUTS.find(([k]) => k === x.layout)?.[1].split(" — ")[0]} · {x.videos} videos{x.on_home && x.on_tabs !== false ? " · Home + tab" : x.on_home ? " · Home only" : x.on_tabs !== false ? " · tab only" : " · hidden from both"}</span></button>
              <span className="flex flex-col opacity-0 group-hover:opacity-100"><button onClick={() => moveSec(i, -1)} className="text-zinc-400 hover:text-zinc-900"><ArrowUp className="size-3.5" /></button><button onClick={() => moveSec(i, 1)} className="text-zinc-400 hover:text-zinc-900"><ArrowDown className="size-3.5" /></button></span>
            </div>)) : <p className="p-3 text-[12.5px] text-zinc-500">No sections yet. Make the first one above.</p>}
        </Card>
      </aside>

      {!s ? <Empty icon={LayoutGrid} title="Make a section" text="Sections are the tabs and blocks of the Videos page: Shorts, SG Diary, GGS Enhanced and so on." /> : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="size-4 rounded-full" style={{ background: SW[s.color] }} />
              <input key={`n${s.id}`} defaultValue={s.name} onBlur={(e) => e.target.value.trim() && e.target.value !== s.name && up({ name: e.target.value })} className="min-w-0 flex-1 rounded px-1 text-[18px] font-semibold outline-none hover:bg-zinc-50 focus:bg-zinc-50" />
              <Btn size="sm" onClick={() => up({ on_home: !s.on_home })} title="Show a few of its videos on the Videos Home">{s.on_home ? <Check className="text-emerald-600" /> : <Home />}{s.on_home ? "On Home" : "Not on Home"}</Btn>
              <Btn size="sm" onClick={() => up({ on_tabs: !s.on_tabs })} title="Show it as a tab along the top of the Videos pages">{s.on_tabs ? <Check className="text-emerald-600" /> : <LayoutGrid />}{s.on_tabs ? "As a tab" : "No tab"}</Btn>
              <Btn size="sm" onClick={() => up({ hidden: !s.hidden })}>{s.hidden ? <EyeOff /> : <Eye />}{s.hidden ? "Hidden" : "Shown"}</Btn>
              <a href={`/teachings/videos/s/${s.slug}`} target="_blank" className="text-[12.5px] text-zinc-500 underline">Open</a>
              <button onClick={() => confirm(`Delete the section “${s.name}”? Its videos stay in the archive.`) && (() => { setDeleted((dl) => [...dl, s.id]); setSecs((xs) => xs.filter((x) => x.id !== s.id)); setCur(secs.find((x) => x.id !== s.id)?.id || null); setDirty(true); })()} className="p-1.5 text-zinc-400 hover:text-red-600" title="Delete section"><Trash2 className="size-4" /></button>
            </div>
            <input key={`i${s.id}`} defaultValue={s.intro || ""} placeholder="A short line under the name (optional)" onBlur={(e) => e.target.value !== (s.intro || "") && up({ intro: e.target.value })} className="mt-1 w-full rounded px-1 text-[13px] text-zinc-600 outline-none hover:bg-zinc-50 focus:bg-zinc-50" />
            <p className="mb-2 mt-4 text-[12px] font-medium text-zinc-500">Design</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {LAYOUTS.map(([k, l]) => (
                <button key={k} onClick={() => up({ layout: k })} className={cn("rounded-xl border p-1.5 text-left transition", s.layout === k ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400")} style={{ color: SW[s.color] }}>
                  <Sketch k={k} /><span className="block px-1 pb-0.5 text-[12px] font-medium text-zinc-900">{l.split(" — ")[0]}</span><span className="block px-1 text-[11px] leading-snug text-zinc-500">{l.split(" — ")[1]}</span>
                </button>))}
            </div>
            <p className="mb-2 mt-4 text-[12px] font-medium text-zinc-500">Colour</p>
            <div className="flex flex-wrap gap-2">{COLORS.map((c) => <button key={c} title={c} onClick={() => up({ color: c })} className={cn("size-8 rounded-full ring-offset-2 transition", s.color === c && "ring-2 ring-zinc-900")} style={{ background: SW[c] }} />)}</div>
            {s.layout !== "playlists" && s.layout !== "channels" && <>
              <p className="mb-1 mt-4 text-[12px] font-medium text-zinc-500">Include every video of these kinds — automatically, now and later</p>
              <div className="flex flex-wrap gap-1.5">{KINDS.map(([k, l]) => { const on = (s.kinds || []).includes(k); return <button key={k} onClick={() => up({ kinds: on ? s.kinds.filter((x) => x !== k) : [...(s.kinds || []), k] })} className={cn("flex items-center gap-1 rounded-full border px-3 py-1 text-[12.5px] transition", on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-400")}>{on && <Check className="size-3.5" />}{l}</button>; })}</div>
            </>}
          </Card>

          <Card className="p-4">
            <p className="text-[13.5px] font-semibold">{s.layout === "playlists" ? "Playlists in this section" : s.layout === "channels" ? "Channels in this section" : "Fed by"} <span className="font-normal text-zinc-500">— {s.layout === "playlists" ? "each shows as one card that plays in order" : s.layout === "channels" ? "each shows as a channel card with its picture" : "new videos from these join this section by themselves"}</span></p>
            <div className="mt-2 space-y-1.5">
              {attached.map((x) => (
                <div key={x.id} className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-2.5 py-2">
                  {x.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.avatar} alt="" className={cn("shrink-0 object-cover", x.kind === "channel" ? "size-8 rounded-full" : "h-8 w-12 rounded")} /> : <Youtube className="size-5 text-red-600" />}
                  <span className="min-w-0 flex-1 truncate text-[13px]">{x.name || x.url} <span className="text-zinc-400">· {x.kind}</span></span>
                  {s.layout !== "playlists" && s.layout !== "channels" && <label className="flex items-center gap-1.5 text-[12px] text-zinc-600"><input type="checkbox" checked={x.new_on_top ?? x.kind === "channel"} onChange={(e) => server({ newOnTop: { source: x.id, on: e.target.checked } })} />New at top</label>}
                  <button onClick={() => server({ detach: { source: x.id } })} title="Take this playlist out of the section — its videos stay" className="flex items-center gap-1 rounded px-1.5 py-1 text-[12px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"><Unlink className="size-3.5" />Unlink</button>
                  <button onClick={() => confirm("Take this playlist out of the section, and remove its videos from the section too?") && server({ detach: { source: x.id, purge: true } })} title="Take it out with its videos" className="flex items-center gap-1 rounded px-1.5 py-1 text-[12px] text-zinc-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" />Remove with videos</button>
                </div>))}
              {!attached.length && <p className="text-[12.5px] text-zinc-500">Nothing yet. Paste a playlist or channel link below, or choose one already added.</p>}
            </div>
            {free.length > 0 && <Select value="" onChange={(e) => e.target.value && server({ attach: { id: s.id, source: e.target.value } })} className="mt-2 !h-8 !w-auto text-[12.5px]"><option value="">Add a playlist or channel already in the Studio…</option>{free.map((x) => <option key={x.id} value={x.id}>{x.name || x.url}</option>)}</Select>}
            <p className="mt-4 text-[13.5px] font-semibold">Add links</p>
            <p className="text-[12px] text-zinc-500">One per line: single videos are added to this section; a playlist or channel link brings in all its videos and keeps feeding this section.</p>
            <Textarea rows={3} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://youtu.be/…\nhttps://www.youtube.com/playlist?list=PL…"} className="mt-2 font-mono text-[12.5px]" />
            <div className="mt-2 flex flex-wrap gap-2">
              {[["end", "Add to the end"], ["top", "Add to the top"]].map(([k, l]) => <Btn key={k} kind={k === "end" ? "primary" : undefined} busy={busy === k} disabled={!links.trim()} onClick={async () => { setBusy(k); const r = await server({ add: { id: s.id, top: k === "top", links: links.split(/[\n\s,]+/).filter(Boolean) } }); setBusy(""); if (r?.results) { setLog(r.results); setLinks(""); } }}><Plus />{l}</Btn>)}
              <Btn onClick={onSources}><Youtube />All channels & playlists</Btn>
            </div>
            {log.length > 0 && <ul className="mt-2 space-y-0.5 rounded-md bg-zinc-50 p-2.5 text-[12px]">{log.map((l, i) => <li key={i} className={l.ok ? "text-zinc-700" : "text-red-600"}>{l.ok ? "✓ " : "✕ "}{l.note}</li>)}</ul>}
          </Card>

          {s.layout !== "playlists" && s.layout !== "channels" && <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
              <input type="checkbox" aria-label="Tick all" checked={!!items.length && sel.size === items.length} onChange={(e) => setSel(e.target.checked ? new Set(items.map((x) => x.youtube_id)) : new Set())} className="size-4" />
              <p className="text-[13.5px] font-semibold">Videos in this section <span className="font-normal text-zinc-500">{items.length} · drag to reorder · the first ones show on Home</span></p>
            </div>
            {sel.size > 0 && (
              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b border-zinc-200 bg-zinc-900 px-4 py-2 text-[12.5px] text-white">
                <b className="mr-1">{sel.size} ticked</b>
                <button onClick={() => bulk("top")} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 hover:bg-white/20"><ChevronsUp className="size-3.5" />To the top</button>
                <button onClick={() => bulk("bottom")} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 hover:bg-white/20"><ChevronsDown className="size-3.5" />To the bottom</button>
                <label className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5"><FolderInput className="size-3.5" /><select value="" onChange={(e) => e.target.value && bulk("move", e.target.value)} className="bg-transparent py-0.5 text-white outline-none [&>option]:text-zinc-900"><option value="">Move to…</option>{secs.filter((x) => x.id !== s.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                <label className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5"><Copy className="size-3.5" /><select value="" onChange={(e) => e.target.value && bulk("copy", e.target.value)} className="bg-transparent py-0.5 text-white outline-none [&>option]:text-zinc-900"><option value="">Also add to…</option>{secs.filter((x) => x.id !== s.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                <button onClick={() => confirm(`Remove ${sel.size} videos from this section? They stay in the archive.`) && bulk("drop")} className="flex items-center gap-1 rounded-md bg-red-500/90 px-2.5 py-1 hover:bg-red-500"><Trash2 className="size-3.5" />Remove</button>
                <button onClick={() => setSel(new Set())} className="ml-auto flex items-center gap-1 text-white/70 hover:text-white"><X className="size-3.5" />Clear</button>
              </div>)}
            {!items.length ? <p className="p-4 text-[12.5px] text-zinc-500">No videos yet — tick kinds above or paste links.</p> : <ol className="divide-y divide-zinc-100">
              {items.slice(0, show).map((v, i) => { const on = sel.has(v.youtube_id); return (
                <li key={v.youtube_id} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver((o) => (o === i ? null : o))} onDrop={() => drop(i)} onDragEnd={() => { setDrag(null); setOver(null); }}
                  className={cn("group flex items-center gap-2.5 px-3 py-2 transition", on ? "bg-zinc-100" : "hover:bg-zinc-50", drag === i && "opacity-40", over === i && drag !== null && drag !== i && "shadow-[inset_0_2px_0_#18181b]")}>
                  <GripVertical className="size-4 shrink-0 cursor-grab text-zinc-300 group-hover:text-zinc-500" />
                  <input type="checkbox" checked={on} onChange={() => {}} onClick={(e) => tick(i, e.shiftKey)} className="size-4 shrink-0" aria-label="Tick" />
                  <span className="w-7 shrink-0 text-right text-[11.5px] tabular-nums text-zinc-400">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-24 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1"><span className="line-clamp-2 text-[13px]">{v.title || <span className="text-zinc-400">Coming with the next fetch</span>}</span><span className="text-[11.5px] text-zinc-400">{[KINDS.find(([k]) => k === v.kind)?.[1], dur(v.duration_sec), v.status && v.status !== "published" ? v.status : ""].filter(Boolean).join(" · ")}</span></span>
                  <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <button title="To the top" onClick={() => mv(i, 0)} className="p-1 text-zinc-500 hover:text-zinc-900"><ChevronsUp className="size-4" /></button>
                    <button title="Up" onClick={() => mv(i, i - 1)} className="p-1 text-zinc-500 hover:text-zinc-900"><ArrowUp className="size-4" /></button>
                    <button title="Down" onClick={() => mv(i, i + 1)} className="p-1 text-zinc-500 hover:text-zinc-900"><ArrowDown className="size-4" /></button>
                    <button title="Remove from this section" onClick={() => dropOne(v.youtube_id)} className="p-1 text-zinc-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                  </span>
                </li>); })}
            </ol>}
            {items.length > show && <div className="p-3 text-center"><Btn size="sm" onClick={() => setShow((n) => n + 200)}>Show more ({items.length - show} left)</Btn></div>}
          </Card>}
          <p className="text-[12px] text-zinc-500"><Badge tone="outline">Tip</Badge> Videos are fetched every night without an API key; your order, moves and removals are kept.</p>
        </div>)}
    </div>
    </div>
  );
}
