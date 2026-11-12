/* The quiet head of each Gauḍīya library page: a small lotus line, the title, one sentence, and the sibling pages as soft links. */
import Link from "next/link";
const PAGES: [string, string][] = [["/gaudiya", "Library"], ["/gaudiya/scriptures", "Scriptures"], ["/gaudiya/padyavali", "Padyāvalī"], ["/gaudiya/parampara", "Guru-paramparā"], ["/gaudiya/biographies", "Biographies"]];
export function GaudiyaHead({ at, kicker = "Gauḍīya library", title, intro }: { at: string; kicker?: string; title: string; intro: string }) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#fdf5e8_0%,#fffaf3_60%,#ffffff_100%)]">
      <svg aria-hidden viewBox="0 0 600 300" className="pointer-events-none absolute -right-24 -top-10 w-[520px] text-[#e8c48f] opacity-40 sm:opacity-60">
        {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx="300" cy="300" rx="70" ry="210" fill="none" stroke="currentColor" strokeWidth="1.2" transform={`rotate(${-80 + i * 20} 300 300)`} />)}
      </svg>
      <div className="relative mx-auto max-w-[1240px] px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-saffron"><span className="h-px w-6 bg-saffron/50" />{kicker}</p>
        <h1 className="mt-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[38px]">{title}</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{intro}</p>
        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">{PAGES.filter(([h]) => h !== at).map(([h, l]) => <Link key={h} href={h} className="text-ink-2 underline decoration-line underline-offset-4 transition hover:text-saffron hover:decoration-saffron/50">{l}</Link>)}</nav>
      </div>
    </header>);
}
