import Link from "next/link";
import { nav } from "@/lib/webfolio/data";
import { SecIcon } from "@/components/webfolio/frame";
import { Download } from "lucide-react";

export const revalidate = 600;
export default async function Home() {
  const n = await nav();
  return (
    <div className="px-5 py-10 sm:px-10">
      <div className="max-w-[820px]">
        <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[36px]">WebFolio</h1>
        <p className="mt-3 max-w-[640px] text-[15.5px] leading-relaxed text-zinc-600">The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva as one book you can read, search and keep. Pick a section below, or press <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[12.5px]">Ctrl K</kbd> to search every word.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {n.map((s) => <Link key={s.key} href={`/webfolio/${s.key}`} className="group rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-300 hover:shadow-sm">
            <SecIcon s={s} size={16} />
            <h2 className="mt-4 text-[16px] font-semibold text-zinc-950">{s.title}</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">{s.desc}</p>
            <p className="mt-3 text-[12px] text-zinc-400">{s.groups.length} parts · {s.groups.reduce((a, g) => a + (g.count || 0), 0).toLocaleString()} entries</p>
          </Link>)}
          <Link href="/webfolio/download" className="group rounded-xl border border-dashed border-zinc-300 p-5 transition hover:border-zinc-400">
            <span className="flex size-[26px] items-center justify-center rounded-md bg-zinc-100 text-zinc-700"><Download size={16} /></span>
            <h2 className="mt-4 text-[16px] font-semibold text-zinc-950">Read offline</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">Install WebFolio as an app on Windows, Mac or a phone, keep all the text on your device, and download lectures to listen without internet.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
