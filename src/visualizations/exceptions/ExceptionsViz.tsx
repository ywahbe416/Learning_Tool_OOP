"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";

type Scenario = "normal" | "exception" | "rethrow";
type BlockKey = "try" | "catch" | "finally" | null;

interface Block {
  label: string;
  color: string;
  border: string;
  bg: string;
  lines: string[];
}

interface Step {
  block: BlockKey;
  note: string;
  throwAt?: "try" | "catch";
}

const BLOCKS: Record<Exclude<BlockKey, null>, Block> = {
  try: {
    label: "try",
    color: "text-cyan-300",
    border: "border-cyan-500",
    bg: "bg-cyan-950/30",
    lines: ["  riskyOperation();", "  // more code..."],
  },
  catch: {
    label: "catch (Exception e)",
    color: "text-rose-300",
    border: "border-rose-500",
    bg: "bg-rose-950/30",
    lines: ["  System.out.println(e.getMessage());"],
  },
  finally: {
    label: "finally",
    color: "text-amber-300",
    border: "border-amber-500",
    bg: "bg-amber-950/30",
    lines: ["  connection.close();"],
  },
};

const SCENARIOS: Record<Scenario, { label: string; description: string; steps: Step[]; question: string; answer: string }> = {
  normal: {
    label: "Normal Flow",
    description: "The try block finishes, catch is skipped, and finally still runs for cleanup.",
    question: "If no exception is thrown, which block executes after try finishes?",
    answer: "finally",
    steps: [
      { block: "try", note: "Execution enters try and runs riskyOperation()." },
      { block: "try", note: "The try block completes normally." },
      { block: "finally", note: "finally runs even when no error occurred." },
      { block: null, note: "Program continues after cleanup." },
    ],
  },
  exception: {
    label: "Handled Exception",
    description: "The exception interrupts try, jumps to catch, then finally runs before continuing.",
    question: "When try throws and catch handles it, which block definitely still runs afterward?",
    answer: "finally",
    steps: [
      { block: "try", note: "Execution enters try." },
      { block: "try", note: "An exception is thrown inside try.", throwAt: "try" },
      { block: "catch", note: "Control jumps to catch to handle the problem." },
      { block: "finally", note: "finally runs after catch for cleanup." },
      { block: null, note: "The program recovers and keeps going." },
    ],
  },
  rethrow: {
    label: "Re-throw",
    description: "catch sees the exception but re-throws it; finally still runs before the error escapes.",
    question: "If catch re-throws the exception, which block still executes before the exception propagates?",
    answer: "finally",
    steps: [
      { block: "try", note: "Execution enters try." },
      { block: "try", note: "An exception is thrown inside try.", throwAt: "try" },
      { block: "catch", note: "catch receives the exception." },
      { block: "catch", note: "catch re-throws the exception.", throwAt: "catch" },
      { block: "finally", note: "finally still executes before propagation." },
      { block: null, note: "The exception bubbles to the caller." },
    ],
  },
};

