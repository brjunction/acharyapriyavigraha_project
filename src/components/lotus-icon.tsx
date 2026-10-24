import type { SVGProps } from "react";

/** Lucide-compatible lotus icon (stroke, currentColor). */
export function Lotus({ size = 24, strokeWidth = 1.6, className, ...p }: SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...p}>
      <path d="M12 4c2.6 2.4 3.6 5.2 3.6 8.2 0 2.6-1.4 4.6-3.6 5.8-2.2-1.2-3.6-3.2-3.6-5.8C8.4 9.2 9.4 6.4 12 4Z" />
      <path d="M8.6 11.4C6.2 10.6 3.8 11 2.4 12.4c.4 3.6 3 6.2 6.2 6.8" />
      <path d="M15.4 11.4c2.4-.8 4.8-.4 6.2 1-.4 3.6-3 6.2-6.2 6.8" />
      <path d="M8.6 19.2c1 .5 2.2.8 3.4.8s2.4-.3 3.4-.8" />
    </svg>
  );
}
