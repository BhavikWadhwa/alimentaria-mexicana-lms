import Link from "next/link";
import type {
  Assignment,
  LearningItem,
  QuizAttempt,
} from "@/app/lib/pilot/types";

export function displayDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeZone: "America/Vancouver",
      }).format(new Date(value))
    : "—";
}
export function Status({ value }: { value: string }) {
  return (
    <span className={`pilot-status ${value.toLowerCase()}`}>
      {value.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
export function ItemCard({
  item,
  status,
}: {
  item: LearningItem;
  status?: string;
}) {
  return (
    <Link href={`/pilot/items/${item.id}`} className="pilot-card">
      <div className="row between">
        <span className="eyebrow">{item.category}</span>
        {item.restricted && <span className="pilot-status">Restricted</span>}
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="row between">
        {status && <Status value={status} />}
        <span>
          {item.duration_minutes
            ? `${item.duration_minutes} min`
            : item.kind === "SOP"
              ? "Reference"
              : "Training"}
        </span>
      </div>
    </Link>
  );
}
export function HistoryTable({
  assignments,
  attempts,
}: {
  assignments: Assignment[];
  attempts: QuizAttempt[];
}) {
  return assignments.length === 0 ? (
    <p>No training has been assigned yet.</p>
  ) : (
    <div className="pilot-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Training</th>
            <th>Status</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Latest quiz</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const latest = attempts
              .filter((attempt) => attempt.assignment_id === assignment.id)
              .sort((a, b) => b.attempted_at.localeCompare(a.attempted_at))[0];
            return (
              <tr key={assignment.id}>
                <td>{assignment.module_title}</td>
                <td>
                  <Status value={assignment.status} />
                </td>
                <td>{displayDate(assignment.started_at)}</td>
                <td>{displayDate(assignment.completed_at)}</td>
                <td>
                  {latest
                    ? `${latest.score}% · ${latest.passed ? "Pass" : "Fail"} · ${displayDate(latest.attempted_at)}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
