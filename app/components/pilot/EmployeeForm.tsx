"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee, JobRole } from "@/app/lib/pilot/types";
import { pilotRequest, messageFrom } from "./client";

export function EmployeeForm({
  employee,
  roles,
}: {
  employee?: Employee;
  roles: JobRole[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="pilot-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage("");
        const form = new FormData(event.currentTarget);
        const data = {
          first_name: form.get("first_name"),
          last_name: form.get("last_name"),
          email: form.get("email"),
          app_role: form.get("app_role"),
          job_role_id: form.get("job_role_id") || null,
          active: form.get("active") === "on",
          station: form.get("station") || null,
        };
        try {
          const result = await pilotRequest({
            action: employee ? "employee-update" : "employee-create",
            id: employee?.id,
            employee: data,
            password: form.get("password"),
          });
          if (!employee) router.push(`/pilot/admin/employees/${result.id}`);
          else {
            setMessage("Employee saved.");
            router.refresh();
          }
        } catch (error) {
          setMessage(messageFrom(error));
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="pilot-form-grid">
        <label>
          First name
          <input
            name="first_name"
            defaultValue={employee?.first_name}
            maxLength={100}
            required
          />
        </label>
        <label>
          Last name
          <input
            name="last_name"
            defaultValue={employee?.last_name}
            maxLength={100}
            required
          />
        </label>
      </div>
      <label>
        Email
        <input
          type="email"
          name="email"
          defaultValue={employee?.email}
          required
        />
      </label>
      <div className="pilot-form-grid">
        <label>
          Application access
          <select
            name="app_role"
            aria-label="Application access"
            defaultValue={employee?.app_role ?? "EMPLOYEE"}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin / Head Chef</option>
          </select>
        </label>
        <label>
          Kitchen role
          <select
            name="job_role_id"
            aria-label="Kitchen role"
            defaultValue={employee?.job_role_id ?? ""}
          >
            <option value="">No kitchen role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Station (optional)
        <input
          name="station"
          defaultValue={employee?.station ?? ""}
          maxLength={100}
        />
      </label>
      <label className="pilot-choice">
        <input
          type="checkbox"
          name="active"
          defaultChecked={employee?.active ?? true}
        />
        Active account
      </label>
      {!employee && (
        <>
          <label>
            Initial password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
          <p>
            Share this password with the employee securely. Ask them to change
            it after signing in.
          </p>
        </>
      )}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : employee ? "Save employee" : "Create employee"}
      </button>
      {message && (
        <p className="pilot-notice" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
