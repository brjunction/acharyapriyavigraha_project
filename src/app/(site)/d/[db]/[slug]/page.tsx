import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql, hasDb } from "@/lib/db";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/cms/render";

async function get(db: string, slug: string) {
  if (!hasDb()) return null;
  try {
    const r = await sql`select r.title, r.data, r.seo, r.updated_at, d.name as dbname, d.slug as dbslug, d.fields from db_rows r join dbs d on d.id = r.db_id where d.slug = ${db} and r.slug = ${slug} and r.status='published' and d.public`;
    return r[0] as any || null;
  } catch { return null; }
}
export async function generateMetadata({ params }: { params: Promise<{ db: string; slug: string }> }): Promise<Metadata> {
  const { db, slug } = await params; const r = await get(db, slug); if (!r) return {};
  const first = Object.values(r.data || {}).find((v) => typeof v === "string" && v.length > 20) as string | undefined;
  return { title: r.seo?.title || r.title, description: r.seo?.description || first?.slice(0, 155), alternates: { canonical: `/d/${db}/${slug}` } };
}
export default async function Row({ params }: { params: Promise<{ db: string; slug: string }> }) {
  const { db, slug } = await params; const r = await get(db, slug); if (!r) notFound();
  const fields: { key: string; label: string; type: string }[] = r.fields || [];
  const ld = { "@context": "https://schema.org", "@type": "CreativeWork", name: r.title, dateModified: r.updated_at, url: `${SITE}/d/${db}/${slug}`, isPartOf: { "@type": "Collection", name: r.dbname }, publisher: { "@type": "Organization", name: "Taptajivanam" } };
  return (
    <Container className="py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="mx-auto max-w-[760px]">
        <p className="mb-2 text-[13px] text-ink-3"><Link href="/" className="hover:text-saffron">Home</Link> / {r.dbname}</p>
        <h1 className="mb-6 text-[30px] font-bold leading-tight tracking-[-0.025em] sm:text-[38px]">{r.title}</h1>
        <dl className="space-y-5">{fields.map((f) => { const v = r.data?.[f.key]; if (!v) return null; return (
          <div key={f.key}><dt className="mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-saffron">{f.label}</dt>
            <dd className="whitespace-pre-line text-[16.5px] leading-[1.8] text-ink-2">{f.type === "link" ? <a className="text-saffron underline" href={String(v)} rel="nofollow noopener">{String(v)}</a> : String(v)}</dd></div>); })}</dl>
      </article>
    </Container>
  );
}
