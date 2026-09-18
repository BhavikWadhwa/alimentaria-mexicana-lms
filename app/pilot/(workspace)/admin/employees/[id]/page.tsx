import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type {
  Assignment,
  Employee,
  JobRole,
  LearningItem,
  QuizAttempt,
} from "@/app/lib/pilot/types";
import { uuid } from "@/app/lib/pilot/validation";
import { EmployeeForm } from "@/app/components/pilot/EmployeeForm";
import { AssignmentForm } from "@/app/components/pilot/AssignmentForm";
import { HistoryTable, displayDate } from "@/app/components/pilot/Records";

export default async function EmployeeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { client, employee: actor } = await requirePilotPage([
    "ADMIN",
    "MANAGER",
  ]);
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const [employeeResult, roles, assignments, attempts, modules, access] =
    await Promise.all([
      client.from("employees").select("*").eq("id", id).maybeSingle(),
      client.from("job_roles").select("*").order("name"),
      client
        .from("assignments")
        .select("*")
        .eq("employee_id", id)
        .order("assigned_at", { ascending: false }),
      client
        .from("quiz_attempts")
        .select("*")
        .eq("employee_id", id)
        .order("attempted_at", { ascending: false }),
      client
        .from("learning_items")
        .select("*")
        .eq("kind", "TRAINING")
        .eq("status", "PUBLISHED")
        .order("title"),
      client.from("item_role_access").select("*"),
    ]);
  [employeeResult, roles, assignments, attempts, modules, access].forEach(
    (result) => checkDatabaseError(result.error),
  );
  if (!employeeResult.data) notFound();
  const employee = employeeResult.data as Employee;
  const eligible = (modules.data as LearningItem[]).filter(
    (module) =>
      !assignments.data?.some((a) => a.module_id === module.id) &&
      (employee.app_role === "ADMIN" ||
        !module.restricted ||
        access.data?.some(
          (rule) =>
            rule.item_id === module.id && rule.role_id === employee.job_role_id,
        )),
  );
  return (
    <>
      <Link href="/pilot/admin/employees">← Employees</Link>
      <h1>
        {employee.first_name || employee.email} {employee.last_name}
      </h1>
      <p>
        {employee.email} · {employee.active ? "Active" : "Inactive"}
      </p>
      <section className="pilot-panel">
        <h2>Training history</h2>
        <HistoryTable
          assignments={assignments.data as Assignment[]}
          attempts={attempts.data as QuizAttempt[]}
        />
      </section>
      {attempts.data && attempts.data.length > 0 && (
        <details className="pilot-panel">
          <summary>All quiz attempts ({attempts.data.length})</summary>
          <ul>
            {attempts.data.map((attempt) => (
              <li key={attempt.id}>
                {
                  assignments.data?.find((a) => a.id === attempt.assignment_id)
                    ?.module_title
                }
                : {attempt.score}% · {attempt.passed ? "Pass" : "Fail"} ·{" "}
                {displayDate(attempt.attempted_at)}
              </li>
            ))}
          </ul>
        </details>
      )}
      {employee.active && (
        <section className="pilot-panel">
          <h2>Assign training</h2>
          <AssignmentForm employeeId={id} modules={eligible} />
        </section>
      )}
      {actor.app_role === "ADMIN" && (
        <section className="pilot-panel">
          <h2>Employee account</h2>
          <p>Deactivating access keeps all training history.</p>
          <EmployeeForm employee={employee} roles={roles.data as JobRole[]} />
        </section>
      )}
    </>
  );
}
