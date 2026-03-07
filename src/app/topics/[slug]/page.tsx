import { notFound } from "next/navigation";
import { getTopicBySlug, topics } from "@/lib/topics";
import { challengeRegistry } from "@/lib/challenges";
import { vizSlugs } from "@/lib/visualizations";
import { readFile } from "fs/promises";
import path from "path";
import ConceptSection from "@/components/topic/ConceptSection";
import VizRenderer from "@/components/topic/VizRenderer";
import ChallengePanel from "@/components/topic/ChallengePanel";

export async function generateStaticParams() {
  return topics
    .filter((t) => t.status === "available")
    .map((t) => ({ slug: t.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyColors = {
  beginner: "bg-emerald-900 text-emerald-300",
  intermediate: "bg-amber-900 text-amber-300",
  advanced: "bg-red-900 text-red-300",
};

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic || topic.status !== "available") {
    notFound();
  }

  const mdxPath = path.join(
    process.cwd(),
    "src/content/topics",
    slug,
    "concept.mdx"
  );
  const mdxSource = await readFile(mdxPath, "utf-8");

  const challenge = challengeRegistry[slug] ?? null;
  const hasVisualization = vizSlugs.has(slug);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/"
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4 inline-block"
        >
          ← All Topics
        </a>
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[topic.difficulty]}`}
          >
            {topic.difficulty}
          </span>
          <h1 className="text-3xl font-bold text-slate-100">{topic.title}</h1>
        </div>
        <p className="text-slate-400">{topic.subtitle}</p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left: Concept */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
          <ConceptSection source={mdxSource} />
        </div>

        {/* Right: Visualization + Challenge */}
        <div className="flex flex-col gap-6">
          {hasVisualization && <VizRenderer slug={slug} />}
          {challenge && (
            <ChallengePanel challenge={challenge} topicSlug={slug} />
          )}
        </div>
      </div>
    </div>
  );
}
