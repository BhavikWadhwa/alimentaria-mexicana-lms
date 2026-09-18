/** Checks identity with Auth and current employee status with RLS on every call. */
import "server-only";
import { redirect } from "next/navigation";
import type { AppRole, Employee } from "./types";
import { createPilotClient, isPilotConfigured } from "./supabase";

export class PilotError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function getPilotSession() {
  if (!isPilotConfigured()) return null;
  const client = await createPilotClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const profile = await client
    .from("employees")
    .select("*")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (profile.error)
    throw new PilotError("Unable to load your account. Please try again.", 503);
  if (!profile.data) return null;
  return { client, employee: profile.data as Employee };
}

export async function requirePilotSession(roles?: AppRole[]) {
  const session = await getPilotSession();
  if (!session)
    throw new PilotError(
      "Please sign in with an active employee account.",
      401,
    );
  if (roles && !roles.includes(session.employee.app_role))
    throw new PilotError("You do not have permission for this action.", 403);
  return session;
}

export async function requirePilotPage(roles?: AppRole[]) {
  const session = await getPilotSession();
  if (!session) redirect("/pilot/login");
  if (roles && !roles.includes(session.employee.app_role))
    redirect("/pilot/training");
  return session;
}

export function checkDatabaseError(error: { code?: string } | null) {
  if (!error) return;
  // Only a diagnostic code is logged, never query text, credentials or content.
  console.error("Pilot database operation failed", { code: error.code });
  throw new PilotError(
    "The change could not be saved. Check permissions and the current record status, then try again.",
  );
}
