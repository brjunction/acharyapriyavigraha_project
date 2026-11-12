import PageHead, { MetaChip } from "@/components/hnv/page-head";
import { AcharyaHub } from "@/components/gaudiya/hub";
import { hubData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Gauḍīya library", description: "The books of the Gauḍīya Vaiṣṇava ācāryas to read online, ācārya by ācārya, in Hindi, Odia, Bengali, English and more." };
export default async function Page() {
  const d = await hubData("book");
  return (<div className="hnv bg-white"><PageHead deva="ग्रन्थाः" title="Gauḍīya library" intro="The books of our ācāryas, ācārya by ācārya — choose an ācārya above to see his books and his life." meta={<><MetaChip n={d.books.length} label="books" /><MetaChip n={new Set(d.books.map((b) => b.acharya).filter(Boolean)).size} label="ācāryas" /></>} />
    <AcharyaHub {...d} base="/gaudiya" what="library" /></div>);
}
