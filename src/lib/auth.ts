import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { sql } from "./db";

export type Role = "owner" | "admin" | "editor" | "contributor" | "viewer";
export type User = { id: string; email: string; name: string; role: Role };
const RANK: Record<Role, number> = { viewer: 1, contributor: 2, editor: 3, admin: 4, owner: 5 };
export const can = (u: User | null, min: Role) => !!u && RANK[u.role] >= RANK[min];

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `s1$${salt}$${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [v, salt, hash] = stored.split("$");
  if (v !== "s1" || !salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const COOKIE = "tj_session";

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await sql`insert into sessions (id, user_id, expires_at) values (${sha(token)}, ${userId}, ${exp.toISOString()})`;
  await sql`update users set last_login = now() where id = ${userId}`;
  const c = await cookies();
  c.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: exp });
  c.set("tj_editor", "1", { sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: exp }); // only shows the Edit button; grants nothing
}
export async function endSession() {
  const c = await cookies(); const t = c.get(COOKIE)?.value;
  if (t) await sql`delete from sessions where id = ${sha(t)}`;
  c.delete(COOKIE); c.delete("tj_editor");
}
export async function getUser(): Promise<User | null> {
  try {
    const t = (await cookies()).get(COOKIE)?.value; if (!t) return null;
    const r = await sql`select u.id, u.email, u.name, u.role from sessions s join users u on u.id = s.user_id where s.id = ${sha(t)} and s.expires_at > now() and u.active`;
    return (r[0] as User) || null;
  } catch { return null; }
}
export async function userCount() {
  try { return Number((await sql`select count(*)::int as n from users`)[0].n); } catch { return -1; }
}
