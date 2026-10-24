/** Videos from HH Haladhara Swāmī's channel, read from its public feed and refreshed hourly. */
export const HALADHARA_CHANNEL = { id: "UC4IEe3gMst3nTRVWKJfd8Ng", handle: "@HaladharaSwami" };
export type ChannelVideo = { id: string; title: string; published: string };

export async function getChannelVideos(): Promise<ChannelVideo[]> {
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${HALADHARA_CHANNEL.id}`, { next: { revalidate: 3600 } });
    if (!r.ok) return [];
    const xml = await r.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => ({
      id: /<yt:videoId>([^<]+)</.exec(m[1])?.[1] ?? "",
      title: (/<title>([^<]*)</.exec(m[1])?.[1] ?? "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      published: /<published>([^<]+)</.exec(m[1])?.[1] ?? "",
    })).filter((v) => v.id);
  } catch { return []; }
}
