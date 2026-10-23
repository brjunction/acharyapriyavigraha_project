"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const [q, setQ] = useState("");
  const r = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); r.push(`/search?q=${encodeURIComponent(q)}`); }}
      className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-lg focus-within:border-gold">
      <Search size={20} className="ml-3 text-ink-3" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 1,595 lectures, quotes, books, verses…"
        className="h-11 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-3" />
      <button className="rounded-xl bg-saffron px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">Search</button>
    </form>
  );
}
