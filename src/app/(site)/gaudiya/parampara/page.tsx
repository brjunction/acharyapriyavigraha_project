import { getParampara, SECTIONS } from "@/lib/gaudiya/data";
import { Chain } from "@/components/gaudiya/chain";
import PageHead from "@/components/hnv/page-head";

export const revalidate = 300;
export const metadata = { title: "Guru-paramparā · Gauḍīya Library", description: "The disciplic succession from Śrī Kṛṣṇa to Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī. Open any ācārya to read his life and his books." };

export default async function Page() {
  const chain = await getParampara();
  return (
    <div className="bg-white">
      <div className="hnv"><PageHead title="The Guru-paramparā" intro="From Śrī Kṛṣṇa, through Śrī Caitanya Mahāprabhu and the Gosvāmīs, to Śrīla Prabhupāda and Śrīla Gurudeva. Open any name to read his life." /></div>
      <div className="hnv mx-auto max-w-4xl px-5 pb-16 pt-6">{chain.length ? <Chain items={chain} sections={SECTIONS} /> : <p className="py-20 text-center text-[13.5px] text-ink-3">The paramparā is being added.</p>}</div>
    </div>);
}
