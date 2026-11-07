import type { LucideIcon } from "lucide-react";
import { Headphones, BookOpen, Info, Network, Languages, LayoutGrid, Image, GitBranch, Building2, Quote, Clapperboard, Smartphone, ScrollText, Globe, Megaphone, UserRound, Sparkles } from "lucide-react";
import { Lotus } from "@/components/lotus-icon";
import { ICONS, isImgIcon } from "./menus";
import type { NavLink, NavMenu } from "./nav";

/** The Simple menu: four plain sections for elderly visitors. Built from the full (Advanced) menus,
 *  so every page stays reachable — nothing is left out, only arranged more simply. */
export type SimpleLink = { href: string; label: string; icon: LucideIcon; img?: string; pos?: string; note?: string; group?: string };
export type SimpleGroup = { title: string; links: SimpleLink[] };
export type SimpleTab = { title: string; acc: string; items: SimpleLink[]; icon: LucideIcon; img?: string; pos?: string };
export type SimpleMenu = { key: string; label: string; intro: string; href: string; accent: string; icon: LucideIcon; img?: string; featured: SimpleLink[]; groups: SimpleGroup[]; all: SimpleLink[]; tabs: SimpleTab[] };

/** What editors can change in the Studio (Website menus → Simple menu). Icons are an icon name or a picture address. */
export type SimpleFeaturedJ = { href: string; label: string; note?: string; icon?: string; group?: string };
export type SimpleSectionJ = { label?: string; intro?: string; icon?: string; featured?: SimpleFeaturedJ[] };
export type SimpleCfg = Record<string, SimpleSectionJ>;

