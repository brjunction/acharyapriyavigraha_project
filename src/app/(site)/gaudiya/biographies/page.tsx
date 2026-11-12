import { getBiographies, getParampara } from "@/lib/gaudiya/data";
import { People } from "@/components/gaudiya/people";
import PageHead from "@/components/hnv/page-head";

export const revalidate = 300;
export const metadata = { title: "Biographies · Gauḍīya Library", description: "The lives of the Gaura-pārṣadas, the ācāryas of the Guru-paramparā and other Vaiṣṇavas." };

export default async function Page() {
  const [bios, chain] = await Promise.all([getBiographies(), getParampara()]);
  const by = (k: string) => bios.filter((b) => b.section === k);
  return (
    <div className="bg-white"><div className="hnv"><PageHead title="Biographies" intro="The lives of the associates of Śrī Caitanya Mahāprabhu, the ācāryas and other great Vaiṣṇavas." /></div>
    <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
      <div className="mt-8"><People empty="Biographies are being added." groups={[["Associates of Śrī Caitanya Mahāprabhu", by("gaura-parsadas")], ["The Guru-paramparā", chain], ["Ācāryas", by("acaryas")], ["Other Vaiṣṇavas", by("vaisnavas")]]} /></div>
    </div></div>);
}
