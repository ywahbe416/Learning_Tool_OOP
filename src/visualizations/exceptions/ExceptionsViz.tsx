"use client";

import { useState, useRef, useEffect } from "react";

type Scenario = "normal" | "exception" | "rethrow";

interface Block {
  label: string;
  color: string;
  border: string;
  bg: string;
  lines: string[];
}

const BLOCKS: Record<string, Block> = {
  try: {
    label: "try",
    color: "text-indigo-400",
    border: "border-indigo-500",
    bg: "bg-indigo-950/40",
    lines: ["  riskyOperation();", "  // more code..."],
  },
  catch: {
    label: "catch (Exception e)",
    color: "text-rose-400",
    border: "border-rose-500",
    bg: "bg-rose-950/40",
    lines: ["  System.out.println(e.getMessage());"],
  },
  finally: {
    label: "finally",
    color: "text-amber-400",
    border: "border-amber-500",
    bg: "bg-amber-950/40",
    lines: ["  connection.close(); // always runs"],
  },
};

type Step = {
  block: "try" | "catch" | "finally" | null;
  note: string;
  throwAt?: "try" | "catch";
};

const SCENARIOS: Record<Scenario, { label: string; description: string; steps: Step[] }> = {
  normal: {
    label: "Normal (no exception)",
    description: "Code in try runs fully. catch is skipped. finally always runs.",
    steps: [
      { block: "try", note: "Executing try block..." },
      { block: "try", note: "try block completes normally." },
      { block: "finally", note: "finally always runs — cleanup happens here." },
      { block: null, note: "Program continues normally." },
    ],
  },
  exception: {
    label: "Exception thrown",
    description: "Exception fires inside try. Execution jumps to catch. finally still runs.",
    steps: [
      { block: "try", note: "Executing try block..." },
      { block: "try", note: "Exception thrown! Jumping to catch...", throwAt: "try" },
      { block: "catch", note: "Catching and handling the exception." },
      { block: "finally", note: "finally always runs — even after catch." },
      { block: null, note: "Program recovers and continues." },
    ],
  },
  rethrow: {
    label: "Re-throw in catch",
    description: "catch re-throws the exception. finally still runs before it propagates.",
    steps: [
      { block: "try", note: "Executing try block..." },
      { block: "try", note: "Exception thrown!", throwAt: "try" },
      { block: "catch", note: "catch runs — decides to re-throw the exception." },
      { block: "catch", note: "throw e; — re-throwing!", throwAt: "catch" },
      { block: "finally", note: "finally runs even when re-throwing." },
      { block: null, note: "Exception propagates to the caller." },
    ],
  },
};

export default function ExceptionsViz() {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = SCENARIOS[scenario].steps;
  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  function clearTimers() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function reset() {
    clearTimers();
    setStepIdx(-1);
    setRunning(false);
  }

  function runAuto() {
    reset();
    setRunning(true);
    let i = 0;
    function next() {
      if (i < steps.length) {
        setStepIdx(i);
        i++;
        timerRef.current = setTimeout(next, 1000);
      } else {
        setRunning(false);
      }
    }
    timerRef.current = setTimeout(next, 300);
  }

  function stepForward() {
    if (stepIdx < steps.length - 1) {
      setStepIdx((s) => s + 1);
    }
  }

  useEffect(() => () => clearTimers(), []);

  function blockState(blockKey: "try" | "catch" | "finally") {
    if (!currentStep) return "inactive";
    if (currentStep.block === blockKey) {
      if (currentStep.throwAt === blockKey) return "throwing";
      return "active";
    }
    // Past blocks are dimmed
    const order = ["try", "catch", "finally"];
    const currentOrder = order.indexOf(currentStep.block ?? "");
    const thisOrder = order.indexOf(blockKey);
    if (thisOrder < currentOrder) return "past";
    return "inactive";
  }

  const stateStyles = {
    inactive: "border-slate-600 bg-slate-800/50 opacity-40",
    active: "",
    throwing: "animate-pulse",
    past: "opacity-60",
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Exception Flow</h3>
      <p className="text-slate-500 text-xs mb-4">
        See how execution flows through try / catch / finally under different conditions.
      </p>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.entries(SCENARIOS) as [Scenario, typeof SCENARIOS[Scenario]][]).map(([key, sc]) => (
          <button key={key} onClick={() => { setScenario(key); reset(); }}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${scenario === key ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}>
            {sc.label}
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-xs mb-4 italic">{SCENARIOS[scenario].description}</p>

      {/* Flow diagram */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col gap-2 flex-1">
          {(["try", "catch", "finally"] as const).map((key) => {
            const block = BLOCKS[key];
            const state = blockState(key);
            const isActive = state === "active" || state === "throwing";
            return (
              <div key={key}
                className={`rounded-lg border-2 p-3 font-mono text-sm transition-all duration-300 ${
                  isActive ? `${block.border} ${block.bg}` : stateStyles[state]
                } ${stateStyles[state] === "animate-pulse" ? "animate-pulse border-rose-500 bg-rose-950/40" : ""}`}>
                <span className={isActive ? block.color : "text-slate-500"}>{key} {"{"}</span>
                {block.lines.map((line, i) => (
                  <div key={i} className={`pl-4 ${isActive ? "text-slate-300" : "text-slate-600"}`}>{line}</div>
                ))}
                {state === "throwing" && (
                  <div className="pl-4 text-rose-400 font-bold">{"throw e; // exception!"}</div>
                )}
                <span className={isActive ? block.color : "text-slate-500"}>{"}"}</span>
              </div>
            );
          })}
        </div>

        {/* Note panel */}
        <div className="w-40 flex flex-col justify-center">
          <div className={`rounded-lg border p-3 text-xs transition-all min-h-[60px] ${
            currentStep ? "border-indigo-600 bg-indigo-950/30 text-slate-300" : "border-slate-700 text-slate-600"
          }`}>
            {currentStep ? currentStep.note : "Press Run or Step"}
          </div>
          {stepIdx === steps.length - 1 && (
            <div className="mt-2 text-xs text-emerald-400 text-center">
              {scenario === "rethrow" ? "Exception propagated" : "Complete"}
            </div>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${
            i < stepIdx ? "bg-indigo-500 w-4" : i === stepIdx ? "bg-amber-400 w-4" : "bg-slate-600 w-4"
          }`} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button onClick={runAuto} disabled={running}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Run
        </button>
        <button onClick={stepForward} disabled={running || stepIdx >= steps.length - 1}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Step
        </button>
        <button onClick={reset}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}
