"use client";
import { useState } from "react";
import { Btn, Field, Input, api } from "./ui";

export function LoginForm({ first }: { first: boolean }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await api("/api/admin/auth", "POST", { action: first ? "setup" : "login", name, email, password: pw }); window.location.href = "/admin"; }
    catch (x: any) { setErr(x.message); setBusy(false); }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-page p-5">
      <form onSubmit={go} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-[var(--shadow-md)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="mx-auto mb-4 h-16 w-16" />
        <h1 className="text-center text-[20px] font-bold tracking-[-0.02em]">{first ? "Create the owner account" : "Taptajivanam Studio"}</h1>
        <p className="mb-5 mt-1 text-center text-[13px] text-ink-3">{first ? "This is the first visit. The account you make now owns the site." : "Sign in with your email and password."}</p>
        <div className="space-y-3.5">
          {first && <Field label="Your name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>}
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></Field>
          <Field label="Password" hint={first ? "At least 8 characters." : undefined}><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete={first ? "new-password" : "current-password"} /></Field>
        </div>
        {err && <p className="mt-3 rounded-xl bg-[#fdeceb] px-3 py-2 text-[12.5px] text-[#a3281e]">{err}</p>}
        <Btn type="submit" kind="primary" busy={busy} className="mt-5 w-full">{first ? "Create account" : "Sign in"}</Btn>
      </form>
    </main>
  );
}
