import Link from "next/link";
import { Lock } from "lucide-react";
import { LogoMark, PaisleyField } from "@/components/motifs";
import { SITE } from "@/lib/data";

export default function Page() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="footer-paisley relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <PaisleyField className="text-[#4c1b00]" scale={1.6} />
        <div className="relative flex items-center gap-3"><LogoMark className="h-11 w-11 text-white" /><span className="font-serif text-[20px] font-bold text-white">Taptajīvanam</span></div>
        <div className="relative"><p className="font-serif text-[26px] italic leading-tight text-white">{SITE.verse}</p><p className="mt-3 max-w-md font-serif text-[17px] text-[#f3e3d6]">{SITE.verseTranslation}</p></div>
      </div>
      <div className="flex items-center justify-center bg-page px-5">
        <div className="w-full max-w-sm">
          <LogoMark className="h-12 w-12 text-saffron lg:hidden" />
          <h1 className="mt-4 text-[24px]">Sign in to the dashboard</h1>
          <p className="mt-1 text-[14px] text-ink-2">Use the user ID and password your admin gave you.</p>
          <form className="mt-8 space-y-4">
            <label className="block"><span className="mb-1.5 block text-[13px] font-medium">User ID</span><input className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] outline-none focus:border-saffron" placeholder="e.g. madhavananda" /></label>
            <label className="block"><span className="mb-1.5 block text-[13px] font-medium">Password</span><input type="password" className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] outline-none focus:border-saffron" /></label>
            <Link href="/admin" className="btn btn-primary !h-11 w-full !rounded-xl"><Lock size={15} />Sign in</Link>
            <p className="text-center text-[12.5px] text-ink-3">Forgot your password? Ask your admin to reset it.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
