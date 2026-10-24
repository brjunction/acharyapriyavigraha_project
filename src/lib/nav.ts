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
        l("/gurudeva/who-is-srila-gurudeva", "Who is Śrīla Gurudeva", "Krishna sent him · a brief life story", UserRound),
        l("/gurudeva/life-description", "Life Description", "Gopāl Jiu: the beloved Deity of Śrīla Gurudeva", BookMarked),
        l("/gurudeva/carita", "The Carita", "Verse biography, Odia and English", Feather),
        l("/gurudeva/official-biography", "Kṛṣṇāliṅgita Vigraha", "The official biography series", ScrollText, true),
        l("/gurudeva/timeline", "Life timeline", "His life, year by year", Clock),
        l("/gurudeva/on-this-day", "This day in his life", "Lectures, letters and photos for each date", CalendarDays),
        l("/gurudeva/disappearance-pastimes", "Disappearance pastimes", "Accounts of his departure, 1996", Sunset),
      ]),
      g("Diaries", [
        l("/gurudeva/diaries", "Daily Diary", "A short every day, from Śrīla Haladhara Swāmī Guru Mahārāja", PlayCircle),
        l("/gurudeva/gopal-jiu-diary", "Gopāl Jiu Diary", "Entries connected with Śrī Śrī Rādhā-Gopāl Jiu", NotebookPen, true),
        l("/gurudeva/other-diaries", "Other diaries", "Travel and festival diaries", Notebook, true),
      ]),
      g("Lineage & disciples", [
        l("/gurudeva/srila-prabhupada", "Śrīla Prabhupāda", "His beloved spiritual master", Crown),
        l("/gurudeva/guru-parampara", "Guru-paramparā", "The disciplic succession", GitBranch),
        l("/gurudeva/letters", "Letters", "With Śrīla Prabhupāda, disciples and others", Mail),
        l("/gurudeva/disciples", "Disciple database", "Every initiated disciple, searchable", IdCard),
        l("/gurudeva/disciple-biographies", "Disciple biographies", "Life stories of his disciples", Users),
        l("/gurudeva/in-memoriam", "In memoriam", "His departed disciples", Heart),
        l("/gurudeva/with-other-sadhus", "With other sādhus", "ISKCON sādhus and mahātmās", Handshake),
      ]),
      g("Projects & remembrance", [
        l("/gurudeva/iskcon-bhubaneswar", "ISKCON Bhubaneswar", "From a mud hut to Śrī Śrī Kṛṣṇa-Balarāma", Landmark),
        l("/gurudeva/radha-gopal-jiu", "Śrī Śrī Rādhā-Gopāl Jiu", "His beloved Deity, Gaḍeigiri", Sparkles),
        l("/gurudeva/temples", "Temples he established", "Seven temples and āśramas, on a map", Building2),
        l("/gurudeva/pattamundai", "Pattamundai Gośālā", "Śrī Śrī Rādhā-Gopāljiu Gośālā", Home),
        l("/gurudeva/janmasthan", "Janmasthān, Purī", "Preserving his birthplace", Star),
        l("/gurudeva/gallery", "Gallery", "Portraits, deities, festivals, travels", Image),
        l("/gurudeva/memories", "Memories", "Disciples remembering him", HandHeart),
        l("/gurudeva/glorifications", "Glorifications", "Vyāsa-pūjā offerings and poems", Gift),
        l("/gurudeva/personal-belongings", "Personal belongings", "Items he used, and their stories", Package, true),
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
        l("/teachings/books", "Books", "Gopal Jiu, Tattva Vicāra and Taptajīvanam publications", BookOpen),
        l("/teachings/transcriptions", "Transcriptions", "Lectures as text, synced with audio", FileText),
        l("/gurudeva/letters", "Letters", "His correspondence", Mail),
        l("/teachings/gopal-jiu-magazine", "Gopāl Jiu magazine", "Issues to read, and subscription", Newspaper),
        l("/teachings/odia-literature", "Odia Vaiṣṇava literature", "Biographies of Śrī Caitanya, translated", Languages, true),
      ]),
      g("Compilations", [
        l("/teachings/quotes", "Quotes", "By subject, with source", Quote),
        l("/teachings/nectar-drops", "Nectar drops", "A short gem for every day", Droplet, true),
        l("/teachings/analogies", "Analogies", "“When the sun rises, the lotus blossoms…”", Lightbulb),
        l("/teachings/stories", "Stories & anecdotes", "Stories he told", BookHeart),
        l("/teachings/questions-and-answers", "Questions & answers", "Every question, with his answer", MessageCircleQuestion),
        l("/teachings/instructions", "Instructions", "Guidance for sādhana and life", ListChecks),
        l("/teachings/prayers", "Prayers & songs", "Aṣṭakam, paramparā and more", Music),
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
        l("/tattva/obstacles", "Obstacles on the path", "Anarthas, aparādha, envy, pride", Lightbulb),
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
    intro: "Downloads, the mobile app, and good places elsewhere to read and learn.",
    groups: [
      g("Downloads", [
        l("/resources/mobile-app", "Mobile app", "Taptajīvanam on your phone, for Android and iOS", Smartphone, true),
        l("/teachings/books", "Books", "Publications on his teachings and pastimes", BookOpen),
        l("/resources/wallpapers", "Photos & wallpapers", "Portraits and artwork for your screen", ImageDl, true),
        l("/resources/quote-cards", "Quote cards", "Shareable cards, each with its source", Quote, true),
      ]),
      g("Read the books", [
        l("https://vedabase.io", "Śrīla Prabhupāda's books", "Bhagavad-gītā, Śrīmad-Bhāgavatam and more, on Vedabase", BookMarked),
        l("/resources/acarya-scriptures", "Other ācārya scriptures", "Works of the previous ācāryas, with a link to the full library", ScrollText, true),
      ]),
      g("Learn", [
        l("/resources/sanskrit-grammar", "Sanskrit grammar", "Hari-nāmāmṛta-vyākaraṇa and Sanskrit courses", GraduationCap, true),
        l("/resources/courses", "More courses", "Courses to understand the teachings and the books", Library, true),
      ]),
      g("Elsewhere online", [
        l("https://www.youtube.com/@HaladharaSwami", "Śrīla Haladhara Swāmī Guru Mahārāja", "His YouTube channel", Youtube),
        l("https://www.iskconpattamundai.in", "ISKCON Pattamundai", "The temple and its programs", Landmark),
        l("/resources/websites", "More websites", "Other places where his teachings are found", Globe, true),
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
    intro: "The archive, the ācāryas, the scriptures and how to reach us.",
    feature: { title: "About the archive", text: "Why and how this archive exists.", image: "/photos/menu-marigold.webp", href: "/about", cta: "About overview" },
    groups: [
      g("Taptajīvanam", [
        l("/about", "About the archive", "Why and how this archive exists", Archive),
        l("/about/mission", "Mission & principles", "How content is chosen and cared for", Compass),
        l("/about/founder", "Śrīla Haladhara Swāmī Guru Mahārāja", "Founder of Taptajīvanam", UserRound),
        l("/about/team", "Team & contributors", "Editors, translators, developers", Users),
        l("/thank-list", "Our Thank List", "Everyone who built this archive", HeartHandshake),
        l("/about/news", "News & updates", "What's new on the site", Megaphone),
      ]),
      g("Ācāryas & paramparā", [
        l("/about/acaryas", "Ācāryas", "The Gauḍīya Vaiṣṇava succession", GitBranch),
        l("/about/acarya-biographies", "Ācārya biographies", "Life stories of the ācāryas", BookMarked),
        l("/about/acarya-teachings", "Ācārya teachings", "Selected teachings, with sources", ScrollText),
        l("/gurudeva/srila-prabhupada", "Śrīla Prabhupāda", "Founder-ācārya of ISKCON", Crown),
        l("/about/bhaktisiddhanta", "Śrīla Bhaktisiddhānta Sarasvatī", "Śrīla Prabhupāda's spiritual master", Sunrise),
        l("/about/bhaktivinoda", "Śrīla Bhaktivinoda Ṭhākura", "The seventh Gosvāmī", Feather),
        l("/about/six-gosvamis", "The Six Gosvāmīs", "Of Vṛndāvana", Landmark),
        l("/about/mahaprabhu", "Śrī Caitanya Mahāprabhu", "And His associates", Flower2),
      ]),
      g("Scriptures & references", [
        l("/about/bhagavad-gita", "Bhagavad-gītā", "Verse index and lectures", BookOpen),
        l("/about/srimad-bhagavatam", "Śrīmad-Bhāgavatam", "Canto by canto", Library),
        l("/about/caitanya-caritamrta", "Caitanya-caritāmṛta", "Ādi, Madhya, Antya", ScrollText),
        l("/tattva/index/glossary", "Glossary", "Sanskrit and Odia terms", BookA, true),
        l("/about/diacritics", "Spelling & diacritics", "How names and verses are written (IAST)", Type),
      ]),
      g("Partners & support", [
        l("/about/publishers", "Publishers", "The three publishers of his books", Newspaper),
        l("/about/related-websites", "Related websites", "gourgovindaswami.org, Vanipedia and more", Globe),
        l("/about/support", "Support the archive", "Sevā, sponsorship, contributions", HandHeart),
        l("/about/locations", "Our locations", "Pattamundai and Bhubaneswar", Map),
      ]),
      g("Connect", [
        l("/about/contact", "Contact", "taptajivanam@gmail.com · +91 96687 21555", Phone),
        l("/about/subscribe", "Subscribe to Gopāl Jiu magazine", "Receive the magazine", Mail),
        l("/about/suggest-correction", "Suggest a correction", "Found a mistake? Tell us", MessageCircleQuestion),
      ]),
      g("Help & policies", [
        l("/about/how-to-search", "How to search", "Verses, places, years, spellings", Search),
        l("/about/privacy", "Privacy & terms", "How we handle data and content", ShieldCheck),
        l("/about/accessibility", "Accessibility", "Reading, fonts, screen readers", Accessibility),
        l("/about/sitemap", "Sitemap", "Every page in one list", ListTree),
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
