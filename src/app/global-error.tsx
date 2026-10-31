"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#fff", color: "#1a1a1a" }}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <p style={{ letterSpacing: "0.25em", textTransform: "uppercase", fontSize: 11, color: "#853500" }}>Taptajīvanam</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 30, margin: "12px 0 8px" }}>Something went wrong</h1>
        <p style={{ color: "#555", fontSize: 14 }}>Please try again in a moment.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={reset} style={{ height: 40, padding: "0 20px", borderRadius: 999, border: 0, background: "#1a1a1a", color: "#fff", cursor: "pointer" }}>Try again</button><a href="/" style={{ height: 40, padding: "0 20px", borderRadius: 999, border: "1px solid #ddd", display: "inline-flex", alignItems: "center", color: "#1a1a1a", textDecoration: "none" }}>Home</a></div>
      </div>
    </body></html>
  );
}
