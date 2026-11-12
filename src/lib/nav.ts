import { Lotus } from "@/components/lotus-icon";
import type { LucideIcon } from "lucide-react";
import {
  UserRound, BookMarked, Feather, ScrollText, Clock, CalendarDays, Flower2, PlayCircle, NotebookPen, Notebook, Crown, GitBranch, Mail,
  Handshake, Users, IdCard, Sunset, Landmark, Sparkles, Building2, Home, Star, Image, Heart, Gift, Package, Headphones, Clapperboard,
  Music, BookOpen, FileText, Newspaper, Languages, Quote, Droplet, Lightbulb, BookHeart, MessageCircleQuestion, ListChecks, HandHeart,
  Library, Network, BookA, MapPin, CalendarRange, Users2, ArrowDownAZ, Info, HeartHandshake, MessageCircle, Phone, Globe, Archive, Megaphone,
  Map, Compass, Sunrise, Search, ShieldCheck, Accessibility, ListTree, Type, Download, Smartphone, GraduationCap, ExternalLink, Youtube, Image as ImageDl,
} from "lucide-react";
import { ALL_LANGUAGES, REGIONS, STATUS_LABEL } from "./languages";

export type NavLink = { href: string; label: string; desc: string; icon: LucideIcon; soon?: boolean; chips?: { href: string; label: string }[] };
export type NavGroup = { title: string; links: NavLink[] };
export type NavMenu = {
  key: string; label: string; href: string; icon: LucideIcon; intro: string; groups: NavGroup[]; layout?: "columns" | "tiles" | "flyout"; dense?: boolean; searchAll?: boolean; allLabel?: string;
  feature?: { title: string; text: string; image?: string; href: string; cta: string };
};


const g = (title: string, links: NavLink[]): NavGroup => ({ title, links });
const l = (href: string, label: string, desc: string, icon: LucideIcon, soon?: boolean): NavLink => ({ href, label, desc, icon, soon });

