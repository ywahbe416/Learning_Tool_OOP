"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";

interface Frame {
  call: string;
  returnVal: string;
  isBase: boolean;
}

type FunctionMode = "factorial" | "fibonacci";
type Phase = "idle" | "calling" | "returning" | "done";

function fibonacci(value: number): number {
  if (value <= 0) return 0;
  if (value === 1) return 1;
  return fibonacci(value - 1) + fibonacci(value - 2);
}

function buildFrames(fn: FunctionMode, n: number): Frame[] {
  const frames: Frame[] = [];

  for (let current = n; current >= 0; current -= 1) {
    frames.push({
      call: fn === "factorial" ? `factorial(${current})` : `fib(${current})`,
      returnVal:
        fn === "factorial"
          ? String(Array.from({ length: current }, (_, index) => index + 1).reduce((acc, value) => acc * value, 1))
          : String(fibonacci(current)),
      isBase: current <= 1,
    });
  }

  return frames;
}

export default function RecursionViz() {
  const [n, setN] = useState(4);
  const [fn, setFn] = useState<FunctionMode>("factorial");
  const [visibleFrames, setVisibleFrames] = useState<Frame[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [mode, setMode] = useState<"idle" | "demo" | "practice">("idle");
  const [prompt, setPrompt] = useState(
    "Choose a function and either watch the call stack animate or predict where recursion stops."
  );
  const [selectedBaseGuess, setSelectedBaseGuess] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allFrames = useMemo(() => buildFrames(fn, n), [fn, n]);
  const totalSteps = allFrames.length * 2;
  const currentResult = allFrames[0]?.returnVal ?? "0";
  const actualBaseCase = allFrames.find((frame) => frame.isBase)?.call ?? "";

  const missionState = useMemo(() => {
    const sawCalling = stepIdx > 0;
    const sawReturning = phase === "returning" || phase === "done";
    const answeredPractice = score.attempts > 0;

    return [
      { label: "Trace frames as calls move downward", done: sawCalling },
      { label: "Identify the base case correctly", done: score.correct > 0 },
      { label: "Watch the stack unwind with return values", done: sawReturning },
      { label: "Complete one guided prediction", done: answeredPractice },
    ];
  }, [phase, score, stepIdx]);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function reset(nextPrompt?: string) {
    clearTimer();
    setVisibleFrames([]);
    setPhase("idle");
    setStepIdx(0);
    setMode("idle");
    setSelectedBaseGuess(null);
    if (nextPrompt) {
      setPrompt(nextPrompt);
    }
  }

  useEffect(() => () => clearTimer(), []);

  function watchDemo() {
    reset();
    setMode("demo");
    setPrompt("Watch the stack grow until it hits the base case, then unwind with return values.");

    let callIdx = 0;
    let returnIdx = 0;
    const frames = allFrames;

    setPhase("calling");

    function pushNext() {
      if (callIdx < frames.length) {
        setVisibleFrames(
          frames.slice(0, callIdx + 1).map((frame) => ({ ...frame, returnVal: "" }))
        );
        setStepIdx(callIdx + 1);
        callIdx += 1;
        timerRef.current = setTimeout(pushNext, 550);
        return;
      }

      setPhase("returning");
      popNext();
    }

    function popNext() {
      if (returnIdx < frames.length) {
        const remaining = frames.slice(0, frames.length - returnIdx);
        setVisibleFrames(remaining);
        setStepIdx(frames.length + returnIdx + 1);
        returnIdx += 1;
        timerRef.current = setTimeout(popNext, 650);
        return;
      }

      setPhase("done");
      setVisibleFrames([]);
      setMode("idle");
      setPrompt(`Finished. ${frames[0]?.call} returns ${frames[0]?.returnVal}.`);
    }

    timerRef.current = setTimeout(pushNext, 200);
  }

  function startPractice() {
    reset();
    setMode("practice");
    setVisibleFrames(allFrames.slice(0, Math.max(1, allFrames.length - 2)).map((frame) => ({ ...frame, returnVal: "" })));
    setPhase("calling");
    setStepIdx(Math.max(1, allFrames.length - 2));
    setPrompt("Practice mode: which call is the base case that stops the recursion?");
  }

  function submitBaseCaseGuess(call: string) {
    if (mode !== "practice") return;

    setSelectedBaseGuess(call);
    const correct = call === actualBaseCase;
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));

    setVisibleFrames(allFrames);
    setPhase("returning");
    setMode("idle");
    setStepIdx(allFrames.length + 1);

    if (correct) {
      setPrompt(`Correct. ${call} is the base case, so the stack can start returning values.`);
    } else {
      setPrompt(`Not quite. The base case is ${actualBaseCase}, which stops deeper calls.`);
    }
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Recursion Stack Lab"
      subtitle="Students trace call-stack growth, identify the base case, and connect unwinding to the returned answer."
      objective="Students should see recursion as two phases: repeated self-calls until a base case, followed by returns that resolve each pending frame."
      accentClassName="from-emerald-300/20 via-cyan-300/10 to-transparent"
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
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs text-slate-500">Function</p>
              <div className="flex gap-2">
                {(["factorial", "fibonacci"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFn(option);
                      reset(
                        "Function changed. Start a new walkthrough or a new base-case prediction."
                      );
                    }}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      fn === option
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">n = {n}</span>
              <input
                type="range"
                min={1}
                max={fn === "fibonacci" ? 7 : 8}
                value={n}
                onChange={(event) => {
                  setN(Number(event.target.value));
                  reset("Input changed. Re-run the recursion trace with the new depth.");
                }}
                className="w-36 accent-cyan-400"
              />
            </label>

            <button
              onClick={watchDemo}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Watch Stack
            </button>
            <button
              onClick={startPractice}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
            >
              Predict Base Case
            </button>
            <button
              onClick={() =>
                reset(
                  "Choose a function and either watch the call stack animate or predict where recursion stops."
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Reset
            </button>
          </div>

          <div className="relative min-h-[240px] rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
            {visibleFrames.length === 0 && phase === "idle" && (
              <p className="mt-12 text-center text-sm text-slate-500">
                The stack is empty until the first recursive call is made.
              </p>
            )}

            {phase === "done" && (
              <p className="mt-12 text-center text-sm text-emerald-300">
                Result: <span className="font-mono font-bold">{currentResult}</span>
              </p>
            )}

            <div className="flex flex-col gap-2">
              {visibleFrames.map((frame, index) => {
                const isTop = index === 0;
                const showingReturn = phase === "returning" || phase === "done";
                const isHighlightedGuess = selectedBaseGuess === frame.call;

                return (
                  <div
                    key={`${frame.call}-${index}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-mono transition-colors ${
                      isHighlightedGuess
                        ? "border-cyan-400 bg-cyan-950/30"
                        : isTop
                          ? "border-amber-500 bg-amber-950/25"
                          : frame.isBase
                            ? "border-emerald-700 bg-emerald-950/20"
                            : "border-slate-700 bg-slate-950/80"
                    }`}
                  >
                    <span className={isTop ? "text-amber-300" : "text-slate-200"}>{frame.call}</span>
                    <div className="flex items-center gap-2 text-xs">
                      {frame.isBase && (
                        <span className="rounded-full bg-emerald-950 px-2 py-1 text-emerald-300">
                          base case
                        </span>
                      )}
                      {showingReturn ? (
                        <span className="text-emerald-300">returns {frame.returnVal}</span>
                      ) : (
                        <span className="text-slate-500">waiting</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {phase !== "idle" && phase !== "done" && (
              <div className="absolute right-4 top-4 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                {phase === "calling" ? "calling phase" : "returning phase"}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  index < stepIdx ? "bg-cyan-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Active Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{prompt}</p>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Base-Case Choices
            </p>
            <div className="mt-4 grid gap-2">
              {allFrames.map((frame) => (
                <button
                  key={frame.call}
                  onClick={() => submitBaseCaseGuess(frame.call)}
                  disabled={mode !== "practice"}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    mode === "practice"
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                      : "border-slate-800 bg-slate-950 text-slate-500"
                  }`}
                >
                  {frame.call}
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
              <p>Calling phase adds stack frames because each function is waiting for a smaller subproblem.</p>
              <p>The base case is the first frame that can return immediately without making another recursive call.</p>
              <p>Once that frame returns, every suspended call can resolve on the way back out.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
