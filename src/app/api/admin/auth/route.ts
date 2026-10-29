import { sql } from "@/lib/db";
import { hashPassword, verifyPassword, startSession, endSession, userCount } from "@/lib/auth";
import { json, fail } from "@/lib/api";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const act = b.action;
  if (act === "logout") { await endSession(); return json({ ok: true }); }
  const email = String(b.email || "").trim().toLowerCase(), pw = String(b.password || "");
  if (act === "setup") {
    if ((await userCount()) !== 0) return fail("An owner account already exists.", 403);
    if (!/^\S+@\S+\.\S+$/.test(email) || pw.length < 8) return fail("Enter a valid email and a password of at least 8 characters.");
    const r = await sql`insert into users (email, name, password_hash, role) values (${email}, ${String(b.name || "Owner")}, ${hashPassword(pw)}, 'owner') returning id`;
    await startSession(r[0].id as string); return json({ ok: true });
  }
  const r = await sql`select id, password_hash, active from users where email = ${email}`;
  await new Promise((r) => setTimeout(r, 350));
  if (!r[0] || !r[0].active || !verifyPassword(pw, r[0].password_hash as string)) return fail("That email or password is not right.", 401);
  await startSession(r[0].id as string); return json({ ok: true });
}
