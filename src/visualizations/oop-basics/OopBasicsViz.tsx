"use client";

import { useEffect, useMemo, useState } from "react";
import VisualizationCard from "@/components/topic/VisualizationCard";

interface AccountInstance {
  id: number;
  owner: string;
  balance: number;
}

const INSTANCE_COLORS = {
  dark: [
    {
      border: "#22c55e",
      bg: "#052e16",
      text: "#86efac",
      chipBg: "rgba(2, 6, 23, 0.72)",
      panelBg: "rgba(2, 6, 23, 0.6)",
      labelText: "#64748b",
      valueText: "#f8fafc",
    },
    {
      border: "#38bdf8",
      bg: "#082f49",
      text: "#7dd3fc",
      chipBg: "rgba(2, 6, 23, 0.72)",
      panelBg: "rgba(2, 6, 23, 0.6)",
      labelText: "#64748b",
      valueText: "#f8fafc",
    },
    {
      border: "#f59e0b",
      bg: "#1c1917",
      text: "#fcd34d",
      chipBg: "rgba(2, 6, 23, 0.72)",
      panelBg: "rgba(2, 6, 23, 0.6)",
      labelText: "#64748b",
      valueText: "#f8fafc",
    },
  ],
  light: [
    {
      border: "#16a34a",
      bg: "#dcfce7",
      text: "#166534",
      chipBg: "rgba(255, 255, 255, 0.9)",
      panelBg: "rgba(255, 255, 255, 0.72)",
      labelText: "#64748b",
      valueText: "#0f172a",
    },
    {
      border: "#0284c7",
      bg: "#e0f2fe",
      text: "#075985",
      chipBg: "rgba(255, 255, 255, 0.9)",
      panelBg: "rgba(255, 255, 255, 0.72)",
      labelText: "#64748b",
      valueText: "#0f172a",
    },
    {
      border: "#d97706",
      bg: "#fef3c7",
      text: "#92400e",
      chipBg: "rgba(255, 255, 255, 0.9)",
      panelBg: "rgba(255, 255, 255, 0.72)",
      labelText: "#64748b",
      valueText: "#0f172a",
    },
  ],
} as const;

const STARTER_SCENARIOS = [
  { owner: "Ava", balance: 250 },
  { owner: "Noah", balance: 480 },
  { owner: "Mia", balance: 120 },
];

type OperationType = "deposit" | "withdraw";

let nextId = 1;

