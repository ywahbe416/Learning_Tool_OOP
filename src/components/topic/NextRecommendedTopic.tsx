"use client";

import Link from "next/link";
import { topics } from "@/lib/topics";
import { challengeRegistry } from "@/lib/challenges";
import { vizSlugs } from "@/lib/visualizations";
import {
  TOPIC_PROGRESS_EVENT,
  getCompletedStepCount,
  getRequiredStepCount,
  getTopicProgressMap,
} from "@/lib/progress";
import { useEffect, useMemo, useState } from "react";

interface NextRecommendedTopicProps {
  currentSlug?: string;
}

export default function NextRecommendedTopic({
  currentSlug,
}: NextRecommendedTopicProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setIsHydrated(true);

    function refresh() {
      setTick((value) => value + 1);
    }

    window.addEventListener(TOPIC_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TOPIC_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const recommendation = useMemo(() => {
    if (!isHydrated) {
      return null;
    }

    const progress = getTopicProgressMap();
    const available = [...topics]
      .filter((topic) => topic.status === "available")
      .sort((a, b) => a.order - b.order);

    const incomplete = available.find((topic) => {
      const hasLab = vizSlugs.has(topic.slug);
      const hasChallenge = Boolean(challengeRegistry[topic.slug]);
      const topicProgress = progress[topic.slug];
      const completed = topicProgress
        ? getCompletedStepCount(topicProgress, hasLab, hasChallenge)
        : 0;
      return completed < getRequiredStepCount(hasLab, hasChallenge);
    });

    if (!currentSlug) {
      return incomplete ?? available[0] ?? null;
    }

    if (incomplete && incomplete.slug !== currentSlug) {
      return incomplete;
    }

    const currentIndex = available.findIndex((topic) => topic.slug === currentSlug);
    return available[currentIndex + 1] ?? available[0] ?? null;
  }, [currentSlug, isHydrated, tick]);

  if (!recommendation || recommendation.slug === currentSlug) {
    return null;
  }

  return (
    <section className="animate-fade-up overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Next Recommended
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Keep momentum by moving directly into the next topic that still has unfinished steps.
        </p>
      </div>
      <div className="px-6 py-6">
        <div className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          Continue Your Path
        </div>
        <p className="mt-4 text-2xl font-semibold text-slate-50">{recommendation.title}</p>
        <p className="mt-2 text-sm text-slate-300">{recommendation.subtitle}</p>
        <p className="mt-4 text-sm leading-7 text-slate-400">{recommendation.description}</p>
        <Link
          href={`/topics/${recommendation.slug}`}
          className="animate-soft-glow mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
        >
          <span>Open {recommendation.title}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
