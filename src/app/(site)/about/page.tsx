import { cmsOverride } from "@/lib/cms/render";
import { MenuHub } from "@/components/sections";
import { Container } from "@/components/ui";

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
        </div>
      </Container>
    } />
  );
}
