import Link from "next/link";
import { Plus, Filter, Upload, MoreHorizontal, FileText } from "lucide-react";
import { LECTURES, fmtDate, fmtDur } from "@/lib/data";

const STATUS = ["Published", "Published", "Draft", "In review", "Published"] as const;
const TONE = { Published: "bg-ok-soft text-ok", Draft: "bg-band text-ink-3", "In review": "bg-saffron-soft text-saffron" };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-[30px]">Lectures & audio</h1><p className="text-[13.5px] text-ink-3">1,595 lectures. Audio stays on the existing hosting; only the link is stored.</p></div>
        <div className="flex gap-2"><button className="btn btn-ghost !rounded-xl"><Upload size={15} />Import spreadsheet</button><Link href="/admin/lectures/edit" className="btn btn-primary !rounded-xl"><Plus size={15} />New lecture</Link></div>
      </div>
      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <input placeholder="Search title, place, verse…" className="h-9 w-64 rounded-lg border border-line bg-page px-3 text-[13.5px] outline-none focus:border-saffron" />
          {["Status", "Year", "Place", "Has transcription", "Language"].map((f) => <button key={f} className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 text-[13px] text-ink-2"><Filter size={13} />{f}</button>)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-band/60 text-left text-[11px] uppercase tracking-[0.1em] text-ink-3"><tr><th className="w-8 p-3"><input type="checkbox" aria-label="Select all" /></th><th className="p-3">Title</th><th className="hidden p-3 md:table-cell">Date</th><th className="hidden p-3 lg:table-cell">Place</th><th className="hidden p-3 md:table-cell">Length</th><th className="p-3">Status</th><th className="w-10 p-3" /></tr></thead>
            <tbody className="divide-y divide-line">{LECTURES.slice(0, 14).map((l, i) => { const st = STATUS[i % 5]; return (
              <tr key={l.slug} className="hover:bg-saffron-tint">
                <td className="p-3"><input type="checkbox" aria-label={`Select ${l.title}`} /></td>
                <td className="p-3"><Link href="/admin/lectures/edit" className="font-medium hover:text-saffron">{l.title}</Link>{l.transcribed && <FileText size={13} className="ml-1.5 inline text-ok" />}<p className="text-[12px] text-ink-3">{l.type}{l.scripture ? ` · ${l.scripture}` : ""}</p></td>
                <td className="hidden p-3 text-ink-2 md:table-cell">{fmtDate(l.date)}</td>
                <td className="hidden p-3 text-ink-2 lg:table-cell">{l.place}</td>
                <td className="hidden whitespace-nowrap p-3 tabular text-ink-2 md:table-cell">{fmtDur(l.duration)}</td>
                <td className="p-3"><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] ${TONE[st]}`}>{st}</span></td>
                <td className="p-3"><MoreHorizontal size={16} className="text-ink-3" /></td>
              </tr>); })}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[12px] text-ink-3"><span>1–14 of 1,595</span><div className="flex gap-1">{["‹", "1", "2", "3", "›"].map((x) => <span key={x} className={`rounded-md border border-line px-2 py-1 ${x === "1" ? "bg-saffron text-white" : ""}`}>{x}</span>)}</div></div>
      </div>
    </div>
  );
}
