"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, ChevronLeft, Search, SlidersHorizontal, Menu, X, ArrowRight } from "lucide-react";
import { MENUS, ACCENT, type NavMenu } from "@/lib/nav";
import { LogoMark, Rosette } from "./motifs";
import { usePrefs } from "./providers";
import { SettingsPanel } from "./settings";
import { Img } from "./img";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Taptajīvanam home">
      <LogoMark className="h-9 w-9 shrink-0 text-saffron transition-transform duration-500 group-hover:-translate-y-0.5" flame="#e8a33a" />
      {!compact && (
        <span className="leading-none">
          <span className="block text-[18px] font-bold tracking-[-0.02em] text-ink">Taptajīvanam</span>
          <span className="mt-[3px] hidden whitespace-nowrap text-[10.5px] font-medium tracking-[0.02em] text-ink-3 2xl:block">Teachings of Śrīla Gour Govinda Swāmī</span>
        </span>
      )}
    </Link>
  );
}

const isIn = (path: string, m: NavMenu) => path === m.href || path.startsWith(m.href + "/") || m.groups.some((g) => g.links.some((l) => path === l.href));

function MegaPanel({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const tiles = menu.layout === "tiles";
  const I = menu.icon;
  const links = menu.groups.flatMap((g) => g.links);
  return (
    <div className={`acc-${ACCENT[menu.key]} mega-enter overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]`}>
      <div className="grid" style={{ gridTemplateColumns: "232px minmax(0,1fr)" }}>
        <aside className="relative flex flex-col overflow-hidden p-5 text-white" style={{ background: "linear-gradient(165deg, var(--acc), color-mix(in srgb, var(--acc) 55%, #000))" }}>
          <Rosette className="spin-slow pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 text-white/[0.14]" />
          {menu.feature?.image ? (
            <div className="relative mb-3 h-[104px] w-[84px] overflow-hidden rounded-t-full border-2 border-white/40 shadow-lg">
              <Img src={menu.feature.image} alt="" className="h-full w-full object-cover" fallback="" />
            </div>
          ) : (
            <span className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><I size={20} strokeWidth={1.7} /></span>
          )}
          <p className="relative text-[17px] font-semibold leading-tight tracking-[-0.02em]">{menu.label}</p>
          <p className="relative mt-1.5 text-[12px] leading-relaxed text-white/80">{menu.intro}</p>
          <Link href={menu.href} onClick={onNavigate} className="group relative mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium backdrop-blur transition hover:bg-white hover:text-[var(--acc)]">
            {menu.allLabel ?? "Overview"} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </aside>
        {tiles ? (
          <div className="grid gap-2 p-4 sm:grid-cols-3">
            {links.map((it) => {
              const T = it.icon;
              return (
                <div key={it.href + it.label} className="group/tile rounded-xl border border-line p-3 transition hover:border-[var(--acc)] hover:bg-acc-tint">
                  <Link href={it.href} onClick={onNavigate} className="block">
                    <span className="mega-ic"><T size={16} strokeWidth={1.8} /></span>
                    <span className="mt-2 block text-[13px] font-semibold text-ink">{it.label}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-3">{it.desc}</span>
                  </Link>
                  {it.chips && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
                      {it.chips.map((c) => <Link key={c.href + c.label} href={c.href} onClick={onNavigate} className="rounded-md bg-band px-1.5 py-0.5 text-[11px] text-ink-2 transition hover:bg-[var(--acc)] hover:text-white">{c.label}</Link>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-x-3 p-3" style={{ gridTemplateColumns: `repeat(${menu.groups.length}, minmax(0, 1fr))` }}>
            {menu.groups.map((g) => (
              <div key={g.title}>
                <p className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><span className="h-1 w-1 rounded-full bg-[var(--acc)]" />{g.title}</p>
                {g.links.map((it) => {
                  const T = it.icon;
                  return (
                    <Link key={it.href + it.label} href={it.href} onClick={onNavigate} className="mega-item" title={it.desc}>
                      <span className="mega-ic"><T size={15} strokeWidth={1.8} /></span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold leading-snug text-ink">
                          {it.label}
                          {it.soon && <span className="rounded-full bg-band px-1.5 text-[9.5px] font-medium text-ink-3">soon</span>}
                        </span>
                        <span className="line-clamp-1 text-[11px] leading-snug text-ink-3">{it.desc}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line bg-acc-tint px-5 py-2 text-[11.5px] text-ink-3">
        <span>{links.length} sections</span>
        <span className="hidden sm:inline">Press <kbd className="rounded border border-line bg-surface px-1">Ctrl</kbd> <kbd className="rounded border border-line bg-surface px-1">K</kbd> to search everything</span>
      </div>
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<NavMenu | null>(null);
  const { setSearch } = usePrefs();
  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface lg:hidden">
      <div className="stripe" />
      <div className="relative flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <Logo compact />
        <span className="absolute left-14 text-[17px] font-bold tracking-[-0.02em]">Taptajīvanam</span>
        <button onClick={onClose} aria-label="Close menu" className="relative rounded-full p-2 text-ink hover:bg-band"><X size={22} strokeWidth={1.8} /></button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <nav className={`absolute inset-0 overflow-y-auto px-4 py-4 transition-transform duration-300 ${open ? "-translate-x-full" : "translate-x-0"}`}>
          <button onClick={() => { onClose(); setSearch(true); }} className="mb-4 flex w-full items-center gap-3 rounded-xl border border-line bg-page px-4 py-3 text-left text-[14px] text-ink-3">
            <Search size={17} /> Search lectures, quotes, verses…
          </button>
          {MENUS.map((m) => {
            const I = m.icon;
            return (
              <button key={m.key} onClick={() => setOpen(m)} className={`acc-${ACCENT[m.key]} flex w-full items-center gap-3.5 rounded-xl px-2.5 py-3 text-left hover:bg-acc-tint`}>
                <span className="mega-ic !h-10 !w-10 !rounded-xl"><I size={19} strokeWidth={1.7} /></span>
                <span className="flex-1"><span className="block text-[15px] font-semibold">{m.label}</span><span className="block text-[12px] leading-snug text-ink-3">{m.intro}</span></span>
                <ChevronRight size={17} className="text-ink-3" />
              </button>
            );
          })}
          <div className="mt-5 border-t border-line pt-5"><SettingsPanel compact /></div>
        </nav>
        <nav className={`absolute inset-0 overflow-y-auto px-4 py-4 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          {open && (
            <div className={`acc-${ACCENT[open.key]}`}>
              <button onClick={() => setOpen(null)} className="mb-2 flex items-center gap-1 rounded-lg px-1 py-2 text-[13px] text-ink-2"><ChevronLeft size={16} />All menus</button>
              <Link href={open.href} onClick={onClose} className="mb-3 flex items-center justify-between rounded-xl px-4 py-3.5 text-white" style={{ background: "linear-gradient(135deg, var(--acc), color-mix(in srgb, var(--acc) 55%, #000))" }}>
                <span className="text-[17px] font-semibold">{open.label}</span><span className="flex items-center gap-1 text-[13px] opacity-90">{open.allLabel ?? "Overview"}<ArrowRight size={14} /></span>
              </Link>
              {open.groups.map((g) => (
                <div key={g.title} className="mb-2">
                  <p className="px-2 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]">{g.title}</p>
                  {g.links.map((it) => { const I = it.icon; return (
                    <Link key={it.href + it.label} href={it.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-acc-tint">
                      <span className="mega-ic"><I size={16} strokeWidth={1.8} /></span>
                      <span><span className="block text-[14px] font-medium">{it.label}</span><span className="block text-[11.5px] leading-snug text-ink-3">{it.desc}</span></span>
                    </Link>
                  ); })}
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>
    </div>,
    document.body,
  );
}

export function Header() {
  const path = usePathname();
  const { setSearch } = usePrefs();
  const [active, setActive] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { setActive(null); setMobile(false); setSettings(false); }, [path]);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => {
    if (!settings) return;
    const f = (e: MouseEvent) => { if (!settingsRef.current?.contains(e.target as Node)) setSettings(false); };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setSettings(false);
    document.addEventListener("mousedown", f); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", f); document.removeEventListener("keydown", k); };
  }, [settings]);
  useEffect(() => {
    if (!active) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [active]);

  const show = (k: string) => { if (timer.current) clearTimeout(timer.current); setActive(k); setSettings(false); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setActive(null), 150); };
  const menu = MENUS.find((m) => m.key === active);
  const wide = menu && (menu.layout === "tiles" ? 840 : menu.groups.length >= 4 ? 1120 : menu.groups.length === 3 ? 920 : 720);

  return (
    <header className="sticky top-0 z-50">
      <div className="stripe" />
      <div className={`glass border-b border-line transition-shadow ${scrolled ? "shadow-[0_6px_24px_-14px_rgba(60,30,10,0.45)]" : ""}`}>
        <div className="mx-auto flex h-[58px] max-w-[1320px] items-center gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main" onMouseLeave={hide}>
            {MENUS.map((m) => {
              const I = m.icon;
              const on = active === m.key;
              const current = isIn(path, m);
              return (
                <button key={m.key} onMouseEnter={() => show(m.key)} onFocus={() => show(m.key)} onClick={() => setActive(on ? null : m.key)}
                  aria-expanded={on} aria-haspopup="true"
                  className={`acc-${ACCENT[m.key]} group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition ${on ? "bg-acc-soft text-[var(--acc)]" : current ? "text-[var(--acc)]" : "text-ink-2 hover:bg-acc-tint hover:text-[var(--acc)]"}`}>
                  <I size={15} strokeWidth={1.9} className="hidden text-[var(--acc)] opacity-80 xl:block" />
                  {m.label}
                  <ChevronDown size={12} className={`-ml-0.5 opacity-60 transition-transform ${on ? "rotate-180" : ""}`} />
                  {current && <span className="absolute inset-x-3 -bottom-[7px] h-[2px] rounded-full bg-[var(--acc)]" />}
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => setSearch(true)} aria-label="Search" title="Search (Ctrl K)"
              className="flex h-9 items-center gap-2 rounded-full border border-line bg-band/70 px-3 text-ink-2 transition hover:border-saffron hover:bg-surface hover:text-saffron xl:w-48">
              <Search size={15} /><span className="hidden flex-1 whitespace-nowrap text-left text-[12.5px] text-ink-3 xl:inline">Search…</span>
              <kbd className="hidden whitespace-nowrap rounded border border-line bg-surface px-1.5 text-[10px] text-ink-3 xl:inline">Ctrl K</kbd>
            </button>
            <div className="relative" ref={settingsRef}>
              <button onClick={() => { setSettings(!settings); setActive(null); }} aria-label="Settings" aria-expanded={settings} title="Settings"
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${settings ? "border-saffron bg-saffron-soft text-saffron" : "border-line bg-band/70 text-ink-2 hover:border-saffron hover:text-saffron"}`}>
                <SlidersHorizontal size={16} />
              </button>
              {settings && (
                <div className="mega-enter absolute right-0 top-[calc(100%+14px)] z-[60] max-h-[calc(100vh-90px)] w-[330px] overflow-y-auto rounded-2xl border border-line bg-surface p-5 text-ink shadow-[var(--shadow-lg)]">
                  <SettingsPanel />
                </div>
              )}
            </div>
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-band lg:hidden"><Menu size={21} /></button>
          </div>
        </div>
      </div>
      {menu && (
        <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-1 lg:block" style={{ width: `min(${wide}px, calc(100vw - 2rem))` }}
          onMouseEnter={() => show(menu.key)} onMouseLeave={hide}>
          <MegaPanel key={menu.key} menu={menu} onNavigate={() => setActive(null)} />
        </div>
      )}
      {mounted && mobile && <MobileMenu onClose={() => setMobile(false)} />}
    </header>
  );
}
