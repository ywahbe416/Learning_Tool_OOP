import { notFound } from "next/navigation";
import { getTopicBySlug, topics } from "@/lib/topics";
import { challengeRegistry } from "@/lib/challenges";
import { vizSlugs } from "@/lib/visualizations";
import { readFile } from "fs/promises";
import path from "path";
import ConceptSection from "@/components/topic/ConceptSection";
import VizRenderer from "@/components/topic/VizRenderer";
import ChallengePanel from "@/components/topic/ChallengePanel";
import TopicJourney from "@/components/topic/TopicJourney";
import NextRecommendedTopic from "@/components/topic/NextRecommendedTopic";
import { getLessonSupport } from "@/lib/lesson-support";

export async function generateStaticParams() {
  return topics
    .filter((topic) => topic.status === "available")
    .map((topic) => ({ slug: topic.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyColors = {
  beginner: "border-emerald-700 bg-emerald-950/40 text-emerald-200",
  intermediate: "border-amber-700 bg-amber-950/40 text-amber-200",
  advanced: "border-rose-700 bg-rose-950/40 text-rose-200",
};

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic || topic.status !== "available") {
    notFound();
  }

  const mdxPath = path.join(process.cwd(), "src/content/topics", slug, "concept.mdx");
  const mdxSource = await readFile(mdxPath, "utf-8");

  const challenge = challengeRegistry[slug] ?? null;
  const hasVisualization = vizSlugs.has(slug);
  const lessonSupport = getLessonSupport(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 px-5 py-7 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-xl sm:px-7 md:rounded-[34px] md:px-9 md:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-cyan-300/16 via-transparent to-amber-300/10" />
        <div className="relative">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-200"
          >
            <span>←</span>
            <span>Back to all topics</span>
          </a>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyColors[topic.difficulty]}`}>
                  {topic.difficulty}
                </span>
                <span className="max-w-full rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {topic.tags.join(" • ")}
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
                {topic.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base md:text-lg md:leading-8">
                {topic.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[27rem]">
              <HeaderMetric label="Mode" value="Read" detail="concept notes" />
              <HeaderMetric label="Mode" value="Interact" detail="guided lab" />
              <HeaderMetric label="Mode" value="Code" detail="Java challenge" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <TopicJourney
          slug={slug}
          hasVisualization={hasVisualization}
          hasChallenge={Boolean(challenge)}
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl md:rounded-[30px]">
          <div className="border-b border-white/10 px-7 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Concept Guide
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Read the explanation first, then use the lab and challenge to test the idea in motion.
            </p>
          </div>
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <ConceptSection source={mdxSource} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {hasVisualization && <VizRenderer slug={slug} />}
          {challenge && (
            <ChallengePanel
              challenge={challenge}
              topicSlug={slug}
              learningSupport={lessonSupport}
            />
          )}
        </div>
      </section>

      <section className="mt-8">
        <NextRecommendedTopic currentSlug={slug} />
      </section>
    </div>
  );
}

function HeaderMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-900/70 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-50">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
