import { topics } from "@/lib/content/topics";
import { TattvaShell } from "@/components/tattva/shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const all = await topics();
  return <TattvaShell topics={all.map((t) => ({ name: t.name, slug: t.slug, parent: t.parent && all.some((x) => x.name === t.parent) ? t.parent : null, total: t.total }))}>{children}</TattvaShell>;
}
