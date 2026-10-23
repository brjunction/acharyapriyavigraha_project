import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function PageHead({ eyebrow, title, intro, children }: { eyebrow?: React.ReactNode; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-gradient-to-b from-paper-2 to-paper">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-soft blur-3xl opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">{intro}</p>}
        {children}
      </div>
    </div>
  );
}

export function Section({ title, sub, action, children, className = "" }: { title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] leading-tight text-ink">{title}</h2>
          {sub && <p className="mt-1 text-sm text-ink-3">{sub}</p>}
        </div>
        {action && <Link href={action.href} className="shrink-0 text-sm font-medium text-saffron hover:underline">{action.label} →</Link>}
      </div>
      {children}
    </section>
  );
}

const TONES = {
  saffron: "from-saffron-soft to-card text-saffron",
  maroon: "from-[color-mix(in_srgb,var(--maroon)_12%,var(--card))] to-card text-maroon",
  gold: "from-gold-soft to-card text-gold",
  tulasi: "from-tulasi-soft to-card text-tulasi",
} as const;

export function Block({ href, icon: Icon, title, desc, count, tone = "gold", size = "m" }: {
  href: string; icon: LucideIcon; title: string; desc: string; count?: string; tone?: keyof typeof TONES; size?: "l" | "m" | "s";
}) {
  const big = size === "l";
  return (
    <Link href={href}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${TONES[tone]} p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-lg ${big ? "min-h-56 sm:p-7" : size === "s" ? "min-h-32" : "min-h-40"}`}>
      <div className="flex items-start justify-between">
        <span className={`flex items-center justify-center rounded-xl bg-card/80 shadow-sm ${big ? "h-12 w-12" : "h-10 w-10"}`}><Icon size={big ? 24 : 20} strokeWidth={1.7} /></span>
        <ArrowUpRight size={18} className="text-ink-3 opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-auto pt-6">
        <h3 className={`font-serif text-ink ${big ? "text-[30px]" : "text-[21px]"} leading-tight`}>{title}</h3>
        <p className="mt-1 text-sm leading-snug text-ink-2">{desc}</p>
        {count && <p className="mt-3 inline-block rounded-full bg-card/80 px-2.5 py-0.5 text-xs font-medium text-ink-2">{count}</p>}
      </div>
    </Link>
  );
}

export function GroupTitle({ children }: { children: React.ReactNode }) {
  return <p className="ornament mb-4 mt-12 text-xs font-semibold uppercase tracking-[0.2em]"><span>{children}</span></p>;
}

export function Chip({ children, active, href }: { children: React.ReactNode; active?: boolean; href?: string }) {
  const cls = `inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] transition ${active ? "border-maroon bg-maroon text-paper" : "border-line bg-card text-ink-2 hover:border-gold"}`;
  return href ? <Link href={href} className={cls}>{children}</Link> : <span className={cls}>{children}</span>;
}

export function QuoteCard({ text, source, date, place, sample }: { text: string; source: string; date?: string; place?: string; sample?: boolean }) {
  return (
    <figure className="relative flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-sm">
      <span className="absolute -top-3 left-6 rounded-full bg-paper px-2 font-serif text-4xl leading-none text-gold">“</span>
      <blockquote className={`font-serif text-[21px] leading-snug ${sample ? "text-ink-3 italic" : "text-ink"}`}>{text}</blockquote>
      <figcaption className="mt-auto pt-5 text-[13px] text-ink-3">
        <span className="font-medium text-maroon">Śrīla Gurudeva</span> · {source}{date && ` · ${date}`}{place && ` · ${place}`}
      </figcaption>
    </figure>
  );
}
