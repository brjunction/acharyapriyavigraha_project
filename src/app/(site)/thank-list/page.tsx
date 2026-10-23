import { HeartHandshake } from "lucide-react";
import { Container, PageHero } from "@/components/ui";
import { Ornament } from "@/components/motifs";

export const metadata = { title: "Our Thank List" };

const REGIONS: [string, string[]][] = [
  ["Asia", ["Bangladesh", "India: Bangalore, Delhi, Goa, Gujarat, Maharashtra, Odisha, Uttar Pradesh, West Bengal", "Indonesia (Bali)", "Malaysia"]],
  ["Europe", ["England", "Lithuania", "The Netherlands", "Russia"]],
  ["North America", ["California", "Canada", "Florida"]],
];

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ href: "/about", label: "About" }, { label: "Our Thank List" }]} icon={HeartHandshake} title="Our Thank List" intro="This archive is being built by the efforts of the disciples, grand-disciples, followers and admirers of Śrīla Gour Govinda Swāmī." />
      <Container className="max-w-3xl py-16">
        <blockquote className="text-center font-serif text-[24px] italic leading-snug text-ink">“Your love for me will be shown by how you cooperate with one another.”</blockquote>
        <p className="mt-3 text-center text-[14px] text-ink-3">His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda</p>
        <Ornament className="my-10" />
        <div className="reading mx-auto">
          <p>The full Thank List, written by Yati Śekhara Dāsa (Bhubaneswar, Padminī Ekādaśī, 29 July 2023), is moved over word for word, with every name, region and service, and is editable in the dashboard.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {["Gratitude to Śrīpād Caitanya Chandra Dāsa Mahārāja", "Core contributors", "Audio remastering", "Web designers and web hosts"].map((s) => <div key={s} className="card p-5 font-serif text-[18px] font-bold">{s}</div>)}
        </div>
        {REGIONS.map(([r, l]) => (
          <div key={r} className="mt-10"><h2 className="text-[24px] text-saffron">{r}</h2><ul className="mt-3 space-y-1.5 text-[15.5px] text-ink-2">{l.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}
      </Container>
    </>
  );
}
