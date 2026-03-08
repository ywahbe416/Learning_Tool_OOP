const STORAGE_KEY = "ds-oop-progress";
export const TOPIC_PROGRESS_EVENT = "topic-progress-updated";

export type TopicStep = "concept" | "lab" | "challenge";

export interface TopicProgress {
  concept: boolean;
  lab: boolean;
  challenge: boolean;
}

export type TopicProgressMap = Record<string, TopicProgress>;

const EMPTY_PROGRESS: TopicProgress = {
  concept: false,
  lab: false,
  challenge: false,
};

function normalizeProgress(value: unknown): TopicProgress {
  if (value === true) {
    return {
      concept: true,
      lab: true,
      challenge: true,
    };
  }

  if (!value || typeof value !== "object") {
    return { ...EMPTY_PROGRESS };
  }

  const candidate = value as Partial<TopicProgress>;
  return {
    concept: Boolean(candidate.concept),
    lab: Boolean(candidate.lab),
    challenge: Boolean(candidate.challenge),
  };
}

export function getTopicProgressMap(): TopicProgressMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, value]) => [slug, normalizeProgress(value)])
    );
  } catch {
    return {};
  }
}

export function getTopicProgress(slug: string): TopicProgress {
  const progress = getTopicProgressMap();
  return progress[slug] ?? { ...EMPTY_PROGRESS };
}

function persistProgress(progress: TopicProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent(TOPIC_PROGRESS_EVENT));
}

export function markTopicStepComplete(slug: string, step: TopicStep): void {
  if (typeof window === "undefined") return;

  const progress = getTopicProgressMap();
  const current = progress[slug] ?? { ...EMPTY_PROGRESS };
  progress[slug] = {
    ...current,
    [step]: true,
  };

  persistProgress(progress);
}

export function markChallengeComplete(slug: string): void {
  markTopicStepComplete(slug, "challenge");
}

export function getCompletedStepCount(progress: TopicProgress, hasLab = true, hasChallenge = true): number {
  return Number(progress.concept) + Number(hasLab && progress.lab) + Number(hasChallenge && progress.challenge);
}

export function getRequiredStepCount(hasLab = true, hasChallenge = true): number {
  return 1 + Number(hasLab) + Number(hasChallenge);
}
