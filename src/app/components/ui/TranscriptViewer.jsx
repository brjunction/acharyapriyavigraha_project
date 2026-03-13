"use client";

import { useEffect, useState } from "react";

// ── Build the export URL from any Google Docs share URL ──────────────────────
function toExportUrl(commentUrl) {
  try {
    const match = new URL(commentUrl).pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    return `https://docs.google.com/document/d/${match[1]}/export?format=html`;
  } catch {
    return null;
  }
}

// ── The 6 CSS properties we want to keep ────────────────────────────────────
const ALLOWED = new Set([
  "font-weight",
  "font-style",
  "text-decoration",
  "background-color",
  "color",
  "text-align",
]);

/**
 * Parse every rule in the Google Docs <style> blocks.
 * Returns a Map: className (string) → { prop: value } for ALLOWED props only.
 *
 * Google Docs exports look like:
 *   .c4{font-style:italic}
 *   .c10{font-weight:700;text-decoration:none;...}
 *   .c15{text-align:center;...}
 */
function parseDocsCssClasses(styleText) {
  const map = new Map(); // "c4" → { "font-style": "italic" }
  // Match .className { declarations }
  const ruleRe = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(styleText)) !== null) {
    const cls = m[1];
    const decls = m[2];
    const props = {};
    decls.split(";").forEach((d) => {
      const ci = d.indexOf(":");
      if (ci === -1) return;
      const prop = d.slice(0, ci).trim().toLowerCase();
      const value = d.slice(ci + 1).trim();
      if (
        ALLOWED.has(prop) &&
        value &&
        value !== "none" &&
        value !== "inherit"
      ) {
        // Special-case: text-decoration:none means no underline — skip it
        // BUT we DO want underline/line-through, so only skip "none"
        if (prop === "text-decoration" && value === "none") return;
        props[prop] = value;
      }
    });
    if (Object.keys(props).length) map.set(cls, props);
  }
  return map;
}

/**
 * Walk every element in the body:
 * 1. Look up its class list in the cssMap → collect allowed props.
 * 2. Also check any existing inline style → collect allowed props (overrides class).
 * 3. Write the merged result as a clean inline style="…".
 * 4. Strip ALL other attributes (class, id, dir, lang, …) — keep colspan/rowspan.
 */
