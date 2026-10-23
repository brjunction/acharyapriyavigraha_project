import {
  BookOpen, Headphones, Clapperboard, Quote, Droplet, Lightbulb, BookHeart, MessageCircleQuestion, ListChecks, Music, Star, Library,
  BookA, ScrollText, Mail, MessagesSquare, Newspaper, Languages, FileText,
} from "lucide-react";
import { STATS } from "@/lib/data";
import { Block, GroupTitle, PageHead } from "@/components/ui";

export const metadata = { title: "His Teachings" };

export default function Teachings() {
  const s = (t: string) => `/soon?t=${encodeURIComponent(t)}`;
  return (
    <>
      <PageHead eyebrow="His Teachings" title="Hear, read and remember"
        intro="Books, lectures and videos first; then compilations drawn from them, each excerpt linked to its exact source and moment." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <GroupTitle>The three pillars</GroupTitle>
        <div className="grid gap-5 md:grid-cols-3">
          <Block size="l" href={s("Books")} icon={BookOpen} tone="maroon" title="Books" desc="Gopal Jiu, Tattva Vicāra and Taptajīvanam publications; magazines; free downloads." count={`${STATS.books} titles`} />
          <Block size="l" href="/teachings/audio" icon={Headphones} tone="saffron" title="Audio" desc="Every recorded lecture with filters by year, place, verse and topic." count={`${STATS.lectures.toLocaleString()} lectures`} />
          <Block size="l" href={s("Videos")} icon={Clapperboard} tone="tulasi" title="Videos" desc="Lectures on video, excerpts, memories and kīrtanas." count={`${STATS.videos} videos`} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Block size="s" href="/teachings/audio?t=1" icon={FileText} title="Transcriptions" desc="Read the lectures, synchronized with the audio." count={`${STATS.transcriptions} transcribed`} />
          <Block size="s" href="/translations" icon={Languages} tone="tulasi" title="Translated teachings" desc="Lectures and quotes in Hindi, Odia, Bahasa, Dutch, Russian…" />
        </div>

        <GroupTitle>Compilations</GroupTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Block href="/teachings/quotes" icon={Quote} tone="maroon" title="Quotes" desc="By subject, with source and image." count={`${STATS.quoteCategories} categories`} />
          <Block href={s("Nectar Drops")} icon={Droplet} tone="saffron" title="Nectar Drops" desc="A short gem every day, in many languages." />
          <Block href={s("Analogies")} icon={Lightbulb} tone="gold" title="Analogies" desc="“When the sun rises, the lotus blossoms…”" />
          <Block href={s("Stories & Anecdotes")} icon={BookHeart} tone="tulasi" title="Stories & anecdotes" desc="Stories he told, from scripture and life." />
          <Block href={s("Questions & Answers")} icon={MessageCircleQuestion} title="Questions & answers" desc="Every question asked, with his answer." />
          <Block href={s("Instructions")} icon={ListChecks} tone="maroon" title="Instructions" desc="Practical guidance for sādhana and life." />
          <Block href={s("Prayers & Songs")} icon={Music} tone="saffron" title="Prayers & songs" desc="Bhajanas he sang; prayers to him (Aṣṭakam…)." />
          <Block href={s("Ślokas he loved")} icon={Star} tone="gold" title="Ślokas he loved" desc="Verses he quoted most, ranked." />
          <Block href={s("Thematic anthologies")} icon={Library} tone="tulasi" title="Anthologies" desc="On the Holy Name, on Guru-tattva, on separation…" />
          <Block href={s("Glossary")} icon={BookA} title="Glossary" desc="Sanskrit and Odia terms, in his own words." />
        </div>

        <GroupTitle>Indexes and writings</GroupTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Block href="/search?q=SB+1.2.6" icon={ScrollText} tone="tulasi" title="Verses he spoke on" desc="BG · SB · CC · and more: every lecture and citation, verse by verse." />
          <Block href="/gurudeva/letters" icon={Mail} tone="saffron" title="Letters" desc="Correspondence, transcribed and translated." />
          <Block href={s("Darśanas & conversations")} icon={MessagesSquare} tone="maroon" title="Darśanas & conversations" desc="Intimate talks and interviews." />
          <Block href={s("Ānanda Sambāda")} icon={Newspaper} title="Ānanda Sambāda & articles" desc="Newsletter archive since 1991, the Bindu e-magazine, essays." tone="gold" />
          <Block href={s("Odia Vaiṣṇava literature")} icon={BookOpen} title="Odia Vaiṣṇava literature" desc="Odia biographies of Śrī Caitanya Mahāprabhu, with translations." tone="tulasi" />
          <Block href="/tattva" icon={Library} title="Tattva-kośa" desc="The topic treasury: everything, by subject." tone="maroon" />
        </div>
      </div>
    </>
  );
}
