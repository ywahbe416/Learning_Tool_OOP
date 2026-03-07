"use client";

import { useEffect, useRef, useState } from "react";
import { renderBars, type Student } from "./collectionsD3";

const INITIAL: Student[] = [
  { name: "Bob", gpa: 3.8 },
  { name: "Zara", gpa: 3.5 },
  { name: "Alice", gpa: 3.5 },
  { name: "Dave", gpa: 2.9 },
  { name: "Carol", gpa: 3.1 },
  { name: "Eve", gpa: 3.5 },
];

export default function CollectionsViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [students, setStudents] = useState<Student[]>(INITIAL);
  const [highlight, setHighlight] = useState<string | undefined>();
  const [sortLabel, setSortLabel] = useState<string>("Original order");

  useEffect(() => {
    if (svgRef.current) renderBars(svgRef.current, students, highlight);
  }, [students, highlight]);

  function sortByGpa() {
    const sorted = [...students].sort((a, b) =>
      b.gpa !== a.gpa ? b.gpa - a.gpa : a.name.localeCompare(b.name)
    );
    setStudents(sorted);
    setSortLabel("Sorted by GPA ↓ (name A→Z as tiebreaker)");
    setHighlight(undefined);
  }

  function sortByName() {
    const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));
    setStudents(sorted);
    setSortLabel("Sorted by Name A→Z");
    setHighlight(undefined);
  }

  function reset() {
    setStudents(INITIAL);
    setSortLabel("Original order");
    setHighlight(undefined);
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Comparator Sort</h3>
      <p className="text-slate-500 text-xs mb-1">
        Bar height = GPA. Notice Zara, Alice, and Eve all have GPA 3.5 — the name tiebreaker kicks in.
      </p>
      <p className="text-amber-400 text-xs mb-4 font-mono">{sortLabel}</p>

      <div className="bg-slate-900 rounded-lg p-4 mb-4 overflow-x-auto">
        <svg ref={svgRef} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={sortByGpa}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sort by GPA ↓
        </button>
        <button onClick={sortByName}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sort by Name A→Z
        </button>
        <button onClick={reset}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Reset
        </button>
      </div>

      <p className="text-slate-600 text-xs mt-3">
        Tiebreaker: Zara, Alice, Eve all share GPA 3.5 — "Sort by GPA" puts Alice before Eve before Zara.
      </p>
    </div>
  );
}
