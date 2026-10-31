import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

const txt = (c: any): string => Array.isArray(c) ? c.map((x) => (x.type === "link" ? txt(x.content) : x.text || "")).join("") : typeof c === "string" ? c : "";
type P = { h?: number; t: string };
const flat = (blocks: any[], out: P[] = []): P[] => { for (const b of blocks || []) { const t = txt(b.content).trim(); if (t) out.push(b.type === "heading" ? { h: b.props?.level || 2, t } : { t }); if (b.children?.length) flat(b.children, out); } return out; };

/** One lecture for the player: its transcription as paragraphs, and the lectures before and after it. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!hasDb()) return NextResponse.json({ text: [], prev: null, next: null });
  const a = (await sql`select id, kind, date, title, transcript from audios where slug = ${slug} and status = 'published'`.catch(() => []))[0] as any;
  if (!a) return NextResponse.json({ text: [], prev: null, next: null }, { status: 404 });
  const songs = ["kirtan", "bhajan"].includes(a.kind);
  const nb = async (dir: "prev" | "next") => {
    const op = dir === "prev" ? "<" : ">", ord = dir === "prev" ? "desc" : "asc";
    const q = `select slug, title, to_char(date, 'YYYY-MM-DD') date, place, duration_sec, audio_url, transcript_status from audios where status = 'published' and (kind in ('kirtan','bhajan')) = $1 and id <> $2 and (coalesce(date, '1900-01-01'), title) ${op} (coalesce($3::date, '1900-01-01'), $4) order by coalesce(date, '1900-01-01') ${ord}, title ${ord} limit 1`;
    try { return ((await sql.query(q, [songs, a.id, a.date, a.title])) as any[])[0] || null; } catch { return null; }
  };
  const [prev, next] = await Promise.all([nb("prev"), nb("next")]);
  return NextResponse.json({ text: flat(Array.isArray(a.transcript) ? a.transcript : []), prev, next }, { headers: { "cache-control": "public, max-age=120" } });
}
