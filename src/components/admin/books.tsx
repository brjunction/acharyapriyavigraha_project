"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { api, toast } from "./ui";
import { PageIcon } from "../page-icon";

type P = { id: string; parent_id: string | null; title: string; path: string; status: string; type: string; icon?: string; position: number };
/** Books are pages of type “book”; their chapters are pages inside them, to any depth. */
export function BooksAdmin() {
  const [pages, setPages] = useState<P[]>([]);
  useEffect(() => { api<P[]>("/api/admin/pages").then(setPages).catch((e) => toast(e.message, true)); }, []);
  const books = pages.filter((p) => p.type === "book");
  const count = useMemo(() => (b: P) => pages.filter((p) => p.path.startsWith(b.path + "/")).length, [pages]);
  const make = async () => {
    const title = prompt("Name of the book"); if (!title) return;
    const parent = pages.find((p) => p.path === "/teachings/books");
    const r = await api<{ id: string }>("/api/admin/pages", "POST", parent ? { parent_id: parent.id, template: "book", title } : { path: `/teachings/books/${title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, template: "book", title });
    window.dispatchEvent(new Event("tj:pages-changed")); window.location.href = `/admin/pages/${r.id}`;
  };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-[28px] font-bold tracking-[-0.03em]">📚 Books</h1><p className="text-ink-3">Each book holds chapters, and chapters can hold chapters. Readers see a contents list, and next and previous buttons.</p></div>
        <button onClick={make} className="flex h-10 items-center gap-1.5 rounded-xl bg-saffron px-4 text-[14px] font-medium text-white"><Plus size={16} />New book</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => <Link key={b.id} href={`/admin/pages/${b.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#fbeedd] to-[#f2d3a6]">{b.icon ? <PageIcon icon={b.icon} size={64} /> : <BookOpen size={44} className="text-saffron/60" />}</div>
          <div className="p-4"><p className="font-semibold">{b.title}</p><p className="text-[13px] text-ink-3">{count(b)} chapters · {b.status === "published" ? "Live" : "Draft"}</p></div></Link>)}
        {!books.length && <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-3 sm:col-span-3">No books yet. Press “New book”.</p>}
      </div>
    </div>
  );
}
