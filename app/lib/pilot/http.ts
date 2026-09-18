import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PilotError } from "./auth";

/** Cookie-authenticated mutations require the configured origin, not a Host header. */
export function requireSameOrigin(request: Request) {
  const configured = process.env.APP_URL;
  if (
    !configured ||
    request.headers.get("origin") !== new URL(configured).origin
  ) {
    throw new PilotError("Request origin is not allowed.", 403);
  }
}
export function jsonResponse(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function errorResponse(error: unknown) {
  if (error instanceof ZodError)
    return jsonResponse(
      { error: "Check the required fields and try again." },
      400,
    );
  if (error instanceof PilotError)
    return jsonResponse({ error: error.message }, error.status);
  console.error("Unexpected pilot request failure", {
    type: error instanceof Error ? error.name : "unknown",
  });
  return jsonResponse(
    { error: "Something went wrong. Please try again." },
    500,
  );
}
