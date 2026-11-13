import { Mail, BellRing } from "lucide-react";

/** "Subscribe free" to a magazine: the publisher's own sign-up page, and/or an email to their address. */
export function Subscribe({ url, email, title, compact }: { url?: string | null; email?: string | null; title: string; compact?: boolean }) {
  if (!url && !email) return null;
  const mail = email ? `mailto:${email}?subject=${encodeURIComponent(`Subscribe to ${title}`)}&body=${encodeURIComponent(`Please subscribe me to ${title}.\n\nName:\nEmail:`)}` : null;
  if (compact) return <a href={url || mail!} target={url ? "_blank" : undefined} rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-saffron hover:underline"><BellRing size={13} />Subscribe free</a>;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-band/50 px-4 py-3 sm:flex-row sm:items-center">
      <p className="flex min-w-0 flex-1 items-start gap-2.5 text-[13.5px] leading-snug text-ink-2"><BellRing size={18} className="mt-px shrink-0 text-saffron" /><span><b className="font-semibold text-ink">Get every new issue by email — free.</b> Sent by the publisher.</span></p>
      <div className="flex shrink-0 flex-wrap gap-2">
        {url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-4 text-[13px] font-medium text-white hover:bg-ink/90">Subscribe free</a>}
        {mail && <a href={mail} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-white px-3.5 text-[13px] text-ink hover:bg-band"><Mail size={14} />{url ? "Or by email" : "Subscribe by email"}</a>}
      </div>
    </div>);
}
