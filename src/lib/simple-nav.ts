import type { LucideIcon } from "lucide-react";
import { Headphones, BookOpen, Info, Network, Languages, LayoutGrid } from "lucide-react";
import { Lotus } from "@/components/lotus-icon";
import { ICONS, isImgIcon } from "./menus";
import type { NavLink, NavMenu } from "./nav";

/** The Simple menu: four plain sections for elderly visitors. Built from the full (Advanced) menus,
 *  so every page stays reachable — nothing is left out, only arranged more simply. */
export type SimpleLink = { href: string; label: string; icon: LucideIcon; img?: string; pos?: string; note?: string };
export type SimpleGroup = { title: string; links: SimpleLink[] };
export type SimpleMenu = { key: string; label: string; intro: string; href: string; accent: string; icon: LucideIcon; img?: string; featured: SimpleLink[]; groups: SimpleGroup[]; all: SimpleLink[] };

/** What editors can change in the Studio (Website menus → Simple menu). Icons are an icon name or a picture address. */
export type SimpleFeaturedJ = { href: string; label: string; note?: string; icon?: string };
export type SimpleSectionJ = { label?: string; intro?: string; icon?: string; featured?: SimpleFeaturedJ[] };
export type SimpleCfg = Record<string, SimpleSectionJ>;

export const SIMPLE_DEFAULTS: { key: string; label: string; intro: string; icon: string; accent: string; featured: SimpleFeaturedJ[] }[] = [
  { key: "gurudeva", label: "Śrīla Gurudeva", intro: "His life, his diary, his photos", icon: "Lotus", accent: "saffron", featured: [
    { href: "/gurudeva/who-is-srila-gurudeva", label: "Who is Śrīla Gurudeva?", note: "His life and biographies", icon: "/photos/gurudeva-portrait.webp" },
    { href: "/gurudeva/timeline", label: "Life timeline", note: "His life, year by year", icon: "/photos/menu-seated-1.webp" },
    { href: "/gurudeva/gallery", label: "Gallery", note: "Portraits, deities, festivals and travels", icon: "/photos/menu-garland.webp" },
    { href: "/gurudeva/diaries", label: "His diary", note: "His prayers to Śrī Gopāl Jiu", icon: "/photos/gurudeva-writing.webp" }] },
  { key: "listen", label: "Listen & Watch", intro: "His lectures, videos and kīrtanas", icon: "Headphones", accent: "teal", featured: [
    { href: "/teachings/audio", label: "Audio lectures", note: "Every recorded lecture, remastered", icon: "Headphones" },
    { href: "/teachings/videos", label: "Videos", note: "His lectures and moments on video", icon: "Clapperboard" },
    { href: "/teachings/kirtans", label: "Kīrtanas & bhajanas", note: "Songs he sang and led", icon: "Music" },
    { href: "/resources/taptajivanam-youtube", label: "Taptajīvanam YouTube", note: "Lectures and shorts", icon: "Youtube" }] },
  { key: "read", label: "Read", intro: "Books, quotes and topics", icon: "BookOpen", accent: "indigo", featured: [
    { href: "/teachings/books", label: "Books", note: "Publications on his teachings", icon: "BookOpen" },
    { href: "/teachings/articles", label: "Articles", note: "Essays by author and series", icon: "FileText" },
    { href: "/teachings/quotes", label: "Quotes", note: "His words by subject, with source", icon: "Quote" },
    { href: "/tattva", label: "Topics", note: "Guru, bhakti, Kṛṣṇa, the soul…", icon: "Network" }] },
  { key: "about", label: "About", intro: "Archive, contact, resources", icon: "Info", accent: "leaf", featured: [
    { href: "/about", label: "About the archive", note: "Why and how this archive exists", icon: "Archive" },
    { href: "/about/founder", label: "Śrīla Guru Mahārāja", note: "Founder of Taptajīvanam", icon: "/photos/haladhara-sm.webp" },
    { href: "/about/contact", label: "Contact", note: "Write to us or call", icon: "Phone" },
    { href: "/about/support", label: "Support the archive", note: "Sevā, sponsorship, contributions", icon: "HandHeart" }] },
];
/** Where to centre each photo, so no head is cut. */
const POS: Record<string, string> = { "/photos/gurudeva-writing.webp": "18% 22%", "/photos/menu-seated-1.webp": "50% 30%", "/photos/menu-garland.webp": "50% 25%", "/photos/gurudeva-portrait.webp": "50% 30%" };
const FALLBACK: Record<string, LucideIcon> = { gurudeva: Lotus as unknown as LucideIcon, listen: Headphones, read: BookOpen, about: Info };
const pick = (v: string | undefined, fb: LucideIcon): { icon: LucideIcon; img?: string } => (isImgIcon(v) ? { icon: fb, img: v } : { icon: (v && ICONS[v]) || fb });

