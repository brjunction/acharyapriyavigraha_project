"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Type, X, Play, Pause, RotateCcw, RotateCw, Home, User, BookOpen, Menu, Sun, Moon, Coffee, Monitor, Languages, Library,
} from "lucide-react";
import { usePlayer, usePrefs } from "./providers";
import { LECTURES, QUOTE_CATEGORIES, TATTVA, fmtClock, fmtDate, SITE, IMG } from "@/lib/data";

export function Img({ src, alt, className = "", fallback = "ॐ" }: { src: string; alt: string; className?: string; fallback?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gold-soft via-saffron-soft to-paper-2 text-gold font-serif ${className}`} aria-label={alt}>
        <span className="text-4xl opacity-60">{fallback}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} loading="lazy" />;
}

const NAV = [
  { href: "/gurudeva", label: "Śrīla Gurudeva" },
  { href: "/teachings", label: "His Teachings" },
  { href: "/tattva", label: "Tattva-kośa" },
  { href: "/translations", label: "Translations" },
];

export function Header() {
  const path = usePathname();
  const { setDrawer, setPalette } = usePrefs();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon text-paper font-serif text-lg ring-2 ring-gold/40">त</span>
          <span className="font-serif text-xl tracking-wide text-ink">Taptajīvanam</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href}
                className={`rounded-full px-3.5 py-2 text-[14px] transition ${active ? "bg-maroon/10 text-maroon font-medium" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setPalette(true)}
            className="hidden items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-sm text-ink-3 shadow-sm transition hover:border-gold sm:flex md:w-72">
            <Search size={16} /> <span className="flex-1 text-left">Search teachings…</span>
            <kbd className="rounded border border-line px-1.5 text-[11px]">⌘K</kbd>
          </button>
          <button onClick={() => setPalette(true)} className="rounded-full p-2.5 text-ink-2 hover:bg-paper-2 sm:hidden" aria-label="Search"><Search size={19} /></button>
          <button onClick={() => setDrawer(true)} className="rounded-full p-2.5 text-ink-2 hover:bg-paper-2" aria-label="Reading settings" title="Settings"><Type size={19} /></button>
          <select aria-label="Language" className="hidden rounded-full border border-line bg-card px-2.5 py-2 text-sm text-ink-2 md:block">
            <option>English</option><option>हिन्दी</option><option>ଓଡ଼ିଆ</option><option>Bahasa</option><option>Nederlands</option><option>Русский</option>
          </select>
          <button onClick={() => setOpen(!open)} className="rounded-full p-2.5 text-ink-2 hover:bg-paper-2 lg:hidden" aria-label="Menu"><Menu size={19} /></button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-paper px-4 py-3 lg:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-ink-2 hover:bg-paper-2">{n.label}</Link>)}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-maroon-deep text-[#f3e6d4]">
      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="flex flex-col items-center text-center">
          <Img src={IMG.leaf} alt="" className="h-8 opacity-80" fallback="❦" />
          <p className="mt-4 font-serif text-2xl italic text-[#ecd59b]">{SITE.verse}</p>
          <p className="mt-2 max-w-2xl text-sm text-[#f3e6d4]/75">“{SITE.verseTranslation}” <span className="text-[#ecd59b]/80">({SITE.verseSource})</span></p>
          <Img src={IMG.sign} alt="Signature of Śrīla Gurudeva" className="mt-5 h-12 opacity-90 invert" fallback="✍" />
        </div>
        <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ecd59b]">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {[["/gurudeva", "Śrīla Gurudeva"], ["/teachings", "His Teachings"], ["/teachings/audio", "Audio lectures"], ["/teachings/quotes", "Quotes"], ["/tattva", "Tattva-kośa"], ["/translations", "Translations"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="text-[#f3e6d4]/80 hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ecd59b]">Connect</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {SITE.social.map((s) => <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" className="text-[#f3e6d4]/80 hover:text-white">{s.name}</a></li>)}
              <li><Link href="/soon?t=Newsletter" className="text-[#f3e6d4]/80 hover:text-white">Ānanda Sambāda newsletter</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ecd59b]">Our locations</h4>
            <div className="mt-4 space-y-4 text-sm">
              {SITE.locations.map((l) => (
                <div key={l.name}><p className="font-medium text-white">{l.name}</p>{l.lines.map((x) => <p key={x} className="text-[#f3e6d4]/70">{x}</p>)}</div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ecd59b]">Contact</h4>
            <p className="mt-4 text-sm text-[#f3e6d4]/80">{SITE.email}</p>
            <p className="text-sm text-[#f3e6d4]/80">{SITE.phone}</p>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-[#f3e6d4]/85">Built with love by disciples, grand-disciples and followers.</p>
              <Link href="/thank-list" className="mt-2 inline-block font-medium text-[#ecd59b] hover:underline">Our Thank List →</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-[#f3e6d4]/60 sm:flex-row">
          <p>Dedicated to Śrīla Gour Govinda Swāmī</p>
          <p>Prototype · sample data · © Taptajīvanam</p>
        </div>
      </div>
    </footer>
  );
}

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: React.ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-xl bg-paper-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[13px] transition ${value === o.v ? "bg-card text-ink shadow-sm font-medium" : "text-ink-3 hover:text-ink"}`}>{o.label}</button>
      ))}
    </div>
  );
}

export function SettingsDrawer() {
  const { prefs, set, reset, drawer, setDrawer } = usePrefs();
  return (
    <>
      <div onClick={() => setDrawer(false)} className={`fixed inset-0 z-50 bg-black/30 transition ${drawer ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-card shadow-2xl transition-transform duration-300 ${drawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div><p className="font-serif text-xl">Reading settings</p><p className="text-xs text-ink-3">Saved on this device</p></div>
          <button onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-paper-2" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Theme</p>
            <Seg value={prefs.theme} onChange={(v) => set("theme", v)} options={[
              { v: "light", label: <><Sun size={14} />Light</> }, { v: "sepia", label: <><Coffee size={14} />Sepia</> },
              { v: "dark", label: <><Moon size={14} />Dark</> }, { v: "system", label: <><Monitor size={14} />Auto</> }]} /></section>
          <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Reading font</p>
            <Seg value={prefs.font} onChange={(v) => set("font", v)} options={[{ v: "serif", label: <span className="font-serif text-base">Garamond</span> }, { v: "sans", label: <span className="font-sans">Sans</span> }]} /></section>
          <section>
            <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-ink-3"><span>Text size</span><span>{prefs.size}px</span></div>
            <div className="flex items-center gap-3"><span className="text-sm">A</span>
              <input type="range" min={14} max={26} value={prefs.size} onChange={(e) => set("size", +e.target.value)} className="flex-1 accent-[var(--saffron)]" />
              <span className="text-xl">A</span></div>
            <p className="reading mt-3 rounded-lg bg-paper-2 p-3 text-ink-2" style={{ maxWidth: "none" }}>kṛṣṇa-prema: the highest goal of life.</p>
          </section>
          <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Line spacing</p>
            <Seg value={prefs.leading} onChange={(v) => set("leading", v)} options={[{ v: "compact", label: "Compact" }, { v: "comfortable", label: "Comfortable" }, { v: "spacious", label: "Spacious" }]} /></section>
          <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Text width</p>
            <Seg value={prefs.width} onChange={(v) => set("width", v)} options={[{ v: "narrow", label: "Narrow" }, { v: "medium", label: "Medium" }, { v: "wide", label: "Wide" }]} /></section>
          <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Audio speed</p>
            <Seg value={prefs.speed} onChange={(v) => set("speed", v)} options={[0.75, 1, 1.25, 1.5, 2].map((v) => ({ v, label: `${v}×` }))} /></section>
          <section className="space-y-3">
            {([["diacritics", "Show diacritics (Śrīmad)"], ["reduceMotion", "Reduce motion"]] as const).map(([k, l]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 text-sm">
                {l}
                <input type="checkbox" checked={prefs[k] as boolean} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-[var(--saffron)]" />
              </label>
            ))}
          </section>
        </div>
        <div className="border-t border-line p-4"><button onClick={reset} className="w-full rounded-xl border border-line py-2.5 text-sm text-ink-2 hover:bg-paper-2">Reset to defaults</button></div>
      </aside>
    </>
  );
}

export function CommandPalette() {
  const { palette, setPalette } = usePrefs();
  const [q, setQ] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (palette) { setQ(""); setTimeout(() => ref.current?.focus(), 30); } }, [palette]);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const results = useMemo(() => {
    const n = norm(q.trim());
    const pages: { href: string; label: string; kind: string; sub?: string }[] = [
      { href: "/gurudeva", label: "Śrīla Gurudeva", kind: "Page" }, { href: "/teachings", label: "His Teachings", kind: "Page" },
      { href: "/teachings/audio", label: "All audio lectures", kind: "Page" }, { href: "/gurudeva/timeline", label: "Life timeline", kind: "Page" },
      { href: "/gurudeva/letters", label: "Letters", kind: "Page" }, { href: "/gurudeva/gallery", label: "Gallery", kind: "Page" },
      { href: "/translations", label: "Translations", kind: "Page" }, { href: "/admin", label: "Admin dashboard", kind: "Page" },
    ];
    if (!n) return pages.slice(0, 6);
    const verse = n.match(/^(sb|bg|cc)\s*[\w.\s]+$/);
    const out: { href: string; label: string; kind: string; sub?: string }[] = [];
    if (verse) out.push({ href: `/search?q=${encodeURIComponent(q)}`, label: `Verse ${q.toUpperCase()}: all lectures and quotes`, kind: "Verse" });
    out.push(...pages.filter((p) => norm(p.label).includes(n)));
    out.push(...LECTURES.filter((l) => norm(`${l.title} ${l.place} ${l.scripture ?? ""} ${l.date}`).includes(n)).slice(0, 5)
      .map((l) => ({ href: `/teachings/audio/${l.slug}`, label: l.title, kind: "Lecture", sub: `${fmtDate(l.date)} · ${l.place}` })));
    out.push(...TATTVA.flatMap((t) => [t.name, ...t.children].map((c) => ({ c, t }))).filter(({ c }) => norm(c).includes(n)).slice(0, 4)
      .map(({ c, t }) => ({ href: `/tattva/${t.slug}`, label: c, kind: "Topic", sub: t.name })));
    out.push(...QUOTE_CATEGORIES.filter((c) => norm(c).includes(n)).slice(0, 3).map((c) => ({ href: "/teachings/quotes", label: c, kind: "Quotes" })));
    return out;
  }, [q]);
  const go = (h: string) => { setPalette(false); router.push(h); };
  if (!palette) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh]" onClick={() => setPalette(false)}>
      <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
        <form onSubmit={(e) => { e.preventDefault(); go(`/search?q=${encodeURIComponent(q)}`); }} className="flex items-center gap-3 border-b border-line px-5">
          <Search size={18} className="text-ink-3" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lectures, quotes, verses (SB 1.2.6), topics, dates…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
          <kbd className="rounded border border-line px-1.5 text-[11px] text-ink-3">esc</kbd>
        </form>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.map((r, i) => (
            <li key={i}><button onClick={() => go(r.href)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-paper-2">
              <span className="w-16 shrink-0 rounded-md bg-gold-soft px-2 py-0.5 text-center text-[11px] font-medium text-ink-2">{r.kind}</span>
              <span className="flex-1 truncate text-sm">{r.label}</span>{r.sub && <span className="text-xs text-ink-3">{r.sub}</span>}
            </button></li>
          ))}
          {q && <li><button onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-saffron hover:bg-paper-2"><Search size={15} />Search everything for “{q}”</button></li>}
        </ul>
        <div className="border-t border-line px-5 py-2.5 text-[11px] text-ink-3">Works without diacritics: try “krsna”, “gopal jiu”, “bhubaneswar 1996”</div>
      </div>
    </div>
  );
}

