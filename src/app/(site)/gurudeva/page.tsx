import {
  User, BookMarked, Clock, CalendarDays, Map, PlayCircle, NotebookPen, Notebook, Crown, GitBranch, Mail, Users, UserRound, Handshake,
  Landmark, Flower2, Home, Building2, Image as ImageIcon, Heart, Sparkles, Package, Star, Feather, Sunset, HeartHandshake,
} from "lucide-react";
import { IMG, STATS } from "@/lib/data";
import { Img } from "@/components/chrome";
import { Block, GroupTitle } from "@/components/ui";

export const metadata = { title: "Śrīla Gurudeva" };

export default function Gurudeva() {
  const s = (t: string) => `/soon?t=${encodeURIComponent(t)}`;
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-paper-2 to-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr]">
          <div className="mx-auto h-56 w-48 overflow-hidden rounded-[1.75rem] border border-line shadow-xl md:h-64 md:w-56">
            <Img src={IMG.ggs} alt="Śrīla Gurudeva" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">Śrīla Gurudeva</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Śrī Śrīmad Gour Govinda Swāmī</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">
              A dear disciple of Śrīla Prabhupāda, founder-ācārya of ISKCON, and a representative of the Brahma-Madhva-Gauḍīya sampradāya.
              Born in 1929 in Jagannāthapura near Purī, into a family devoted to Śrī Gopāl Jiu for generations.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-sm">
              {[["1929–1996", "his life"], [`${STATS.lectures.toLocaleString()}`, "recorded lectures"], ["7", "temples established"], [`${STATS.letters}`, "letters"]].map(([a, b]) => (
                <div key={b}><p className="font-serif text-2xl text-maroon">{a}</p><p className="text-ink-3">{b}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <GroupTitle>Who he is</GroupTitle>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2 md:row-span-2"><Block size="l" href={s("Who is Śrīla Gurudeva")} icon={User} tone="maroon" title="Who is Śrīla Gurudeva" desc="Krishna sent him · A brief life story · Gauḍīya siddhāntācārya · themed essays." /></div>
          <Block href={s("Life Description")} icon={BookMarked} title="Life Description" desc="Gopāl Jiu: the beloved Deity of Śrīla Gour Govinda Swāmī." count="5 chapters" />
          <Block href={s("Carita")} icon={Feather} title="The Carita" desc="Verse biography, Odia with English translation." tone="saffron" />
          <Block href="/gurudeva/timeline" icon={Clock} title="Life timeline" desc="1929 → 1996, year by year." tone="tulasi" />
          <Block href="/gurudeva/timeline" icon={CalendarDays} title="This day in his life" desc="366 days: lectures, letters, photos." tone="gold" />
          <Block href={s("Official biography")} icon={BookMarked} title="Kṛṣṇāliṅgita Vigraha" desc="The official biography series." tone="maroon" />
          <Block href={s("Where he travelled")} icon={Map} title="Where he travelled" desc="A world map of every place he spoke." tone="tulasi" />
        </div>

        <GroupTitle>His diaries</GroupTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <Block size="l" href="/gurudeva/diaries" icon={PlayCircle} tone="saffron" title="Daily Diary" desc="A short every day, from HH Haladhara Swāmī Mahārāja's YouTube channel. Imported automatically." count="New today" />
          <Block size="l" href={s("Gopāl Jiu Diary")} icon={NotebookPen} tone="gold" title="Gopāl Jiu Diary" desc="Diary entries connected with Śrī Śrī Rādhā-Gopāl Jiu." />
          <Block size="l" href={s("Other diaries")} icon={Notebook} tone="tulasi" title="Other diaries" desc="Travel and festival diaries, by date and place." />
        </div>

        <GroupTitle>Lineage and relationships</GroupTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Block href={s("Śrīla Prabhupāda")} icon={Crown} tone="maroon" title="Śrīla Prabhupāda" desc="His beloved spiritual master; their first meeting." count="25 letters" />
          <Block href={s("Guru-paramparā")} icon={GitBranch} title="Guru-paramparā" desc="The disciplic succession, ācārya by ācārya." />
          <Block href="/gurudeva/letters" icon={Mail} tone="saffron" title="Letters" desc="With Śrīla Prabhupāda, disciples and others." count={`${STATS.letters} letters`} />
          <Block href={s("Disciples")} icon={Users} tone="tulasi" title="Disciples" desc="Disciple list and biographies." />
          <Block href={s("HH Haladhara Swāmī Mahārāja")} icon={UserRound} title="HH Haladhara Swāmī Mahārāja" desc="His disciple, founder of Taptajīvanam." tone="gold" />
          <Block href={s("With other sādhus")} icon={Handshake} title="With other sādhus" desc="ISKCON sādhus, Vaiṣṇavas of other maṭhas, mahātmās." />
          <Block href={s("Departed disciples")} icon={Sunset} title="In memoriam" desc="His departed disciples, remembered." tone="maroon" />
          <Block href={s("Disappearance pastimes")} icon={Flower2} title="Disappearance pastimes" desc="Accounts of his departure, Māyāpur 1996." tone="saffron" />
        </div>

        <GroupTitle>His projects and holy places</GroupTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <Block size="l" href={s("ISKCON Bhubaneswar")} icon={Landmark} tone="maroon" title="ISKCON Bhubaneswar" desc="From a mud hut to the temple of Śrī Śrī Kṛṣṇa-Balarāma, by Śrīla Prabhupāda's order." />
          <Block size="l" href={s("Śrī Śrī Rādhā-Gopāl Jiu")} icon={Sparkles} tone="gold" title="Śrī Śrī Rādhā-Gopāl Jiu" desc="His beloved Deity, Gaḍeigiri: history and darśana." />
          <Block size="l" href={s("Temples")} icon={Building2} tone="tulasi" title="Temples he established" desc="Seven temples and āśramas across Odisha, on a map." count="7 places" />
          <Block href={s("Pattamundai")} icon={Home} title="Pattamundai Gośālā" desc="Śrī Śrī Rādhā-Gopāljiu Gośālā." />
          <Block href={s("Janmasthān")} icon={Star} title="Janmasthān project, Purī" desc="Preserving his birthplace: how to help." tone="saffron" />
          <Block href={s("Other projects")} icon={HeartHandshake} title="Other projects" desc="Ongoing service projects." tone="maroon" />
        </div>

        <GroupTitle>Remembrance</GroupTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Block href="/gurudeva/gallery" icon={ImageIcon} tone="tulasi" title="Gallery" desc="Portraits, deities, festivals, travels." count={`${STATS.imageTags} albums`} />
          <Block href={s("Memories")} icon={Heart} tone="maroon" title="Memories" desc="Disciples remembering him, on video." />
          <Block href={s("Glorifications")} icon={Sparkles} tone="gold" title="Glorifications" desc="Vyāsa-pūjā offerings and poems." />
          <Block href={s("Personal belongings")} icon={Package} tone="saffron" title="Personal belongings" desc="Items he used, with their stories." />
        </div>
      </div>
    </>
  );
}
