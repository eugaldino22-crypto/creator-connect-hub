/**
 * QA / Preview layer — DEVELOPMENT ONLY.
 *
 * Lets us look at every screen as if we had a different role, without ever
 * touching real roles, RLS, auth or any backend permission. In production
 * `QA_ENABLED` is false and every helper below becomes a no-op.
 */
import { useCallback, useEffect, useState } from "react";

export type QaRole = "subscriber" | "creator" | "admin" | "super_admin";

export const QA_ENABLED = import.meta.env.DEV;

const ROLE_KEY = "secret.qa.previewRole";
const UNLOCK_KEY = "secret.qa.unlocked";
const EVENT = "secret-qa-change";

export const QA_ROLES: { value: QaRole; label: string }[] = [
  { value: "subscriber", label: "Assinante" },
  { value: "creator", label: "Criador" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

function read(key: string): string | null {
  if (!QA_ENABLED || typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  if (!QA_ENABLED || typeof window === "undefined") return;
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function getPreviewRole(): QaRole | null {
  const value = read(ROLE_KEY);
  return QA_ROLES.some((role) => role.value === value) ? (value as QaRole) : null;
}

export function getPreviewUnlocked(): boolean {
  return read(UNLOCK_KEY) === "1";
}

/** Roles the UI should behave as while previewing. Never persisted in the database. */
export function previewRolesFor(role: QaRole): QaRole[] {
  return [role];
}

export function useQaPreview() {
  const [state, setState] = useState(() => ({
    role: getPreviewRole(),
    unlocked: getPreviewUnlocked(),
  }));

  useEffect(() => {
    if (!QA_ENABLED) return;
    const sync = () => setState({ role: getPreviewRole(), unlocked: getPreviewUnlocked() });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setRole = useCallback((role: QaRole | null) => write(ROLE_KEY, role), []);
  const setUnlocked = useCallback((value: boolean) => write(UNLOCK_KEY, value ? "1" : null), []);

  return {
    enabled: QA_ENABLED,
    role: QA_ENABLED ? state.role : null,
    unlocked: QA_ENABLED ? state.unlocked : false,
    setRole,
    setUnlocked,
  };
}

/** True when the QA layer should show exclusive content as unlocked (visual only). */
export function useQaUnlocked() {
  return useQaPreview().unlocked;
}
