"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";
import { renderQueue, renderStack, type Item } from "./dataStructuresD3";

let idCounter = 0;
function uid() {
  return `ds${++idCounter}`;
}

const START_STACK_VALUES = ["A", "B", "C"];
const START_QUEUE_VALUES = [1, 2, 3];
const PRACTICE_VALUES = ["N", "Q"];

type StructureKind = "stack" | "queue";
type OperationKind = "push" | "pop" | "enqueue" | "dequeue";

function createStackItems(values = START_STACK_VALUES): Item[] {
  return values.map((value) => ({ id: uid(), value }));
}

function createQueueItems(values: Array<string | number> = START_QUEUE_VALUES): Item[] {
  return values.map((value) => ({ id: uid(), value }));
}

export default function DataStructuresViz() {
  const stackRef = useRef<SVGSVGElement>(null);
  const queueRef = useRef<SVGSVGElement>(null);

  const [stack, setStack] = useState<Item[]>(createStackItems());
  const [queue, setQueue] = useState<Item[]>(createQueueItems());
  const [input, setInput] = useState("X");
  const [stackHL, setStackHL] = useState<string | undefined>();
  const [queueHL, setQueueHL] = useState<string | undefined>();
  const [message, setMessage] = useState("Push and enqueue the same value to compare where each structure stores it.");
  const [history, setHistory] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });

  useEffect(() => {
    if (stackRef.current) renderStack(stackRef.current, stack, stackHL);
  }, [stack, stackHL]);

  useEffect(() => {
    if (queueRef.current) renderQueue(queueRef.current, queue, queueHL);
  }, [queue, queueHL]);

  const missionState = useMemo(() => {
    const comparedInsertions = history.some(
      (entry) => entry.includes("push") && history.some((other) => other.includes("enqueue"))
    );
    const removedFromBoth = history.some((entry) => entry.includes("pop")) && history.some((entry) => entry.includes("dequeue"));

    return [
      { label: "Insert into both structures", done: comparedInsertions },
      { label: "Remove from both structures", done: removedFromBoth },
      { label: "Complete one behavior prediction", done: score.attempts > 0 },
      { label: "Explain LIFO vs FIFO with the visuals", done: score.correct > 0 },
    ];
  }, [history, score]);

  function flash(setter: (id: string | undefined) => void, id: string) {
    setter(id);
    setTimeout(() => setter(undefined), 700);
  }

  function addHistory(entry: string) {
    setHistory((prev) => [entry, ...prev].slice(0, 6));
    setMessage(entry);
  }

  function performOperation(kind: OperationKind, fromPractice = false) {
    if (kind === "push") {
      const value = input.trim();
      if (!value || stack.length >= 6) return;
      const item: Item = { id: uid(), value: Number.isNaN(Number(value)) ? value : Number(value) };
      setStack((prev) => [item, ...prev]);
      flash(setStackHL, item.id);
      addHistory(`push(${value}) places the new item on top of the stack.`);
      if (!fromPractice) setInput("");
      return;
    }

    if (kind === "pop") {
      if (stack.length === 0) return;
      const top = stack[0];
      flash(setStackHL, top.id);
      setTimeout(() => setStack((prev) => prev.slice(1)), 400);
      addHistory(`pop() removes ${top.value} first because the stack is LIFO.`);
      return;
    }

    if (kind === "enqueue") {
      const value = input.trim();
      if (!value || queue.length >= 5) return;
      const item: Item = { id: uid(), value: Number.isNaN(Number(value)) ? value : Number(value) };
      setQueue((prev) => [...prev, item]);
      flash(setQueueHL, item.id);
      addHistory(`enqueue(${value}) adds the new item at the rear of the queue.`);
      if (!fromPractice) setInput("");
      return;
    }

    if (queue.length === 0) return;
    const front = queue[0];
    flash(setQueueHL, front.id);
    setTimeout(() => setQueue((prev) => prev.slice(1)), 400);
    addHistory(`dequeue() removes ${front.value} first because the queue is FIFO.`);
  }

  function reset() {
    setStack(createStackItems());
    setQueue(createQueueItems());
    setInput("X");
    setHistory([]);
    setPracticeMode(false);
    setMessage("Push and enqueue the same value to compare where each structure stores it.");
  }

  function startPractice() {
    setPracticeMode(true);
    setStack(createStackItems(PRACTICE_VALUES));
    setQueue(createQueueItems(PRACTICE_VALUES));
    setMessage("Practice round: predict which structure will remove N first.");
    setHistory((prev) => [
      "Practice setup: stack top is N, queue front is N.",
      ...prev,
    ].slice(0, 6));
  }

  function answerPractice(choice: StructureKind) {
    if (!practiceMode) return;

    const correct = choice === "stack";
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setPracticeMode(false);

    if (correct) {
      addHistory("Correct: the stack removes N first because it was inserted last and sits on top.");
    } else {
      addHistory("Not quite: the queue removes N later because it leaves from the front in arrival order.");
    }
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Stack vs Queue Lab"
      subtitle="Students manipulate both structures side by side, then predict which item leaves first under LIFO and FIFO rules."
      objective="Students should connect each operation to structure shape: stack edits the top, queue edits opposite ends."
      accentClassName="from-violet-300/20 via-sky-300/10 to-transparent"
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-cyan-300">Stack</span>
                <span className="text-xs text-slate-500">LIFO: last in, first out</span>
              </div>
              <div className="min-h-[200px] rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
                <svg ref={stackRef} />
                {stack.length === 0 && (
                  <p className="pt-6 text-center text-sm text-slate-500">Stack empty</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-amber-300">Queue</span>
                <span className="text-xs text-slate-500">FIFO: first in, first out</span>
              </div>
              <div className="min-h-[200px] rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
                <svg ref={queueRef} />
                {queue.length === 0 && (
                  <p className="pt-6 text-center text-sm text-slate-500">Queue empty</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Value</span>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
              />
            </label>
            <button
              onClick={() => performOperation("push")}
              disabled={!input.trim() || stack.length >= 6}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Push to Stack
            </button>
            <button
              onClick={() => performOperation("pop")}
              disabled={stack.length === 0}
              className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Pop Stack
            </button>
            <button
              onClick={() => performOperation("enqueue")}
              disabled={!input.trim() || queue.length >= 5}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enqueue Queue
            </button>
            <button
              onClick={() => performOperation("dequeue")}
              disabled={queue.length === 0}
              className="rounded-xl bg-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Dequeue Queue
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={startPractice}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Start Prediction Round
            </button>
            <button
              onClick={reset}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            {message}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prediction Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {practiceMode
                ? "N was inserted after Q in both structures. Which structure removes N first?"
                : "Use the same value in both structures, then compare where it lands and which end can remove it."}
            </p>

            <div className="mt-4 grid gap-2">
              {(["stack", "queue"] as const).map((choice) => (
                <button
                  key={choice}
                  onClick={() => answerPractice(choice)}
                  disabled={!practiceMode}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    practiceMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400"
                      : "border-slate-800 bg-slate-950 text-slate-500"
                  }`}
                >
                  {choice === "stack"
                    ? "Stack removes N first"
                    : "Queue removes N first"}
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
                  Your operations will be narrated here.
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
              <p>Stacks use one accessible end, so the newest item is always the first one eligible for removal.</p>
              <p>Queues separate insertion and removal ends, so older items leave before newer ones.</p>
              <p>The diagrams make that policy visible: top for stack, front/rear for queue.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
