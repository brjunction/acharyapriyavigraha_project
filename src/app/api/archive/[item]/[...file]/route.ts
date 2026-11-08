/* The player's address for a recording kept on Archive.org: finds where the file is served today and sends the player there. */
import { resolveArchive } from "@/lib/archive";

export async function GET(_: Request, { params }: { params: Promise<{ item: string; file: string[] }> }) {
  const { item, file } = await params;
  const to = await resolveArchive(decodeURIComponent(item), file.map((f) => decodeURIComponent(f)).join("/"));
  return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "public, max-age=600, s-maxage=600" } });
}
