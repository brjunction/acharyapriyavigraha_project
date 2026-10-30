"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, Plus, Search, Youtube, Trash2, Eye, EyeOff, ExternalLink, Play, Check } from "lucide-react";
import { durText, parseDur } from "@/lib/content/text";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, Tabs, api, toast, cn } from "../ui";
import { LecturePicker, TopicsInput } from "./shared";

export const VIDEO_KINDS: [string, string][] = [["lecture", "Lecture"], ["kirtan", "Kīrtana"], ["daily-diary", "Daily diary (shorts)"], ["festival", "Festival"], ["documentary", "Documentary"], ["memory", "Memories"], ["other", "Other"]];
const yid = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u || "")?.[1] || (/^[\w-]{11}$/.test(u || "") ? u : "");
type R = { id: string; slug: string; kind: string; title: string; date: string | null; youtube_id: string | null; place: string | null; series: string | null; topics: string[]; duration_sec: number | null; channel: string | null; status: string };

export function VideosPanel() {
  const [tab, setTab] = useState<"videos" | "sources">("videos");
  return (
    <div>
      <PageHeader icon={Clapperboard} title="Videos" description="Bring in whole YouTube channels and playlists, or single videos. Each video is sorted by date, place, scripture and type from its title; you can correct any of it.">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 text-[12.5px]">{([["videos", "Videos"], ["sources", "Channels & playlists"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-1.5", tab === k ? "bg-white font-medium shadow-xs" : "text-zinc-600")}>{l}</button>)}</div>
      </PageHeader>
      {tab === "videos" ? <VideoList onSources={() => setTab("sources")} /> : <Sources />}
    </div>
  );
}

function VideoList({ onSources }: { onSources: () => void }) {
  const [kind, setKind] = useState(""); const [q, setQ] = useState(""); const [year, setYear] = useState(""); const [page, setPage] = useState(1);
  const [data, setData] = useState<{ rows: R[]; total: number; kinds: { kind: string; n: number }[]; years: { year: number; n: number }[] } | null>(null);
  const [edit, setEdit] = useState<string | null>(null); const [yt, setYt] = useState(false); const [sel, setSel] = useState<Set<string>>(new Set()); const t = useRef<any>(null); const [qq, setQq] = useState("");
  const load = useCallback(() => { const u = new URLSearchParams({ page: String(page), ...(kind && { kind }), ...(q && { q }), ...(year && { year }) }); api(`/api/admin/videos?${u}`).then(setData).catch((e) => toast(e.message, true)); }, [kind, q, year, page]);
  useEffect(() => { load(); }, [load]);
  const count = (k: string) => data?.kinds.find((x) => x.kind === k)?.n || 0;
  const bulk = async (b: any, m: string) => { await api("/api/admin/videos/bulk", "POST", { ids: [...sel], ...b }).then(() => { toast(m); setSel(new Set()); load(); }).catch((e) => toast(e.message, true)); };
  return (
    <div>
      <div className="mb-3 flex justify-end gap-2"><Btn onClick={onSources}><Youtube />Add channels, playlists or links</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add one video</Btn></div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={kind} onChange={(v) => { setKind(v); setPage(1); }} items={[["", `All ${data ? data.kinds.reduce((a, b) => a + b.n, 0) : ""}`], ...VIDEO_KINDS.filter(([k]) => count(k)).map(([k, l]) => [k, `${l} ${count(k)}`] as [string, string])]} />
        <div className="relative ml-auto min-w-[220px]"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={qq} onChange={(e) => { setQq(e.target.value); clearTimeout(t.current); t.current = setTimeout(() => { setQ(e.target.value); setPage(1); }, 300); }} placeholder="Search videos" className="pl-8" /></div>
        <Select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} className="!w-auto"><option value="">All years</option>{data?.years.map((y) => <option key={y.year} value={y.year}>{y.year} ({y.n})</option>)}</Select>
      </div>
      {sel.size > 0 && <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12.5px]"><b>{sel.size} selected</b>
        <Select className="!h-8 !w-48" value="" onChange={(e) => e.target.value && bulk({ set: { kind: e.target.value } }, "Kind changed.")}><option value="">Set kind…</option>{VIDEO_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
        <Btn size="sm" onClick={() => bulk({ set: { status: "published" } }, "Live.")}><Eye />Make live</Btn><Btn size="sm" onClick={() => bulk({ set: { status: "draft" } }, "Hidden.")}><EyeOff />Hide</Btn>
        <Btn size="sm" onClick={async () => { const r = await api<{ changed: number }>("/api/admin/videos/sources", "POST", { resort: true, ids: [...sel] }); toast(`${r.changed} videos sorted from their titles.`); setSel(new Set()); load(); }}>Sort from titles</Btn>
        <Btn size="sm" kind="danger" onClick={() => confirm(`Delete ${sel.size} videos?`) && bulk({ delete: true }, "Deleted.")}><Trash2 />Delete</Btn><button onClick={() => setSel(new Set())} className="ml-auto text-zinc-500">Clear</button></div>}
      {data && !data.rows.length ? <Empty icon={Clapperboard} title="No videos here yet" text="Paste YouTube links one by one, or bring in a channel’s newest videos."><Btn onClick={onSources}><Youtube />Add channels or playlists</Btn></Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data?.rows.map((r) => (
          <Card key={r.id} className={cn("group overflow-hidden transition hover:shadow-md", sel.has(r.id) && "ring-2 ring-zinc-900")}>
            <div className="relative aspect-video cursor-pointer bg-zinc-100" onClick={() => setEdit(r.id)}>{r.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${r.youtube_id}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />}
              <input type="checkbox" checked={sel.has(r.id)} onClick={(e) => e.stopPropagation()} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} className={cn("absolute left-2 top-2 size-4 accent-zinc-900", !sel.size && "opacity-0 group-hover:opacity-100")} />
              {r.status !== "published" && <Badge className="absolute right-2 top-2">Hidden</Badge>}</div>
            <button onClick={() => setEdit(r.id)} className="block w-full p-3 text-left"><p className="line-clamp-2 text-[13px] font-medium leading-snug">{r.title}</p><p className="mt-1 text-[12px] text-zinc-500">{[VIDEO_KINDS.find(([k]) => k === r.kind)?.[1], r.date && new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), r.place].filter(Boolean).join(" · ")}</p></button>
          </Card>))}</div>)}
      {data && data.total > 60 && <div className="mt-4 flex justify-center gap-2"><Btn size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn><span className="self-center text-[12.5px] text-zinc-500">Page {page} of {Math.ceil(data.total / 60)}</span><Btn size="sm" disabled={page * 60 >= data.total} onClick={() => setPage(page + 1)}>Next</Btn></div>}
      {edit && <VideoEditor id={edit} onClose={() => setEdit(null)} onSaved={load} />}
    </div>
  );
}

