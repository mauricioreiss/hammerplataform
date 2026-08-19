/**
 * Workout session persistence helpers.
 *
 * Saves the entire in-progress workout state to localStorage so the student
 * can switch apps, receive calls, or close the browser without losing progress.
 * On resume, the elapsed time is corrected using the wall-clock delta so the
 * workout timer stays accurate even when the tab was hidden.
 */

const STORAGE_KEY_PREFIX = "hammer_session_";

/** Shape that is written to / read from localStorage. */
export type PersistedSession = {
  workoutId: string;
  startedAt: string; // ISO timestamp of session start
  savedAt: number; // Date.now() at the moment of the last save
  elapsed: number; // seconds accumulated BEFORE the last save
  /** Set indices (0-based) already completed per exercise. */
  completedSets: Record<string, number[]>;
  /** Recorded load per exercise. */
  weights: Record<string, string>;
  expandedId: string | null;
};

function storageKey(workoutId: string): string {
  return `${STORAGE_KEY_PREFIX}${workoutId}`;
}

export function saveSession(data: PersistedSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(data.workoutId), JSON.stringify(data));
  } catch {
    // Silently tolerate write failures (private mode, storage full, etc.)
  }
}

/**
 * Load a persisted session and adjust `elapsed` to include the seconds the
 * browser was hidden/closed since the last save.
 */
export function loadSession(workoutId: string): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(workoutId));
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedSession;
    // Add the time that passed while the tab was away.
    const deltaSeconds = Math.floor((Date.now() - data.savedAt) / 1000);
    data.elapsed = data.elapsed + Math.max(0, deltaSeconds);
    data.savedAt = Date.now();
    return data;
  } catch {
    return null;
  }
}

export function clearSession(workoutId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(workoutId));
  } catch {
    // Silently tolerate
  }
}

/**
 * Parse the `sets` field from an exercise (e.g. "4", "3-4", "4x12", "4 séries")
 * into a concrete integer. Returns 1 as the safe default if parsing fails.
 */
export function parseSetsCount(setsRaw: string | null | undefined): number {
  if (!setsRaw) return 1;
  // Match the first integer in the string.
  const match = setsRaw.match(/\d+/);
  if (!match) return 1;
  const n = parseInt(match[0], 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 1;
}
