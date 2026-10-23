import { PageHead } from "@/components/ui";

export const metadata = { title: "Thank List" };

const REGIONS: [string, string[]][] = [
  ["Asia", ["Bangladesh", "India: Bangalore, Delhi, Goa, Gujarat, Maharashtra, Odisha, Uttar Pradesh, West Bengal", "Indonesia (Bali)", "Malaysia"]],
  ["Europe", ["England", "Lithuania", "The Netherlands", "Russia"]],
  ["North America", ["California", "Canada", "Florida"]],
];

export default function ThankList() {
  return (
    <>
      <PageHead eyebrow="With gratitude" title="Thank List" />
      <div className="reading mx-auto px-4 py-12 sm:px-6">
        <blockquote className="border-l-2 border-gold pl-5 italic">“Your love for me will be shown by how you cooperate with one another.”<footer className="mt-1 font-sans text-sm not-italic text-ink-3">His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda</footer></blockquote>
        <p className="mt-8">The full Thank List, written by Yati Śekhara Dāsa (Bhubaneswar, Padminī Ekādaśī, 29 July 2023), is moved over word for word, with every name, region and service, and can be edited in the dashboard.</p>
        <h2 className="mt-10 font-serif text-2xl">Sections</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6"><li>Gratitude to Śrīpād Caitanya Chandra Dāsa Mahārāja</li><li>Core contributors</li><li>Audio remastering</li><li>Volunteers by region</li><li>Web designers and web hosts</li></ul>
        {REGIONS.map(([r, l]) => (<div key={r} className="mt-6"><h3 className="font-serif text-xl text-maroon">{r}</h3><p className="text-ink-2">{l.join(" · ")}</p></div>))}
      </div>
    </>
  );
}
