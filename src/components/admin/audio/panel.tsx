"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Music, Plus, Search, Upload, Trash2, Eye, EyeOff, Tag, MapPin, Layers, ChevronLeft, ChevronRight, Play, Pause, FileText, ExternalLink, Check, X, ListFilter, Pencil, Merge } from "lucide-react";
import { AUDIO_KINDS, SCRIPTURES, CC_LILA, verseRef, parseRef, durText, parseDur, isSong, fold } from "@/lib/content/text";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Tabs, Empty, Modal, api, toast, cn } from "../ui";

const NotionEditor = dynamic(() => import("../notion/editor"), { ssr: false });
type Row = { id: string; slug: string; kind: string; title: string; date: string | null; date_note: string | null; place: string | null; country: string | null; scripture: string | null; canto: number | null; chapter: number | null; verse: string | null; series: string | null; topics: string[]; duration_sec: number | null; audio_url: string | null; transcript_status: string; status: string };
type List = { rows: Row[]; total: number; years: { year: number; n: number }[]; places: { name: string; n: number }[]; series: { name: string; n: number }[]; totals: { all: number; no_audio: number; no_text: number; no_date: number } };
type V = { id: string; kind: string; name: string; used: number; extra: any };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export function AudioPanel({ songs = false }: { songs?: boolean }) {
  const [tab, setTab] = useState("list");
  return (
    <div>
      <PageHeader icon={songs ? Music : Headphones} title={songs ? "Kīrtanas & bhajanas" : "Audio lectures"} description={songs ? "Songs he sang and led. Each has its words, writer and the singer." : "Every recorded lecture, kept in one systematic list. Add an MP3 link, the date, place and verse; the website does the rest."}>
        <Tabs value={tab} onChange={setTab} items={[["list", songs ? "Songs" : "Lectures"], ["place", "Places"], ["series", "Series"], ["topic", "Topics"]]} />
      </PageHeader>
      {tab === "list" ? <Recordings songs={songs} /> : <Vocab kind={tab} />}
    </div>
  );
}

