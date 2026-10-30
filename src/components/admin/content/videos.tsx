"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, Plus, Search, Youtube, Trash2, Eye, EyeOff, ExternalLink, Play } from "lucide-react";
import { durText, parseDur } from "@/lib/content/text";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, Tabs, api, toast, cn } from "../ui";
import { LecturePicker, TopicsInput } from "./shared";

export const VIDEO_KINDS: [string, string][] = [["lecture", "Lecture"], ["kirtan", "Kīrtana"], ["daily-diary", "Daily diary (shorts)"], ["festival", "Festival"], ["documentary", "Documentary"], ["memory", "Memories"], ["other", "Other"]];
const yid = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u || "")?.[1] || (/^[\w-]{11}$/.test(u || "") ? u : "");
type R = { id: string; slug: string; kind: string; title: string; date: string | null; youtube_id: string | null; place: string | null; series: string | null; topics: string[]; duration_sec: number | null; channel: string | null; status: string };

export function VideosPanel() {
  const [kind, setKind] = useState(""); const [q, setQ] = useState(""); const [year, setYear] = useState(""); const [page, setPage] = useState(1);
  const [data, setData] = useState<{ rows: R[]; total: number; kinds: { kind: string; n: number }[]; years: { year: number; n: number }[] } | null>(null);
  const [edit, setEdit] = useState<string | null>(null); const [yt, setYt] = useState(false); const [sel, setSel] = useState<Set<string>>(new Set()); const t = useRef<any>(null); const [qq, setQq] = useState("");
  const load = useCallback(() => { const u = new URLSearchParams({ page: String(page), ...(kind && { kind }), ...(q && { q }), ...(year && { year }) }); api(`/api/admin/videos?${u}`).then(setData).catch((e) => toast(e.message, true)); }, [kind, q, year, page]);
  useEffect(() => { load(); }, [load]);
  const count = (k: string) => data?.kinds.find((x) => x.kind === k)?.n || 0;
  const bulk = async (b: any, m: string) => { await api("/api/admin/videos/bulk", "POST", { ids: [...sel], ...b }).then(() => { toast(m); setSel(new Set()); load(); }).catch((e) => toast(e.message, true)); };
  return (
    <div>
      <PageHeader icon={Clapperboard} title="Videos" description="YouTube videos, sorted by kind, date and place. Bring a whole channel in at once.">
        <Btn onClick={() => setYt(true)}><Youtube />Channels & playlists</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a video</Btn>
      </PageHeader>
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
      {data && !data.rows.length ? <Empty icon={Clapperboard} title="No videos here yet" text="Paste YouTube links one by one, or bring in a channel’s newest videos."><Btn onClick={() => setYt(true)}><Youtube />Import from YouTube</Btn></Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data?.rows.map((r) => (
          <Card key={r.id} className={cn("group overflow-hidden transition hover:shadow-md", sel.has(r.id) && "ring-2 ring-zinc-900")}>
            <div className="relative aspect-video cursor-pointer bg-zinc-100" onClick={() => setEdit(r.id)}>{r.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${r.youtube_id}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />}
              <input type="checkbox" checked={sel.has(r.id)} onClick={(e) => e.stopPropagation()} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} className={cn("absolute left-2 top-2 size-4 accent-zinc-900", !sel.size && "opacity-0 group-hover:opacity-100")} />
              {r.status !== "published" && <Badge className="absolute right-2 top-2">Hidden</Badge>}</div>
            <button onClick={() => setEdit(r.id)} className="block w-full p-3 text-left"><p className="line-clamp-2 text-[13px] font-medium leading-snug">{r.title}</p><p className="mt-1 text-[12px] text-zinc-500">{[VIDEO_KINDS.find(([k]) => k === r.kind)?.[1], r.date && new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), r.place].filter(Boolean).join(" · ")}</p></button>
          </Card>))}</div>)}
      {data && data.total > 60 && <div className="mt-4 flex justify-center gap-2"><Btn size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn><span className="self-center text-[12.5px] text-zinc-500">Page {page} of {Math.ceil(data.total / 60)}</span><Btn size="sm" disabled={page * 60 >= data.total} onClick={() => setPage(page + 1)}>Next</Btn></div>}
      {edit && <VideoEditor id={edit} onClose={() => setEdit(null)} onSaved={load} />}
      {yt && <YouTubeImport onClose={() => setYt(false)} onDone={() => { setYt(false); load(); }} />}
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

function YouTubeImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [d, setD] = useState<{ sources: any[]; hasKey: boolean; envKey: boolean } | null>(null); const [url, setUrl] = useState(""); const [busy, setBusy] = useState(""); const [key, setKey] = useState(""); const [log, setLog] = useState<string[]>([]);
  const load = () => api("/api/admin/videos/sources").then(setD).catch((e) => toast(e.message, true)); useEffect(() => { load(); }, []);
  const sync = async (id: string) => { setBusy(id); try { const r = await api<{ results: { name: string; seen?: number; added?: number; error?: string }[] }>("/api/admin/videos/sources", "POST", { sync: id }); setLog(r.results.map((x) => (x.error ? `${x.name}: ${x.error}` : `${x.name}: ${x.added} new of ${x.seen}`))); load(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  return (
    <Modal wide title="YouTube channels & playlists" description="Add each channel or playlist once. “Fetch” brings in every video not yet here, and sorts it by date, place, scripture and type from its title. Already-imported videos keep your edits. New videos are also fetched automatically every night." onClose={() => { onClose(); onDone(); }}>
      <div className="flex gap-2"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Channel link, @handle, or playlist link" /><Btn kind="primary" busy={busy === "add"} disabled={!url.trim()} onClick={async () => { setBusy("add"); try { await api("/api/admin/videos/sources", "POST", { url }); setUrl(""); load(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } }}><Plus />Add</Btn></div>
      <Card className="mt-3 divide-y divide-zinc-100">{d?.sources.length ? d.sources.map((s) => (
        <div key={s.id} className="flex items-center gap-3 px-3 py-2.5"><Youtube className="size-4 shrink-0 text-red-600" />
          <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{s.name || s.url}</span><span className="block truncate text-[11.5px] text-zinc-500">{s.kind === "playlist" ? "Playlist" : "Channel"} · {s.videos} videos here{s.last_synced_at ? ` · fetched ${new Date(s.last_synced_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : " · not fetched yet"}</span></span>
          <Btn size="sm" busy={busy === s.id} onClick={() => sync(s.id)}>Fetch</Btn><button onClick={async () => { if (!confirm("Remove this source? Its videos stay.")) return; await api("/api/admin/videos/sources", "DELETE", { id: s.id }); load(); }} className="p-1.5 text-zinc-400 hover:text-red-600"><Trash2 className="size-4" /></button>
        </div>)) : <p className="p-4 text-[12.5px] text-zinc-500">No channels yet. Paste a link above, e.g. https://www.youtube.com/@HaladharaSwami</p>}</Card>
      {d && d.sources.length > 1 && <Btn size="sm" className="mt-2" busy={busy === "all"} onClick={() => sync("all")}>Fetch all</Btn>}
      {log.length > 0 && <div className="mt-3 rounded-md bg-zinc-50 p-3 text-[12px] text-zinc-700">{log.map((l, i) => <p key={i}>{l}</p>)}</div>}
      <details className="mt-5 rounded-lg border border-zinc-200 p-3"><summary className="cursor-pointer text-[12.5px] font-medium">YouTube API key {d?.hasKey ? <Badge tone="green">Saved</Badge> : <Badge tone="outline">Optional</Badge>}</summary>
        <p className="mt-2 text-[12px] text-zinc-500">With a free key from Google Cloud (YouTube Data API v3), each video also gets its upload date, description and exact length, and very large channels fetch reliably. Without it, titles and lengths are read from YouTube’s public pages.</p>
        {d?.envKey ? <p className="mt-2 text-[12px]">A key is set on the server.</p> : <div className="mt-2 flex gap-2"><Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={d?.hasKey ? "•••••••• (saved)" : "Paste the API key"} /><Btn size="sm" onClick={async () => { await api("/api/admin/videos/sources", "POST", { key }); setKey(""); toast(key ? "Key saved." : "Key removed."); load(); }}>{key ? "Save" : "Remove"}</Btn></div>}
      </details>
    </Modal>
  );
}
