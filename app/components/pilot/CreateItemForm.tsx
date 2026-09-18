"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pilotRequest, messageFrom } from "./client";

export function CreateItemForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="pilot-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const result = await pilotRequest({
            action: "item-create",
            title: form.get("title"),
            kind: form.get("kind"),
          });
          router.push(`/pilot/admin/content/${result.id}`);
        } catch (problem) {
          setError(messageFrom(problem));
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="pilot-form-grid">
        <label>
          Title
          <input name="title" required maxLength={160} />
        </label>
        <label>
          Type
          <select name="kind">
            <option value="TRAINING">Training module</option>
            <option value="SOP">SOP / reference</option>
          </select>
        </label>
      </div>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Creating…" : "Create draft"}
      </button>
      {error && (
        <p role="alert" className="pilot-notice">
          {error}
        </p>
      )}
    </form>
  );
}
