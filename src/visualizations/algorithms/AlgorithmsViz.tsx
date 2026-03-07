"use client";

import { useEffect, useRef, useState } from "react";
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

  function makeStep(low: number, mid: number, high: number, note: string, found: boolean, notFound?: boolean): SearchStep {
    const cells: ArrayCell[] = arr.map((v, i) => {
      if (found && i === mid) return { value: v, state: "found" };
      if (i === mid && !notFound) return { value: v, state: "active" };
      if (i < low || i > high) return { value: v, state: "eliminated" };
      return { value: v, state: "normal" };
    });
    return { cells, low, mid, high, note, done: found || !!notFound };
  }

  let low = 0, high = arr.length - 1;

  // Initial state
  steps.push({
    cells: arr.map((v) => ({ value: v, state: "normal" })),
    low, mid: -1, high,
    note: `Searching for ${target} in sorted array. low=0, high=${high}`,
    done: false,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) {
      steps.push(makeStep(low, mid, high, `arr[${mid}] = ${arr[mid]} = target! Found at index ${mid}.`, true));
      return steps;
    } else if (arr[mid] < target) {
      steps.push(makeStep(low, mid, high, `arr[${mid}] = ${arr[mid]} < ${target}. Search right half. low = ${mid + 1}`, false));
      low = mid + 1;
    } else {
      steps.push(makeStep(low, mid, high, `arr[${mid}] = ${arr[mid]} > ${target}. Search left half. high = ${mid - 1}`, false));
      high = mid - 1;
    }
  }

  // Not found
  const finalCells: ArrayCell[] = arr.map((v) => ({ value: v, state: "eliminated" }));
  steps.push({ cells: finalCells, low, mid: -1, high, note: `low > high — ${target} not found. Return -1.`, done: true });
  return steps;
}

export default function AlgorithmsViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [arr] = useState(DEFAULT_ARR);
  const [target, setTarget] = useState("23");
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  function resetState() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSteps([]);
    setStepIdx(-1);
    setRunning(false);
  }

  useEffect(() => {
    if (!svgRef.current) return;
    if (currentStep) {
      renderArray(svgRef.current, currentStep.cells, currentStep.low, currentStep.mid, currentStep.high, stepIdx > 0);
    } else {
      renderArray(svgRef.current, arr.map((v) => ({ value: v, state: "normal" })), 0, -1, arr.length - 1, false);
    }
  }, [currentStep, stepIdx, arr]);

  function startSearch() {
    resetState();
    const t = parseInt(target);
    if (isNaN(t)) return;
    const s = computeSteps(arr, t);
    setSteps(s);

    setRunning(true);
    let i = 0;
    function next() {
      if (i < s.length) {
        setStepIdx(i);
        i++;
        timerRef.current = setTimeout(next, 900);
      } else {
        setRunning(false);
      }
    }
    timerRef.current = setTimeout(next, 200);
  }

  function stepForward() {
    if (steps.length === 0) {
      const t = parseInt(target);
      if (isNaN(t)) return;
      const s = computeSteps(arr, t);
      setSteps(s);
      setStepIdx(0);
    } else if (stepIdx < steps.length - 1) {
      setStepIdx((s) => s + 1);
    }
  }

  const note = currentStep?.note ?? `Array: [${arr.join(", ")}] — sorted, ready to search`;
  const isDone = currentStep?.done;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Binary Search</h3>
      <p className="text-slate-500 text-xs mb-4">
        Each step eliminates half the array. O(log n) — 8 elements = at most 3 comparisons.
      </p>

      <div className="bg-slate-900 rounded-lg p-4 mb-3 overflow-x-auto">
        <svg ref={svgRef} />
      </div>

      {/* Note */}
      <div className={`rounded-lg px-4 py-2.5 mb-4 text-sm font-mono transition-colors ${
        isDone && currentStep?.cells.some(c => c.state === "found")
          ? "bg-emerald-950/50 border border-emerald-700 text-emerald-300"
          : isDone
          ? "bg-rose-950/50 border border-rose-700 text-rose-300"
          : "bg-slate-700/50 border border-slate-600 text-slate-300"
      }`}>
        {note}
      </div>

      {/* Step counter */}
      {steps.length > 0 && (
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
              i < stepIdx ? "bg-indigo-500" : i === stepIdx ? "bg-amber-400" : "bg-slate-600"
            }`} />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-slate-500 text-xs">Target:</label>
          <input type="number" value={target}
            onChange={(e) => { setTarget(e.target.value); resetState(); }}
            className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button onClick={startSearch} disabled={running}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Search
        </button>
        <button onClick={stepForward} disabled={running || (steps.length > 0 && stepIdx >= steps.length - 1)}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Step
        </button>
        <button onClick={resetState}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}
