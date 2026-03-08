"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";
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
  const [prompt, setPrompt] = useState(
    "Sort the list and notice what happens when multiple students share the same GPA."
  );
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (svgRef.current) renderBars(svgRef.current, students, highlight);
  }, [students, highlight]);

  const missionState = useMemo(() => {
    const sortedByGpa = history.some((entry) => entry.includes("Sorted by GPA"));
    const sortedByName = history.some((entry) => entry.includes("Sorted by name"));

    return [
      { label: "Sort by GPA", done: sortedByGpa },
      { label: "Sort alphabetically", done: sortedByName },
      { label: "Notice the 3.5 GPA tie group", done: students.filter((student) => student.gpa === 3.5).length === 3 },
      { label: "Answer one comparator question", done: score.attempts > 0 },
    ];
  }, [history, score.attempts, students]);

  function addHistory(entry: string) {
    setHistory((prev) => [entry, ...prev].slice(0, 5));
    setPrompt(entry);
  }

  function sortByGpa() {
    const sorted = [...students].sort((a, b) =>
      b.gpa !== a.gpa ? b.gpa - a.gpa : a.name.localeCompare(b.name)
    );
    setStudents(sorted);
    setSortLabel("Sorted by GPA ↓ with name A→Z tiebreaker");
    setHighlight("Alice");
    addHistory("Sorted by GPA. The 3.5 group uses the name comparator to break ties.");
  }

  function sortByName() {
    const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));
    setStudents(sorted);
    setSortLabel("Sorted by name A→Z");
    setHighlight("Alice");
    addHistory("Sorted by name. GPA no longer decides the order.");
  }

  function reset() {
    setStudents(INITIAL);
    setSortLabel("Original order");
    setHighlight(undefined);
    setPracticeMode(false);
    setSelectedAnswer(null);
    setPrompt("Sort the list and notice what happens when multiple students share the same GPA.");
    setHistory([]);
  }

  function startPractice() {
    setPracticeMode(true);
    setSelectedAnswer(null);
    setPrompt("Practice: when GPA ties at 3.5, which rule decides whether Alice, Eve, or Zara comes first?");
  }

  function submitAnswer(answer: string) {
    if (!practiceMode) return;

    setSelectedAnswer(answer);
    const correct = answer === "name";
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setPracticeMode(false);
    setHighlight("Alice");
    setPrompt(
      correct
        ? "Correct. GPA ties fall through to the secondary comparator: alphabetical name order."
        : "Not quite. Once GPA ties, the comparator falls back to alphabetical name order."
    );
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Comparator Sort Lab"
      subtitle="Students reorder the same collection multiple ways and predict which comparator decides a tie."
      objective="Students should understand that collection sorting is controlled by comparator rules, including explicit tiebreakers."
      accentClassName="from-cyan-300/20 via-emerald-300/10 to-transparent"
      insights={
        <div className="grid gap-3 md:grid-cols-4">
          {missionState.map((mission) => (
            <div
              key={mission.label}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                mission.done
                  ? "border-emerald-700 bg-emerald-950/40 text-emerald-200"
                  : "border-slate-700 bg-slate-950/70 text-slate-400"
              }`}
            >
              <p className="font-medium">{mission.done ? "Complete" : "Checkpoint"}</p>
              <p className="mt-1 leading-5">{mission.label}</p>
            </div>
          ))}
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
          <p className="mb-1 text-sm text-slate-400">
            Same dataset, different ordering rules. Watch the bars move while the comparator changes.
          </p>
          <p className="mb-4 font-mono text-xs text-amber-300">{sortLabel}</p>

          <div className="overflow-x-auto rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
            <svg ref={svgRef} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={sortByGpa}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Sort by GPA
            </button>
            <button
              onClick={sortByName}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
            >
              Sort by Name
            </button>
            <button
              onClick={startPractice}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Predict Tiebreaker
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            {prompt}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Comparator Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              When Alice, Eve, and Zara all have GPA 3.5, what decides who appears first in the GPA sort?
            </p>

            <div className="mt-4 grid gap-2">
              {[
                { id: "name", label: "Alphabetical name order" },
                { id: "insertion", label: "Original insertion order" },
                { id: "highest", label: "Highest GPA again" },
              ].map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => submitAnswer(choice.id)}
                  disabled={!practiceMode}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    practiceMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                      : "border-slate-800 bg-slate-950 text-slate-500"
                  } ${selectedAnswer === choice.id ? "border-cyan-400" : ""}`}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Event Log
            </p>
            <div className="mt-4 space-y-2">
              {history.length > 0 ? (
                history.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300"
                  >
                    {entry}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">
                  Sorting actions will be explained here.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Practice Score
            </p>
            <p className="mt-3 text-sm text-slate-300">
              {score.correct}/{score.attempts} correct{accuracy !== null ? ` (${accuracy}%)` : ""}
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <p>A comparator can combine multiple rules, not just one. Primary sort keys do not need to be the whole story.</p>
              <p>When two elements tie on GPA, the next comparison decides their relative order.</p>
              <p>This is the exact behavior students write when chaining `Comparator.comparing(...).thenComparing(...)` in Java.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
