import Link from "next/link";
import { listMagazines, type Mag } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { MagStack } from "@/components/articles/mag-cover";

export const revalidate = 300;
export const metadata = { title: "Magazines", description: "Śrī Kṛṣṇa Kathāmṛta Bindu and other magazines — every issue to read as it was printed." };

const span = (m: Mag) => (m.first && m.last ? (m.first === m.last ? String(m.first) : `${m.first}–${m.last}`) : null);
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

/** Magazines: one card each — open it to see all its issues. Simple to scan, also for older readers. */
export default async function Page() {
  const mags = await listMagazines();
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title="Magazines" intro="Choose a magazine to see all its issues. Every issue opens as it was printed." stats={[`${mags.length} ${mags.length === 1 ? "magazine" : "magazines"}`, `${mags.reduce((n, m) => n + m.n_issues, 0)} issues`]} />
      <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-8 sm:px-6">
        {!mags.length && <p className="py-20 text-center text-[13.5px] text-ink-3">Magazines will appear here soon.</p>}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {mags.map((m) => { const top = m.latest[0]; return (
            <div key={m.id} className="group">
              <Link href={`/teachings/magazines/${m.slug}`} className="block">
                <MagStack cover={m.cover} issues={m.latest.map((i) => i.cover)} label={m.title} className="mr-4 transition duration-300 group-hover:-translate-y-1" />
                <span className="mt-4 block text-[16px] font-semibold leading-snug text-ink group-hover:underline">{m.title}</span>
              </Link>
              <span className="mt-1 block text-[13px] text-ink-3">{[m.n_issues ? `${m.n_issues} ${m.n_issues === 1 ? "issue" : "issues"}` : null, span(m)].filter(Boolean).join(" · ")}</span>
              {top && <Link href={`/teachings/magazines/${m.slug}/${top.slug}`} className="mt-2 block text-[13px] leading-snug text-ink-2 hover:text-ink"><span className="text-ink-3">Latest: </span>{top.label}{top.date ? <span className="text-ink-3"> · {day(top.date)}</span> : null}</Link>}
            </div>); })}
        </div>
      </div>
    </>
  );
}