function Recordings({ songs }: { songs: boolean }) {
  const [f, setF] = useState<Record<string, string>>({ sort: "new" }); const [page, setPage] = useState(1); const [data, setData] = useState<List | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [edit, setEdit] = useState<string | "new" | null>(null); const [importing, setImporting] = useState(false);
  const [q, setQ] = useState(""); const qt = useRef<any>(null);
  const load = useCallback(() => { const u = new URLSearchParams({ ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), page: String(page), kind: songs ? "songs" : "lectures" }); api<List>(`/api/admin/audios?${u}`).then(setData).catch((e) => toast(e.message, true)); }, [f, page, songs]);
  useEffect(() => { load(); }, [load]);
  const setFilter = (k: string, v: string) => { setPage(1); setSel(new Set()); setF((p) => ({ ...p, [k]: v })); };
  const bulk = async (body: any, msg: string) => { try { await api("/api/admin/audios/bulk", "POST", { ids: [...sel], ...body }); toast(msg); setSel(new Set()); load(); } catch (e: any) { toast(e.message, true); } };
  const pages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1;
  const all = data?.rows.length && data.rows.every((r) => sel.has(r.id));
  return (
    <>
      {data && <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["All", data.totals.all, ""], ["Without MP3 link", data.totals.no_audio, "audio"], ["Without transcription", data.totals.no_text, "transcript"], ["Without date", data.totals.no_date, "date"]].map(([l, n, need]) => (
          <button key={l as string} onClick={() => setFilter("need", f.need === need ? "" : (need as string))} className={cn("rounded-xl border bg-white p-4 text-left shadow-xs transition hover:border-zinc-300", f.need === need && need ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200")}>
            <p className="text-[13px] text-zinc-500">{l}</p><p className="mt-1 text-[24px] font-semibold tabular-nums tracking-tight">{Number(n).toLocaleString()}</p></button>))}
      </div>}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => { setQ(e.target.value); clearTimeout(qt.current); qt.current = setTimeout(() => setFilter("q", e.target.value), 300); }} placeholder="Search title, place, verse, topic… (no diacritics needed)" className="pl-8" /></div>
        <Select value={f.year || ""} onChange={(e) => setFilter("year", e.target.value)} className="!w-auto"><option value="">All years</option>{data?.years.map((y) => <option key={y.year} value={y.year}>{y.year} ({y.n})</option>)}</Select>
        <Select value={f.place || ""} onChange={(e) => setFilter("place", e.target.value)} className="!w-auto max-w-[180px]"><option value="">All places</option>{data?.places.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.n})</option>)}</Select>
        {!songs && <Select value={f.scripture || ""} onChange={(e) => setFilter("scripture", e.target.value)} className="!w-auto"><option value="">All scriptures</option>{Object.entries(SCRIPTURES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}
        <Select value={f.series || ""} onChange={(e) => setFilter("series", e.target.value)} className="!w-auto max-w-[170px]"><option value="">All series</option>{data?.series.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.n})</option>)}</Select>
        <Select value={f.status || ""} onChange={(e) => setFilter("status", e.target.value)} className="!w-auto"><option value="">Live and hidden</option><option value="published">Live</option><option value="draft">Hidden</option></Select>
        <Select value={f.sort} onChange={(e) => setFilter("sort", e.target.value)} className="!w-auto"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="title">Title A–Z</option><option value="updated">Recently edited</option></Select>
        <Btn onClick={() => setImporting(true)}><Upload />Import</Btn>
        <Btn kind="primary" onClick={() => setEdit("new")}><Plus />{songs ? "Add a song" : "Add a lecture"}</Btn>
      </div>

      {sel.size > 0 && <BulkBar n={sel.size} onClear={() => setSel(new Set())} bulk={bulk} songs={songs} />}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13.5px]">
            <thead><tr className="border-b border-zinc-200 bg-zinc-50/80 text-left text-[12.5px] text-zinc-500">
              <th className="w-10 px-3 py-2.5"><input type="checkbox" checked={!!all} onChange={() => setSel(all ? new Set() : new Set(data?.rows.map((r) => r.id)))} className="size-4 accent-zinc-900" /></th>
              <th className="px-3 py-2.5 font-medium">Date</th><th className="px-3 py-2.5 font-medium">Title</th><th className="px-3 py-2.5 font-medium">Place</th><th className="px-3 py-2.5 font-medium">{songs ? "Series" : "Verse"}</th><th className="px-3 py-2.5 font-medium">Length</th><th className="px-3 py-2.5 font-medium">MP3</th>{!songs && <th className="px-3 py-2.5 font-medium">Text</th>}<th className="px-3 py-2.5 font-medium">Status</th>
            </tr></thead>
            <tbody>{data?.rows.map((r) => (
              <tr key={r.id} onClick={() => setEdit(r.id)} className={cn("cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50", sel.has(r.id) && "bg-zinc-50")}>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(r.id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} className="size-4 accent-zinc-900" /></td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-zinc-600">{r.date ? fmt(r.date) : <span className="text-zinc-400">{r.date_note || "—"}</span>}</td>
                <td className="max-w-[360px] px-3 py-2.5"><p className="truncate font-medium text-zinc-900">{r.title}</p>{r.topics?.length > 0 && <p className="truncate text-[12px] text-zinc-500">{r.topics.join(", ")}</p>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-zinc-600">{r.place || <span className="text-zinc-400">—</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-zinc-600">{songs ? r.series || "" : verseRef(r) || <span className="text-zinc-400">—</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-zinc-600">{durText(r.duration_sec)}</td>
                <td className="px-3 py-2.5">{r.audio_url ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-zinc-300" />}</td>
                {!songs && <td className="px-3 py-2.5">{r.transcript_status === "done" ? <Badge tone="green">Done</Badge> : r.transcript_status === "draft" ? <Badge tone="amber">Draft</Badge> : <span className="text-zinc-300">—</span>}</td>}
                <td className="px-3 py-2.5">{r.status === "published" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}</td>
              </tr>))}</tbody>
          </table>
        </div>
        {data && !data.rows.length && <div className="p-6"><Empty icon={songs ? Music : Headphones} title={Object.values(f).some((v) => v && v !== "new") ? "Nothing matches these filters" : songs ? "No songs yet" : "No lectures yet"} text="Add one by one, or import a spreadsheet of many at once."><div className="flex gap-2"><Btn onClick={() => setImporting(true)}><Upload />Import</Btn><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add</Btn></div></Empty></div>}
        {data && data.total > 50 && <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2.5 text-[13px] text-zinc-500"><span>{((page - 1) * 50 + 1).toLocaleString()}–{Math.min(page * 50, data.total).toLocaleString()} of {data.total.toLocaleString()}</span><div className="flex gap-1"><Btn size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft />Previous</Btn><Btn size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight /></Btn></div></div>}
      </Card>
      {edit && <Editor id={edit} songs={songs} onClose={() => setEdit(null)} onSaved={load} />}
      {importing && <Importer songs={songs} onClose={() => setImporting(false)} onDone={() => { setImporting(false); load(); }} />}
    </>
  );
}

function BulkBar({ n, onClear, bulk, songs }: { n: number; onClear: () => void; bulk: (b: any, m: string) => void; songs: boolean }) {
  const [mode, setMode] = useState<"" | "place" | "series" | "topic" | "kind">(""); const [v, setV] = useState("");
  const go = () => { if (!v) return; if (mode === "topic") bulk({ addTopic: v }, `Topic added to ${n}.`); else bulk({ set: { [mode]: v } }, `Updated ${n}.`); setMode(""); setV(""); };
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px]">
      <b>{n} selected</b><span className="text-zinc-300">|</span>
      {mode ? <><Input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={mode === "place" ? "Place" : mode === "series" ? "Series name" : mode === "topic" ? "Topic to add" : ""} className="!h-8 !w-56" />
        {mode === "kind" && <Select value={v} onChange={(e) => setV(e.target.value)} className="!h-8 !w-44"><option value="" />{AUDIO_KINDS.filter(([k]) => isSong(k) === songs).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>}
        <Btn size="sm" kind="primary" onClick={go}>Apply</Btn><Btn size="sm" onClick={() => setMode("")}>Cancel</Btn></>
        : <><Btn size="sm" onClick={() => setMode("place")}><MapPin />Set place</Btn><Btn size="sm" onClick={() => setMode("series")}><Layers />Set series</Btn><Btn size="sm" onClick={() => setMode("topic")}><Tag />Add topic</Btn><Btn size="sm" onClick={() => setMode("kind")}>Set kind</Btn>
          <Btn size="sm" onClick={() => bulk({ set: { status: "published" } }, "Now live.")}><Eye />Make live</Btn><Btn size="sm" onClick={() => bulk({ set: { status: "draft" } }, "Hidden.")}><EyeOff />Hide</Btn>
          <Btn size="sm" kind="danger" onClick={() => confirm(`Delete ${n} recordings? This cannot be undone.`) && bulk({ delete: true }, "Deleted.")}><Trash2 />Delete</Btn></>}
      <button onClick={onClear} className="ml-auto text-zinc-500 hover:text-zinc-900">Clear</button>
    </div>
  );
}

function Combo({ kind, value, onChange, placeholder }: { kind: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [opts, setOpts] = useState<string[]>([]);
  useEffect(() => { api<V[]>(`/api/admin/vocab?kind=${kind}`).then((r) => setOpts(r.map((x) => x.name))).catch(() => {}); }, [kind]);
  return <><Input list={`v-${kind}`} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /><datalist id={`v-${kind}`}>{opts.map((o) => <option key={o} value={o} />)}</datalist></>;
}
function Topics({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [t, setT] = useState(""); const [opts, setOpts] = useState<string[]>([]);
  useEffect(() => { api<V[]>("/api/admin/vocab?kind=topic").then((r) => setOpts(r.map((x) => x.name))).catch(() => {}); }, []);
  const add = (x: string) => { const y = x.trim(); if (y && !value.includes(y)) onChange([...value, y]); setT(""); };
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 shadow-xs focus-within:ring-[3px] focus-within:ring-zinc-400/30">
      {value.map((x) => <Badge key={x} tone="outline">{x}<button onClick={() => onChange(value.filter((y) => y !== x))}><X /></button></Badge>)}
      <input list="v-topics" value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(t); } }} onBlur={() => t && add(t)} placeholder={value.length ? "" : "Type a topic and press Enter"} className="min-w-[140px] flex-1 bg-transparent text-[14px] outline-none" />
      <datalist id="v-topics">{opts.filter((o) => !value.includes(o)).map((o) => <option key={o} value={o} />)}</datalist>
    </div>
  );
}

