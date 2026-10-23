import Link from "next/link";
import { Hammer } from "lucide-react";

export default async function Soon({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "This section" } = await searchParams;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft text-gold"><Hammer size={28} strokeWidth={1.5} /></span>
      <h1 className="mt-6 font-serif text-4xl">{t}</h1>
      <p className="mt-3 text-ink-2">This page is part of the plan but isn&apos;t designed in the prototype yet. Its contents are described in the requirements document.</p>
      <Link href="/" className="mt-6 rounded-full bg-maroon px-5 py-2.5 text-sm text-paper">Back home</Link>
    </div>
  );
}
