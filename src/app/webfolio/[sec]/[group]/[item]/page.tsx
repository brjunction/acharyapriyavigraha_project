import { notFound } from "next/navigation";
import { nav, itemPage, neighbours } from "@/lib/webfolio/data";
import { FolioArticle, Plain, Doc } from "@/components/webfolio/article";
import { SaveAudio } from "@/components/webfolio/offline";

export const revalidate = 600;
export async function generateMetadata({ params }: { params: Promise<{ sec: string; group: string; item: string }> }) { const { sec, group, item } = await params; const p = await itemPage(sec, group, item); return p ? { title: p.title, description: p.sub } : {}; }
/** One lecture with its transcription, one video, or one chapter. */
export default async function ItemPage({ params }: { params: Promise<{ sec: string; group: string; item: string }> }) {
  const { sec, group, item } = await params;
  const [n, p, nb] = await Promise.all([nav(), itemPage(sec, group, item), neighbours(sec, group, item)]); const s = n.find((x) => x.key === sec); if (!s || !p) notFound();
  return (
    <FolioArticle crumbs={[{ href: "/webfolio", label: "WebFolio" }, { href: `/webfolio/${sec}`, label: s.title }, { href: `/webfolio/${sec}/${group}`, label: nb.group.replace(`${s.title} · `, "") }]} title={p.title} sub={p.sub} prev={nb.prev} next={nb.next} source={p.href}>
      {p.audio && <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 p-3"><audio controls preload="none" src={p.audio} className="h-9 min-w-0 flex-1" /><SaveAudio url={p.audio} title={p.title} /></div>}
      {p.youtube && <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${p.youtube}`} title={p.title} className="h-full w-full" allowFullScreen /></div>}
      {p.facts && p.facts.length > 0 && <dl className="mb-8 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px]">{p.facts.map(([k, v]) => <div key={k}><dt className="inline text-zinc-500">{k}: </dt><dd className="inline text-zinc-800">{v}</dd></div>)}</dl>}
      {p.text && <div className="mb-8"><Plain text={p.text} /></div>}
      {p.doc && p.doc.length > 0 ? <Doc doc={p.doc} /> : !p.text && sec !== "videos" && <p className="text-[14px] text-zinc-500">The text of this is being prepared.</p>}
    </FolioArticle>
  );
}
