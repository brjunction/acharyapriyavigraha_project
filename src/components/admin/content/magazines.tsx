"use client";
import { uploadPdf, coverFromPdf, guessIssue } from "@/lib/content/issue-pdf";
import { useCallback, useEffect, useState } from "react";
import { Newspaper, Plus, Trash2, ExternalLink, Image as ImageIcon, ArrowUp, ArrowDown, ArrowLeft, Upload, FileText, X, Search, ListPlus, FileUp } from "lucide-react";
import { Btn, Badge, Card, Field, Input, Select, Textarea, PageHeader, Sheet, Empty, Modal, api, toast } from "../ui";
import { useTicks, TickBar, DraftsButton, Tick } from "./bulk";
import { MediaPicker } from "../media-picker";
import { CoverCropper } from "./book-editor";

type M = { id: string; slug: string | null; title: string; publisher: string | null; description: string | null; cover: string | null; url: string | null; status: string; n_issues: number; n_articles: number };
type I = { id: string; slug: string; number: string | null; title: string | null; day: string | null; year: number | null; cover: string | null; pdf_url: string | null; url: string | null; description: string | null; status: string; n_articles: number };

/** Magazines → issues → articles. Simple enough for anyone: pick a magazine, add issues, put articles in each issue. */
export function MagazinesPanel() {
  const [rows, setRows] = useState<M[] | null>(null); const [open, setOpen] = useState<string | null>(null); const [add, setAdd] = useState(false);
  const load = useCallback(() => api<M[]>("/api/admin/magazines").then(setRows).catch((e) => toast(e.message, true)), []);
  useEffect(() => { load(); }, [load]);
  const t = useTicks();
  if (open) return <MagazineView id={open} onBack={() => { setOpen(null); load(); }} />;
  const move = async (i: number, d: number) => { if (!rows) return; const r = [...rows]; const [x] = r.splice(i, 1); r.splice(i + d, 0, x); setRows(r); await api("/api/admin/magazines", "POST", { order: r.map((m) => m.id) }); };
  return (
    <div>
      <PageHeader icon={Newspaper} title="Magazines" description="Each magazine has issues; each issue has a cover, the whole issue (PDF) and its articles, which readers can read here.">
        <a href="/teachings/magazines" target="_blank"><Btn><ExternalLink />View on website</Btn></a><Btn kind="primary" onClick={() => setAdd(true)}><Plus />Add a magazine</Btn>
      </PageHeader>
      {rows && <TickBar kind="magazines" word={["magazine", "magazines"]} ids={t.ids} total={rows.length} onAll={() => t.tick(rows.map((m) => m.id), true)} onClear={t.clear} onDone={load} />}
      {rows && !rows.length ? <Empty icon={Newspaper} title="No magazines yet" text="Add a magazine such as Kṛṣṇa-kathāmṛta or the Gopāl Jiu magazine, then add its issues."><Btn kind="primary" onClick={() => setAdd(true)}><Plus />Add a magazine</Btn></Empty> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows?.map((m, i) => (
          <Card key={m.id} className="overflow-hidden">
            <button onClick={() => setOpen(m.id)} className="flex w-full gap-4 p-4 text-left hover:bg-zinc-50">
              <span className="block aspect-[3/4] w-20 shrink-0 overflow-hidden rounded bg-zinc-100">{m.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-zinc-300"><Newspaper className="size-6" /></span>}</span>
              <span className="min-w-0"><span className="block text-[14px] font-semibold">{m.title}</span><span className="block truncate text-[12px] text-zinc-500">{m.publisher || "—"}</span><span className="mt-2 flex flex-wrap gap-1.5"><Badge tone="outline">{m.n_issues} issues</Badge><Badge tone="outline">{m.n_articles} articles</Badge>{m.status !== "published" && <Badge>Hidden</Badge>}</span></span>
            </button>
            <div className="flex items-center justify-end gap-1 border-t border-zinc-100 px-2 py-1.5"><span className="mr-auto pl-1"><Tick on={t.has(m.id)} label={`Tick ${m.title}`} onChange={(v) => t.tick([m.id], v)} /></span><Btn size="icon" kind="soft" disabled={i === 0} onClick={() => move(i, -1)} title="Move earlier"><ArrowUp /></Btn><Btn size="icon" kind="soft" disabled={i === rows.length - 1} onClick={() => move(i, 1)} title="Move later"><ArrowDown /></Btn></div>
          </Card>))}</div>}
      {add && <NewMag onClose={() => setAdd(false)} onDone={(id) => { setAdd(false); setOpen(id); }} />}
    </div>
  );
}

