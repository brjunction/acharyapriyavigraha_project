/* Website menus that editors can change in the Studio. Icons are stored by name. */
import type { LucideIcon } from "lucide-react";
import { UserRound,BookMarked,Feather,ScrollText,Clock,CalendarDays,Flower2,PlayCircle,NotebookPen,Notebook,Crown,GitBranch,Mail,Handshake,Users,IdCard,Sunset,Landmark,Sparkles,Building2,Home,Star,Image,Heart,Gift,Package,Headphones,Clapperboard,Music,BookOpen,FileText,Newspaper,Languages,Quote,Droplet,Lightbulb,BookHeart,MessageCircleQuestion,ListChecks,HandHeart,Library,Network,BookA,MapPin,CalendarRange,Users2,ArrowDownAZ,Info,HeartHandshake,MessageCircle,Phone,Globe,Archive,Megaphone,Map,Compass,Sunrise,Search,ShieldCheck,Accessibility,ListTree,Type,Download,Smartphone,GraduationCap,ExternalLink,Youtube, Video, Mic, Radio, Calendar, Bell, Book, Layers, Flame, Leaf, Sun, Moon, Tv, Camera, PenLine, Bookmark, Folder } from "lucide-react";
import { Lotus } from "@/components/lotus-icon";
import { MENUS, type NavMenu } from "./nav";

export const ICONS: Record<string, LucideIcon> = { Lotus: Lotus as unknown as LucideIcon, UserRound,BookMarked,Feather,ScrollText,Clock,CalendarDays,Flower2,PlayCircle,NotebookPen,Notebook,Crown,GitBranch,Mail,Handshake,Users,IdCard,Sunset,Landmark,Sparkles,Building2,Home,Star,Image,Heart,Gift,Package,Headphones,Clapperboard,Music,BookOpen,FileText,Newspaper,Languages,Quote,Droplet,Lightbulb,BookHeart,MessageCircleQuestion,ListChecks,HandHeart,Library,Network,BookA,MapPin,CalendarRange,Users2,ArrowDownAZ,Info,HeartHandshake,MessageCircle,Phone,Globe,Archive,Megaphone,Map,Compass,Sunrise,Search,ShieldCheck,Accessibility,ListTree,Type,Download,Smartphone,GraduationCap,ExternalLink,Youtube, Video, Mic, Radio, Calendar, Bell, Book, Layers, Flame, Leaf, Sun, Moon, Tv, Camera, PenLine, Bookmark, Folder };
const nameOf = (c: unknown) => Object.entries(ICONS).find(([, v]) => v === c)?.[0] || "FileText";

export type MenuLinkJ = { href: string; label: string; desc: string; icon: string; soon?: boolean; hidden?: boolean };
export type MenuJ = { key: string; label: string; href: string; icon: string; intro: string; allLabel?: string; hidden?: boolean; groups: { title: string; links: MenuLinkJ[] }[] };

/** Menus that are generated (languages) are not edited here. */
export const EDITABLE = (m: NavMenu) => m.key !== "translations";

export function toJson(menus: NavMenu[] = MENUS): MenuJ[] {
  return menus.filter(EDITABLE).map((m) => ({ key: m.key, label: m.label, href: m.href, icon: nameOf(m.icon), intro: m.intro, allLabel: m.allLabel,
    groups: m.groups.map((g) => ({ title: g.title, links: g.links.map((l) => ({ href: l.href, label: l.label, desc: l.desc, icon: nameOf(l.icon), soon: l.soon })) })) }));
}

/** Applies saved menus over the built-in ones, keeping layout options and generated menus. */
export function hydrate(saved: MenuJ[] | null | undefined): NavMenu[] {
  if (!saved?.length) return MENUS;
  return MENUS.flatMap((base) => {
    if (!EDITABLE(base)) return [base];
    const s = saved.find((x) => x.key === base.key); if (!s) return [base];
    if (s.hidden) return [];
    return [{ ...base, label: s.label || base.label, href: s.href || base.href, icon: ICONS[s.icon] || base.icon, intro: s.intro ?? base.intro, allLabel: s.allLabel || base.allLabel,
      groups: s.groups.map((g) => ({ title: g.title, links: g.links.filter((l) => !l.hidden).map((l) => ({ href: l.href, label: l.label, desc: l.desc, icon: ICONS[l.icon] || ICONS.FileText, soon: l.soon })) })) }];
  });
}
