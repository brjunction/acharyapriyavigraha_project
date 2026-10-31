import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { isProtected } from "@/lib/protected";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const target = (await sql`select role, email from users where id = ${id}`)[0]; if (!target) return fail("Not found", 404);
  if (isProtected(target.email)) { if (!isProtected(g.user.email)) return fail("Not found", 404); if (b.role || b.active === false) return fail("This account always stays an owner and active.", 403); }
  if ((target.role === "owner" || b.role === "owner") && g.user.role !== "owner") return fail("Only an owner can change an owner.", 403);
  if (b.password) { if (String(b.password).length < 8) return fail("Password needs at least 8 characters."); await sql`update users set password_hash = ${hashPassword(b.password)} where id = ${id}`; await sql`delete from sessions where user_id = ${id}`; }
  if (b.role || b.active !== undefined || b.name !== undefined) await sql`update users set role = coalesce(${b.role ?? null}, role), active = coalesce(${b.active ?? null}, active), name = coalesce(${b.name ?? null}, name) where id = ${id}`;
  return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; if (id === g.user.id) return fail("You cannot delete your own account.");
  const t = (await sql`select email, role from users where id = ${id}`)[0]; if (!t || isProtected(t.email)) return fail("Not found", 404); if (t.role === "owner" && g.user.role !== "owner") return fail("Only an owner can remove an owner.", 403); await sql`delete from users where id = ${id}`; return json({ ok: true });
}