function Editor({ id, songs, onClose, onSaved }: { id: string; songs: boolean; onClose: () => void; onSaved: () => void }) {
  const [a, setA] = useState<any>(id === "new" ? { kind: songs ? "kirtan" : "lecture", topics: [], status: "published", transcript_status: "none" } : null);
  const [busy, setBusy] = useState(false); const [text, setText] = useState(false); const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null); const transcript = useRef<any[] | null>(null);
  useEffect(() => { if (id !== "new") api(`/api/admin/audios/${id}`).then((r) => setA({ ...r, date: r.date?.slice(0, 10) || "" })).catch((e) => toast(e.message, true)); return () => audio.current?.pause(); }, [id]);
  if (!a) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, v: any) => setA((p: any) => ({ ...p, [k]: v }));
  const save = async (close = true) => {
    if (!a.title?.trim()) return toast("Please give a title.", true); setBusy(true);
    try {
      const body = { ...a, ...(transcript.current ? { transcript: transcript.current } : {}) };
      if (id === "new") { const r = await api<{ id: string }>("/api/admin/audios", "POST", body); if (transcript.current) await api(`/api/admin/audios/${r.id}`, "PATCH", { transcript: transcript.current }); }
      else await api(`/api/admin/audios/${id}`, "PATCH", body);
      toast("Saved."); onSaved(); if (close) onClose();
    } catch (e: any) { toast(e.message, true); } finally { setBusy(false); }
  };
  const test = () => { if (!a.audio_url) return; if (!audio.current) { audio.current = new Audio(); audio.current.addEventListener("loadedmetadata", () => { if (audio.current && !a.duration_sec) set("duration_sec", Math.round(audio.current.duration)); }); audio.current.addEventListener("pause", () => setPlaying(false)); }
    if (playing) { audio.current.pause(); return; } audio.current.src = a.audio_url; audio.current.play().then(() => setPlaying(true)).catch(() => toast("That link does not play. Check it is a direct link to an MP3 file.", true)); };
  const song = isSong(a.kind);
  return (
    <Sheet width="max-w-2xl" onClose={onClose} title={id === "new" ? (songs ? "New song" : "New lecture") : a.title}
      actions={<>{id !== "new" && a.status === "published" && <a href={`/teachings/audio/${a.slug}`} target="_blank" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" title="View on website"><ExternalLink className="size-4" /></a>}<Btn size="sm" kind="primary" busy={busy} onClick={() => save()}>Save</Btn></>}>
      <div className="space-y-6 p-5">
        <section className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label="Title"><Input autoFocus={id === "new"} value={a.title || ""} onChange={(e) => set("title", e.target.value)} placeholder={song ? "e.g. Śrī Guru-vandanā" : "e.g. The mercy of Śrīla Prabhupāda"} /></Field>
          <Field label="Kind"><Select value={a.kind} onChange={(e) => set("kind", e.target.value)}>{AUDIO_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
        </section>
        <Group title="When and where">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date"><Input type="date" value={a.date || ""} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="If the exact date is not known" hint="e.g. “Summer 1993” or “1994, month unknown”"><Input value={a.date_note || ""} onChange={(e) => set("date_note", e.target.value)} /></Field>
            <Field label="Place"><Combo kind="place" value={a.place} onChange={(v) => set("place", v)} placeholder="e.g. Bhubaneswar" /></Field>
            <Field label="Country"><Combo kind="country" value={a.country} onChange={(v) => set("country", v)} placeholder="e.g. India" /></Field>
            <Field label="Occasion" className="sm:col-span-2"><Combo kind="occasion" value={a.occasion} onChange={(v) => set("occasion", v)} placeholder="e.g. Gaura-pūrṇimā, initiation, Sunday feast" /></Field>
          </div>
        </Group>
        {!song && <Group title="Scripture">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Book" className="sm:col-span-2"><Select value={a.scripture || ""} onChange={(e) => set("scripture", e.target.value || null)}><option value="">None</option>{Object.entries(SCRIPTURES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
            {a.scripture === "SB" && <Field label="Canto"><Input type="number" min={1} max={12} value={a.canto ?? ""} onChange={(e) => set("canto", e.target.value)} /></Field>}
            {a.scripture === "CC" && <Field label="Līlā"><Select value={a.canto ?? ""} onChange={(e) => set("canto", e.target.value)}><option value="" />{CC_LILA.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}</Select></Field>}
            {a.scripture && a.scripture !== "OTHER" && <Field label="Chapter"><Input type="number" min={1} value={a.chapter ?? ""} onChange={(e) => set("chapter", e.target.value)} /></Field>}
            {a.scripture && <Field label={a.scripture === "OTHER" ? "Reference" : "Verse"} className={a.scripture === "OTHER" ? "sm:col-span-2" : ""}><Input value={a.verse || ""} onChange={(e) => set("verse", e.target.value)} placeholder={a.scripture === "OTHER" ? "e.g. Śikṣāṣṭakam 3" : "e.g. 6 or 6-7"} /></Field>}
          </div>
          <p className="mt-2 text-[12.5px] text-zinc-500">Shown as <b className="text-zinc-800">{verseRef(a) || "—"}</b>. Or type a reference: <input onKeyDown={(e) => { if (e.key === "Enter") { const p = parseRef((e.target as HTMLInputElement).value); setA((x: any) => ({ ...x, ...p })); (e.target as HTMLInputElement).value = ""; } }} placeholder="SB 1.2.6 ↵" className="ml-1 w-28 rounded border border-zinc-200 px-1.5 py-0.5 text-[12px] outline-none" /></p>
        </Group>}
        {song && <Group title="The song">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Song or bhajana"><Input value={a.song || ""} onChange={(e) => set("song", e.target.value)} placeholder="e.g. Gurudeva kṛpā-bindu diyā" /></Field>
            <Field label="Written by"><Input value={a.song_author || ""} onChange={(e) => set("song_author", e.target.value)} placeholder="e.g. Bhaktivinoda Ṭhākura" /></Field>
            <Field label="Sung by"><Combo kind="singer" value={a.singer} onChange={(v) => set("singer", v)} /></Field>
          </div>
        </Group>}
        <Group title="The recording">
          <Field label="MP3 link" hint="A direct link to the MP3 file (on your file server, archive.org, Google Drive direct link…). No upload is needed.">
            <div className="flex gap-2"><Input value={a.audio_url || ""} onChange={(e) => set("audio_url", e.target.value)} placeholder="https://…/lecture.mp3" /><Btn onClick={test} disabled={!a.audio_url}>{playing ? <Pause /> : <Play />}{playing ? "Stop" : "Test"}</Btn></div>
          </Field>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Length" hint="h:mm:ss, filled when you press Test"><Input value={durText(a.duration_sec)} onChange={(e) => set("duration_sec", parseDur(e.target.value))} placeholder="1:12:00" /></Field>
            <Field label="Language"><Select value={a.language || ""} onChange={(e) => set("language", e.target.value)}><option value="">—</option>{["English", "Odia", "Hindi", "Bengali", "English with Odia", "English with Hindi"].map((l) => <option key={l}>{l}</option>)}</Select></Field>
            <Field label="Series"><Combo kind="series" value={a.series} onChange={(v) => set("series", v)} placeholder="e.g. Bhubaneswar 1993 SB class" /></Field>
            <Field label="Second link (backup)" className="sm:col-span-3"><Input value={a.audio_url_alt || ""} onChange={(e) => set("audio_url_alt", e.target.value)} placeholder="https://…" /></Field>
          </div>
        </Group>
        <Group title="Subject">
          <Field label="Topics"><Topics value={a.topics || []} onChange={(v) => set("topics", v)} /></Field>
          <Field label="Short summary" className="mt-4" hint="Two or three lines that appear in lists and search results."><Textarea value={a.summary || ""} onChange={(e) => set("summary", e.target.value)} /></Field>
        </Group>
        {!song && <Group title="Transcription">
          <div className="flex flex-wrap items-center gap-2"><Select value={a.transcript_status} onChange={(e) => set("transcript_status", e.target.value)} className="!w-52"><option value="none">Not started</option><option value="draft">In progress</option><option value="done">Finished</option></Select>
            <Btn onClick={() => setText(true)}><FileText />{(a.transcript?.length || transcript.current?.length) ? "Edit transcription" : "Write transcription"}</Btn></div>
        </Group>}
        {song && <Group title="Words of the song"><Btn onClick={() => setText(true)}><FileText />Edit the words</Btn></Group>}
        <Group title="Publishing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shown on the website"><Select value={a.status} onChange={(e) => set("status", e.target.value)}><option value="published">Yes, live</option><option value="draft">No, hidden</option></Select></Field>
            <Field label="Notes for the team" hint="Never shown on the website."><Input value={a.notes || ""} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {id !== "new" && <div className="mt-5 flex justify-between border-t border-zinc-200 pt-4"><span className="text-[12.5px] text-zinc-500">Address: /teachings/audio/{a.slug}</span><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this recording?")) return; await api(`/api/admin/audios/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
        </Group>
      </div>
      {text && <div className="fixed inset-0 z-[95] flex flex-col bg-white">
        <div className="flex h-14 items-center gap-3 border-b border-zinc-200 px-5"><p className="flex-1 truncate font-semibold">{song ? "Words" : "Transcription"}: {a.title}</p><Btn onClick={() => setText(false)}>Back to details</Btn><Btn kind="primary" busy={busy} onClick={async () => { await save(false); setText(false); }}>Save</Btn></div>
        <div className="site-canvas flex-1 overflow-y-auto"><div className="mx-auto max-w-[860px] py-10"><NotionEditor initial={transcript.current || a.transcript || []} pageId="" onChange={(b) => { transcript.current = b; }} /></div></div>
      </div>}
    </Sheet>
  );
}
const Group = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="border-t border-zinc-200 pt-5"><h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>{children}</section>;

/* ------------------------------------------------------------------ shared lists */
function Vocab({ kind }: { kind: string }) {
  const [rows, setRows] = useState<V[] | null>(null); const [q, setQ] = useState(""); const [ren, setRen] = useState<V | null>(null); const [to, setTo] = useState("");
  const load = () => api<V[]>(`/api/admin/vocab?kind=${kind}`).then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, [kind]); // eslint-disable-line
  const label = kind === "place" ? "place" : kind === "series" ? "series" : "topic";
  const shown = (rows || []).filter((r) => fold(r.name).includes(fold(q)));
  return (
    <div>
      <p className="mb-4 max-w-2xl text-[14px] text-zinc-500">One spelling for every {label}, so filters on the website stay clean. Renaming here changes it on every recording. To join two spellings, rename one to the other.</p>
      <div className="mb-3 flex gap-2"><div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label}s`} className="pl-8" /></div>
        <Btn kind="primary" onClick={async () => { const n = prompt(`New ${label}`); if (n) { await api("/api/admin/vocab", "POST", { kind, name: n }); load(); } }}><Plus />Add</Btn></div>
      <Card className="divide-y divide-zinc-100">
        {shown.map((r) => <div key={r.id} className="flex items-center gap-3 px-4 py-2.5"><span className="flex-1 font-medium">{r.name}</span><span className="text-[12.5px] tabular-nums text-zinc-500">used {r.used}×</span>
          <Btn size="sm" onClick={() => { setRen(r); setTo(r.name); }}><Pencil />Rename / join</Btn>
          <Btn size="sm" onClick={async () => { if (r.used && !confirm("It is still used. Remove it from the list anyway? (The recordings keep their value.)")) return; await api("/api/admin/vocab", "DELETE", { kind, name: r.name }); load(); }}><Trash2 /></Btn></div>)}
        {rows && !shown.length && <p className="p-6 text-center text-zinc-500">Nothing yet. Lists fill themselves as you add recordings.</p>}
      </Card>
      {ren && <Modal title={`Rename “${ren.name}”`} description={`Every recording with this ${label} will change. If the new name already exists, the two are joined.`} onClose={() => setRen(null)}>
        <Input autoFocus value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2"><Btn onClick={() => setRen(null)}>Cancel</Btn><Btn kind="primary" onClick={async () => { await api("/api/admin/vocab", "PATCH", { kind, from: ren.name, to }); setRen(null); toast("Renamed everywhere."); load(); }}><Merge />Rename</Btn></div>
      </Modal>}
    </div>
  );
}

/* ------------------------------------------------------------------ import */
const COLS: [string, string][] = [["title", "Title"], ["date", "Date"], ["date_note", "Date note"], ["place", "Place"], ["country", "Country"], ["occasion", "Occasion"], ["ref", "Verse (e.g. SB 1.2.6)"], ["kind", "Kind"], ["language", "Language"], ["series", "Series"], ["topics", "Topics (separated by ;)"], ["duration", "Length (h:mm:ss)"], ["audio_url", "MP3 link"], ["song", "Song"], ["song_author", "Written by"], ["singer", "Sung by"], ["summary", "Summary"]];
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", q = false; const first = text.split("\n")[0]; const sep = (first.match(/\t/g)?.length || 0) > (first.match(/,/g)?.length || 0) ? "\t" : ",";
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === sep) { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; } else cell += c; }
  if (cell || row.length) { row.push(cell); rows.push(row); } return rows.filter((r) => r.some((c) => c.trim()));
}
function Importer({ songs, onClose, onDone }: { songs: boolean; onClose: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<string[][] | null>(null); const [map, setMap] = useState<string[]>([]); const [busy, setBusy] = useState("");
  const guess = (h: string) => { const n = fold(h).replace(/[^a-z]/g, ""); return COLS.find(([k, l]) => fold(l).replace(/[^a-z]/g, "").startsWith(n) || k.replace(/_/g, "") === n)?.[0] || (n.includes("mp3") || n.includes("url") || n.includes("link") ? "audio_url" : n.includes("verse") || n.includes("ref") ? "ref" : ""); };
  const read = async (f: File) => { const r = parseCsv(await f.text()); setRows(r); setMap((r[0] || []).map(guess)); };
  const preview = useMemo(() => rows ? rows.slice(1, 4) : [], [rows]);
  const run = async () => {
    if (!rows) return; if (!map.includes("title")) return toast("Choose which column is the Title.", true);
    const items = rows.slice(1).map((r) => { const o: any = { kind: songs ? "kirtan" : "lecture" }; map.forEach((k, i) => { const v = (r[i] ?? "").trim(); if (!k || !v) return;
      if (k === "ref") Object.assign(o, parseRef(v)); else if (k === "duration") o.duration_sec = parseDur(v); else if (k === "topics") o.topics = v.split(/[;|]/).map((x) => x.trim()).filter(Boolean);
      else if (k === "date") { const d = new Date(v); o.date = isNaN(+d) ? null : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; if (isNaN(+d)) o.date_note = v; }
      else if (k === "kind") o.kind = AUDIO_KINDS.find(([, l]) => fold(l) === fold(v))?.[0] || fold(v); else o[k] = v; }); return o; }).filter((o) => o.title);
    let added = 0; for (let i = 0; i < items.length; i += 200) { setBusy(`Adding ${Math.min(i + 200, items.length)} of ${items.length}…`); const r = await api<{ added: number }>("/api/admin/audios/bulk", "POST", { import: items.slice(i, i + 200) }).catch((e) => { toast(e.message, true); return { added: 0 }; }); added += r.added; }
    toast(`${added} added.`); onDone();
  };
  return (
    <Modal wide title="Import from a spreadsheet" description="Save the sheet as CSV (Excel or Google Sheets → Download → CSV). The first row must hold column names. Dates like 1996-01-21 or 21 Jan 1996 both work." onClose={onClose}>
      <input type="file" accept=".csv,.tsv,.txt" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="text-[13.5px] file:mr-3 file:rounded-md file:border file:border-zinc-200 file:bg-white file:px-3 file:py-1.5 file:text-[13px] file:font-medium" />
      {rows && <>
        <p className="mb-2 mt-5 text-[13.5px] font-medium">{rows.length - 1} rows. Match each column of your sheet:</p>
        <div className="max-h-[45vh] overflow-auto rounded-lg border border-zinc-200"><table className="w-full text-[13px]"><tbody>{(rows[0] || []).map((h, i) => (
          <tr key={i} className="border-b border-zinc-100 last:border-0"><td className="px-3 py-2 font-medium">{h}</td><td className="max-w-[220px] truncate px-3 py-2 text-zinc-500">{preview.map((r) => r[i]).filter(Boolean).join(" · ")}</td>
            <td className="px-3 py-2"><Select value={map[i] || ""} onChange={(e) => setMap(map.map((m, j) => (j === i ? e.target.value : m)))} className="!h-8"><option value="">Skip</option>{COLS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></td></tr>))}</tbody></table></div>
        <div className="mt-4 flex items-center justify-end gap-3"><span className="text-[13px] text-zinc-500">{busy}</span><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={!!busy} onClick={run}><Upload />Import {rows.length - 1}</Btn></div>
      </>}
    </Modal>
  );
}
