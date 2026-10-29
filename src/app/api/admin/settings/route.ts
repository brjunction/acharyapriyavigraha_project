import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const r = await sql`select key, value from settings`; return json(Object.fromEntries(r.map((x) => [x.key, x.value])));
}
export async function PUT(req: Request) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const b = await req.json();
  for (const [k, v] of Object.entries(b)) await sql`insert into settings (key, value) values (${k}, ${JSON.stringify(v)}::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()`;
  revalidatePath("/", "layout"); return json({ ok: true });
}
