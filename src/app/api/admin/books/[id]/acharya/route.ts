import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";
/** Which ācārya a Gauḍīya book belongs to: { acharya: slug | null }. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json().catch(() => ({}));
  const slug = typeof b.acharya === "string" && /^[a-z0-9-]{1,120}$/.test(b.acharya) ? b.acharya : null;
  if ("acharya" in b) await sql`update books set acharya = ${slug}, updated_at = now() where id = ${id}`;
  if ("subject" in b) { const sub = typeof b.subject === "string" && /^[a-z0-9-]{1,140}$/.test(b.subject) ? b.subject : null; await sql`update books set subject = ${sub}, updated_at = now() where id = ${id}`; }
  if (["book", "scripture", "songs"].includes(b.kind)) await sql`update books set kind = ${b.kind}, updated_at = now() where id = ${id}`; revalidatePath("/gaudiya", "layout"); return json({ ok: true });
}