export const MENUS: NavMenu[] = [
  {
    key: "gurudeva", label: "Śrīla Gurudeva", href: "/gurudeva", icon: Lotus as unknown as LucideIcon, allLabel: "Overview",
    intro: "His life, his diaries, his lineage, his disciples and his mission.",
    feature: { title: "Śrī Śrīmad Gour Govinda Swāmī Gurudeva", text: "A dear disciple of Śrīla Prabhupāda, born in 1929 near Purī into a family devoted to Śrī Gopāl Jiu.", image: "/photos/menu-garland.webp", href: "/gurudeva", cta: "Overview" },
    groups: [
      g("His life", [
        l("/gurudeva/who-is-srila-gurudeva", "Who is Śrīla Gurudeva?", "His biographies", UserRound),
        l("/gurudeva/radha-gopal-jiu", "His beloved Deity", "Śrī Śrī Rādhā-Gopāl Jiu", Sparkles),
        l("/gurudeva/timeline", "Life timeline", "His life, year by year", Clock),
        l("/gurudeva/diaries", "His diary", "His prayers to Śrī Gopāl Jiu", NotebookPen),
        l("/gurudeva/memories", "Memories & pastimes", "Disciples remembering him", HandHeart),
        l("/gurudeva/glorifications", "Glorifications", "Vyāsa-pūjā offerings and poems", Gift),
      ]),
      g("Remembrance", [
        l("/gurudeva/gallery", "Gallery", "Portraits, deities, festivals, travels", Image),
        l("/gurudeva/places-of-remembrance", "Smṛti Bhavan", "Everything related to Śrīla Gurudeva", Landmark),
        l("/gurudeva/personal-belongings", "Personal belongings", "Items he used, and their stories", Package),
      ]),
      g("Lineage & disciples", [
        l("/gurudeva/srila-prabhupada", "Śrīla Prabhupāda", "His beloved spiritual master", Crown),
        l("/gurudeva/letters", "Letters", "With Śrīla Prabhupāda, disciples and others", Mail),
        l("/gurudeva/disciples", "His disciples", "Every initiated disciple, searchable", IdCard),
      ]),
      g("Projects", [
        l("/gurudeva/iskcon-bhubaneswar", "ISKCON Bhubaneswar", "From a mud hut to Śrī Śrī Kṛṣṇa-Balarāma", Landmark),
        l("/gurudeva/temples", "Subsidiary temples & initiatives", "Temples and āśramas he established", Building2),
        l("/gurudeva/projects-in-his-relation", "Projects in his relation", "Work connected with him", Handshake),
        l("/gurudeva/taptajivanam-projects", "Taptajīvanam projects", "The archive and its services", Library),
      ]),
    ],
  },
  {
    key: "teachings", label: "His Teachings", href: "/teachings", icon: BookOpen, allLabel: "All teachings",
    intro: "Hear, read and remember. Every excerpt linked to its exact source.",
    feature: { title: "1,595 lectures", text: "Recorded between 1985 and 1996, remastered, with transcriptions in progress.", image: "/photos/menu-library.webp", href: "/teachings/audio", cta: "Browse lectures" },
    groups: [
      g("Hear & watch", [
        l("/teachings/audio", "Audio lectures", "Filter by year, place, verse and topic", Headphones),
        l("/teachings/videos", "Videos", "Lectures on video and excerpts", Clapperboard),
        l("/teachings/kirtans", "Kīrtanas & bhajanas", "Songs he sang and led", Music, true),
      ]),
      g("Read", [
        l("/teachings/books", "Books", "Publications on his teachings and pastimes", BookOpen),
        l("/teachings/magazines", "Magazines", "Gopāl Jiu magazine and more", Newspaper),
        l("/teachings/articles", "Articles", "Essays by author and series", FileText),
      ]),
      g("Compilations", [
        l("/teachings/desires", "Desires", "His heart’s wishes", Heart, true),
        l("/teachings/instructions", "Instructions", "Guidance for sādhana and life", ListChecks),
        l("/teachings/quotes", "Quotes", "By subject, with source", Quote),
        l("/teachings/verses", "Verses", "Verses he loved to quote", ScrollText, true),
        l("/teachings/nectar-drops", "Nectar drops", "A short gem for every day", Droplet, true),
        l("/teachings/stories", "Stories & anecdotes", "Stories he told", BookHeart),
      ]),
    ],
  },
  {
    key: "tattva", label: "Tattva", href: "/tattva", icon: Network, allLabel: "All topics",
    intro: "The treasury of truths: everything he said, gathered by subject.",
    feature: { title: "Start with a topic", text: "Each topic collects quotes, lecture moments, chapters, stories and verses in one place.", image: "/photos/menu-seated-1.webp", href: "/tattva", cta: "Open Tattva" },
    groups: [
      g("Subjects", [
        l("/tattva/guru-tattva", "Guru-tattva", "Guru, disciple, sādhu-saṅga, paramparā", Network),
        l("/tattva/bhakti", "Bhakti", "Hearing, the Holy Name, sevā, prema, separation", Flower2),
        l("/tattva/krsna-tattva", "Kṛṣṇa-tattva", "His pastimes, mercy and love", Sparkles),
        l("/tattva/gaura-tattva", "Gaura-tattva", "Mahāprabhu's advent, mood and teachings", Sunset),
        l("/tattva/jiva-tattva", "Jīva-tattva", "Soul, Supersoul, karma, death", UserRound),
        l("/tattva/obstacles-on-the-path", "Obstacles on the path", "Anarthas, aparādha, envy, pride", Lightbulb),
      ]),
      g("Indexes", [
        l("/tattva/index/verses", "Verse index", "BG · SB · CC: every lecture, verse by verse", ScrollText),
        l("/tattva/index/people", "People", "Personalities he spoke about", Users2),
        l("/tattva/index/places", "Places", "Holy places and where he spoke", MapPin),
        l("/tattva/index/years", "Years", "1985 to 1996", CalendarRange),
        l("/tattva/index/glossary", "Glossary", "Sanskrit and Odia terms", BookA, true),
        l("/tattva/index/a-z", "A–Z", "Everything, alphabetically", ArrowDownAZ),
      ]),
    ],
  },
  {
    key: "resources", label: "Resources", href: "/resources", icon: Download, allLabel: "All resources",
    intro: "Tools, downloads, news and updates.",
    groups: [
      g("Tools", [
        l("/resources/script-converter", "Script converter", "IAST, Devanāgarī, Bengali, Odia and the Balaram font", Languages),
        l("/resources/vaishnava-calendar", "Gurudeva calendar", "Festivals and fasting days", CalendarDays),
        l("/webfolio", "WebFolio", "The whole archive as one searchable document", BookOpen),
        l("https://www.harinamamrta-vyakaranam.com", "Gauḍīya glossary", "Harināmāmṛta-vyākaraṇam", BookA),
        l("https://www.harinamamrta-vyakaranam.com/tools/dictionary/search", "Sanskrit dictionary", "Harināmāmṛta-vyākaraṇam", GraduationCap),
      ]),
      g("Downloads", [
        l("/resources/windows-app", "Windows app", "The WebFolio, installed on your computer", Download),
        l("/resources/mobile-app", "Android / iOS app", "Coming soon — use the WebFolio meanwhile", Smartphone),
      ]),
      g("News & updates", [
        l("/resources/updates", "Taptajīvanam updates", "What’s new on the site", Megaphone),
        l("/resources/announcements", "Announcements", "Notices for everyone", Megaphone),
        l("/resources/programmes", "Programmes & schedules", "Festivals and events", CalendarRange),
        l("/resources/news", "News & information", "From the mission", Info),
      ]),
    ],
  },
  {
    key: "translations", label: "Translations", href: "/translations", icon: Languages, layout: "flyout", dense: true, searchAll: true, allLabel: "All languages",
    intro: "Every language has its own complete site. Pick a region, or search.",
    feature: { title: "Every language", text: "Each language has its own complete site.", image: "/photos/menu-smile.webp", href: "/translations", cta: "All languages" },
    groups: REGIONS.filter((r) => ALL_LANGUAGES.some((x) => x.region === r.key && x.code !== "en")).map((r) => g(r.title, ALL_LANGUAGES.filter((x) => x.region === r.key && x.code !== "en").map((x) => ({
      href: `/${x.code}`, label: x.native, desc: `${x.name} · ${STATUS_LABEL[x.status]}`, icon: Globe, soon: x.status === "planned",
    })))),
  },
  {
    key: "about", label: "About", href: "/about", icon: Info, layout: "flyout", allLabel: "About overview",
    intro: "The archive, its founder and how to reach us.",
    feature: { title: "About the archive", text: "Why and how this archive exists.", image: "/photos/menu-marigold.webp", href: "/about", cta: "About overview" },
    groups: [
      // Kept short on purpose: mission, team, support, corrections and privacy are reached from the About page and the footer.
      g("Taptajīvanam", [
        l("/about", "About this website", "Why and how this archive exists", Archive),
        l("/about/founder", "Śrīla Haladhara Swāmī Guru Mahārāja", "Founder of Taptajīvanam", UserRound),
        l("/thank-list", "Our Thank List", "Everyone who built this archive", HeartHandshake),
      ]),
      g("Connect", [
        l("/about/contact", "Contact", "taptajivanam@gmail.com · +91 96687 21555", Phone),
      ]),
    ],
  },
];

export function findLink(href: string): { menu: NavMenu; group: NavGroup; link: NavLink } | null {
  for (const menu of MENUS) for (const group of menu.groups) for (const link of group.links) if (link.href === href) return { menu, group, link };
  return null;
}

/** Each menu has its own festival colour (see .acc-* in globals.css). */
export const ACCENT: Record<string, "saffron" | "teal" | "indigo" | "rose" | "leaf" | "gold" | "plum"> = {
  gurudeva: "saffron", teachings: "teal", tattva: "indigo", resources: "plum", translations: "rose", about: "leaf",
};
