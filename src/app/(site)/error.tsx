"use client";
import { useEffect } from "react";
import { Lost } from "@/components/errors/lost";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <Lost code="…" title="Something went wrong" text="This page could not be shown just now. Please try again — or search the archive meanwhile." action={<button onClick={reset} className="mt-4 inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-ink/90">Try again</button>} />;
}
