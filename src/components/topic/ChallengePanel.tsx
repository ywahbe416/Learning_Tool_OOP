"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import type { Challenge } from "@/types/challenge";
import { markChallengeComplete } from "@/lib/progress";
import type { TopicLearningSupport } from "@/lib/lesson-support";

interface TestResult {
  description: string;
  pass: boolean;
  error?: string;
}

interface Props {
  challenge: Challenge;
  topicSlug: string;
  learningSupport: TopicLearningSupport | null;
}

export default function ChallengePanel({
  challenge,
  topicSlug,
  learningSupport,
}: Props) {
  const [code, setCode] = useState(challenge.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "vs">("vs-dark");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [hintDepth, setHintDepth] = useState(0);

  useEffect(() => {
    function syncTheme() {
      const isLight = document.documentElement.dataset.theme === "light";
      setThemeMode(isLight ? "light" : "dark");
      setEditorTheme(isLight ? "vs" : "vs-dark");
    }

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const runTests = useCallback(async () => {
    setRunning(true);
    setCompileError(null);
    setResults(null);
    setHintDepth(0);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode: code,
          wrapperCodes: challenge.testCases.map((tc) => tc.wrapperCode),
          descriptions: challenge.testCases.map((tc) => tc.description),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setCompileError(data.error);
        return;
      }

      if (data.compileError) {
        setCompileError(data.compileError);
        return;
      }

      const out: TestResult[] = data.results;
      setResults(out);
      if (out.every((r) => r.pass)) {
        markChallengeComplete(topicSlug);
      }
    } catch {
      setCompileError("Network error — could not reach the code runner.");
    } finally {
      setRunning(false);
    }
  }, [code, challenge, topicSlug]);

  const allPassed = results !== null && results.every((r) => r.pass);
  const passCount = results ? results.filter((r) => r.pass).length : 0;
  const firstFailure = results?.find((result) => !result.pass) ?? null;

  const activeHintTrack = useMemo(() => {
    if (!learningSupport || !firstFailure) {
      return null;
    }

    const failureText = `${firstFailure.description} ${firstFailure.error ?? ""}`.toLowerCase();

    return (
      learningSupport.challengeHints.find((hint) =>
        hint.matchText.some((pattern) => failureText.includes(pattern.toLowerCase()))
      ) ?? learningSupport.challengeHints[0] ?? null
    );
  }, [firstFailure, learningSupport]);

  useEffect(() => {
    setHintDepth(0);
  }, [compileError, firstFailure?.description]);

  const coachLevels = compileError
    ? learningSupport?.compileHints ?? null
    : activeHintTrack?.levels ?? null;
  const coachTitle = compileError
    ? "Compile Before Logic"
    : activeHintTrack?.title ?? null;
  const isLightTheme = themeMode === "light";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/90 shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-emerald-300/15 via-cyan-300/10 to-transparent" />

      <div className="relative border-b border-slate-800 px-6 py-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
          Coding Lab
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-slate-50">{challenge.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{challenge.description}</p>
          </div>
          <div className="max-w-sm rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Goal
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Write the missing Java logic, run the tests, and use failures as feedback until the behavior matches the concept lab.
            </p>
          </div>
        </div>
      </div>

      <div className="relative px-6 pt-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Test Cases
            </p>
            <p className="mt-2 text-sm text-slate-300">{challenge.testCases.length} checks ready</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current Status
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {results ? `${passCount}/${results.length} passed` : "Not run yet"}
            </p>
          </div>
          <div
            className={`rounded-2xl border px-4 py-3 ${
              allPassed
                ? "border-emerald-700 bg-emerald-950/40"
                : "border-slate-700 bg-slate-950/70"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Completion
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {allPassed ? "Challenge complete" : "Work through failing cases"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="overflow-hidden rounded-[22px] border border-slate-800">
          <div className="h-[420px]">
            <Editor
              height="420px"
              defaultLanguage="java"
              theme={editorTheme}
              value={code}
              onChange={(val) => setCode(val ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 4,
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-slate-800 bg-slate-950/80 px-4 py-3">
          <button
            onClick={runTests}
            disabled={running}
            className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Running..." : "Run Tests"}
          </button>
          {results && (
            <span className={`text-sm font-medium ${allPassed ? "text-emerald-300" : "text-amber-300"}`}>
              {passCount}/{results.length} passed
            </span>
          )}
          {allPassed && (
            <span className="text-sm font-bold text-emerald-300">All tests passed</span>
          )}
        </div>
      </div>

      {compileError && (
        <div className="mx-6 mb-4 rounded-[20px] border border-rose-700 bg-rose-950/40 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
            Compile Error
          </p>
          <pre className="whitespace-pre-wrap font-mono text-xs text-rose-200">{compileError}</pre>
        </div>
      )}

      {(compileError || (firstFailure && coachLevels && coachTitle)) && coachLevels && coachTitle && (
        <div
          className="mx-6 mb-4 rounded-[20px] border p-4"
          style={{
            borderColor: isLightTheme ? "rgba(180, 83, 9, 0.28)" : undefined,
            backgroundColor: isLightTheme ? "rgba(255, 247, 237, 0.94)" : undefined,
          }}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300"
                style={isLightTheme ? { color: "#9a3412" } : undefined}
              >
                Failure Coach
              </p>
              <p
                className="mt-2 text-sm font-medium text-amber-100"
                style={isLightTheme ? { color: "#7c2d12" } : undefined}
              >
                {coachTitle}
              </p>
              <p
                className="mt-1 text-sm text-amber-200/80"
                style={isLightTheme ? { color: "#b45309" } : undefined}
              >
                {compileError
                  ? "Fix the file so it compiles cleanly, then rerun the tests."
                  : `Start with the first failing check: ${firstFailure?.description}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {coachLevels.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHintDepth((value) => Math.max(value, index + 1))}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    hintDepth >= index + 1
                      ? "border-amber-500 bg-amber-400 text-slate-950"
                      : "border-amber-500/40 bg-transparent text-amber-200 hover:border-amber-400"
                  }`}
                  style={
                    isLightTheme
                      ? hintDepth >= index + 1
                        ? {
                            borderColor: "rgba(180, 83, 9, 0.42)",
                            backgroundColor: "#fbbf24",
                            color: "#111827",
                          }
                        : {
                            borderColor: "rgba(180, 83, 9, 0.28)",
                            backgroundColor: "rgba(255, 251, 235, 0.94)",
                            color: "#92400e",
                          }
                      : undefined
                  }
                >
                  Hint {index + 1}
                </button>
              ))}
            </div>
          </div>

          {hintDepth > 0 && (
            <div className="mt-4 space-y-2">
              {coachLevels.slice(0, hintDepth).map((hint, index) => (
                <div
                  key={hint}
                  className="rounded-2xl border border-amber-700/40 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-slate-200"
                  style={
                    isLightTheme
                      ? {
                          borderColor: "rgba(180, 83, 9, 0.22)",
                          backgroundColor: "rgba(255, 255, 255, 0.82)",
                          color: "#1f2937",
                        }
                      : undefined
                  }
                >
                  <span
                    className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300"
                    style={isLightTheme ? { color: "#b45309" } : undefined}
                  >
                    Hint {index + 1}
                  </span>
                  {hint}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results && (
        <div className="px-6 pb-6 space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-[18px] border p-3 text-sm ${
                r.pass ? "border-emerald-800 bg-emerald-950/30" : "border-rose-800 bg-rose-950/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 font-bold text-slate-100">{r.pass ? "✓" : "✗"}</span>
                <div>
                  <p className={r.pass ? "text-emerald-300" : "text-rose-300"}>{r.description}</p>
                  {r.error && <p className="mt-1 font-mono text-xs text-slate-400">{r.error}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {allPassed && learningSupport && (
        <div className="mx-6 mb-6 rounded-[20px] border border-cyan-700 bg-cyan-950/25 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Reflection Prompt
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {learningSupport.reflectionPrompt}
          </p>
        </div>
      )}
    </section>
  );
}
