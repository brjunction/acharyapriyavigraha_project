import { sql, hasDb } from "@/lib/db";
import { NextResponse } from "next/server";

/** A visitor sends a suggestion about a transcription, or more information about a recording. Kept for the Studio to review. */
export async function POST(req: Request) {
  if (!hasDb()) return NextResponse.json({ error: "Not available." }, { status: 503 });
  let b: any = {}; try { b = await req.json(); } catch {}
  if (b.website) return NextResponse.json({ ok: true }); // a hidden field only robots fill in
  const text = String(b.text || "").trim().slice(0, 5000); if (text.length < 3) return NextResponse.json({ error: "Please write your suggestion." }, { status: 400 });
  const about = ["transcript", "info", "other"].includes(b.about) ? b.about : "other";
  const a = b.slug ? ((await sql`select id, slug, title from audios where slug = ${String(b.slug)}`.catch(() => []))[0] as any) : null;
  const recent = ((await sql`select count(*)::int as n from suggestions where created_at > now() - interval '5 minutes' and coalesce(email, '') = ${String(b.email || "")} and coalesce(item_slug, '') = ${String(b.slug || "")}`)[0] as any).n;
  if (recent > 40) return NextResponse.json({ error: "Thank you — we have your suggestions. Please wait a little before sending more." }, { status: 429 });
  await sql`insert into suggestions (item_kind, item_id, item_slug, item_title, about, quote, text, name, email) values ('audio', ${a?.id || null}, ${a?.slug || b.slug || null}, ${a?.title || null}, ${about}, ${String(b.quote || "").trim().slice(0, 2000) || null}, ${text}, ${String(b.name || "").trim().slice(0, 120) || null}, ${String(b.email || "").trim().slice(0, 200) || null})`;
  return NextResponse.json({ ok: true });
}
