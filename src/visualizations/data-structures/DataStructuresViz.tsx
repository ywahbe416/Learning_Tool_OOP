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
const LOOKUP_SEQUENCE = [4, 1, 4, 2, 1];
const BST_TARGETS = [6, 14, 7];
const GRAPH = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "E"],
  D: ["B"],
  E: ["C"],
} as const;

type LabMode = "flow" | "lookup" | "networks";
type StructureKind = "stack" | "queue";
type OperationKind = "push" | "pop" | "enqueue" | "dequeue";
type LookupStage = "predict" | "set" | "map";

interface LookupPendingState {
  value: number;
  seenAlready: boolean;
  correct: boolean;
  nextCount: number;
}

interface BstTraceStep {
  active: number | null;
  visited: number[];
  note: string;
  status: "continue" | "found" | "missing";
}

function createStackItems(values = START_STACK_VALUES): Item[] {
  return values.map((value) => ({ id: uid(), value }));
}

function createQueueItems(values: Array<string | number> = START_QUEUE_VALUES): Item[] {
  return values.map((value) => ({ id: uid(), value }));
}

function computeBstTrace(target: number): BstTraceStep[] {
  const steps: BstTraceStep[] = [];
  const visited: number[] = [];

  function visit(active: number | null, note: string, status: BstTraceStep["status"]) {
    if (active !== null) {
      visited.push(active);
    }
    steps.push({
      active,
      visited: [...visited],
      note,
      status,
    });
  }

  visit(8, target < 8 ? `${target} < 8, so move left.` : target > 8 ? `${target} > 8, so move right.` : `${target} matches the root immediately.`, target === 8 ? "found" : "continue");
  if (target === 8) return steps;

  if (target < 8) {
    visit(3, target < 3 ? `${target} < 3, so move left again.` : target > 3 ? `${target} > 3, so move right.` : `${target} matches 3.`, target === 3 ? "found" : "continue");
    if (target === 3) return steps;

    if (target < 3) {
      visit(1, target === 1 ? `${target} matches 1. Found it.` : `${target} < 1 would move left, but that child is empty.`, target === 1 ? "found" : "missing");
      return steps;
    }

    visit(6, target === 6 ? `${target} matches 6. Found it.` : `${target} > 6 would move right, but that child is empty.`, target === 6 ? "found" : "missing");
    return steps;
  }

  visit(10, target > 10 ? `${target} > 10, so move right.` : `${target} matches 10.`, target === 10 ? "found" : "continue");
  if (target === 10) return steps;

  visit(14, target === 14 ? `${target} matches 14. Found it.` : `${target} < 14 would move left, but that child is empty in this example.`, target === 14 ? "found" : "missing");
  return steps;
}

