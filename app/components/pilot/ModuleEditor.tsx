"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ItemDraft, JobRole, LearningItem } from "@/app/lib/pilot/types";
import { draftSchema } from "@/app/lib/pilot/validation";
import { pilotRequest, messageFrom } from "./client";
import { BlockEditor } from "./BlockEditor";
import { QuizBuilder } from "./QuizBuilder";
import { Status } from "./Records";

export function ModuleEditor({
  item,
  initial,
  roles,
}: {
  item: LearningItem;
  initial: ItemDraft;
  roles: JobRole[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const update = (patch: Partial<ItemDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
  };
  const editable = item.status === "DRAFT";
  async function save(publish = false) {
    setPending(true);
    setMessage("");
    try {
      const valid = draftSchema.safeParse(draft);
      if (!valid.success)
        throw new Error(
          valid.error.issues[0]?.message ?? "Check the content fields.",
        );
      await pilotRequest({ action: "item-save", draft: valid.data });
      setDirty(false);
      if (publish)
        await pilotRequest({
          action: "item-status",
          id: item.id,
          status: "PUBLISHED",
        });
      setMessage(
        publish
          ? "Published. You can now assign this training or browse this SOP."
          : "Draft saved.",
      );
      router.refresh();
    } catch (error) {
      setMessage(messageFrom(error));
    } finally {
      setPending(false);
    }
  }
  async function changeStatus(status: string) {
    setPending(true);
    setMessage("");
    try {
      await pilotRequest({ action: "item-status", id: item.id, status });
      router.refresh();
    } catch (error) {
      setMessage(messageFrom(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="pilot-form"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="pilot-toolbar">
        <Status value={item.status} />
        {dirty && <span>Unsaved changes</span>}
        <a className="btn" href={`/pilot/items/${item.id}`}>
          View saved content
        </a>
      </div>
      {!editable && (
        <p className="pilot-notice">
          Move this item to draft to edit. It will be unavailable to employees
          until republished. Existing completion history is retained.
        </p>
      )}
      <fieldset disabled={!editable || pending}>
        <label>
          Title
          <input
            required
            maxLength={160}
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            value={draft.description}
            maxLength={4000}
            onChange={(event) => update({ description: event.target.value })}
          />
        </label>
        <div className="pilot-form-grid">
          <label>
            Category
            <input
              list="pilot-categories"
              required
              maxLength={80}
              value={draft.category}
              onChange={(event) => update({ category: event.target.value })}
            />
            <datalist id="pilot-categories">
              {[
                "General",
                "Cleaning",
                "Equipment",
                "Station Procedures",
                "Recipes",
                "Delivery",
                "Admin",
              ].map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label>
            Estimated duration (minutes)
            <input
              type="number"
              min={1}
              max={600}
              value={draft.duration_minutes ?? ""}
              onChange={(event) =>
                update({
                  duration_minutes: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </label>
        </div>
        <label className="pilot-choice">
          <input
            type="checkbox"
            checked={draft.restricted}
            onChange={(event) => update({ restricted: event.target.checked })}
          />
          Restrict to selected kitchen roles
        </label>
        {draft.restricted && (
          <fieldset>
            <legend>Allowed kitchen roles</legend>
            <p>Administrators retain access to manage content.</p>
            {roles.map((role) => (
              <label className="pilot-choice" key={role.id}>
                <input
                  type="checkbox"
                  checked={draft.role_ids.includes(role.id)}
                  onChange={(event) =>
                    update({
                      role_ids: event.target.checked
                        ? [...draft.role_ids, role.id]
                        : draft.role_ids.filter((id) => id !== role.id),
                    })
                  }
                />
                {role.name}
              </label>
            ))}
          </fieldset>
        )}
      </fieldset>
      <BlockEditor
        itemId={item.id}
        blocks={draft.blocks}
        onChange={(blocks) => update({ blocks })}
        disabled={!editable || pending}
      />
      {item.kind === "TRAINING" && (
        <>
          <QuizBuilder
            questions={draft.questions}
            onChange={(questions) => update({ questions })}
            disabled={!editable || pending}
          />
          <label>
            Quiz pass mark (%)
            <input
              type="number"
              min={1}
              max={100}
              required
              disabled={!editable || pending}
              value={draft.pass_mark}
              onChange={(event) =>
                update({ pass_mark: Number(event.target.value) })
              }
            />
          </label>
        </>
      )}
      <div className="pilot-toolbar">
        {editable ? (
          <>
            <button
              className="btn btn-primary"
              disabled={pending}
              type="submit"
            >
              Save draft
            </button>
            <button
              className="btn"
              type="button"
              disabled={pending || draft.blocks.length === 0}
              onClick={() => void save(true)}
            >
              Save & publish
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            type="button"
            disabled={pending}
            onClick={() => void changeStatus("DRAFT")}
          >
            Move to draft
          </button>
        )}
        {item.status !== "ARCHIVED" && (
          <button
            className="btn"
            type="button"
            disabled={pending || dirty}
            onClick={() => void changeStatus("ARCHIVED")}
          >
            Archive
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="pilot-notice">
          {message}
        </p>
      )}
    </form>
  );
}
