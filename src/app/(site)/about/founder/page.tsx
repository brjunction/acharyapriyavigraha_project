import { cmsOverride } from "@/lib/cms/render";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { PageHero, Container } from "@/components/ui";
import { PortraitFrame } from "@/components/motifs";

export const metadata = { title: "Śrīla Haladhara Swāmī Guru Mahārāja" };

export default async function Page() {
  const cms = await cmsOverride('/about/founder'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <>
      <PageHero crumbs={[{ href: "/about", label: "About" }, { label: "Founder of Taptajīvanam" }]} icon={UserRound} title="Śrīla Haladhara Swāmī Guru Mahārāja"
        intro="Founder of Taptajīvanam."
      />
      <Container className="py-12">
        <div className="mx-auto mb-8 w-full max-w-[220px]"><PortraitFrame photo src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="w-full" /></div>
        <div className="reading mx-auto space-y-5 text-[15.5px] leading-[1.8] text-ink-2" style={{ maxWidth: "46rem" }}>
          <p>We offer our repeated obeisances unto the lotus feet of Śrīla Haladhara Swāmī Guru Mahārāja, our spiritual master, our eternal shelter and well-wisher. We are grateful and indebted to Śrī Guru Mahārāja for being our guide in this material world, which is compared to a deep dark well. He guides us through the light of the teachings of the previous ācāryas and the holy scriptures, instructing us in the secrets of nāma-sevā and guru-sevā, and setting a divine example for us to follow.</p>
          <p>Śrīla Haladhara Swāmī Guru Mahārāja was born and brought up in Odisha, India. He came into contact with the devotees at ISKCON Bhubaneswar in 1992 and was initiated in 1994, receiving the name Halāyudha Dāsa. Soon after joining the temple as a full-time devotee he served in the travelling saṅkīrtana party, and he also served as head pūjārī of Śrī Śrī Kṛṣṇa-Balarāma Temple in Bhubaneswar. Following the personal instructions of his spiritual master, he began preaching the teachings of Śrīmad-Bhāgavatam in Odia. He preaches mainly in Odia, Hindi and English.</p>
          <h2 className="!mt-10 text-[20px] tracking-[-0.02em] text-ink">Preaching mission</h2>
          <p>His selfless mood, loving service and inspiring dedication led to his acceptance of the renounced order of life, sannyāsa, on 20 March 2016, from His Holiness Rādhā-Govinda Swāmī Mahārāja at Śrī Śrī Kṛṣṇa-Balarāma Temple, ISKCON Bhubaneswar.</p>
          <p>He travels frequently to European and Asian countries to propagate the glories and teachings of His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda and of his revered spiritual master, Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
          <p>Through thirty years of devotional life he has exemplified “simple living, high thinking”, and strongly emphasises the utmost importance of serving the spiritual master (śrī guru-sevā) and chanting the holy names of the Lord (śrī nāma-sevā) without compromise.</p>
          <h2 className="!mt-10 text-[20px] tracking-[-0.02em] text-ink">Founder of Taptajīvanam</h2>
          <p>In 2019, during his European tour at ISKCON New Māyāpura in France, Śrīla Haladhara Swāmī Guru Mahārāja expressed his cherished desire to create a platform where all the audio lectures of his spiritual master would be available to everyone. He wished to explain the mission of his spiritual master, emphasising that everything is present in Śrīla Prabhupāda’s books and that there is no need to seek teachings outside of ISKCON.</p>
          <p>In 2020, with the help of his disciples and followers, he began curating daily selections of quotes and lectures, which are turned into small audio clips that capture the essence of Gurudeva’s teachings.</p>
          <p>More about Śrīla Haladhara Swāmī Guru Mahārāja will soon be found at <a className="text-saffron underline-offset-2 hover:underline" href="https://www.iskconpattamundai.in" target="_blank" rel="noreferrer">www.iskconpattamundai.in</a>.</p>
          <Link href="/gurudeva/diaries" className="!mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-saffron">See his daily diary<ArrowRight size={15} /></Link>
        </div>
      </Container>
    </>
  );
}
