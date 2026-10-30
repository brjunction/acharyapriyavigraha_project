import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Search, Images, MapPin, Calendar, User, ExternalLink, ChevronDown, ArrowRight, Mail, Star } from "lucide-react";
import { COLLECTIONS, whenOf, coverOf, youtube, type Collection, type Item, type Section } from "@/lib/archive/config";
import { listItems, getItem, sectionsOf, itemsByIds } from "@/lib/archive/server";
import { Render } from "@/components/cms/doc";
import { Gallery } from "./gallery";

const serif = { fontFamily: "var(--font-reading-serif)" } as const;
const W = "mx-auto max-w-[1180px] px-4 sm:px-6";

function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return <nav className="flex flex-wrap items-center gap-1 text-[12px] text-ink-3">{items.map((c, i) => <span key={i} className="flex items-center gap-1">{i > 0 && <ChevronRight size={12} />}{c.href ? <Link href={c.href} className="hover:text-saffron">{c.label}</Link> : <span className="text-ink-2">{c.label}</span>}</span>)}</nav>;
}
const Img = ({ src, alt = "", className = "" }: { src: string | null; alt?: string; className?: string }) => src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={alt} loading="lazy" className={className} /> : <div className={`flex items-center justify-center bg-[#f4f4f4] text-ink-3/40 ${className}`}><Images size={22} /></div>;

/* ------------------------------------------------------------------ Cards, one design per kind of collection */

