import { FolioArticle } from "@/components/webfolio/article";
import { OfflinePanel } from "@/components/webfolio/offline";

export const metadata = { title: "Read offline" };
export default function Page() {
  return <FolioArticle crumbs={[{ href: "/webfolio", label: "WebFolio" }, { label: "Read offline" }]} title="Read offline" intro="Take the WebFolio with you: install it as an app, keep all of its text on your device, and save lectures to listen without internet."><OfflinePanel /></FolioArticle>;
}
