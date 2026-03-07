"use client";

import { useRef, useState } from "react";

interface ObjectInstance {
  id: number;
  owner: string;
  balance: string;
  color: string;
}

const INSTANCE_COLORS = [
  { border: "#6366f1", bg: "#1e1b4b" },
  { border: "#22c55e", bg: "#052e16" },
  { border: "#f59e0b", bg: "#1c1403" },
];

let nextId = 1;

export default function OopBasicsViz() {
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");
  const [instances, setInstances] = useState<ObjectInstance[]>([]);
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  function createInstance() {
    if (!owner.trim() || !balance.trim()) return;
    if (instances.length >= 3) return;
    const id = nextId++;
    const colorIdx = instances.length % INSTANCE_COLORS.length;
    const newInst: ObjectInstance = {
      id,
      owner: owner.trim(),
      balance: balance.trim(),
      color: INSTANCE_COLORS[colorIdx].border,
    };
    setAnimatingId(id);
    setInstances((prev) => [...prev, newInst]);
    setOwner("");
    setBalance("");
    setTimeout(() => setAnimatingId(null), 500);
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-slate-200 font-semibold text-lg mb-1">
        Object Instantiation
      </h3>
      <p className="text-slate-500 text-xs mb-5">
        A class is a blueprint. Each <code className="text-indigo-400">new</code> call creates a separate object with its own data.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Blueprint card */}
        <div className="rounded-lg border-2 border-dashed border-slate-600 p-4 min-w-[150px]">
          <p className="text-slate-500 text-xs font-mono mb-3 uppercase tracking-wider">BankAccount.java</p>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 text-xs">🔒</span>
              <span className="text-slate-500">owner:</span>
              <span className="text-slate-600 italic text-xs">?</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 text-xs">🔒</span>
              <span className="text-slate-500">balance:</span>
              <span className="text-slate-600 italic text-xs">?</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 space-y-1 text-xs font-mono text-slate-600">
            <div>+ deposit()</div>
            <div>+ withdraw()</div>
            <div>+ getBalance()</div>
          </div>
        </div>

        {/* Object instances */}
        {instances.map((inst, i) => {
          const colors = INSTANCE_COLORS[i % INSTANCE_COLORS.length];
          const isAnimating = inst.id === animatingId;
          return (
            <div
              key={inst.id}
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bg,
                transform: isAnimating ? "scale(1.05)" : "scale(1)",
                opacity: isAnimating ? 0.7 : 1,
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
              className="rounded-lg border-2 p-4 min-w-[150px]"
            >
              <p className="text-xs font-mono mb-3 uppercase tracking-wider" style={{ color: colors.border }}>
                :BankAccount
              </p>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 text-xs">🔒</span>
                  <span className="text-slate-400">owner:</span>
                  <span className="text-slate-100 text-xs">"{inst.owner}"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 text-xs">🔒</span>
                  <span className="text-slate-400">balance:</span>
                  <span className="text-slate-100 text-xs">{inst.balance}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs font-mono text-slate-500">
                <div>+ deposit()</div>
                <div>+ withdraw()</div>
              </div>
            </div>
          );
        })}

        {instances.length === 0 && (
          <div className="flex items-center text-slate-600 text-sm italic px-2">
            ← Create instances →
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-slate-500 text-xs mb-1">Owner</label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createInstance()}
            placeholder="e.g. Alice"
            className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-500 text-xs mb-1">Balance</label>
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createInstance()}
            placeholder="e.g. 500.0"
            className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={createInstance}
          disabled={!owner.trim() || !balance.trim() || instances.length >= 3}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors font-mono"
        >
          new BankAccount()
        </button>
        <button
          onClick={() => setInstances([])}
          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      <p className="text-slate-500 text-xs mt-3">
        🔒 = <code className="text-slate-400">private</code> — not accessible outside the class.
        {instances.length >= 3 && " Clear to create more instances."}
      </p>
    </div>
  );
}
