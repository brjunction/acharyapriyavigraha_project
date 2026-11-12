import { GaudiyaHead } from "@/components/gaudiya/page-head";
import { GaudiyaLibrary } from "@/components/gaudiya/library";
import { shelfData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Gauḍīya library", description: "The books of the Gauḍīya Vaiṣṇava ācāryas to read online, ācārya by ācārya, in Hindi, Odia, Bengali, English and more." };
export default async function Page() {
  const d = await shelfData("book");
  return (<div className="bg-white"><GaudiyaHead at="/gaudiya" title="The library of our ācāryas" intro="Their books to read online, ācārya by ācārya — in Hindi, Odia, Bengali, English and more." />
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 sm:px-6"><GaudiyaLibrary {...d} empty="The books of the ācāryas are being added." /></div></div>);
}
