/** A page's icon: an emoji, or an uploaded picture. */
export function PageIcon({ icon, size = 18, className = "" }: { icon?: string | null; size?: number; className?: string }) {
  if (!icon) return null;
  // eslint-disable-next-line @next/next/no-img-element
  if (/^(\/|https?:)/.test(icon)) return <img src={icon} alt="" width={size} height={size} className={`inline-block rounded object-contain align-[-0.15em] ${className}`} style={{ width: size, height: size }} />;
  return <span className={className} style={{ fontSize: size * 0.95, lineHeight: 1 }}>{icon}</span>;
}
