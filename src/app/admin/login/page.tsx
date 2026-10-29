import { redirect } from "next/navigation";
import { getUser, userCount } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { LoginForm } from "@/components/admin/login-form";

export default async function Login() {
  if (!hasDb()) return <main className="grid min-h-screen place-items-center bg-page p-6"><p className="max-w-md text-center text-ink-2">The database is not connected yet. Add DATABASE_URL to the site settings and reload.</p></main>;
  if (await getUser()) redirect("/admin");
  const n = await userCount();
  if (n < 0) return <main className="grid min-h-screen place-items-center bg-page p-6"><p className="max-w-md text-center text-ink-2">Cannot reach the database right now. Please try again in a moment.</p></main>;
  const first = n === 0;
  return <LoginForm first={first} />;
}
