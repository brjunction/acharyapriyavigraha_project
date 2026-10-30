"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Plus, Search, Trash2, Upload, Download, ExternalLink, Image as ImageIcon, Save, FileText } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, Tabs, api, toast } from "../ui";
import { MediaPicker } from "../media-picker";
import { KINDS, IMPORTANCE, SHEET_COLS, kindOf, when, eraOf, monthName, type Era } from "@/lib/content/timeline-shared";

type Ev = { id: string; slug: string; year: number; month: number | null; day: number | null; year_to: number | null; circa: boolean; date_label: string | null; title: string; summary: string | null; kind: string; place: string | null; people: string[]; image: string | null; importance: number; status: string; has_body: boolean };

export function TimelinePanel() {
  const [data, setData] = useState<{ eras: Era[]; events: Ev[] } | null>(null); const [tab, setTab] = useState("events");
  const [q, setQ] = useState(""); const [kind, setKind] = useState(""); const [era, setEra] = useState(""); const [need, setNeed] = useState("");
  const [edit, setEdit] = useState<string | null>(null); const [imp, setImp] = useState(false); const [preset, setPreset] = useState<number | null>(null);
  const load = useCallback(() => api("/api/admin/timeline").then(setData).catch((e) => toast(e.message, true)), []);
  useEffect(() => { load(); }, [load]);
  const eras = data?.eras || [];
  const shown = useMemo(() => (data?.events || []).filter((e) => {
    const f = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
    if (q && !f([e.title, e.summary, e.place, e.year, ...(e.people || [])].join(" ")).includes(f(q))) return false;
    if (kind && e.kind !== kind) return false; if (era && eraOf(eras, e.year)?.id !== era) return false;
    if (need === "image" && e.image) return false; if (need === "summary" && e.summary) return false; if (need === "hidden" && e.status === "published") return false;
    return true;
  }), [data, q, kind, era, need, eras]);
  const groups = useMemo(() => { const g: { era: Era | null; years: [number, Ev[]][] }[] = []; for (const e of shown) { const er = eraOf(eras, e.year); let x = g.find((y) => y.era?.id === er?.id); if (!x) { x = { era: er, years: [] }; g.push(x); } let yy = x.years.find(([y]) => y === e.year); if (!yy) { yy = [e.year, []]; x.years.push(yy); } yy[1].push(e); } return g; }, [shown, eras]);
  const total = data?.events.length || 0;

  return (
    <div>
      <PageHeader icon={History} title="Life timeline" description="His life in chapters. Add each moment with its year (and month or day if known); it falls into the chapter whose years contain it. Milestones appear large and in Highlights.">
        <a href="/gurudeva/timeline" target="_blank"><Btn><ExternalLink />Open the timeline</Btn></a>
        <Btn onClick={() => setImp(true)}><Upload />Import from Excel</Btn>
        <Btn kind="primary" onClick={() => { setPreset(null); setEdit("new"); }}><Plus />Add a moment</Btn>
      </PageHeader>
      <Tabs value={tab} onChange={setTab} items={[["events", `Moments (${total})`], ["eras", `Chapters (${eras.length})`]]} />
      {tab === "eras" ? <Eras eras={eras} events={data?.events || []} onChange={load} /> : <>
        <div className="mb-4 mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, place, person, year" className="pl-8" /></div>
          <Select value={era} onChange={(e) => setEra(e.target.value)}><option value="">All chapters</option>{eras.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</Select>
          <Select value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All kinds</option>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
          <Select value={need} onChange={(e) => setNeed(e.target.value)}><option value="">Everything</option><option value="image">Without a picture</option><option value="summary">Without a summary</option><option value="hidden">Hidden</option></Select>
        </div>
        {data && !total ? <Empty icon={History} title="The timeline is empty" text="Until you add moments, the website shows the short starting timeline. Add moments one by one, or many at once from Excel."><Btn kind="primary" onClick={() => setEdit("new")}><Plus />Add a moment</Btn></Empty> :
          groups.map((g) => (
            <section key={g.era?.id || "none"} className="mb-7">
              <div className="mb-2 flex items-baseline justify-between"><h2 className="text-[14px] font-semibold text-zinc-900">{g.era ? g.era.title : "Not in any chapter"}<span className="ml-2 text-[12px] font-normal text-zinc-500">{g.era ? `${g.era.year_from}–${g.era.year_to}` : "Add a chapter that covers these years"}</span></h2></div>
              <Card className="divide-y divide-zinc-100">
                {g.years.map(([y, es]) => (
                  <div key={y} className="flex gap-3 px-4 py-2.5">
                    <div className="w-12 shrink-0 pt-1"><p className="text-[13px] font-semibold tabular-nums text-zinc-900">{y}</p><button title={`Add a moment in ${y}`} onClick={() => { setPreset(y); setEdit("new"); }} className="mt-1 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"><Plus className="size-3.5" /></button></div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {es.map((e) => { const [, kl, c] = kindOf(e.kind); return (
                        <button key={e.id} onClick={() => setEdit(e.id)} className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-zinc-50">
                          {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt="" className="size-8 shrink-0 rounded object-cover" /> : <span className="flex size-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-400"><ImageIcon className="size-3.5" /></span>}
                          <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[13px] font-medium text-zinc-900">{e.title}</span>{e.has_body && <FileText className="size-3 shrink-0 text-zinc-400" />}</span><span className="block truncate text-[12px] text-zinc-500">{when(e)}{e.place ? ` · ${e.place}` : ""}{e.summary ? ` — ${e.summary}` : ""}</span></span>
                          <span className="hidden shrink-0 items-center gap-1.5 text-[11.5px] text-zinc-500 sm:flex"><span className="size-2 rounded-full" style={{ background: c }} />{kl}</span>
                          {e.importance === 1 && <Badge tone="amber">Milestone</Badge>}{e.importance === 3 && <Badge tone="outline">Detail</Badge>}{e.status !== "published" && <Badge>Hidden</Badge>}
                        </button>); })}
                    </div>
                  </div>))}
              </Card>
            </section>))}
        {data && total > 0 && !shown.length && <p className="py-10 text-center text-[13px] text-zinc-500">Nothing matches these filters.</p>}
      </>}
      {edit && <EventEditor id={edit} preset={preset} eras={eras} onClose={() => setEdit(null)} onSaved={load} />}
      {imp && <Import onClose={() => setImp(false)} onDone={() => { setImp(false); load(); }} />}
    </div>
  );
}

function EventEditor({ id, preset, eras, onClose, onSaved }: { id: string; preset: number | null; eras: Era[]; onClose: () => void; onSaved: () => void }) {
  const blank = () => ({ year: preset || "", importance: 2, kind: "life", status: "published", people: [], links: [] });
  const [e, setE] = useState<any>(id === "new" ? blank() : null); const [busy, setBusy] = useState(false); const [pick, setPick] = useState(false);
  useEffect(() => { if (id !== "new") api(`/api/admin/timeline/${id}`).then(setE).catch((x) => toast(x.message, true)); }, [id]);
  if (!e) return <Sheet title="Opening…" onClose={onClose}><div /></Sheet>;
  const set = (k: string, v: any) => setE((p: any) => ({ ...p, [k]: v }));
  const save = async (again = false) => {
    setBusy(true);
    try { if (id === "new") await api("/api/admin/timeline", "POST", e); else await api(`/api/admin/timeline/${id}`, "PATCH", e); toast("Saved."); onSaved(); if (again) setE({ ...blank(), year: e.year, kind: e.kind }); else onClose(); }
    catch (x: any) { toast(x.message, true); } finally { setBusy(false); }
  };
  const er = Number(e.year) ? eraOf(eras, Number(e.year)) : null;
  const links: string = (e.links || []).map((l: any) => `${l.label} | ${l.url}`).join("\n");
  return (
    <Sheet width="max-w-3xl" title={id === "new" ? "New moment" : e.title || "Moment"} onClose={onClose} actions={<>{id === "new" && <Btn size="sm" busy={busy} onClick={() => save(true)}>Save and add next</Btn>}<Btn size="sm" kind="primary" busy={busy} onClick={() => save()}><Save />Save</Btn></>}>
      <div className="space-y-5 p-5">
        <Field label="Title"><Input value={e.title || ""} onChange={(x) => set("title", x.target.value)} placeholder="e.g. Meets Śrīla Prabhupāda" className="text-[14px]" autoFocus /></Field>
        <div className="rounded-lg border border-zinc-200 p-3">
          <p className="mb-2 text-[12px] font-medium text-zinc-700">When</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Year"><Input type="number" value={e.year ?? ""} onChange={(x) => set("year", x.target.value)} placeholder="1975" /></Field>
            <Field label="Month"><Select value={e.month ?? ""} onChange={(x) => set("month", x.target.value)}><option value="">—</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{monthName(i + 1)}</option>)}</Select></Field>
            <Field label="Day"><Input type="number" min={1} max={31} value={e.day ?? ""} onChange={(x) => set("day", x.target.value)} /></Field>
            <Field label="Until year" hint="For a period"><Input type="number" value={e.year_to ?? ""} onChange={(x) => set("year_to", x.target.value)} /></Field>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
            <label className="flex h-9 items-center gap-2 text-[13px]"><input type="checkbox" checked={!!e.circa} onChange={(x) => set("circa", x.target.checked)} />Approximate (shows “c.”)</label>
            <Field label="Or write the date as it should appear" hint="Optional. e.g. 1940s, Kārttika 1979"><Input value={e.date_label || ""} onChange={(x) => set("date_label", x.target.value)} /></Field>
          </div>
          <p className="mt-2 text-[12px] text-zinc-500">Shown as <b className="text-zinc-800">{Number(e.year) ? when({ ...e, year: Number(e.year), month: Number(e.month) || null, day: Number(e.day) || null, year_to: Number(e.year_to) || null }) : "—"}</b>{er ? <> · in the chapter <b className="text-zinc-800">{er.title}</b></> : Number(e.year) ? " · no chapter covers this year yet" : ""}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kind"><Select value={e.kind} onChange={(x) => set("kind", x.target.value)}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
          <Field label="Importance"><div className="flex rounded-md border border-zinc-200 p-0.5">{IMPORTANCE.map(([n, l, h]) => <button key={n} title={h} onClick={() => set("importance", n)} className={`h-8 flex-1 rounded text-[12.5px] ${Number(e.importance) === n ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{l}</button>)}</div></Field>
        </div>
        <Field label="Summary" hint="One or two lines, shown on the card."><Textarea rows={3} value={e.summary || ""} onChange={(x) => set("summary", x.target.value)} /></Field>
        <Field label="Full account" hint="Optional. Opens with “Read the full account”."><Textarea rows={8} value={e.body || ""} onChange={(x) => set("body", x.target.value)} className="leading-[1.7]" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Place"><Input value={e.place || ""} onChange={(x) => set("place", x.target.value)} placeholder="e.g. Vṛndāvana" /></Field>
          <Field label="Country"><Input value={e.country || ""} onChange={(x) => set("country", x.target.value)} placeholder="India" /></Field>
          <Field label="People" hint="Separate with commas"><Input value={(e.people || []).join(", ")} onChange={(x) => set("people", x.target.value.split(",").map((s: string) => s.trimStart()))} /></Field>
        </div>
        <Field label="Picture">
          <div className="flex items-start gap-3">
            {e.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt="" className="h-24 w-20 rounded-md object-cover" /> : <div className="flex h-24 w-20 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-400"><ImageIcon className="size-5" /></div>}
            <div className="flex-1 space-y-2"><div className="flex gap-2"><Btn size="sm" onClick={() => setPick(true)}><ImageIcon />Choose or upload</Btn>{e.image && <Btn size="sm" onClick={() => set("image", null)}>Remove</Btn>}</div>
              <Input value={e.image || ""} onChange={(x) => set("image", x.target.value)} placeholder="…or paste a link" /><Input value={e.image_caption || ""} onChange={(x) => set("image_caption", x.target.value)} placeholder="Caption (optional)" /></div>
          </div>
        </Field>
        <Field label="Links" hint="One per line: Label | link. e.g. Lecture that day | /teachings/audio/…"><Textarea rows={3} value={links} onChange={(x) => set("links", x.target.value.split("\n").map((l) => { const [a, ...b] = l.split("|"); return { label: a.trim(), url: b.join("|").trim() }; }).filter((l) => l.label || l.url))} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source" hint="Where this is recorded (book, lecture, witness)."><Input value={e.source || ""} onChange={(x) => set("source", x.target.value)} /></Field>
          <Field label="Shown on the website"><Select value={e.status} onChange={(x) => set("status", x.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field>
        </div>
        {id !== "new" && <div className="flex justify-end border-t border-zinc-200 pt-4"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this moment?")) return; await api(`/api/admin/timeline/${id}`, "DELETE"); onSaved(); onClose(); }}><Trash2 />Delete</Btn></div>}
      </div>
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(xs) => { if (xs[0]) set("image", xs[0].url); setPick(false); }} />}
    </Sheet>
  );
}

function Eras({ eras, events, onChange }: { eras: Era[]; events: Ev[]; onChange: () => void }) {
  const [rows, setRows] = useState<any[]>(eras); const [pick, setPick] = useState<number | null>(null);
  useEffect(() => setRows(eras), [eras]);
  const set = (i: number, k: string, v: any) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v, dirty: true } : x)));
  const save = async (x: any) => { try { await api("/api/admin/timeline/eras", "POST", x); toast("Chapter saved."); onChange(); } catch (e: any) { toast(e.message, true); } };
  const sorted = [...rows].filter((x) => x.year_from).sort((a, b) => a.year_from - b.year_from);
  const gaps: string[] = []; sorted.forEach((x, i) => { const n = sorted[i + 1]; if (n && Number(n.year_from) > Number(x.year_to) + 1) gaps.push(`${Number(x.year_to) + 1}–${Number(n.year_from) - 1}`); if (n && Number(n.year_from) <= Number(x.year_to)) gaps.push(`overlap: ${x.title} and ${n.title}`); });
  return (
    <div className="mt-4 space-y-3">
      <p className="text-[12.5px] text-zinc-500">Chapters divide his life by years. Every moment goes automatically into the chapter whose years contain it, so chapters should not overlap.{gaps.length > 0 && <span className="ml-1 text-[#a3281e]">Check: {gaps.join(" · ")}</span>}</p>
      {rows.map((x, i) => (
        <Card key={x.id || `n${i}`} className="p-4">
          <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
            <button onClick={() => setPick(i)} className="aspect-[4/5] overflow-hidden rounded-md border border-dashed border-zinc-300 text-zinc-400">{x.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="mx-auto size-5" />}</button>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px_90px]">
                <Field label="Chapter name"><Input value={x.title || ""} onChange={(e) => set(i, "title", e.target.value)} /></Field>
                <Field label="Under the name" hint="Places, optional"><Input value={x.subtitle || ""} onChange={(e) => set(i, "subtitle", e.target.value)} /></Field>
                <Field label="From"><Input type="number" value={x.year_from || ""} onChange={(e) => set(i, "year_from", e.target.value)} /></Field>
                <Field label="To"><Input type="number" value={x.year_to || ""} onChange={(e) => set(i, "year_to", e.target.value)} /></Field>
              </div>
              <Field label="Introduction"><Textarea rows={2} value={x.summary || ""} onChange={(e) => set(i, "summary", e.target.value)} /></Field>
              <div className="flex items-center justify-between"><span className="text-[12px] text-zinc-500">{x.id ? `${events.filter((e) => e.year >= x.year_from && e.year <= x.year_to).length} moments` : "New chapter"}</span>
                <div className="flex gap-2">{x.id && <Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this chapter? Its moments stay; they just need another chapter.")) return; await api("/api/admin/timeline/eras", "DELETE", { id: x.id }); onChange(); }}><Trash2 />Delete</Btn>}<Btn size="sm" kind={x.dirty || !x.id ? "primary" : "ghost"} onClick={() => save(x)}><Save />Save</Btn></div></div>
            </div>
          </div>
        </Card>))}
      <Btn onClick={() => { const last = sorted[sorted.length - 1]; setRows((r) => [...r, { title: "", year_from: last ? Number(last.year_to) + 1 : "", year_to: "", dirty: true }]); }}><Plus />Add a chapter</Btn>
      {pick !== null && <MediaPicker onClose={() => setPick(null)} onPick={(xs) => { if (xs[0]) set(pick, "image", xs[0].url); setPick(null); }} />}
    </div>
  );
}

function Import({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [items, setItems] = useState<any[] | null>(null); const [busy, setBusy] = useState(false);
  const read = async (f: File) => {
    const fd = new FormData(); fd.append("file", f);
    try {
      const { rows } = await api<{ rows: string[][] }>("/api/admin/timeline/sheet", "POST", fd);
      const head = rows[0].map((h) => h.trim().toLowerCase()); const col = (n: string) => head.indexOf(n.toLowerCase());
      const get = (r: string[], n: string) => (col(n) >= 0 ? (r[col(n)] || "").trim() : "");
      setItems(rows.slice(1).map((r) => ({
        year: get(r, "Year"), month: get(r, "Month"), day: get(r, "Day"), year_to: get(r, "Until year"), circa: /^(y|yes|true|1|c)/i.test(get(r, "About")), date_label: get(r, "Date as written"),
        title: get(r, "Title"), summary: get(r, "Summary"), body: get(r, "Full account"),
        kind: (KINDS.find(([k, l]) => [k, l.toLowerCase()].includes(get(r, "Kind").toLowerCase())) || ["other"])[0],
        importance: (IMPORTANCE.find(([, l]) => l.toLowerCase() === get(r, "Importance").toLowerCase()) || [2])[0],
        place: get(r, "Place"), country: get(r, "Country"), people: get(r, "People"), image: get(r, "Picture link"), image_caption: get(r, "Picture caption"), source: get(r, "Source"),
      })).filter((x) => x.title || x.year));
    } catch (e: any) { toast(e.message, true); }
  };
  const bad = (items || []).filter((x) => !x.title || !Number(x.year)).length;
  return (
    <Modal title="Import moments from Excel" description={`Download the template, fill one row per moment (columns: ${SHEET_COLS.map((c) => c[0]).join(", ")}), then choose the file here. Year and Title are required.`} onClose={onClose}>
      <a href="/api/admin/timeline/sheet"><Btn size="sm"><Download />Download the template</Btn></a>
      <input type="file" accept=".xlsx" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} className="mt-4 block text-[13px]" />
      {items && <div className="mt-3 text-[13px]"><p>{items.length - bad} moments ready{bad ? `, ${bad} rows without a year or title will be skipped` : ""}.</p>
        <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border border-zinc-200 text-[12.5px]">{items.slice(0, 200).map((x, i) => <li key={i} className={`flex gap-3 border-b border-zinc-100 px-3 py-1.5 ${!x.title || !Number(x.year) ? "text-[#a3281e]" : ""}`}><span className="w-12 tabular-nums">{x.year || "?"}</span><span className="truncate">{x.title || "(no title)"}</span></li>)}</ul></div>}
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!items || items.length === bad} onClick={async () => { setBusy(true); try { const r = await api<{ added: number }>("/api/admin/timeline", "POST", { import: items }); toast(`${r.added} moments added.`); onDone(); } catch (e: any) { toast(e.message, true); setBusy(false); } }}><Upload />Import</Btn></div>
    </Modal>
  );
}
