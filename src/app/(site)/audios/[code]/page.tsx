import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql, hasDb } from "@/lib/db";
import { toLecture } from "@/lib/cms/library";
import { RealLecture } from "@/components/media/lecture-page";

/** A recording at its short address made from its date and place, e.g. /audios/19661011BBSR1. */
export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() { return []; }
async function byCode(code: string) {
  if (!hasDb()) return null;
  try { return ((await sql`select * from audios where (code = ${code} or upper(code) = upper(${code})) and status = 'published'`)[0] as any) || null; } catch { return null; }
}
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params; const a = await byCode(code); if (!a) return {};
  const l = toLecture(a);
  return { title: l.title, description: a.summary || [l.type, l.scripture, l.place, l.date].filter(Boolean).join(" · "), alternates: { canonical: `/audios/${a.code}` } };
}
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const a = await byCode(code); if (!a) notFound();
  return <RealLecture a={a} />;
}
