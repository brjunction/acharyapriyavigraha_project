"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lost } from "@/components/errors/lost";

/** When a page fails: the error is reported (so it can be fixed), the page quietly tries again once,
    and only if that fails too is a message shown. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter(); const [shown, setShown] = useState(false);
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    try { navigator.sendBeacon?.("/api/client-error", JSON.stringify({ path, message: error.message, stack: error.stack, digest: error.digest })); } catch {}
    const key = `tj_retry:${path}`; let last = 0; try { last = Number(sessionStorage.getItem(key) || 0); } catch {}
    if (Date.now() - last > 15000) { try { sessionStorage.setItem(key, String(Date.now())); } catch {} router.refresh(); setTimeout(() => reset(), 150); return; }
    setShown(true);
  }, [error, reset, router]);
  if (!shown) return <div className="flex min-h-[50vh] items-center justify-center"><span className="size-6 animate-spin rounded-full border-2 border-line border-t-saffron" /></div>;
  return <Lost code="…" title="Something went wrong" text="This page could not be shown just now. Please try again — or search the archive meanwhile." action={<button onClick={() => { try { sessionStorage.removeItem(`tj_retry:${window.location.pathname + window.location.search}`); } catch {} router.refresh(); reset(); }} className="mt-4 inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-ink/90">Try again</button>} />;
}
