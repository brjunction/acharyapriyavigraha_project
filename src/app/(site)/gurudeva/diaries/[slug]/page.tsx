import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reader } from "@/components/books/reader";
import { DiaryJournal } from "@/components/diary/journal";
import { diaryIndex, diaryPage } from "@/lib/content/diary-public";
import type { TocItem } from "@/lib/content/books-public";

export const revalidate = 300;
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (e: { date: string | null; date_note: string | null }) => (e.date ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(e.date.split("-").map(Number)) : e.date_note || "Undated");
const LANG: Record<string, string> = { or: "ଓଡ଼ିଆ", hi: "हिन्दी", bn: "বাংলা", en: "English", sa: "संस्कृतम्" };
const FONTS = "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Noto+Serif:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Sans+Oriya:wght@400;600&family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap";
const paras = (t: string | null) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const e = await diaryPage(slug); return e ? { title: `His Diary, ${when(e)}`, description: String(e.translation || "").slice(0, 155), alternates: { canonical: `/gurudeva/diaries/${slug}` } } : {}; }

/** One page of His Diary, in the same reader as the books: contents by month, colours, text size, shortcuts — and the original beside the translation. */
export default async function Entry({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ with?: string; view?: string }> }) {
  const { slug } = await params; const { with: w, view } = await searchParams;
  const [e, list] = await Promise.all([diaryPage(slug), diaryIndex()]); if (!e) notFound();
  // the Diary's own view is the default; ?view=book opens the book reader
  if (view !== "book") return <DiaryJournal e={{ ...e, volume: (list.find((x) => x.slug === slug) as any)?.volume ?? null, page: (list.find((x) => x.slug === slug) as any)?.page ?? null } as any} list={list as any} />;
  const i = list.findIndex((x) => x.slug === slug); const prev = list[i - 1], next = list[i + 1];
  const sameYear = list; // the contents hold every year and volume
  const months = Array.from(new Set(sameYear.map((x) => x.date?.slice(0, 7) || "undated")));
  const toc: TocItem[] = months.flatMap((m) => { const xs = sameYear.filter((x) => (x.date?.slice(0, 7) || "undated") === m); const label = m === "undated" ? "Undated" : `${MON[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
    return [{ id: `m-${m}`, title: label, href: `/gurudeva/diaries/${xs[0].slug}`, num: String(xs.length), depth: 0, part: true, parent: null }, ...xs.map((x) => ({ id: x.slug, title: when(x), href: `/gurudeva/diaries/${x.slug}`, num: x.date ? String(Number(x.date.slice(8, 10))) : "", depth: 1, part: false, parent: `m-${m}` }))]; });
  const href = `/gurudeva/diaries/${slug}`; const orig = paras(e.original); const ol = LANG[e.original_lang || "or"] || "Original";
  const translations = orig.length ? [{ slug: "en", title: "English", language: "English", native: "English", href, current: true }, { slug: "original", title: ol, language: "Original", native: ol, href: `${href}?with=original`, current: false }] : [];
  const text = (ps: string[]) => <div className="book-body">{ps.map((p, k) => <p key={k} className="whitespace-pre-line">{p}</p>)}</div>;
  return (
    <>
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <Reader
        book={{ slug: "diary", title: "His Diary · prayers to Śrī Gopāl Jiu", href: "/gurudeva/diaries", language: "en" }}
        chapter={{ id: slug, title: e.title || when(e), num: e.title ? when(e) : "", label: e.place || "", href, index: i, total: list.length }}
        toc={toc} prev={prev ? { href: `/gurudeva/diaries/${prev.slug}`, title: when(prev) } : null} next={next ? { href: `/gurudeva/diaries/${next.slug}`, title: when(next) } : null}
        translations={translations} parallel={w === "original" && orig.length ? { title: e.title || when(e), slug: "original", language: "Original", native: ol, node: text(orig) } : null}
        searchApi="/api/diary?reader=1&q="
        extra={<><a href={`/gurudeva/diaries/${slug}`} className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[12.5px] opacity-80 hover:opacity-100">← Back to the diary view</a>{e.notes && <p className="mt-8 border-t pt-4 font-sans text-[13px] opacity-70">{e.notes}</p>}{e.scan_url && /* eslint-disable-next-line @next/next/no-img-element */ <figure className="mt-10"><img src={e.scan_url} alt="The page in his handwriting" className="w-full rounded-md border" loading="lazy" /><figcaption className="mt-2 text-center font-sans text-[12px] opacity-60">The page in his own hand</figcaption></figure>}</>}
      >
        {text(paras(e.translation))}
      </Reader>
    </>
  );
}