export const SIMPLE_DEFAULTS: { key: string; label: string; intro: string; icon: string; accent: string; featured: SimpleFeaturedJ[] }[] = [
  { key: "gurudeva", label: "Śrīla Gurudeva", intro: "His life, his diary, his photos", icon: "Lotus", accent: "saffron", featured: [
    { group: "His life", href: "/gurudeva/who-is-srila-gurudeva", label: "Who is Śrīla Gurudeva?", note: "His life and biographies", icon: "/photos/gurudeva-portrait.webp" },
    { group: "His life", href: "/gurudeva/timeline", label: "Life timeline", note: "His life, year by year", icon: "/photos/menu-seated-1.webp" },
    { group: "His life", href: "/gurudeva/diaries", label: "His diary", note: "His prayers to Śrī Gopāl Jiu", icon: "/photos/gurudeva-writing.webp" },
    { group: "His life", href: "/gurudeva/radha-gopal-jiu", label: "Śrī Gopāl Jiu", note: "His beloved Deity", icon: "Sparkles" },
    { group: "Remembrance", href: "/gurudeva/gallery", label: "Gallery", note: "Portraits, festivals, travels", icon: "/photos/menu-garland.webp" },
    { group: "Remembrance", href: "/gurudeva/places-of-remembrance", label: "Smṛti Bhavan", note: "Everything related to him", icon: "Landmark" },
    { group: "Remembrance", href: "/gurudeva/memories", label: "Memories & pastimes", note: "Disciples remembering him", icon: "HandHeart" },
    { group: "Remembrance", href: "/gurudeva/glorifications", label: "Glorifications", note: "Vyāsa-pūjā offerings", icon: "Gift" },
    { group: "Projects", href: "/gurudeva/projects", label: "All his projects", note: "Bhubaneswar, temples, initiatives", icon: "Building2" },
    { group: "Lineage & disciples", href: "/gurudeva/srila-prabhupada", label: "Śrīla Prabhupāda", note: "His beloved spiritual master", icon: "Crown" },
    { group: "Lineage & disciples", href: "/gurudeva/disciples", label: "His disciples", note: "Every initiated disciple", icon: "IdCard" },
    { group: "Lineage & disciples", href: "/gurudeva/letters", label: "Letters", note: "With Śrīla Prabhupāda and others", icon: "Mail" }] },
  { key: "listen", label: "Listen & Watch", intro: "His lectures, videos and kīrtanas", icon: "Headphones", accent: "teal", featured: [
    { group: "Listen", href: "/teachings/audio", label: "Audio lectures", note: "Every recorded lecture, remastered", icon: "Headphones" },
    { group: "Listen", href: "/teachings/kirtans", label: "Kīrtanas & bhajanas", note: "Songs he sang and led", icon: "Music" },
    { group: "Watch", href: "/teachings/videos", label: "Videos", note: "His lectures and moments on video", icon: "Clapperboard" },
    { group: "Watch", href: "/resources/taptajivanam-youtube", label: "Taptajīvanam YouTube", note: "Lectures and shorts", icon: "Youtube" }] },
  { key: "read", label: "Read", intro: "Books, quotes and tattva", icon: "BookOpen", accent: "indigo", featured: [
    { group: "Read", href: "/teachings/books", label: "Books", note: "Publications on his teachings", icon: "BookOpen" },
    { group: "Read", href: "/teachings/magazines", label: "Magazines", note: "Gopāl Jiu magazine and more", icon: "Newspaper" },
    { group: "Read", href: "/teachings/articles", label: "Articles", note: "Essays by author and series", icon: "FileText" },
    { group: "Read", href: "/teachings/transcriptions", label: "Transcriptions", note: "His lectures, word for word", icon: "ScrollText" },
    { group: "His words", href: "/teachings/quotes", label: "Quotes", note: "By subject, with source", icon: "Quote" },
    { group: "His words", href: "/teachings/instructions", label: "Instructions", note: "Guidance for sādhana and life", icon: "ListChecks" },
    { group: "His words", href: "/teachings/stories", label: "Stories", note: "Stories he told", icon: "BookHeart" },
    { group: "Tattva", href: "/tattva", label: "Tattva", note: "Every subject of his teachings, topic by topic", icon: "Network" }] },
  { key: "about", label: "About", intro: "Archive, contact, resources", icon: "Info", accent: "leaf", featured: [
    { href: "/about", label: "About this website", note: "Why and how this archive exists", icon: "Archive" },
    { href: "/gurudeva/taptajivanam-projects", label: "Taptajīvanam project", note: "The archive and its services", icon: "Library" },
    { href: "/about/founder", label: "Śrīla Guru Mahārāja", note: "Founder of Taptajīvanam", icon: "/photos/haladhara-sm.webp" },
    { href: "/thank-list", label: "Our Thank List", note: "Everyone who built this archive", icon: "HeartHandshake" },
    { href: "/about/contact", label: "Contact", note: "Write to us or call", icon: "Phone" }] },
];
/** Where to centre each photo, so no head is cut. */
/** The picture or icon of each group in the Simple menu. */
const TAB_ICON: Record<string, LucideIcon> = { "His life": UserRound, Remembrance: Image, "Lineage & disciples": GitBranch, Projects: Building2, Read: BookOpen, "His words": Quote, Listen: Headphones, Watch: Clapperboard, About: Info, Tools: Smartphone, "Paramparā protection": ScrollText, "Elsewhere online": Globe, "News & updates": Megaphone };
const POS: Record<string, string> = { "/photos/gurudeva-writing.webp": "18% 22%", "/photos/menu-seated-1.webp": "50% 30%", "/photos/menu-garland.webp": "50% 25%", "/photos/gurudeva-portrait.webp": "50% 30%" };
/** Colours for the groups inside a Simple menu, in order. */
export const GROUP_ACC = ["saffron", "rose", "teal", "indigo", "leaf", "gold", "plum"];
export function groupsOf(m: SimpleMenu): { title: string; acc: string; items: SimpleLink[] }[] {
  const out: { title: string; acc: string; items: SimpleLink[] }[] = [];
  for (const f of m.featured) { const t = f.group || ""; let g = out.find((x) => x.title === t); if (!g) { g = { title: t, acc: out.length === 0 ? m.accent : GROUP_ACC.filter((a) => a !== m.accent)[(out.length - 1) % 6], items: [] }; out.push(g); } g.items.push(f); }
  return out;
}
/** Where “See everything” goes in the Advanced menu. */
export const ADV_KEY: Record<string, string> = { gurudeva: "gurudeva", listen: "teachings", read: "teachings", about: "about" };
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
    listen: [T("Hear & watch", listenTeach), T("On YouTube", yt)],
    // Tattva is one card only; its topics open on the Tattva page.
    read: [...teach.filter((g) => g.title !== "Hear & watch"), T("Other languages", top("translations", "Translations"))],
    about: [...G("about"), ...G("resources").map((g) => T(g.title, g.links.filter((l) => !yt.includes(l))))],
  };
  return SIMPLE_DEFAULTS.map((d) => {
    const c = cfg?.[d.key] || {};
    const iconOf = (href: string) => GROUPS[d.key].flatMap((g) => g.links).find((a) => a.href === href)?.icon;
    const feat = (c.featured?.length ? c.featured : d.featured).filter((f) => f.href && f.label);
    const featured: SimpleLink[] = feat.map((f) => { const ic = pick(f.icon, iconOf(f.href) ?? (f.href === "/tattva" ? Network : f.href === "/translations" ? Languages : LayoutGrid)); return { href: f.href, label: f.label, note: f.note || undefined, group: f.group || undefined, ...ic, pos: ic.img ? POS[ic.img] : undefined }; });
    const fh = new Set(featured.map((f) => f.href)); const seen = new Set<string>(fh);
    const groups: SimpleGroup[] = GROUPS[d.key].map((g) => ({ title: g.title, links: g.links.filter((l) => !seen.has(l.href) && seen.add(l.href)).map((l) => ({ href: l.href, label: l.label, icon: l.icon })) })).filter((g) => g.links.length);
    const href = d.key === "gurudeva" ? m("gurudeva")?.href || "/gurudeva" : d.key === "about" ? "/about" : "/teachings";
    // Tabs: the groups chosen in the dashboard, with every other page of the full menu added to the group it belongs with — so Simple has everything, a little at a time.
    const tabs: SimpleTab[] = [];
    const tabOf = (t: string) => { let x = tabs.find((y) => y.title === t); if (!x) { x = { title: t, acc: tabs.length === 0 ? d.accent : GROUP_ACC.filter((a) => a !== d.accent)[(tabs.length - 1) % 6], items: [], icon: TAB_ICON[t] || Sparkles }; tabs.push(x); } return x; };
    featured.forEach((f) => tabOf(f.group || d.label).items.push(f));
    for (const g of GROUPS[d.key]) for (const l of g.links) {
      if (fh.has(l.href)) continue; fh.add(l.href);
      const mates = new Set(g.links.map((x) => x.href)); let best: SimpleTab | null = null; let n = 0;
      for (const t of tabs) { const k = t.items.filter((i) => mates.has(i.href)).length; if (k > n) { n = k; best = t; } }
      (best || tabOf(g.title)).items.push({ href: l.href, label: l.label, note: l.desc ? l.desc.split(" · ")[0] : undefined, icon: l.icon });
    }
    // A group shows the photo of its first page when there is one (e.g. His life → Śrīla Gurudeva's portrait).
    for (const t of tabs) { const ph = t.items.find((x) => x.img); if (ph && t.items[0] === ph) { t.img = ph.img; t.pos = ph.pos; } }
    return { key: d.key, label: c.label || d.label, intro: c.intro || d.intro, href, accent: d.accent, ...pick(c.icon || d.icon, FALLBACK[d.key]), featured, groups, all: groups.flatMap((g) => g.links), tabs };
  });
}
