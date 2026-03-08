"use client";

import { topics, type TopicMeta } from "@/lib/topics";
import {
  TOPIC_PROGRESS_EVENT,
  getCompletedStepCount,
  getRequiredStepCount,
  getTopicProgressMap,
  type TopicProgressMap,
} from "@/lib/progress";
import { challengeRegistry } from "@/lib/challenges";
import { vizSlugs } from "@/lib/visualizations";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NextRecommendedTopic from "@/components/topic/NextRecommendedTopic";

const difficultyColors: Record<TopicMeta["difficulty"], string> = {
  beginner: "border-emerald-700 bg-emerald-950/40 text-emerald-200",
  intermediate: "border-amber-700 bg-amber-950/40 text-amber-200",
  advanced: "border-rose-700 bg-rose-950/40 text-rose-200",
};

export default function Home() {
  const [progress, setProgress] = useState<TopicProgressMap>({});

  useEffect(() => {
    function refresh() {
      setProgress(getTopicProgressMap());
    }

    refresh();
    window.addEventListener(TOPIC_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(TOPIC_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const sorted = useMemo(() => [...topics].sort((a, b) => a.order - b.order), []);
  const availableTopics = sorted.filter((topic) => topic.status === "available");
  const completedCount = availableTopics.filter((topic) => {
    const hasLab = vizSlugs.has(topic.slug);
    const hasChallenge = Boolean(challengeRegistry[topic.slug]);
    const topicProgress = progress[topic.slug];

    return (
      topicProgress &&
      getCompletedStepCount(topicProgress, hasLab, hasChallenge) ===
        getRequiredStepCount(hasLab, hasChallenge)
    );
  }).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-14">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45 px-5 py-8 shadow-[0_24px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:px-7 md:rounded-[36px] md:px-10 md:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-cyan-300/20 via-transparent to-amber-300/10" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Interactive Course Hub
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-6xl">
              Learn DS&amp;A and OOP through labs, motion, and code.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base md:text-lg md:leading-8">
              Each topic combines concept notes, a guided visual activity, and a Java challenge so students can move from explanation to execution in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#topics"
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
              >
                Browse Topics
              </a>
              <div className="rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 text-sm text-slate-300">
                {completedCount}/{availableTopics.length} topics completed
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HeroMetric label="Topics" value={String(availableTopics.length)} detail="Available now" />
            <HeroMetric label="Experience" value="3-Part" detail="Concept, lab, challenge" />
            <HeroMetric label="Focus" value="Java" detail="Built around your course flow" />
          </div>
        </div>
      </section>

      <section id="topics" className="mt-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Topic Path
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-50">Choose a lab sequence</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Start with the fundamentals, then move into recursion, collections, linked structures, and algorithms as the activities become more analytical.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((topic, index) => {
            const isAvailable = topic.status === "available";
            const hasLab = vizSlugs.has(topic.slug);
            const hasChallenge = Boolean(challengeRegistry[topic.slug]);
            const topicProgress = progress[topic.slug];
            const completedSteps = topicProgress
              ? getCompletedStepCount(topicProgress, hasLab, hasChallenge)
              : 0;
            const requiredSteps = getRequiredStepCount(hasLab, hasChallenge);
            const isComplete = completedSteps === requiredSteps;

            const content = (
              <TopicCard
                topic={topic}
                order={index + 1}
                isComplete={Boolean(isComplete)}
                completedSteps={completedSteps}
                requiredSteps={requiredSteps}
              />
            );

            return (
              <div key={topic.slug} className="relative">
                {isAvailable ? (
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="group block h-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 shadow-[0_16px_60px_rgba(2,6,23,0.32)] transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/70 md:rounded-[28px]"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="block h-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/25 opacity-55 md:rounded-[28px]">
                    {content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <NextRecommendedTopic />
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-900/75 px-4 py-4 md:rounded-[24px] md:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function TopicCard({
  topic,
  order,
  isComplete,
  completedSteps,
  requiredSteps,
}: {
  topic: TopicMeta;
  order: number;
  isComplete: boolean;
  completedSteps: number;
  requiredSteps: number;
}) {
  return (
    <div className="relative flex h-full flex-col p-5 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-white/6 via-transparent to-transparent" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <span className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          Unit {String(order).padStart(2, "0")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {isComplete && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              Complete
            </span>
          )}
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
            {completedSteps}/{requiredSteps} steps
          </span>
          {topic.status !== "available" && (
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-5">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${difficultyColors[topic.difficulty]}`}>
          {topic.difficulty}
        </span>
        <h3 className="mt-4 text-xl font-semibold text-slate-50 transition-colors group-hover:text-cyan-200 md:text-2xl">
          {topic.title}
        </h3>
        <p className="mt-2 text-sm text-slate-300">{topic.subtitle}</p>
        <p className="mt-4 text-sm leading-7 text-slate-400">{topic.description}</p>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2">
        {topic.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
