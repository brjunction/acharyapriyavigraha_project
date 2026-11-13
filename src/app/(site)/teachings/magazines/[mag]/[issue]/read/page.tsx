import { permanentRedirect } from "next/navigation";

/** The issue page itself now opens the PDF first; this older address leads there. */
export default async function Page({ params }: { params: Promise<{ mag: string; issue: string }> }) {
  const { mag, issue } = await params; permanentRedirect(`/teachings/magazines/${mag}/${issue}`);
}
