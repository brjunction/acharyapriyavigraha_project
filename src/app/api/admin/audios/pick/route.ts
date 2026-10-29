import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { fold } from "@/lib/content/text";
/** Small search for choosing a lecture (for quotes, videos…). */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const q = new URL(req.url).searchParams.get("q") || "";
  return json(await sql`select id, title, date, place from audios where ${q} = '' or search like ${"%" + fold(q) + "%"} order by date desc nulls last limit 20`);
}
