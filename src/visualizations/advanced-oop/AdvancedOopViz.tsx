"use client";

import { useState } from "react";

interface ClassNode {
  name: string;
  parent: string | null;
  relation: "extends" | "has-a" | null;
  ownMethods: string[];
  inheritedFrom?: string;
  abstract?: boolean;
}

const CLASSES: ClassNode[] = [
  {
    name: "Object",
    parent: null,
    relation: null,
    ownMethods: ["toString()", "equals()", "hashCode()"],
    abstract: false,
  },
  {
    name: "Animal",
    parent: "Object",
    relation: "extends",
    ownMethods: ["speak()", "toString()"],
    inheritedFrom: "Object",
    abstract: false,
  },
  {
    name: "Dog",
    parent: "Animal",
    relation: "extends",
    ownMethods: ["speak() ← overrides Animal"],
    inheritedFrom: "Animal",
    abstract: false,
  },
  {
    name: "Cat",
    parent: "Animal",
    relation: "extends",
    ownMethods: ["speak() ← overrides Animal"],
    inheritedFrom: "Animal",
    abstract: false,
  },
  {
    name: "Person",
    parent: "Object",
    relation: "extends",
    ownMethods: ["introducePet()"],
    inheritedFrom: "Object",
    abstract: false,
  },
];

// Layout positions (col, row) for a clean tree
const POSITIONS: Record<string, { x: number; y: number }> = {
  Object: { x: 280, y: 20 },
  Animal: { x: 160, y: 110 },
  Person: { x: 400, y: 110 },
  Dog:    { x: 80,  y: 200 },
  Cat:    { x: 240, y: 200 },
};

const NODE_W = 110;
const NODE_H = 40;

const CLASS_COLORS: Record<string, string> = {
  Object: "#475569",
  Animal: "#6366f1",
  Dog:    "#22c55e",
  Cat:    "#f59e0b",
  Person: "#ec4899",
};

const EDGES = [
  { from: "Animal", to: "Object", label: "extends" },
  { from: "Person", to: "Object", label: "extends" },
  { from: "Dog", to: "Animal", label: "extends" },
  { from: "Cat", to: "Animal", label: "extends" },
  { from: "Person", to: "Animal", label: "has-a\n(pet field)", dashed: true },
];

export default function AdvancedOopViz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [polyDemo, setPolyDemo] = useState<string | null>(null);

  const selectedClass = CLASSES.find((c) => c.name === selected);

  function runPolyDemo() {
    // Highlight: Animal ref → Dog instance → Dog.speak() called
    setPolyDemo("Animal ref = new Dog()");
    setTimeout(() => setPolyDemo("Calling .speak() on Animal reference..."), 800);
    setTimeout(() => setPolyDemo("Dog.speak() executes — polymorphism!"), 1600);
    setTimeout(() => setPolyDemo(null), 3200);
    setSelected("Dog");
  }

  const SVG_W = 560;
  const SVG_H = 270;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">Inheritance Hierarchy</h3>
      <p className="text-slate-500 text-xs mb-4">
        Click a class to see its methods. Solid lines = extends. Dashed = composition (has-a).
      </p>

      <div className="flex gap-4">
        {/* SVG tree */}
        <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto flex-shrink-0">
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
              <marker id="arrowhead-dashed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Edges */}
            {EDGES.map((edge) => {
              const from = POSITIONS[edge.from];
              const to = POSITIONS[edge.to];
              if (!from || !to) return null;

              const x1 = from.x + NODE_W / 2;
              const y1 = from.y;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y + NODE_H;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const isDashed = (edge as { dashed?: boolean }).dashed;

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isDashed ? "#f59e0b" : "#475569"}
                    strokeWidth={1.5}
                    strokeDasharray={isDashed ? "5,4" : undefined}
                    markerEnd={isDashed ? "url(#arrowhead-dashed)" : "url(#arrowhead)"}
                  />
                  <text x={midX + 4} y={midY} fill={isDashed ? "#f59e0b" : "#64748b"} fontSize={9} textAnchor="middle">
                    {edge.label.split("\n").map((l, i) => (
                      <tspan key={i} x={midX + 10} dy={i === 0 ? 0 : 11}>{l}</tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {CLASSES.map((cls) => {
              const pos = POSITIONS[cls.name];
              if (!pos) return null;
              const color = CLASS_COLORS[cls.name];
              const isSelected = selected === cls.name;
              const isPoly = polyDemo !== null && cls.name === "Dog";

              return (
                <g key={cls.name}
                  onClick={() => setSelected(cls.name === selected ? null : cls.name)}
                  style={{ cursor: "pointer" }}>
                  <rect
                    x={pos.x} y={pos.y}
                    width={NODE_W} height={NODE_H}
                    rx={8}
                    fill="#1e293b"
                    stroke={isPoly ? "#f59e0b" : isSelected ? color : "#334155"}
                    strokeWidth={isPoly ? 3 : isSelected ? 2.5 : 1.5}
                    style={{ transition: "stroke 0.2s" }}
                  />
                  <text
                    x={pos.x + NODE_W / 2} y={pos.y + NODE_H / 2 + 5}
                    textAnchor="middle"
                    fill={isSelected ? color : "#94a3b8"}
                    fontSize={13}
                    fontWeight={isSelected ? "bold" : "normal"}
                    style={{ transition: "fill 0.2s" }}>
                    {cls.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="flex-1 min-w-[160px]">
          {selectedClass ? (
            <div className="rounded-lg border p-4 text-sm h-full" style={{ borderColor: CLASS_COLORS[selectedClass.name] }}>
              <p className="font-bold mb-3" style={{ color: CLASS_COLORS[selectedClass.name] }}>
                {selectedClass.name}
              </p>
              {selectedClass.inheritedFrom && (
                <>
                  <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Inherited from {selectedClass.inheritedFrom}</p>
                  <div className="space-y-1 mb-3">
                    {CLASSES.find(c => c.name === selectedClass.inheritedFrom)?.ownMethods.map((m) => (
                      <div key={m} className="text-slate-500 font-mono text-xs pl-2">{m}</div>
                    ))}
                  </div>
                </>
              )}
              <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Own methods</p>
              <div className="space-y-1">
                {selectedClass.ownMethods.map((m) => (
                  <div key={m} className="text-indigo-300 font-mono text-xs pl-2">{m}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 p-4 text-slate-600 text-sm h-full flex items-center justify-center text-center">
              Click a class to inspect its methods
            </div>
          )}
        </div>
      </div>

      {/* Polymorphism demo */}
      <div className="mt-4 flex items-center gap-4">
        <button onClick={runPolyDemo}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Polymorphism Demo
        </button>
        {polyDemo && (
          <span className="text-amber-400 text-sm font-mono animate-pulse">{polyDemo}</span>
        )}
      </div>
    </div>
  );
}
