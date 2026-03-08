"use client";

import {
  TOPIC_PROGRESS_EVENT,
  getCompletedStepCount,
  getRequiredStepCount,
  getTopicProgress,
  markTopicStepComplete,
  type TopicProgress,
} from "@/lib/progress";
import { useEffect, useState } from "react";

interface TopicJourneyProps {
  slug: string;
  hasVisualization: boolean;
  hasChallenge: boolean;
}

export default function TopicJourney({
  slug,
  hasVisualization,
  hasChallenge,
}: TopicJourneyProps) {
  const [progress, setProgress] = useState<TopicProgress>({
    concept: false,
    lab: false,
    challenge: false,
  });

  useEffect(() => {
    function refresh() {
      setProgress(getTopicProgress(slug));
    }

    refresh();
    window.addEventListener(TOPIC_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(TOPIC_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [slug]);

  const completed = getCompletedStepCount(progress, hasVisualization, hasChallenge);
  const required = getRequiredStepCount(hasVisualization, hasChallenge);
  const completionPercent = Math.round((completed / required) * 100);

  const steps = [
    {
      id: "concept" as const,
      label: "Read",
      title: "Concept",
      description: "Work through the explanation and main examples.",
      done: progress.concept,
      action: "Mark Concept Read",
      visible: true,
    },
    {
      id: "lab" as const,
      label: "Interact",
      title: "Lab",
      description: "Use the visualization and practice prompts.",
      done: progress.lab,
      action: "Mark Lab Explored",
      visible: hasVisualization,
    },
    {
      id: "challenge" as const,
      label: "Code",
      title: "Challenge",
      description: "Complete the Java task and pass the tests.",
      done: progress.challenge,
      action: "Pass Tests to Complete",
      visible: hasChallenge,
    },
  ].filter((step) => step.visible);

  return (
    <section className="animate-fade-up overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Lesson Flow
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Move through the topic in order: understand the idea, test it visually, then implement it in code.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            {completed}/{required} steps completed
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/90">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`animate-fade-up rounded-[22px] border px-4 py-4 transition-all duration-300 ${
              step.done
                ? "border-emerald-700 bg-emerald-950/35 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
                : "border-slate-800 bg-slate-900/80"
            }`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {step.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-50">{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
            {step.id !== "challenge" ? (
              <button
                onClick={() => markTopicStepComplete(slug, step.id)}
                disabled={step.done}
                className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {step.done ? "Completed" : step.action}
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-400">
                {step.done ? "Completed" : step.action}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
