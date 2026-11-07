"use client";
/* Studio → Videos → Page sections: how the Videos page is organised. Each section has a design and a colour,
   is fed by playlists or channels, and every video in it can be reordered, moved to another section or removed. */
import { useCallback, useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, Eye, EyeOff, Home, ChevronsUp, Youtube, Unlink, Check, LayoutGrid } from "lucide-react";
import { Btn, Badge, Card, Input, Select, Textarea, Empty, api, toast, cn } from "../ui";
import { LAYOUTS, COLORS } from "@/lib/video-layouts";

type Sec = { id: string; name: string; slug: string; intro: string | null; layout: string; color: string; position: number; on_home: boolean; hidden: boolean; videos: number };
type Src = { id: string; name: string | null; url: string; kind: string; avatar: string | null; section_id: string | null; new_on_top: boolean; last_synced_at: string | null };
type It = { youtube_id: string; slug: string | null; title: string | null; duration_sec: number | null; status: string | null };
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
      {k === "playlists" && <div className="flex w-full gap-1.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="relative flex-1"><div className={`${s} absolute inset-x-1 -top-0.5 h-1`} /><div className={`${b} h-full`} /></div>)}</div>}
    </div>
  );
}

export function VideoSections({ onSources }: { onSources: () => void }) {
  const [d, setD] = useState<{ sections: Sec[]; sources: Src[]; items?: It[] } | null>(null);
  const [cur, setCur] = useState<string | null>(null); const [name, setName] = useState(""); const [links, setLinks] = useState(""); const [busy, setBusy] = useState(""); const [log, setLog] = useState<{ ok: boolean; note: string }[]>([]); const [show, setShow] = useState(100);
  const load = useCallback((id = cur) => api<any>(`/api/admin/videos/sections${id ? `?id=${id}` : ""}`).then((r) => { setD(r); if (!id && r.sections[0]) setCur(r.sections[0].id); }).catch((e) => toast(e.message, true)), [cur]);
  useEffect(() => { load(); }, [cur]); // eslint-disable-line
  const post = async (body: any, quiet = false) => { try { const r = await api<any>("/api/admin/videos/sections", "POST", body); if (!quiet) await load(); return r; } catch (e: any) { toast(e.message, true); } };
  const s = d?.sections.find((x) => x.id === cur);
  const items = d?.items || [];
  const setItems = (next: It[]) => { setD((x) => (x ? { ...x, items: next } : x)); post({ items: { id: cur, ids: next.map((i) => i.youtube_id) } }, true); };
  const mv = (i: number, j: number) => { if (j < 0 || j >= items.length) return; const c = [...items]; const [x] = c.splice(i, 1); c.splice(j, 0, x); setItems(c); };
  const moveSec = (i: number, dir: number) => { const ids = d!.sections.map((x) => x.id); const j = i + dir; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; post({ order: ids }); };
  const up = (p: Partial<Sec>) => post({ update: { id: cur, ...p } });
  const attached = (d?.sources || []).filter((x) => x.section_id === cur); const free = (d?.sources || []).filter((x) => !x.section_id);

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <Card className="p-3">
          <p className="mb-2 text-[13px] font-semibold">New section</p>
          <div className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SG Diary, GGS Enhanced, Shorts" onKeyDown={(e) => e.key === "Enter" && name.trim() && post({ create: { name } }).then((r) => { setName(""); if (r?.id) setCur(r.id); })} />
            <Btn kind="primary" disabled={!name.trim()} onClick={() => post({ create: { name } }).then((r) => { setName(""); if (r?.id) setCur(r.id); })}><Plus /></Btn></div>
        </Card>
        <Card className="overflow-hidden">
          <p className="border-b border-zinc-100 px-3 py-2.5 text-[12px] font-medium text-zinc-500">Order on the Videos page — tabs follow this order</p>
          {d?.sections.length ? d.sections.map((x, i) => (
            <div key={x.id} className={cn("group flex items-center gap-2 border-b border-zinc-100 px-3 py-2.5 last:border-0", x.id === cur ? "bg-zinc-50" : "hover:bg-zinc-50/60", x.hidden && "opacity-50")}>
              <span className="size-3 shrink-0 rounded-full" style={{ background: SW[x.color] }} />
              <button onClick={() => { setCur(x.id); setShow(100); setLog([]); }} className="min-w-0 flex-1 text-left"><span className="block truncate text-[13.5px] font-medium">{x.name}</span><span className="block text-[11.5px] text-zinc-500">{LAYOUTS.find(([k]) => k === x.layout)?.[1].split(" — ")[0]} · {x.videos} videos{x.on_home ? " · on Home" : ""}</span></button>
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
              <Btn size="sm" onClick={() => up({ on_home: !s.on_home })}>{s.on_home ? <Check className="text-emerald-600" /> : <Home />}{s.on_home ? "On Home" : "Show on Home"}</Btn>
              <Btn size="sm" onClick={() => up({ hidden: !s.hidden })}>{s.hidden ? <EyeOff /> : <Eye />}{s.hidden ? "Hidden" : "Shown"}</Btn>
              <a href={`/teachings/videos/s/${s.slug}`} target="_blank" className="text-[12.5px] text-zinc-500 underline">Open</a>
              <button onClick={() => confirm(`Delete the section “${s.name}”? Its videos stay in the archive.`) && post({ remove: s.id }).then(() => setCur(null))} className="p-1.5 text-zinc-400 hover:text-red-600" title="Delete section"><Trash2 className="size-4" /></button>
            </div>
            <input key={`i${s.id}`} defaultValue={s.intro || ""} placeholder="A short line under the name (optional)" onBlur={(e) => e.target.value !== (s.intro || "") && up({ intro: e.target.value })} className="mt-1 w-full rounded px-1 text-[13px] text-zinc-600 outline-none hover:bg-zinc-50 focus:bg-zinc-50" />
            <p className="mb-2 mt-4 text-[12px] font-medium text-zinc-500">Design</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {LAYOUTS.map(([k, l]) => (
                <button key={k} onClick={() => up({ layout: k })} className={cn("rounded-xl border p-1.5 text-left transition", s.layout === k ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400")} style={{ color: SW[s.color] }}>
                  <Sketch k={k} /><span className="block px-1 pb-0.5 text-[12px] font-medium text-zinc-900">{l.split(" — ")[0]}</span><span className="block px-1 text-[11px] leading-snug text-zinc-500">{l.split(" — ")[1]}</span>
                </button>))}
            </div>
            <p className="mb-2 mt-4 text-[12px] font-medium text-zinc-500">Colour</p>
            <div className="flex gap-2">{COLORS.map((c) => <button key={c} title={c} onClick={() => up({ color: c })} className={cn("size-8 rounded-full ring-offset-2 transition", s.color === c && "ring-2 ring-zinc-900")} style={{ background: SW[c] }} />)}</div>
          </Card>

          <Card className="p-4">
            <p className="text-[13.5px] font-semibold">{s.layout === "playlists" ? "Playlists in this section" : "Fed by"} <span className="font-normal text-zinc-500">— {s.layout === "playlists" ? "each shows as one card that plays in order" : "new videos from these join this section by themselves"}</span></p>
            <div className="mt-2 space-y-1.5">
              {attached.map((x) => (
                <div key={x.id} className="flex items-center gap-2.5 rounded-lg border border-zinc-100 px-2.5 py-2">
                  {x.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.avatar} alt="" className={cn("shrink-0 object-cover", x.kind === "channel" ? "size-8 rounded-full" : "h-8 w-12 rounded")} /> : <Youtube className="size-5 text-red-600" />}
                  <span className="min-w-0 flex-1 truncate text-[13px]">{x.name || x.url} <span className="text-zinc-400">· {x.kind}</span></span>
                  {s.layout !== "playlists" && <label className="flex items-center gap-1.5 text-[12px] text-zinc-600"><input type="checkbox" checked={x.new_on_top ?? x.kind === "channel"} onChange={(e) => post({ newOnTop: { source: x.id, on: e.target.checked } })} />New at top</label>}
                  <button onClick={() => post({ detach: { source: x.id } })} title="Stop feeding this section (videos already in it stay)" className="p-1 text-zinc-400 hover:text-zinc-900"><Unlink className="size-4" /></button>
                </div>))}
              {!attached.length && <p className="text-[12.5px] text-zinc-500">Nothing yet. Paste a playlist or channel link below, or choose one already added.</p>}
            </div>
            {free.length > 0 && <Select value="" onChange={(e) => e.target.value && post({ attach: { id: s.id, source: e.target.value } })} className="mt-2 !h-8 !w-auto text-[12.5px]"><option value="">Add a playlist or channel already in the Studio…</option>{free.map((x) => <option key={x.id} value={x.id}>{x.name || x.url}</option>)}</Select>}
            <p className="mt-4 text-[13.5px] font-semibold">Add links</p>
            <p className="text-[12px] text-zinc-500">One per line: single videos are added to this section; a playlist or channel link brings in all its videos and keeps feeding this section.</p>
            <Textarea rows={3} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://youtu.be/…\nhttps://www.youtube.com/playlist?list=PL…"} className="mt-2 font-mono text-[12.5px]" />
            <div className="mt-2 flex flex-wrap gap-2">
              {[["end", "Add to the end"], ["top", "Add to the top"]].map(([k, l]) => <Btn key={k} kind={k === "end" ? "primary" : undefined} busy={busy === k} disabled={!links.trim()} onClick={async () => { setBusy(k); const r = await post({ add: { id: s.id, top: k === "top", links: links.split(/[\n\s,]+/).filter(Boolean) } }); setBusy(""); if (r?.results) { setLog(r.results); setLinks(""); } }}><Plus />{l}</Btn>)}
              <Btn onClick={onSources}><Youtube />All channels & playlists</Btn>
            </div>
            {log.length > 0 && <ul className="mt-2 space-y-0.5 rounded-md bg-zinc-50 p-2.5 text-[12px]">{log.map((l, i) => <li key={i} className={l.ok ? "text-zinc-700" : "text-red-600"}>{l.ok ? "✓ " : "✕ "}{l.note}</li>)}</ul>}
          </Card>

          {s.layout !== "playlists" && <Card>
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3"><p className="text-[13.5px] font-semibold">Videos in this section <span className="font-normal text-zinc-500">{items.length} · the first ones show on Home</span></p></div>
            {!items.length ? <p className="p-4 text-[12.5px] text-zinc-500">No videos yet.</p> : <ol className="divide-y divide-zinc-100">
              {items.slice(0, show).map((v, i) => (
                <li key={v.youtube_id} className="group flex items-center gap-3 px-3 py-2">
                  <span className="w-7 shrink-0 text-right text-[11.5px] tabular-nums text-zinc-400">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-24 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1"><span className="line-clamp-2 text-[13px]">{v.title || <span className="text-zinc-400">Coming with the next fetch</span>}</span><span className="text-[11.5px] text-zinc-400">{dur(v.duration_sec)}{v.status && v.status !== "published" ? ` · ${v.status}` : ""}</span></span>
                  <span className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                    <button title="To the top" onClick={() => mv(i, 0)} className="p-1 text-zinc-500 hover:text-zinc-900"><ChevronsUp className="size-4" /></button>
                    <button title="Up" onClick={() => mv(i, i - 1)} className="p-1 text-zinc-500 hover:text-zinc-900"><ArrowUp className="size-4" /></button>
                    <button title="Down" onClick={() => mv(i, i + 1)} className="p-1 text-zinc-500 hover:text-zinc-900"><ArrowDown className="size-4" /></button>
                    <Select value="" onChange={(e) => e.target.value && post({ move: { from: s.id, to: e.target.value, yt: v.youtube_id } })} className="!h-7 !w-36 text-[12px]"><option value="">Move to…</option>{d!.sections.filter((x) => x.id !== s.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select>
                    <button title="Remove from this section (stays removed after fetching)" onClick={() => post({ drop: { id: s.id, yt: v.youtube_id } })} className="p-1 text-zinc-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                  </span>
                </li>))}
            </ol>}
            {items.length > show && <div className="p-3 text-center"><Btn size="sm" onClick={() => setShow((n) => n + 200)}>Show more ({items.length - show} left)</Btn></div>}
          </Card>}
          <p className="text-[12px] text-zinc-500"><Badge tone="outline">Tip</Badge> Videos are fetched every night without an API key; your order, moves and removals are kept.</p>
        </div>)}
    </div>
  );
}
