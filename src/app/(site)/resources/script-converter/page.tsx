import { ScriptConverter } from "@/components/tools/script-converter";
export const metadata = { title: "Script converter · Tools", description: "Convert text between IAST, Devanāgarī, Bengali, Odia, Harvard-Kyoto, ITRANS, SLP1 and the old Balaram font." };
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">Tools</p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-ink">Script converter</h1>
      <p className="mb-8 mt-1 max-w-2xl text-[14.5px] text-ink-2">Paste text in any script and read it in another: IAST, Devanāgarī, Bengali, Odia, the old Balaram font, Harvard-Kyoto, ITRANS or SLP1.</p>
      <ScriptConverter />
    </div>);
}