function VideoEditor({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState<any>(id === "new" ? { kind: "lecture", topics: [], status: "published" } : null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (id !== "new") api(`/api/admin/videos/${id}`).then((r) => setV({ ...r, date: r.date?.slice(0, 10) || "", url: r.youtube_id ? `https://www.youtube.com/watch?v=${r.youtube_id}` : r.url })).catch((e) => toast(e.message, true)); }, [id]);
  if (!v) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, x: any) => setV((p: any) => ({ ...p, [k]: x })); const y = yid(v.url || v.youtube_id || "");
  const save = async () => { if (!v.title?.trim()) return toast("Please give a title.", true); setBusy(true); try { const body = { ...v, youtube_id: y || null }; if (id === "new") await api("/api/admin/videos", "POST", body); else await api(`/api/admin/videos/${id}`, "PATCH", body); toast("Saved."); onSaved(); onClose(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  return (
    <Sheet width="max-w-2xl" title={id === "new" ? "New video" : v.title} onClose={onClose} actions={<Btn size="sm" kind="primary" busy={busy} onClick={save}>Save</Btn>}>
      <div className="space-y-5 p-5">
        <div className="aspect-video overflow-hidden rounded-lg bg-zinc-100">{y ? <iframe src={`https://www.youtube-nocookie.com/embed/${y}`} className="h-full w-full" title="Video" allowFullScreen /> : <div className="flex h-full items-center justify-center text-zinc-400"><Play className="size-8" /></div>}</div>
        <Field label="YouTube link"><Input value={v.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=… or a Shorts link" /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]"><Field label="Title"><Input value={v.title || ""} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Kind"><Select value={v.kind} onChange={(e) => set("kind", e.target.value)}>{VIDEO_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field></div>
        <div className="grid gap-4 sm:grid-cols-4"><Field label="Date"><Input type="date" value={v.date || ""} onChange={(e) => set("date", e.target.value)} /></Field><Field label="Or year"><Input type="number" value={v.year || ""} onChange={(e) => set("year", e.target.value)} /></Field><Field label="Place"><Input value={v.place || ""} onChange={(e) => set("place", e.target.value)} /></Field><Field label="Country"><Input value={v.country || ""} onChange={(e) => set("country", e.target.value)} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Type" hint="Lecture, Darśana, Festival…"><Input value={v.type || ""} onChange={(e) => set("type", e.target.value)} /></Field><Field label="Verse" hint="e.g. SB 1.2.6"><Input value={v.scripture || ""} onChange={(e) => set("scripture", e.target.value)} /></Field><Field label="Length"><Input value={durText(v.duration_sec)} onChange={(e) => set("duration_sec", parseDur(e.target.value))} placeholder="12:30" /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Series"><Input value={v.series || ""} onChange={(e) => set("series", e.target.value)} /></Field><Field label="Language"><Input value={v.language || ""} onChange={(e) => set("language", e.target.value)} /></Field></div>
        <Field label="Same lecture in the audio archive" hint="Links the video to its audio recording and transcription."><LecturePicker value={v.audio_id} label={v.audio_title} onChange={(id, t) => setV((p: any) => ({ ...p, audio_id: id, audio_title: t }))} /></Field>
        <Field label="Topics"><TopicsInput value={v.topics || []} onChange={(x) => set("topics", x)} /></Field>
        <Field label="Description"><Textarea value={v.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Shown on the website"><Select value={v.status} onChange={(e) => set("status", e.target.value)}><option value="published">Yes, live</option><option value="draft">No, hidden</option></Select></Field>
        {id !== "new" && <div className="flex justify-between border-t border-zinc-200 pt-4">{y && <a href={`https://www.youtube.com/watch?v=${y}`} target="_blank" className="flex items-center gap-1 text-[12.5px] text-zinc-600"><ExternalLink className="size-4" />Open on YouTube</a>}<Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this video?")) return; await api(`/api/admin/videos/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
    </Sheet>
  );
}

/** All the places videos come from: as many channels and playlists as needed, plus single links. */
function Sources() {
  const [d, setD] = useState<{ sources: any[]; hasKey: boolean; envKey: boolean } | null>(null); const [text, setText] = useState(""); const [kind, setKind] = useState(""); const [busy, setBusy] = useState(""); const [key, setKey] = useState("");
  const [log, setLog] = useState<{ url?: string; ok: boolean; note: string }[]>([]);
  const load = () => api("/api/admin/videos/sources").then(setD).catch((e) => toast(e.message, true)); useEffect(() => { load(); }, []);
  const lines = text.split(/[\n\s,]+/).map((x) => x.trim()).filter(Boolean);
  const add = async () => { setBusy("add"); try { const r = await api<{ results: { url: string; ok: boolean; note: string }[] }>("/api/admin/videos/sources", "POST", { urls: lines, kind: kind || null }); setLog(r.results); setText(""); load(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  // One source at a time, and again while a big channel still has videos to bring in, so no request runs too long.
  const sync = async (id: string) => {
    setBusy(id); const ids = id === "all" ? (d?.sources || []).map((s) => s.id) : [id]; const out: { ok: boolean; note: string }[] = [];
    for (const one of ids) { let left = 1; let rounds = 0; while (left > 0 && rounds++ < 20) { try { const r = await api<{ results: { name: string; seen?: number; added?: number; left?: number; error?: string }[] }>("/api/admin/videos/sources", "POST", { sync: one }); const x = r.results[0]; left = x?.left || 0; out.push({ ok: !x?.error, note: x?.error ? `${x.name}: ${x.error}` : `${x?.name}: ${x?.added} new videos (of ${x?.seen})${left ? ` — ${left} more coming…` : ""}` }); setLog([...out]); } catch (e: any) { out.push({ ok: false, note: e.message }); setLog([...out]); left = 0; } } load(); }
    setBusy("");
  };
  const total = d?.sources.reduce((a, s) => a + (s.videos || 0), 0) || 0;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-[13.5px] font-semibold">Add links</p>
          <p className="mt-0.5 text-[12.5px] text-zinc-500">Paste as many as you like, one per line: channel links, @handles, playlist links, or single video links.</p>
          <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={"https://www.youtube.com/@HaladharaSwami\nhttps://www.youtube.com/playlist?list=PL…\nhttps://youtu.be/…"} className="mt-3 font-mono text-[12.5px]" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={kind} onChange={(e) => setKind(e.target.value)} className="!h-8 !w-auto"><option value="">Kind: decide from each title</option>{VIDEO_KINDS.map(([k, l]) => <option key={k} value={k}>All are: {l}</option>)}</Select>
            <Btn kind="primary" busy={busy === "add"} disabled={!lines.length} onClick={add}><Plus />Add {lines.length > 1 ? `${lines.length} links` : "link"}</Btn>
          </div>
          {log.length > 0 && <ul className="mt-3 space-y-1 rounded-md bg-zinc-50 p-3 text-[12px]">{log.map((l, i) => <li key={i} className={l.ok ? "text-zinc-700" : "text-red-600"}>{l.ok ? <Check className="mr-1 inline size-3.5 text-emerald-600" /> : "✕ "}{l.url ? <span className="text-zinc-400">{l.url} — </span> : null}{l.note}</li>)}</ul>}
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3"><p className="text-[13.5px] font-semibold">Channels & playlists <span className="font-normal text-zinc-400">{d?.sources.length || 0} · {total.toLocaleString()} videos</span></p>{d && d.sources.length > 0 && <Btn size="sm" busy={busy === "all"} onClick={() => sync("all")}>Fetch all</Btn>}</div>
          {d?.sources.length ? <div className="divide-y divide-zinc-100">{d.sources.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Youtube className="size-4 shrink-0 text-red-600" />
              <div className="min-w-0 flex-1"><input defaultValue={s.name || ""} placeholder={s.url} onBlur={(e) => e.target.value !== (s.name || "") && api("/api/admin/videos/sources", "POST", { update: { id: s.id, name: e.target.value, default_kind: s.default_kind } }).then(load)} className="w-full truncate rounded px-1 text-[13px] font-medium outline-none hover:bg-zinc-50 focus:bg-zinc-50" title="Click to rename" />
                <p className="truncate px-1 text-[11.5px] text-zinc-500">{s.kind === "playlist" ? "Playlist" : "Channel"} · {s.videos} videos{s.last_synced_at ? ` · fetched ${new Date(s.last_synced_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : " · not fetched yet"} · <a href={s.kind === "playlist" ? `https://www.youtube.com/playlist?list=${s.ref}` : `https://www.youtube.com/channel/${s.ref}`} target="_blank" className="underline">open</a></p></div>
              <Select value={s.default_kind || ""} onChange={(e) => api("/api/admin/videos/sources", "POST", { update: { id: s.id, default_kind: e.target.value } }).then(load)} className="!h-8 !w-40 text-[12px]"><option value="">Kind from title</option>{VIDEO_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
              <Btn size="sm" busy={busy === s.id} onClick={() => sync(s.id)}>Fetch</Btn>
              <button onClick={async () => { if (!confirm("Remove this source? Its videos stay.")) return; await api("/api/admin/videos/sources", "DELETE", { id: s.id }); load(); }} className="p-1.5 text-zinc-400 hover:text-red-600" title="Remove"><Trash2 className="size-4" /></button>
            </div>))}</div> : <p className="p-4 text-[12.5px] text-zinc-500">None yet. Add links above.</p>}
        </Card>
      </div>
      <aside className="space-y-4">
        <Card className="p-4 text-[12.5px] leading-relaxed text-zinc-600"><p className="text-[13px] font-semibold text-zinc-900">How it works</p>
          <ul className="mt-2 list-disc space-y-1 pl-4"><li><b>Fetch</b> brings in every video of that channel or playlist that is not here yet.</li><li>New videos are fetched by themselves every night.</li><li>A video in two playlists is kept once.</li><li>Your corrections to a video are never overwritten.</li><li>Choose a kind for a whole playlist (e.g. all Kīrtanas) with the menu beside it.</li></ul></Card>
        <Card className="p-4"><p className="flex items-center justify-between text-[13px] font-semibold">YouTube API key {d?.hasKey ? <Badge tone="green">Saved</Badge> : <Badge tone="outline">Optional</Badge>}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">With a free key (Google Cloud → YouTube Data API v3), every video also gets its upload date, description and exact length, and very large channels fetch reliably.</p>
          {d?.envKey ? <p className="mt-2 text-[12px]">A key is set on the server.</p> : <div className="mt-2 flex gap-2"><Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={d?.hasKey ? "•••••••• (saved)" : "Paste the key"} /><Btn size="sm" onClick={async () => { await api("/api/admin/videos/sources", "POST", { key }); setKey(""); toast(key ? "Key saved." : "Key removed."); load(); }}>{key ? "Save" : "Remove"}</Btn></div>}
        </Card>
      </aside>
    </div>
  );
}
