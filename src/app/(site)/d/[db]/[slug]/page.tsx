import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql, hasDb } from "@/lib/db";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/cms/render";
import { Render } from "@/components/cms/doc";
import { ytId } from "@/components/cms/blocks-view";
import { COLORS, opts } from "@/lib/cms/colors";

async function get(db: string, slug: string) {
  if (!hasDb()) return null;
  try {
    const r = await sql`select r.title, r.data, r.seo, r.blocks, r.updated_at, d.name as dbname, d.slug as dbslug, d.fields from db_rows r join dbs d on d.id = r.db_id where d.slug = ${db} and r.slug = ${slug} and r.status='published' and d.public`;
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
        <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-line bg-[#fdfaf4] p-5 sm:grid-cols-[180px_minmax(0,1fr)]">{fields.map((f) => { const v = r.data?.[f.key]; if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return null; const t = ({ short: "text", link: "url", image: "file" } as any)[f.type] || f.type; return (
          <div key={f.key} className="contents"><dt className="text-[13px] font-semibold text-ink-3">{f.label}</dt>
            <dd className="min-w-0 text-[15.5px] leading-relaxed text-ink-2">{t === "select" || t === "multi" ? <span className="flex flex-wrap gap-1.5">{(Array.isArray(v) ? v : [v]).map((n: string) => { const o = opts((f as any).options).find((x) => x.name === n) || { name: n, color: "gray" }; return <span key={n} className="rounded px-2 py-0.5 text-[13px]" style={{ background: COLORS[o.color]?.bg, color: COLORS[o.color]?.text }}>{n}</span>; })}</span>
              : t === "audio" ? <audio src={String(v)} controls preload="none" className="w-full" />
              : t === "video" ? (ytId(String(v)) ? <div className="aspect-video overflow-hidden rounded-xl"><iframe src={`https://www.youtube-nocookie.com/embed/${ytId(String(v))}`} className="h-full w-full" title={r.title} allowFullScreen /></div> : <video src={String(v)} controls className="w-full rounded-xl" />)
              : t === "file" ? (/\.(png|jpe?g|webp|gif|svg|avif)$|\/api\/media\//i.test(v) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={String(v)} alt={r.title} className="max-h-[360px] rounded-xl" /> : <a href={String(v)} className="text-saffron underline">Download</a>)
              : t === "url" ? <a className="break-all text-saffron underline" href={String(v)} rel="nofollow noopener">{String(v)}</a>
              : t === "checkbox" ? (v ? "Yes" : "No") : t === "date" ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
              : t === "relation" ? null : <span className="whitespace-pre-line">{String(v)}</span>}</dd></div>); })}</dl>
        {Array.isArray(r.blocks) && r.blocks.length > 0 && <div className="mt-8"><Render doc={r.blocks} /></div>}
      </article>
    </Container>
  );
}
