import Link from "next/link";
import { GitBranch } from "lucide-react";
import { getBiographies, getParampara } from "@/lib/gaudiya/data";
import { People } from "@/components/gaudiya/people";

export const revalidate = 300;
export const metadata = { title: "Biographies · Gauḍīya Library", description: "The lives of the Gaura-pārṣadas, the ācāryas of the Guru-paramparā and other Vaiṣṇavas." };

export default async function Page() {
  const [bios, chain] = await Promise.all([getBiographies(), getParampara()]);
  const by = (k: string) => bios.filter((b) => b.section === k);
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-semibold tracking-tight text-ink">Biographies</h1><p className="mt-1 text-[14px] text-ink-2">The lives of the associates of Śrī Caitanya Mahāprabhu, the ācāryas and other great Vaiṣṇavas.</p></div>
        <Link href="/gaudiya/parampara" className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[13px] text-ink-2 hover:border-saffron/40 hover:text-saffron"><GitBranch size={15} />As the Guru-paramparā</Link></div>
      <div className="mt-8"><People empty="Biographies are being added." groups={[["Associates of Śrī Caitanya Mahāprabhu", by("gaura-parsadas")], ["The Guru-paramparā", chain], ["Ācāryas", by("acaryas")], ["Other Vaiṣṇavas", by("vaisnavas")]]} /></div>
    </div>);
}