export function Card({ c, i }: { c: Collection; i: Item }) {
  const href = `${c.base}/${i.slug}`; const when = whenOf(i, true); const where = [i.place, i.region, i.country && i.country !== "India" ? i.country : null].filter(Boolean).join(", ");
  switch (c.layout) {
    case "quotes": return (
      <Link href={href} className="group mb-5 block break-inside-avoid rounded-2xl border border-line bg-white p-5 transition hover:border-line-strong">
        <h3 className="text-[13px] font-medium text-ink-3 group-hover:text-saffron">{i.title}</h3>
        {i.summary && <p className="mt-2 text-[16.5px] leading-[1.6] text-ink" style={serif}>“{i.summary}”</p>}
        <div className="mt-4 flex items-center gap-2.5">
          <Img src={i.cover} className="size-8 shrink-0 rounded-full object-cover" />
          <p className="min-w-0 text-[12.5px] leading-tight"><span className="block truncate font-medium text-ink">{i.person || "—"}</span><span className="block truncate text-ink-3">{[i.person_role, when].filter(Boolean).join(", ")}</span></p>
        </div>
      </Link>);
    case "letters": return (
      <Link href={href} className="group grid grid-cols-[84px_minmax(0,1fr)] gap-4 px-4 py-3.5 transition hover:bg-[#fafafa] sm:grid-cols-[110px_minmax(0,1fr)_auto]">
        <span className="pt-0.5 text-[12.5px] tabular-nums text-ink-3">{when || "Undated"}</span>
        <span className="min-w-0"><span className="block text-[12px] text-ink-3">{[i.person, i.recipient].filter(Boolean).join(" → ")}</span><span className="block text-[14.5px] font-medium text-ink group-hover:text-saffron">{i.title}</span>{i.summary && <span className="mt-0.5 line-clamp-1 block text-[13px] text-ink-2">{i.summary}</span>}</span>
        <span className="hidden items-center gap-2 text-[11.5px] text-ink-3 sm:flex">{i.place}{i.images?.length ? <span className="flex items-center gap-1 rounded-full bg-band px-2 py-0.5"><Images size={11} />{i.images.length}</span> : null}</span>
      </Link>);
    case "albums": return (
      <Link href={href} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-band"><Img src={coverOf(i)} alt={i.title} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          {i.images?.length > 0 && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur"><Images size={11} />{i.images.length}</span>}</div>
        <h3 className="mt-2 text-[14px] font-medium leading-snug text-ink group-hover:text-saffron">{i.title}</h3>
        <p className="text-[12px] text-ink-3">{[when, where].filter(Boolean).join(" · ")}</p>
      </Link>);
    case "places": return (
      <Link href={href} className="group overflow-hidden rounded-xl border border-line bg-white transition hover:border-line-strong hover:shadow-sm">
        <Img src={coverOf(i)} alt={i.title} className="aspect-[3/2] w-full object-cover" />
        <div className="p-3.5"><p className="flex items-center gap-1 text-[11.5px] text-ink-3"><MapPin size={11} />{[i.region, i.country].filter(Boolean).join(", ") || "—"}</p>
          <h3 className="mt-1 text-[15px] font-medium text-ink group-hover:text-saffron">{i.title}</h3>{i.subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{i.subtitle}</p>}{i.date_label && <p className="mt-1.5 text-[11.5px] text-ink-3">{i.date_label}</p>}</div>
      </Link>);
    case "objects": return (
      <Link href={href} className="group block">
        <div className="overflow-hidden rounded-xl bg-[#f7f7f7]"><Img src={coverOf(i)} alt={i.title} className="aspect-square w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]" /></div>
        <h3 className="mt-2 text-[14px] font-medium text-ink group-hover:text-saffron">{i.title}</h3>{i.summary && <p className="line-clamp-2 text-[12.5px] leading-snug text-ink-2">{i.summary}</p>}
      </Link>);
    case "people": return (
      <Link href={href} className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-line-strong">
        <Img src={i.cover} alt={i.title} className="size-12 shrink-0 rounded-full object-cover" />
        <span className="min-w-0"><span className="block truncate text-[14px] font-medium text-ink group-hover:text-saffron">{i.title}</span><span className="block truncate text-[12px] text-ink-3">{[when && `Initiated ${when}`, i.country].filter(Boolean).join(" · ") || i.summary}</span></span>
      </Link>);
    case "projects": return (
      <Link href={href} className="group overflow-hidden rounded-xl border border-line bg-white transition hover:border-line-strong hover:shadow-sm">
        <Img src={coverOf(i)} alt={i.title} className="aspect-[16/9] w-full object-cover" />
        <div className="p-4">
          <h3 className=" text-[16px] font-medium text-ink group-hover:text-saffron">{i.title}</h3>{i.summary && <p className="mt-1 line-clamp-2 text-[13px] text-ink-2">{i.summary}</p>}</div>
      </Link>);
    default: return <Link href={href} className="block rounded-xl border border-line p-4 text-[14px] font-medium hover:border-saffron">{i.title}</Link>;
  }
}
const GRID: Record<string, string> = { quotes: "columns-1 gap-5 md:columns-2 xl:columns-3", letters: "divide-y divide-line rounded-xl border border-line bg-white", albums: "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4", places: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", objects: "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4", people: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3", projects: "grid gap-4 md:grid-cols-2" };
export function Cards({ c, items }: { c: Collection; items: Item[] }) { return <div className={GRID[c.layout] || "grid gap-3"}>{items.map((i) => <Card key={i.id} c={c} i={i} />)}</div>; }

/* ------------------------------------------------------------------ Index: sections on the left, items on the right */

