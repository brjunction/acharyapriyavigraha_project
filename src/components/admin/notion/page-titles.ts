"use client";
import { useSyncExternalStore } from "react";
import { api } from "../ui";

/** One shared, live list of page titles and icons, so links and sub-pages always show the current name (no "Untitled" flash). */
type T = { title: string; icon?: string; path?: string };
let map = new Map<string, T>(); let loaded = false; let loading: Promise<void> | null = null; const subs = new Set<() => void>();
const emit = () => { map = new Map(map); subs.forEach((f) => f()); };
export function loadTitles(force = false) {
  if (loading && !force) return loading;
  loading = api<any[]>("/api/admin/pages").then((r) => { map = new Map(r.map((p) => [p.id, { title: p.title, icon: p.icon || "", path: p.path }])); loaded = true; emit(); }).catch(() => {}).finally(() => { loading = null; });
  return loading;
}
export function setTitle(id: string, t: T) { map.set(id, t); emit(); }
if (typeof window !== "undefined") window.addEventListener("tj:pages-changed", () => { loadTitles(true); });
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function usePageTitle(id: string): T | undefined {
  const m = useSyncExternalStore(subscribe, () => map, () => map);
  if (!loaded && !loading && typeof window !== "undefined") queueMicrotask(() => loadTitles());
  return m.get(id);
}
