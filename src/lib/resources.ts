/* The Resources pages: links, apps, updates. Plain data so they are easy to change. */
export type RLink = { title: string; url: string; desc: string; tag?: string; soon?: boolean };
export type RPage = { title: string; intro: string; groups: { title?: string; links: RLink[] }[]; note?: string };

const HNV = "https://www.harinamamrta-vyakaranam.com";
export const SOCIAL: RLink[] = [
  { title: "Taptajīvanam on YouTube", url: "https://www.youtube.com/@taptajivanam", desc: "Lectures, kīrtanas and daily clips of Śrīla Gurudeva", tag: "YouTube" },
  { title: "Taptajīvanam on Instagram", url: "https://www.instagram.com/taptajivanam", desc: "Daily quotes and short clips", tag: "Instagram" },
  { title: "Taptajīvanam on Facebook", url: "https://www.facebook.com/tapta.jivanam", desc: "News, quotes and programmes", tag: "Facebook" },
  { title: "Taptajīvanam WhatsApp group", url: "https://chat.whatsapp.com/I8oPWbXQt9c7mTpken8eF6", desc: "Receive the daily offering on your phone", tag: "WhatsApp" },
  { title: "Śrīla Haladhara Swāmī Guru Mahārāja on YouTube", url: "https://www.youtube.com/results?search_query=Haladhara+Swami", desc: "Classes and kīrtanas of the founder of Taptajīvanam", tag: "YouTube" },
];
export const PUBLICATIONS: RLink[] = [
  { title: "Gopal Jiu Publications", url: "https://gopaljiu.org", desc: "Books, Bindu newsletters and the life of Śrīla Gurudeva", tag: "Publisher" },
  { title: "Gopaljiu Publications news", url: "https://gopaljiunews.blogspot.com", desc: "News and reports from Gopal Jiu Publications", tag: "News" },
  { title: "Tattva Vicāra Publications", url: "https://issuu.com/tvpbooks", desc: "Kṛṣṇāliṅgita Vigraha and other books, to read online", tag: "Publisher" },
];

export const RESOURCES: Record<string, RPage> = {
  "mobile-app": { title: "Android & iOS app", intro: "Taptajīvanam on your phone is being prepared. Meanwhile, the WebFolio installs on any phone and works offline.", groups: [{ links: [
    { title: "Android app", url: "#", desc: "Coming soon", soon: true }, { title: "iPhone & iPad app", url: "#", desc: "Coming soon", soon: true },
    { title: "Install the WebFolio on your phone", url: "/webfolio/download", desc: "Open it, then “Add to Home screen” — it works without internet" },
  ] }] },
  "windows-app": { title: "Windows app", intro: "The Windows app is the WebFolio: the whole archive in one window, searchable and readable without internet.", groups: [{ links: [
    { title: "Download the WebFolio for Windows", url: "/webfolio/download", desc: "Install it from your browser in one click, and keep it offline" },
    { title: "Open the WebFolio in the browser", url: "/webfolio", desc: "Read and search without installing anything" },
  ] }], note: "In Chrome or Edge, open the WebFolio and press the install button in the address bar — it then opens like any other Windows program." },
  "publication-websites": { title: "Publication websites", intro: "Where Śrīla Gurudeva’s books and newsletters are published.", groups: [{ links: PUBLICATIONS }] },
  websites: { title: "More websites", intro: "Good places elsewhere to read and learn.", groups: [
    { title: "Śrīla Prabhupāda", links: [{ title: "Vedabase", url: "https://vedabase.io", desc: "Śrīla Prabhupāda’s books, online", tag: "Books" }, { title: "Prabhupāda Vāṇī", url: "https://prabhupadavani.org", desc: "Lectures, conversations and letters", tag: "Audio" }] },
    { title: "Study", links: [{ title: "Harināmāmṛta-vyākaraṇam", url: HNV, desc: "Śrīla Jīva Gosvāmī’s grammar, scriptures with commentaries, bhajans and dictionaries", tag: "Study" }] },
    { title: "Śrīla Gurudeva", links: PUBLICATIONS },
  ] },
  "social-media": { title: "Social media", intro: "Follow Taptajīvanam for the daily offering of Śrīla Gurudeva’s words.", groups: [{ links: SOCIAL }] },
  "taptajivanam-youtube": { title: "Taptajīvanam YouTube", intro: "Lectures, kīrtanas and short clips.", groups: [{ links: [SOCIAL[0], { title: "Videos on this website", url: "/teachings/videos", desc: "Every video, sorted by year, place and type" }] }] },
};

/** What has changed on the website. New updates are added from Studio › Announcements. */
export const SITE_UPDATES: { date: string; title: string; text: string; href?: string }[] = [
  { date: "2026-10-31", title: "Articles and magazines", text: "Articles by author, section and series, and magazines with every issue, its cover, the whole issue and its contents.", href: "/teachings/articles" },
  { date: "2026-10-31", title: "His Diary, newly arranged", text: "Volumes by year, months and days, “On this day”, search, and the original beside the translation.", href: "/gurudeva/diaries" },
  { date: "2026-10-31", title: "A new audio player", text: "Pop it out, read the transcription while you listen, change speed and volume, and use keyboard shortcuts.", href: "/teachings/audio" },
  { date: "2026-10-31", title: "Books, with four readers", text: "Classic, Focus, Pages and Side by side, with night colours, fonts, bookmarks, search and translations.", href: "/teachings/books" },
  { date: "2026-10-30", title: "Tattva and quotes", text: "Every subject with its quotes, lectures, videos and articles, and the quotes by topic, A to Z.", href: "/tattva" },
];
