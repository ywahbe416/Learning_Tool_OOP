"use client";

import { useEffect, useMemo, useState } from "react";
import { markTopicStepComplete } from "@/lib/progress";
import type { ConceptCheckQuestion } from "@/lib/lesson-support";

interface ConceptCheckPanelProps {
  slug: string;
  questions: ConceptCheckQuestion[];
}

export default function ConceptCheckPanel({
  slug,
  questions,
}: ConceptCheckPanelProps) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => questions.map(() => null)
  );
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);

  useEffect(() => {
    setAnswers(questions.map(() => null));
    setHasMarkedComplete(false);
  }, [questions]);

  const correctCount = useMemo(
    () =>
      questions.filter((question, index) => answers[index] === question.correctIndex)
        .length,
    [answers, questions]
  );

  useEffect(() => {
    if (
      !hasMarkedComplete &&
      questions.length > 0 &&
      correctCount === questions.length
    ) {
      markTopicStepComplete(slug, "concept");
      setHasMarkedComplete(true);
    }
  }, [correctCount, hasMarkedComplete, questions.length, slug]);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45 shadow-[0_18px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(93,215,232,0.16),transparent_58%)]" />
      <div className="relative border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Concept Check
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Answer the quick prediction questions before you move deeper into the challenge.
            </p>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-slate-300">
            {correctCount}/{questions.length} correct
          </div>
        </div>
      </div>

      <div className="relative space-y-4 px-6 py-6">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const answered = selected !== null;
          const isCorrect = selected === question.correctIndex;

          return (
            <div
              key={question.prompt}
              className={`overflow-hidden rounded-[22px] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
                answered
                  ? isCorrect
                    ? "border-emerald-700 bg-emerald-950/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),transparent_58%)]"
                    : "border-amber-700 bg-amber-950/20 bg-[linear-gradient(135deg,rgba(240,178,74,0.14),transparent_58%)]"
                  : "border-slate-800 bg-slate-900/75 bg-[linear-gradient(135deg,rgba(93,215,232,0.08),transparent_60%)]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Question {questionIndex + 1}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-100">
                    {question.prompt}
                  </p>
                </div>
                {answered && (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      isCorrect
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {isCorrect ? "Locked In" : "Recheck"}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const optionIsSelected = selected === optionIndex;
                  const optionIsCorrect = question.correctIndex === optionIndex;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) =>
                          prev.map((value, index) =>
                            index === questionIndex ? optionIndex : value
                          )
                        )
                      }
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 ${
                        answered
                          ? optionIsCorrect
                            ? "border-emerald-600 bg-emerald-950/40 text-emerald-100"
                            : optionIsSelected
                              ? "border-amber-600 bg-amber-950/35 text-amber-100"
                              : "border-slate-800 bg-slate-950/70 text-slate-400"
                          : optionIsSelected
                            ? "border-cyan-500 bg-cyan-950/30 text-cyan-100"
                            : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-cyan-400/40"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {isCorrect ? "Why this is right" : "Try to adjust your model"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
