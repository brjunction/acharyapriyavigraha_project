import Link from "next/link";
import { ChevronLeft, Eye, Clock, Wand2, History, Bold, Italic, Quote, BookOpen, Mic, ImageIcon, Link2, CheckCircle2 } from "lucide-react";
import { TRANSCRIPT, fmtClock } from "@/lib/data";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}</label>
);
const input = "h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-gold";

export default function EditLecture() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Link href="/admin/lectures" className="rounded-lg p-1.5 hover:bg-card"><ChevronLeft size={18} /></Link>
          <div><h1 className="font-serif text-2xl">The Mercy of Śrīla Prabhupāda</h1><p className="flex items-center gap-1 text-xs text-ink-3"><CheckCircle2 size={12} className="text-tulasi" />Saved automatically · 2 seconds ago</p></div></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-sm"><History size={15} />History</button>
          <button className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-sm"><Eye size={15} />Preview</button>
          <button className="rounded-lg border border-line bg-card px-3 py-2 text-sm">Save draft</button>
          <button className="rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-paper">Publish</button>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-line bg-card p-5">
            <h2 className="font-medium">Details</h2>
            <Field label="Title"><input className={input} defaultValue="The Mercy of Śrīla Prabhupāda" /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date"><input className={input} defaultValue="1996-01-21" /></Field>
              <Field label="Place"><input className={input} defaultValue="Bhubaneswar, India" /></Field>
              <Field label="Type"><select className={input}><option>Lecture</option><option>Darśana</option><option>Festival</option></select></Field>
            </div>
            <Field label="Audio file link (MP3)" hint="The audio stays on the existing hosting. Only the link is stored."><input className={input} defaultValue="https://…/custom_uploads/publications/audio/960121.mp3" /></Field>
          </section>
          <section className="rounded-xl border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <h2 className="font-medium">Transcription</h2>
              <div className="flex gap-2 text-sm"><button className="flex items-center gap-1.5 rounded-lg bg-saffron-soft px-3 py-1.5 text-saffron"><Clock size={14} />Align timestamps</button><button className="flex items-center gap-1.5 rounded-lg bg-tulasi-soft px-3 py-1.5 text-tulasi"><Wand2 size={14} />Detect verses</button></div>
            </div>
            <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2 text-ink-2">
              {[Bold, Italic, Quote, BookOpen, Mic, ImageIcon, Link2].map((I, i) => <span key={i} className="rounded-md p-1.5 hover:bg-paper-2"><I size={16} /></span>)}
              <span className="ml-auto self-center text-xs text-ink-3">Verse block · Speaker · [break] · Footnote</span>
            </div>
            <div className="space-y-2 p-5 font-serif text-[17px] leading-relaxed">
              {TRANSCRIPT.map((p, i) => (
                <div key={i} className="flex gap-3"><span className="w-12 shrink-0 pt-1 text-right font-sans text-[11px] text-saffron">{fmtClock(p.t)}</span>
                  <p className={p.kind === "verse" ? "border-l-2 border-gold pl-3 italic" : ""}>{p.speaker && <b className="font-sans text-[13px] text-maroon">{p.speaker}: </b>}{p.text}</p></div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-card p-4 text-sm"><p className="font-medium">Status</p><div className="mt-2 flex gap-1 rounded-lg bg-paper-2 p-1 text-xs">{["Draft", "Review", "Published"].map((s, i) => <span key={s} className={`flex-1 rounded-md py-1.5 text-center ${i === 2 ? "bg-card font-medium shadow-sm" : "text-ink-3"}`}>{s}</span>)}</div><p className="mt-3 text-xs text-ink-3">Schedule for later…</p></div>
          <div className="rounded-xl border border-line bg-card p-4 text-sm"><p className="font-medium">Topics (Tattva-kośa)</p><div className="mt-2 flex flex-wrap gap-1.5">{["Śrīla Prabhupāda", "Guru-tattva", "Mercy"].map((t) => <span key={t} className="rounded-full bg-gold-soft px-2.5 py-1 text-xs">{t} ×</span>)}<span className="rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-ink-3">+ add</span></div></div>
          <div className="rounded-xl border border-line bg-card p-4 text-sm"><p className="font-medium">Verses cited</p><ul className="mt-2 space-y-1 text-xs text-tulasi"><li>BG 18.65–66 ✓</li><li>SB 1.2.6 ✓</li><li className="text-saffron">CC Madhya 15.104 · suggested, confirm?</li></ul></div>
          <div className="rounded-xl border border-line bg-card p-4 text-sm"><p className="font-medium">Translations</p><ul className="mt-2 space-y-1.5 text-xs"><li className="flex justify-between"><span>हिन्दी Hindi</span><span className="text-tulasi">Published</span></li><li className="flex justify-between"><span>ଓଡ଼ିଆ Odia</span><span className="text-saffron">In review</span></li><li className="flex justify-between"><span>Русский Russian</span><span className="text-ink-3">Not started</span></li></ul></div>
          <div className="rounded-xl border border-line bg-card p-4 text-sm"><p className="font-medium">SEO</p><p className="mt-1 text-xs text-ink-3">/teachings/audio/1996-01-21-the-mercy-of-srila-prabhupada-bhubaneswar</p></div>
        </aside>
      </div>
    </div>
  );
}
