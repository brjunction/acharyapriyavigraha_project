"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** The full footer on the home page; one quiet line everywhere else. */
export function FooterSwitch({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <>{children}</>;
  return (
    <footer className="mt-16 border-t border-line py-5 text-center text-[12px] text-ink-3">
      <p>© Taptajīvanam · The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva · <Link href="/about/contact" className="hover:text-saffron">Contact</Link> · <Link href="/" className="hover:text-saffron">Home</Link></p>
    </footer>
  );
}
