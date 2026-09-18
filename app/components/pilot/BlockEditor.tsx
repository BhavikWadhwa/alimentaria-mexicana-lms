"use client";
import { useState } from "react";
import type { EditorBlock, BlockType } from "@/app/lib/pilot/types";
import { messageFrom } from "./client";

const blockTypes: BlockType[] = [
  "heading",
  "text",
  "callout",
  "image",
  "document",
  "video",
];
export function BlockEditor({
  itemId,
  blocks,
  onChange,
  disabled,
}: {
  itemId: string;
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  disabled: boolean;
}) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const update = (index: number, patch: Partial<EditorBlock>) =>
    onChange(
      blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    );
  const move = (index: number, direction: number) => {
    const next = [...blocks];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  };
  return (
    <section>
      <h2>Content blocks</h2>
      <p>
        Add content in the order employees should read it. Upload confidential
        media as private files.
      </p>
      {blocks.map((block, index) => (
        <fieldset
          key={index}
          disabled={disabled || uploading !== null}
          className="pilot-block-editor"
        >
          <legend>Block {index + 1}</legend>
          <div className="pilot-toolbar">
            <select
              aria-label={`Block ${index + 1} type`}
              value={block.type}
              onChange={(event) =>
                update(index, {
                  type: event.target.value as BlockType,
                  body: "",
                })
              }
            >
              {blockTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              aria-label={`Move block ${index + 1} up`}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={index === blocks.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`Move block ${index + 1} down`}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(blocks.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          {["heading", "text", "callout"].includes(block.type) ? (
            <label>
              Content
              <textarea
                value={block.body}
                onChange={(event) =>
                  update(index, { body: event.target.value })
                }
                rows={block.type === "heading" ? 2 : 5}
                maxLength={20000}
                required
              />
            </label>
          ) : (
            <>
              <label>
                {block.type === "video"
                  ? "Private file reference or public YouTube/Vimeo link"
                  : "Private file reference"}
                <input
                  value={block.body}
                  onChange={(event) =>
                    update(index, { body: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                Upload {block.type}
                <input
                  type="file"
                  accept={
                    block.type === "image"
                      ? "image/png,image/jpeg,image/webp"
                      : block.type === "document"
                        ? "application/pdf"
                        : "video/mp4,video/webm"
                  }
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploading(index);
                    setError("");
                    try {
                      const form = new FormData();
                      form.set("item_id", itemId);
                      form.set("file", file);
                      const response = await fetch("/api/pilot/files", {
                        method: "POST",
                        body: form,
                      });
                      const result = await response.json();
                      if (!response.ok) throw new Error(result.error);
                      update(index, { body: result.path });
                    } catch (problem) {
                      setError(messageFrom(problem));
                    } finally {
                      setUploading(null);
                    }
                  }}
                />
              </label>
              <small>
                Maximum 4 MB per file.{" "}
                {uploading === index
                  ? "Uploading…"
                  : "Save the draft after uploading."}
              </small>
            </>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className="btn"
        disabled={disabled || uploading !== null || blocks.length >= 100}
        onClick={() => onChange([...blocks, { type: "text", body: "" }])}
      >
        + Add content block
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
