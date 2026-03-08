"use client";

import { useMemo, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";

interface ClassNode {
  name: string;
  parent: string | null;
  ownMethods: string[];
  inheritedFrom?: string;
}

const CLASSES: ClassNode[] = [
  { name: "Object", parent: null, ownMethods: ["toString()", "equals()", "hashCode()"] },
  { name: "Animal", parent: "Object", ownMethods: ["speak()", "toString()"], inheritedFrom: "Object" },
  { name: "Dog", parent: "Animal", ownMethods: ["speak() // overrides"], inheritedFrom: "Animal" },
  { name: "Cat", parent: "Animal", ownMethods: ["speak() // overrides"], inheritedFrom: "Animal" },
  { name: "Person", parent: "Object", ownMethods: ["introducePet()"], inheritedFrom: "Object" },
];

const POSITIONS: Record<string, { x: number; y: number }> = {
  Object: { x: 280, y: 20 },
  Animal: { x: 160, y: 110 },
  Person: { x: 400, y: 110 },
  Dog: { x: 80, y: 200 },
  Cat: { x: 240, y: 200 },
};

const NODE_W = 110;
const NODE_H = 40;

const CLASS_COLORS: Record<string, string> = {
  Object: "#64748b",
  Animal: "#22d3ee",
  Dog: "#22c55e",
  Cat: "#f59e0b",
  Person: "#f472b6",
};

const EDGES = [
  { from: "Animal", to: "Object", label: "extends" },
  { from: "Person", to: "Object", label: "extends" },
  { from: "Dog", to: "Animal", label: "extends" },
  { from: "Cat", to: "Animal", label: "extends" },
  { from: "Person", to: "Animal", label: "has-a\n(pet field)", dashed: true },
];

const POLY_CHOICES = [
  { id: "animal", label: "Animal.speak() implementation" },
  { id: "dog", label: "Dog.speak() implementation" },
  { id: "error", label: "Compile error: Animal cannot call speak()" },
];

export default function AdvancedOopViz() {
  const [selected, setSelected] = useState<string | null>("Animal");
  const [prompt, setPrompt] = useState(
    "Inspect a class, then predict which implementation runs when an Animal reference points to a Dog."
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [polyDemo, setPolyDemo] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);

  const selectedClass = CLASSES.find((cls) => cls.name === selected) ?? null;

  const missionState = useMemo(() => {
    return [
      { label: "Inspect a superclass", done: selected === "Animal" || selected === "Object" },
      { label: "Inspect a subclass override", done: selected === "Dog" || selected === "Cat" },
      { label: "Run the polymorphism demo", done: polyDemo === "complete" || score.attempts > 0 },
      { label: "Answer one dispatch question", done: score.attempts > 0 },
    ];
  }, [polyDemo, score.attempts, selected]);

  function runPolyDemo() {
    setSelected("Dog");
    setPracticeMode(false);
    setSelectedAnswer(null);
    setPrompt("`Animal pet = new Dog(); pet.speak();` dispatches to the overriding Dog implementation at runtime.");
    setPolyDemo("complete");
  }

  function startPractice() {
    setPracticeMode(true);
    setSelectedAnswer(null);
    setSelected("Dog");
    setPrompt("Prediction: if `Animal pet = new Dog();` then `pet.speak()` is called, which method body runs?");
  }

  function submitAnswer(answer: string) {
    if (!practiceMode) return;

    setSelectedAnswer(answer);
    const correct = answer === "dog";
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      attempts: prev.attempts + 1,
    }));
    setPracticeMode(false);
    setPrompt(
      correct
        ? "Correct. The reference type is Animal, but dynamic dispatch picks Dog.speak() at runtime."
        : "Not quite. Method dispatch follows the actual object type, so Dog.speak() runs."
    );
  }

  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <VisualizationCard
      title="Inheritance and Polymorphism Lab"
      subtitle="Students inspect inherited methods, compare class relationships, and predict dynamic dispatch outcomes."
      objective="Students should distinguish inheritance structure from runtime dispatch: subclass objects can be referenced by superclasses, but overridden methods still run from the actual object type."
      accentClassName="from-pink-300/20 via-cyan-300/10 to-transparent"
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
          <div className="overflow-x-auto rounded-[20px] border border-slate-800 bg-slate-900/80 p-4">
            <svg width={560} height={270} viewBox="0 0 560 270">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#475569" />
                </marker>
                <marker id="arrowhead-dashed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                </marker>
              </defs>

              {EDGES.map((edge) => {
                const from = POSITIONS[edge.from];
                const to = POSITIONS[edge.to];
                const x1 = from.x + NODE_W / 2;
                const y1 = from.y;
                const x2 = to.x + NODE_W / 2;
                const y2 = to.y + NODE_H;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={edge.dashed ? "#f59e0b" : "#475569"}
                      strokeWidth={1.5}
                      strokeDasharray={edge.dashed ? "5,4" : undefined}
                      markerEnd={edge.dashed ? "url(#arrowhead-dashed)" : "url(#arrowhead)"}
                    />
                    <text x={midX + 4} y={midY} fill={edge.dashed ? "#f59e0b" : "#64748b"} fontSize={9} textAnchor="middle">
                      {edge.label.split("\n").map((line, index) => (
                        <tspan key={index} x={midX + 10} dy={index === 0 ? 0 : 11}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

              {CLASSES.map((cls) => {
                const pos = POSITIONS[cls.name];
                const isSelected = selected === cls.name;
                const isPolyNode = cls.name === "Dog" && (polyDemo === "complete" || selectedAnswer !== null);

                return (
                  <g
                    key={cls.name}
                    onClick={() => setSelected(cls.name)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={10}
                      fill="#0f172a"
                      stroke={isPolyNode ? "#f59e0b" : isSelected ? CLASS_COLORS[cls.name] : "#334155"}
                      strokeWidth={isPolyNode ? 3 : isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x={pos.x + NODE_W / 2}
                      y={pos.y + NODE_H / 2 + 5}
                      textAnchor="middle"
                      fill={isSelected ? CLASS_COLORS[cls.name] : "#94a3b8"}
                      fontSize={13}
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {cls.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={runPolyDemo}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Show Dispatch Demo
            </button>
            <button
              onClick={startPractice}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
            >
              Predict Method Call
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            {prompt}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Class Inspector
            </p>
            {selectedClass ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="font-semibold" style={{ color: CLASS_COLORS[selectedClass.name] }}>
                  {selectedClass.name}
                </p>
                {selectedClass.inheritedFrom && (
                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Inherited from {selectedClass.inheritedFrom}
                    </p>
                    <div className="mt-2 space-y-1">
                      {CLASSES.find((cls) => cls.name === selectedClass.inheritedFrom)?.ownMethods.map((method) => (
                        <p key={method} className="font-mono text-xs text-slate-400">
                          {method}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Own methods</p>
                  <div className="mt-2 space-y-1">
                    {selectedClass.ownMethods.map((method) => (
                      <p key={method} className="font-mono text-xs text-cyan-300">
                        {method}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prediction Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              `Animal pet = new Dog(); pet.speak();` Which implementation executes?
            </p>
            <div className="mt-4 grid gap-2">
              {POLY_CHOICES.map((choice) => (
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
              Practice Score
            </p>
            <p className="mt-3 text-sm text-slate-300">
              {score.correct}/{score.attempts} correct{accuracy !== null ? ` (${accuracy}%)` : ""}
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <p>`extends` builds the inheritance tree. `has-a` describes composition, not inheritance.</p>
              <p>Inherited methods come from ancestors, but overridden methods can replace behavior in subclasses.</p>
              <p>Polymorphism depends on the runtime object, not just the variable's reference type.</p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
