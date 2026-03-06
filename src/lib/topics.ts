import { meta as oopBasicsMeta } from "@/content/topics/oop-basics/meta";
import { meta as advancedOopMeta } from "@/content/topics/advanced-oop/meta";
import { meta as exceptionsMeta } from "@/content/topics/exceptions/meta";
import { meta as recursionMeta } from "@/content/topics/recursion/meta";
import { meta as collectionsMeta } from "@/content/topics/collections/meta";
import { meta as linkedListsMeta } from "@/content/topics/linked-lists/meta";
import { meta as dataStructuresMeta } from "@/content/topics/data-structures/meta";
import { meta as algorithmsMeta } from "@/content/topics/algorithms/meta";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type TopicStatus = "available" | "coming-soon";

export interface TopicMeta {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  order: number;
  status: TopicStatus;
}

export const topics: TopicMeta[] = [
  oopBasicsMeta,
  advancedOopMeta,
  exceptionsMeta,
  recursionMeta,
  collectionsMeta,
  linkedListsMeta,
  dataStructuresMeta,
  algorithmsMeta,
];

export function getTopicBySlug(slug: string): TopicMeta | undefined {
  return topics.find((t) => t.slug === slug);
}
