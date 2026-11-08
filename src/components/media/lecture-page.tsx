// The lecture page itself, shared by /teachings/audio/<slug> and /audios/<code>.
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, BookOpen, Tag, Languages, Clock } from "lucide-react";
import { LECTURES, fmtDate, fmtDur, QUOTE_OF_DAY } from "@/lib/data";
import { LectureHeroControls, Transcript, LectureRow } from "@/components/lecture";
import { Container, QuoteCard } from "@/components/ui";
import { PaisleyField, Rosette } from "@/components/motifs";
import { getAudio, toLecture } from "@/lib/cms/library";
import { Render, headings } from "@/components/cms/doc";
import { docText } from "@/components/cms/doc-text";
import { LectureLayout } from "@/components/media/lecture-layout";
import { LecturePlayer } from "@/components/media/player";
import { SuggestButton, SelectToSuggest } from "@/components/media/suggest";
import { TranscriptSwitch } from "@/components/media/transcript-switch";
import { sql } from "@/lib/db";


/** A lecture: its details, a slim player, the transcription as a reading page, and what is related. */
export async function RealLecture({ a }: { a: any }) {
  const l = toLecture(a); const song = a.kind === "kirtan" || a.kind === "bhajan";
  const [quotes, related] = await Promise.all([
    sql`select kind, slug, text, at_sec from excerpts where audio_id = ${a.id} and status = 'published' order by at_sec nulls last limit 30`.catch(() => [] as any[]),
    sql`select slug, title, kind, type, date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, audio_direct, transcript_status from audios where status = 'published' and id <> ${a.id} and ((place is not null and place = ${a.place}) or (series is not null and series = ${a.series}) or (scripture is not null and scripture = ${a.scripture} and chapter is not distinct from ${a.chapter})) order by date desc nulls last limit 6`.catch(() => [] as any[]),
  ]);
  const base = song ? "/teachings/kirtans" : "/teachings/audio";
  const facts: [string, string | null, string | null][] = [
    ["Date", l.date ? fmtDate(l.date) : a.date_note || null, l.date ? `${base}?year=${l.date.slice(0, 4)}` : null], ["Place", [l.place, l.country].filter(Boolean).join(", ") || null, l.place ? `${base}?place=${encodeURIComponent([l.country || "Unknown country", l.place].join("/"))}` : null],
    ["Type", l.type, `${base}?type=${encodeURIComponent(l.type)}`], ["Verse", l.scripture || null, null], ["Occasion", a.occasion || null, null],
    ["Song", a.song || null, null], ["Written by", a.song_author || null, null], ["Sung by", a.singer || null, null],
    ["Series", a.series || null, a.series ? `${base}?series=${encodeURIComponent(a.series)}` : null], ["Language", a.language || null, null], ["Length", l.duration ? fmtDur(l.duration) : null, null],
  ];
  const own = Array.isArray(a.transcript) ? a.transcript : []; const mach = Array.isArray(a.machine_transcript) ? a.machine_transcript : [];
  const doc = own.length ? own : mach; const heads = headings(doc);
  const ld = { "@context": "https://schema.org", "@type": "AudioObject", name: l.title, contentUrl: a.audio_url || undefined, uploadDate: l.date || undefined, duration: l.duration ? `PT${Math.floor(l.duration / 60)}M${l.duration % 60}S` : undefined, description: a.summary || undefined, locationCreated: l.place || undefined, inLanguage: a.language || undefined, creator: { "@type": "Person", name: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva" } };
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6">
        <LectureLayout label={song ? "Words" : "Transcription"} title={l.title} heads={heads.map((h: any) => ({ id: h.id, text: h.text, level: h.level }))}
          head={<>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-saffron">{[l.type, l.scripture].filter(Boolean).join(" · ")}</p>
            <h1 className="mt-1.5 text-[26px] leading-tight text-ink sm:text-[30px]">{l.title}</h1>
            {a.file_title && <p className="mt-1 break-all text-[12px] text-ink-3" title="The name of the file when you download it">{a.file_title}.mp3</p>}
            <p className="mt-2 text-[13px] text-ink-3">{[l.date ? fmtDate(l.date) : a.date_note, [l.place, l.country].filter(Boolean).join(", "), l.duration ? fmtDur(l.duration) : null].filter(Boolean).join(" · ")}</p>
            {a.summary && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{a.summary}</p>}
          </>}
          player={<LecturePlayer l={l} />}
          transcript={<>
            {heads.length > 2 && <nav className="mb-6 rounded-xl border border-line p-4 lg:hidden"><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">Contents</p><ol className="columns-1 gap-6 text-[13px] sm:columns-2">{heads.map((h) => <li key={h.id} className="mb-1" style={{ paddingLeft: (h.level - 1) * 12 }}><a href={`#${h.id}`} className="text-ink-2 hover:text-saffron">{h.text}</a></li>)}</ol></nav>}
            {doc.length ? <SelectToSuggest><TranscriptSwitch source={a.machine_source} devotee={own.length ? <div className="book-body"><Render doc={own} /></div> : null} auto={mach.length ? <div className="book-body"><Render doc={mach} /></div> : null} /></SelectToSuggest> : <p className="mt-6 rounded-xl border border-dashed border-line p-8 text-center text-[13.5px] text-ink-3">The {song ? "words of this song are" : "transcription of this lecture is"} being prepared.</p>}
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-4"><SuggestButton slug={a.slug} label="Suggest an improvement to this transcription" /></div>
          </>}
          aside={<>

            <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">{facts.filter(([, v]) => v).map(([k, v, h]) => <div key={k} className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-3">{k}</dt><dd className="text-right text-ink">{h ? <Link href={h} className="hover:text-saffron">{v}</Link> : v}</dd></div>)}</dl>
            {l.topics.length > 0 && <div><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">Topics</p><div className="flex flex-wrap gap-1.5">{l.topics.map((t) => <Link key={t} href={`${base}?topic=${encodeURIComponent(t)}`} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-ink-2 hover:border-saffron hover:text-saffron">{t}</Link>)}</div></div>}
            {quotes.length > 0 && <div><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">Quotes from this lecture</p><ul className="space-y-2.5">{quotes.slice(0, 5).map((q: any) => <li key={q.slug}><Link href={`/teachings/quotes#${q.slug}`} className="block text-[13px]  leading-snug text-ink-2 hover:text-saffron">“{String(q.text).slice(0, 150)}{String(q.text).length > 150 ? "…" : ""}”</Link></li>)}</ul></div>}
            <div><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">Cite</p><p className="text-[12.5px] leading-relaxed text-ink-2">Śrī Śrīmad Gour Govinda Swāmī Gurudeva, “{l.title}”, {l.type.toLowerCase()}, {[l.place, l.date ? fmtDate(l.date) : a.date_note].filter(Boolean).join(", ")}. Taptajīvanam archive.</p></div>
            <div className="sm:col-span-2 lg:col-span-3"><SuggestButton slug={a.slug} about="info" label="Know more about this recording? Tell us" /></div>
          </>}
        />
        {related.length > 0 && <section className="mt-14"><h2 className="mb-2 border-b border-line pb-2 text-[15px] font-semibold text-ink">Related {song ? "recordings" : "lectures"}</h2><div className="divide-y divide-line">{related.map((r: any) => <LectureRow key={r.slug} l={toLecture(r)} />)}</div></section>}
      </div>
    </div>
  );
}
