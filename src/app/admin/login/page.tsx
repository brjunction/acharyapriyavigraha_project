import Link from "next/link";
import { Lock } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper-2 via-paper to-gold-soft px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 shadow-xl">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-maroon font-serif text-xl text-paper">त</span>
          <h1 className="mt-4 font-serif text-2xl">Taptajīvanam admin</h1>
          <p className="mt-1 text-sm text-ink-3">Sign in with the user ID and password your admin gave you</p>
        </div>
        <form className="mt-6 space-y-4">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">User ID</span><input className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-gold" placeholder="e.g. madhavananda" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Password</span><input type="password" className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-gold" /></label>
          <Link href="/admin" className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-maroon text-sm font-medium text-paper"><Lock size={15} />Sign in</Link>
          <p className="text-center text-xs text-ink-3">Forgot your password? Ask your admin, or reset it by email.</p>
        </form>
      </div>
    </div>
  );
}
