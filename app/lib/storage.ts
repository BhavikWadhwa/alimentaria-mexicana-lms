export const STORAGE_KEYS = { lessons:"baysics.completedLessons",quiz:"baysics.quizResults",checklists:"baysics.checklists",preferences:"baysics.preferences",waste:"baysics.wasteLogs",operations:"baysics.operations" } as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function resetDemoStorage() {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new Event("baysics-storage"));
}
