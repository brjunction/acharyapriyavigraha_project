"use client";
/* IAST typing, everywhere on the site and in the Studio: type a letter, then tap Shift on its own (left or right) —
   the letter before the cursor turns into its diacritic form; tap again for the next form, and back.
   a→ā · i→ī · u→ū · r→ṛ→ṝ · l→ḷ→ḹ · n→ṇ→ṅ→ñ · t→ṭ · d→ḍ · s→ś→ṣ · m→ṁ · h→ḥ (capitals too).
   Holding Shift to type a capital works as always: only a Shift tapped alone changes a letter.
   Works in text boxes and in rich editors (the transcription editor). Can be turned off: localStorage tj_iast = "0". */
import { useEffect } from "react";

const CYCLES = ["aā", "iī", "uū", "rṛṝ", "lḷḹ", "nṇṅñ", "tṭ", "dḍ", "sśṣ", "mṁ", "hḥ", "AĀ", "IĪ", "UŪ", "RṚṜ", "LḶḸ", "NṆṄÑ", "TṬ", "DḌ", "SŚṢ", "MṀ", "HḤ"].map((c) => Array.from(c));
const NEXT = new Map<string, string>(); CYCLES.forEach((c) => c.forEach((ch, i) => NEXT.set(ch, c[(i + 1) % c.length])));
const SKIP = new Set(["password", "email", "url", "number", "date", "time", "tel", "search-off"]);

function setNative(el: HTMLInputElement | HTMLTextAreaElement, v: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
}
function cycleField(el: HTMLInputElement | HTMLTextAreaElement) {
  const at = el.selectionStart ?? 0; if (at < 1 || el.selectionEnd !== at) return false;
  const ch = el.value[at - 1]; const nx = NEXT.get(ch); if (!nx) return false;
  setNative(el, el.value.slice(0, at - 1) + nx + el.value.slice(at)); el.setSelectionRange(at, at); return true;
}
function cycleEditable() {
  const sel = window.getSelection(); if (!sel || !sel.isCollapsed || !sel.rangeCount) return false;
  const r = sel.getRangeAt(0); const node = r.startContainer; const off = r.startOffset;
  if (node.nodeType !== 3 || off < 1) return false;
  const ch = (node.textContent || "")[off - 1]; const nx = NEXT.get(ch); if (!nx) return false;
  const pick = document.createRange(); pick.setStart(node, off - 1); pick.setEnd(node, off); sel.removeAllRanges(); sel.addRange(pick);
  return document.execCommand("insertText", false, nx);
}

export function IastKeys() {
  useEffect(() => {
    let armed = 0; // when Shift went down with nothing else
    const down = (e: KeyboardEvent) => { if (e.key === "Shift" && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) armed = Date.now(); else armed = 0; };
    const up = (e: KeyboardEvent) => {
      if (e.key !== "Shift" || !armed || Date.now() - armed > 700) { if (e.key === "Shift") armed = 0; return; } armed = 0;
      try { if (localStorage.getItem("tj_iast") === "0") return; } catch {}
      const el = document.activeElement as HTMLElement | null; if (!el) return;
      if (el instanceof HTMLInputElement) { if (SKIP.has(el.type) || el.readOnly || el.disabled) return; cycleField(el); return; }
      if (el instanceof HTMLTextAreaElement) { if (el.readOnly || el.disabled) return; cycleField(el); return; }
      if (el.isContentEditable) cycleEditable();
    };
    const reset = () => { armed = 0; };
    window.addEventListener("keydown", down, true); window.addEventListener("keyup", up, true); window.addEventListener("mousedown", reset, true); window.addEventListener("blur", reset);
    return () => { window.removeEventListener("keydown", down, true); window.removeEventListener("keyup", up, true); window.removeEventListener("mousedown", reset, true); window.removeEventListener("blur", reset); };
  }, []);
  return null;
}
