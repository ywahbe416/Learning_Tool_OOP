const STORAGE_KEY = "ds-oop-progress";

export function getProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markChallengeComplete(slug: string): void {
  if (typeof window === "undefined") return;
  const progress = getProgress();
  progress[slug] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
