import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Hourglass } from "lucide-react";
import { type NavMenu } from "@/lib/nav";
import { getMenus } from "@/lib/menus-server";
import { Container, EmptyState, LinkCard, PageHero, SectionHead } from "./ui";
import { FlowerBand } from "./motifs";

const HERO_BG: Record<string, [string, boolean]> = {
  gurudeva: ["tan-mandala", true], teachings: ["cream-mandala", true], tattva: ["yellow-half-mandalas", false], translations: ["cream-watercolor", false], about: ["cream-watercolor", true],
};

/** A menu's overview page: every group of the menu as a row of link cards. */
export async function MenuHub({ menuKey, children, aside, before }: { menuKey: string; children?: React.ReactNode; aside?: React.ReactNode; before?: React.ReactNode }) {
  const MENUS = await getMenus();
  const menu = MENUS.find((m) => m.key === menuKey) as NavMenu;
  return (
    <>
      <PageHero crumbs={[{ label: menu.label }]} title={menu.label} intro={menu.intro} icon={menu.icon} aside={aside} bg={HERO_BG[menuKey]?.[0] ?? "cream-watercolor"} flip={HERO_BG[menuKey]?.[1] ?? false}>
        <div className="mt-6 flex flex-wrap gap-2">
          {menu.groups.map((g) => <a key={g.title} href={`#${slug(g.title)}`} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12.5px] text-ink-2 transition hover:border-saffron hover:text-saffron">{g.title}</a>)}
        </div>
      </PageHero>
      {before}
      <Container className="pt-14">
        {menu.groups.map((g, i) => (
          <section key={g.title} id={slug(g.title)} className="reveal scroll-mt-28 pb-14">
            <div className="mb-5 flex items-center gap-4">
              <h2 className="text-[20px]">{g.title}</h2>
              <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
              <span className="text-[12.5px] text-ink-3">{g.links.length} {g.links.length === 1 ? "section" : "sections"}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.links.map((l) => <LinkCard key={l.href + l.label} href={l.href} icon={l.icon} title={l.label} desc={l.desc} soon={l.soon} />)}
            </div>
            {i === 0 && children}
          </section>
        ))}
      </Container>
    </>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Template for a section that will be filled from the database. */
export async function SectionPage({ href }: { href: string }) {
  const MENUS = await getMenus();
  let hit: { menu: NavMenu; group: NavMenu["groups"][number]; link: NavMenu["groups"][number]["links"][number] } | null = null;
  for (const menu of MENUS) for (const group of menu.groups) for (const link of group.links) if (!hit && link.href === href) hit = { menu, group, link };
  if (!hit) notFound();
  const { menu, group, link } = hit;
  const siblings = group.links.filter((l) => l.href !== link.href);
  return (
    <>
      <PageHero crumbs={[{ href: menu.href, label: menu.label }, { label: link.label }]} title={link.label} intro={link.desc} icon={link.icon} />
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <EmptyState icon={Hourglass} title={link.soon ? "Coming soon" : "Arriving with the archive move"}
            text={`This page is designed and ready. Its content comes from the Taptajīvanam archive and is managed in the dashboard.`} />
        </div>
        <aside>
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-saffron">{group.title}</p>
          <div className="card divide-y divide-line">
            {siblings.map((l) => { const I = l.icon; return (
              <Link key={l.href + l.label} href={l.href} className="group flex items-center gap-3 px-4 py-3 hover:bg-saffron-tint">
                <I size={17} strokeWidth={1.7} className="shrink-0 text-saffron" />
                <span className="flex-1 text-[13.5px] font-medium group-hover:text-saffron">{l.label}</span>
                <ArrowRight size={14} className="text-ink-3 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ); })}
          </div>
          <Link href={menu.href} className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">All of {menu.label}<ArrowRight size={15} /></Link>
        </aside>
      </Container>
    </>
  );
}

export function BandSection({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="relative mt-6 bg-band py-16">
      <FlowerBand className="absolute inset-x-0 top-0" />
      <Container><SectionHead title={title} intro={intro} />{children}</Container>
      <FlowerBand className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
