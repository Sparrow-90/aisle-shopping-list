import type { AppState } from '../types';

// Don't rename: that would orphan the user's saved list. Migrate inside loadState() instead.
export const STORE_KEY = 'dp-aisle-sorted-shopping-list.v1';

export const emptyState = (): AppState => ({ v: 1, items: [], history: {}, learned: {} });

/** Returns null when storage is blocked. */
export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
  } catch {
    return null;
  }
}

/** Returns false when the browser refuses to store. */
export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
