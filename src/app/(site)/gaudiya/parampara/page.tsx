import { getParampara, SECTIONS } from "@/lib/gaudiya/data";
import { Chain } from "@/components/gaudiya/chain";

export const revalidate = 300;
export const metadata = { title: "Guru-paramparā · Gauḍīya Library", description: "The disciplic succession from Śrī Kṛṣṇa to Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī. Open any ācārya to read his life and his books." };

export default async function Page() {
  const chain = await getParampara();
  return (
    <div className="bg-white">
      <section className="border-b border-line bg-gradient-to-b from-[#fdf6ea] to-white"><div className="mx-auto max-w-[760px] px-4 pb-10 pt-12 text-center sm:px-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">Brahma-Madhva-Gauḍīya sampradāya</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[38px]">The Guru-paramparā</h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-2">From Śrī Kṛṣṇa, through Śrī Caitanya Mahāprabhu and the Gosvāmīs, to Śrīla Prabhupāda and Śrīla Gurudeva. Open any name to read his life and his books.</p>
      </div></section>
      <div className="px-4 pt-6 sm:px-6">{chain.length ? <Chain items={chain} sections={SECTIONS} /> : <p className="py-20 text-center text-[13.5px] text-ink-3">The paramparā is being added.</p>}</div>
    </div>);
}
