"use client";
/* Studio → Gauḍīya library: one simple page. What is in the library, every book with the ācārya it belongs to, and the three things to do next. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Library, Upload, BookUser, GitBranch, ExternalLink, Search } from "lucide-react";
import { Badge, Card, Input, Select, PageHeader, Empty, api, toast } from "../ui";

type B = { id: string; kind?: string; slug: string; title: string; author?: string; acharya?: string | null; library?: string; status: string; language?: string; chapters: number; cover_url?: string };
type A = { slug: string; title: string };
const core = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/_/g, " ").replace(/\b(sri|srila|srimad|srimati|sripada)\b/g, " ").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
const guess = (b: B, as: A[]) => as.find((a) => b.acharya === a.slug) || as.find((a) => { const n = core(a.title); return [b.acharya, b.author].some((x) => { const c = x ? core(x) : ""; return c.length >= 4 && (c === n || c.includes(n) || n.includes(c)); }); });

export function GaudiyaPanel() {
  const [books, setBooks] = useState<B[] | null>(null); const [as, setAs] = useState<A[]>([]); const [q, setQ] = useState(""); const [who, setWho] = useState("");
  const load = () => api<B[]>("/api/admin/books").then((r) => setBooks(r.filter((b) => b.library === "gaudiya"))).catch((e) => toast(e.message, true));
  useEffect(() => { load(); Promise.all([api<any>("/api/admin/archive/parampara"), api<any>("/api/admin/archive/biographies")]).then(([p, b]) => { const rows = [...(p.items || p), ...(b.items || b)] as any[]; const seen = new Set<string>(); setAs(rows.filter((x) => !seen.has(x.slug) && seen.add(x.slug)).map((x) => ({ slug: x.slug, title: x.title }))); }).catch(() => {}); }, []);
  const rows = useMemo(() => (books || []).map((b) => ({ b, a: guess(b, as) })), [books, as]);
  const f = core(q); const shown = rows.filter(({ b, a }) => (!f || core(`${b.title} ${b.author || ""}`).includes(f)) && (!who || (who === "-" ? !a : a?.slug === who)));
  const setA = async (b: B, slug: string) => { try { await api(`/api/admin/books/${b.id}/acharya`, "POST", { acharya: slug || null }); setBooks((xs) => xs && xs.map((x) => (x.id === b.id ? { ...x, acharya: slug || null } : x))); toast("Saved."); } catch (e: any) { toast(e.message, true); } };
  const unmatched = rows.filter((r) => !r.a).length;
  return (
    <div>
      <PageHeader icon={Library} title="Gauḍīya library" description="The books of the ācāryas, their biographies and the Guru-paramparā. Everything here appears under /gaudiya on the website."><a href="/gaudiya" target="_blank" className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-[13px] hover:bg-zinc-50"><ExternalLink className="size-4" />View</a></PageHeader>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {([["/admin/books/import?library=gaudiya", Upload, "Import books", "EPUB or Word — one, or a ZIP of many (each folder = one ācārya)"], ["/admin/archive/biographies", BookUser, "Biographies", "Gaura-pārṣadas, ācāryas and Vaiṣṇavas"], ["/admin/archive/parampara", GitBranch, "Guru-paramparā", "The succession; each ācārya’s life is written here"]] as const).map(([h, I, t, d]) => (
          <Link key={h} href={h} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><I className="size-[18px]" /></span><span><span className="block text-[14px] font-medium">{t}</span><span className="block text-[12.5px] text-zinc-500">{d}</span></span></Link>))}
      </div>
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-3">
          <p className="mr-auto text-[13px] font-medium">{books ? `${books.length} books` : "Loading…"}{unmatched > 0 && <span className="ml-2 text-[12px] font-normal text-amber-700">{unmatched} without an ācārya</span>}</p>
          <label className="relative"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a book" className="!h-8 w-[200px] pl-8" /></label>
          <Select value={who} onChange={(e) => setWho(e.target.value)} className="!h-8 !w-[220px]"><option value="">Every ācārya</option><option value="-">Without an ācārya</option>{as.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}</Select>
        </div>
        {books && !books.length ? <Empty icon={Library} title="No Gauḍīya books yet" text="Import the first ones: EPUB or Word files, or a ZIP with one folder per ācārya." /> :
          <div className="divide-y divide-zinc-100">{shown.map(({ b, a }) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className="flex h-11 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[2px_4px_4px_2px] bg-zinc-800">{b.cover_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1"><Link href={`/admin/books/${b.id}`} className="block truncate text-[13.5px] font-medium hover:underline">{b.title}</Link><span className="text-[12px] text-zinc-500">{b.author || "—"} · {b.chapters} chapters · {(b.language || "").toUpperCase()}</span></span>
              {b.status !== "published" && <Badge>Draft</Badge>}
              <Select value={b.kind || "book"} onChange={async (e) => { const kind = e.target.value; try { await api(`/api/admin/books/${b.id}/acharya`, "POST", { kind }); setBooks((xs) => xs && xs.map((x) => (x.id === b.id ? { ...x, kind } : x))); toast("Saved."); } catch (er: any) { toast(er.message, true); } }} className="!h-8 !w-[150px]" aria-label="Shown on"><option value="book">Library</option><option value="scripture">Scriptures</option><option value="songs">Padyāvalī</option></Select>
              <Select value={a?.slug || ""} onChange={(e) => setA(b, e.target.value)} className={`!h-8 !w-[240px] ${a ? "" : "!border-amber-300"}`} aria-label="Ācārya"><option value="">Choose the ācārya…</option>{as.map((x) => <option key={x.slug} value={x.slug}>{x.title}</option>)}</Select>
            </div>))}</div>}
      </Card>
    </div>);
}
