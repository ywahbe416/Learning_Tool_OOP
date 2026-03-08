"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";
import { renderArray, type ArrayCell } from "./algorithmD3";

const DEFAULT_ARR = [2, 5, 8, 12, 16, 23, 38, 56];

interface SearchStep {
  cells: ArrayCell[];
  low: number;
  mid: number;
  high: number;
  note: string;
  done: boolean;
}

function computeSteps(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];

  function makeStep(
    low: number,
    mid: number,
    high: number,
    note: string,
    found: boolean,
    notFound?: boolean
  ): SearchStep {
    const cells: ArrayCell[] = arr.map((value, index) => {
      if (found && index === mid) return { value, state: "found" };
      if (index === mid && !notFound) return { value, state: "active" };
      if (index < low || index > high) return { value, state: "eliminated" };
      return { value, state: "normal" };
    });

    return { cells, low, mid, high, note, done: found || Boolean(notFound) };
  }

  let low = 0;
  let high = arr.length - 1;

  steps.push({
    cells: arr.map((value) => ({ value, state: "normal" })),
    low,
    mid: -1,
    high,
    note: `Search for ${target}. Start with low = 0 and high = ${high}.`,
    done: false,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      steps.push(
        makeStep(low, mid, high, `arr[${mid}] = ${arr[mid]} matches ${target}. Found it.`, true)
      );
      return steps;
    }

    if (arr[mid] < target) {
      steps.push(
        makeStep(
          low,
          mid,
          high,
          `arr[${mid}] = ${arr[mid]} is too small, so eliminate the left half and move low to ${mid + 1}.`,
          false
        )
      );
      low = mid + 1;
      continue;
    }

    steps.push(
      makeStep(
        low,
        mid,
        high,
        `arr[${mid}] = ${arr[mid]} is too large, so eliminate the right half and move high to ${mid - 1}.`,
        false
      )
    );
    high = mid - 1;
  }

  steps.push({
    cells: arr.map((value) => ({ value, state: "eliminated" })),
    low,
    mid: -1,
    high,
    note: `low > high, so ${target} is not in the array. Return -1.`,
    done: true,
  });

  return steps;
}

