"use client";
/* Draws its children at the very top of the page (in <body>), so a popup is never covered by a section that sits in
   its own layer (animations, transforms, overflow) — the reason "Show the letter" could slip behind the next section. */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  return on ? createPortal(children, document.body) : null;
}
