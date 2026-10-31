import Link from "next/link";
import { Search, Headphones, BookOpen, Network, Home } from "lucide-react";

/** A calm page for “not found” and “something went wrong”, with a search box and the main ways in. */
export function Lost({ code, title, text, action }: { code: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-white">
      <div aria-hidden className="err-float pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 select-none text-[150px] font-semibold leading-none tracking-[-0.04em] text-[#f3ead8] sm:text-[220px]">{code}</div>
      <div className="tl-fade relative mx-auto flex max-w-xl flex-col items-center px-5 pb-24 pt-28 text-center sm:pt-40">
        <div aria-hidden className="mb-5 flex w-32 items-center gap-2 text-[9px] text-[#c2621d]"><span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c2621d]/60" />◆<span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c2621d]/60" /></div>
        <h1 className="text-[26px] text-ink sm:text-[32px]">{title}</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{text}</p>
        <form action="/search" className="relative mt-7 w-full max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" /><input name="q" placeholder="Search the archive" className="h-11 w-full rounded-full border border-line-strong bg-white pl-11 pr-4 text-[14px] outline-none focus:border-ink/40" /></form>
        {action}
        <div className="mt-8 flex flex-wrap justify-center gap-2">{([["/", Home, "Home"], ["/teachings/audio", Headphones, "Lectures"], ["/teachings/books", BookOpen, "Books"], ["/tattva", Network, "Tattva"]] as const).map(([h, I, l]) => <Link key={h} href={h} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] text-ink-2 hover:border-ink hover:text-ink"><I size={14} />{l}</Link>)}</div>
      </div>
    </div>
  );
}
