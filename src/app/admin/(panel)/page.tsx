import Link from "next/link";
import { Plus, Headphones, Quote, ImagePlus, Languages, AlertTriangle, CheckCircle2, RefreshCw, DatabaseBackup } from "lucide-react";
import { STATS, LANGUAGES } from "@/lib/data";

export default function Overview() {
  const tiles = [["Lectures", STATS.lectures.toLocaleString(), "130 transcribed"], ["Quotes", "1,840", "44 categories"], ["Books & magazines", STATS.books, "3 publishers"], ["Photos", "2,316", "38 albums"]];
  const activity = [
    ["Madhavananda Dāsa", "published a transcription", "Lecture on SB 1.2.6", "12 min ago"],
    ["Hindi team", "submitted 14 quotes for review", "Translation queue", "1 h ago"],
    ["YouTube sync", "imported today's Daily Diary short", "Daily Diary", "3 h ago"],
    ["Vraja Kishori D.D.", "updated the home page banner", "Home page builder", "yesterday"],
    ["Link checker", "found 3 broken audio links", "Link checker", "yesterday"],
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-ink-3">Hare Kṛṣṇa 🙏</p><h1 className="font-serif text-3xl">Welcome back</h1></div>
        <div className="flex flex-wrap gap-2">
          {[[Headphones, "Add lecture", "/admin/lectures/edit"], [Quote, "Add quote", "/admin/quotes"], [ImagePlus, "Upload photos", "/admin/gallery"], [Languages, "Translate", "/admin/translation-queue"]].map(([I, l, h]) => {
            const Icon = I as typeof Plus;
            return <Link key={l as string} href={h as string} className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-sm hover:border-gold"><Icon size={15} className="text-saffron" />{l as string}</Link>;
          })}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(([a, b, c]) => <div key={a as string} className="rounded-xl border border-line bg-card p-5"><p className="text-sm text-ink-3">{a}</p><p className="mt-1 font-serif text-3xl">{b}</p><p className="mt-1 text-xs text-ink-3">{c}</p></div>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-medium">Recent activity</h2><Link href="/admin/audit-log" className="text-xs text-saffron">Audit log →</Link></div>
          <ul className="divide-y divide-line">
            {activity.map(([who, what, where, when]) => (
              <li key={who + when} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xs font-medium">{who[0]}</span>
                <p className="flex-1"><span className="font-medium">{who}</span> <span className="text-ink-2">{what}</span> · <span className="text-maroon">{where}</span></p>
                <span className="text-xs text-ink-3">{when}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-card p-5">
            <h2 className="font-medium">My tasks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between rounded-lg bg-saffron-soft px-3 py-2"><span>Review Hindi quotes</span><span className="font-medium">14</span></li>
              <li className="flex justify-between rounded-lg bg-paper-2 px-3 py-2"><span>Align timestamps</span><span className="font-medium">6</span></li>
              <li className="flex justify-between rounded-lg bg-paper-2 px-3 py-2"><span>Drafts to finish</span><span className="font-medium">3</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h2 className="font-medium">Site health</h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-tulasi" />Backup: today 02:00</li>
              <li className="flex items-center gap-2"><RefreshCw size={16} className="text-tulasi" />YouTube sync: 3 h ago</li>
              <li className="flex items-center gap-2"><DatabaseBackup size={16} className="text-tulasi" />Search index: up to date</li>
              <li className="flex items-center gap-2"><AlertTriangle size={16} className="text-saffron" />3 broken audio links</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-line bg-card p-5">
        <h2 className="font-medium">Translation coverage</h2>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {LANGUAGES.map((l) => <div key={l.code} className="flex items-center gap-3 text-sm"><span className="w-28">{l.name}</span><div className="h-2 flex-1 rounded-full bg-paper-2"><div className="h-full rounded-full bg-tulasi" style={{ width: `${l.ui}%` }} /></div><span className="w-10 text-right text-ink-3">{l.ui}%</span></div>)}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-ink-3">Prototype: all figures are samples.</p>
    </div>
  );
}
