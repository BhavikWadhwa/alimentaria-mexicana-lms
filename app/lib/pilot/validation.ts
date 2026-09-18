import { z } from "zod";

export const uuid = z.string().uuid();
export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});
export const employeeSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  app_role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  job_role_id: uuid.nullable(),
  station: z.string().trim().max(100).nullable(),
  active: z.boolean(),
});
export const draftSchema = z
  .object({
    id: uuid,
    title: z.string().trim().min(1).max(160),
    description: z.string().max(4000),
    category: z.string().trim().min(1).max(80),
    restricted: z.boolean(),
    duration_minutes: z.number().int().min(1).max(600).nullable(),
    pass_mark: z.number().int().min(1).max(100),
    role_ids: z.array(uuid).max(50),
    blocks: z
      .array(
        z.object({
          type: z.enum([
            "heading",
            "text",
            "callout",
            "image",
            "document",
            "video",
          ]),
          body: z.string().trim().min(1).max(20000),
        }),
      )
      .max(100),
    questions: z
      .array(
        z
          .object({
            prompt: z.string().trim().min(1).max(2000),
            options: z.array(z.string().trim().min(1).max(1000)).min(2).max(6),
            correct_index: z.number().int().min(0).max(5),
          })
          .refine(
            (q) => q.correct_index < q.options.length,
            "Choose a valid answer",
          ),
      )
      .max(50),
  })
  .refine(
    (d) => !d.restricted || d.role_ids.length > 0,
    "Select an allowed role",
  );

/** External embeds are limited to public video providers. Confidential media uses private uploads. */
export function safeVideoUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "www.youtube.com" && url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    if (url.hostname === "youtu.be" && /^\/[\w-]{11}$/.test(url.pathname))
      return `https://www.youtube-nocookie.com/embed${url.pathname}`;
    if (url.hostname === "vimeo.com" && /^\/\d+$/.test(url.pathname))
      return `https://player.vimeo.com/video${url.pathname}`;
    return null;
  } catch {
    return null;
  }
}
