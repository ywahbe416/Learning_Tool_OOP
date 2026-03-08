"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";
import { renderArray, type ArrayCell } from "./algorithmD3";

const DEFAULT_ARR = [2, 5, 8, 12, 16, 23, 38, 56];
const UNSORTED_SEARCH = [9, 4, 7, 1, 3];
const SORTED_PAIR_ARRAY = [1, 2, 3, 4, 6];
const WINDOW_TRACK = [
  { label: "[2, 1, 5]", sum: 8 },
  { label: "[1, 5, 1]", sum: 7 },
  { label: "[5, 1, 3]", sum: 9 },
  { label: "[1, 3, 2]", sum: 6 },
] as const;

type LabMode = "binary" | "patterns";
type PatternLabId = "search" | "pairs" | "window" | "dp";

interface SearchStep {
  cells: ArrayCell[];
  low: number;
  mid: number;
  high: number;
  note: string;
  done: boolean;
}

interface PatternOption {
  label: string;
  correct: boolean;
  explanation: string;
}

interface PatternStep {
  prompt: string;
  options: PatternOption[];
}

interface PatternLabDefinition {
  label: string;
  eyebrow: string;
  title: string;
  intro: string;
  why: string;
  steps: PatternStep[];
}

interface PatternLabState {
  stepIndex: number;
  selection: number | null;
  answered: boolean;
  feedback: string;
}

const PATTERN_LAB_IDS = ["search", "pairs", "window", "dp"] as const;

