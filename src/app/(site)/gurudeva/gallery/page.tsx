import { cmsOverride } from "@/lib/cms/render";
import { Image as ImageIcon } from "lucide-react";
import { GALLERY_TAGS } from "@/lib/data";
import { Container, PageHero } from "@/components/ui";
import { PortraitFrame } from "@/components/motifs";

export const metadata = { title: "Gallery" };

const PHOTOS = [
  { n: "smile", t: "Portrait", pos: "50% 20%" },
  { n: "marigold", t: "With a marigold garland", pos: "50% 22%" },
  { n: "garland", t: "Giving class, with a garland of flowers", pos: "50% 22%" },
  { n: "seated-1", t: "Seated, in conversation", pos: "50% 25%" },
  { n: "library", t: "In a library, laughing", pos: "40% 55%" },
];

export default async function Page() {
  const cms = await cmsOverride('/gurudeva/gallery'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Gallery" }]} icon={ImageIcon} title="Gallery" intro="Photographs of Śrīla Gurudeva. Each photograph will carry its place, year and source. Albums by theme, place and year are coming." />
      <Container className="py-12">
        <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
          <PortraitFrame photo src="/photos/gurudeva-portrait.webp" className="mx-auto w-[200px]" />
          <p className="text-[15px] leading-relaxed text-ink-2">Select a photograph to open it in full size. Photographs are shown whole and are never cropped across the face.</p>
        </div>
        <div className="mt-10 columns-2 gap-4 md:columns-3">
          {PHOTOS.map((p) => (
            <a key={p.n} href={`/photos/gurudeva-${p.n}.webp`} target="_blank" rel="noreferrer" className="group mb-4 block break-inside-avoid overflow-hidden rounded-[14px] border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/photos/gurudeva-${p.n}-sm.webp`} alt={p.t} loading="lazy" className="w-full transition duration-700 group-hover:scale-[1.03]" />
              <p className="px-4 py-3 text-[13.5px] font-medium text-ink-2">{p.t}</p>
            </a>
          ))}
        </div>
        <h2 className="mt-14 text-[20px]">Albums</h2>
        <div className="mt-4 flex flex-wrap gap-2">{GALLERY_TAGS.map((t) => <span key={t} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-2">{t}</span>)}</div>
      </Container>
    </>
  );
}
