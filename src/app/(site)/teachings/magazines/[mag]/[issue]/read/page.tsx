import { notFound } from "next/navigation";
import { getIssue } from "@/lib/content/articles-public";
import { PdfReader } from "@/components/pdf/pdf-reader";

export const revalidate = 300;
type P = { params: Promise<{ mag: string; issue: string }> };
export async function generateMetadata({ params }: P) { const { mag, issue } = await params; const r = await getIssue(mag, issue); return r ? { title: `${r.issue.title || r.issue.number} (PDF) — ${r.magazine.title}`, robots: { index: false }, alternates: { canonical: `/teachings/magazines/${mag}/${issue}` } } : {}; }

/** The whole issue as its PDF, in the PDF reader (the issue page with its articles stays the main, indexed copy). */
export default async function Page({ params }: P) {
  const { mag, issue } = await params; const r = await getIssue(mag, issue); if (!r || !r.issue.pdf_url) notFound();
  const i = r.issue; const own = String(i.pdf_url).startsWith("/api/files/");
  const label = i.number && i.title ? `${i.number} · ${i.title}` : i.title || i.number || "Issue";
  return <PdfReader src={own ? i.pdf_url : `/api/magazines/pdf/${i.id}`} title={label} sub={r.magazine.title} back={{ href: `/teachings/magazines/${mag}/${issue}`, label: "Back to the issue" }} download={i.pdf_url} storeKey={`issue-${i.id}`} />;
}