function NodeBadge({
  label,
  state,
}: {
  label: string | number;
  state: "idle" | "frontier" | "visited" | "active" | "found";
}) {
  const classes = {
    idle: "border-slate-700 bg-slate-900 text-slate-300",
    frontier: "border-cyan-500 bg-cyan-400/10 text-cyan-200",
    visited: "border-slate-500 bg-slate-800 text-slate-200",
    active: "border-amber-500 bg-amber-400/10 text-amber-200",
    found: "border-emerald-500 bg-emerald-400/10 text-emerald-200",
  } as const;

  return (
    <div
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition-all ${classes[state]}`}
    >
      {label}
    </div>
  );
}

export default function DataStructuresViz() {
  const [labMode, setLabMode] = useState<LabMode>("flow");

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
  const [flowScore, setFlowScore] = useState({ correct: 0, attempts: 0 });

  const [lookupStep, setLookupStep] = useState(0);
  const [lookupStage, setLookupStage] = useState<LookupStage>("predict");
  const [lookupSeen, setLookupSeen] = useState<number[]>([]);
  const [lookupCounts, setLookupCounts] = useState<Record<number, number>>({});
  const [lookupPending, setLookupPending] = useState<LookupPendingState | null>(null);
  const [lookupScore, setLookupScore] = useState({ correct: 0, attempts: 0 });
  const [lookupMessage, setLookupMessage] = useState(
    "Stage 1: predict whether the next value is brand new or already in the set."
  );
  const [lookupHistory, setLookupHistory] = useState<string[]>([]);

  const [bstTarget, setBstTarget] = useState(6);
  const [bstTrace, setBstTrace] = useState<BstTraceStep[]>([]);
  const [bstTraceIndex, setBstTraceIndex] = useState(-1);
  const [bstMessage, setBstMessage] = useState(
    "Start a BST trace, then step through one comparison at a time."
  );

  const [bfsVisited, setBfsVisited] = useState<string[]>([]);
  const [bfsFrontier, setBfsFrontier] = useState<string[]>(["A"]);
  const [bfsSeen, setBfsSeen] = useState<string[]>(["A"]);
  const [bfsActiveNode, setBfsActiveNode] = useState<string | null>(null);
  const [bfsMessage, setBfsMessage] = useState(
    "Step BFS to see the queue preserve level order in the graph."
  );
  const [bfsHistory, setBfsHistory] = useState<string[]>([]);

  useEffect(() => {
    if (stackRef.current) renderStack(stackRef.current, stack, stackHL);
  }, [stack, stackHL]);

  useEffect(() => {
    if (queueRef.current) renderQueue(queueRef.current, queue, queueHL);
  }, [queue, queueHL]);

  const currentLookupValue = lookupStep < LOOKUP_SEQUENCE.length ? LOOKUP_SEQUENCE[lookupStep] : null;
  const activeBstStep =
    bstTraceIndex >= 0 && bstTraceIndex < bstTrace.length ? bstTrace[bstTraceIndex] : null;

  const missionState = useMemo(() => {
    return [
      { label: "Compare LIFO and FIFO behavior", done: flowScore.attempts > 0 },
      { label: "Walk one value through set + map updates", done: lookupHistory.length >= 2 },
      { label: "Trace a BST search branch by branch", done: bstTraceIndex >= 0 },
      { label: "Visit graph nodes in BFS order", done: bfsVisited.length >= 5 },
    ];
  }, [bfsVisited.length, bstTraceIndex, flowScore.attempts, lookupHistory.length]);

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

  function resetFlow() {
    setStack(createStackItems());
    setQueue(createQueueItems());
    setInput("X");
    setHistory([]);
    setPracticeMode(false);
    setFlowScore({ correct: 0, attempts: 0 });
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
    setFlowScore((prev) => ({
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

  function answerLookup(choice: "new" | "duplicate") {
    if (lookupStage !== "predict" || currentLookupValue === null) return;

    const seenAlready = lookupSeen.includes(currentLookupValue);
    const correct = (choice === "duplicate") === seenAlready;
    const nextCount = (lookupCounts[currentLookupValue] ?? 0) + 1;

    setLookupPending({
      value: currentLookupValue,
      seenAlready,
      correct,
      nextCount,
    });
    setLookupScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setLookupStage("set");
    setLookupMessage(
      `Stage 2: HashSet check says ${currentLookupValue} is ${seenAlready ? "already present" : "new"}.`
    );
  }

  function advanceLookupStage() {
    if (!lookupPending) return;

    if (lookupStage === "set") {
      if (!lookupPending.seenAlready) {
        setLookupSeen((prev) => [...prev, lookupPending.value]);
      }
      setLookupStage("map");
      setLookupMessage(
        `Stage 3: update HashMap count for ${lookupPending.value} to ${lookupPending.nextCount}.`
      );
      return;
    }

    if (lookupStage === "map") {
      setLookupCounts((prev) => ({
        ...prev,
        [lookupPending.value]: lookupPending.nextCount,
      }));
      setLookupHistory((prev) => [
        `${lookupPending.value}: ${lookupPending.seenAlready ? "duplicate" : "new"} -> count ${lookupPending.nextCount}`,
        ...prev,
      ].slice(0, 5));

      const nextStep = lookupStep + 1;
      setLookupPending(null);
      setLookupStage("predict");
      setLookupStep(nextStep);

      if (nextStep >= LOOKUP_SEQUENCE.length) {
        setLookupMessage("Lookup stream complete. Reset to replay the set + map pipeline.");
      } else {
        setLookupMessage(
          `Next value is ${LOOKUP_SEQUENCE[nextStep]}. Stage 1: predict whether it is new or duplicate.`
        );
      }
    }
  }

  function resetLookup() {
    setLookupStep(0);
    setLookupStage("predict");
    setLookupSeen([]);
    setLookupCounts({});
    setLookupPending(null);
    setLookupScore({ correct: 0, attempts: 0 });
    setLookupHistory([]);
    setLookupMessage(
      "Stage 1: predict whether the next value is brand new or already in the set."
    );
  }

  function startBstTrace() {
    const trace = computeBstTrace(bstTarget);
    setBstTrace(trace);
    setBstTraceIndex(0);
    setBstMessage(trace[0]?.note ?? "Trace ready.");
  }

  function stepBstTrace() {
    if (bstTrace.length === 0) {
      startBstTrace();
      return;
    }

    const nextIndex = Math.min(bstTraceIndex + 1, bstTrace.length - 1);
    setBstTraceIndex(nextIndex);
    setBstMessage(bstTrace[nextIndex]?.note ?? "Trace ready.");
  }

  function stepBfs() {
    if (bfsFrontier.length === 0) {
      setBfsActiveNode(null);
      setBfsMessage("BFS complete. The queue is empty, so every reachable node has been visited.");
      return;
    }

    const [node, ...rest] = bfsFrontier;
    const neighbors = GRAPH[node as keyof typeof GRAPH] ?? [];
    const additions = neighbors.filter((neighbor) => !bfsSeen.includes(neighbor));

    setBfsActiveNode(node);
    setBfsVisited((prev) => [...prev, node]);
    setBfsSeen((prev) => [...prev, ...additions]);
    setBfsFrontier([...rest, ...additions]);
    setBfsHistory((prev) => [
      `${node} visited -> enqueue ${additions.length > 0 ? additions.join(", ") : "nothing new"}`,
      ...prev,
    ].slice(0, 5));
    setBfsMessage(
      `Visit ${node}, then enqueue unseen neighbors ${additions.length > 0 ? additions.join(", ") : "none"}.`
    );
  }

  function resetNetworks() {
    setBstTarget(6);
    setBstTrace([]);
    setBstTraceIndex(-1);
    setBstMessage("Start a BST trace, then step through one comparison at a time.");
    setBfsVisited([]);
    setBfsFrontier(["A"]);
    setBfsSeen(["A"]);
    setBfsActiveNode(null);
    setBfsHistory([]);
    setBfsMessage("Step BFS to see the queue preserve level order in the graph.");
  }

  const flowAccuracy =
    flowScore.attempts > 0 ? Math.round((flowScore.correct / flowScore.attempts) * 100) : null;
  const lookupAccuracy =
    lookupScore.attempts > 0 ? Math.round((lookupScore.correct / lookupScore.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Data Structure Studio"
      subtitle="Switch between sequence flow, hash-based lookup, and tree/graph traversal without collapsing every structure into one overloaded lab."
      objective="Students should match the problem to the structure: sequence flow for stack/queue, constant-time lookup for hash-based structures, and guided branching/traversal for trees and graphs."
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
      <div className="mb-5 flex flex-wrap gap-3">
        {(
          [
            ["flow", "Stack + Queue"],
            ["lookup", "HashMap + HashSet"],
            ["networks", "BST + BFS"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setLabMode(mode)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              labMode === mode
                ? "border-cyan-400 bg-cyan-400 text-slate-950"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {labMode === "flow" && (
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
                onClick={resetFlow}
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
                {flowScore.correct}/{flowScore.attempts} correct{flowAccuracy !== null ? ` (${flowAccuracy}%)` : ""}
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <p>Stacks use one accessible end, so the newest item is always first eligible for removal.</p>
                <p>Queues separate insertion and removal ends, so older items leave before newer ones.</p>
                <p>This stays focused on flow rules; the other modes handle lookup and traversal without crowding this canvas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {labMode === "lookup" && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Lookup Pipeline
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Each value goes through three steps: prediction, HashSet membership, then HashMap count update.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {LOOKUP_SEQUENCE.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      index < lookupStep
                        ? "border-emerald-700 bg-emerald-950/40 text-emerald-200"
                        : index === lookupStep
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                          : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {value}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["predict", "1. Predict"],
                    ["set", "2. HashSet"],
                    ["map", "3. HashMap"],
                  ] as const
                ).map(([stage, label]) => (
                  <div
                    key={stage}
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      lookupStage === stage
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                        : "border-slate-800 bg-slate-900/80 text-slate-400"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current value</p>
                <p className="mt-2 text-3xl font-semibold text-slate-100">
                  {currentLookupValue ?? "Done"}
                </p>
                <p className="mt-3 text-sm text-slate-300">{lookupMessage}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => answerLookup("new")}
                  disabled={lookupStage !== "predict" || currentLookupValue === null}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-slate-100 transition-colors hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Predict: new to set
                </button>
                <button
                  type="button"
                  onClick={() => answerLookup("duplicate")}
                  disabled={lookupStage !== "predict" || currentLookupValue === null}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-slate-100 transition-colors hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Predict: duplicate
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={advanceLookupStage}
                  disabled={!lookupPending}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {lookupStage === "set" ? "Apply HashSet Step" : "Apply HashMap Step"}
                </button>
                <button
                  type="button"
                  onClick={resetLookup}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
                >
                  Reset Lookup Lab
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Step History
              </p>
              <div className="mt-4 space-y-2">
                {lookupHistory.length > 0 ? (
                  lookupHistory.map((entry) => (
                    <div
                      key={entry}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300"
                    >
                      {entry}
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">
                    Completed value updates appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                HashSet Membership
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lookupSeen.length > 0 ? (
                  lookupSeen.map((value) => (
                    <span
                      key={value}
                      className={`rounded-full border px-3 py-1 text-sm font-medium ${
                        lookupPending?.value === value && lookupStage !== "predict"
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {value}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">The set starts empty.</p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                HashMap Counts
              </p>
              <div className="mt-4 space-y-2">
                {Object.keys(lookupCounts).length > 0 ? (
                  Object.entries(lookupCounts).map(([value, count]) => (
                    <div
                      key={value}
                      className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
                        lookupPending?.value === Number(value) && lookupStage === "map"
                          ? "border-amber-500 bg-amber-400/10 text-amber-200"
                          : "border-slate-800 bg-slate-900/80 text-slate-300"
                      }`}
                    >
                      <span>key {value}</span>
                      <span className="font-mono">count {count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Counts appear after each HashMap write.</p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Lookup Score
              </p>
              <p className="mt-3 text-sm text-slate-300">
                {lookupScore.correct}/{lookupScore.attempts} correct{lookupAccuracy !== null ? ` (${lookupAccuracy}%)` : ""}
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <p>HashSet answers “have I seen this?” quickly.</p>
                <p>HashMap answers “how many times have I seen this?” just as quickly.</p>
                <p>This mode now walks one value through both structures so the operations feel procedural, not static.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {labMode === "networks" && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              BST Search Trace
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Step through one branch at a time. A BST search should not wander through the entire tree.
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Target</span>
                <select
                  value={bstTarget}
                  onChange={(event) => setBstTarget(Number(event.target.value))}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
                >
                  {BST_TARGETS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={startBstTrace}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
              >
                Start Trace
              </button>
              <button
                type="button"
                onClick={stepBstTrace}
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
              >
                Next BST Step
              </button>
            </div>

            <div className="mt-5 space-y-4 rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex justify-center">
                <NodeBadge
                  label={8}
                  state={
                    activeBstStep?.active === 8
                      ? activeBstStep.status === "found"
                        ? "found"
                        : "active"
                      : activeBstStep?.visited.includes(8)
                        ? "visited"
                        : "idle"
                  }
                />
              </div>
              <div className="flex justify-center gap-24">
                {[3, 10].map((value) => (
                  <NodeBadge
                    key={value}
                    label={value}
                    state={
                      activeBstStep?.active === value
                        ? activeBstStep.status === "found"
                          ? "found"
                          : "active"
                        : activeBstStep?.visited.includes(value)
                          ? "visited"
                          : "idle"
                    }
                  />
                ))}
              </div>
              <div className="flex justify-center gap-12">
                {[1, 6, 14].map((value) => (
                  <NodeBadge
                    key={value}
                    label={value}
                    state={
                      activeBstStep?.active === value
                        ? activeBstStep.status === "found"
                          ? "found"
                          : "active"
                        : activeBstStep?.visited.includes(value)
                          ? "visited"
                          : "idle"
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {activeBstStep?.visited.length ? (
                activeBstStep.visited.map((node, index) => (
                  <span
                    key={`${node}-${index}`}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200"
                  >
                    {node}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Visited BST nodes will appear here.</p>
              )}
            </div>

            <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              {bstMessage}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              BFS Graph Walk
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              BFS uses a queue so the oldest frontier node gets expanded first.
            </p>

            <div className="mt-5 space-y-4 rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex justify-center">
                <NodeBadge
                  label="A"
                  state={
                    bfsActiveNode === "A"
                      ? "active"
                      : bfsVisited.includes("A")
                        ? "visited"
                        : bfsFrontier.includes("A")
                          ? "frontier"
                          : "idle"
                  }
                />
              </div>
              <div className="flex justify-center gap-24">
                {["B", "C"].map((node) => (
                  <NodeBadge
                    key={node}
                    label={node}
                    state={
                      bfsActiveNode === node
                        ? "active"
                        : bfsVisited.includes(node)
                          ? "visited"
                          : bfsFrontier.includes(node)
                            ? "frontier"
                            : bfsSeen.includes(node)
                              ? "frontier"
                              : "idle"
                    }
                  />
                ))}
              </div>
              <div className="flex justify-center gap-24">
                {["D", "E"].map((node) => (
                  <NodeBadge
                    key={node}
                    label={node}
                    state={
                      bfsActiveNode === node
                        ? "active"
                        : bfsVisited.includes(node)
                          ? "visited"
                          : bfsFrontier.includes(node)
                            ? "frontier"
                            : bfsSeen.includes(node)
                              ? "frontier"
                              : "idle"
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Queue</p>
                <p className="mt-2 text-sm text-slate-300">
                  {bfsFrontier.length > 0 ? bfsFrontier.join(" -> ") : "empty"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Visit Order</p>
                <p className="mt-2 text-sm text-slate-300">
                  {bfsVisited.length > 0 ? bfsVisited.join(" -> ") : "none yet"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={stepBfs}
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
              >
                Step BFS
              </button>
              <button
                type="button"
                onClick={resetNetworks}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
              >
                Reset Tree + Graph Lab
              </button>
            </div>

            <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              {bfsMessage}
            </div>

            <div className="mt-4 space-y-2">
              {bfsHistory.length > 0 ? (
                bfsHistory.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300"
                  >
                    {entry}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">
                  BFS step notes appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </VisualizationCard>
  );
}
