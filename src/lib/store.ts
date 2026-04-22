"use client";

import { FOLLOW_UP_MS } from "./ledger";
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
  const updated = current.map((e) => {
    if (e.id !== id) return e;
    const next: TabEntry = { ...e, ...patch };
    // When purchased becomes true, schedule a 30-day follow-up if one isn't set.
    if (patch.purchased === true && !next.followUpAt) {
      const createdMs = new Date(e.createdAt).getTime();
      const anchorMs = !isNaN(createdMs) ? createdMs : Date.now();
      next.followUpAt = new Date(anchorMs + FOLLOW_UP_MS).toISOString();
    }
    // When user answers stillGlad, clear the pending follow-up.
    if (patch.stillGlad === true || patch.stillGlad === false) {
      // Leave followUpAt as a historical timestamp; it's now satisfied.
    }
    return next;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(TAB_KEY, JSON.stringify(updated));
  }
  return updated;
}