const PATTERN_LABS: Record<PatternLabId, PatternLabDefinition> = {
  search: {
    label: "Search Choice",
    eyebrow: "Search Choice",
    title: "Pick the right search strategy",
    intro: "Work through the decision points that separate linear search from binary search.",
    why: "Sorted order is what lets binary search discard half the remaining work safely.",
    steps: [
      {
        prompt:
          "You need to find 23 in a sorted array with 1,000,000 elements. Which strategy fits best?",
        options: [
          {
            label: "Linear Search",
            correct: false,
            explanation: "Linear search works, but it ignores the fact that the array is sorted.",
          },
          {
            label: "Binary Search",
            correct: true,
            explanation:
              "Correct. Sorted order lets binary search cut the remaining search space in half.",
          },
        ],
      },
      {
        prompt:
          "Now the array is unsorted and you still need to find 7 without preprocessing. Which strategy is safe?",
        options: [
          {
            label: "Linear Search",
            correct: true,
            explanation:
              "Correct. Without sorted order, a scan is the reliable strategy unless you sort or build an index first.",
          },
          {
            label: "Binary Search",
            correct: false,
            explanation:
              "Binary search is unsafe here because midpoint comparisons only mean something on sorted data.",
          },
        ],
      },
      {
        prompt:
          "Binary search sees midpoint value 12 while the target is 23. Which side can it discard?",
        options: [
          {
            label: "Discard the left side through 12",
            correct: true,
            explanation:
              "Correct. Because 12 is too small, every value on the left side is also too small.",
          },
          {
            label: "Discard the right side from 12 onward",
            correct: false,
            explanation:
              "That would throw away the half that could still contain 23. The right side must stay.",
          },
        ],
      },
    ],
  },
  pairs: {
    label: "Pair Finding",
    eyebrow: "Pair Finding",
    title: "Choose between two pointers and hashing",
    intro: "Use array order and complement logic to decide which pattern should run the search.",
    why: "Sorted input favors two pointers. Unsorted input often favors a HashMap complement check.",
    steps: [
      {
        prompt: "Array: [1, 2, 3, 4, 6], target 8. Which pattern fits directly?",
        options: [
          {
            label: "Two Pointers",
            correct: true,
            explanation:
              "Correct. The array is already sorted, so left and right pointers can shrink the range efficiently.",
          },
          {
            label: "HashMap",
            correct: false,
            explanation:
              "HashMap could work, but it is not the most direct pattern when sorted order is already available.",
          },
        ],
      },
      {
        prompt:
          "Pointers start at 1 and 6, so the sum is 7. To reach target 8, which pointer should move next?",
        options: [
          {
            label: "Move the left pointer rightward",
            correct: true,
            explanation:
              "Correct. The sum is too small, so you need a larger value on the left side.",
          },
          {
            label: "Move the right pointer leftward",
            correct: false,
            explanation:
              "Moving the right pointer would make the sum even smaller, which goes in the wrong direction.",
          },
        ],
      },
      {
        prompt:
          "Unsorted array: [3, 2, 4], target 6. After reading value 3, which complement should the HashMap pattern look for?",
        options: [
          {
            label: "3",
            correct: true,
            explanation:
              "Correct. HashMap-based Two Sum checks whether target - current already exists.",
          },
          {
            label: "2",
            correct: false,
            explanation:
              "2 is another value in the array, but it is not the complement of 3 when the target is 6.",
          },
          {
            label: "4",
            correct: false,
            explanation:
              "4 pairs with 2, not with the current value 3. The complement of 3 is 3.",
          },
        ],
      },
    ],
  },
  window: {
    label: "Sliding Window",
    eyebrow: "Sliding Window",
    title: "Reuse work across adjacent windows",
    intro: "Track how one contiguous window rolls into the next instead of recalculating from scratch.",
    why: "Sliding window is about keeping just enough state so each next window costs O(1) to update.",
    steps: [
      {
        prompt: "For [2, 1, 5, 1, 3, 2], what is the sum of the first size-3 window?",
        options: [
          {
            label: "7",
            correct: false,
            explanation: "That misses part of the first window. The first three values sum to 8.",
          },
          {
            label: "8",
            correct: true,
            explanation:
              "Correct. The first window [2, 1, 5] starts the running total at 8.",
          },
          {
            label: "9",
            correct: false,
            explanation:
              "9 is the maximum window later in the array, but it is not the first window.",
          },
        ],
      },
      {
        prompt:
          "When the window slides from [2, 1, 5] to [1, 5, 1], which update reuses the previous sum?",
        options: [
          {
            label: "8 - 2 + 1 = 7",
            correct: true,
            explanation:
              "Correct. Remove the value leaving the window, then add the one entering it.",
          },
          {
            label: "8 + 1 + 5 = 14",
            correct: false,
            explanation:
              "That double-counts values already inside the window instead of sliding it forward.",
          },
          {
            label: "1 + 5 + 1 = 6",
            correct: false,
            explanation:
              "That recomputes incorrectly. The sum of [1, 5, 1] is 7, not 6.",
          },
        ],
      },
      {
        prompt: "Which size-3 window has the maximum sum?",
        options: [
          {
            label: "[2, 1, 5]",
            correct: false,
            explanation: "It is strong, but its sum is 8 rather than the maximum.",
          },
          {
            label: "[1, 5, 1]",
            correct: false,
            explanation: "That window sums to 7, so it is not the best.",
          },
          {
            label: "[5, 1, 3]",
            correct: true,
            explanation:
              "Correct. [5, 1, 3] reaches the maximum sum of 9 in this example.",
          },
        ],
      },
    ],
  },
  dp: {
    label: "Dynamic Programming",
    eyebrow: "Dynamic Programming",
    title: "Build answers from smaller solved cases",
    intro: "Follow the climb-stairs table so the recurrence feels like a build process rather than a formula to memorize.",
    why: "Dynamic programming works when the current answer can be composed from smaller answers you already know.",
    steps: [
      {
        prompt: "Which recurrence matches the climb-stairs pattern?",
        options: [
          {
            label: "dp[n] = dp[n - 1] + dp[n - 2]",
            correct: true,
            explanation:
              "Correct. Each step count comes from taking one step from n - 1 or two steps from n - 2.",
          },
          {
            label: "dp[n] = dp[n - 1] * 2",
            correct: false,
            explanation:
              "Doubling the previous value ignores the second smaller subproblem.",
          },
          {
            label: "dp[n] = n + dp[n - 1]",
            correct: false,
            explanation:
              "That grows too quickly and does not reflect the actual one-step or two-step choices.",
          },
        ],
      },
      {
        prompt: "If dp[0] = 1, dp[1] = 1, dp[2] = 2, and dp[3] = 3, what is dp[4]?",
        options: [
          {
            label: "4",
            correct: false,
            explanation: "dp[4] should add dp[3] and dp[2], which gives 5.",
          },
          {
            label: "5",
            correct: true,
            explanation: "Correct. dp[4] = dp[3] + dp[2] = 3 + 2 = 5.",
          },
          {
            label: "6",
            correct: false,
            explanation:
              "6 is too large because it counts extra paths that do not correspond to valid subproblems.",
          },
        ],
      },
      {
        prompt: "Using that same table, what should dp[5] be?",
        options: [
          {
            label: "7",
            correct: false,
            explanation: "Close, but dp[5] should add dp[4] and dp[3], which gives 8.",
          },
          {
            label: "8",
            correct: true,
            explanation: "Correct. dp[5] = dp[4] + dp[3] = 5 + 3 = 8.",
          },
          {
            label: "10",
            correct: false,
            explanation: "That jumps beyond the recurrence. The build should stay local to the last two answers.",
          },
        ],
      },
    ],
  },
};

