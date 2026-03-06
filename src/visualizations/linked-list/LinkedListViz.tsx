"use client";

import { useEffect, useRef, useState } from "react";
import { renderList, type NodeState } from "./linkedListD3";

let idCounter = 0;
function uid() {
  return `n${++idCounter}`;
}

export default function LinkedListViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: uid(), value: 10 },
    { id: uid(), value: 20 },
    { id: uid(), value: 30 },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [highlight, setHighlight] = useState<string | undefined>();
  const [traverseIdx, setTraverseIdx] = useState<number>(-1);

  useEffect(() => {
    if (svgRef.current) {
      renderList(svgRef.current, nodes, highlight);
    }
  }, [nodes, highlight]);

  function insertHead() {
    const val = inputValue.trim();
    if (!val) return;
    const newNode = { id: uid(), value: isNaN(Number(val)) ? val : Number(val) };
    setNodes((prev) => [newNode, ...prev]);
    setHighlight(newNode.id);
    setInputValue("");
    setTimeout(() => setHighlight(undefined), 800);
  }

  function insertTail() {
    const val = inputValue.trim();
    if (!val) return;
    const newNode = { id: uid(), value: isNaN(Number(val)) ? val : Number(val) };
    setNodes((prev) => [...prev, newNode]);
    setHighlight(newNode.id);
    setInputValue("");
    setTimeout(() => setHighlight(undefined), 800);
  }

  function deleteHead() {
    setNodes((prev) => prev.slice(1));
  }

  function deleteTail() {
    setNodes((prev) => prev.slice(0, -1));
  }

  function traverse() {
    if (nodes.length === 0) return;
    let i = 0;
    const step = () => {
      if (i >= nodes.length) {
        setHighlight(undefined);
        return;
      }
      setHighlight(nodes[i].id);
      i++;
      setTimeout(step, 600);
    };
    step();
  }

  function reset() {
    setNodes([
      { id: uid(), value: 10 },
      { id: uid(), value: 20 },
      { id: uid(), value: 30 },
    ]);
    setHighlight(undefined);
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-4">
        Linked List Visualizer
      </h3>

      {/* SVG canvas */}
      <div className="overflow-x-auto mb-6 bg-slate-900 rounded-lg p-4 min-h-[100px]">
        <svg ref={svgRef} />
        {nodes.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">
            List is empty
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insertTail()}
          placeholder="Value..."
          className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={insertHead}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Insert Head
        </button>
        <button
          onClick={insertTail}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Insert Tail
        </button>
        <button
          onClick={deleteHead}
          disabled={nodes.length === 0}
          className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Delete Head
        </button>
        <button
          onClick={deleteTail}
          disabled={nodes.length === 0}
          className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Delete Tail
        </button>
        <button
          onClick={traverse}
          disabled={nodes.length === 0}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Traverse
        </button>
        <button
          onClick={reset}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-slate-500 text-xs mt-3">
        Size: {nodes.length} {nodes.length === 1 ? "node" : "nodes"}
      </p>
    </div>
  );
}
