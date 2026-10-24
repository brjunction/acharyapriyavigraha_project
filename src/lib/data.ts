// PROTOTYPE SAMPLE DATA
// Everything here is placeholder data to show the design. Real content comes from the
// taptajivanam.com migration into Neon (see docs/REQUIREMENTS.md §18).
// Gurudeva's words are never invented: sample text is clearly marked as sample.

export const IMG = {
  ggs: "/legacy/gurudeva.webp",
  ggsSite: "https://www.taptajivanam.com/custom_uploads/page_images/ggs.png",
  sp: "https://www.taptajivanam.com/custom_uploads/page_images/sp.png",
  leaf: "https://www.taptajivanam.com/custom_uploads/page_images/leaf-divider.png",
  sign: "https://www.taptajivanam.com/images/sign.png",
  banner: (n: number) => (n === 1 ? "/legacy/banner-1.jpg" : `https://www.taptajivanam.com/custom_uploads/banner_img/${n}.png`),
};

export const SITE = {
  name: "Taptajīvanam",
  verse: "tava kathāmṛtaṁ tapta-jīvanaṁ",
  verseTranslation:
    "The nectar of Your words and the descriptions of Your activities are the life and soul of those suffering in this material world.",
  verseSource: "Śrīmad-Bhāgavatam 10.31.9",
  email: "taptajivanam@gmail.com",
  phone: "+91 96687 21555",
  youtube: "https://www.youtube.com/@taptajivanam",
  social: [
    { name: "Instagram", href: "https://www.instagram.com/taptajivanam" },
    { name: "Facebook", href: "https://www.facebook.com/tapta.jivanam" },
    { name: "YouTube", href: "https://www.youtube.com/@taptajivanam" },
  ],
  locations: [
    { name: "ISKCON Pattamundai", lines: ["Śrī Śrī Rādhā-Gopāljiu Gośālā", "Sana Mulabasanta, Pattamundai", "Kendrapada, Odisha 754215, India"] },
    { name: "ISKCON Gadeigiri", lines: ["Śrī Śrī Rādhā-Gopāljiu Mandira", "Balikuda, Jagatsinghpur", "Odisha, India"] },
    { name: "ISKCON Bhubaneswar", lines: ["Śrī Śrī Kṛṣṇa-Balarāma", "NH16, near Krishna Plaza, IRC Village", "Nayapalli, Bhubaneswar, Odisha 751015, India"] },
  ],
};

export const STATS = { lectures: 1595, transcriptions: 130, quoteCategories: 44, topics: 112, letters: 29, imageTags: 38, books: 48, videos: 210 };

export type Lecture = {
  slug: string; title: string; date: string; place: string; country: string; type: string;
  scripture?: string; duration: number; transcribed: boolean; languages: string[]; topics: string[];
};

const places: [string, string][] = [
  ["Bhubaneswar", "India"], ["Radhadesh", "Belgium"], ["Murwillumbah", "Australia"], ["San Francisco", "USA"],
  ["Bali", "Indonesia"], ["Māyāpur", "India"], ["Vṛndāvana", "India"], ["Paris", "France"], ["Purī", "India"], ["Amsterdam", "Netherlands"],
];
const refs = ["SB 1.2.6", "SB 1.1.1", "BG 18.66", "CC Madhya 15.104", "SB 3.5.3", "BG 5.29", "SB 11.9.29", "CC Madhya 17.80", "BG 14.4", "SB 4.29.1"];
const types = ["Lecture", "Darśana", "Festival", "Questions & Answers", "House program"];
const topicPool = ["Guru-tattva", "The Holy Name", "Separation", "Sādhu-saṅga", "Humility", "Mahāprabhu's mercy", "Jīva-tattva", "Surrender", "Kali-yuga", "Prema"];

