import Link from "next/link";
import { Headphones, Quote, ImagePlus, Languages, AlertTriangle, CheckCircle2, RefreshCw, DatabaseBackup } from "lucide-react";
import { STATS, LANGUAGES } from "@/lib/data";

export default function Overview() {
  const tiles: [string, string, string][] = [["Lectures", STATS.lectures.toLocaleString(), "130 transcribed"], ["Quotes", "1,840", "44 subjects"], ["Books & magazines", String(STATS.books), "3 publishers"], ["Photos", "2,316", "38 albums"]];
  const activity = [
    ["Madhavananda Dāsa", "published a transcription", "Lecture on SB 1.2.6", "12 min ago"],
    ["Hindi team", "sent 14 quotes for review", "Translation queue", "1 h ago"],
    ["YouTube sync", "brought in today's Daily Diary", "Daily Diary", "3 h ago"],
    ["Vraja Kishori D.D.", "changed the home page banner", "Home page", "yesterday"],
    ["Link checker", "found 3 broken audio links", "Link checker", "yesterday"],
  ];
  const quick: [typeof Headphones, string, string][] = [[Headphones, "Add lecture", "/admin/lectures/edit"], [Quote, "Add quote", "/admin/quotes"], [ImagePlus, "Upload photos", "/admin/gallery"], [Languages, "Translate", "/admin/translation-queue"]];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[13.5px] text-ink-3">Hare Kṛṣṇa</p><h1 className="text-[25px]">Welcome back</h1></div>
        <div className="flex flex-wrap gap-2">{quick.map(([I, l, h]) => <Link key={l} href={h} className="btn btn-ghost !h-9 !rounded-xl !px-3.5 text-[13px]"><I size={15} className="text-saffron" />{l}</Link>)}</div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(([a, b, c]) => <div key={a} className="card p-5"><p className="text-[13px] text-ink-3">{a}</p><p className="mt-1 font-serif text-[25px] font-bold">{b}</p><p className="text-[12px] text-ink-3">{c}</p></div>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-sans text-[15px] font-semibold">Recent activity</h2><Link href="/admin/audit-log" className="text-[12.5px] text-saffron">Activity log</Link></div>
          <ul className="divide-y divide-line">{activity.map(([who, what, where, when]) => (
            <li key={who + when} className="flex items-center gap-3 px-5 py-3.5 text-[13.5px]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-band text-[12px] font-semibold">{who[0]}</span>
              <p className="flex-1"><span className="font-medium">{who}</span> <span className="text-ink-2">{what}</span> · <span className="text-saffron">{where}</span></p>
              <span className="text-[12px] text-ink-3">{when}</span>
            </li>))}</ul>
        </div>
        <div className="space-y-6">
          <div className="card p-5"><h2 className="font-sans text-[15px] font-semibold">My tasks</h2>
            <ul className="mt-3 space-y-2 text-[13.5px]">
              <li className="flex justify-between rounded-lg bg-saffron-soft px-3 py-2 text-saffron"><span>Review Hindi quotes</span><b>14</b></li>
              <li className="flex justify-between rounded-lg bg-band px-3 py-2"><span>Align timestamps</span><b>6</b></li>
              <li className="flex justify-between rounded-lg bg-band px-3 py-2"><span>Drafts to finish</span><b>3</b></li>
            </ul></div>
          <div className="card p-5"><h2 className="font-sans text-[15px] font-semibold">Site health</h2>
            <ul className="mt-3 space-y-2.5 text-[13.5px]">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-ok" />Backup today at 02:00</li>
              <li className="flex items-center gap-2"><RefreshCw size={16} className="text-ok" />YouTube synced 3 h ago</li>
              <li className="flex items-center gap-2"><DatabaseBackup size={16} className="text-ok" />Search index up to date</li>
              <li className="flex items-center gap-2"><AlertTriangle size={16} className="text-saffron" />3 broken audio links</li>
            </ul></div>
        </div>
      </div>
      <div className="card mt-6 p-5"><h2 className="font-sans text-[15px] font-semibold">Translation coverage</h2>
        <div className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">{LANGUAGES.map((l) => (
          <div key={l.code} className="flex items-center gap-3 text-[13.5px]"><span className="w-28">{l.name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-band"><div className="h-full rounded-full bg-saffron" style={{ width: `${l.ui}%` }} /></div><span className="w-10 text-right tabular text-ink-3">{l.ui}%</span></div>))}
        </div></div>
      <p className="mt-6 text-center text-[12px] text-ink-3">Prototype: all figures are samples.</p>
    </div>
  );
}
