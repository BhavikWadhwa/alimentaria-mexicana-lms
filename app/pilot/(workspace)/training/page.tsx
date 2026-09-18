import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type {
  Assignment,
  LearningItem,
  QuizAttempt,
} from "@/app/lib/pilot/types";
import { ItemCard, HistoryTable } from "@/app/components/pilot/Records";

export default async function TrainingPage() {
  const { client, employee } = await requirePilotPage();
  const [items, assignments, attempts] = await Promise.all([
    client
      .from("learning_items")
      .select("*")
      .eq("kind", "TRAINING")
      .eq("status", "PUBLISHED"),
    client
      .from("assignments")
      .select("*")
      .eq("employee_id", employee.id)
      .order("assigned_at", { ascending: false }),
    client.from("quiz_attempts").select("*").eq("employee_id", employee.id),
  ]);
  [items, assignments, attempts].forEach((result) =>
    checkDatabaseError(result.error),
  );
  const records = assignments.data as Assignment[];
  return (
    <>
      <p className="eyebrow">Your learning</p>
      <h1>My training</h1>
      <p>Work through your assigned modules at your own pace.</p>
      {(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const).map((status) => {
        const visible = records
          .filter((record) => record.status === status)
          .flatMap((record) => {
            const item = (items.data as LearningItem[]).find(
              (item) => item.id === record.module_id,
            );
            return item ? [{ item, record }] : [];
          });
        return (
          <section className="pilot-section" key={status}>
            <h2>
              {status.replaceAll("_", " ").toLowerCase()}{" "}
              <small>({visible.length})</small>
            </h2>
            <div className="pilot-grid">
              {visible.map(({ item, record }) => (
                <ItemCard key={item.id} item={item} status={record.status} />
              ))}
            </div>
            {visible.length === 0 && (
              <p className="pilot-empty">No modules in this section.</p>
            )}
          </section>
        );
      })}
      <section className="pilot-panel">
        <h2>Training history</h2>
        <HistoryTable
          assignments={records}
          attempts={attempts.data as QuizAttempt[]}
        />
      </section>
    </>
  );
}
