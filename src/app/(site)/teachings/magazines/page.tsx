import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listMagazines } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { MagCover } from "@/components/articles/mag-cover";

export const revalidate = 300;
export const metadata = { title: "Magazines", description: "Kṛṣṇa-kathāmṛta, the Gopāl Jiu magazine and other magazines — every issue with its articles, to read online." };

export default async function Page() {
  const mags = await listMagazines();
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title="Magazines" intro="Every issue, with its contents — read the articles here, or open the whole issue." stats={[`${mags.length} magazines`, `${mags.reduce((n, m) => n + m.n_issues, 0)} issues`]} />
      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        {!mags.length && <p className="py-20 text-center text-[13.5px] text-ink-3">Magazines will appear here soon.</p>}
        {mags.map((m) => (
          <section key={m.id} className="grid gap-8 border-b border-line py-10 last:border-0 md:grid-cols-[200px_minmax(0,1fr)]">
            <Link href={`/teachings/magazines/${m.slug}`} className="mx-auto w-[150px] md:w-full"><MagCover src={m.cover || m.latest[0]?.cover} label={m.title} /></Link>
            <div className="min-w-0">
              <Link href={`/teachings/magazines/${m.slug}`} className="text-[22px] text-ink hover:underline">{m.title}</Link>
              <p className="mt-1 text-[12.5px] text-ink-3">{[m.publisher, m.n_issues ? `${m.n_issues} issues` : null, m.first && m.last ? (m.first === m.last ? String(m.first) : `${m.first}–${m.last}`) : null].filter(Boolean).join(" · ")}</p>
              {m.description && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">{m.description}</p>}
              {m.latest.length > 0 && <>
                <p className="mb-3 mt-6 text-[12px] font-medium text-ink-3">Latest issues</p>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">{m.latest.map((i) => <Link key={i.slug} href={`/teachings/magazines/${m.slug}/${i.slug}`} className="group"><MagCover src={i.cover} label={i.label} className="transition group-hover:-translate-y-0.5" /><span className="mt-1.5 block truncate text-[12px] text-ink-2 group-hover:underline">{i.label}</span></Link>)}</div>
              </>}
              <div className="mt-5 flex flex-wrap gap-2"><Link href={`/teachings/magazines/${m.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-4 text-[13px] font-medium text-white hover:bg-ink/90">All issues<ArrowRight size={14} /></Link>{m.url && <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-md border border-line px-4 text-[13px] text-ink-2 hover:bg-band">Magazine website</a>}</div>
            </div>
          </section>))}
      </div>
    </>
  );
}
