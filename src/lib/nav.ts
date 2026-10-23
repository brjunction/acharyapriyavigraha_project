import type { LucideIcon } from "lucide-react";
import {
  UserRound, BookMarked, Feather, ScrollText, Clock, CalendarDays, Flower2, PlayCircle, NotebookPen, Notebook, Crown, GitBranch, Mail,
  Handshake, Users, IdCard, Sunset, Landmark, Sparkles, Building2, Home, Star, Image, Heart, Gift, Package, Headphones, Clapperboard,
  Music, BookOpen, FileText, Newspaper, Languages, Quote, Droplet, Lightbulb, BookHeart, MessageCircleQuestion, ListChecks, HandHeart,
  Library, Network, BookA, MapPin, CalendarRange, Users2, ArrowDownAZ, Info, HeartHandshake, MessageCircle, Phone, Globe, Archive, Megaphone,
  Map,
} from "lucide-react";

export type NavLink = { href: string; label: string; desc: string; icon: LucideIcon; soon?: boolean; chips?: { href: string; label: string }[] };
export type NavGroup = { title: string; links: NavLink[] };
export type NavMenu = {
  key: string; label: string; href: string; icon: LucideIcon; intro: string; groups: NavGroup[]; layout?: "columns" | "tiles"; allLabel?: string;
  feature?: { title: string; text: string; image?: string; href: string; cta: string };
};


const g = (title: string, links: NavLink[]): NavGroup => ({ title, links });
const l = (href: string, label: string, desc: string, icon: LucideIcon, soon?: boolean): NavLink => ({ href, label, desc, icon, soon });

export const MENUS: NavMenu[] = [
  {
    key: "gurudeva", label: "Śrīla Gurudeva", href: "/gurudeva", icon: Flower2, allLabel: "Overview",
    intro: "His life, his diaries, his lineage, his disciples and his mission.",
    feature: { title: "Śrī Śrīmad Gour Govinda Swāmī", text: "A dear disciple of Śrīla Prabhupāda, born in 1929 near Purī into a family devoted to Śrī Gopāl Jiu.", image: "/legacy/gurudeva-portrait.jpg", href: "/gurudeva", cta: "Overview" },
    groups: [
      g("His life", [
        l("/gurudeva/who-is-srila-gurudeva", "Who is Śrīla Gurudeva", "Krishna sent him · a brief life story", UserRound),
        l("/gurudeva/life-description", "Life Description", "Gopāl Jiu: the beloved Deity of Śrīla Gurudeva", BookMarked),
        l("/gurudeva/carita", "The Carita", "Verse biography, Odia and English", Feather),
        l("/gurudeva/official-biography", "Kṛṣṇāliṅgita Vigraha", "The official biography series", ScrollText, true),
        l("/gurudeva/timeline", "Life timeline", "1929 to 1996, year by year", Clock),
        l("/gurudeva/on-this-day", "This day in his life", "Lectures, letters and photos for each date", CalendarDays),
        l("/gurudeva/disappearance-pastimes", "Disappearance pastimes", "Accounts of his departure, 1996", Sunset),
      ]),
      g("Diaries", [
        l("/gurudeva/diaries", "Daily Diary", "A short every day, from HH Haladhara Swāmī Mahārāja", PlayCircle),
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
    feature: { title: "1,595 lectures", text: "Recorded between 1985 and 1996, remastered, with transcriptions in progress.", href: "/teachings/audio", cta: "Browse lectures" },
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
        l("/teachings/ananda-sambada", "Ānanda Sambāda & articles", "Newsletter archive since 1991", Newspaper),
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
    key: "tattva", label: "Tattva-kośa", href: "/tattva", icon: Network, allLabel: "All topics",
    intro: "The treasury of truths: everything he said, gathered by subject.",
    feature: { title: "Start with a topic", text: "Each topic collects quotes, lecture moments, chapters, stories and verses in one place.", href: "/tattva", cta: "Open Tattva-kośa" },
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
    key: "translations", label: "Translations", href: "/translations", icon: Languages, layout: "tiles", allLabel: "All languages",
    intro: "Each language has its own complete site.",
    groups: [
      g("Languages", [
        { href: "/hi", label: "हिन्दी · Hindi", desc: "Lectures, quotes and books in Hindi.", icon: Globe, chips: [{ href: "/hi", label: "Home" }, { href: "/hi/lectures", label: "Lectures" }, { href: "/hi/quotes", label: "Quotes" }] },
        { href: "/or", label: "ଓଡ଼ିଆ · Odia", desc: "Śrīla Gurudeva's own mother tongue.", icon: Globe, chips: [{ href: "/or", label: "Home" }, { href: "/or/lectures", label: "Lectures" }, { href: "/or/quotes", label: "Quotes" }] },
        { href: "/id", label: "Bahasa Indonesia", desc: "For devotees in Bali and Indonesia.", icon: Globe, chips: [{ href: "/id", label: "Home" }, { href: "/id/quotes", label: "Quotes" }] },
        { href: "/nl", label: "Nederlands · Dutch", desc: "For devotees in the Netherlands and Belgium.", icon: Globe, chips: [{ href: "/nl", label: "Home" }, { href: "/nl/quotes", label: "Quotes" }] },
        { href: "/ru", label: "Русский · Russian", desc: "For Russian-speaking devotees.", icon: Globe, chips: [{ href: "/ru", label: "Home" }, { href: "/ru/quotes", label: "Quotes" }] },
        { href: "/translations", label: "More languages", desc: "Bengali, Spanish and others in progress. Help translate.", icon: Languages, chips: [{ href: "/bn", label: "বাংলা" }, { href: "/es", label: "Español" }, { href: "/translations", label: "Help translate" }] },
      ]),
    ],
  },
  {
    key: "about", label: "About", href: "/about", icon: Info, layout: "tiles",
    intro: "About Taptajīvanam, the people behind it and how to reach us.",
    groups: [
      g("Taptajīvanam", [
        l("/about", "About the archive", "Why and how this archive exists", Archive),
        l("/about/founder", "HH Haladhara Swāmī Mahārāja", "Founder of Taptajīvanam", UserRound),
        l("/thank-list", "Our Thank List", "Everyone who built this archive", HeartHandshake),
        l("/about/news", "News & updates", "What's new on the site", Megaphone),
      ]),
      g("Connect", [
        l("/about/contact", "Contact", "taptajivanam@gmail.com · +91 96687 21555", Phone),
        l("/about/newsletter", "Ānanda Sambāda newsletter", "Subscribe to the newsletter", Mail),
        l("/about/whatsapp", "Daily quotes on WhatsApp", "Vāṇīsaṅga group", MessageCircle),
        l("/about/locations", "Our locations", "Pattamundai and Bhubaneswar", Map),
      ]),
    ],
  },
];

export function findLink(href: string): { menu: NavMenu; group: NavGroup; link: NavLink } | null {
  for (const menu of MENUS) for (const group of menu.groups) for (const link of group.links) if (link.href === href) return { menu, group, link };
  return null;
}
