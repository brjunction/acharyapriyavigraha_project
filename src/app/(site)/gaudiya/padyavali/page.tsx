import { GaudiyaHead } from "@/components/gaudiya/page-head";
import { GaudiyaLibrary } from "@/components/gaudiya/library";
import { shelfData } from "@/lib/gaudiya/shelf";

export const revalidate = 300;
export const metadata = { title: "Padyāvalī · Gauḍīya library", description: "The songs and bhajans of the Gauḍīya ācāryas, with their words and meaning." };
export default async function Page() {
  const d = await shelfData("songs");
  return (<div className="bg-white"><GaudiyaHead at="/gaudiya/padyavali" title="Padyāvalī" intro="The songs and bhajans of our ācāryas, collection by collection." />
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 sm:px-6"><GaudiyaLibrary {...d} empty="The song collections are being added." /></div></div>);
}
