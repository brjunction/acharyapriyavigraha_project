import { Crown, Quote as QuoteIcon, Mail } from "lucide-react";
import { Container, PageHero } from "@/components/ui";
import { CutOut } from "@/components/motifs";

export const metadata = { title: "Śrīla Prabhupāda on Śrīla Gurudeva" };

const CONV: [string, string][] = [
  ["Prabhupāda", "And we have got one gentleman, professor. He is good learned scholar. I can engage him for translating."],
  ["Gopāla Kṛṣṇa", "Oriya. Very nice."],
  ["Prabhupāda", "He is writing like machine. I can see the manuscript. In this way, arrangement like that."],
  ["Gopāla Kṛṣṇa", "Very good. We just printed two books in Oriya: Topmost Yoga and one more."],
  ["Prabhupāda", "He likes Oriya language."],
  ["Gopāla Kṛṣṇa", "Who? Gaura-Govinda Swami? He is very sincere devotee."],
  ["Prabhupāda", "Oh, yes. Undoubtedly."],
  ["Gopāla Kṛṣṇa", "Very sincere."],
  ["Prabhupāda", "Kṛṣṇa sent him. He... In Vṛndāvana, he said that “Please give me shelter.” I thought that “There are so many Indian comes and go.” So when he insisted, “All right, you stay.” [chuckles]"],
  ["Hari-śauri", "Yeah. He took sannyāsa at the opening of the temple. I remember that."],
  ["Prabhupāda", "He's a good boy."],
  ["Hari-śauri", "He's stuck it out for a long time in Orissa. He's been there a long time, by himself a lot of the time too."],
  ["Prabhupāda", "Yes. Yes. He's organizing nicely."],
  ["Gopāla Kṛṣṇa", "He's very sincere. He follows all the regulations very rigidly. He gets up in the morning. Ideal example."],
  ["Jagadīśa", "He understands the philosophy quite well."],
  ["Prabhupāda", "Oh, yes. And he is educated. He is B.Sc."],
];

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Śrīla Prabhupāda" }]} icon={Crown} title="Śrīla Prabhupāda on Śrīla Gurudeva" intro="What his spiritual master said about him, in Śrīla Prabhupāda's own words: a room conversation and a letter."
        aside={<CutOut src="/legacy/prabhupada.webp" alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" fade={0} className="mx-auto hidden w-64 lg:block" />} />
      <Container className="max-w-3xl py-14">
        <section>
          <div className="flex items-center gap-3"><QuoteIcon className="text-saffron" size={20} /><h2 className="text-[22px]">Room conversation, 5 January 1977, Bombay</h2></div>
          <p className="mt-1 text-[13px] text-ink-3">Speakers: Śrīla Prabhupāda, Gopāla Kṛṣṇa, Hari-śauri, Jagadīśa.</p>
          <div className="card mt-5 divide-y divide-line">
            {CONV.map(([who, line], i) => (
              <p key={i} className={`px-5 py-3 text-[15px] leading-relaxed ${who === "Prabhupāda" ? "bg-saffron-tint" : ""}`}><span className={`mr-2 font-semibold ${who === "Prabhupāda" ? "text-saffron" : "text-ink-2"}`}>{who}:</span>{line}</p>
            ))}
          </div>
        </section>
        <section className="mt-14">
          <div className="flex items-center gap-3"><Mail className="text-saffron" size={20} /><h2 className="text-[22px]">Letter to Gaura Govinda, 12 February 1976, Māyāpur</h2></div>
          <p className="mt-1 text-[13px] text-ink-3">Letter 76-02-12 · addressed to Bhuvaneśvara</p>
          <article className="card mt-5 space-y-4 p-6 text-[15.5px] leading-relaxed text-ink-2">
            <p>My dear Gaura Govinda Swami,</p>
            <p>Please accept my blessings. I beg to acknowledge receipt of your letter dated 8 February 1976.</p>
            <p>It is very good that you have completed one cottage. We are trying to send one man, but in the meantime just think that <mark className="rounded bg-saffron-tint px-1 text-ink">Krishna is with you and there is no need of disappointment.</mark></p>
            <p>Now that you have your cottage, you may remain there and <mark className="rounded bg-saffron-tint px-1 text-ink">Krishna will help you. You have my full blessings</mark> and you try your best and you will be successful. There is no need of coming to Mayapur now. If you can come for the festival, that will be nice, but it is not compulsory.</p>
            <p>If you are not getting reply from Gopala Krishna then you may write direct to me. I am also writing Saurabha to send you a plan.</p>
            <p>If you publish some book in Oriyan language, that book will give you good support. So now you have an opportunity, you are there and Krishna will help. Gradually we will help. <mark className="rounded bg-saffron-tint px-1 text-ink">Krishna is so kind, He is always ready to help.</mark> “dadami buddhi-yogam tam yena mam upayanti te.”</p>
            <p>I hope this meets you well.</p>
            <p className="text-ink-3">Your ever well-wisher,<br />A.C. Bhaktivedanta Swami<br /><span className="text-[12.5px]">ACBS/dda</span></p>
          </article>
        </section>
      </Container>
    </>
  );
}
