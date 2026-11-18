import { notFound } from "next/navigation";
import { getMagazine } from "@/lib/content/articles-public";
import { Subscribe } from "@/components/articles/subscribe";
import { IssueGrid } from "@/components/articles/issue-grid";
import { WritingsHeader } from "@/components/articles/header";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ mag: string }> }) { const r = await getMagazine((await params).mag); return r ? { title: r.magazine.title, description: r.magazine.description || `All issues of ${r.magazine.title}.` } : {}; }

/** One magazine: every issue, by year. */
export default async function Page({ params }: { params: Promise<{ mag: string }> }) {
  const r = await getMagazine((await params).mag); if (!r) notFound();
  const { magazine: m, issues } = r;
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title={m.title} intro={m.description || m.publisher || "All issues"} stats={[`${issues.length} issues`, (() => { const n = issues.reduce((k: number, i: any) => k + Number(i.n || 0), 0); return n ? `${n} articles` : ""; })()].filter(Boolean)} crumbs={[["/teachings/magazines", "Magazines"]]} />
      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        {(m.subscribe_url || m.subscribe_email) && <div className="mt-6"><Subscribe url={m.subscribe_url} email={m.subscribe_email} title={m.title} /></div>}
        {!issues.length ? <p className="py-20 text-center text-[13.5px] text-ink-3">Issues will appear here soon.</p> : <IssueGrid mag={m.slug} issues={issues} />}
      </div>
    </>
  );
}
