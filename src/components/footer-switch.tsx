"use client";
import { usePathname } from "next/navigation";

/** The full footer on the home page; one quiet line everywhere else. */
export function FooterSwitch({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/" || path === "/home-new") return <>{children}</>;
  return (
    <footer className="mt-14 border-t border-line bg-white shadow-[0_-6px_18px_-14px_rgba(0,0,0,.25)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-3.5 text-center text-[12.5px] text-ink-3">
        <span className="font-semibold text-ink">Taptajīvanam</span><span>© {new Date().getFullYear()}</span><span aria-hidden className="hidden sm:inline">·</span><span className="w-full sm:w-auto">The complete teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva</span>
      </div>
    </footer>
  );
}