function applyAndStrip(root, cssMap) {
  if (root.nodeType !== Node.ELEMENT_NODE) return;

  // Step 1: merge props from CSS classes
  const merged = {};
  const classes = (root.getAttribute("class") || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  classes.forEach((cls) => {
    const props = cssMap.get(cls);
    if (props) Object.assign(merged, props);
  });

  // Step 2: also read inline style (rarely set by Google Docs but just in case)
  const inline = root.getAttribute("style") || "";
  inline.split(";").forEach((d) => {
    const ci = d.indexOf(":");
    if (ci === -1) return;
    const prop = d.slice(0, ci).trim().toLowerCase();
    const value = d.slice(ci + 1).trim();
    if (ALLOWED.has(prop) && value && value !== "none" && value !== "inherit") {
      if (prop === "text-decoration" && value === "none") return;
      merged[prop] = value;
    }
  });

  // Step 3: write clean inline style
  const kept = Object.entries(merged).map(([p, v]) => `${p}:${v}`);
  if (kept.length) {
    root.setAttribute("style", kept.join(";"));
  } else {
    root.removeAttribute("style");
  }

  // Step 4: strip every other attribute
  const KEEP_ATTRS = new Set(["style", "colspan", "rowspan"]);
  const toRemove = [...root.attributes]
    .map((a) => a.name)
    .filter((n) => !KEEP_ATTRS.has(n));
  toRemove.forEach((a) => root.removeAttribute(a));

  // Recurse into children
  for (const child of root.childNodes) applyAndStrip(child, cssMap);
}

// ── Main processor ───────────────────────────────────────────────────────────
function processGoogleDocsHtml(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  // 1. Collect all CSS text BEFORE removing head
  const styleText = [...doc.querySelectorAll("style")]
    .map((s) => s.textContent)
    .join("\n");

  const cssMap = parseDocsCssClasses(styleText);

  // 2. Kill <head> — no more original stylesheets
  doc.head?.remove();

  const body = doc.body;
  if (!body) return "";

  // 3. Cut everything before "Recording_Transcript_Section"
  const SENTINEL = "Recording_Transcript_Section";
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let sentinelFound = false;
  while (walker.nextNode()) {
    const tn = walker.currentNode;
    const idx = tn.textContent.indexOf(SENTINEL);
    if (idx !== -1) {
      // Keep only text after the sentinel in this node
      tn.textContent = tn.textContent.slice(idx + SENTINEL.length);
      // Find this node's direct-child-of-body ancestor
      let topBlock = tn;
      while (topBlock.parentNode && topBlock.parentNode !== body) {
        topBlock = topBlock.parentNode;
      }
      // Remove all preceding siblings
      while (topBlock.previousSibling)
        body.removeChild(topBlock.previousSibling);
      // If the sentinel's own block is now blank, drop it too
      if (!topBlock.textContent.trim()) body.removeChild(topBlock);
      break;
    }
  }
  // If sentinel not found, render everything (fallback)

  // 4. Walk every element and apply
  for (const child of body.childNodes) applyAndStrip(child, cssMap);

  // Google Docs wraps body in one top-level <div> — unwrap it
  const topDiv = body.querySelector(":scope > div");
  return topDiv ? topDiv.innerHTML : body.innerHTML;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function TranscriptViewer({ commentUrl, title }) {
  const [html, setHtml] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!commentUrl) return;
    const exportUrl = toExportUrl(commentUrl);
    if (!exportUrl) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    fetch(exportUrl)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((raw) => {
        setHtml(processGoogleDocsHtml(raw));
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [commentUrl]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-[#8c2044] animate-spin" />
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          Loading transcript…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 px-8 py-12 text-center">
        <p className="text-sm font-semibold text-red-500 mb-1">
          Could not load transcript
        </p>
        <p className="text-xs text-red-400">
          The document may not be publicly accessible.
        </p>
      </div>
    );
  }

  if (!html) return null;

  return (
    <>
      <style>{`
        /*
          Reset ONLY layout/font properties we own — using !important so
          Google Docs remnants can't bleed through.

          We do NOT touch font-weight, font-style, text-decoration,
          background-color, color, or text-align here — those come from
          the inline styles we wrote above and must win freely.
        */
        .tb { font-family: var(--font-inria, "Inria Serif", sans-serif); }
        .tb * {
          font-family: var(--font-inria, "Inria Serif", sans-serif) !important;
          font-size:   18px !important;
          line-height: 1.7  !important;
          margin:  0 !important;
          padding: 0 !important;
          vertical-align: baseline !important;
        }
/* Mobile screens */
@media (max-width: 768px) {
  .tb * {
    font-size: 15px !important;
  }
}
        /* Semantic HTML tag defaults (belt-and-braces) */
        .tb b, .tb strong { font-weight: 700; }
        .tb i, .tb em     { font-style:  italic; }
        .tb u             { text-decoration: underline; }

        /* Paragraph & heading rhythm */
        .tb p            { margin-bottom: 1em !important; }
        .tb h1, .tb h2,
        .tb h3, .tb h4   { margin-bottom: 0.6em !important; margin-top: 1.4em !important; font-weight: 700; }
        .tb h1           { font-size: 22px !important; }
        .tb h2           { font-size: 20px !important; }
        .tb h3           { font-size: 18px !important; }
        .tb br           { display: block; content: ""; margin-bottom: 0.4em !important; }

        /* Horizontal rule */
        .tb hr           { border: none; border-top: 1px solid #e7e5e4; margin: 1.5em 0 !important; }

        /* Lists */
        .tb ul { list-style: disc;    padding-left: 1.6em !important; margin-bottom: 1em !important; }
        .tb ol { list-style: decimal; padding-left: 1.6em !important; margin-bottom: 1em !important; }
        .tb li { margin-bottom: 0.3em !important; }

        /* Tables */
        .tb table { border-collapse: collapse; width: 100%; margin-bottom: 1em !important; }
        .tb td, .tb th { border: 1px solid #e7e5e4; padding: 0.5em 0.75em !important; vertical-align: top !important; }

        /* Bold without explicit color → pinkish red */
.tb [style*="font-weight:700"]:not([style*="color"]),
.tb [style*="font-weight: 700"]:not([style*="color"]) {
  color: #8b1a3a;
}

/* Italic, not centered, without explicit color → pink */
.tb [style*="font-style:italic"]:not([style*="text-align:center"]):not([style*="text-align: center"]):not([style*="color"]) {
  color: #963C83;
}
 /* Centered text and all children → saffron */
.tb [style*="text-align:center"],
.tb [style*="text-align: center"],
.tb [style*="text-align:center"] *,
.tb [style*="text-align: center"] * {
  color: #9C3700 !important;
}
      `}</style>

      <div
        className="tb text-stone-800 select-text"
        dangerouslySetInnerHTML={{ __html: html }}
        aria-label={`Transcript for ${title}`}
      />
    </>
  );
}
