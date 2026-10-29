import Link from "next/link";
import { BookOpen } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
import { PageHero } from "@/components/ui";
import { PageIcon } from "@/components/page-icon";

/** The public bookshelf: every published book made in the Studio. Returns null when there are none yet. */
export async function BooksShelf() {
  if (!hasDb()) return null;
  let books: any[] = [];
  try { books = await sql`select b.title, b.path, b.settings, b.seo, (select count(*)::int from pages c where c.path like b.path || '/%' and c.status = 'published') as chapters from pages b where b.type = 'book' and b.status = 'published' order by b.position, b.title`; } catch {}
  if (!books.length) return null;
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Books" }]} icon={BookOpen} title="Books" intro="Read the books online, chapter by chapter." />
      <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {books.map((b) => (
          <Link key={b.path} href={b.path} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[6px_16px_16px_6px] border border-[#e6cfa6] bg-gradient-to-br from-[#8a3a06] to-[#4a1a04] shadow-[6px_8px_0_-2px_#e8d6b8,0_18px_34px_-18px_rgba(40,20,5,.6)] transition group-hover:-translate-y-1">
              {b.settings?.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.settings.cover} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-[#f3d9a4]"><span className="h-px w-16 bg-[#f3d9a4]/60" />{b.settings?.icon ? <PageIcon icon={b.settings.icon} size={42} /> : null}<span className="text-[19px] font-bold leading-snug">{b.title}</span><span className="h-px w-16 bg-[#f3d9a4]/60" /></div>}
              <span className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
            </div>
            <p className="mt-3 font-semibold group-hover:text-saffron">{b.title}</p>
            <p className="text-[13px] text-ink-3">{b.chapters} chapters</p>
          </Link>
        ))}
      </div>
    </>
  );
}