export default function ExceptionsViz() {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [prompt, setPrompt] = useState(
    "Pick a scenario, then watch the execution path or predict which block runs next."
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = SCENARIOS[scenario].steps;
  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const missionState = useMemo(() => {
    const started = stepIdx >= 0;
    const visitedCatch = steps.slice(0, Math.max(stepIdx + 1, 0)).some((step) => step.block === "catch");
    const visitedFinally = steps.slice(0, Math.max(stepIdx + 1, 0)).some((step) => step.block === "finally");

    return [
      { label: "Trace one full exception path", done: started && !running },
      { label: "See when catch is skipped or visited", done: visitedCatch || scenario === "normal" },
      { label: "Confirm finally runs", done: visitedFinally },
      { label: "Answer one prediction question", done: score.attempts > 0 },
    ];
  }, [running, scenario, score.attempts, stepIdx, steps]);

  function clearTimers() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function reset(nextPrompt?: string) {
    clearTimers();
    setStepIdx(-1);
    setRunning(false);
    setPracticeMode(false);
    setSelectedAnswer(null);
    if (nextPrompt) {
      setPrompt(nextPrompt);
    }
  }

  useEffect(() => () => clearTimers(), []);

  function runAuto() {
    reset();
    setRunning(true);
    setPrompt("Follow the control flow and watch how exceptions redirect execution.");

    let index = 0;

    function next() {
      if (index < steps.length) {
        setStepIdx(index);
        index += 1;
        timerRef.current = setTimeout(next, 950);
        return;
      }

      setRunning(false);
      setPrompt("Trace finished. Try another scenario or switch into prediction mode.");
    }

    timerRef.current = setTimeout(next, 250);
  }

  function startPractice() {
    reset();
    setPracticeMode(true);
    setStepIdx(0);
    setPrompt(SCENARIOS[scenario].question);
  }

  function submitAnswer(answer: string) {
    if (!practiceMode) return;

    setSelectedAnswer(answer);
    const correct = answer === SCENARIOS[scenario].answer;
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setPracticeMode(false);
    setStepIdx(steps.length - 1);
    setPrompt(
      correct
        ? `Correct. ${answer} is guaranteed to run in this scenario.`
        : `Not quite. ${SCENARIOS[scenario].answer} is the guaranteed next block here.`
    );
  }

  function blockState(blockKey: Exclude<BlockKey, null>) {
    if (!currentStep) return "inactive";
    if (currentStep.block === blockKey) {
      if (currentStep.throwAt === blockKey) return "throwing";
      return "active";
    }

    const order = ["try", "catch", "finally"];
    const currentOrder = order.indexOf(currentStep.block ?? "");
    const thisOrder = order.indexOf(blockKey);
    if (thisOrder < currentOrder) return "past";
    return "inactive";
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Exception Flow Lab"
      subtitle="Students compare normal flow, handled exceptions, and re-throws while predicting which block runs next."
      objective="Students should understand that thrown exceptions redirect control into catch, but finally remains the reliable cleanup path."
      accentClassName="from-rose-300/20 via-amber-300/10 to-transparent"
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
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.entries(SCENARIOS) as [Scenario, (typeof SCENARIOS)[Scenario]][]).map(
              ([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    setScenario(key);
                    reset("Scenario changed. Start a new trace or answer the new prediction.");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    scenario === key
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-900 text-slate-300 hover:text-white"
                  }`}
                >
                  {value.label}
                </button>
              )
            )}
          </div>

          <p className="mb-4 text-sm text-slate-400">{SCENARIOS[scenario].description}</p>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              {(["try", "catch", "finally"] as const).map((key) => {
                const block = BLOCKS[key];
                const state = blockState(key);
                const isActive = state === "active" || state === "throwing";

                return (
                  <div
                    key={key}
                    className={`rounded-[20px] border-2 p-4 font-mono text-sm transition-all ${
                      isActive
                        ? `${block.border} ${block.bg}`
                        : state === "past"
                          ? "border-slate-700 bg-slate-900/60 opacity-70"
                          : "border-slate-800 bg-slate-950/80 opacity-50"
                    } ${state === "throwing" ? "animate-pulse" : ""}`}
                  >
                    <p className={isActive ? block.color : "text-slate-500"}>{block.label} {"{"}</p>
                    {block.lines.map((line) => (
                      <p
                        key={line}
                        className={`pl-4 ${isActive ? "text-slate-200" : "text-slate-600"}`}
                      >
                        {line}
                      </p>
                    ))}
                    {state === "throwing" && (
                      <p className="pl-4 text-rose-300">throw e; // control jumps</p>
                    )}
                    <p className={isActive ? block.color : "text-slate-500"}>{"}"}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Current Observation
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {currentStep?.note ?? prompt}
              </p>

              <div className="mt-4 flex gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full ${
                      index < stepIdx
                        ? "bg-cyan-400"
                        : index === stepIdx
                          ? "bg-amber-300"
                          : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={runAuto}
              disabled={running}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Watch Flow
            </button>
            <button
              onClick={startPractice}
              disabled={running}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Predict Next Block
            </button>
            <button
              onClick={() =>
                reset("Pick a scenario, then watch the execution path or predict which block runs next.")
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prediction Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{SCENARIOS[scenario].question}</p>

            <div className="mt-4 grid gap-2">
              {(["catch", "finally", "program continues"] as const).map((choice) => (
                <button
                  key={choice}
                  onClick={() => submitAnswer(choice)}
                  disabled={!practiceMode}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    practiceMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                      : "border-slate-800 bg-slate-950 text-slate-500"
                  } ${selectedAnswer === choice ? "border-cyan-400" : ""}`}
                >
                  {choice}
                </button>
              ))}
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
              <p>`try` is the hopeful path, but one exception can interrupt the remaining lines immediately.</p>
              <p>`catch` only runs when an exception of the right type is thrown and handled there.</p>
              <p>`finally` is the dependable cleanup hook, even when the exception is re-thrown.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
