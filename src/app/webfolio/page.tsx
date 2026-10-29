import type { Metadata } from "next";
import Link from "next/link";
import { sections, content } from "@/lib/folio";
import { Render } from "@/components/cms/doc";
import { FolioShell } from "@/components/folio/shell";
import { LectureCard } from "@/components/cms/lecture-card";
import { toLecture } from "@/lib/cms/library";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "WebFolio — the whole archive in one place", description: "Every lecture, transcription, book and compilation of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in one searchable document." };
export const dynamic = "force-dynamic";

export default async function WebFolio({ searchParams }: { searchParams: Promise<{ n?: string; hl?: string }> }) {
  const { n } = await searchParams; const secs = await sections();
  const c = n ? await content(n) : null;
  let lecture = null as any;
  if (c?.kind === "audio") { const r = (await sql`select * from audios where slug = ${c.data.slug}`.catch(() => []))[0]; if (r) lecture = toLecture(r as any); }
  return (
    <FolioShell sections={secs.map((s) => ({ id: `sec:${s.source}`, title: s.title }))} current={n || ""}>
      {!c ? (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-[#853500]">WebFolio</p>
          <h1 className="mt-3 text-[31.5px] font-semibold tracking-tight text-zinc-950">The whole archive, as one book</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-zinc-600">Open any part from the contents on the left. Press <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[12.5px]">F2</kbd> to search every word; diacritics are not needed.</p>
          <div className="mt-8 grid gap-2 text-left sm:grid-cols-2">{secs.map((s) => <Link key={s.source} href={`/webfolio?n=sec:${s.source}`} className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50"><p className="font-medium text-zinc-900">{s.title}</p></Link>)}</div>
        </div>
      ) : (
        <article className="folio-doc site-canvas mx-auto max-w-[780px] pb-24">
          {c.sub && <p className="text-[12.5px] font-medium text-zinc-500">{c.sub}</p>}
          <h1 className="mt-1 text-[27.5px] font-semibold leading-tight tracking-tight text-zinc-950 sm:text-[31.5px]">{c.title}</h1>
          {lecture && <LectureCard l={lecture} />}
          {c.data?.summary && <p className="mt-3 text-[14.5px] italic text-zinc-600">{c.data.summary}</p>}
          {c.data?.description && <p className="mt-3 whitespace-pre-line text-[14.5px] text-zinc-600">{c.data.description}</p>}
          {c.kind === "video" && c.data?.youtube_id && <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${c.data.youtube_id}`} title={c.title} allowFullScreen className="h-full w-full" /></div>}
          {c.kind === "excerpt" && <div className="mt-6 space-y-4 text-[15.5px] leading-[1.8] text-zinc-800">{c.data.original && <p className="whitespace-pre-line text-center text-[#7a3a06]">{c.data.original}</p>}{c.data.transliteration && <p className="whitespace-pre-line text-center italic">{c.data.transliteration}</p>}{c.data.translation && <p className="font-medium">{c.data.translation}</p>}{c.data.text && <p className="whitespace-pre-line">{c.data.text}</p>}</div>}
          {c.blocks && c.blocks.length > 0 && <div className="mt-6"><Render doc={c.blocks} /></div>}
          {c.kind === "audio" && !c.blocks?.length && <p className="mt-6 text-zinc-500">The transcription of this lecture is being prepared.</p>}
          {c.items?.map((it) => (
            <section key={it.id} id={it.id} className="mt-10 border-t border-zinc-200 pt-8">
              <Link href={`/webfolio?n=${encodeURIComponent(it.id)}`} className="text-[18.5px] font-semibold tracking-tight text-zinc-950 hover:text-[#853500]">{it.title}</Link>
              {it.sub && <p className="text-[12.5px] text-zinc-500">{it.sub}</p>}
              {it.text && <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.8] text-zinc-800">{it.text}</p>}
              {it.blocks && it.blocks.length > 0 && <div className="mt-3"><Render doc={it.blocks} /></div>}
            </section>))}
          {c.kind === "page" && c.data?.path && <p className="mt-10 text-[12.5px] text-zinc-500">Also on the website: <Link href={c.data.path} className="underline">{c.data.path}</Link></p>}
        </article>
      )}
    </FolioShell>
  );
}
