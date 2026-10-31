import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";

/** Every issue of every magazine, for choosing where an article was published. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select i.id, i.magazine_id, m.title as magazine, coalesce(i.title, i.number) as label, i.number, to_char(i.date, 'YYYY-MM-DD') as date from magazine_issues i join magazines m on m.id = i.magazine_id order by m.position, m.title, i.date desc nulls last, i.position desc`);
}
