"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LearningItem } from "@/app/lib/pilot/types";
import { pilotRequest, messageFrom } from "./client";

export function AssignmentForm({
  employeeId,
  modules,
}: {
  employeeId: string;
  modules: LearningItem[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="pilot-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage("");
        const form = new FormData(event.currentTarget);
        try {
          const result = await pilotRequest({
            action: "assign",
            employee_id: employeeId,
            module_id: form.get("module_id"),
          });
          setMessage(result.message ?? "Assigned.");
          router.refresh();
        } catch (error) {
          setMessage(messageFrom(error));
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Published training
        <select
          name="module_id"
          aria-label="Published training"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Select a module
          </option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </label>
      <button
        className="btn btn-primary"
        disabled={pending || modules.length === 0}
      >
        {pending ? "Assigning…" : "Assign training"}
      </button>
      {modules.length === 0 && (
        <p>No eligible unassigned modules are available for this employee.</p>
      )}
      {message && (
        <p role="status" className="pilot-notice">
          {message}
        </p>
      )}
    </form>
  );
}
