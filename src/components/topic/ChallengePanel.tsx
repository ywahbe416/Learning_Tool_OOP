"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type { Challenge, TestCase } from "@/types/challenge";
import { markChallengeComplete } from "@/lib/progress";

interface TestResult {
  description: string;
  pass: boolean;
  error?: string;
}

interface Props {
  challenge: Challenge;
  topicSlug: string;
}

export default function ChallengePanel({ challenge, topicSlug }: Props) {
  const [code, setCode] = useState(challenge.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = useCallback(() => {
    setRunning(true);
    const out: TestResult[] = challenge.testCases.map((tc: TestCase) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(code + "\n" + tc.runnerCode);
        const pass = fn() === true;
        return { description: tc.description, pass };
      } catch (e: unknown) {
        return {
          description: tc.description,
          pass: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });
    setResults(out);
    setRunning(false);
    if (out.every((r) => r.pass)) {
      markChallengeComplete(topicSlug);
    }
  }, [code, challenge, topicSlug]);

  const allPassed = results !== null && results.every((r) => r.pass);
  const passCount = results ? results.filter((r) => r.pass).length : 0;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-slate-200 font-semibold text-lg">{challenge.title}</h3>
        <p className="text-slate-400 text-sm mt-1">{challenge.description}</p>
      </div>

      <div className="h-[380px]">
        <Editor
          height="380px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
          }}
        />
      </div>

      <div className="px-6 py-4 border-t border-slate-700 flex items-center gap-4">
        <button
          onClick={runTests}
          disabled={running}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          {running ? "Running..." : "Run Tests"}
        </button>
        {results && (
          <span className={`text-sm font-medium ${allPassed ? "text-emerald-400" : "text-amber-400"}`}>
            {passCount}/{results.length} passed
          </span>
        )}
        {allPassed && (
          <span className="text-emerald-400 font-bold text-sm">All tests passed!</span>
        )}
      </div>

      {results && (
        <div className="px-6 pb-6 space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 text-sm p-3 rounded-lg ${
                r.pass ? "bg-emerald-950 border border-emerald-800" : "bg-rose-950 border border-rose-800"
              }`}
            >
              <span className="shrink-0 font-bold">{r.pass ? "✓" : "✗"}</span>
              <div>
                <p className={r.pass ? "text-emerald-300" : "text-rose-300"}>{r.description}</p>
                {r.error && (
                  <p className="text-slate-400 text-xs mt-1 font-mono">{r.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
