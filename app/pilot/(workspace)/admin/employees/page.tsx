import Link from "next/link";
import { requirePilotPage, checkDatabaseError } from "@/app/lib/pilot/auth";
import type { Employee, JobRole } from "@/app/lib/pilot/types";
import { EmployeeForm } from "@/app/components/pilot/EmployeeForm";
import { Status } from "@/app/components/pilot/Records";

export default async function EmployeesPage() {
  const { client, employee } = await requirePilotPage(["ADMIN", "MANAGER"]);
  const [employees, roles] = await Promise.all([
    client.from("employees").select("*").order("first_name"),
    client.from("job_roles").select("*").order("name"),
  ]);
  [employees, roles].forEach((result) => checkDatabaseError(result.error));
  return (
    <>
      <p className="eyebrow">Your team</p>
      <h1>Employees</h1>
      <section className="pilot-panel">
        <div className="pilot-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Access</th>
                <th>Kitchen role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(employees.data as Employee[]).map((record) => (
                <tr key={record.id}>
                  <td>
                    <Link href={`/pilot/admin/employees/${record.id}`}>
                      {record.first_name || "Account setup pending"}{" "}
                      {record.last_name}
                    </Link>
                  </td>
                  <td>{record.email}</td>
                  <td>{record.app_role.toLowerCase()}</td>
                  <td>
                    {(roles.data as JobRole[]).find(
                      (role) => role.id === record.job_role_id,
                    )?.name ?? "—"}
                  </td>
                  <td>
                    <Status value={record.active ? "Active" : "Inactive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {employee.app_role === "ADMIN" && (
        <section className="pilot-panel">
          <h2>Create employee</h2>
          <EmployeeForm roles={roles.data as JobRole[]} />
        </section>
      )}
    </>
  );
}
