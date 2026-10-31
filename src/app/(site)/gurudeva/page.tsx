import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cmsOverride } from "@/lib/cms/render";
import { sql, hasDb } from "@/lib/db";
import { GURUDEVA_TABS } from "@/components/gurudeva/tabs";

export const metadata = { title: "Śrīla Gurudeva", description: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva — his life, his diary to Śrī Gopāl Jiu, memories, glorifications, letters, photographs, places, lineage, disciples and projects." };
export const revalidate = 300;

const ABOUT: Record<string, [string, string]> = {
  "/gurudeva/who-is-srila-gurudeva": ["His life, and the books about him", ""], "/gurudeva/radha-gopal-jiu": ["Śrī Gopāl Jiu of Gaḍeigiri", ""], "/gurudeva/timeline": ["His life, year by year", "life_events"],
  "/gurudeva/diaries": ["His prayers to Śrī Gopāl Jiu", "diary_entries"], "/gurudeva/memories": ["Disciples and friends remembering him", "memories"], "/gurudeva/glorifications": ["Vyāsa-pūjā offerings and poems", "glorifications"],
  "/gurudeva/letters": ["With Śrīla Prabhupāda, disciples and others", "letters"], "/gurudeva/gallery": ["Photographs by occasion", "gallery"], "/gurudeva/places-of-remembrance": ["Where he lived, served and preached", "places"],
  "/gurudeva/personal-belongings": ["Things he used, and their stories", "belongings"], "/gurudeva/srila-prabhupada": ["His beloved spiritual master", ""], "/gurudeva/guru-parampara": ["The disciplic succession", "parampara"],
  "/gurudeva/disciples": ["His initiated disciples", "disciples"], "/gurudeva/projects": ["Bhubaneswar, temples and initiatives", "projects"],
};

/** Śrīla Gurudeva: a portrait, a few lines, and every part of his section with how much is in it. */
export default async function Page() {
  const cms = await cmsOverride("/gurudeva"); if (cms) return cms;
  let counts: Record<string, number> = {};
  if (hasDb()) { try {
    const rows = (await sql`select collection k, count(*)::int n from archive_items where status = 'published' group by 1 union all select 'diary_entries', count(*)::int from diary_entries where status = 'published' union all select 'life_events', count(*)::int from life_events where status = 'published'`) as any[];
    counts = Object.fromEntries(rows.map((r) => [r.k, r.n]));
  } catch {} }
  const tabs = GURUDEVA_TABS.filter(([h]) => h !== "/gurudeva");
  return (
    <div className="bg-white">
      <section className="border-b border-[#efe4cf] bg-[#fbf7ef]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="mb-3 text-[11.5px] font-medium uppercase tracking-[0.3em] text-saffron">Śrīla Gurudeva</p>
            <h1 className="text-[30px] leading-[1.15] text-ink sm:text-[40px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Śrī Śrīmad Gour Govinda Swāmī Gurudeva</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">A dear disciple of Śrīla Prabhupāda, born into a family that served Śrī Gopāl Jiu for generations. Here his life is remembered — in his own diary, by those who knew him, in letters and in photographs.</p>
            <div className="mt-7 flex flex-wrap gap-2"><Link href="/gurudeva/who-is-srila-gurudeva" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90">Who is Śrīla Gurudeva<ArrowRight size={15} /></Link><Link href="/gurudeva/timeline" className="inline-flex h-10 items-center rounded-md border border-line-strong bg-white px-4 text-[13.5px] text-ink hover:bg-band">Life timeline</Link></div>
          </div>
          <div className="relative mx-auto w-full max-w-[360px] pb-8 pl-4 pr-8">
            <div className="rounded-[1.3rem] p-[5px] shadow-[0_30px_60px_-25px_rgba(90,30,0,0.55)]" style={{ background: "linear-gradient(135deg, #e8c766 0%, #c2621d 45%, #8a1c0f 100%)" }}><div className="overflow-hidden rounded-[1rem]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/gurudeva-portrait.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="block aspect-[4/5] w-full object-cover object-top" /></div></div>
            <div className="absolute -right-1 bottom-0 w-[40%] rotate-[3deg] rounded-xl bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/gurudeva-smile.webp" alt="" className="aspect-[4/3] w-full rounded-lg object-cover object-top" /></div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tabs.map(([h, l, I]) => { const [d, k] = ABOUT[h] || ["", ""]; const n = k ? counts[k] || 0 : null; return (
          <Link key={h} href={h} className="group flex gap-4 rounded-2xl border border-line p-5 transition hover:border-line-strong hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.35)]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-saffron"><I size={18} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="text-[15px] font-medium text-ink group-hover:underline">{l}</span>{n ? <span className="text-[12px] tabular-nums text-ink-3">{n.toLocaleString()}</span> : null}</span><span className="mt-1 block text-[13px] leading-snug text-ink-2">{d}</span></span>
          </Link>); })}</div>
      </div>
    </div>
  );
}
