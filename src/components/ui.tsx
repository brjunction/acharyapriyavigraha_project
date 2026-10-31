import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Ornament, Rosette } from "./motifs";
import { Backdrop } from "./backdrop";
export { Img } from "./img";

export function Crumbs(_props: { items: { href?: string; label: string }[] }) {
  return null;
}
export function CrumbsOld({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[12.5px] text-ink-3">
      <Link href="/" className="hover:text-saffron">Home</Link>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1"><ChevronRight size={13} />{i.href ? <Link href={i.href} className="hover:text-saffron">{i.label}</Link> : <span className="text-ink-2">{i.label}</span>}</span>
      ))}
    </nav>
  );
}

/** Page header: light band with a slow lotus rosette, like an illuminated page. */
export function PageHero({ crumbs, title, intro, icon: Icon, children, aside, bg = "cream-watercolor", flip = false }: {
  crumbs?: { href?: string; label: string }[]; title: string; intro?: string; icon?: LucideIcon; children?: React.ReactNode; aside?: React.ReactNode; bg?: string; flip?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-band">
      <Backdrop src={bg} flip={flip} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--page)]/85 via-[var(--page)]/35 to-transparent" />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="rise">
          {crumbs && <Crumbs items={crumbs} />}
          <div className="mt-5 flex items-center gap-4">
            {Icon && <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-saffron text-white shadow-[var(--shadow-md)] sm:flex"><Icon size={26} strokeWidth={1.6} /></span>}
            <h1 className="text-[26px] leading-[1.08] text-ink sm:text-[33px]">{title}</h1>
          </div>
          {intro && <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">{intro}</p>}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

/** Centred section heading with the small flower ornament (taptajivanam.com style). */
export function SectionHead({ title, intro, action, align = "center" }: { title: string; intro?: string; action?: { href: string; label: string }; align?: "center" | "left" }) {
  if (align === "left") {
    return (
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-[22px] leading-tight text-ink sm:text-[24px]">{title}</h2>{intro && <p className="mt-1.5 max-w-2xl text-[14px] text-ink-2">{intro}</p>}</div>
        {action && <Link href={action.href} className="group flex items-center gap-1 text-[13px] font-medium text-saffron">{action.label}<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></Link>}
      </div>
    );
  }
  return (
    <div className="mb-10 text-center">
      <h2 className="text-[23px] leading-tight text-ink sm:text-[26px]">{title}</h2>
      <Ornament className="mt-3" />
      {intro && <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">{intro}</p>}
      {action && <Link href={action.href} className="group mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">{action.label}<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></Link>}
    </div>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1240px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Link card with icon, used in hubs. */
export function LinkCard({ href, icon: Icon, title, desc, soon, count }: { href: string; icon: LucideIcon; title: string; desc: string; soon?: boolean; count?: string }) {
  return (
    <Link href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className="card card-hover group flex gap-4 p-5">
      <span className="mega-ic !h-11 !w-11 group-hover:!border-saffron group-hover:!bg-saffron group-hover:!text-white"><Icon size={20} strokeWidth={1.7} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[14.5px] font-semibold text-ink group-hover:text-saffron">
          {title}{soon && <span className="rounded-full border border-line px-1.5 text-[10.5px] font-normal text-ink-3">soon</span>}
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-ink-2">{desc}</span>
        {count && <span className="mt-2 inline-block text-[12px] font-medium text-saffron">{count}</span>}
      </span>
    </Link>
  );
}

/** Saffron / charcoal archive tile (the signature taptajivanam.com pattern). */
export function ArchiveTile({ href, icon: Icon, title, desc, count, tone }: { href: string; icon: LucideIcon; title: string; desc: string; count?: string; tone: "saffron" | "charcoal" }) {
  return (
    <Link href={href} className={`tile tile-${tone} group flex min-h-[230px] flex-col p-7`}>
      <Rosette className="tile-motif text-white" />
      <Icon size={30} strokeWidth={1.3} className="opacity-95" />
      <h3 className="mt-5 text-[18.5px] text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-white/80">{desc}</p>
      <div className="mt-auto flex items-center justify-between pt-6 text-[12.5px]">
        {count ? <span className="rounded-full bg-white/15 px-3 py-1 font-medium">{count}</span> : <span />}
        <span className="flex items-center gap-1 font-medium opacity-0 transition group-hover:opacity-100">Open<ArrowRight size={15} /></span>
      </div>
    </Link>
  );
}

export function QuoteCard({ text, source, date, place, sample, large }: { text: string; source: string; date?: string; place?: string; sample?: boolean; large?: boolean }) {
  return (
    <figure className="card relative flex h-full flex-col overflow-hidden p-7">
      <span className="absolute right-5 top-2 font-serif text-[83px] leading-none text-saffron/10" aria-hidden>”</span>
      <blockquote className={`relative font-serif ${large ? "text-[19.5px]" : "text-[19.5px]"} leading-snug ${sample ? "italic text-ink-3" : "text-ink"}`}>{text}</blockquote>
      <figcaption className="relative mt-auto pt-6 text-[12.5px] leading-relaxed text-ink-3">
        <span className="font-semibold text-saffron">Śrīla Gurudeva</span>
        <span className="block">{[source, date, place].filter(Boolean).join(", ")}</span>
      </figcaption>
    </figure>
  );
}

export function EmptyState({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-soft text-saffron"><Icon size={26} strokeWidth={1.5} /></span>
      <p className="mt-5 font-serif text-[16.5px]">{title}</p>
      <p className="mt-2 max-w-md text-[13.5px] text-ink-2">{text}</p>
    </div>
  );
}