export const LECTURES: Lecture[] = [
  {
    slug: "1996-01-21-the-mercy-of-srila-prabhupada-bhubaneswar",
    title: "The Mercy of Śrīla Prabhupāda", date: "1996-01-21", place: "Bhubaneswar", country: "India", type: "Lecture",
    scripture: "BG 18.66", duration: 4320, transcribed: true, languages: ["en", "hi", "or"], topics: ["Śrīla Prabhupāda", "Guru-tattva", "Mercy"],
  },
  ...Array.from({ length: 23 }, (_, i): Lecture => {
    const [place, country] = places[i % places.length];
    const y = 1985 + (i % 11);
    const m = String(((i * 5) % 12) + 1).padStart(2, "0");
    const d = String(((i * 7) % 27) + 1).padStart(2, "0");
    const ref = refs[i % refs.length];
    const type = types[i % types.length];
    const title = type === "Lecture" ? `Lecture on ${ref}` : `${type} — ${topicPool[i % topicPool.length]}`;
    return {
      slug: `${y}-${m}-${d}-sample-${i}`, title, date: `${y}-${m}-${d}`, place, country, type,
      scripture: type === "Lecture" ? ref : undefined, duration: 1200 + ((i * 731) % 4800), transcribed: i % 3 === 0,
      languages: i % 4 === 0 ? ["en", "hi"] : ["en"], topics: [topicPool[i % 10], topicPool[(i + 3) % 10]],
    };
  }),
].sort((a, b) => b.date.localeCompare(a.date));

