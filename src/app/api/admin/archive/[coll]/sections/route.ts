import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { COLLECTIONS } from "@/lib/archive/config";
import { slugify } from "@/lib/content/text";

type C = { params: Promise<{ coll: string }> };
/** Replace the list of sections: [{ key?, title, description }] in order. Items of a removed section move to `moveTo`. */
export async function POST(req: Request, { params }: C) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { coll } = await params; if (!COLLECTIONS[coll]) return fail("Unknown section", 404);
  const b = await req.json(); const list: { key?: string; title: string; description?: string }[] = (b.sections || []).filter((s: any) => String(s.title || "").trim());
  const keys: string[] = [];
  for (const [i, s] of list.entries()) {
    let key = s.key || slugify(s.title); while (!s.key && keys.includes(key)) key += "-2"; keys.push(key);
    await sql`insert into archive_sections (collection, key, title, description, position) values (${coll}, ${key}, ${s.title.trim()}, ${s.description || null}, ${i}) on conflict (collection, key) do update set title = excluded.title, description = excluded.description, position = excluded.position`;
  }
  const gone = (await sql`select key from archive_sections where collection = ${coll} and not (key = any(${keys}))`).map((r: any) => r.key);
  if (gone.length) { await sql`update archive_items set section = ${b.moveTo || keys[0] || null} where collection = ${coll} and section = any(${gone})`; await sql`delete from archive_sections where collection = ${coll} and key = any(${gone})`; }
  revalidatePath(COLLECTIONS[coll].base, "layout"); return json({ ok: true });
}
