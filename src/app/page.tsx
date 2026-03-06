"use client";

import { topics, type TopicMeta } from "@/lib/topics";
import { getProgress } from "@/lib/progress";
import Link from "next/link";
import { useEffect, useState } from "react";

const difficultyColors: Record<TopicMeta["difficulty"], string> = {
  beginner: "bg-emerald-900 text-emerald-300",
  intermediate: "bg-amber-900 text-amber-300",
  advanced: "bg-red-900 text-red-300",
};

export default function Home() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const sorted = [...topics].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-100 mb-3">
          Data Structures &amp; OOP
        </h1>
        <p className="text-slate-400 text-lg">
          Interactive visualizations and coding challenges. Pick a topic and dive in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((topic) => {
          const isAvailable = topic.status === "available";
          const isComplete = progress[topic.slug];

          return (
            <div key={topic.slug} className="relative">
              {isComplete && (
                <span className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ✓ Done
                </span>
              )}
              {isAvailable ? (
                <Link
                  href={`/topics/${topic.slug}`}
                  className="block h-full bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 hover:bg-slate-750 transition-all group"
                >
                  <TopicCard topic={topic} />
                </Link>
              ) : (
                <div className="block h-full bg-slate-800 border border-slate-700 rounded-xl p-6 opacity-50 cursor-not-allowed">
                  <TopicCard topic={topic} comingSoon />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  comingSoon,
}: {
  topic: TopicMeta;
  comingSoon?: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[topic.difficulty]}`}
        >
          {topic.difficulty}
        </span>
        {comingSoon && (
          <span className="text-xs text-slate-500 font-medium">Coming Soon</span>
        )}
      </div>
      <h2 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-indigo-300 transition-colors">
        {topic.title}
      </h2>
      <p className="text-sm text-slate-400 mb-4">{topic.subtitle}</p>
      <p className="text-xs text-slate-500 line-clamp-2">{topic.description}</p>
      <div className="mt-4 flex flex-wrap gap-1">
        {topic.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}
