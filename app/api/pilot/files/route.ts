import {
  requirePilotSession,
  PilotError,
  checkDatabaseError,
} from "@/app/lib/pilot/auth";
import { createServiceClient } from "@/app/lib/pilot/supabase";
import { uuid } from "@/app/lib/pilot/validation";
import {
  errorResponse,
  jsonResponse,
  requireSameOrigin,
} from "@/app/lib/pilot/http";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
]);

/** File bytes use a private proxy, never durable public or signed URLs. */
export async function GET(request: Request) {
  try {
    const { client } = await requirePilotSession();
    const path = new URL(request.url).searchParams.get("path") ?? "";
    const itemId = uuid.parse(path.split("/")[0]);
    if (!new RegExp(`^${itemId}/[a-f0-9-]{36}$`).test(path))
      throw new PilotError("File unavailable.", 404);
    const item = await client
      .from("learning_items")
      .select("id")
      .eq("id", itemId)
      .maybeSingle();
    if (item.error || !item.data)
      throw new PilotError("File unavailable.", 404);
    const { data, error } = await createServiceClient()
      .storage.from("pilot-content")
      .download(path);
    if (error || !data || !allowedTypes.has(data.type))
      throw new PilotError("File unavailable.", 404);
    return new Response(data, {
      headers: {
        "Content-Type": data.type,
        "Content-Disposition": 'inline; filename="training-content"',
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { client } = await requirePilotSession(["ADMIN"]);
    const form = await request.formData();
    const itemId = uuid.parse(form.get("item_id"));
    const item = await client
      .from("learning_items")
      .select("status")
      .eq("id", itemId)
      .single();
    checkDatabaseError(item.error);
    if (item.data?.status !== "DRAFT")
      throw new PilotError("Uploads are only available for drafts.");
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !allowedTypes.has(file.type) ||
      file.size === 0 ||
      file.size > 4 * 1024 * 1024
    )
      throw new PilotError(
        "Choose a PNG, JPEG, WebP, PDF, MP4 or WebM file up to 4 MB.",
      );
    const path = `${itemId}/${crypto.randomUUID()}`;
    const { error } = await createServiceClient()
      .storage.from("pilot-content")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new PilotError("Upload failed. Please try again.");
    return jsonResponse({ path });
  } catch (error) {
    return errorResponse(error);
  }
}
