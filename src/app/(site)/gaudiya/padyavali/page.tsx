import PageHead, { MetaChip } from "@/components/hnv/page-head";
import { AcharyaHub } from "@/components/gaudiya/hub";
import { hubData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Padyāvalī · Gauḍīya library", description: "The songs and bhajans of the Gauḍīya ācāryas, with their words and meaning." };
export default async function Page() {
  const d = await hubData("songs");
  return (<div className="hnv bg-white"><PageHead title="Padyāvalī" intro="The songs and bhajans of our ācāryas." meta={<><MetaChip n={d.books.length} label="books" /><MetaChip n={new Set(d.books.map((b) => b.acharya).filter(Boolean)).size} label="ācāryas" /></>} />
    <AcharyaHub {...d} base="/gaudiya/padyavali" what="padyāvalī" /></div>);
}
