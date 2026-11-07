import type { Instrumentation } from "next";

/** Every error the server meets is kept (in the site_errors table) so it can be found and fixed. */
export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { sql, hasDb } = await import("@/lib/db"); if (!hasDb()) return;
    const e = err as any; const msg = String(e?.message || e).slice(0, 2000);
    if (/NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR/.test(msg) || e?.digest?.startsWith?.("NEXT_")) return;
    await sql`insert into site_errors (side, path, message, stack, digest, ua) values ('server', ${String(request.path).slice(0, 500)}, ${msg}, ${String(e?.stack || "").slice(0, 4000)}, ${e?.digest ? String(e.digest) : null}, ${String((request.headers as any)?.["user-agent"] || "").slice(0, 300)})`;
  } catch {}
};
