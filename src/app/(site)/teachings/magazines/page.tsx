import { Newspaper, ExternalLink } from "lucide-react";
import { Container, PageHero } from "@/components/ui";
import { listMagazines } from "@/lib/content/articles-public";

export const revalidate = 300;
export const metadata = { title: "Magazines", description: "The Gopāl Jiu magazine and other magazines with Śrīla Gurudeva's teachings, linked to where they are kept." };

export default async function Page() {
  const mags = await listMagazines();
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Magazines" }]} icon={Newspaper} title="Magazines" intro="The Gopāl Jiu magazine and others. Each opens where it is kept." />
      <Container className="py-10">
        {!mags.length ? <p className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">Magazines will appear here soon.</p> :
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{mags.map((m) => (
            <div key={m.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-sm)]">
              <a href={m.url || m.issues?.[0]?.url || "#"} target="_blank" rel="noreferrer" className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-band">{m.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-ink-3"><Newspaper size={36} strokeWidth={1.2} /></div>}</div>
                <div className="p-4"><h2 className="flex items-center gap-1.5 text-[16px] font-bold group-hover:text-saffron">{m.title}<ExternalLink size={13} className="opacity-50" /></h2>{m.publisher && <p className="text-[12.5px] text-ink-3">{m.publisher}</p>}{m.description && <p className="mt-2 text-[13px] text-ink-2">{m.description}</p>}</div>
              </a>
              {m.issues?.length > 0 && <details className="group/i mt-auto border-t border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[12.5px] font-medium text-ink-2 hover:text-saffron">{m.issues.length} {m.issues.length === 1 ? "issue" : "issues"}<span className="transition group-open/i:rotate-180">▾</span></summary>
                <ul className="max-h-64 overflow-y-auto px-2 pb-3">{m.issues.map((x: any, i: number) => <li key={i}><a href={x.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band hover:text-saffron"><span className="truncate">{x.title || x.url}</span><ExternalLink size={12} className="shrink-0 opacity-50" /></a></li>)}</ul>
              </details>}
            </div>))}</div>}
      </Container>
    </>
  );
}
