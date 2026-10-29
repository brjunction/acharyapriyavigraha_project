import { NextResponse } from "next/server";
import { getUser, can, type Role, type User } from "./auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
/** Returns the signed-in user with at least the given role, or an error response. */
export async function guard(min: Role = "editor"): Promise<{ user: User } | { res: NextResponse }> {
  const user = await getUser();
  if (!user) return { res: fail("Please sign in again.", 401) };
  if (!can(user, min)) return { res: fail("You do not have permission to do this.", 403) };
  return { user };
}