export async function ArchiveIndex({ coll, section, q, title, intro, crumbs }: { coll: string; section?: string | null; q?: string | null; title?: string; intro?: string; crumbs?: { href?: string; label: string }[] }) {
  const c = COLLECTIONS[coll]; const [sections, all] = await Promise.all([sectionsOf(coll), listItems(coll)]);
  const sec = sections.find((s) => s.key === section) || null;
  const fold = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const items = all.filter((i) => (!sec || i.section === sec.key) && (!q || fold([i.title, i.subtitle, i.person, i.person_role, i.recipient, i.place, i.region, i.country, i.year, i.summary, ...(i.tags || [])].join(" ")).includes(fold(q))));
  const count = (k: string) => all.filter((i) => i.section === k).length;
  const url = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v) as [string, string][]); return `${c.base}${p.size ? `?${p}` : ""}`; };
  const grouped = !sec && !q; const used = sections.filter((s) => count(s.key));
  const hero = c.layout === "quotes" && grouped ? all.find((i) => i.featured && i.summary) || all.find((i) => i.summary) : null;
  return (
    <div className="bg-white">
      <div className={`${W} pt-6`}>
        <Crumbs items={crumbs || [{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: title || c.label }]} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl"><h1 className="text-[28px] leading-tight text-ink sm:text-[34px]" style={serif}>{title || c.label}</h1><p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{intro || c.intro}</p></div>
          <form action={c.base} className="relative w-full sm:w-72">{sec && <input type="hidden" name="section" value={sec.key} />}<Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input name="q" defaultValue={q || ""} placeholder={`Search ${c.label.toLowerCase()}`} className="h-10 w-full rounded-full border border-line-strong bg-white pl-9 pr-3 text-[13px] outline-none focus:border-saffron" /></form>
        </div>
      </div>
      {/* Sections as tabs that stay under the menu while scrolling */}
      <div className="sticky top-[52px] z-20 mt-6 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <nav className={`${W} flex gap-1 overflow-x-auto [scrollbar-width:none]`}>
          <Link href={url({ q: q || undefined })} className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-[13px] transition ${!sec ? "border-saffron font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}>All <span className="text-[11.5px] text-ink-3">{all.length}</span></Link>
          {sections.map((s) => { const n = count(s.key); return <Link key={s.key} href={url({ section: s.key, q: q || undefined })} className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-[13px] transition ${sec?.key === s.key ? "border-saffron font-medium text-ink" : `border-transparent ${n ? "text-ink-2" : "text-ink-3/70"} hover:text-ink`}`}>{s.title} <span className="text-[11.5px] text-ink-3">{n}</span></Link>; })}
        </nav>
      </div>
      <main className={`${W} pb-20 pt-8`}>
        {!all.length ? <Empty c={c} sections={sections} /> : grouped ? (
          <div className="space-y-14">
            {hero && <Link href={`${c.base}/${hero.slug}`} className="group grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_220px]">
              <div><p className="text-[24px] leading-[1.45] text-ink sm:text-[30px]" style={serif}>“{hero.summary}”</p>
                <p className="mt-5 text-[13.5px] text-ink-2"><span className="font-medium text-ink">{hero.person}</span>{hero.person_role ? `, ${hero.person_role}` : ""}</p>
                <p className="mt-1 text-[13px] text-saffron group-hover:underline">Read “{hero.title}”</p></div>
              {hero.cover && <Img src={hero.cover} alt={hero.person || ""} className="hidden aspect-square w-full rounded-full object-cover md:block" />}
            </Link>}
            {used.map((s) => { const xs = all.filter((i) => i.section === s.key && i.id !== hero?.id); if (!xs.length) return null; const lim = c.layout === "albums" || c.layout === "objects" ? 8 : 6; return (
              <section key={s.key}>
                <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-[20px] text-ink" style={serif}>{s.title}</h2>{s.description && <p className="mt-0.5 text-[13px] text-ink-3">{s.description}</p>}</div>{xs.length > lim && <Link href={url({ section: s.key })} className="shrink-0 text-[13px] font-medium text-saffron hover:underline">See all {xs.length}</Link>}</div>
                <Cards c={c} items={xs.slice(0, lim)} />
              </section>); })}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between gap-4"><div>{sec && <h2 className="text-[20px] text-ink" style={serif}>{sec.title}</h2>}{sec?.description && <p className="mt-0.5 text-[13px] text-ink-3">{sec.description}</p>}</div><p className="shrink-0 text-[12.5px] text-ink-3">{items.length} {items.length === 1 ? c.singular : c.label.toLowerCase()}{q ? ` for “${q}”` : ""}</p></div>
            {items.length ? <Cards c={c} items={items} /> : <p className="rounded-2xl border border-dashed border-line py-16 text-center text-[13.5px] text-ink-3">Nothing here yet.</p>}
          </>)}
      </main>
    </div>
  );
}
function Empty({ c, sections }: { c: Collection; sections: Section[] }) {
  return <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center"><p className="text-[15px] font-medium text-ink">{c.label} will appear here</p><p className="mx-auto mt-1.5 max-w-md text-[13px] text-ink-3">Arranged as {sections.map((s) => s.title).join(" · ")}.</p></div>;
}

/* ------------------------------------------------------------------ One item */

export async function ArchiveItem({ coll, slug, crumbs }: { coll: string; slug: string; crumbs?: { href?: string; label: string }[] }) {
  const c = COLLECTIONS[coll]; const i = await getItem(coll, slug); if (!i) notFound();
  const [sections, siblings, related] = await Promise.all([sectionsOf(coll), listItems(coll, { section: i.section }), itemsByIds(i.related || [])]);
  const sec = sections.find((s) => s.key === i.section);
  const k = siblings.findIndex((x) => x.id === i.id); const prev = k > 0 ? siblings[k - 1] : null; const next = k >= 0 && k < siblings.length - 1 ? siblings[k + 1] : null;
  const yt = youtube(i.media); const mp3 = i.media && /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(i.media) ? i.media : null;
  const facts: [any, string, string | null][] = [
    [User, c.layout === "letters" ? "From" : c.layout === "quotes" ? "Remembered by" : "Person", i.person], [User, "To", i.recipient], [User, "Service", i.person_role],
    [Calendar, c.layout === "people" ? "Initiated" : "Date", whenOf(i) || null], [MapPin, "Place", [i.place, i.region, i.country].filter(Boolean).join(", ") || null], [Star, "Status", i.status_label],
  ];
  const isAlbum = c.layout === "albums"; const isObject = c.layout === "objects";
  return (
    <div className="bg-white">
      <div className={`${W} pb-16 pt-6`}>
        <Crumbs items={crumbs || [{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { href: c.base, label: c.label }, ...(sec ? [{ href: `${c.base}?section=${sec.key}`, label: sec.title }] : [])]} />
        <div className={`mt-6 grid gap-10 ${isAlbum ? "" : "lg:grid-cols-[minmax(0,1fr)_280px]"}`}>
          <article className="min-w-0">
            {sec && <p className="text-[13px] font-medium text-saffron">{sec.title}</p>}
            <div className={c.layout === "people" ? "mt-2 flex items-center gap-4" : ""}>
              {c.layout === "people" && <Img src={i.cover} alt={i.title} className="size-20 shrink-0 rounded-full object-cover" />}
              <div><h1 className="mt-1 text-[28px] leading-tight text-ink sm:text-[32px]" style={serif}>{i.title}</h1>{i.subtitle && <p className="mt-1 text-[15px] text-ink-2">{i.subtitle}</p>}</div>
            </div>
            {c.layout === "quotes" && i.person && <div className="mt-4 flex items-center gap-3"><Img src={i.cover} className="size-10 rounded-full object-cover" /><p className="text-[13px] leading-tight"><span className="block font-medium text-ink">{i.person}</span>{i.person_role && <span className="text-ink-3">{i.person_role}</span>}</p></div>}
            {isAlbum && <p className="mt-2 text-[13px] text-ink-3">{[whenOf(i), [i.place, i.country].filter(Boolean).join(", "), `${i.images.length} photos`].filter(Boolean).join(" · ")}</p>}
            {!isAlbum && c.layout !== "quotes" && c.layout !== "people" && coverOf(i) && !(i.images?.length > 1) && <Img src={coverOf(i)} alt={i.title} className={`mt-6 w-full rounded-xl ${isObject ? "max-h-[520px] bg-[#f7f7f7] object-contain p-6" : "max-h-[560px] object-cover"}`} />}
            {i.summary && <p className={`mt-6 text-[17px] leading-relaxed text-ink-2 ${c.layout === "quotes" ? "border-l-2 border-saffron pl-4 italic" : ""}`} style={serif}>{c.layout === "quotes" ? `“${i.summary}”` : i.summary}</p>}
            {yt && <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black"><iframe src={yt} title={i.title} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div>}
            {mp3 && <audio controls src={mp3} className="mt-6 w-full" preload="none" />}
            {i.images?.length > (isAlbum ? 0 : 1) && <div className="mt-6"><Gallery images={i.images} masonry={isAlbum} /></div>}
            {i.body?.length > 0 && <div className="reading mt-8"><Render doc={i.body} /></div>}
            {i.chapters?.length > 0 && <div className="mt-8 divide-y divide-line rounded-xl border border-line">{i.chapters.map((ch, n) => (
              <details key={n} className="group" open={n === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-[15px] font-medium text-ink hover:bg-[#fafafa]">{ch.title}<ChevronDown size={16} className="text-ink-3 transition group-open:rotate-180" /></summary><div className="whitespace-pre-line px-5 pb-5 text-[15px] leading-[1.75] text-ink-2">{ch.text}</div></details>))}</div>}
            {(prev || next) && <nav className="mt-12 grid grid-cols-2 gap-3 border-t border-line pt-5">
              {prev ? <Link href={`${c.base}/${prev.slug}`} className="rounded-xl border border-line p-3 text-[13px] hover:border-saffron"><span className="text-[11.5px] text-ink-3">Previous</span><span className="mt-0.5 block font-medium text-ink">{prev.title}</span></Link> : <span />}
              {next && <Link href={`${c.base}/${next.slug}`} className="rounded-xl border border-line p-3 text-right text-[13px] hover:border-saffron"><span className="text-[11.5px] text-ink-3">Next</span><span className="mt-0.5 block font-medium text-ink">{next.title}</span></Link>}
            </nav>}
          </article>
          {!isAlbum && <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {c.layout !== "projects" && facts.some(([, , v]) => v) && <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">{facts.filter(([, , v]) => v).map(([I, l, v]) => <div key={l} className="flex gap-3 px-4 py-2.5"><I size={14} className="mt-0.5 shrink-0 text-ink-3" /><div><dt className="text-[11.5px] text-ink-3">{l}</dt><dd className="text-ink">{v}</dd></div></div>)}</dl>}
            {i.links?.length > 0 && <div className="space-y-1.5">{i.links.map((l) => <a key={l.url} href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-ink hover:border-saffron hover:text-saffron">{l.label || l.url}<ExternalLink size={13} className="text-ink-3" /></a>)}</div>}
            {related.length > 0 && <div><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{c.labels?.related?.[0] || "Related"}</p><div className="space-y-1">{related.map((r) => { const rc = COLLECTIONS[r.collection]; return <Link key={r.id} href={`${rc.base}/${r.slug}`} className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band hover:text-saffron">{r.title}</Link>; })}</div></div>}
            {siblings.length > 1 && <div><p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">More in {sec?.title || c.label}</p><div className="space-y-0.5">{siblings.filter((x) => x.id !== i.id).slice(0, 8).map((x) => <Link key={x.id} href={`${c.base}/${x.slug}`} className="block truncate rounded-lg px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band hover:text-saffron">{x.title}</Link>)}</div></div>}
            {i.tags?.length > 0 && <div className="flex flex-wrap gap-1.5">{i.tags.map((t) => <Link key={t} href={`${c.base}?q=${encodeURIComponent(t)}`} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-ink-2 hover:border-saffron">{t}</Link>)}</div>}
          </aside>}
        </div>
      </div>
    </div>
  );
}
export { Mail };
