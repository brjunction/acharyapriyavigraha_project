import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
/** Many books at once: { op: "publish" | "hide", ids: [...] } or { op, library: "gaudiya" | "main", drafts: true } (every draft of that library). */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json().catch(() => ({}));
  const status = b.op === "publish" ? "published" : b.op === "hide" ? "draft" : null; if (!status) return fail("Unknown action.");
  const r = Array.isArray(b.ids) && b.ids.length ? await sql`update books set status = ${status}, updated_at = now() where id = any(${b.ids}::uuid[]) returning id`
    : b.library ? await sql`update books set status = ${status}, updated_at = now() where library = ${b.library} and status <> ${status} returning id` : [];
  revalidatePath("/", "layout"); return json({ ok: true, n: r.length });
}
