import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { fold } from "@/lib/content/text";

/** Public: ?slugs=a,b,c → the texts of those pages; ?q=words → matching pages with a snippet. */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams; if (!hasDb()) return NextResponse.json([]);
  const slugs = (u.get("slugs") || "").split(",").filter(Boolean).slice(0, 40);
  try {
    if (slugs.length) return NextResponse.json(await sql`select slug, translation from diary_entries where slug = any(${slugs}) and status = 'published'`, { headers: { "cache-control": "public, max-age=300" } });
    const q = fold(u.get("q") || ""); if (q.length < 2) return NextResponse.json([]);
    const rows = (await sql`select slug, to_char(date, 'YYYY-MM-DD') as date, date_note, translation from diary_entries where status = 'published' and coalesce(translation, '') <> '' and search like ${"%" + q + "%"} order by date nulls last, position limit 60`) as any[];
    return NextResponse.json(rows.map((r) => { const t = String(r.translation); const i = Math.max(0, fold(t).indexOf(q.split(" ")[0])); return { slug: r.slug, date: r.date, date_note: r.date_note, snippet: (i > 60 ? "…" : "") + t.slice(Math.max(0, i - 60), i + 140) + "…" }; }));
  } catch { return NextResponse.json([]); }
}
