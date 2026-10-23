import { UserPlus, ShieldCheck, Check, Minus } from "lucide-react";

const USERS = [["Super Admin", "admin", "Super Admin", "Everything", "Active", "now"], ["Madhavananda Dāsa", "madhavananda", "Editor", "Lectures, quotes", "Active", "12 min ago"], ["Vraja Kishori D.D.", "vrajakishori", "Admin", "All content", "Active", "yesterday"], ["Hindi team lead", "hindi.lead", "Language reviewer", "हिन्दी", "Active", "1 h ago"], ["Odia translator", "odia.tr1", "Translator", "ଓଡ଼ିଆ", "Active", "3 days ago"], ["Transcriber", "transcribe01", "Transcriber", "Transcriptions", "Invited", "–"]];
const MODULES = ["Lectures", "Quotes", "Books", "Gallery", "Translations", "Home page", "Users"];
const ACTIONS = ["View", "Create", "Edit", "Publish", "Delete"];
const EDITOR: Record<string, number> = { Lectures: 4, Quotes: 4, Books: 3, Gallery: 3, Translations: 1, "Home page": 1, Users: 0 };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-[30px]">Users</h1><p className="text-[13.5px] text-ink-3">Only admins create accounts. Each person gets a user ID, a password and one or more roles.</p></div>
        <button className="btn btn-primary !rounded-xl"><UserPlus size={15} />Invite user</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead className="bg-band/60 text-left text-[11px] uppercase tracking-[0.1em] text-ink-3"><tr><th className="p-3">Name</th><th className="hidden p-3 sm:table-cell">User ID</th><th className="p-3">Role</th><th className="hidden p-3 md:table-cell">Scope</th><th className="p-3">Status</th><th className="hidden p-3 md:table-cell">Last active</th></tr></thead>
          <tbody className="divide-y divide-line">{USERS.map(([n, id, r, s, st, la]) => (
            <tr key={id} className="hover:bg-saffron-tint">
              <td className="p-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-soft text-[12px] font-semibold text-saffron">{n[0]}</span>{n}</div></td>
              <td className="hidden p-3 font-mono text-[12px] text-ink-2 sm:table-cell">{id}</td>
              <td className="p-3"><span className="whitespace-nowrap rounded-full bg-band px-2 py-0.5 text-[12px]">{r}</span></td>
              <td className="hidden p-3 text-ink-2 md:table-cell">{s}</td>
              <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-[12px] ${st === "Active" ? "bg-ok-soft text-ok" : "bg-saffron-soft text-saffron"}`}>{st}</span></td>
              <td className="hidden p-3 text-ink-3 md:table-cell">{la}</td>
            </tr>))}</tbody>
        </table>
      </div>
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-saffron" /><h2 className="font-sans text-[15px] font-semibold">Role: Editor</h2></div>
          <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-lg bg-band p-1 text-[12px]">{["Admin", "Editor", "Contributor", "Transcriber", "Translator", "Reviewer"].map((r) => <span key={r} className={`rounded-md px-2.5 py-1 ${r === "Editor" ? "bg-surface font-medium shadow-[var(--shadow-sm)]" : "text-ink-3"}`}>{r}</span>)}</div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-[13.5px]">
          <thead className="text-[12px] text-ink-3"><tr><th className="p-3 text-left">Section</th>{ACTIONS.map((a) => <th key={a} className="p-3">{a}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{MODULES.map((m) => (
            <tr key={m}><td className="p-3">{m}</td>{ACTIONS.map((a, i) => <td key={a} className="p-3 text-center">{i < EDITOR[m] ? <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-saffron text-white"><Check size={13} /></span> : <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-line text-ink-3"><Minus size={12} /></span>}</td>)}</tr>))}</tbody>
        </table></div>
        <p className="border-t border-line px-5 py-3 text-[12px] text-ink-3">Translators and reviewers can be limited to specific languages. Every change is recorded in the activity log.</p>
      </div>
    </div>
  );
}
