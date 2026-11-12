import PageHead, { MetaChip } from "@/components/hnv/page-head";
import { AcharyaHub } from "@/components/gaudiya/hub";
import { hubData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Scriptures · Gauḍīya library", description: "Śrīmad-Bhāgavatam, Bhagavad-gītā, Caitanya-caritāmṛta and the other scriptures with the commentaries of the ācāryas, to read online." };
export default async function Page() {
  const d = await hubData("scripture");
  return (<div className="hnv bg-white"><PageHead title="Scriptures" intro="The scriptures with the commentaries of our ācāryas." meta={<><MetaChip n={d.books.length} label="books" /><MetaChip n={new Set(d.books.map((b) => b.acharya).filter(Boolean)).size} label="ācāryas" /></>} />
    <AcharyaHub {...d} base="/gaudiya/scriptures" what="scriptures" /></div>);
}
