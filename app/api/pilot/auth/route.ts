import { z } from "zod";
import { createPilotClient, isPilotConfigured } from "@/app/lib/pilot/supabase";
import { credentialsSchema } from "@/app/lib/pilot/validation";
import { PilotError, requirePilotSession } from "@/app/lib/pilot/auth";
import {
  errorResponse,
  jsonResponse,
  requireSameOrigin,
} from "@/app/lib/pilot/http";

export async function POST(request: Request) {
  try {
    if (!isPilotConfigured())
      throw new PilotError("The pilot is awaiting account setup.", 503);
    requireSameOrigin(request);
    const body = await request.json();
    const client = await createPilotClient();
    if (body.action === "login") {
      const input = credentialsSchema.parse(body);
      const { error } = await client.auth.signInWithPassword(input);
      if (error) throw new PilotError("Email or password is incorrect.", 401);
      try {
        await requirePilotSession();
      } catch {
        await client.auth.signOut();
        throw new PilotError(
          "Your employee account is unavailable. Contact management.",
          403,
        );
      }
      return jsonResponse({ redirect: "/pilot" });
    }
    if (body.action === "logout") {
      const { error } = await client.auth.signOut();
      if (error)
        throw new PilotError("Unable to sign out. Please try again.", 503);
      return jsonResponse({ redirect: "/pilot/login" });
    }
    if (body.action === "reset") {
      const email = z.email().parse(body.email);
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.APP_URL}/pilot/auth/callback`,
      });
      // Use the same response for unknown addresses. Transport failures are still logged.
      if (error)
        console.error("Password recovery request failed", { code: error.code });
      return jsonResponse({
        message:
          "If an account exists, a password reset email will arrive shortly.",
      });
    }
    if (body.action === "password") {
      const password = z.string().min(12).max(128).parse(body.password);
      await requirePilotSession();
      const { error } = await client.auth.updateUser({ password });
      if (error)
        throw new PilotError(
          "Password could not be updated. Request a new reset link.",
        );
      await client.auth.signOut();
      return jsonResponse({ redirect: "/pilot/login?updated=1" });
    }
    throw new PilotError("Unknown action.");
  } catch (error) {
    return errorResponse(error);
  }
}
