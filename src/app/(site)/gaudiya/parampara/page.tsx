import { getParampara, SECTIONS } from "@/lib/gaudiya/data";
import { Chain } from "@/components/gaudiya/chain";
import { GaudiyaHead } from "@/components/gaudiya/page-head";

export const revalidate = 300;
export const metadata = { title: "Guru-paramparā · Gauḍīya Library", description: "The disciplic succession from Śrī Kṛṣṇa to Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī. Open any ācārya to read his life and his books." };

export default async function Page() {
  const chain = await getParampara();
  return (
    <div className="bg-white">
      <GaudiyaHead at="/gaudiya/parampara" kicker="Brahma-Madhva-Gauḍīya sampradāya" title="The Guru-paramparā" intro="From Śrī Kṛṣṇa, through Śrī Caitanya Mahāprabhu and the Gosvāmīs, to Śrīla Prabhupāda and Śrīla Gurudeva. Open any name to read his life and his books." />
      <div className="px-4 pt-6 sm:px-6">{chain.length ? <Chain items={chain} sections={SECTIONS} /> : <p className="py-20 text-center text-[13.5px] text-ink-3">The paramparā is being added.</p>}</div>
    </div>);
}