export const TRANSCRIPT = [
  { t: 0, speaker: "Śrīla Gurudeva", kind: "speech", text: "So today, these devotees here are celebrating, inaugurating Prabhupāda's centennial festival." },
  { t: 42, speaker: "", kind: "verse", text: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ", cite: "Bhagavad-gītā 18.66" },
  { t: 95, speaker: "Śrīla Gurudeva", kind: "speech", text: "[Sample paragraph. In the real site this is the verbatim transcription, aligned to the audio so the highlighted paragraph follows the recording.]" },
  { t: 210, speaker: "", kind: "note", text: "[break]" },
  { t: 214, speaker: "Śrīla Gurudeva", kind: "speech", text: "[Sample paragraph. Click any paragraph to jump the audio to that moment. Select text to copy it with its full citation.]" },
  { t: 380, speaker: "Devotee", kind: "speech", text: "[Sample question from a devotee.]" },
  { t: 402, speaker: "Śrīla Gurudeva", kind: "speech", text: "[Sample answer paragraph. Verse references such as SB 1.2.6 are detected automatically and linked to the verse index.]" },
];

export const QUOTE_OF_DAY = {
  text: "When the sun rises, the lotus blossoms; when the sun sets, the petals close.",
  source: "House Program", date: "31 May 1994", place: "San Francisco, USA",
};

export const QUOTE_CATEGORIES = [
  "Acarya, Sadhu and Spiritual Master (Guru)", "Anecdote", "Blessings and Mercy", "Constitutional Position", "Cow", "Crying",
  "Demons and Demigods", "Descending order", "Desires", "Devotees", "Disciple", "Disciplic succession", "Enviousness", "Era",
  "Happiness and Pleasure", "Hearing", "Holy Places", "Holy Scriptures", "Ignorance", "Impediments/obstacles", "ISKCON", "Kali",
  "Karmi, Jnanis and Yogis", "Liberation", "Love", "Mahaprasadam", "Mahatma", "Material Emotions", "Mayavadis", "Paramatma",
  "Personalities", "Problems and Dangers", "Sankirtana Padayatra", "Sense and Sense Gratification", "Servant and Service",
  "Soul and Supersoul", "Spiritual Moods", "Śrī Śrīmad Gour Govinda Swami", "Srimad Bhagavatam", "The Holy Name", "Transcendental",
  "Vaikuntha", "Various Religions", "Varnas and Asramas",
];

export type Concept = { slug: string; name: string; children: string[]; count: number };
export const TATTVA: Concept[] = [
  { slug: "krsna-tattva", name: "Kṛṣṇa-tattva", count: 412, children: ["Kṛṣṇa's pastimes", "Kṛṣṇa's mercy", "Kṛṣṇa's love for devotees", "Govardhana", "Janmāṣṭamī", "Balarāma"] },
  { slug: "gaura-tattva", name: "Gaura-tattva", count: 268, children: ["Mahāprabhu's advent", "Mahāprabhu's mood", "Mahāprabhu's teachings", "Associates in Gaura-līlā", "Nityānanda Prabhu"] },
  { slug: "guru-tattva", name: "Guru-tattva", count: 531, children: ["Guru", "Disciple", "Sādhu-saṅga", "Initiation", "Disciplic succession", "Pleasing Hari-Guru"] },
  { slug: "jiva-tattva", name: "Jīva-tattva", count: 302, children: ["Soul & Supersoul", "Constitutional position", "Karma-cakra", "Human form of life", "Death"] },
  { slug: "bhakti", name: "Bhakti", count: 744, children: ["Śravaṇam", "The Holy Name", "Sevā", "Surrender", "Prema", "Separation", "Crying for Kṛṣṇa"] },
  { slug: "obstacles", name: "Obstacles on the path", count: 356, children: ["Anarthas & remedies", "Vaiṣṇava-aparādha", "Lust", "Envy", "Pride", "Māyā & material desires"] },
  { slug: "practice", name: "Society & practice", count: 221, children: ["Varṇāśrama-dharma", "Family life", "Brahmacarya", "Cow", "Prasādam", "Deity worship"] },
  { slug: "philosophy", name: "Philosophy", count: 189, children: ["Māyāvāda", "Various religions", "Tattva-vicāra", "Kali-yuga", "Atheism"] },
  { slug: "holy-places", name: "Holy places", count: 143, children: ["Vṛndāvana", "Navadvīpa", "Purī & Jagannātha", "Vaikuṇṭha", "Spiritual world"] },
  { slug: "personalities", name: "Personalities", count: 276, children: ["Ācāryas", "Śrīla Prabhupāda", "Śrīmatī Rādhārāṇī", "Nṛsiṁhadeva & Prahlāda", "Devatās"] },
];

export { LANGUAGES } from "./languages";

export const LETTERS = [
  { date: "1974-01-01", from: "Śrīla Prabhupāda", to: "Śrīla Gurudeva", group: "With Śrīla Prabhupāda" },
  { date: "1975-06-12", from: "Śrīla Gurudeva", to: "Śrīla Prabhupāda", group: "With Śrīla Prabhupāda" },
  { date: "1976-03-04", from: "Śrīla Prabhupāda", to: "Śrīla Gurudeva", group: "With Śrīla Prabhupāda" },
  { date: "1977-01-06", from: "Śrīla Prabhupāda", to: "Śrīla Gurudeva", group: "With Śrīla Prabhupāda" },
  { date: "1990-08-20", from: "Śrīla Gurudeva", to: "A godbrother", group: "With others" },
];

export const TIMELINE = [
  { year: "1929", title: "Appearance", text: "Born in Jagannāthapura, near Purī, Odisha, into the Giri family of Gaḍeigiri, devotees of Gopāl Jiu for generations." },
  { year: "1940s", title: "Kīrtana gurus", text: "Grows up absorbed in kīrtana and the worship of Śrī Gopāl Jiu." },
  { year: "1974", title: "Meets Śrīla Prabhupāda", text: "Meets his beloved spiritual master in Vṛndāvana." },
  { year: "1975", title: "Initiation & sannyāsa", text: "Receives the order from Śrīla Prabhupāda to build a temple in Bhubaneswar." },
  { year: "1975–1991", title: "Building ISKCON Bhubaneswar", text: "Starts from a mud hut; construction of the temple of Śrī Śrī Kṛṣṇa-Balarāma." },
  { year: "1985–1995", title: "Preaching worldwide", text: "Travels to Europe, Australia, Indonesia and America; most recorded lectures come from these years." },
  { year: "1996", title: "Departure", text: "Departs in Śrīdhāma Māyāpur." },
];

export const GALLERY_TAGS = [
  "Portraits", "Early Days", "Deities-Vigrahas", "Festivals", "Initiation Ceremony", "Travelling", "Radhadesh", "Bali",
  "Australia", "USA", "Ratha Yatra '93", "Vyasa-puja '95", "Temple Construction ISKCON Bhubaneswar", "Personal Belongings", "Black and White",
];

export const DIARY = Array.from({ length: 8 }, (_, i) => {
  const d = new Date(2026, 9, 24 - i);
  return { date: d.toISOString().slice(0, 10), title: `Daily Diary · ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` };
});

export function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDur(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}
export function fmtClock(s: number) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
