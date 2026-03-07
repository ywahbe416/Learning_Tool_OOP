"use client";

import { useState, useRef, useEffect } from "react";

interface Frame {
  call: string;
  returnVal: string | null; // null = still computing
  isBase: boolean;
}

function buildFactorialFrames(n: number): Frame[] {
  const frames: Frame[] = [];
  for (let i = n; i >= 0; i--) {
    frames.push({
      call: `factorial(${i})`,
      returnVal: null,
      isBase: i <= 1,
    });
  }
  // Resolve: fill return values from base up
  const resolved = [...frames];
  let product = 1;
  for (let i = resolved.length - 1; i >= 0; i--) {
    const callN = n - i;
    product = callN <= 1 ? 1 : callN * (product / (callN - 1 <= 0 ? 1 : callN - 1));
    // simpler: just compute directly
  }
  // Recompute properly
  const vals: number[] = [];
  for (let i = 0; i <= n; i++) {
    let v = 1;
    for (let j = 2; j <= i; j++) v *= j;
    vals.push(v);
  }
  // frames are ordered n..0; vals[i] = i!
  for (let fi = 0; fi < resolved.length; fi++) {
    const callArg = n - fi;
    resolved[fi] = { ...resolved[fi], returnVal: String(vals[callArg]) };
  }
  return resolved;
}

function buildFibFrames(n: number): Frame[] {
  // Just show the linear call chain for readability (not full tree)
  const frames: Frame[] = [];
  for (let i = n; i >= 0; i--) {
    const fib = (x: number): number => x <= 0 ? 0 : x === 1 ? 1 : fib(x - 1) + fib(x - 2);
    frames.push({
      call: `fib(${i})`,
      returnVal: String(fib(i)),
      isBase: i <= 1,
    });
  }
  return frames;
}

export default function RecursionViz() {
  const [n, setN] = useState(4);
  const [fn, setFn] = useState<"factorial" | "fibonacci">("factorial");
  const [visibleFrames, setVisibleFrames] = useState<Frame[]>([]);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "calling" | "returning" | "done">("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allFrames = fn === "factorial" ? buildFactorialFrames(n) : buildFibFrames(n);

  function clearTimers() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function reset() {
    clearTimers();
    setVisibleFrames([]);
    setResolvedCount(0);
    setPhase("idle");
    setStepIdx(0);
  }

  function runAuto() {
    reset();
    setPhase("calling");
    let callIdx = 0;
    let retIdx = 0;
    const frames = fn === "factorial" ? buildFactorialFrames(n) : buildFibFrames(n);

    function pushNext() {
      if (callIdx < frames.length) {
        setVisibleFrames(frames.slice(0, callIdx + 1).map((f) => ({ ...f, returnVal: null })));
        callIdx++;
        timerRef.current = setTimeout(pushNext, 500);
      } else {
        setPhase("returning");
        popNext();
      }
    }

    function popNext() {
      if (retIdx < frames.length) {
        const resolved = frames.slice(0, frames.length - retIdx);
        setVisibleFrames(resolved);
        setResolvedCount(retIdx + 1);
        retIdx++;
        timerRef.current = setTimeout(popNext, 600);
      } else {
        setPhase("done");
        setVisibleFrames([]);
      }
    }

    timerRef.current = setTimeout(pushNext, 200);
  }

  function stepForward() {
    const frames = fn === "factorial" ? buildFactorialFrames(n) : buildFibFrames(n);
    const totalSteps = frames.length * 2; // call phase + return phase

    if (stepIdx < frames.length) {
      // Calling phase
      setVisibleFrames(frames.slice(0, stepIdx + 1).map((f) => ({ ...f, returnVal: null })));
      setPhase("calling");
    } else {
      // Returning phase
      const retIdx = stepIdx - frames.length;
      const remaining = frames.slice(0, frames.length - retIdx);
      setVisibleFrames(remaining);
      setResolvedCount(retIdx + 1);
      setPhase("returning");
      if (stepIdx === totalSteps - 1) {
        setTimeout(() => { setVisibleFrames([]); setPhase("done"); }, 400);
      }
    }
    setStepIdx((s) => Math.min(s + 1, totalSteps));
  }

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  const totalSteps = allFrames.length * 2;
  const result = fn === "factorial"
    ? allFrames.find((f) => f.call === `factorial(${n})`)?.returnVal
    : allFrames.find((f) => f.call === `fib(${n})`)?.returnVal;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Call Stack Visualizer</h3>
      <p className="text-slate-500 text-xs mb-4">
        Watch frames push onto the stack (calling phase) then pop as values return (unwinding phase).
      </p>

      {/* Settings */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <label className="block text-slate-500 text-xs mb-1">Function</label>
          <div className="flex gap-2">
            {(["factorial", "fibonacci"] as const).map((f) => (
              <button key={f} onClick={() => { setFn(f); reset(); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-colors ${fn === f ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-slate-500 text-xs mb-1">n = {n}</label>
          <input type="range" min={1} max={fn === "fibonacci" ? 7 : 8} value={n}
            onChange={(e) => { setN(Number(e.target.value)); reset(); }}
            className="w-28 accent-indigo-500" />
        </div>
      </div>

      {/* Stack visualization */}
      <div className="bg-slate-900 rounded-lg p-4 min-h-[160px] mb-4 relative">
        {visibleFrames.length === 0 && phase === "idle" && (
          <p className="text-slate-600 text-sm text-center mt-8">Press Run or Step to start</p>
        )}
        {phase === "done" && (
          <p className="text-emerald-400 text-sm text-center mt-8">
            Result: <span className="font-bold font-mono">{result}</span>
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {visibleFrames.map((frame, i) => {
            const isTop = i === 0;
            const isResolved = frame.returnVal !== null;
            return (
              <div key={`${frame.call}-${i}`}
                className={`flex items-center justify-between px-4 py-2 rounded-lg border transition-all text-sm font-mono ${
                  isTop ? "border-amber-500 bg-amber-950/40" :
                  isResolved ? "border-emerald-700 bg-emerald-950/20" :
                  "border-slate-600 bg-slate-800"
                }`}>
                <span className={isTop ? "text-amber-300" : isResolved ? "text-emerald-300" : "text-slate-300"}>
                  {frame.call}
                </span>
                <div className="flex items-center gap-3">
                  {frame.isBase && (
                    <span className="text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">base case</span>
                  )}
                  {isResolved && (
                    <span className="text-emerald-400 text-xs">→ {frame.returnVal}</span>
                  )}
                  {isTop && !isResolved && (
                    <span className="text-amber-500 text-xs animate-pulse">computing...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Phase label */}
        {phase !== "idle" && phase !== "done" && (
          <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded">
            {phase === "calling"
              ? <span className="text-indigo-400">↓ calling</span>
              : <span className="text-amber-400">↑ returning</span>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <button onClick={runAuto} disabled={phase === "calling" || phase === "returning"}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Run
        </button>
        <button onClick={stepForward} disabled={stepIdx >= totalSteps || phase === "calling" || phase === "returning"}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Step
        </button>
        <button onClick={reset}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Reset
        </button>
        {stepIdx > 0 && phase !== "calling" && phase !== "returning" && (
          <span className="text-slate-500 text-xs">{Math.min(stepIdx, totalSteps)}/{totalSteps} steps</span>
        )}
      </div>
    </div>
  );
}
