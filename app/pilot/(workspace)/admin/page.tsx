import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type { Assignment, Employee, JobRole } from "@/app/lib/pilot/types";
import { displayDate } from "@/app/components/pilot/Records";

export default async function AdminPage() {
  const { client } = await requirePilotPage(["ADMIN", "MANAGER"]);
  const [employees, modules, assignments, roles] = await Promise.all([
    client.from("employees").select("*").order("first_name"),
    client
      .from("learning_items")
      .select("id")
      .eq("kind", "TRAINING")
      .eq("status", "PUBLISHED"),
    client.from("assignments").select("*"),
    client.from("job_roles").select("*"),
  ]);
  [employees, modules, assignments, roles].forEach((result) =>
    checkDatabaseError(result.error),
  );
  const records = assignments.data as Assignment[];
  const completed = records.filter(
    (record) => record.status === "COMPLETED",
  ).length;
  const stats = [
    ["Active employees", employees.data?.filter((e) => e.active).length],
    ["Published modules", modules.data?.length],
    ["Assignments", records.length],
    ["Completed", completed],
    ["Incomplete", records.length - completed],
  ];
  return (
    <>
      <p className="eyebrow">Management</p>
      <h1>Training overview</h1>
      <div className="pilot-stats">
        {stats.map(([label, value]) => (
          <div className="pilot-panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="pilot-panel">
        <h2>Employee progress</h2>
        {employees.data?.length === 0 ? (
          <p>Add your first employee to get started.</p>
        ) : (
          <div className="pilot-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Assigned</th>
                  <th>Completed</th>
                  <th>In progress</th>
                  <th>Last completion</th>
                </tr>
              </thead>
              <tbody>
                {(employees.data as Employee[]).map((employee) => {
                  const own = records.filter(
                    (record) => record.employee_id === employee.id,
                  );
                  const last =
                    own
                      .map((record) => record.completed_at)
                      .filter((date): date is string => Boolean(date))
                      .sort()
                      .at(-1) ?? null;
                  return (
                    <tr key={employee.id}>
                      <td>
                        <Link href={`/pilot/admin/employees/${employee.id}`}>
                          {employee.first_name || employee.email}{" "}
                          {employee.last_name}
                        </Link>
                        {!employee.active && <small> · Inactive</small>}
                      </td>
                      <td>
                        {(roles.data as JobRole[]).find(
                          (role) => role.id === employee.job_role_id,
                        )?.name ?? employee.app_role}
                      </td>
                      <td>{own.length}</td>
                      <td>
                        {
                          own.filter((record) => record.status === "COMPLETED")
                            .length
                        }
                      </td>
                      <td>
                        {
                          own.filter(
                            (record) => record.status === "IN_PROGRESS",
                          ).length
                        }
                      </td>
                      <td>{displayDate(last)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
