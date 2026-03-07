"use client";

import { useEffect, useRef, useState } from "react";
import { renderStack, renderQueue, type Item } from "./dataStructuresD3";

let idCounter = 0;
function uid() { return `ds${++idCounter}`; }

const INITIAL_STACK: Item[] = [
  { id: uid(), value: "A" },
  { id: uid(), value: "B" },
  { id: uid(), value: "C" },
];
const INITIAL_QUEUE: Item[] = [
  { id: uid(), value: 1 },
  { id: uid(), value: 2 },
  { id: uid(), value: 3 },
];

export default function DataStructuresViz() {
  const stackRef = useRef<SVGSVGElement>(null);
  const queueRef = useRef<SVGSVGElement>(null);

  const [stack, setStack] = useState<Item[]>(INITIAL_STACK);
  const [queue, setQueue] = useState<Item[]>(INITIAL_QUEUE);
  const [input, setInput] = useState("");
  const [stackHL, setStackHL] = useState<string | undefined>();
  const [queueHL, setQueueHL] = useState<string | undefined>();
  const [message, setMessage] = useState<string>("");

  useEffect(() => { if (stackRef.current) renderStack(stackRef.current, stack, stackHL); }, [stack, stackHL]);
  useEffect(() => { if (queueRef.current) renderQueue(queueRef.current, queue, queueHL); }, [queue, queueHL]);

  function flash(setter: (id: string | undefined) => void, id: string) {
    setter(id);
    setTimeout(() => setter(undefined), 700);
  }

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  }

  function push() {
    const val = input.trim();
    if (!val || stack.length >= 6) return;
    const item: Item = { id: uid(), value: isNaN(Number(val)) ? val : Number(val) };
    setStack((prev) => [item, ...prev]);
    flash(setStackHL, item.id);
    setInput("");
  }

  function pop() {
    if (stack.length === 0) return;
    const top = stack[0];
    showMsg(`Popped: ${top.value}`);
    flash(setStackHL, top.id);
    setTimeout(() => setStack((prev) => prev.slice(1)), 400);
  }

  function enqueue() {
    const val = input.trim();
    if (!val || queue.length >= 5) return;
    const item: Item = { id: uid(), value: isNaN(Number(val)) ? val : Number(val) };
    setQueue((prev) => [...prev, item]);
    flash(setQueueHL, item.id);
    setInput("");
  }

  function dequeue() {
    if (queue.length === 0) return;
    const front = queue[0];
    showMsg(`Dequeued: ${front.value}`);
    flash(setQueueHL, front.id);
    setTimeout(() => setQueue((prev) => prev.slice(1)), 400);
  }

  function reset() {
    setStack(INITIAL_STACK.map((i) => ({ ...i, id: uid() })));
    setQueue(INITIAL_QUEUE.map((i) => ({ ...i, id: uid() })));
    setInput("");
    setMessage("");
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Stack & Queue</h3>

      <div className="grid grid-cols-2 gap-6 mb-5">
        {/* Stack */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-400 font-semibold text-sm">Stack</span>
            <span className="text-slate-500 text-xs">LIFO — Last In, First Out</span>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 min-h-[120px] overflow-hidden">
            <svg ref={stackRef} />
            {stack.length === 0 && <p className="text-slate-600 text-xs text-center pt-4">Empty</p>}
          </div>
        </div>

        {/* Queue */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-400 font-semibold text-sm">Queue</span>
            <span className="text-slate-500 text-xs">FIFO — First In, First Out</span>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 min-h-[80px] overflow-x-auto">
            <svg ref={queueRef} />
            {queue.length === 0 && <p className="text-slate-600 text-xs text-center pt-4">Empty</p>}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-3 text-amber-400 text-sm font-mono">{message}</div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push()}
          placeholder="Value..."
          className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:border-indigo-500"
        />
        <button onClick={push} disabled={!input.trim() || stack.length >= 6}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          Push ↑
        </button>
        <button onClick={pop} disabled={stack.length === 0}
          className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          Pop ↑
        </button>
        <div className="w-px h-6 bg-slate-600" />
        <button onClick={enqueue} disabled={!input.trim() || queue.length >= 5}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          Enqueue →
        </button>
        <button onClick={dequeue} disabled={queue.length === 0}
          className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          Dequeue ←
        </button>
        <button onClick={reset}
          className="bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors ml-auto">
          Reset
        </button>
      </div>
    </div>
  );
}
