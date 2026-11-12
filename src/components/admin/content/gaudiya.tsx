"use client";
/* Studio → Gauḍīya library: one simple page. What is in the library, every book with the ācārya it belongs to, and the three things to do next. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Library, Upload, BookUser, GitBranch, ExternalLink, Search, FolderTree, Trash2, Plus } from "lucide-react";
import { Badge, Btn, Card, Input, Select, PageHeader, Empty, Modal, api, toast } from "../ui";
import { BulkBar, Tick } from "./book-bulk";

type B = { id: string; kind?: string; subject?: string | null; slug: string; title: string; author?: string; acharya?: string | null; library?: string; status: string; language?: string; chapters: number; cover_url?: string };
type A = { slug: string; title: string };
type Cat = { id: string; slug: string; name: string; description: string | null; parent_id: string | null; position: number; n: number };
const core = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/_/g, " ").replace(/\b(sri|srila|srimad|srimati|sripada)\b/g, " ").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
const guess = (b: B, as: A[]) => as.find((a) => b.acharya === a.slug) || as.find((a) => { const n = core(a.title); return [b.acharya, b.author].some((x) => { const c = x ? core(x) : ""; return c.length >= 4 && (c === n || c.includes(n) || n.includes(c)); }); });

export function GaudiyaPanel() {
  const [books, setBooks] = useState<B[] | null>(null); const [cats, setCats] = useState<Cat[]>([]); const [mgr, setMgr] = useState(false);
  const loadCats = () => api<Cat[]>("/api/admin/gaudiya/categories").then(setCats).catch(() => {});
  useEffect(() => { loadCats(); }, []); const [as, setAs] = useState<A[]>([]); const [q, setQ] = useState(""); const [who, setWho] = useState(""); const [sel, setSel] = useState<Set<string>>(new Set());
  const tick = (ids: string[], v: boolean) => setSel((x) => { const y = new Set(x); ids.forEach((i) => (v ? y.add(i) : y.delete(i))); return y; });
  const load = () => api<B[]>("/api/admin/books").then((r) => setBooks(r.filter((b) => b.library === "gaudiya"))).catch((e) => toast(e.message, true));
  useEffect(() => { load(); Promise.all([api<any>("/api/admin/archive/parampara"), api<any>("/api/admin/archive/biographies")]).then(([p, b]) => { const rows = [...(p.items || p), ...(b.items || b)] as any[]; const seen = new Set<string>(); setAs(rows.filter((x) => !seen.has(x.slug) && seen.add(x.slug)).map((x) => ({ slug: x.slug, title: x.title }))); }).catch(() => {}); }, []);
  const rows = useMemo(() => (books || []).map((b) => ({ b, a: guess(b, as) })), [books, as]);
  const f = core(q); const shown = rows.filter(({ b, a }) => (!f || core(`${b.title} ${b.author || ""}`).includes(f)) && (!who || (who === "-" ? !a : a?.slug === who)));
  const setA = async (b: B, slug: string) => { try { await api(`/api/admin/books/${b.id}/acharya`, "POST", { acharya: slug || null }); setBooks((xs) => xs && xs.map((x) => (x.id === b.id ? { ...x, acharya: slug || null } : x))); toast("Saved."); } catch (e: any) { toast(e.message, true); } };
  const unmatched = rows.filter((r) => !r.a).length;
  return (
    <div>
      <PageHeader icon={Library} title="Gauḍīya library" description="The books of the ācāryas, their biographies and the Guru-paramparā. Everything here appears under /gaudiya on the website."><Btn onClick={() => setMgr(true)}><FolderTree />Categories</Btn><a href="/gaudiya" target="_blank" className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-[13px] hover:bg-zinc-50"><ExternalLink className="size-4" />View</a></PageHeader>
      {mgr && <Categories cats={cats} onClose={() => setMgr(false)} onChanged={loadCats} />}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {([["/admin/books/import?library=gaudiya", Upload, "Import books", "EPUB or Word — one, or a ZIP of many (each folder = one ācārya)"], ["/admin/archive/biographies", BookUser, "Biographies", "Gaura-pārṣadas, ācāryas and Vaiṣṇavas"], ["/admin/archive/parampara", GitBranch, "Guru-paramparā", "The succession; each ācārya’s life is written here"]] as const).map(([h, I, t, d]) => (
          <Link key={h} href={h} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><I className="size-[18px]" /></span><span><span className="block text-[14px] font-medium">{t}</span><span className="block text-[12.5px] text-zinc-500">{d}</span></span></Link>))}
      </div>
      <BulkBar ids={[...sel]} total={shown.length} library="gaudiya" opt={{ cats, acharyas: as }} onAll={() => tick(shown.map((r) => r.b.id), true)} onClear={() => setSel(new Set())} onDone={() => { load(); loadCats(); }} />
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-3">
          {shown.length > 0 && (() => { const on = shown.filter((r) => sel.has(r.b.id)).length; return <Tick on={on === shown.length} mixed={on > 0 && on < shown.length} label="Tick every book shown" onChange={(v) => tick(shown.map((r) => r.b.id), v)} />; })()}
          <p className="mr-auto text-[13px] font-medium">{books ? `${books.length} books` : "Loading…"}{unmatched > 0 && <span className="ml-2 text-[12px] font-normal text-amber-700">{unmatched} without an ācārya</span>}</p>
          {(books || []).some((b) => b.status !== "published") && <Btn size="sm" kind="primary" onClick={async () => { const n = (books || []).filter((b) => b.status !== "published").length; if (!confirm(`Publish all ${n} drafts of the Gauḍīya library now? They appear on the website at once.`)) return; try { const r = await api<{ n: number }>("/api/admin/books/bulk", "POST", { op: "publish", library: "gaudiya" }); toast(`${r.n} books published.`); load(); } catch (e: any) { toast(e.message, true); } }}>Publish all {(books || []).filter((b) => b.status !== "published").length} drafts</Btn>}
          <label className="relative"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a book" className="!h-8 w-[200px] pl-8" /></label>
          <Select value={who} onChange={(e) => setWho(e.target.value)} className="!h-8 !w-[220px]"><option value="">Every ācārya</option><option value="-">Without an ācārya</option>{as.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}</Select>
        </div>
        {books && !books.length ? <Empty icon={Library} title="No Gauḍīya books yet" text="Import the first ones: EPUB or Word files, or a ZIP with one folder per ācārya." /> :
          <div className="divide-y divide-zinc-100">{shown.map(({ b, a }) => (
            <div key={b.id} className={`flex flex-wrap items-center gap-3 px-3 py-2 ${sel.has(b.id) ? "bg-zinc-50" : ""}`}>
              <Tick on={sel.has(b.id)} label={`Tick “${b.title}”`} onChange={(v) => tick([b.id], v)} />
              <span className="flex h-11 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[2px_4px_4px_2px] bg-zinc-800">{b.cover_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1"><Link href={`/admin/books/${b.id}`} className="block truncate text-[13.5px] font-medium hover:underline">{b.title}</Link><span className="text-[12px] text-zinc-500">{b.author || "—"} · {b.chapters} chapters · {(b.language || "").toUpperCase()}</span></span>
              {b.status !== "published" && <Badge>Draft</Badge>}
              <Select value={b.subject || ""} onChange={async (e) => { const subject = e.target.value || null; try { await api(`/api/admin/books/${b.id}/acharya`, "POST", { subject }); setBooks((xs) => xs && xs.map((x) => (x.id === b.id ? { ...x, subject } : x))); toast("Saved."); } catch (er: any) { toast(er.message, true); } }} className={`!h-8 !w-[210px] ${b.subject ? "" : "!text-zinc-400"}`} aria-label="Category"><option value="">Category…</option>{cats.filter((c) => !c.parent_id).map((c) => <optgroup key={c.id} label={c.name}><option value={c.slug}>{c.name}</option>{cats.filter((x) => x.parent_id === c.id).map((x) => <option key={x.id} value={x.slug}>{c.name} › {x.name}</option>)}</optgroup>)}</Select>
              <Select value={b.kind || "book"} onChange={async (e) => { const kind = e.target.value; try { await api(`/api/admin/books/${b.id}/acharya`, "POST", { kind }); setBooks((xs) => xs && xs.map((x) => (x.id === b.id ? { ...x, kind } : x))); toast("Saved."); } catch (er: any) { toast(er.message, true); } }} className="!h-8 !w-[150px]" aria-label="Shown on"><option value="book">Library</option><option value="scripture">Scriptures</option><option value="songs">Padyāvalī</option></Select>
              <Select value={a?.slug || ""} onChange={(e) => setA(b, e.target.value)} className={`!h-8 !w-[240px] ${a ? "" : "!border-amber-300"}`} aria-label="Ācārya"><option value="">Choose the ācārya…</option>{as.map((x) => <option key={x.slug} value={x.slug}>{x.title}</option>)}</Select>
            </div>))}</div>}
      </Card>
    </div>);
}

/** Categories and subcategories of the library (like the index of Gauḍīya Grantha Mandira): add, rename, describe, order, delete. */
function Categories({ cats, onClose, onChanged }: { cats: Cat[]; onClose: () => void; onChanged: () => void }) {
  const [nw, setNw] = useState({ name: "", description: "", parent_id: "" });
  const save = async (c: Cat, p: Partial<Cat>) => { try { await api("/api/admin/gaudiya/categories", "PATCH", { id: c.id, ...p }); onChanged(); } catch (e: any) { toast(e.message, true); } };
  const tops = cats.filter((c) => !c.parent_id);
  const row = (c: Cat, sub = false) => <div key={c.id} className={`grid items-center gap-2 py-1.5 sm:grid-cols-[1fr_1.4fr_auto] ${sub ? "pl-6" : ""}`}>
    <Input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && save(c, { name: e.target.value })} className={sub ? "" : "font-medium"} />
    <Input defaultValue={c.description || ""} placeholder="A line about it" onBlur={(e) => e.target.value !== (c.description || "") && save(c, { description: e.target.value })} />
    <span className="flex items-center gap-2"><span className="w-14 text-right text-[12px] tabular-nums text-zinc-500">{c.n} books</span><button title="Delete" onClick={async () => { if (!confirm(`Delete “${c.name}”${sub ? "" : " and its subcategories"}? Its books stay, without a category.`)) return; await api(`/api/admin/gaudiya/categories?id=${c.id}`, "DELETE"); onChanged(); }} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"><Trash2 className="size-4" /></button></span>
  </div>;
  return (
    <Modal wide title="Categories" description="How the library index is organised. Each book is placed in one category or subcategory (on the list of books)." onClose={onClose}>
      <div className="max-h-[55vh] overflow-y-auto pr-1">{tops.map((c) => <div key={c.id} className="border-b border-zinc-100 py-1">{row(c)}{cats.filter((x) => x.parent_id === c.id).map((x) => row(x, true))}</div>)}</div>
      <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-zinc-300 p-3 sm:grid-cols-[1fr_1.4fr_200px_auto]">
        <Input value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} placeholder="New category name" />
        <Input value={nw.description} onChange={(e) => setNw({ ...nw, description: e.target.value })} placeholder="A line about it (optional)" />
        <Select value={nw.parent_id} onChange={(e) => setNw({ ...nw, parent_id: e.target.value })}><option value="">A main category</option>{tops.map((c) => <option key={c.id} value={c.id}>Inside {c.name}</option>)}</Select>
        <Btn kind="primary" disabled={!nw.name.trim()} onClick={async () => { try { await api("/api/admin/gaudiya/categories", "POST", { ...nw, parent_id: nw.parent_id || null }); setNw({ name: "", description: "", parent_id: nw.parent_id }); onChanged(); } catch (e: any) { toast(e.message, true); } }}><Plus />Add</Btn>
      </div>
    </Modal>);
}
