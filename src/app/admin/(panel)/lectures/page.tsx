import Link from "next/link";
import { Plus, Filter, Upload, MoreHorizontal, FileText } from "lucide-react";
import { LECTURES, fmtDate, fmtDur } from "@/lib/data";

export default function AdminLectures() {
  const status = (i: number) => (["Published", "Published", "Draft", "In review", "Published"] as const)[i % 5];
  const tone = { Published: "bg-tulasi-soft text-tulasi", Draft: "bg-paper-2 text-ink-3", "In review": "bg-saffron-soft text-saffron" };
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-serif text-3xl">Lectures & audio</h1><p className="text-sm text-ink-3">1,595 lectures · audio files are links to the existing MP3 hosting</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-sm"><Upload size={15} />Import CSV</button>
          <Link href="/admin/lectures/edit" className="flex items-center gap-2 rounded-lg bg-maroon px-3.5 py-2 text-sm font-medium text-paper"><Plus size={15} />New lecture</Link>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <input placeholder="Search title, place, verse…" className="h-9 w-64 rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-gold" />
          {["Status", "Year", "Place", "Has transcription", "Language"].map((f) => <button key={f} className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-line px-3 text-sm text-ink-2"><Filter size={13} />{f}</button>)}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-left text-xs uppercase tracking-wider text-ink-3">
            <tr><th className="w-8 p-3"><input type="checkbox" /></th><th className="p-3">Title</th><th className="hidden p-3 md:table-cell">Date</th><th className="hidden p-3 lg:table-cell">Place</th><th className="hidden p-3 md:table-cell">Length</th><th className="p-3">Status</th><th className="w-10 p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {LECTURES.slice(0, 14).map((l, i) => (
              <tr key={l.slug} className="hover:bg-paper-2/50">
                <td className="p-3"><input type="checkbox" /></td>
                <td className="p-3"><Link href="/admin/lectures/edit" className="font-medium hover:text-maroon">{l.title}</Link>{l.transcribed && <FileText size={13} className="ml-1.5 inline text-tulasi" />}<p className="text-xs text-ink-3">{l.type}{l.scripture ? ` · ${l.scripture}` : ""}</p></td>
                <td className="hidden p-3 text-ink-2 md:table-cell">{fmtDate(l.date)}</td>
                <td className="hidden p-3 text-ink-2 lg:table-cell">{l.place}</td>
                <td className="hidden p-3 tabular-nums text-ink-2 md:table-cell">{fmtDur(l.duration)}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${tone[status(i)]}`}>{status(i)}</span></td>
                <td className="p-3"><MoreHorizontal size={16} className="text-ink-3" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-ink-3"><span>Showing 1–14 of 1,595</span><div className="flex gap-1"><span className="rounded border border-line px-2 py-1">‹</span><span className="rounded border border-line bg-paper-2 px-2 py-1">1</span><span className="rounded border border-line px-2 py-1">2</span><span className="rounded border border-line px-2 py-1">›</span></div></div>
      </div>
    </div>
  );
}