export default function OopBasicsViz() {
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("200");
  const [instances, setInstances] = useState<AccountInstance[]>([
    { id: nextId++, owner: "Ava", balance: 250 },
    { id: nextId++, owner: "Noah", balance: 480 },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [amount, setAmount] = useState("50");
  const [lastAction, setLastAction] = useState("Two sample objects are loaded. Select one and call deposit() or withdraw() to compare instance state.");
  const [history, setHistory] = useState<string[]>([
    "Sample objects loaded for Ava and Noah. Try changing just one account.",
  ]);

  useEffect(() => {
    function syncTheme() {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      setThemeMode(theme);
    }

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const selectedAccount = instances.find((instance) => instance.id === selectedId) ?? null;
  const runtimeColors = INSTANCE_COLORS[themeMode];

  const missionState = useMemo(() => {
    const createdTwo = instances.length >= 2;
    const balances = instances.map((instance) => instance.balance);
    const distinctBalances = new Set(balances).size >= 2;
    const operated = history.some((entry) => entry.includes("deposit") || entry.includes("withdraw"));

    return [
      { label: "Instantiate at least two BankAccount objects", done: createdTwo },
      { label: "Change one object with deposit()/withdraw()", done: operated },
      { label: "Observe that objects keep separate balances", done: createdTwo && distinctBalances },
    ];
  }, [history, instances]);

  function appendHistory(message: string) {
    setHistory((prev) => [message, ...prev].slice(0, 5));
    setLastAction(message);
  }

  function createInstance(seed?: { owner: string; balance: number }) {
    const nextOwner = seed?.owner ?? owner.trim();
    const nextBalance = seed?.balance ?? Number(balance);

    if (!nextOwner || Number.isNaN(nextBalance) || instances.length >= 3) {
      return;
    }

    const id = nextId++;
    const newAccount: AccountInstance = {
      id,
      owner: nextOwner,
      balance: nextBalance,
    };

    setInstances((prev) => [...prev, newAccount]);
    setSelectedId(id);
    if (!seed) {
      setOwner("");
      setBalance("200");
    }
    appendHistory(`new BankAccount("${nextOwner}", ${nextBalance}) created object #${id}.`);
  }

  function runOperation(type: OperationType) {
    const parsedAmount = Number(amount);
    if (!selectedAccount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (type === "withdraw" && parsedAmount > selectedAccount.balance) {
      appendHistory(
        `withdraw(${parsedAmount}) on ${selectedAccount.owner} failed: insufficient funds.`
      );
      return;
    }

    setInstances((prev) =>
      prev.map((instance) => {
        if (instance.id !== selectedAccount.id) return instance;

        return {
          ...instance,
          balance:
            type === "deposit"
              ? instance.balance + parsedAmount
              : instance.balance - parsedAmount,
        };
      })
    );

    appendHistory(
      `${selectedAccount.owner}.${type}(${parsedAmount}) updated only object #${selectedAccount.id}.`
    );
  }

  function loadScenario() {
    const scenarioInstances = STARTER_SCENARIOS.slice(0, 2).map((scenario) => ({
      id: nextId++,
      owner: scenario.owner,
      balance: scenario.balance,
    }));

    setInstances(scenarioInstances);
    setHistory([
      `Loaded sample objects for ${scenarioInstances.map((instance) => instance.owner).join(" and ")}.`,
    ]);
    setLastAction("Loaded a sample class diagram. Create or edit the instances next.");
    setSelectedId(scenarioInstances[0]?.id ?? null);
  }

  function resetAll() {
    setInstances([]);
    setSelectedId(null);
    setHistory([]);
    setLastAction("Simulation cleared.");
    setOwner("");
    setBalance("200");
    setAmount("50");
  }

  return (
    <VisualizationCard
      title="Object State Lab"
      subtitle="Instantiate accounts, mutate one object, and watch encapsulated state stay isolated from the others."
      objective="Students should connect class blueprints to runtime objects, then verify that each instance owns its own private field values."
      insights={
        <div className="grid gap-3 md:grid-cols-3">
          {missionState.map((mission) => (
            <div
              key={mission.label}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                mission.done
                  ? "border-emerald-700 bg-emerald-950/40 text-emerald-200"
                  : "border-slate-700 bg-slate-950/70 text-slate-400"
              }`}
            >
              <p className="font-medium">{mission.done ? "Complete" : "Activity"}</p>
              <p className="mt-1 leading-5">{mission.label}</p>
            </div>
          ))}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Blueprint
          </p>
          <div className="mt-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-4">
            <p className="mb-3 font-mono text-sm text-cyan-300">BankAccount.java</p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2">
                <span className="text-slate-400">private owner</span>
                <span className="text-rose-300">String</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2">
                <span className="text-slate-400">private balance</span>
                <span className="text-rose-300">double</span>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs text-slate-400">
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono">
                + deposit(amount)
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono">
                + withdraw(amount)
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono">
                + getBalance()
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Owner</span>
              <input
                type="text"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && createInstance()}
                placeholder="e.g. Alice"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Initial Balance</span>
              <input
                type="number"
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && createInstance()}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => createInstance()}
              disabled={!owner.trim() || Number.isNaN(Number(balance)) || instances.length >= 3}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              new BankAccount()
            </button>
            <button
              onClick={loadScenario}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500"
            >
              Load Sample Objects
            </button>
            <button
              onClick={resetAll}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Runtime Objects
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Select an object, then mutate it to verify instance-level state.
                </p>
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                {instances.length}/3 objects
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {instances.map((instance, index) => {
                const colors = runtimeColors[index % runtimeColors.length];
                const isSelected = instance.id === selectedId;

                return (
                  <button
                    key={instance.id}
                    onClick={() => setSelectedId(instance.id)}
                    className={`rounded-[22px] border p-4 text-left transition-transform hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                        : "border-slate-700"
                    }`}
                    style={{ backgroundColor: colors.bg }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: colors.text }}>
                        object #{instance.id}
                      </p>
                      <span
                        className="rounded-full px-2 py-1 text-[10px]"
                        style={{ backgroundColor: colors.chipBg, color: colors.labelText }}
                      >
                        BankAccount
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 font-mono text-sm">
                      <div
                        className="rounded-xl px-3 py-2"
                        style={{ backgroundColor: colors.panelBg }}
                      >
                        <p
                          className="text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: colors.labelText }}
                        >
                          owner
                        </p>
                        <p className="mt-1" style={{ color: colors.valueText }}>
                          &quot;{instance.owner}&quot;
                        </p>
                      </div>
                      <div
                        className="rounded-xl px-3 py-2"
                        style={{ backgroundColor: colors.panelBg }}
                      >
                        <p
                          className="text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: colors.labelText }}
                        >
                          balance
                        </p>
                        <p className="mt-1" style={{ color: colors.valueText }}>
                          {instance.balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {instances.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-900/70 p-6 text-sm text-slate-500">
                  Start here: use the sample objects or instantiate a new `BankAccount` from the blueprint.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Method Calls
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500">Selected Object</span>
                  <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100">
                    {selectedAccount ? `${selectedAccount.owner} (#${selectedAccount.id})` : "Choose an object"}
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500">Amount</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-cyan-400"
                  />
                </label>
                <button
                  onClick={() => runOperation("deposit")}
                  disabled={!selectedAccount}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  deposit()
                </button>
                <button
                  onClick={() => runOperation("withdraw")}
                  disabled={!selectedAccount}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  withdraw()
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Last Observation
                </p>
                <p className="mt-2 text-sm text-slate-300">{lastAction}</p>
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
                    Actions you take in the lab will be narrated here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationCard>
  );
}
