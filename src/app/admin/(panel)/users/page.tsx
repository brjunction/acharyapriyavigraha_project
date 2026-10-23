import { UserPlus, ShieldCheck, Check, Minus } from "lucide-react";

const USERS = [
  ["Super Admin", "admin", "Super Admin", "All", "Active", "now"],
  ["Madhavananda Dāsa", "madhavananda", "Editor", "Lectures, Quotes", "Active", "12 min ago"],
  ["Vraja Kishori D.D.", "vrajakishori", "Admin", "All content", "Active", "yesterday"],
  ["Hindi team lead", "hindi.lead", "Language Reviewer", "हिन्दी", "Active", "1 h ago"],
  ["Odia translator", "odia.tr1", "Translator", "ଓଡ଼ିଆ", "Active", "3 days ago"],
  ["Transcriber", "transcribe01", "Transcriber", "Transcriptions", "Invited", "-"],
];
const MODULES = ["Lectures", "Quotes", "Books", "Gallery", "Translations", "Site builder", "Users"];
const ACTIONS = ["View", "Create", "Edit", "Publish", "Delete"];
const EDITOR: Record<string, number> = { Lectures: 4, Quotes: 4, Books: 3, Gallery: 3, Translations: 1, "Site builder": 1, Users: 0 };

export default function Users() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-serif text-3xl">Users</h1><p className="text-sm text-ink-3">Only admins create accounts. Each person gets a user ID, a password and one or more roles.</p></div>
        <button className="flex items-center gap-2 rounded-lg bg-maroon px-3.5 py-2 text-sm font-medium text-paper"><UserPlus size={15} />Invite user</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-left text-xs uppercase tracking-wider text-ink-3"><tr><th className="p-3">Name</th><th className="hidden p-3 sm:table-cell">User ID</th><th className="p-3">Role</th><th className="hidden p-3 md:table-cell">Scope</th><th className="p-3">Status</th><th className="hidden p-3 md:table-cell">Last active</th></tr></thead>
          <tbody className="divide-y divide-line">
            {USERS.map(([n, id, r, s, st, la]) => (
              <tr key={id} className="hover:bg-paper-2/50">
                <td className="p-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-soft text-xs font-medium">{n[0]}</span>{n}</div></td>
                <td className="hidden p-3 font-mono text-xs text-ink-2 sm:table-cell">{id}</td>
                <td className="p-3"><span className="rounded-full bg-maroon/10 px-2 py-0.5 text-xs text-maroon">{r}</span></td>
                <td className="hidden p-3 text-ink-2 md:table-cell">{s}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${st === "Active" ? "bg-tulasi-soft text-tulasi" : "bg-saffron-soft text-saffron"}`}>{st}</span></td>
                <td className="hidden p-3 text-ink-3 md:table-cell">{la}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto border-b border-line px-5 py-4">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-tulasi" /><h2 className="font-medium">Role: Editor</h2></div>
          <div className="flex gap-1 rounded-lg bg-paper-2 p-1 text-xs">{["Admin", "Editor", "Contributor", "Transcriber", "Translator", "Reviewer"].map((r) => <span key={r} className={`rounded-md px-2.5 py-1 ${r === "Editor" ? "bg-card font-medium shadow-sm" : "text-ink-3"}`}>{r}</span>)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-3"><tr><th className="p-3 text-left">Module</th>{ACTIONS.map((a) => <th key={a} className="p-3">{a}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {MODULES.map((m) => (
                <tr key={m}><td className="p-3">{m}</td>{ACTIONS.map((a, i) => (
                  <td key={a} className="p-3 text-center">{i < EDITOR[m] ? <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-tulasi text-white"><Check size={13} /></span> : <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-line text-ink-3"><Minus size={12} /></span>}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-5 py-3 text-xs text-ink-3">Translators and reviewers can also be limited to specific languages. Every change is recorded in the audit log.</p>
      </div>
    </div>
  );
}
