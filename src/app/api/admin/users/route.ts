import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { PROTECTED_EMAIL, isProtected } from "@/lib/protected";

export async function GET() {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const me = isProtected(g.user.email);
  return json(await sql`select id, email, name, role, active, created_at, last_login from users where ${me} or lower(email) <> ${PROTECTED_EMAIL} order by created_at`);
}
export async function POST(req: Request) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const b = await req.json(); const email = String(b.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || String(b.password || "").length < 8) return fail("Enter an email and a password of at least 8 characters.");
  if (b.role === "owner" && g.user.role !== "owner") return fail("Only an owner can add another owner.", 403);
  if ((await sql`select 1 from users where email = ${email}`).length) return fail("That email already has an account.");
  const r = await sql`insert into users (email, name, password_hash, role) values (${email}, ${b.name || ""}, ${hashPassword(b.password)}, ${b.role || "editor"}) returning id`; return json(r[0]);
}
