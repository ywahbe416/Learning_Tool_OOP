"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type { Challenge } from "@/types/challenge";
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
  const [compileError, setCompileError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = useCallback(async () => {
    setRunning(true);
    setCompileError(null);
    setResults(null);

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

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-slate-200 font-semibold text-lg">{challenge.title}</h3>
        <p className="text-slate-400 text-sm mt-1">{challenge.description}</p>
      </div>

      <div className="h-[420px]">
        <Editor
          height="420px"
          defaultLanguage="java"
          theme="vs-dark"
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

      {compileError && (
        <div className="mx-6 mb-4 p-4 bg-rose-950 border border-rose-700 rounded-lg">
          <p className="text-rose-300 text-xs font-semibold mb-1">Compile Error</p>
          <pre className="text-rose-200 text-xs font-mono whitespace-pre-wrap">{compileError}</pre>
        </div>
      )}

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
