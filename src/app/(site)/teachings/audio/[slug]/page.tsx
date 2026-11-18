import { notFound } from "next/navigation";
import { getAudio, toLecture } from "@/lib/cms/library";
import { RealLecture } from "@/components/media/lecture-page";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = await getAudio(slug);
  if (a) { const l = toLecture(a); return { title: l.title, description: a.summary || [l.type, l.scripture, l.place, l.date].filter(Boolean).join(" · "), alternates: { canonical: `/teachings/audio/${slug}` }, ...(/^(DEMO|TEST)/.test(a.code || "") ? { robots: { index: false, follow: false } } : {}) }; }
  return {};
}

export function generateStaticParams() { return []; }

export default async function LecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getAudio(slug);
  if (row?.code) redirect(`/audios/${row.code}`);
  if (row) return <RealLecture a={row} />;
  notFound();
}