function NewMag({ onClose, onDone }: { onClose: () => void; onDone: (id: string) => void }) {
  const [t, setT] = useState(""); const [busy, setBusy] = useState(false);
  return <Modal title="New magazine" onClose={onClose}><div className="space-y-4"><Field label="Name"><Input autoFocus value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. Kṛṣṇa-kathāmṛta" onKeyDown={(e) => e.key === "Enter" && t.trim() && document.getElementById("mag-go")?.click()} /></Field><div className="flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} onClick={async () => { if (!t.trim()) return; setBusy(true); try { const r = await api<{ id: string }>("/api/admin/magazines", "POST", { title: t.trim() }); onDone(r.id); } catch (e: any) { toast(e.message, true); setBusy(false); } }}><span id="mag-go">Create</span></Btn></div></div></Modal>;
}

function MagazineView({ id, onBack }: { id: string; onBack: () => void }) {
  const [d, setD] = useState<{ magazine: M; issues: I[] } | null>(null); const [m, setM] = useState<M | null>(null); const [busy, setBusy] = useState(false);
  const [crop, setCrop] = useState(false); const [issue, setIssue] = useState<string | null>(null); const [many, setMany] = useState(false); const [pdfs, setPdfs] = useState(false);
  const load = useCallback(() => api<{ magazine: M; issues: I[] }>(`/api/admin/magazines/${id}`).then((r) => { setD(r); setM((x) => x || r.magazine); }).catch((e) => toast(e.message, true)), [id]);
  useEffect(() => { load(); }, [load]);
  const t = useTicks();
  if (!d || !m) return <p className="p-6 text-zinc-500">Opening…</p>;
  const drafts = d.issues.filter((x) => x.status !== "published").length;
  const set = (k: keyof M, v: any) => setM({ ...m, [k]: v });
  const save = async () => { setBusy(true); try { await api(`/api/admin/magazines/${id}`, "PATCH", m); toast("Saved."); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  const newIssue = async () => { const r = await api<{ id: string }>(`/api/admin/magazines/${id}/issues`, "POST", { number: `Issue ${d.issues.length + 1}` }); await load(); setIssue(r.id); };
  return (
    <div>
      <div className="mb-5 flex items-center gap-2"><Btn size="sm" onClick={onBack}><ArrowLeft />Magazines</Btn><p className="flex-1 truncate text-[13px] text-zinc-500">{m.title}</p>{m.slug && <a href={`/teachings/magazines/${m.slug}`} target="_blank"><Btn size="sm"><ExternalLink />View</Btn></a>}</div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="space-y-4 self-start p-4">
          <div className="flex gap-3"><span className="block aspect-[3/4] w-24 shrink-0 overflow-hidden rounded bg-zinc-100">{m.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-zinc-300"><Newspaper className="size-6" /></span>}</span><div className="grid content-start gap-2"><Btn size="sm" onClick={() => setCrop(true)}><Upload />{m.cover ? "Change cover" : "Add cover"}</Btn>{m.cover && <Btn size="sm" onClick={() => set("cover", null)}>Remove</Btn>}</div></div>
          <Field label="Name"><Input value={m.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Published by"><Input value={m.publisher || ""} onChange={(e) => set("publisher", e.target.value)} /></Field>
          <Field label="About it"><Textarea rows={3} value={m.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Magazine website (optional)"><Input value={m.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" /></Field>
          <Field label="Shown on the website"><Select value={m.status} onChange={(e) => set("status", e.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field>
          <div className="flex justify-between"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this magazine and all its issues? The articles stay.")) return; await api(`/api/admin/magazines/${id}`, "DELETE"); onBack(); }}><Trash2 />Delete</Btn><Btn kind="primary" busy={busy} onClick={save}>Save</Btn></div>
        </Card>
        <div>
          <div className="mb-3 flex items-center gap-2">{d.issues.length > 0 && (() => { const on = d.issues.filter((x) => t.has(x.id)).length; return <Tick on={on === d.issues.length} mixed={on > 0 && on < d.issues.length} label="Tick every issue" onChange={(v) => t.tick(d.issues.map((x) => x.id), v)} />; })()}<p className="flex-1 text-[15px] font-semibold">Issues <span className="font-normal text-zinc-400">{d.issues.length}</span>{drafts > 0 && <span className="ml-2 text-[12px] font-normal text-amber-700">{drafts} drafts</span>}</p><DraftsButton kind="issues" n={drafts} word="issues" extra={{ magazine_id: id }} onDone={load} /><Btn size="sm" onClick={() => setPdfs(true)}><FileUp />Add issues from PDFs</Btn><Btn size="sm" onClick={() => setMany(true)}><ListPlus />Add many</Btn><Btn size="sm" kind="primary" onClick={newIssue}><Plus />Add an issue</Btn></div>
          <TickBar kind="issues" word={["issue", "issues"]} ids={t.ids} total={d.issues.length} onAll={() => t.tick(d.issues.map((x) => x.id), true)} onClear={t.clear} onDone={load} note="Publishing an issue publishes its articles too." />
          {!d.issues.length ? <Empty icon={Newspaper} title="No issues yet" text="Add the first issue: its number, date, cover, and the PDF of the whole issue." /> :
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">{d.issues.map((x) => (
              <button key={x.id} onClick={() => (t.ids.length ? t.tick([x.id], !t.has(x.id)) : setIssue(x.id))} className="group relative text-left">
                <Tick on={t.has(x.id)} label={`Tick ${x.title || x.number || "this issue"}`} onChange={(v) => t.tick([x.id], v)} className={`absolute left-2 top-2 z-10 shadow-sm ${t.ids.length ? "" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`} />
                {x.status !== "published" && <span className="absolute right-2 top-2 z-10 rounded bg-white/95 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-800 shadow-sm">Draft</span>}
                <span className={`block aspect-[3/4] overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 transition group-hover:border-zinc-400 ${t.has(x.id) ? "ring-2 ring-zinc-900 ring-offset-2" : ""}`}>{x.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-[12px] text-zinc-400"><Newspaper className="size-5" />No cover</span>}</span>
                <span className="mt-1.5 block truncate text-[13px] font-medium">{x.number && x.title ? `${x.number} · ${x.title}` : x.title || x.number}</span>
                <span className="block text-[11.5px] text-zinc-500">{[x.day, `${x.n_articles} articles`, x.pdf_url ? "PDF" : null, ].filter(Boolean).join(" · ")}</span>
              </button>))}</div>}
        </div>
      </div>
      {crop && <CoverCropper onClose={() => setCrop(false)} onDone={(u) => { set("cover", u); setCrop(false); }} />}
      {issue && <IssueSheet id={issue} onClose={() => { setIssue(null); load(); }} />}
      {many && <ManyIssues magId={id} onClose={() => setMany(false)} onDone={() => { setMany(false); load(); }} />}
      {pdfs && <PdfIssues magId={id} onClose={() => setPdfs(false)} onDone={() => { setPdfs(false); load(); }} />}
    </div>
  );
}

function ManyIssues({ magId, onClose, onDone }: { magId: string; onClose: () => void; onDone: () => void }) {
  const [t, setT] = useState(""); const [busy, setBusy] = useState(false);
  const rows = t.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => { const p = l.split(/\s*[|\t]\s*/); const url = l.match(/https?:\/\/\S+/)?.[0] || ""; return { number: p[0] || "", title: p[1] && !p[1].startsWith("http") ? p[1] : "", date: p.find((x) => /^\d{4}(-\d{2}(-\d{2})?)?$/.test(x)) || "", pdf_url: /\.pdf(\?|$)/i.test(url) ? url : "", url: url && !/\.pdf(\?|$)/i.test(url) ? url : "" }; });
  return <Modal wide title="Add many issues" description="One issue per line: number | title | date | link to the PDF. Only the number is needed." onClose={onClose}>
    <Textarea rows={8} value={t} onChange={(e) => setT(e.target.value)} placeholder={"Issue 1 | Śrī Gaura-pūrṇimā | 2004-03 | https://…/issue1.pdf\nIssue 2 | Janmāṣṭamī | 2004-08"} className="font-mono !text-[12.5px]" />
    {rows.length > 0 && <p className="mt-2 text-[12.5px] text-zinc-500">{rows.length} issues will be added.</p>}
    <div className="mt-4 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!rows.length} onClick={async () => { setBusy(true); try { await api(`/api/admin/magazines/${magId}/issues`, "POST", { many: rows.map((r) => ({ ...r, date: r.date.length === 7 ? `${r.date}-01` : r.date.length === 4 ? `${r.date}-01-01` : r.date })) }); toast("Issues added."); onDone(); } catch (e: any) { toast(e.message, true); setBusy(false); } }}>Add {rows.length || ""} issues</Btn></div>
  </Modal>;
}

function IssueSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const [x, setX] = useState<any>(null); const [arts, setArts] = useState<any[]>([]); const [busy, setBusy] = useState(false); const [crop, setCrop] = useState(false); const [pick, setPick] = useState(false);
  const [q, setQ] = useState(""); const [found, setFound] = useState<any[] | null>(null); const [pdfBusy, setPdfBusy] = useState("");
  const load = useCallback(() => api<any>(`/api/admin/issues/${id}`).then((r) => { setX((o: any) => o || { ...r.issue, date: r.issue.day || "" }); setArts(r.articles); }), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (q.trim().length < 2) { setFound(null); return; } const h = setTimeout(() => api<any>(`/api/admin/articles?q=${encodeURIComponent(q)}`).then((r) => setFound(r.rows.slice(0, 12))), 250); return () => clearTimeout(h); }, [q]);
  if (!x) return null;
  const set = (k: string, v: any) => setX({ ...x, [k]: v });
  const save = async () => { setBusy(true); try { await api(`/api/admin/issues/${id}`, "PATCH", x); toast("Saved."); onClose(); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  const order = async (list: any[]) => { setArts(list); await api(`/api/admin/issues/${id}`, "PATCH", { order: list.map((a) => a.id) }); };
  return (
    <Sheet width="max-w-3xl" title={x.number || x.title || "Issue"} onClose={onClose} actions={<Btn size="sm" kind="primary" busy={busy} onClick={save}>Save</Btn>}>
      <div className="grid gap-6 p-5 sm:grid-cols-[180px_1fr]">
        <div><span className="block aspect-[3/4] overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">{x.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-zinc-300"><Newspaper className="size-6" /></span>}</span>
          <div className="mt-2 grid gap-2"><Btn size="sm" onClick={() => setCrop(true)}><Upload />{x.cover ? "Change cover" : "Add cover"}</Btn><Btn size="sm" onClick={() => setPick(true)}><ImageIcon />From Pictures & files</Btn></div></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Field label="Number"><Input value={x.number || ""} onChange={(e) => set("number", e.target.value)} placeholder="e.g. Issue 12" /></Field><Field label="Date"><Input type="date" value={x.date || ""} onChange={(e) => set("date", e.target.value)} /></Field></div>
          <Field label="Title (optional)"><Input value={x.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Gaura-pūrṇimā special" /></Field>
          <Field label="The whole issue as a PDF" hint="Paste a link to the PDF (Google Drive, Dropbox and direct links work), or upload the file. Readers open it in the PDF reader; the articles stay as text.">
            <div className="flex gap-2"><Input value={x.pdf_url || ""} onChange={(e) => set("pdf_url", e.target.value)} placeholder="https://…/issue.pdf" />
              <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[13px] hover:bg-zinc-50"><FileUp className="size-4" />{pdfBusy || "Upload"}<input type="file" accept="application/pdf,.pdf" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setPdfBusy("0%"); const u = await uploadPdf(f, (d) => setPdfBusy(`${Math.round(d * 100)}%`)); set("pdf_url", u); if (!x.cover) { setPdfBusy("Cover…"); const c = await coverFromPdf(f); setX((o: any) => ({ ...o, pdf_url: u, cover: c })); } toast("PDF uploaded. Save to keep it."); } catch (err: any) { toast(err.message, true); } finally { setPdfBusy(""); } }} /></label></div>
            {x.pdf_url && <button type="button" onClick={async () => { try { setPdfBusy("Cover…"); const own = String(x.pdf_url).startsWith("/api/files/"); const c = await coverFromPdf(own ? x.pdf_url : `/api/magazines/pdf/${id}`); set("cover", c); toast("Cover made from page 1. Save to keep it."); } catch (err: any) { toast(err.message || "The cover could not be made from this link.", true); } finally { setPdfBusy(""); } }} className="mt-1.5 text-[12.5px] text-zinc-600 underline hover:text-zinc-900">Make the cover from page 1</button>}
          </Field>
          <Field label="About this issue (optional)"><Textarea rows={2} value={x.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Shown on the website"><Select value={x.status} onChange={(e) => set("status", e.target.value)}><option value="published">Yes</option><option value="draft">No, hidden</option></Select></Field>
        </div>
      </div>
      <div className="border-t border-zinc-200 p-5">
        <div className="mb-3 flex items-center gap-2"><p className="flex-1 text-[14px] font-semibold">Articles in this issue <span className="font-normal text-zinc-400">{arts.length}</span></p><a href={`/admin/articles?new=1&issue=${id}`}><Btn size="sm"><FileText />Write a new article here</Btn></a></div>
        {arts.length > 0 && <div className="mb-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">{arts.map((a, i) => <div key={a.id} className="flex items-center gap-2 px-3 py-2 text-[13px]"><span className="w-5 text-right text-zinc-400">{i + 1}</span><a href={`/admin/articles?edit=${a.id}`} className="min-w-0 flex-1 truncate hover:underline">{a.title}<span className="ml-2 text-[12px] text-zinc-400">{a.author}</span></a>{a.status !== "published" && <Badge>Hidden</Badge>}<Btn size="icon" kind="soft" disabled={i === 0} onClick={() => { const l = [...arts]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; order(l); }} title="Earlier"><ArrowUp /></Btn><Btn size="icon" kind="soft" disabled={i === arts.length - 1} onClick={() => { const l = [...arts]; [l[i + 1], l[i]] = [l[i], l[i + 1]]; order(l); }} title="Later"><ArrowDown /></Btn><Btn size="icon" kind="soft" onClick={async () => { await api(`/api/admin/issues/${id}`, "PATCH", { detach: a.id }); load(); }} title="Take out of this issue"><X /></Btn></div>)}</div>}
        <label className="relative block"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Put an existing article in this issue — type its title" className="pl-8" /></label>
        {found && <div className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-200">{found.length ? found.map((a) => <button key={a.id} disabled={arts.some((y) => y.id === a.id)} onClick={async () => { await api(`/api/admin/issues/${id}`, "PATCH", { attach: a.id }); setQ(""); load(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-zinc-50 disabled:opacity-40"><Plus className="size-3.5 text-zinc-400" /><span className="flex-1 truncate">{a.title}</span><span className="text-[12px] text-zinc-400">{a.author}</span></button>) : <p className="p-3 text-[12.5px] text-zinc-500">Nothing found.</p>}</div>}
      </div>
      <div className="flex justify-end border-t border-zinc-200 p-4"><Btn size="sm" kind="danger" onClick={async () => { if (!confirm("Delete this issue? Its articles stay.")) return; await api(`/api/admin/issues/${id}`, "DELETE"); onClose(); }}><Trash2 />Delete issue</Btn></div>
      {crop && <CoverCropper onClose={() => setCrop(false)} onDone={(u) => { set("cover", u); setCrop(false); }} />}
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(i) => { set("cover", i[0].url); setPick(false); }} />}
    </Sheet>
  );
}

/** Add issues from PDF files, many at once: each PDF is uploaded, its first page becomes the cover, and the number,
    date and title are read from the file name and its first pages (all can be corrected before saving). */
function PdfIssues({ magId, onClose, onDone }: { magId: string; onClose: () => void; onDone: () => void }) {
  type Row = { f: File; number: string; title: string; date: string; state: string };
  const [rows, setRows] = useState<Row[]>([]); const [busy, setBusy] = useState(false); const [publish, setPublish] = useState(true);
  const add = async (fs: FileList | null) => { if (!fs) return; const list = Array.from(fs).filter((f) => /\.pdf$/i.test(f.name)); const got: Row[] = [];
    for (const f of list) { const g = await guessIssue(f); got.push({ f, number: g.number, title: g.title, date: g.date, state: "" }); }
    setRows((r) => [...r, ...got].sort((a, b) => (parseInt(a.number.replace(/\D/g, "")) || 0) - (parseInt(b.number.replace(/\D/g, "")) || 0))); };
  const upd = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const go = async () => {
    setBusy(true); let ok = 0;
    for (let i = 0; i < rows.length; i++) { const r = rows[i]; if (r.state === "Saved") continue;
      try { upd(i, { state: "Uploading…" }); const url = await uploadPdf(r.f, (d) => upd(i, { state: `Uploading ${Math.round(d * 100)}%` }));
        upd(i, { state: "Cover…" }); let cover = ""; try { cover = await coverFromPdf(r.f); } catch {}
        await api(`/api/admin/magazines/${magId}/issues`, "POST", { number: r.number || null, title: r.title || null, date: r.date || null, cover: cover || null, pdf_url: url, status: publish ? "published" : "draft" });
        upd(i, { state: "Saved" }); ok++; } catch (e: any) { upd(i, { state: `Failed: ${e.message}` }); } }
    setBusy(false); toast(`${ok} ${ok === 1 ? "issue" : "issues"} added.`); if (ok === rows.length) onDone();
  };
  return (
    <Modal wide title="Add issues from PDFs" description="Choose the PDF files (one file = one issue). The first page becomes the cover. Check the numbers, titles and dates, then add them." onClose={onClose}>
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-zinc-300 p-6 text-center text-[13px] text-zinc-600 hover:border-zinc-500"><FileUp className="size-5" />Choose PDF files<span className="text-[12px] text-zinc-400">Many at once is fine</span><input type="file" multiple accept="application/pdf,.pdf" className="hidden" onChange={(e) => add(e.target.files)} /></label>
      {rows.length > 0 && <div className="mt-4 max-h-[50vh] divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-200">{rows.map((r, i) => (
        <div key={i} className="grid items-center gap-2 px-3 py-2 sm:grid-cols-[110px_1fr_140px_120px]">
          <Input value={r.number} onChange={(e) => upd(i, { number: e.target.value })} placeholder="Issue 634" className="!h-8" />
          <Input value={r.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="Title" className="!h-8" />
          <Input type="date" value={r.date} onChange={(e) => upd(i, { date: e.target.value })} className="!h-8" />
          <span className={`truncate text-[12px] ${r.state.startsWith("Failed") ? "text-red-700" : r.state === "Saved" ? "text-emerald-700" : "text-zinc-500"}`} title={r.state}>{r.state || `${(r.f.size / 1e6).toFixed(1)} MB`}</span>
        </div>))}</div>}
      <div className="mt-4 flex items-center gap-3"><label className="mr-auto flex items-center gap-2 text-[13px]"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />Show them on the website at once</label>
        <Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" busy={busy} disabled={!rows.length} onClick={go}>Add {rows.length || ""} {rows.length === 1 ? "issue" : "issues"}</Btn></div>
    </Modal>);
}
