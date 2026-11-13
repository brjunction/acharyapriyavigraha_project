import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { listMagazines, type Mag } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { MagCover } from "@/components/articles/mag-cover";

export const revalidate = 300;
export const metadata = { title: "Magazines", description: "Śrī Kṛṣṇa Kathāmṛta Bindu and the other publications of Gopal Jiu, and more magazines — every issue with its articles, and the whole issue as PDF." };

const isGJ = (m: Mag) => /gop[aā]l\s*j[iī]u/i.test(`${m.publisher || ""} ${m.title}`);
const isBindu = (m: Mag) => /bindu|kath[aā]m[rṛ]i?ta/i.test(m.title);
const span = (m: Mag) => (m.first && m.last ? (m.first === m.last ? String(m.first) : `${m.first}–${m.last}`) : null);
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

/** Magazines: Gopal Jiu Publications first, with Śrī Kṛṣṇa Kathāmṛta Bindu given its own large place; then the rest. */
export default async function Page() {
  const mags = await listMagazines();
  const gj = mags.filter(isGJ); const bindu = gj.filter(isBindu); const gjOther = gj.filter((m) => !isBindu(m)); const rest = mags.filter((m) => !isGJ(m));
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title="Magazines" intro="Every issue with its articles to read here — and the whole issue as PDF." stats={[`${mags.length} magazines`, `${mags.reduce((n, m) => n + m.n_issues, 0)} issues`]} />
      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        {!mags.length && <p className="py-20 text-center text-[13.5px] text-ink-3">Magazines will appear here soon.</p>}

        {gj.length > 0 && <section className="mt-6 overflow-hidden rounded-3xl bg-[#f6efe3] ring-1 ring-[#e7dac4]">
          <div className="px-6 pb-2 pt-7 sm:px-10">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-saffron">Gopal Jiu Publications</p>
            <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.01em] text-ink sm:text-[28px]">The magazines of Gopal Jiu</h2>
            <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">Hari-kathā from Śrīla Gurudeva and the ācāryas, published by Gopal Jiu Publications.</p>
          </div>

          {bindu.map((m) => { const top = m.latest[0]; return (
            <div key={m.id} className="grid gap-8 px-6 py-8 sm:px-10 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
              <Link href={top ? `/teachings/magazines/${m.slug}/${top.slug}` : `/teachings/magazines/${m.slug}`} className="group mx-auto w-[220px] md:w-full">
                <MagCover src={top?.cover || m.cover} label={top?.label || m.title} className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-24px_rgba(60,30,10,.6)]" />
              </Link>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-ink-3">{[m.n_issues ? `${m.n_issues} issues` : null, span(m), "Fortnightly"].filter(Boolean).join(" · ")}</p>
                <Link href={`/teachings/magazines/${m.slug}`} className="mt-1 block text-[26px] font-semibold leading-tight text-ink hover:underline sm:text-[30px]">{m.title}</Link>
                {m.description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{m.description}</p>}
                {top && <div className="mt-5 rounded-2xl bg-white/70 p-4 ring-1 ring-[#eadfcc]">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Latest issue{top.date ? ` · ${day(top.date)}` : ""}</p>
                  <p className="mt-1 text-[17px] font-medium text-ink">{top.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/teachings/magazines/${m.slug}/${top.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-4 text-[13px] font-medium text-white hover:bg-ink/90">Read this issue<ArrowRight size={14} /></Link>
                    
                  </div>
                </div>}
                {m.latest.length > 1 && <>
                  <p className="mb-3 mt-7 text-[12px] font-medium text-ink-3">Recent issues</p>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">{m.latest.slice(1, 6).map((i) => <Link key={i.slug} href={`/teachings/magazines/${m.slug}/${i.slug}`} className="group"><MagCover src={i.cover} label={i.label} className="transition group-hover:-translate-y-0.5" /><span className="mt-1.5 line-clamp-2 block text-[12px] leading-snug text-ink-2 group-hover:text-ink">{i.label}</span></Link>)}</div>
                </>}
                <Link href={`/teachings/magazines/${m.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink hover:underline">All {m.n_issues} issues<ArrowRight size={14} /></Link>
              </div>
            </div>); })}

          {gjOther.length > 0 && <div className="grid gap-4 border-t border-[#e7dac4] px-6 py-7 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
            {gjOther.map((m) => <Link key={m.id} href={`/teachings/magazines/${m.slug}`} className="group flex gap-4 rounded-2xl bg-white/70 p-3 ring-1 ring-[#eadfcc] transition hover:bg-white">
              <MagCover src={m.latest[0]?.cover || m.cover} label={m.title} className="w-[76px] shrink-0" />
              <span className="min-w-0 py-1"><span className="block text-[16px] font-medium leading-snug text-ink group-hover:underline">{m.title}</span><span className="mt-1 block text-[12.5px] text-ink-3">{[m.n_issues ? `${m.n_issues} issues` : null, span(m)].filter(Boolean).join(" · ")}</span>{m.description && <span className="mt-1.5 line-clamp-2 block text-[13px] text-ink-2">{m.description}</span>}</span>
            </Link>)}
          </div>}
        </section>}

        {rest.length > 0 && gj.length > 0 && <h2 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-3">Other magazines</h2>}
        {rest.map((m) => (
          <section key={m.id} className="grid gap-8 border-b border-line py-10 last:border-0 md:grid-cols-[200px_minmax(0,1fr)]">
            <Link href={`/teachings/magazines/${m.slug}`} className="mx-auto w-[150px] md:w-full"><MagCover src={m.cover || m.latest[0]?.cover} label={m.title} /></Link>
            <div className="min-w-0">
              <Link href={`/teachings/magazines/${m.slug}`} className="text-[22px] text-ink hover:underline">{m.title}</Link>
              <p className="mt-1 text-[12.5px] text-ink-3">{[m.publisher, m.n_issues ? `${m.n_issues} issues` : null, span(m)].filter(Boolean).join(" · ")}</p>
              {m.description && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">{m.description}</p>}
              {m.latest.length > 0 && <>
                <p className="mb-3 mt-6 text-[12px] font-medium text-ink-3">Latest issues</p>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">{m.latest.map((i) => <Link key={i.slug} href={`/teachings/magazines/${m.slug}/${i.slug}`} className="group"><MagCover src={i.cover} label={i.label} className="transition group-hover:-translate-y-0.5" /><span className="mt-1.5 line-clamp-2 block text-[12px] leading-snug text-ink-2 group-hover:text-ink">{i.label}</span></Link>)}</div>
              </>}
              <div className="mt-5 flex flex-wrap gap-2"><Link href={`/teachings/magazines/${m.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-4 text-[13px] font-medium text-white hover:bg-ink/90">All issues<ArrowRight size={14} /></Link>{m.url && <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-md border border-line px-4 text-[13px] text-ink hover:bg-band">Website</a>}</div>
            </div>
          </section>))}
      </div>
    </>
  );
}
