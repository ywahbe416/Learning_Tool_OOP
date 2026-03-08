"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";
import { renderList, type NodeState } from "./linkedListD3";

let idCounter = 0;
function uid() {
  return `n${++idCounter}`;
}

function createInitialNodes(): NodeState[] {
  return [
    { id: uid(), value: 10 },
    { id: uid(), value: 20 },
    { id: uid(), value: 30 },
  ];
}

export default function LinkedListViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NodeState[]>(createInitialNodes());
  const [inputValue, setInputValue] = useState("40");
  const [highlight, setHighlight] = useState<string | undefined>();
  const [prompt, setPrompt] = useState(
    "Insert at the head and tail, then compare how the head pointer changes."
  );
  const [history, setHistory] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });

  useEffect(() => {
    if (svgRef.current) {
      renderList(svgRef.current, nodes, highlight);
    }
  }, [nodes, highlight]);

  const missionState = useMemo(() => {
    const headInsert = history.some((entry) => entry.includes("Inserted at head"));
    const tailInsert = history.some((entry) => entry.includes("Inserted at tail"));
    const traversed = history.some((entry) => entry.includes("Traversed"));

    return [
      { label: "Insert at head", done: headInsert },
      { label: "Insert at tail", done: tailInsert },
      { label: "Traverse the list", done: traversed },
      { label: "Answer one pointer question", done: score.attempts > 0 },
    ];
  }, [history, score.attempts]);

  function flash(id: string | undefined) {
    setHighlight(id);
    setTimeout(() => setHighlight(undefined), 800);
  }

  function addHistory(entry: string) {
    setHistory((prev) => [entry, ...prev].slice(0, 6));
    setPrompt(entry);
  }

  function insertHead() {
    const value = inputValue.trim();
    if (!value) return;
    const newNode = { id: uid(), value: Number.isNaN(Number(value)) ? value : Number(value) };
    setNodes((prev) => [newNode, ...prev]);
    flash(newNode.id);
    addHistory(`Inserted at head: ${value}. The head pointer now refers to the new first node.`);
    setInputValue("");
  }

  function insertTail() {
    const value = inputValue.trim();
    if (!value) return;
    const newNode = { id: uid(), value: Number.isNaN(Number(value)) ? value : Number(value) };
    setNodes((prev) => [...prev, newNode]);
    flash(newNode.id);
    addHistory(`Inserted at tail: ${value}. Existing links stay the same until the old tail points to the new node.`);
    setInputValue("");
  }

  function deleteHead() {
    if (nodes.length === 0) return;
    addHistory(`Deleted head ${nodes[0].value}. The second node becomes the new head.`);
    setNodes((prev) => prev.slice(1));
  }

  function deleteTail() {
    if (nodes.length === 0) return;
    addHistory(`Deleted tail ${nodes[nodes.length - 1].value}. The previous node now points to null.`);
    setNodes((prev) => prev.slice(0, -1));
  }

  function traverse() {
    if (nodes.length === 0) return;
    nodes.forEach((node, index) => {
      setTimeout(() => setHighlight(node.id), index * 500);
    });
    setTimeout(() => setHighlight(undefined), nodes.length * 500);
    addHistory(`Traversed from head to tail. Each node is reached by following the next reference.`);
  }

  function startPractice() {
    setPracticeMode(true);
    setSelectedAnswer(null);
    setPrompt("Prediction: if you insert 5 at the head of the current list, which node does head point to next?");
  }

  function submitAnswer(answer: string) {
    if (!practiceMode) return;

    setSelectedAnswer(answer);
    const correct = answer === "new";
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setPracticeMode(false);
    setPrompt(
      correct
        ? "Correct. Head always points to the newest front node after a head insertion."
        : "Not quite. A head insertion updates head to the brand-new node, not the old first node."
    );
  }

  function reset() {
    setNodes(createInitialNodes());
    setHighlight(undefined);
    setInputValue("40");
    setPrompt("Insert at the head and tail, then compare how the head pointer changes.");
    setHistory([]);
    setPracticeMode(false);
    setSelectedAnswer(null);
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Linked List Pointer Lab"
      subtitle="Students manipulate head and tail operations, traverse node-by-node, and predict how pointer updates change the list."
      objective="Students should reason about linked lists as pointer updates rather than array shifts, especially at the head and tail."
      accentClassName="from-amber-300/20 via-cyan-300/10 to-transparent"
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
          <div className="overflow-x-auto rounded-[20px] border border-slate-800 bg-slate-900/80 p-4 min-h-[120px]">
            <svg ref={svgRef} />
            {nodes.length === 0 && <p className="py-4 text-center text-sm text-slate-500">List is empty</p>}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Value</span>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
              />
            </label>
            <button
              onClick={insertHead}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Insert Head
            </button>
            <button
              onClick={insertTail}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
            >
              Insert Tail
            </button>
            <button
              onClick={deleteHead}
              disabled={nodes.length === 0}
              className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete Head
            </button>
            <button
              onClick={deleteTail}
              disabled={nodes.length === 0}
              className="rounded-xl bg-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete Tail
            </button>
            <button
              onClick={traverse}
              disabled={nodes.length === 0}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Traverse
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={startPractice}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Predict Head Pointer
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
              Pointer Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              After inserting a new node at the head, where should the `head` reference point?
            </p>
            <div className="mt-4 grid gap-2">
              {[
                { id: "new", label: "The new node that was inserted" },
                { id: "old", label: "The old first node" },
                { id: "tail", label: "The last node in the list" },
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
                  Node updates will be narrated here.
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
              <p>Linked lists are driven by references, so inserting at head is mostly a head-pointer update.</p>
              <p>Tail operations require walking or updating the previous tail's `next` reference.</p>
              <p>Traversal is sequential: every node is discovered by following the pointer from the previous one.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
