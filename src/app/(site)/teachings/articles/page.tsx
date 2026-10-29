import Link from "next/link";
import { FileText, UserRound, Layers, FolderOpen, Search, X } from "lucide-react";
import { Container, PageHero } from "@/components/ui";
import { listArticles } from "@/lib/content/articles-public";

export const dynamic = "force-dynamic";
export const metadata = { title: "Articles", description: "Essays and write-ups on the life and teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, by author and series." };
type SP = { author?: string; series?: string; section?: string; q?: string };
const href = (sp: SP, k: keyof SP, v?: string) => { const n = { ...sp, [k]: sp[k] === v ? undefined : v }; const u = new URLSearchParams(Object.entries(n).filter(([, x]) => x) as [string, string][]).toString(); return `/teachings/articles${u ? `?${u}` : ""}`; };
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams; const data = await listArticles(sp);
  const crumbs = [{ href: "/teachings", label: "His Teachings" }, { label: "Articles" }];
  const Facet = ({ k, title, icon: I, items }: { k: keyof SP; title: string; icon: any; items: { name: string; n: number }[] }) => !items.length ? null : (
    <div><p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3"><I size={13} />{title}</p>
      <ul className="space-y-0.5">{items.map((x) => <li key={x.name}><Link href={href(sp, k, x.name)} scroll={false} className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition ${sp[k] === x.name ? "bg-saffron text-white" : "text-ink-2 hover:bg-band"}`}><span className="truncate">{x.name}</span><span className="text-[11px] tabular opacity-70">{x.n}</span></Link></li>)}</ul></div>);
  const active = (["author", "series", "section", "q"] as const).filter((k) => sp[k]);
  return (
    <>
      <PageHero crumbs={crumbs} icon={FileText} title="Articles" intro="Essays and write-ups on Śrīla Gurudeva's life and teachings. Browse by author, series or section." />
      <Container className="py-10">
        {!data || (!data.rows.length && !active.length) ? <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">Articles will appear here soon.</p> : (
          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <form action="/teachings/articles" className="relative"><Search size={14} className="absolute left-3 top-2.5 text-ink-3" />{(["author", "series", "section"] as const).map((k) => sp[k] && <input key={k} type="hidden" name={k} value={sp[k]} />)}<input name="q" defaultValue={sp.q || ""} placeholder="Search articles" className="h-9 w-full rounded-full border border-line bg-surface pl-8 pr-3 text-[13px] outline-none focus:border-saffron" /></form>
              <Facet k="series" title="Series" icon={Layers} items={data.series} />
              <Facet k="author" title="Authors" icon={UserRound} items={data.authors} />
              <Facet k="section" title="Sections" icon={FolderOpen} items={data.sections} />
            </aside>
            <div>
              {active.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-2 text-[12.5px]">{active.map((k) => <Link key={k} href={href(sp, k, sp[k])} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 hover:border-saffron">{k === "q" ? `“${sp.q}”` : sp[k]}<X size={12} /></Link>)}<Link href="/teachings/articles" className="text-ink-3 hover:text-saffron">Clear</Link></div>}
              {sp.series && <h2 className="mb-4 text-[19px] font-bold">{sp.series} <span className="text-[13px] font-normal text-ink-3">· {data.rows.length} parts</span></h2>}
              {!data.rows.length ? <p className="py-10 text-center text-ink-3">No article matches.</p> :
                <div className="divide-y divide-line">{data.rows.map((a) => (
                  <Link key={a.slug} href={`/teachings/articles/${a.slug}`} className="group flex gap-4 py-4">
                    {a.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.cover} alt="" className="hidden h-20 w-32 shrink-0 rounded-lg object-cover sm:block" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] uppercase tracking-[0.1em] text-ink-3">{[a.section, a.series && `${a.series}${a.series_part ? ` · Part ${a.series_part}` : ""}`].filter(Boolean).join(" · ")}</p>
                      <h3 className="mt-0.5 text-[16.5px] font-bold leading-snug text-ink transition group-hover:text-saffron">{a.title}</h3>
                      {a.subtitle && <p className="text-[13.5px] text-ink-2">{a.subtitle}</p>}
                      {a.summary && <p className="mt-1 line-clamp-2 text-[13px] text-ink-3">{a.summary}</p>}
                      <p className="mt-1.5 text-[12px] text-ink-3">{[a.author, day(a.date)].filter(Boolean).join(" · ")}</p>
                    </div>
                  </Link>))}</div>}
            </div>
          </div>)}
      </Container>
    </>
  );
}
