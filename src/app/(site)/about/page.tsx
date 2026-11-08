import { cmsOverride } from "@/lib/cms/render";
import { MenuHub } from "@/components/sections";
import { Container } from "@/components/ui";
import Link from "next/link";

export const metadata = { title: "About" };

export default async function Page() {
  const cms = await cmsOverride('/about'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <MenuHub menuKey="about" before={
      <Container className="pt-12">
        <div className="card reading p-8 sm:p-10" style={{ maxWidth: "none" }}>
          <p>Taptajīvanam was conceived in 2019 by Śrīla Haladhara Swāmī Guru Mahārāja, to make his spiritual master&apos;s lectures available to everyone. It opened to the public in 2020, built by disciples, grand-disciples and followers around the world.</p>
          <p className="mt-4 text-ink-2">The name comes from the verse <em>tava kathāmṛtaṁ tapta-jīvanaṁ</em>: the nectar of the Lord&apos;s words is the life of those who suffer in this world.</p>
          {/* the pages kept out of the menu, so it stays short */}
          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-[13.5px]" aria-label="More about the archive">
            {([["/about/mission", "Mission & principles"], ["/about/team", "Team & contributors"], ["/gurudeva/taptajivanam-projects", "Taptajīvanam project"], ["/about/support", "Support the archive"], ["/about/suggest-correction", "Suggest a correction"], ["/about/privacy", "Privacy & terms"]] as const).map(([h, l]) => <Link key={h} href={h} className="text-ink-2 underline-offset-4 hover:text-saffron hover:underline">{l}</Link>)}
          </nav>
        </div>
      </Container>
    } />
  );
}
