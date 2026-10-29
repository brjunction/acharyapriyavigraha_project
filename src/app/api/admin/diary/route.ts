import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { revalidatePath } from "next/cache";

import { COLS, dsearch, dslug } from "@/lib/content/diary";

export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const q = new URL(req.url).searchParams.get("q");
  return json(await sql`select id, slug, date, date_note, place, title, volume, page, status, left(coalesce(translation, original, ''), 160) as preview, (scan_url is not null) as has_scan, (original is not null and original <> '') as has_original, (translation is not null and translation <> '') as has_translation from diary_entries where ${q}::text is null or search like ${"%" + fold(q || "") + "%"} order by date nulls last, position, created_at`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.import)) { let added = 0; for (const x of b.import.slice(0, 500)) { if (!x.original && !x.translation) continue; await insert(x); added++; } revalidatePath("/gurudeva/diaries"); return json({ added }); }
  if (!b.original && !b.translation) return fail("Write the entry (original or translation) first.");
  const r = await insert(b); revalidatePath("/gurudeva/diaries"); return json(r);
}
async function insert(b: any) {
  const o: any = {}; for (const k of COLS) if (k in b) o[k] = b[k] === "" ? null : b[k]; if (o.position !== undefined) o.position = Number(o.position) || 0;
  const cols = Object.keys(o); return (await sql.query(`insert into diary_entries (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(", ")}) returning id, slug`, [await dslug(o), dsearch(o), ...cols.map((k) => o[k])]))[0];
}
