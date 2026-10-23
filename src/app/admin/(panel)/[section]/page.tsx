import { Construction } from "lucide-react";

export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = section.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-3xl">{title}</h1>
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line bg-card px-6 py-20 text-center">
        <Construction size={32} strokeWidth={1.5} className="text-gold" />
        <p className="mt-4 font-medium">This module follows the same pattern as Lectures</p>
        <p className="mt-1 max-w-md text-sm text-ink-3">A table with search, filters and bulk actions, and a single-column editor with draft, review and publish. It will be designed next.</p>
      </div>
    </div>
  );
}
