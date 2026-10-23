import Link from "next/link";
import { Container } from "@/components/ui";
import { Rosette } from "@/components/motifs";

export default function NotFound() {
  return (
    <Container className="relative flex flex-col items-center py-28 text-center">
      <Rosette className="spin-slow absolute top-10 h-80 w-80 text-saffron/10" />
      <h1 className="relative text-[44px]">This page isn&apos;t here</h1>
      <p className="relative mt-3 text-ink-2">The address may have changed. Search the archive or go back home.</p>
      <Link href="/" className="btn btn-primary relative mt-6">Go home</Link>
    </Container>
  );
}
