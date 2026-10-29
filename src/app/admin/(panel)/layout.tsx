import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { Shell } from "@/components/admin/shell";

export default async function Panel({ children }: { children: React.ReactNode }) {
  if (!hasDb()) redirect("/admin/login");
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return <Shell user={user}>{children}</Shell>;
}
