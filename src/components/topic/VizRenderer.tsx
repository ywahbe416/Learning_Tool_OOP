"use client";

import dynamic from "next/dynamic";

// Add one entry here to wire up a new visualization.
const vizRegistry: Record<string, ReturnType<typeof dynamic>> = {
  "linked-lists":    dynamic(() => import("@/visualizations/linked-list/LinkedListViz")),
  "oop-basics":      dynamic(() => import("@/visualizations/oop-basics/OopBasicsViz")),
  "advanced-oop":    dynamic(() => import("@/visualizations/advanced-oop/AdvancedOopViz")),
  "exceptions":      dynamic(() => import("@/visualizations/exceptions/ExceptionsViz")),
  "recursion":       dynamic(() => import("@/visualizations/recursion/RecursionViz")),
  "collections":     dynamic(() => import("@/visualizations/collections/CollectionsViz")),
  "data-structures": dynamic(() => import("@/visualizations/data-structures/DataStructuresViz")),
  "algorithms":      dynamic(() => import("@/visualizations/algorithms/AlgorithmsViz")),
};

export default function VizRenderer({ slug }: { slug: string }) {
  const Viz = vizRegistry[slug];
  if (!Viz) return null;
  return <Viz />;
}
