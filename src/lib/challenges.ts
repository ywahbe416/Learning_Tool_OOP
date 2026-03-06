import type { Challenge } from "@/types/challenge";
import { challenge as oopBasicsChallenge } from "@/content/topics/oop-basics/challenge";
import { challenge as advancedOopChallenge } from "@/content/topics/advanced-oop/challenge";
import { challenge as exceptionsChallenge } from "@/content/topics/exceptions/challenge";
import { challenge as recursionChallenge } from "@/content/topics/recursion/challenge";
import { challenge as collectionsChallenge } from "@/content/topics/collections/challenge";
import { challenge as linkedListsChallenge } from "@/content/topics/linked-lists/challenge";
import { challenge as dataStructuresChallenge } from "@/content/topics/data-structures/challenge";
import { challenge as algorithmsChallenge } from "@/content/topics/algorithms/challenge";

export const challengeRegistry: Record<string, Challenge> = {
  "oop-basics": oopBasicsChallenge,
  "advanced-oop": advancedOopChallenge,
  "exceptions": exceptionsChallenge,
  "recursion": recursionChallenge,
  "collections": collectionsChallenge,
  "linked-lists": linkedListsChallenge,
  "data-structures": dataStructuresChallenge,
  "algorithms": algorithmsChallenge,
};
