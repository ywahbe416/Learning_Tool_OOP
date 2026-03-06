import { meta as linkedListsMeta } from "@/content/topics/linked-lists/meta";

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
  linkedListsMeta,
  // Future topics will be added here as one import + one array entry:
  // arraysMeta,
  // stacksQueuesMeta,
  // treesMeta,
  // hashmapsMeta,
  // graphsMeta,
  // oopConceptsMeta,
  // sortingSearchingMeta,
];

export function getTopicBySlug(slug: string): TopicMeta | undefined {
  return topics.find((t) => t.slug === slug);
}