function initialPatternLabState(): PatternLabState {
  return {
    stepIndex: 0,
    selection: null,
    answered: false,
    feedback: "Choose an answer to see the reasoning before moving on.",
  };
}

function createPatternProgress(): Record<PatternLabId, PatternLabState> {
  return {
    search: initialPatternLabState(),
    pairs: initialPatternLabState(),
    window: initialPatternLabState(),
    dp: initialPatternLabState(),
  };
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
  const [labMode, setLabMode] = useState<LabMode>("binary");
  const [patternLab, setPatternLab] = useState<PatternLabId>("search");

  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [target, setTarget] = useState("23");
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"idle" | "demo" | "practice">("idle");
  const [prompt, setPrompt] = useState(
    "Pick a target, then either watch the demo or predict each midpoint yourself."
  );
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [practiceFinished, setPracticeFinished] = useState(false);

  const [patternProgress, setPatternProgress] =
    useState<Record<PatternLabId, PatternLabState>>(createPatternProgress);
  const [patternCompleted, setPatternCompleted] = useState<PatternLabId[]>([]);
  const [patternScore, setPatternScore] = useState({ correct: 0, attempts: 0 });

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;
  const targetNumber = Number(target);

  const currentPatternLab = PATTERN_LABS[patternLab];
  const currentPatternState = patternProgress[patternLab];
  const currentPatternStep = currentPatternLab.steps[currentPatternState.stepIndex];
  const currentPatternFinished =
    currentPatternState.answered &&
    currentPatternState.stepIndex === currentPatternLab.steps.length - 1;

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

  function scorePattern(correct: boolean) {
    setPatternScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
  }

  function answerPattern(index: number) {
    if (currentPatternState.answered) return;

    const option = currentPatternStep.options[index];
    const isLastStep = currentPatternState.stepIndex === currentPatternLab.steps.length - 1;

    scorePattern(option.correct);
    setPatternProgress((prev) => ({
      ...prev,
      [patternLab]: {
        ...prev[patternLab],
        selection: index,
        answered: true,
        feedback: `${option.explanation}${isLastStep ? " Drill complete." : ""}`,
      },
    }));

    if (isLastStep) {
      setPatternCompleted((prev) => (prev.includes(patternLab) ? prev : [...prev, patternLab]));
    }
  }

  function advancePatternStep() {
    if (!currentPatternState.answered || currentPatternFinished) return;

    setPatternProgress((prev) => ({
      ...prev,
      [patternLab]: {
        stepIndex: prev[patternLab].stepIndex + 1,
        selection: null,
        answered: false,
        feedback: "Choose the next answer, then compare your reasoning to the explanation.",
      },
    }));
  }

  function replayPatternLab() {
    setPatternProgress((prev) => ({
      ...prev,
      [patternLab]: initialPatternLabState(),
    }));
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;
  const patternAccuracy =
    patternScore.attempts > 0
      ? Math.round((patternScore.correct / patternScore.attempts) * 100)
      : null;
  const currentRange =
    currentStep && !currentStep.done
      ? `low = ${currentStep.low}, high = ${currentStep.high}`
      : "No active range";

  return (
    <VisualizationCard
      title="Algorithm Studio"
      subtitle="Keep the binary-search coach, then switch into focused micro-labs for the other strategy families instead of cramming every algorithm into one canvas."
      objective="Students should recognize when to use sorted-search narrowing, two pointers, hashing, sliding windows, divide-and-conquer sorting, and dynamic programming."
      accentClassName="from-amber-300/20 via-cyan-300/10 to-transparent"
      insights={
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Binary Search
            </p>
            <p className="mt-2 text-sm text-slate-300">{currentRange}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Binary Score
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {score.correct}/{score.attempts} correct{accuracy !== null ? ` (${accuracy}%)` : ""}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pattern Progress
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {patternCompleted.length}/{PATTERN_LAB_IDS.length} drills finished
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {patternScore.correct}/{patternScore.attempts} correct
              {patternAccuracy !== null ? ` (${patternAccuracy}%)` : ""}
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
              Active Track
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {labMode === "binary" ? "Binary search coach" : currentPatternLab.title}
            </p>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap gap-3">
        {(
          [
            ["binary", "Binary Search"],
            ["patterns", "Pattern Studio"],
          ] as const
        ).map(([nextMode, label]) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => setLabMode(nextMode)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              labMode === nextMode
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {labMode === "binary" && (
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
                      <span className="font-mono text-xs text-slate-500">
                        value {DEFAULT_ARR[index]}
                      </span>
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
                <p>
                  Binary search only works on sorted data because the midpoint comparison tells you
                  which half can be discarded safely.
                </p>
                <p>
                  Every guess should target the midpoint of the current low/high window, not the
                  original array.
                </p>
                <p>
                  This mode stays focused on one algorithm, while the pattern studio handles the
                  rest of the lesson without cluttering the same canvas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {labMode === "patterns" && (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Micro-Lab Menu
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Open one pattern at a time so the broader lesson stays teachable instead of turning
                into a crowded mega-lab.
              </p>

              <div className="mt-4 grid gap-2">
                {PATTERN_LAB_IDS.map((labId) => {
                  const definition = PATTERN_LABS[labId];
                  const progress = patternProgress[labId];
                  const finished = patternCompleted.includes(labId);

                  return (
                    <button
                      key={labId}
                      type="button"
                      onClick={() => setPatternLab(labId)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        patternLab === labId
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-slate-700 bg-slate-900 hover:border-cyan-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-100">
                          {definition.label}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            finished
                              ? "border-emerald-500/40 bg-emerald-400/10 text-emerald-200"
                              : "border-slate-700 bg-slate-950 text-slate-400"
                          }`}
                        >
                          {finished
                            ? "Done"
                            : `Step ${progress.stepIndex + 1}/${definition.steps.length}`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{definition.intro}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pattern Summary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{currentPatternLab.why}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">This drill</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Step {currentPatternState.stepIndex + 1} of {currentPatternLab.steps.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Studio progress
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {patternCompleted.length}/{PATTERN_LAB_IDS.length} drills completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {currentPatternLab.eyebrow}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-50">
                    {currentPatternLab.title}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {currentPatternStep.prompt}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  {currentPatternState.stepIndex + 1}/{currentPatternLab.steps.length} steps
                </div>
              </div>

              <div className="mt-4 flex gap-1.5">
                {currentPatternLab.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index < currentPatternState.stepIndex
                        ? "bg-emerald-400"
                        : index === currentPatternState.stepIndex
                          ? "bg-amber-300"
                          : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-2">
                {currentPatternStep.options.map((option, index) => {
                  const selected = currentPatternState.selection === index;

                  return (
                    <button
                      key={`${option.label}-${index}`}
                      type="button"
                      onClick={() => answerPattern(index)}
                      disabled={currentPatternState.answered}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                        !currentPatternState.answered
                          ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                          : option.correct
                            ? "border-emerald-500 bg-emerald-400/10 text-emerald-100"
                            : selected
                              ? "border-rose-500 bg-rose-400/10 text-rose-100"
                              : "border-slate-800 bg-slate-950 text-slate-500"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div
                className={`mt-4 rounded-[20px] border px-4 py-3 text-sm ${
                  currentPatternState.answered
                    ? "border-amber-500/40 bg-amber-400/10 text-amber-100"
                    : "border-slate-800 bg-slate-900/80 text-slate-300"
                }`}
              >
                {currentPatternState.feedback}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={advancePatternStep}
                  disabled={!currentPatternState.answered || currentPatternFinished}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next Step
                </button>
                <button
                  type="button"
                  onClick={replayPatternLab}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
                >
                  {currentPatternFinished ? "Replay Drill" : "Reset Drill"}
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Support Board
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use the state snapshot below to reason through the current decision instead of
                guessing from memory.
              </p>

              <div className="mt-4">
                <PatternSupportBoard lab={patternLab} stepIndex={currentPatternState.stepIndex} />
              </div>
            </div>
          </div>
        </div>
      )}
    </VisualizationCard>
  );
}

function PatternSupportBoard({
  lab,
  stepIndex,
}: {
  lab: PatternLabId;
  stepIndex: number;
}) {
  if (lab === "search") {
    if (stepIndex === 0) {
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SupportCard label="Input order" value="Sorted" tone="cyan" />
            <SupportCard label="Array size" value="1,000,000" tone="amber" />
            <SupportCard label="Target" value="23" tone="violet" />
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_ARR.map((value) => (
              <span
                key={value}
                className={`rounded-full border px-3 py-1 text-sm ${
                  value === 23
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (stepIndex === 1) {
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SupportCard label="Input order" value="Unsorted" tone="rose" />
            <SupportCard label="Preprocessing" value="None" tone="amber" />
            <SupportCard label="Safe move" value="Scan" tone="cyan" />
          </div>
          <div className="flex flex-wrap gap-2">
            {UNSORTED_SEARCH.map((value) => (
              <span
                key={value}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <SupportCard label="low" value="0" tone="violet" />
          <SupportCard label="mid" value="3 -> 12" tone="amber" />
          <SupportCard label="high" value="7" tone="cyan" />
        </div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_ARR.map((value, index) => (
            <span
              key={value}
              className={`rounded-full border px-3 py-1 text-sm ${
                index < 4
                  ? "border-rose-500/40 bg-rose-400/10 text-rose-200"
                  : "border-emerald-500/40 bg-emerald-400/10 text-emerald-200"
              }`}
            >
              {value}
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-slate-400">
          12 is too small, so the left half is eliminated and the right half stays active.
        </p>
      </div>
    );
  }

  if (lab === "pairs") {
    if (stepIndex < 2) {
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SupportCard label="Target" value="8" tone="amber" />
            <SupportCard label="Left" value="1" tone="cyan" />
            <SupportCard label="Right" value="6" tone="violet" />
          </div>
          <div className="flex flex-wrap gap-2">
            {SORTED_PAIR_ARRAY.map((value, index) => (
              <span
                key={value}
                className={`rounded-full border px-3 py-1 text-sm ${
                  index === 0
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                    : index === SORTED_PAIR_ARRAY.length - 1
                      ? "border-violet-400 bg-violet-400/10 text-violet-200"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {value}
              </span>
            ))}
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Current sum is 7. If the target is larger, the smaller side needs to grow.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <SupportCard label="Current value" value="3" tone="amber" />
          <SupportCard label="Target" value="6" tone="cyan" />
          <SupportCard label="Complement" value="3" tone="emerald" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[3, 2, 4].map((value, index) => (
            <span
              key={`${value}-${index}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                value === 3
                  ? "border-emerald-500/40 bg-emerald-400/10 text-emerald-200"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              {value}
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-slate-400">
          HashMap-style Two Sum stores seen values so it can ask, “Have I already seen the
          complement?”
        </p>
      </div>
    );
  }

  if (lab === "window") {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SupportCard label="Window size" value="3" tone="cyan" />
          <SupportCard
            label="Current focus"
            value={stepIndex === 0 ? "First sum" : stepIndex === 1 ? "Slide once" : "Find max"}
            tone="amber"
          />
        </div>
        <div className="space-y-2">
          {WINDOW_TRACK.map((window, index) => (
            <div
              key={window.label}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                index === stepIndex || (stepIndex === 2 && window.sum === 9)
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                  : "border-slate-800 bg-slate-900/80 text-slate-300"
              }`}
            >
              <span>{window.label}</span>
              <span className="font-mono text-xs text-slate-500">sum {window.sum}</span>
            </div>
          ))}
        </div>
        {stepIndex === 1 && (
          <p className="text-sm leading-6 text-slate-400">
            Reuse the running total: previous sum 8, remove 2, add 1, and the next window becomes
            7.
          </p>
        )}
      </div>
    );
  }

  const dpValues =
    stepIndex === 0
      ? [1, 1, 2, 3, "?", "?"]
      : stepIndex === 1
        ? [1, 1, 2, 3, 5, "?"]
        : [1, 1, 2, 3, 5, 8];
  const activeDpIndex = stepIndex === 2 ? 5 : 4;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SupportCard label="Base cases" value="dp[0], dp[1]" tone="cyan" />
        <SupportCard label="Recurrence" value="prev + prev2" tone="amber" />
        <SupportCard label="Active cell" value={`dp[${stepIndex + 3}]`} tone="violet" />
      </div>
      <div className="grid gap-2 sm:grid-cols-6">
        {dpValues.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={`rounded-2xl border px-3 py-3 text-center text-sm ${
              index === activeDpIndex
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                : "border-slate-800 bg-slate-900/80 text-slate-300"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">dp[{index}]</p>
            <p className="mt-2 text-base font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm leading-6 text-slate-400">
        Each new entry depends only on the two answers immediately before it, which is why this
        table builds from left to right.
      </p>
    </div>
  );
}

function SupportCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "violet" | "rose" | "emerald";
}) {
  const tones: Record<"cyan" | "amber" | "violet" | "rose" | "emerald", string> = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
