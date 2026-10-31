import Link from "next/link";
import { allAuthors, allArticles } from "@/lib/content/articles-public";
import { WritingsHeader, Avatar } from "@/components/articles/header";

export const revalidate = 300;
export const metadata = { title: "Authors", description: "Everyone whose articles are published on Taptajīvanam." };

export default async function Page() {
  const [authors, items] = await Promise.all([allAuthors(), allArticles()]);
  return (
    <>
      <WritingsHeader at="/teachings/articles/authors" title="Authors" intro="Śrīla Gurudeva, Śrīla Guru Mahārāja, and the devotees who have written about his teachings." stats={[`${authors.length} authors`]} crumbs={[["/teachings/articles", "Articles"]]} />
      <div className="mx-auto grid max-w-[1240px] gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {authors.map((a) => { const latest = items.filter((x) => x.author === a.name).slice(0, 2); return (
          <Link key={a.name} href={`/teachings/articles/authors/${a.slug}`} className="group rounded-xl border border-line p-5 transition hover:border-line-strong hover:shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3"><Avatar name={a.name} photo={a.photo} size={52} /><div className="min-w-0"><p className="truncate text-[15px] font-semibold text-ink group-hover:underline">{a.name}</p><p className="text-[12.5px] text-ink-3">{a.role ? `${a.role} · ` : ""}{a.n} {a.n === 1 ? "article" : "articles"}</p></div></div>
            {a.bio && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{a.bio}</p>}
            {latest.length > 0 && <ul className="mt-3 space-y-1 border-t border-line pt-3">{latest.map((x) => <li key={x.slug} className="truncate text-[12.5px] text-ink-2">{x.title}</li>)}</ul>}
          </Link>); })}
        {!authors.length && <p className="col-span-full py-16 text-center text-[13.5px] text-ink-3">Authors appear here as articles are published.</p>}
      </div>
    </>
  );
}
