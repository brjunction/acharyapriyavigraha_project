import { GaudiyaHead } from "@/components/gaudiya/page-head";
import { GaudiyaLibrary } from "@/components/gaudiya/library";
import { shelfData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Scriptures · Gauḍīya library", description: "Śrīmad-Bhāgavatam, Bhagavad-gītā, Caitanya-caritāmṛta and the other scriptures with the commentaries of the ācāryas, to read online." };
export default async function Page() {
  const d = await shelfData("scripture");
  return (<div className="bg-white"><GaudiyaHead at="/gaudiya/scriptures" title="Scriptures" intro="The scriptures with the commentaries of our ācāryas, verse by verse." />
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 sm:px-6"><GaudiyaLibrary {...d} empty="The scriptures are being added." /></div></div>);
}
