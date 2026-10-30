import { HandHeart, Gift, Mail, Image, MapPin, Package, IdCard, Landmark, GitBranch, Crown, FileText, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { HandHeart, Gift, Mail, Image, MapPin, Package, IdCard, Landmark, GitBranch, Crown };
export function ArchiveIcon({ name, className, size }: { name: string; className?: string; size?: number }) { const I = ICONS[name] || FileText; return <I className={className} size={size} />; }