export default function AlgorithmsViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [target, setTarget] = useState("23");
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"idle" | "demo" | "practice">("idle");
  const [prompt, setPrompt] = useState("Pick a target, then either watch the demo or predict each midpoint yourself.");
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [practiceFinished, setPracticeFinished] = useState(false);

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;
  const targetNumber = Number(target);

  const candidateIndices = useMemo(() => {
    const reference = currentStep ?? steps[0] ?? null;
    if (!reference || reference.done) return [];

    return DEFAULT_ARR.map((_, index) => index).filter(
      (index) => index >= reference.low && index <= reference.high
    );
  }, [currentStep, steps]);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetState(nextPrompt?: string) {
    clearTimer();
    setSteps([]);
    setStepIdx(-1);
    setRunning(false);
    setMode("idle");
    setScore({ correct: 0, attempts: 0 });
    setPracticeFinished(false);
    if (nextPrompt) {
      setPrompt(nextPrompt);
    }
  }

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!svgRef.current) return;

    if (currentStep) {
      renderArray(
        svgRef.current,
        currentStep.cells,
        currentStep.low,
        currentStep.mid,
        currentStep.high,
        stepIdx > 0
      );
      return;
    }

    renderArray(
      svgRef.current,
      DEFAULT_ARR.map((value) => ({ value, state: "normal" })),
      0,
      -1,
      DEFAULT_ARR.length - 1,
      false
    );
  }, [currentStep, stepIdx]);

  function buildSearchSteps() {
    if (Number.isNaN(targetNumber)) {
      setPrompt("Enter a valid number before starting.");
      return null;
    }

    return computeSteps(DEFAULT_ARR, targetNumber);
  }

  function watchDemo() {
    const computedSteps = buildSearchSteps();
    if (!computedSteps) return;
    const stepsToRun = computedSteps;

    resetState();
    setSteps(stepsToRun);
    setMode("demo");
    setRunning(true);
    setPrompt("Watch how binary search cuts the remaining search space in half each round.");

    let nextIndex = 0;

    function advance() {
      if (nextIndex < stepsToRun.length) {
        setStepIdx(nextIndex);
        nextIndex += 1;
        timerRef.current = setTimeout(advance, 1100);
        return;
      }

      setRunning(false);
      setMode("idle");
      setPrompt("Demo finished. Run it again with a new target or switch to practice mode.");
    }

    timerRef.current = setTimeout(advance, 250);
  }

  function startPractice() {
    const computedSteps = buildSearchSteps();
    if (!computedSteps) return;
    const stepsToRun = computedSteps;

    resetState();
    setSteps(stepsToRun);
    setMode("practice");
    setStepIdx(0);
    setPrompt("Practice mode: choose the next midpoint index for the current low/high range.");
  }

  function handleGuess(index: number) {
    if (mode !== "practice" || steps.length === 0) return;

    const nextStep = steps[stepIdx + 1];
    if (!nextStep) return;

    const isCorrect = nextStep.mid === index;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      attempts: prev.attempts + 1,
    }));

    setStepIdx((prev) => prev + 1);

    if (isCorrect) {
      setPrompt(`Correct. Midpoint ${index} splits the active range efficiently.`);
    } else {
      setPrompt(`Not quite. Binary search chooses midpoint ${nextStep.mid}, not ${index}.`);
    }

    if (nextStep.done || stepIdx + 1 === steps.length - 1) {
      setPracticeFinished(true);
      setMode("idle");
    }
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;
  const currentRange =
    currentStep && !currentStep.done
      ? `low = ${currentStep.low}, high = ${currentStep.high}`
      : "No active range";

  return (
    <VisualizationCard
      title="Binary Search Coach"
      subtitle="Flip between an animated walkthrough and a prediction game so students actively choose the next comparison instead of only watching it happen."
      objective="Students should recognize the active search window, compute the midpoint, and justify why each comparison removes half the candidates."
      accentClassName="from-amber-300/20 via-cyan-300/10 to-transparent"
      insights={
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Search Space
            </p>
            <p className="mt-2 text-sm text-slate-300">{currentRange}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Practice Score
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {score.correct}/{score.attempts} correct{accuracy !== null ? ` (${accuracy}%)` : ""}
            </p>
          </div>
          <div
            className={`rounded-2xl border px-4 py-3 ${
              practiceFinished
                ? "border-emerald-700 bg-emerald-950/40"
                : "border-slate-700 bg-slate-950/70"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Mode
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {running ? "Animated demo running" : mode === "practice" ? "Prediction round" : "Ready"}
            </p>
          </div>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Target</span>
              <input
                type="number"
                value={target}
                onChange={(event) => {
                  setTarget(event.target.value);
                  resetState("Target changed. Start a new walkthrough or prediction round.");
                }}
                className="w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
              />
            </label>
            <button
              onClick={watchDemo}
              disabled={running}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Watch Demo
            </button>
            <button
              onClick={startPractice}
              disabled={running}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Practice Midpoints
            </button>
            <button
              onClick={() =>
                resetState(
                  "Pick a target, then either watch the demo or predict each midpoint yourself."
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Reset
            </button>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
            <svg ref={svgRef} />
          </div>

          <div
            className={`mt-4 rounded-[20px] border px-4 py-3 text-sm ${
              currentStep?.done && currentStep.cells.some((cell) => cell.state === "found")
                ? "border-emerald-700 bg-emerald-950/40 text-emerald-200"
                : currentStep?.done
                  ? "border-rose-700 bg-rose-950/30 text-rose-200"
                  : "border-slate-800 bg-slate-900/80 text-slate-300"
            }`}
          >
            {currentStep?.note ?? prompt}
          </div>

          {steps.length > 0 && (
            <div className="mt-4 flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index < stepIdx
                      ? "bg-cyan-400"
                      : index === stepIdx
                        ? "bg-amber-300"
                        : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Active Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{prompt}</p>

            <div className="mt-4 grid gap-2">
              {candidateIndices.length > 0 ? (
                candidateIndices.map((index) => (
                  <button
                    key={index}
                    onClick={() => handleGuess(index)}
                    disabled={mode !== "practice"}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                      mode === "practice"
                        ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                        : "border-slate-800 bg-slate-950 text-slate-500"
                    }`}
                  >
                    <span>Choose index {index}</span>
                    <span className="font-mono text-xs text-slate-500">value {DEFAULT_ARR[index]}</span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-4 text-sm text-slate-500">
                  Practice choices appear once a round starts.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Why It Works
            </p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
              <p>Binary search only works on sorted data because the midpoint comparison tells you which half can be discarded safely.</p>
              <p>Every guess should target the midpoint of the current low/high window, not the original array.</p>
              <p>The more precise the active range becomes, the fewer remaining comparisons are possible.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
