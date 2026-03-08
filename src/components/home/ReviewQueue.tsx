"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { topics } from "@/lib/topics";
import { challengeRegistry } from "@/lib/challenges";
import { vizSlugs } from "@/lib/visualizations";
import {
  TOPIC_PROGRESS_EVENT,
  TOTAL_REVIEW_STAGES,
  ensureTopicReviewSchedule,
  getCompletedStepCount,
  getRequiredStepCount,
  getTopicProgressMap,
  isTopicReviewDue,
  markTopicReviewComplete,
  type TopicProgressMap,
} from "@/lib/progress";
import { lessonSupportRegistry } from "@/lib/lesson-support";

export default function ReviewQueue() {
  const [progress, setProgress] = useState<TopicProgressMap>({});

  const refreshProgress = useCallback(() => {
    const snapshot = getTopicProgressMap();

    [...topics]
      .filter((topic) => topic.status === "available")
      .forEach((topic) => {
        const hasLab = vizSlugs.has(topic.slug);
        const hasChallenge = Boolean(challengeRegistry[topic.slug]);
        const topicProgress = snapshot[topic.slug];
        const completedSteps = topicProgress
          ? getCompletedStepCount(topicProgress, hasLab, hasChallenge)
          : 0;
        const requiredSteps = getRequiredStepCount(hasLab, hasChallenge);

        if (topicProgress && completedSteps === requiredSteps && !topicProgress.completedAt) {
          ensureTopicReviewSchedule(topic.slug, hasLab, hasChallenge);
        }
      });

    setProgress(getTopicProgressMap());
  }, []);

  useEffect(() => {
    refreshProgress();
    window.addEventListener(TOPIC_PROGRESS_EVENT, refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener(TOPIC_PROGRESS_EVENT, refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
  }, [refreshProgress]);

  const reviewQueue = useMemo(() => {
    const now = Date.now();

    return [...topics]
      .filter((topic) => topic.status === "available")
      .sort((a, b) => a.order - b.order)
      .filter((topic) => {
        const hasLab = vizSlugs.has(topic.slug);
        const hasChallenge = Boolean(challengeRegistry[topic.slug]);
        const topicProgress = progress[topic.slug];

        return (
          topicProgress &&
          getCompletedStepCount(topicProgress, hasLab, hasChallenge) ===
            getRequiredStepCount(hasLab, hasChallenge)
        );
      })
      .map((topic) => {
        const topicProgress = progress[topic.slug]!;
        const due = isTopicReviewDue(topicProgress, now);

        return {
          topic,
          due,
          nextReviewAt: topicProgress.nextReviewAt,
          reviewStage: topicProgress.reviewStage,
        };
      })
      .filter((entry) => Boolean(entry.nextReviewAt))
      .sort((a, b) => {
        if (a.due !== b.due) {
          return a.due ? -1 : 1;
        }

        return new Date(a.nextReviewAt!).getTime() - new Date(b.nextReviewAt!).getTime();
      })
      .slice(0, 3);
  }, [progress]);

  function formatReviewDate(value: string | null) {
    if (!value) {
      return "Review cycle complete";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  }

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Review Queue
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Bring completed topics back into working memory with scheduled retrieval prompts.
        </p>
      </div>

      <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
        {reviewQueue.length > 0 ? (
          reviewQueue.map(({ topic, due, nextReviewAt, reviewStage }) => {
            const support = lessonSupportRegistry[topic.slug];

            return (
              <div
                key={topic.slug}
                className="rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Review {Math.min(reviewStage + 1, TOTAL_REVIEW_STAGES)}/{TOTAL_REVIEW_STAGES}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      due
                        ? "border-amber-600 bg-amber-950/20 text-amber-200"
                        : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    }`}
                  >
                    {due ? "Due now" : `Next: ${formatReviewDate(nextReviewAt)}`}
                  </span>
                </div>
                <p className="mt-3 text-xl font-semibold text-slate-50">
                  {topic.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {support?.reviewPrompt ?? topic.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-400/15"
                  >
                    Revisit topic
                    <span aria-hidden="true">{"->"}</span>
                  </Link>
                  {due && (
                    <button
                      type="button"
                      onClick={() => {
                        markTopicReviewComplete(topic.slug);
                        refreshProgress();
                      }}
                      className="rounded-full border border-white/10 bg-slate-900/75 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Mark review done
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/35 px-5 py-5 text-sm leading-6 text-slate-400 lg:col-span-3">
            Finish a topic to start a spaced-review cycle. The first retrieval prompt will be scheduled automatically after completion.
          </div>
        )}
      </div>
    </section>
  );
}
