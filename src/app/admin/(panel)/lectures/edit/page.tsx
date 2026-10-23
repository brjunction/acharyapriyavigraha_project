import Link from "next/link";
import { ChevronLeft, Eye, Clock, Wand2, History, Bold, Italic, Quote, BookOpen, Mic, ImageIcon, Link2, CheckCircle2 } from "lucide-react";
import { TRANSCRIPT, fmtClock } from "@/lib/data";

const input = "h-10 w-full rounded-lg border border-line bg-page px-3 text-[13.5px] outline-none focus:border-saffron focus:bg-surface";
const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block"><span className="mb-1.5 block text-[13px] font-medium">{label}</span>{children}{hint && <span className="mt-1 block text-[12px] text-ink-3">{hint}</span>}</label>
);

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Link href="/admin/lectures" className="rounded-lg p-1.5 hover:bg-surface" aria-label="Back"><ChevronLeft size={18} /></Link>
          <div><h1 className="text-[26px]">The Mercy of Śrīla Prabhupāda</h1><p className="flex items-center gap-1 text-[12px] text-ink-3"><CheckCircle2 size={12} className="text-ok" />Saved automatically, 2 seconds ago</p></div></div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost !h-9 !rounded-xl text-[13px]"><History size={15} />History</button>
          <button className="btn btn-ghost !h-9 !rounded-xl text-[13px]"><Eye size={15} />Preview</button>
          <button className="btn btn-ghost !h-9 !rounded-xl text-[13px]">Save draft</button>
          <button className="btn btn-primary !h-9 !rounded-xl text-[13px]">Publish</button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h2 className="font-sans text-[15px] font-semibold">Details</h2>
            <Field label="Title"><input className={input} defaultValue="The Mercy of Śrīla Prabhupāda" /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date"><input className={input} defaultValue="1996-01-21" /></Field>
              <Field label="Place"><input className={input} defaultValue="Bhubaneswar, India" /></Field>
              <Field label="Type"><select className={input}><option>Lecture</option><option>Darśana</option><option>Festival</option></select></Field>
            </div>
            <Field label="Audio link (MP3)" hint="The audio stays on the existing hosting. Only the link is stored."><input className={input} defaultValue="https://…/custom_uploads/publications/audio/960121.mp3" /></Field>
          </section>
          <section className="card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <h2 className="font-sans text-[15px] font-semibold">Transcription</h2>
              <div className="flex gap-2 text-[13px]"><button className="flex items-center gap-1.5 rounded-lg bg-saffron-soft px-3 py-1.5 text-saffron"><Clock size={14} />Align timestamps</button><button className="flex items-center gap-1.5 rounded-lg bg-ok-soft px-3 py-1.5 text-ok"><Wand2 size={14} />Find verses</button></div>
            </div>
            <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2 text-ink-2">
              {[Bold, Italic, Quote, BookOpen, Mic, ImageIcon, Link2].map((I, i) => <span key={i} className="rounded-md p-1.5 hover:bg-band"><I size={16} /></span>)}
              <span className="ml-auto self-center text-[12px] text-ink-3">Verse · Speaker · Break · Footnote</span>
            </div>
            <div className="space-y-2.5 p-5 font-serif text-[17px] leading-relaxed">
              {TRANSCRIPT.map((p, i) => (
                <div key={i} className="flex gap-3"><span className="w-12 shrink-0 pt-1 text-right font-sans text-[11px] tabular text-saffron">{fmtClock(p.t)}</span>
                  <p className={p.kind === "verse" ? "border-l-2 border-saffron/40 pl-3 italic" : ""}>{p.speaker && <b className="font-sans text-[13px] text-saffron">{p.speaker}: </b>}{p.text}</p></div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-4 text-[13.5px]">
          <div className="card p-4"><p className="font-semibold">Status</p><div className="mt-2 flex gap-1 rounded-lg bg-band p-1 text-[12px]">{["Draft", "Review", "Published"].map((s, i) => <span key={s} className={`flex-1 rounded-md py-1.5 text-center ${i === 2 ? "bg-surface font-medium shadow-[var(--shadow-sm)]" : "text-ink-3"}`}>{s}</span>)}</div><p className="mt-3 text-[12px] text-ink-3">Schedule for later</p></div>
          <div className="card p-4"><p className="font-semibold">Topics</p><div className="mt-2 flex flex-wrap gap-1.5">{["Śrīla Prabhupāda", "Guru-tattva", "Mercy"].map((t) => <span key={t} className="rounded-full bg-saffron-soft px-2.5 py-1 text-[12px] text-saffron">{t} ×</span>)}<span className="rounded-full border border-dashed border-line-strong px-2.5 py-1 text-[12px] text-ink-3">Add</span></div></div>
          <div className="card p-4"><p className="font-semibold">Verses cited</p><ul className="mt-2 space-y-1 text-[12.5px]"><li className="text-ok">BG 18.65–66, confirmed</li><li className="text-ok">SB 1.2.6, confirmed</li><li className="text-saffron">CC Madhya 15.104, suggested. Confirm?</li></ul></div>
          <div className="card p-4"><p className="font-semibold">Translations</p><ul className="mt-2 space-y-1.5 text-[12.5px]"><li className="flex justify-between"><span>हिन्दी Hindi</span><span className="text-ok">Published</span></li><li className="flex justify-between"><span>ଓଡ଼ିଆ Odia</span><span className="text-saffron">In review</span></li><li className="flex justify-between"><span>Русский Russian</span><span className="text-ink-3">Not started</span></li></ul></div>
        </aside>
      </div>
    </div>
  );
}
