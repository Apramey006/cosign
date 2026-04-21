"use client";

import type { TabEntry, UserContext } from "./types";

const CTX_KEY = "cosign.context";
const TAB_KEY = "cosign.tab";

export function loadContext(): UserContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CTX_KEY);
    return raw ? (JSON.parse(raw) as UserContext) : null;
  } catch {
    return null;
  }
}

export function saveContext(ctx: UserContext): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CTX_KEY, JSON.stringify(ctx));
}

export function clearContext(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CTX_KEY);
}

export function loadTab(): TabEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TAB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TabEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToTab(entry: TabEntry): TabEntry[] {
  const current = loadTab();
  const updated = [entry, ...current].slice(0, 50);
  if (typeof window !== "undefined") {
    localStorage.setItem(TAB_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function updateTabEntry(id: string, patch: Partial<TabEntry>): TabEntry[] {
  const current = loadTab();
  const updated = current.map((e) => (e.id === id ? { ...e, ...patch } : e));
  if (typeof window !== "undefined") {
    localStorage.setItem(TAB_KEY, JSON.stringify(updated));
  }
  return updated;
}
