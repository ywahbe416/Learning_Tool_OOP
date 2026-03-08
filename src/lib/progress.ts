const STORAGE_KEY = "ds-oop-progress";
export const TOPIC_PROGRESS_EVENT = "topic-progress-updated";
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;
export const TOTAL_REVIEW_STAGES = REVIEW_INTERVAL_DAYS.length;

export type TopicStep = "concept" | "lab" | "challenge";

export interface TopicProgress {
  concept: boolean;
  lab: boolean;
  challenge: boolean;
  completedAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewStage: number;
}

export type TopicProgressMap = Record<string, TopicProgress>;

const EMPTY_PROGRESS: TopicProgress = {
  concept: false,
  lab: false,
  challenge: false,
  completedAt: null,
  lastReviewedAt: null,
  nextReviewAt: null,
  reviewStage: 0,
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getSafeDateString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return Number.isNaN(new Date(value).getTime()) ? null : value;
}

function getSafeReviewStage(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function normalizeProgress(value: unknown): TopicProgress {
  if (value === true) {
    return {
      ...EMPTY_PROGRESS,
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
    completedAt: getSafeDateString(candidate.completedAt),
    lastReviewedAt: getSafeDateString(candidate.lastReviewedAt),
    nextReviewAt: getSafeDateString(candidate.nextReviewAt),
    reviewStage: getSafeReviewStage(candidate.reviewStage),
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

export function ensureTopicReviewSchedule(
  slug: string,
  hasLab = true,
  hasChallenge = true
): void {
  if (typeof window === "undefined") return;

  const progress = getTopicProgressMap();
  const current = progress[slug] ?? { ...EMPTY_PROGRESS };
  const completed = getCompletedStepCount(current, hasLab, hasChallenge);
  const required = getRequiredStepCount(hasLab, hasChallenge);

  if (completed < required || current.completedAt) {
    return;
  }

  const completedAt = new Date();
  progress[slug] = {
    ...current,
    completedAt: completedAt.toISOString(),
    nextReviewAt: addDays(completedAt, REVIEW_INTERVAL_DAYS[0]).toISOString(),
    reviewStage: 0,
  };

  persistProgress(progress);
}

export function markTopicReviewComplete(slug: string): void {
  if (typeof window === "undefined") return;

  const progress = getTopicProgressMap();
  const current = progress[slug] ?? { ...EMPTY_PROGRESS };
  const reviewMoment = new Date();
  const nextStage = current.reviewStage + 1;
  const nextReviewAt =
    nextStage < REVIEW_INTERVAL_DAYS.length
      ? addDays(reviewMoment, REVIEW_INTERVAL_DAYS[nextStage]).toISOString()
      : null;

  progress[slug] = {
    ...current,
    completedAt: current.completedAt ?? reviewMoment.toISOString(),
    lastReviewedAt: reviewMoment.toISOString(),
    nextReviewAt,
    reviewStage: nextStage,
  };

  persistProgress(progress);
}

export function isTopicReviewDue(progress: TopicProgress, referenceTime = Date.now()): boolean {
  if (!progress.nextReviewAt) {
    return false;
  }

  return new Date(progress.nextReviewAt).getTime() <= referenceTime;
}
