import Link from "next/link";

/** A page inside the WebFolio that does not exist (moved, renamed or not yet written). Keeps the WebFolio frame. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#853500]">Not in the WebFolio</p>
      <h1 className="mt-3 text-[26px] font-semibold leading-tight text-zinc-900">This page is not here</h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-zinc-600">It may have moved, or it is still being prepared. Search every word of the WebFolio, or go back to its contents.</p>
      <form action="/webfolio/search" className="mx-auto mt-7 flex max-w-[420px] gap-2">
        <input name="q" placeholder="Search the WebFolio" className="h-11 min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-4 text-[14px] outline-none focus:border-[#853500]" />
        <button className="h-11 rounded-full bg-[#853500] px-5 text-[14px] font-medium text-white hover:bg-[#6e2c00]">Search</button>
      </form>
      <Link href="/webfolio" className="mt-5 inline-block text-[13.5px] text-[#853500] hover:underline">← Contents</Link>
    </div>
  );
}
