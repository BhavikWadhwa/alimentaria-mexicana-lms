"use client";
import type { EditorQuestion } from "@/app/lib/pilot/types";
export function QuizBuilder({
  questions,
  onChange,
  disabled,
}: {
  questions: EditorQuestion[];
  onChange: (questions: EditorQuestion[]) => void;
  disabled: boolean;
}) {
  const update = (index: number, patch: Partial<EditorQuestion>) =>
    onChange(
      questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    );
  return (
    <section>
      <h2>Optional quiz</h2>
      <p>Choose one correct answer per question.</p>
      {questions.map((question, index) => (
        <fieldset
          key={index}
          disabled={disabled}
          className="pilot-block-editor"
        >
          <legend>Question {index + 1}</legend>
          <label>
            Question
            <textarea
              required
              value={question.prompt}
              maxLength={2000}
              onChange={(event) =>
                update(index, { prompt: event.target.value })
              }
            />
          </label>
          {question.options.map((option, optionIndex) => (
            <label className="pilot-choice" key={optionIndex}>
              <input
                type="radio"
                name={`correct-${index}`}
                checked={question.correct_index === optionIndex}
                onChange={() => update(index, { correct_index: optionIndex })}
                aria-label={`Question ${index + 1} correct answer ${optionIndex + 1}`}
              />
              <input
                aria-label={`Question ${index + 1} option ${optionIndex + 1}`}
                value={option}
                required
                maxLength={1000}
                onChange={(event) =>
                  update(index, {
                    options: question.options.map((text, i) =>
                      i === optionIndex ? event.target.value : text,
                    ),
                  })
                }
              />
            </label>
          ))}
          <div className="pilot-toolbar">
            <button
              type="button"
              disabled={question.options.length >= 6}
              onClick={() =>
                update(index, { options: [...question.options, ""] })
              }
            >
              Add option
            </button>
            <button
              type="button"
              disabled={question.options.length <= 2}
              onClick={() =>
                update(index, {
                  options: question.options.slice(0, -1),
                  correct_index: Math.min(
                    question.correct_index,
                    question.options.length - 2,
                  ),
                })
              }
            >
              Remove last option
            </button>
            <button
              type="button"
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
            >
              Remove question
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="btn"
        disabled={disabled || questions.length >= 50}
        onClick={() =>
          onChange([
            ...questions,
            { prompt: "", options: ["", ""], correct_index: 0 },
          ])
        }
      >
        + Add question
      </button>
    </section>
  );
}
