"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Assignment, QuizQuestion } from "@/app/lib/pilot/types";
import { pilotRequest, messageFrom } from "./client";
import { ActionButton } from "./ActionButton";

export function TrainingProgress({
  assignment,
  questions,
  passMark,
}: {
  assignment: Assignment;
  questions: QuizQuestion[];
  passMark: number;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  useEffect(() => {
    if (assignment.status !== "NOT_STARTED" || started.current) return;
    started.current = true;
    pilotRequest({ action: "advance", id: assignment.id, acknowledge: false })
      .then(() => router.refresh())
      .catch((problem) => {
        setError(messageFrom(problem));
        started.current = false;
      });
  }, [assignment.id, assignment.status, router]);
  if (assignment.status === "COMPLETED")
    return (
      <section className="pilot-callout">
        <h2>Training complete</h2>
        <p>
          Your completion has been recorded. You can revisit the content any
          time it is available.
        </p>
      </section>
    );
  return (
    <section className="pilot-panel">
      <h2>Finish this training</h2>
      {error && (
        <p className="pilot-notice" role="alert">
          {error}
        </p>
      )}
      {!assignment.content_completed_at ? (
        <>
          <p>
            After reviewing every section and document, confirm you have
            completed the content.
          </p>
          <ActionButton
            payload={{
              action: "advance",
              id: assignment.id,
              acknowledge: true,
            }}
          >
            I have completed the content
          </ActionButton>
        </>
      ) : questions.length > 0 ? (
        <form
          className="pilot-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError("");
            const form = new FormData(event.currentTarget);
            const answers = Object.fromEntries(
              questions.map((q) => [q.id, Number(form.get(q.id))]),
            );
            try {
              setResult(
                await pilotRequest({
                  action: "quiz",
                  id: assignment.id,
                  answers,
                }),
              );
              router.refresh();
            } catch (problem) {
              setError(messageFrom(problem));
            } finally {
              setPending(false);
            }
          }}
        >
          <p>Pass mark: {passMark}%. You may retry if you do not pass.</p>
          {questions.map((q, index) => (
            <fieldset key={q.id}>
              <legend>
                {index + 1}. {q.prompt}
              </legend>
              {q.options.map((option, optionIndex) => (
                <label className="pilot-choice" key={optionIndex}>
                  <input
                    type="radio"
                    name={q.id}
                    value={optionIndex}
                    required
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button disabled={pending} className="btn btn-primary">
            {pending ? "Submitting…" : "Submit quiz"}
          </button>
          {result && (
            <p role="status" className="pilot-callout">
              {result.score}% —{" "}
              {result.passed
                ? "Passed"
                : "Not passed. Review the content and try again."}
            </p>
          )}
        </form>
      ) : (
        <p>Content completion recorded.</p>
      )}
    </section>
  );
}
