"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, ChevronLeft, Search, Settings2, Menu, X, ArrowRight } from "lucide-react";
import { MENUS, type NavMenu } from "@/lib/nav";
import { LogoMark, PaisleyField } from "./motifs";
import { usePrefs } from "./providers";
import { SettingsPanel } from "./settings";

export function Logo({ light = true, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Taptajīvanam home">
      <LogoMark className={`h-10 w-10 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 ${light ? "text-white" : "text-saffron"}`} />
      {!compact && (
        <span className="leading-none">
          <span className={`block font-serif text-[22px] font-bold tracking-[0.005em] ${light ? "text-white" : "text-ink"}`}>Taptajīvanam</span>
          <span className={`mt-1 hidden whitespace-nowrap text-[11px] tracking-[0.03em] 2xl:block ${light ? "text-white/75" : "text-ink-3"}`}>The teachings of Śrīla Gour Govinda Swāmī</span>
        </span>
      )}
    </Link>
  );
}

const isIn = (path: string, m: NavMenu) => path === m.href || path.startsWith(m.href + "/") || m.groups.some((g) => g.links.some((l) => path === l.href));

function MegaPanel({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const tiles = menu.layout === "tiles";
  const cols = menu.groups.length;
  return (
    <div className="mega-enter overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]">
      <div className="flex items-start justify-between gap-6 px-7 pt-6">
        <div>
          <p className="font-serif text-[22px] text-ink">{menu.label}</p>
          <p className="mt-0.5 text-[13.5px] text-ink-2">{menu.intro}</p>
        </div>
        <Link href={menu.href} onClick={onNavigate} className="group mt-1 flex shrink-0 items-center gap-1 text-[13.5px] text-ink-2 hover:text-saffron">
          {menu.allLabel ?? "Overview"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {tiles ? (
        <div className="grid gap-3 p-6 pt-5 sm:grid-cols-3">
          {menu.groups.flatMap((g) => g.links).map((it) => {
            const I = it.icon;
            return (
              <div key={it.href + it.label} className="group/tile rounded-xl border border-line bg-page/40 p-4 transition hover:border-saffron/40 hover:bg-saffron-tint">
                <Link href={it.href} onClick={onNavigate} className="block">
                  <span className="mega-ic !h-10 !w-10"><I size={19} strokeWidth={1.7} /></span>
                  <span className="mt-3 flex items-center gap-1 text-[15px] font-semibold text-ink group-hover/tile:text-saffron">
                    {it.label}<ArrowRight size={14} className="opacity-0 transition group-hover/tile:translate-x-0.5 group-hover/tile:opacity-100" />
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-2">{it.desc}</span>
                </Link>
                {it.chips && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                    {it.chips.map((c) => <Link key={c.href + c.label} href={c.href} onClick={onNavigate} className="rounded-md border border-line bg-surface px-2 py-0.5 text-[12px] text-ink-2 transition hover:border-saffron hover:text-saffron">{c.label}</Link>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-2 p-5 pt-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {menu.groups.map((g) => (
            <div key={g.title}>
              <p className="px-2.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-saffron">{g.title}</p>
              {g.links.map((it) => {
                const I = it.icon;
                return (
                  <Link key={it.href + it.label} href={it.href} onClick={onNavigate} className="mega-item">
                    <span className="mega-ic"><I size={17} strokeWidth={1.7} /></span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[14.5px] font-semibold leading-snug text-ink">
                        {it.label}
                        {it.soon && <span className="rounded-full border border-line px-1.5 text-[10.5px] font-normal text-ink-3">soon</span>}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-2">{it.desc}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<NavMenu | null>(null);
  const { setSearch } = usePrefs();
  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface lg:hidden">
      <div className="bar-saffron relative flex h-16 shrink-0 items-center justify-between overflow-hidden px-4">
        <PaisleyField className="text-white/[0.06]" scale={0.6} />
        <div className="relative"><Logo compact /></div>
        <button onClick={onClose} aria-label="Close menu" className="relative rounded-full p-2 text-white hover:bg-white/10"><X size={24} strokeWidth={1.8} /></button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {/* level 1 */}
        <nav className={`absolute inset-0 overflow-y-auto px-4 py-4 transition-transform duration-300 ${open ? "-translate-x-full" : "translate-x-0"}`}>
          <button onClick={() => { onClose(); setSearch(true); }} className="mb-4 flex w-full items-center gap-3 rounded-xl border border-line bg-page px-4 py-3.5 text-left text-ink-3">
            <Search size={18} /> Search lectures, quotes, verses…
          </button>
          {MENUS.map((m) => {
            const I = m.icon;
            return (
              <button key={m.key} onClick={() => setOpen(m)} className="flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left hover:bg-page">
                <span className="mega-ic !h-11 !w-11"><I size={20} strokeWidth={1.7} /></span>
                <span className="flex-1"><span className="block text-[17px] font-semibold">{m.label}</span><span className="block text-[13px] text-ink-3">{m.intro}</span></span>
                <ChevronRight size={18} className="text-ink-3" />
              </button>
            );
          })}
          <div className="mt-6 border-t border-line pt-5"><SettingsPanel compact /></div>
        </nav>
        {/* level 2 */}
        <nav className={`absolute inset-0 overflow-y-auto px-4 py-4 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          {open && (
            <>
              <button onClick={() => setOpen(null)} className="mb-2 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-ink-2"><ChevronLeft size={17} />All menus</button>
              <Link href={open.href} onClick={onClose} className="mb-3 flex items-center justify-between rounded-xl bg-saffron-tint px-4 py-3.5">
                <span className="font-serif text-xl">{open.label}</span><span className="flex items-center gap-1 text-sm text-saffron">{open.allLabel ?? "Overview"}<ArrowRight size={15} /></span>
              </Link>
              {open.groups.map((g) => (
                <div key={g.title} className="mb-3">
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-saffron">{g.title}</p>
                  {g.links.map((it) => { const I = it.icon; return (
                    <Link key={it.href + it.label} href={it.href} onClick={onClose} className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 hover:bg-page">
                      <I size={19} strokeWidth={1.7} className="shrink-0 text-saffron" />
                      <span><span className="block text-[15.5px] font-medium">{it.label}</span><span className="block text-[12.5px] text-ink-3">{it.desc}</span></span>
                    </Link>
                  ); })}
                </div>
              ))}
            </>
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
    const k = (e: KeyboardEvent) => e.key === "Escape" && (setSettings(false), setActive(null));
    document.addEventListener("mousedown", f); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", f); document.removeEventListener("keydown", k); };
  }, [settings]);

  const show = (k: string) => { if (timer.current) clearTimeout(timer.current); setActive(k); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setActive(null), 160); };
  const menu = MENUS.find((m) => m.key === active);
  const wide = menu && (menu.layout === "tiles" ? 880 : menu.groups.length >= 4 ? 1180 : menu.groups.length === 3 ? 980 : 760);

  return (
    <header className={`bar-saffron sticky top-0 z-40 transition-shadow ${scrolled ? "shadow-[0_8px_24px_-12px_rgba(60,20,0,0.5)]" : ""}`}>
      <div className="relative overflow-hidden">
        <PaisleyField className="text-white/[0.05]" scale={0.7} />
        <div className="relative mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Main" onMouseLeave={hide}>
            {MENUS.map((m) => {
              const I = m.icon;
              const on = active === m.key;
              const current = isIn(path, m);
              return (
                <button key={m.key} onMouseEnter={() => show(m.key)} onFocus={() => show(m.key)} onClick={() => setActive(on ? null : m.key)}
                  aria-expanded={on} aria-haspopup="true"
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-[14.5px] font-medium transition ${on ? "border-white/30 bg-white/15 text-white" : current ? "border-white/20 bg-white/10 text-white" : "border-transparent text-white/90 hover:bg-white/10 hover:text-white"}`}>
                  <I size={16} strokeWidth={1.9} className="hidden opacity-90 xl:block" />
                  {m.label}
                  <ChevronDown size={13} className={`-ml-0.5 opacity-70 transition-transform ${on ? "rotate-180" : ""}`} />
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
            <span className="mx-1 hidden h-6 w-px bg-white/25 lg:block" />
            <button onClick={() => setSearch(true)} aria-label="Search" title="Search (Ctrl K)"
              className="flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 text-white transition hover:bg-white/20 2xl:w-48">
              <Search size={17} /><span className="hidden flex-1 text-left text-[13.5px] text-white/80 2xl:inline">Search</span>
              <kbd className="hidden rounded border border-white/30 px-1.5 text-[10.5px] text-white/80 2xl:inline">Ctrl K</kbd>
            </button>
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setSettings(!settings)} aria-label="Settings" aria-expanded={settings} title="Settings"
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-white transition ${settings ? "border-white/40 bg-white/20" : "border-white/25 bg-white/10 hover:bg-white/20"}`}>
                <Settings2 size={18} />
              </button>
              {settings && (
                <div className="mega-enter absolute right-0 top-12 z-50 w-[340px] rounded-2xl border border-line bg-surface p-5 text-ink shadow-[var(--shadow-lg)]">
                  <SettingsPanel />
                </div>
              )}
            </div>
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"><Menu size={22} /></button>
          </div>
        </div>
      </div>
      {menu && (
        <div className="absolute left-1/2 top-[64px] hidden -translate-x-1/2 pt-2 lg:block" style={{ width: `min(${wide}px, calc(100vw - 2rem))` }}
          onMouseEnter={() => show(menu.key)} onMouseLeave={hide}>
          <MegaPanel key={menu.key} menu={menu} onNavigate={() => setActive(null)} />
        </div>
      )}
      {mounted && mobile && <MobileMenu onClose={() => setMobile(false)} />}
    </header>
  );
}
