"use client";
import { usePathname } from "next/navigation";

/** The full footer on the home page; one quiet line everywhere else. */
export function FooterSwitch({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/" || path === "/home-new") return <>{children}</>;
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-1 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-[14px] text-ink" style={{ fontFamily: "var(--font-reading-serif)" }}>Taptajīvanam <span className="text-ink-3">© {new Date().getFullYear()}</span></p>
        <p className="text-[13px] italic text-ink-2" style={{ fontFamily: "var(--font-reading-serif)" }}>The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva</p>
      </div>
    </footer>
  );
}
