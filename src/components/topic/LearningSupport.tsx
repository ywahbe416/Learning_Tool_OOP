import type { ReactNode } from "react";
import Link from "next/link";
import ConceptCheckPanel from "@/components/topic/ConceptCheckPanel";
import { getTopicBySlug } from "@/lib/topics";
import type { TopicLearningSupport } from "@/lib/lesson-support";

interface LearningSupportProps {
  slug: string;
  topicTitle: string;
  support: TopicLearningSupport;
}

export default function LearningSupport({
  slug,
  topicTitle,
  support,
}: LearningSupportProps) {
  const prerequisites = support.prerequisites
    .map((prerequisiteSlug) => getTopicBySlug(prerequisiteSlug))
    .filter((topic) => Boolean(topic));

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(93,215,232,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(240,178,74,0.14),transparent_22%)]" />
      <div className="pointer-events-none absolute right-[-6rem] top-28 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative border-b border-white/10 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Foundation Builder
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Build the mental model for {topicTitle} before you rely on the lab or challenge to do the teaching for you.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
            Prerequisites
          </span>
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
            What To Notice
          </span>
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
            Common Pitfalls
          </span>
        </div>
      </div>

      <div className="relative grid gap-4 px-6 py-6 lg:grid-cols-3">
        <SupportListCard
          title="Before You Start"
          subtitle="Prerequisites and foundational ideas"
          items={support.foundation}
          tone="cyan"
          footer={
            prerequisites.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {prerequisites.map((topic) => (
                  <Link
                    key={topic!.slug}
                    href={`/topics/${topic!.slug}`}
                    className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
                  >
                    Review {topic!.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">
                This topic can be used as an entry point.
              </p>
            )
          }
        />
        <SupportListCard
          title="What To Notice"
          subtitle="Signals to watch while you read and interact"
          items={support.whatToNotice}
          tone="amber"
        />
        <SupportListCard
          title="Common Mistakes"
          subtitle="Misconceptions worth catching early"
          items={support.commonMistakes}
          tone="emerald"
        />
      </div>

      <div className="relative grid gap-6 border-t border-white/10 px-6 py-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ConceptCheckPanel slug={slug} questions={support.conceptChecks} />

        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 shadow-[0_18px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),transparent_60%)]" />
          <div className="relative border-b border-white/10 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Worked Example
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {support.workedExample.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {support.workedExample.summary}
            </p>
          </div>

          <div className="relative px-6 py-6">
            <div className="overflow-hidden rounded-[22px] border border-slate-800 bg-slate-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
                Example Pattern
              </div>
              <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-cyan-200">
                <code>{support.workedExample.code}</code>
              </pre>
            </div>

            <div className="mt-5 space-y-3">
              {support.workedExample.takeaways.map((takeaway, index) => (
                <div
                  key={takeaway}
                  className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
                    {index + 1}
                  </span>
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportListCard({
  title,
  subtitle,
  items,
  footer,
  tone,
}: {
  title: string;
  subtitle: string;
  items: string[];
  footer?: ReactNode;
  tone: "cyan" | "amber" | "emerald";
}) {
  const toneClasses = {
    cyan: {
      glow: "bg-[linear-gradient(135deg,rgba(93,215,232,0.16),transparent_58%)]",
      dot: "bg-cyan-300/80",
      pill: "text-cyan-300",
    },
    amber: {
      glow: "bg-[linear-gradient(135deg,rgba(240,178,74,0.16),transparent_58%)]",
      dot: "bg-amber-300/80",
      pill: "text-amber-300",
    },
    emerald: {
      glow: "bg-[linear-gradient(135deg,rgba(16,185,129,0.14),transparent_58%)]",
      dot: "bg-emerald-300/80",
      pill: "text-emerald-300",
    },
  } as const;

  const toneStyle = toneClasses[tone];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-5 shadow-[0_18px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 ${toneStyle.glow}`} />
      <p className={`relative text-[11px] font-semibold uppercase tracking-[0.22em] ${toneStyle.pill}`}>
        {title}
      </p>
      <p className="relative mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>

      <div className="relative mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 text-sm leading-6 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyle.dot}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="relative">{footer}</div>
    </div>
  );
}