export function simpleMenus(menus: NavMenu[], cfg?: SimpleCfg | null): SimpleMenu[] {
  const m = (k: string) => menus.find((x) => x.key === k);
  const groups = (k: string) => (m(k)?.groups ?? []).flatMap((g) => g.links);
  const top = (k: string, label?: string): NavLink[] => { const x = m(k); return x ? [{ href: x.href, label: label ?? x.allLabel ?? x.label, desc: "", icon: x.icon }] : []; };
  const teach = m("teachings")?.groups ?? [];
  // Teachings groups not named "Hear & watch" go to Read, so a group added later is never lost.
  const listenTeach = teach.filter((g) => g.title === "Hear & watch").flatMap((g) => g.links);
  const yt = groups("resources").filter((l) => /youtube/i.test(l.href + l.label));
  const G = (k: string, only?: string[]) => (m(k)?.groups ?? []).filter((g) => !only || only.includes(g.title));
  const T = (title: string, links: NavLink[]) => ({ title, links });
  const GROUPS: Record<string, { title: string; links: NavLink[] }[]> = {
    gurudeva: G("gurudeva"),
    listen: [T("Hear & watch", listenTeach), T("On YouTube", yt), T("Everything", top("teachings", "All teachings"))],
    read: [...teach.filter((g) => g.title !== "Hear & watch"), ...G("tattva").map((g) => (g.title === "Subjects" ? T("Topics", [...top("tattva", "All topics"), ...g.links]) : g)), T("Other languages", top("translations", "Translations"))],
    about: [...G("about"), ...G("resources").map((g) => T(g.title, g.links.filter((l) => !yt.includes(l))))],
  };
  return SIMPLE_DEFAULTS.map((d) => {
    const c = cfg?.[d.key] || {};
    const iconOf = (href: string) => GROUPS[d.key].flatMap((g) => g.links).find((a) => a.href === href)?.icon;
    const feat = (c.featured?.length ? c.featured : d.featured).filter((f) => f.href && f.label);
    const featured: SimpleLink[] = feat.map((f) => { const ic = pick(f.icon, iconOf(f.href) ?? (f.href === "/tattva" ? Network : f.href === "/translations" ? Languages : LayoutGrid)); return { href: f.href, label: f.label, note: f.note || undefined, ...ic, pos: ic.img ? POS[ic.img] : undefined }; });
    const fh = new Set(featured.map((f) => f.href)); const seen = new Set<string>(fh);
    const groups: SimpleGroup[] = GROUPS[d.key].map((g) => ({ title: g.title, links: g.links.filter((l) => !seen.has(l.href) && seen.add(l.href)).map((l) => ({ href: l.href, label: l.label, icon: l.icon })) })).filter((g) => g.links.length);
    const href = d.key === "gurudeva" ? m("gurudeva")?.href || "/gurudeva" : d.key === "about" ? "/about" : "/teachings";
    return { key: d.key, label: c.label || d.label, intro: c.intro || d.intro, href, accent: d.accent, ...pick(c.icon || d.icon, FALLBACK[d.key]), featured, groups, all: groups.flatMap((g) => g.links) };
  });
}
