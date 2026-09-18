import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type {
  Assignment,
  ContentBlock,
  LearningItem,
  QuizQuestion,
} from "@/app/lib/pilot/types";
import { uuid } from "@/app/lib/pilot/validation";
import { ContentViewer } from "@/app/components/pilot/ContentViewer";
import { TrainingProgress } from "@/app/components/pilot/TrainingProgress";
import { displayDate } from "@/app/components/pilot/Records";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { client, employee } = await requirePilotPage();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const itemResult = await client
    .from("learning_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  checkDatabaseError(itemResult.error);
  if (!itemResult.data) notFound();
  const item = itemResult.data as LearningItem;
  const [blocks, questions, assignment, attempts] = await Promise.all([
    client
      .from("content_blocks")
      .select("*")
      .eq("item_id", id)
      .order("sort_order"),
    client
      .from("quiz_questions")
      .select("*")
      .eq("item_id", id)
      .order("sort_order"),
    client
      .from("assignments")
      .select("*")
      .eq("module_id", id)
      .eq("employee_id", employee.id)
      .maybeSingle(),
    client
      .from("quiz_attempts")
      .select("*, assignments!inner(module_id)")
      .eq("employee_id", employee.id)
      .eq("assignments.module_id", id)
      .order("attempted_at", { ascending: false }),
  ]);
  [blocks, questions, assignment, attempts].forEach((result) =>
    checkDatabaseError(result.error),
  );
  return (
    <article className="pilot-reader">
      <Link href={item.kind === "SOP" ? "/pilot/library" : "/pilot/training"}>
        ← {item.kind === "SOP" ? "SOP library" : "My training"}
      </Link>
      <p className="eyebrow">
        {item.category} · {item.kind === "SOP" ? "Reference" : "Training"}
      </p>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
      {item.status !== "PUBLISHED" && (
        <p className="pilot-notice">
          Management preview · {item.status.toLowerCase()}
        </p>
      )}
      {item.restricted && (
        <p className="pilot-watermark">
          Confidential · {employee.first_name} {employee.last_name} ·{" "}
          {displayDate(new Date().toISOString())}
        </p>
      )}
      <ContentViewer blocks={blocks.data as ContentBlock[]} />
      {assignment.data && item.status === "PUBLISHED" && (
        <TrainingProgress
          assignment={assignment.data as Assignment}
          questions={questions.data as QuizQuestion[]}
          passMark={item.pass_mark}
        />
      )}
      {attempts.data && attempts.data.length > 0 && (
        <section className="pilot-panel">
          <h2>Your quiz attempts</h2>
          <ul>
            {attempts.data.map((attempt) => (
              <li key={attempt.id}>
                {attempt.score}% · {attempt.passed ? "Pass" : "Fail"} ·{" "}
                {displayDate(attempt.attempted_at)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
