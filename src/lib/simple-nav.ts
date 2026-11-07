import type { LucideIcon } from "lucide-react";
import { Headphones, BookOpen, Info, Network, Languages, LayoutGrid } from "lucide-react";
import { Lotus } from "@/components/lotus-icon";
import { ICONS, isImgIcon } from "./menus";
import type { NavLink, NavMenu } from "./nav";

/** The Simple menu: four plain sections for elderly visitors. Built from the full (Advanced) menus,
 *  so every page stays reachable — nothing is left out, only arranged more simply. */
export type SimpleLink = { href: string; label: string; icon: LucideIcon; img?: string; note?: string };
export type SimpleMenu = { key: string; label: string; intro: string; href: string; accent: string; icon: LucideIcon; img?: string; featured: SimpleLink[]; all: SimpleLink[] };

/** What editors can change in the Studio (Website menus → Simple menu). Icons are an icon name or a picture address. */
export type SimpleFeaturedJ = { href: string; label: string; note?: string; icon?: string };
export type SimpleSectionJ = { label?: string; intro?: string; icon?: string; featured?: SimpleFeaturedJ[] };
export type SimpleCfg = Record<string, SimpleSectionJ>;

export const SIMPLE_DEFAULTS: { key: string; label: string; intro: string; icon: string; accent: string; featured: SimpleFeaturedJ[] }[] = [
  { key: "gurudeva", label: "Śrīla Gurudeva", intro: "His life, his diary, his photos", icon: "Lotus", accent: "saffron", featured: [
    { href: "/gurudeva/who-is-srila-gurudeva", label: "Who is Śrīla Gurudeva?", icon: "UserRound" }, { href: "/gurudeva/timeline", label: "Life timeline", icon: "Clock" },
    { href: "/gurudeva/gallery", label: "Gallery", icon: "Image" }, { href: "/gurudeva/diaries", label: "His diary", note: "Prayers to Śrī Gopāl Jiu", icon: "NotebookPen" }] },
  { key: "listen", label: "Listen & Watch", intro: "His lectures, videos and kīrtanas", icon: "Headphones", accent: "teal", featured: [
    { href: "/teachings/audio", label: "Audio lectures", icon: "Headphones" }, { href: "/teachings/videos", label: "Videos", icon: "Clapperboard" },
    { href: "/teachings/kirtans", label: "Kīrtanas & bhajanas", icon: "Music" }, { href: "/resources/taptajivanam-youtube", label: "Taptajīvanam YouTube", icon: "Youtube" }] },
  { key: "read", label: "Read", intro: "Books, quotes and topics", icon: "BookOpen", accent: "indigo", featured: [
    { href: "/teachings/books", label: "Books", icon: "BookOpen" }, { href: "/teachings/articles", label: "Articles", icon: "FileText" },
    { href: "/teachings/quotes", label: "Quotes", icon: "Quote" }, { href: "/tattva", label: "Topics", note: "Guru, bhakti, Kṛṣṇa…", icon: "Network" }] },
  { key: "about", label: "About", intro: "Archive, contact, resources", icon: "Info", accent: "leaf", featured: [
    { href: "/about", label: "About the archive", icon: "Archive" }, { href: "/about/founder", label: "Śrīla Guru Mahārāja", note: "Founder of Taptajīvanam", icon: "UserRound" },
    { href: "/about/contact", label: "Contact", icon: "Phone" }, { href: "/about/support", label: "Support the archive", icon: "HandHeart" }] },
];
const FALLBACK: Record<string, LucideIcon> = { gurudeva: Lotus as unknown as LucideIcon, listen: Headphones, read: BookOpen, about: Info };
const pick = (v: string | undefined, fb: LucideIcon): { icon: LucideIcon; img?: string } => (isImgIcon(v) ? { icon: fb, img: v } : { icon: (v && ICONS[v]) || fb });

export function simpleMenus(menus: NavMenu[], cfg?: SimpleCfg | null): SimpleMenu[] {
  const m = (k: string) => menus.find((x) => x.key === k);
  const groups = (k: string) => (m(k)?.groups ?? []).flatMap((g) => g.links);
  const top = (k: string, label?: string): NavLink[] => { const x = m(k); return x ? [{ href: x.href, label: label ?? x.allLabel ?? x.label, desc: "", icon: x.icon }] : []; };
  const teach = m("teachings")?.groups ?? [];
  // Teachings groups not named "Hear & watch" go to Read, so a group added later is never lost.
  const readTeach = teach.filter((g) => g.title !== "Hear & watch").flatMap((g) => g.links);
  const listenTeach = teach.filter((g) => g.title === "Hear & watch").flatMap((g) => g.links);
  const yt = groups("resources").filter((l) => /youtube/i.test(l.href + l.label));
  const LINKS: Record<string, NavLink[]> = {
    gurudeva: [...top("gurudeva", "Śrīla Gurudeva — overview"), ...groups("gurudeva")],
    listen: [...top("teachings", "All teachings"), ...listenTeach, ...yt],
    read: [...readTeach, ...top("tattva", "Topics (Tattva) — all"), ...groups("tattva"), ...top("translations", "Translations — all languages")],
    about: [...groups("about"), ...top("resources", "Resources — all"), ...groups("resources").filter((l) => !yt.includes(l))],
  };
  return SIMPLE_DEFAULTS.map((d) => {
    const c = cfg?.[d.key] || {};
    const seen = new Set<string>();
    const all: SimpleLink[] = LINKS[d.key].filter((l) => !seen.has(l.href) && seen.add(l.href)).map((l) => ({ href: l.href, label: l.label, icon: l.icon }));
    const feat = (c.featured?.length ? c.featured : d.featured).filter((f) => f.href && f.label);
    const featured: SimpleLink[] = feat.map((f) => ({ href: f.href, label: f.label, note: f.note || undefined,
      ...pick(f.icon, all.find((a) => a.href === f.href)?.icon ?? (f.href === "/tattva" ? Network : f.href === "/translations" ? Languages : LayoutGrid)) }));
    const fh = new Set(featured.map((f) => f.href));
    const href = d.key === "gurudeva" ? m("gurudeva")?.href || "/gurudeva" : d.key === "about" ? "/about" : d.key === "read" ? "/teachings" : "/teachings";
    return { key: d.key, label: c.label || d.label, intro: c.intro || d.intro, href, accent: d.accent, ...pick(c.icon || d.icon, FALLBACK[d.key]), featured, all: all.filter((a) => !fh.has(a.href)) };
  });
}
