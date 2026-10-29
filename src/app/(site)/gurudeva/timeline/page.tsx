import { cmsOverride } from "@/lib/cms/render";
import { Clock } from "lucide-react";
import { TIMELINE } from "@/lib/data";
import { Container, PageHero } from "@/components/ui";

export const metadata = { title: "Life timeline" };

export default async function Page() {
  const cms = await cmsOverride('/gurudeva/timeline'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Life timeline" }]} icon={Clock} title="Life timeline" intro="Each period opens into the lectures, letters and photos from that time." />
      <Container className="max-w-3xl py-16">
        <ol className="relative border-l-2 border-saffron/25 pl-10">
          {TIMELINE.map((e) => (
            <li key={e.year} className="reveal relative mb-12">
              <span className="absolute -left-[49px] top-2 flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-page bg-saffron ring-4 ring-saffron/15" />
              <p className="font-serif text-[24px] font-bold leading-none text-saffron">{e.year}</p>
              <h3 className="mt-2 text-[18.5px]">{e.title}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{e.text}</p>
              <div className="mt-3 flex gap-2 text-[12px]">{["Lectures", "Letters", "Photos"].map((x) => <span key={x} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-ink-2">{x}</span>)}</div>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
