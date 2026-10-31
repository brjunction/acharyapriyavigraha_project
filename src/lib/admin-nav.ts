import { Headphones, Music, Clapperboard, Quote, BookOpen, FileText, Newspaper, Languages, BookMarked, CalendarDays, NotebookPen, History, HandHeart, Gift, Image, MapPin, Package, Mail, IdCard, Landmark, GitBranch, Crown, ToggleRight, PanelsTopLeft, Megaphone, Images, Users, Settings, Lotus, Network, type LucideIcon } from "./admin-icons";

export type AdminLink = { href: string; label: string; icon: LucideIcon; desc: string };
export type AdminGroup = { key: string; label: string; desc: string; color: string; icon: LucideIcon; links: AdminLink[] };

/** The Studio, organised like the website. Used by the sidebar and the dashboard home. */
export const ADMIN_GROUPS: AdminGroup[] = [
  { key: "gurudeva", icon: Lotus, label: "Śrīla Gurudeva", desc: "His life, remembrance, lineage and projects", color: "#b3261e", links: [
    { href: "/admin/timeline", label: "Life timeline", icon: History, desc: "Chapters and moments of his life" },
    { href: "/admin/diary", label: "His Diary", icon: NotebookPen, desc: "Prayers to Śrī Gopāl Jiu, page by page" },
    { href: "/admin/archive/memories", label: "Memories & pastimes", icon: HandHeart, desc: "Who remembers him, and what" },
    { href: "/admin/archive/glorifications", label: "Glorifications", icon: Gift, desc: "Vyāsa-pūjā offerings and poems" },
    { href: "/admin/archive/gallery", label: "Gallery", icon: Image, desc: "Photo albums by occasion" },
    { href: "/admin/archive/places", label: "Places of remembrance", icon: MapPin, desc: "Where he lived, served and preached" },
    { href: "/admin/archive/belongings", label: "Personal belongings", icon: Package, desc: "Items he used, and their stories" },
    { href: "/admin/archive/letters", label: "Letters", icon: Mail, desc: "With Śrīla Prabhupāda, disciples and others" },
    { href: "/admin/archive/disciples", label: "Disciples", icon: IdCard, desc: "Biographies and their memories" },
    { href: "/admin/archive/projects", label: "Projects", icon: Landmark, desc: "Bhubaneswar, temples, initiatives" },
    { href: "/admin/archive/parampara", label: "Guru-paramparā", icon: GitBranch, desc: "The ācāryas of the succession" },
    { href: "/admin/archive/prabhupada", label: "Śrīla Prabhupāda", icon: Crown, desc: "Links and resources" },
  ] },
  { key: "teachings", icon: BookOpen, label: "His Teachings", desc: "Audio, video, books and writings", color: "#1a73e8", links: [
    { href: "/admin/audio", label: "Audio lectures", icon: Headphones, desc: "Lectures with transcriptions" },
    { href: "/admin/kirtans", label: "Kīrtanas & bhajanas", icon: Music, desc: "Songs he sang" },
    { href: "/admin/videos", label: "Videos", icon: Clapperboard, desc: "YouTube videos" },
    { href: "/admin/books", label: "Books", icon: BookOpen, desc: "Books to read online" },
    { href: "/admin/articles", label: "Articles", icon: FileText, desc: "Essays and compilations" },
    { href: "/admin/magazines", label: "Magazines", icon: Newspaper, desc: "Gopāl Jiu magazine and others" },
    { href: "/admin/compilations", label: "Compilations", icon: Quote, desc: "Quotes, stories, analogies…" },
    { href: "/admin/topics", label: "Tattva topics", icon: Network, desc: "Subjects that link everything together" },
  ] },
  { key: "webfolio", icon: BookMarked, label: "WebFolio", desc: "The whole archive as one book, and the pages you write for it", color: "#137333", links: [
    { href: "/admin/webfolio", label: "Sections & order", icon: BookMarked, desc: "What the WebFolio contains, and in which order" },
    { href: "/admin/pages", label: "WebFolio pages", icon: ToggleRight, desc: "Your own pages, written like documents" },
  ] },
  { key: "resources", icon: CalendarDays, label: "Resources", desc: "Calendar and translations", color: "#b06000", links: [
    { href: "/admin/calendar", label: "Taptajīvanam Calendar", icon: CalendarDays, desc: "Festivals and fasting days" },
    { href: "/admin/translations", label: "Translations", icon: Languages, desc: "Other languages" },
  ] },
  { key: "website", icon: PanelsTopLeft, label: "Website", desc: "Menus, announcements and pictures", color: "#7627bb", links: [
    { href: "/admin/menus", label: "Menus", icon: PanelsTopLeft, desc: "The top menus" },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone, desc: "Messages on top of the site" },
    { href: "/admin/media", label: "Pictures & files", icon: Images, desc: "Everything uploaded" },
  ] },
  { key: "settings", icon: Settings, label: "Settings", desc: "People and site settings", color: "#5f6368", links: [
    { href: "/admin/users", label: "People & roles", icon: Users, desc: "Who can edit" },
    { href: "/admin/settings", label: "Site settings", icon: Settings, desc: "Name, contact, footer" },
  ] },
];
export const groupOf = (path: string) => ADMIN_GROUPS.find((g) => g.links.some((l) => path === l.href || path.startsWith(l.href + "/")))?.key;
export { Lotus };
