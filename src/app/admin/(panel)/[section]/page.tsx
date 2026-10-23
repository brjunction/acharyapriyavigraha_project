import { Construction } from "lucide-react";

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = section.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-[30px]">{title}</h1>
      <div className="card mt-6 flex flex-col items-center px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-soft text-saffron"><Construction size={26} strokeWidth={1.5} /></span>
        <p className="mt-4 font-semibold">Same pattern as Lectures</p>
        <p className="mt-1 max-w-md text-[13.5px] text-ink-3">A table with search, filters and bulk actions, and a single-column editor with draft, review and publish.</p>
      </div>
    </div>
  );
}
