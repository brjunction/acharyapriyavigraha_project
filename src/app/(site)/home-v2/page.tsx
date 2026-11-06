import { V2Home } from "@/components/home-v2/v2-home";
export const revalidate = 300;
export const metadata = { title: "Home — new design (preview)", robots: { index: false, follow: false } };
/** A second design of the home page, for review. The home page itself is unchanged. */
export default function HomeV2() { return <V2Home />; }
