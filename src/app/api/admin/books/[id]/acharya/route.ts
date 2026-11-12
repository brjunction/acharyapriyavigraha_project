import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";
/** Which ācārya a Gauḍīya book belongs to: { acharya: slug | null }. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json().catch(() => ({}));
  const slug = typeof b.acharya === "string" && /^[a-z0-9-]{1,120}$/.test(b.acharya) ? b.acharya : null;
  await sql`update books set acharya = ${slug}, updated_at = now() where id = ${id}`; revalidatePath("/gaudiya", "layout"); return json({ ok: true });
}
