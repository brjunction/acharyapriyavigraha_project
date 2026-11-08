import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, BookOpen, Tag, Languages, Clock } from "lucide-react";
import { LECTURES, fmtDate, fmtDur, QUOTE_OF_DAY } from "@/lib/data";
import { Container, QuoteCard } from "@/components/ui";
import { PaisleyField, Rosette } from "@/components/motifs";
import { getAudio, toLecture } from "@/lib/cms/library";
import { RealLecture } from "@/components/media/lecture-page";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = await getAudio(slug);
  if (a) { const l = toLecture(a); return { title: l.title, description: a.summary || [l.type, l.scripture, l.place, l.date].filter(Boolean).join(" · "), alternates: { canonical: `/teachings/audio/${slug}` }, ...(/^(DEMO|TEST)/.test(a.code || "") ? { robots: { index: false, follow: false } } : {}) }; }
  const l = LECTURES.find((x) => x.slug === slug); return l ? { title: l.title } : {};
}

export function generateStaticParams() { return LECTURES.map((l) => ({ slug: l.slug })); }

export default async function LecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getAudio(slug);
  if (row?.code) redirect(`/audios/${row.code}`);
  if (row) return <RealLecture a={row} />;
  const l = LECTURES.find((x) => x.slug === slug);
  if (!l) notFound();
  // Sample lecture (before the archive is loaded): shown with the same design, without a transcription.
  return <RealLecture a={{ id: "00000000-0000-0000-0000-000000000000", kind: "lecture", type: l.type, slug: l.slug, title: l.title, date: l.date, place: l.place, country: l.country, scripture: "OTHER", verse: l.scripture, topics: l.topics, duration_sec: l.duration, audio_url: l.url, transcript_status: "none", transcript: [], language: l.languages[0] }} />;
}

