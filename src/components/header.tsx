"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, ChevronLeft, Search, SlidersHorizontal, Menu, X, ArrowRight } from "lucide-react";
import { ACCENT, type NavMenu } from "@/lib/nav";
import { useMenus } from "./menus-context";
import { LogoMark, Rosette } from "./motifs";
import { usePrefs } from "./providers";
import { SettingsPanel } from "./settings";
import { Img } from "./img";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo-link group flex items-center" aria-label="Taptajīvanam home"
      onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>
      <span className="logo-medal relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="h-full w-full rounded-full object-cover" /></span>
      {!compact && <span className="logo-box -ml-3.5 py-[5px] pl-5 pr-3.5 text-[14.5px] font-bold leading-none tracking-[-0.02em] text-ink">Taptajīvanam</span>}
    </Link>
  );
}

const hit = (path: string, href: string) => href !== "/" && (path === href || path.startsWith(href + "/"));
const isIn = (path: string, m: NavMenu) => hit(path, m.href) || m.groups.some((g) => g.links.some((l) => hit(path, l.href)));

const dot = (desc: string, soon?: boolean) => (soon ? "bg-line-strong" : desc.includes("In progress") ? "bg-[#d99a1c]" : "bg-ok");

function MegaPanel({ menu, onNavigate, onPin }: { menu: NavMenu; onNavigate: () => void; onPin: (b: boolean) => void }) {
  const tiles = menu.layout === "tiles";
  const fly = menu.layout === "flyout";
  const I = menu.icon;
  const [gi, setGi] = useState(0);
  const [q, setQ] = useState("");
  const links = menu.groups.flatMap((g) => g.links);
  const here = usePathname();
  const sel = (href: string) => hit(here, href);
  const g = menu.groups[gi] ?? menu.groups[0];
  const nq = q.trim().toLowerCase();
  const found = nq ? menu.groups.flatMap((x) => x.links.map((l) => ({ ...l, grp: x.title }))).filter((l) => (l.label + " " + l.desc).toLowerCase().includes(nq)) : [];
  const Item = ({ it }: { it: (typeof links)[number] }) => {
    const T = it.icon;
    return (
      <Link href={it.href} {...(it.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} onClick={onNavigate} aria-current={sel(it.href) ? "page" : undefined} className={`mega-item ${sel(it.href) ? "!border-[var(--acc)] bg-acc-soft" : ""}`} title={it.desc}>
        <span className="mega-ic"><T size={14} strokeWidth={1.8} /></span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-snug text-ink">{it.label}{it.soon && <span className="rounded-full bg-band px-1.5 text-[9px] font-medium text-ink-3">soon</span>}</span>
          <span className="line-clamp-2 text-[10.5px] leading-snug text-ink-3">{it.desc}</span>
        </span>
      </Link>
    );
  };
  const Chip = ({ it }: { it: (typeof links)[number] }) => (
    <Link href={it.href} onClick={onNavigate} title={it.desc} aria-current={sel(it.href) ? "page" : undefined} className={`group/c flex items-center gap-2 rounded-lg border px-2 py-1.5 transition hover:border-[var(--acc)]/30 hover:bg-acc-tint ${sel(it.href) ? "border-[var(--acc)] bg-acc-soft" : "border-transparent"}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot(it.desc, it.soon)}`} />
      <span className="min-w-0 leading-tight"><span className="block text-[12px] font-semibold text-ink group-hover/c:text-[var(--acc)]">{it.label}</span><span className="block text-[10.5px] text-ink-3">{it.desc.split(" · ")[0]}</span></span>
    </Link>
  );
  return (
    <div className={`acc-${ACCENT[menu.key]} mega-enter overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)]`}>
      <div className="grid min-h-[440px]" style={{ gridTemplateColumns: fly ? "210px 220px minmax(0,1fr)" : "220px minmax(0,1fr)" }}>
        <aside className="relative flex flex-col overflow-hidden p-4 text-white" style={{ background: "linear-gradient(165deg, var(--acc), color-mix(in srgb, var(--acc) 55%, #000))" }}>
          <Rosette className="spin-slow pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 text-white/[0.16]" />
          <span className="relative mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><I size={18} strokeWidth={1.7} /></span>
          <p className="relative text-[15px] font-semibold leading-tight tracking-[-0.02em]">{menu.label}</p>
          <p className="relative mt-1 text-[11px] leading-relaxed text-white/80">{menu.intro}</p>
          <Link href={menu.href} onClick={onNavigate} className="group relative mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur transition hover:bg-white hover:text-[var(--acc)]">
            {menu.allLabel ?? "Overview"} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </aside>

        {fly ? (
          <>
            <ul className="max-h-[calc(100vh-140px)] overflow-y-auto border-r border-line bg-page/50 p-1.5">
              {menu.groups.map((x, k) => (
                <li key={x.title}>
                  <button onMouseEnter={() => { setGi(k); setQ(""); }} onFocus={() => setGi(k)} onClick={() => { setGi(k); setQ(""); }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition ${k === gi && !nq ? "bg-acc-soft text-[var(--acc)]" : "text-ink-2 hover:bg-acc-tint"}`}>
                    <span className="text-[12px] font-semibold leading-tight">{x.title}</span>
                    <span className="flex items-center gap-1 text-[10.5px] tabular text-ink-3">{x.links.length}<ChevronRight size={12} /></span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="max-h-[calc(100vh-140px)] min-w-0 overflow-y-auto p-3">
              {menu.searchAll && (
                <div className="sticky -top-3 z-10 -mx-3 -mt-3 mb-2 border-b border-line bg-surface px-3 pb-2 pt-3">
                  <label className="flex items-center gap-2 rounded-lg border border-line bg-page px-2.5 py-1.5 focus-within:border-[var(--acc)]">
                    <Search size={13} className="text-ink-3" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => onPin(true)} onBlur={() => onPin(false)} placeholder={`Search ${links.length} languages…`} aria-label="Search languages" className="w-full bg-transparent text-[12px] outline-none placeholder:text-ink-3" />
                  </label>
                </div>
              )}
              {nq ? (
                <>
                  <p className="px-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">{found.length} result{found.length === 1 ? "" : "s"}</p>
                  <div className="grid grid-cols-2 gap-0.5 xl:grid-cols-3">{found.map((it) => <Chip key={it.href} it={it} />)}</div>
                  {!found.length && <p className="px-1 py-4 text-[12px] text-ink-3">No match. <Link href={menu.href} onClick={onNavigate} className="text-[var(--acc)]">Browse all</Link></p>}
                </>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 px-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--acc)]"><span className="h-1 w-1 rounded-full bg-[var(--acc)]" />{g.title}<span className="font-normal normal-case tracking-normal text-ink-3">· {g.links.length}</span></p>
                  {menu.dense ? <div className="grid grid-cols-2 gap-0.5 xl:grid-cols-3">{g.links.map((it) => <Chip key={it.href + it.label} it={it} />)}</div>
                    : <div className="grid grid-cols-1 gap-x-2 sm:grid-cols-2">{g.links.map((it) => <Item key={it.href + it.label} it={it} />)}</div>}
                </>
              )}
            </div>
          </>
        ) : tiles ? (
          <div className="grid gap-2 p-3 sm:grid-cols-3">
            {links.map((it) => {
              const T = it.icon;
              return (
                <Link key={it.href + it.label} href={it.href} onClick={onNavigate} className="rounded-xl border border-line p-3 transition hover:border-[var(--acc)] hover:bg-acc-tint">
                  <span className="mega-ic"><T size={14} strokeWidth={1.8} /></span>
                  <span className="mt-1.5 block text-[12px] font-semibold text-ink">{it.label}</span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-3">{it.desc}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-x-2 p-2.5" style={{ gridTemplateColumns: `repeat(${menu.groups.length}, minmax(0, 1fr))` }}>
            {menu.groups.map((x) => (
              <div key={x.title}>
                <p className="flex items-center gap-1.5 px-2 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><span className="h-1 w-1 rounded-full bg-[var(--acc)]" />{x.title}</p>
                {x.links.map((it) => <Item key={it.href + it.label} it={it} />)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line bg-acc-tint px-4 py-1.5 text-[10.5px] text-ink-3">
        <span>{links.length} {menu.key === "translations" ? "languages" : "sections"}{menu.key === "translations" && <> · <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" /> live <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#d99a1c]" /> in progress <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-line-strong" /> planned</>}</span>
        <span className="hidden sm:inline">Press <kbd className="rounded border border-line bg-surface px-1">Ctrl</kbd> <kbd className="rounded border border-line bg-surface px-1">K</kbd> to search everything</span>
      </div>
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const path = usePathname();
  const MENUS = useMenus();
  const [open, setOpen] = useState<NavMenu | null>(null);
  const [og, setOg] = useState<string | null>(null);
  const { setSearch } = usePrefs();
  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface lg:hidden">
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
        </nav>
        <nav className={`absolute inset-0 overflow-y-auto px-4 py-4 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          {open && (
            <div className={`acc-${ACCENT[open.key]}`}>
              <button onClick={() => setOpen(null)} className="mb-2 flex items-center gap-1 rounded-lg px-1 py-2 text-[13px] text-ink-2"><ChevronLeft size={16} />All menus</button>
              <Link href={open.href} onClick={onClose} className="mb-3 flex items-center justify-between rounded-xl px-4 py-3.5 text-white" style={{ background: "linear-gradient(135deg, var(--acc), color-mix(in srgb, var(--acc) 55%, #000))" }}>
                <span className="text-[17px] font-semibold">{open.label}</span><span className="flex items-center gap-1 text-[13px] opacity-90">{open.allLabel ?? "Overview"}<ArrowRight size={14} /></span>
              </Link>
              {open.layout === "flyout" ? open.groups.map((g) => (
                <div key={g.title} className="border-b border-line">
                  <button onClick={() => setOg(og === g.title ? null : g.title)} className="flex w-full items-center justify-between px-2 py-3 text-left">
                    <span className="text-[14px] font-semibold">{g.title}</span>
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-3">{g.links.length}<ChevronDown size={15} className={`transition-transform ${og === g.title ? "rotate-180" : ""}`} /></span>
                  </button>
                  {og === g.title && (
                    <div className={`pb-3 ${open.dense ? "grid grid-cols-2 gap-1" : ""}`}>
                      {g.links.map((it) => open.dense ? (
                        <Link key={it.href + it.label} href={it.href} onClick={onClose} className={`flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-acc-tint ${hit(path, it.href) ? "bg-acc-soft font-semibold" : ""}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot(it.desc, it.soon)}`} />
                          <span className="min-w-0 leading-tight"><span className="block truncate text-[13px] font-medium">{it.label}</span><span className="block truncate text-[11px] text-ink-3">{it.desc.split(" · ")[0]}</span></span>
                        </Link>
                      ) : (
                        <Link key={it.href + it.label} href={it.href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-acc-tint ${hit(path, it.href) ? "bg-acc-soft font-semibold" : ""}`}>
                          <span className="mega-ic"><it.icon size={15} strokeWidth={1.8} /></span>
                          <span><span className="block text-[13.5px] font-medium">{it.label}</span><span className="block text-[11px] leading-snug text-ink-3">{it.desc}</span></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )) : open.groups.map((g) => (
                <div key={g.title} className="mb-2">
                  <p className="px-2 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]">{g.title}</p>
                  {g.links.map((it) => { const I = it.icon; return (
                    <Link key={it.href + it.label} href={it.href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-acc-tint ${hit(path, it.href) ? "bg-acc-soft font-semibold" : ""}`}>
                      <span className="mega-ic"><I size={15} strokeWidth={1.8} /></span>
                      <span><span className="block text-[13.5px] font-medium">{it.label}</span><span className="block text-[11px] leading-snug text-ink-3">{it.desc}</span></span>
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
  const MENUS = useMenus();
  const { setSearch } = usePrefs();
  const [active, setActive] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
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
  const hide = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => { if (!pinned.current) setActive(null); }, 150); };
  const menu = MENUS.find((m) => m.key === active);
  const wide = menu && (menu.layout === "flyout" ? 1080 : menu.layout === "tiles" ? 880 : menu.groups.length >= 4 ? 1240 : menu.groups.length === 3 ? 980 : 780);

  return (
    <header className="sticky top-0 z-50">
      <div className={`border-b border-line bg-[#ffffff] transition-shadow ${scrolled ? "shadow-[0_6px_24px_-14px_rgba(60,30,10,0.45)]" : ""}`}>
        <div className="mx-auto grid h-[58px] max-w-[1320px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center justify-center gap-0.5 lg:flex" aria-label="Main" onMouseLeave={hide}>
            {MENUS.map((m) => {
              const I = m.icon;
              const on = active === m.key;
              const current = isIn(path, m);
              return (
                <button key={m.key} onMouseEnter={() => show(m.key)} onFocus={() => show(m.key)} onClick={() => setActive(on ? null : m.key)}
                  aria-expanded={on} aria-haspopup="true"
                  className={`acc-${ACCENT[m.key]} group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium text-ink transition ${on ? "bg-acc-soft" : "hover:bg-acc-tint"}`}>
                  <I size={14} strokeWidth={1.9} className="hidden text-[var(--acc)] opacity-90 xl:block" />
                  {m.label}
                  <ChevronDown size={12} className={`-ml-0.5 opacity-60 transition-transform ${on ? "rotate-180" : ""}`} />
                  {current && <span className="absolute inset-x-3 -bottom-[7px] h-[2px] rounded-full bg-[var(--acc)]" />}
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => setSearch(true)} aria-label="Search" title="Search (Ctrl K)"
              className="flex h-9 items-center gap-2 rounded-full border border-line bg-band/60 px-3 text-ink-2 transition hover:border-saffron hover:bg-white hover:text-saffron xl:w-40">
              <Search size={15} /><span className="hidden flex-1 whitespace-nowrap text-left text-[12.5px] text-ink-3 xl:inline">Search…</span>
              <kbd className="hidden whitespace-nowrap rounded border border-line bg-surface px-1.5 text-[10px] text-ink-3 xl:inline">Ctrl K</kbd>
            </button>
            <div className="relative" ref={settingsRef}>
              <button onClick={() => { setSettings(!settings); setActive(null); }} aria-label="Settings" aria-expanded={settings} title="Settings"
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${settings ? "border-saffron bg-white text-saffron" : "border-line bg-band/60 text-ink-2 hover:border-saffron hover:bg-white hover:text-saffron"}`}>
                <SlidersHorizontal size={16} />
              </button>
              {settings && (
                <div className="mega-enter absolute right-0 top-[calc(100%+14px)] z-[60] max-h-[calc(100vh-90px)] w-[330px] max-lg:fixed max-lg:inset-x-3 max-lg:top-[66px] max-lg:w-auto overflow-y-auto rounded-2xl border border-line bg-surface p-5 text-ink shadow-[var(--shadow-lg)]">
                  <SettingsPanel />
                </div>
              )}
            </div>
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-white/70 lg:hidden"><Menu size={21} /></button>
          </div>
        </div>
      </div>
      {menu && (
        <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-1 lg:block" style={{ width: `min(${wide}px, calc(100vw - 2rem))` }}
          onMouseEnter={() => show(menu.key)} onMouseLeave={hide}>
          <MegaPanel key={menu.key} menu={menu} onNavigate={() => { pinned.current = false; setActive(null); }} onPin={(b) => { pinned.current = b; }} />
        </div>
      )}
      {mounted && mobile && <MobileMenu onClose={() => setMobile(false)} />}
    </header>
  );
}