export function MiniPlayer() {
  const { track, playing, time, toggle, seek, close } = usePlayer();
  const { prefs } = usePrefs();
  if (!track) return null;
  const pct = Math.min(100, (time / track.duration) * 100);
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-3 sm:bottom-4">
      <div className="fade-up mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-line bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
        <button onClick={toggle} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron text-white shadow" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <Link href={`/teachings/audio/${track.slug}`} className="block truncate font-serif text-[16px] hover:underline">{track.title}</Link>
          <div className="flex items-center gap-2 text-[11px] text-ink-3">
            <span>{fmtClock(time)}</span>
            <div className="h-1 flex-1 cursor-pointer rounded-full bg-paper-2" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * track.duration); }}>
              <div className="h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} />
            </div>
            <span>{fmtClock(track.duration)}</span><span className="hidden sm:inline">· {prefs.speed}×</span>
          </div>
        </div>
        <button onClick={() => seek(time - 15)} className="hidden rounded-full p-2 text-ink-2 hover:bg-paper-2 sm:block" aria-label="Back 15 seconds"><RotateCcw size={17} /></button>
        <button onClick={() => seek(time + 15)} className="hidden rounded-full p-2 text-ink-2 hover:bg-paper-2 sm:block" aria-label="Forward 15 seconds"><RotateCw size={17} /></button>
        <button onClick={close} className="rounded-full p-2 text-ink-3 hover:bg-paper-2" aria-label="Close player"><X size={17} /></button>
      </div>
    </div>
  );
}

export function MobileTabs() {
  const path = usePathname();
  const { setPalette } = usePrefs();
  const tabs = [
    { href: "/", icon: Home, label: "Home" }, { href: "/gurudeva", icon: User, label: "Gurudeva" },
    { href: "/teachings", icon: BookOpen, label: "Teachings" }, { href: "/tattva", icon: Library, label: "Tattva" }, { href: "/translations", icon: Languages, label: "Languages" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-card/95 backdrop-blur sm:hidden">
      {tabs.slice(0, 3).map((t) => <TabLink key={t.href} {...t} active={t.href === "/" ? path === "/" : path.startsWith(t.href)} />)}
      <button onClick={() => setPalette(true)} className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-ink-3"><Search size={20} />Search</button>
      {tabs.slice(3).map((t) => <TabLink key={t.href} {...t} active={path.startsWith(t.href)} />)}
    </nav>
  );
}
function TabLink({ href, icon: Icon, label, active }: { href: string; icon: typeof Home; label: string; active: boolean }) {
  return <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-maroon" : "text-ink-3"}`}><Icon size={20} />{label}</Link>;
}
