import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { Node } from "@/lib/content/books";
import { hrefOf, numbering } from "@/lib/content/books-public";

export function BookToc({ book, nodes, current, compact = false }: { book: any; nodes: Node[]; current?: string; compact?: boolean }) {
  const num = numbering(nodes); const kids = (p: string | null) => nodes.filter((n) => n.parent_id === p).sort((a, b) => a.position - b.position);
  const list = (p: string | null, d: number): React.ReactNode => { const k = kids(p); return k.length ? <ol className={d ? "ml-3 border-l border-line pl-3" : "space-y-0.5"}>{k.map((n) => <li key={n.id}>
    <Link href={hrefOf(book.slug, nodes, n)} className={`flex gap-2 rounded-lg px-2 py-1.5 leading-snug ${n.id === current ? "bg-saffron-soft font-semibold text-saffron" : n.kind === "part" ? "font-semibold text-ink hover:bg-band" : "text-ink-2 hover:bg-band"} ${compact ? "text-[13.5px]" : "text-[15px]"}`}>
      {n.kind !== "part" && <span className="w-7 shrink-0 text-right text-[12px] tabular-nums text-ink-3">{num[n.id]}</span>}<span>{n.title}</span></Link>{list(n.id, d + 1)}</li>)}</ol> : null; };
  return <nav aria-label="Contents">{list(null, 0)}</nav>;
}

export function PrevNext({ book, nodes, flat, current }: { book: any; nodes: Node[]; flat: Node[]; current: string }) {
  const i = flat.findIndex((n) => n.id === current); const prev = flat[i - 1], next = flat[i + 1];
  return (
    <nav className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
      {prev ? <Link href={hrefOf(book.slug, nodes, prev)} className="card group flex items-center gap-3 p-4"><ChevronLeft className="text-saffron" size={18} /><span><span className="block text-[12px] text-ink-3">Previous</span><span className="font-medium group-hover:text-saffron">{prev.title}</span></span></Link> : <Link href={`/books/${book.slug}`} className="card flex items-center gap-3 p-4"><BookOpen className="text-saffron" size={18} /><span className="font-medium">Contents</span></Link>}
      {next && <Link href={hrefOf(book.slug, nodes, next)} className="card group flex items-center justify-end gap-3 p-4 text-right"><span><span className="block text-[12px] text-ink-3">Next</span><span className="font-medium group-hover:text-saffron">{next.title}</span></span><ChevronRight className="text-saffron" size={18} /></Link>}
    </nav>
  );
}

export function Cover({ book, className = "" }: { book: any; className?: string }) {
  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-[4px_14px_14px_4px] border border-[#e6cfa6] bg-gradient-to-br from-[#8a3a06] to-[#4a1a04] shadow-[6px_8px_0_-2px_#e8d6b8,0_24px_40px_-20px_rgba(40,20,5,.6)] ${className}`}>
      {book.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-[#f3d9a4]"><span className="h-px w-16 bg-[#f3d9a4]/60" />{book.icon && <span className="text-[38px]">{book.icon}</span>}<span className="text-[19px] font-bold leading-snug">{book.title}</span><span className="h-px w-16 bg-[#f3d9a4]/60" /></div>}
      <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
    </div>
  );
}
