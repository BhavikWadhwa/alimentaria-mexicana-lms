"use client";

export async function pilotRequest<
  T = { message?: string; id?: string; redirect?: string },
>(body: unknown, endpoint = "actions"): Promise<T> {
  const response = await fetch(`/api/pilot/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "The request could not be completed.");
  return result as T;
}

export function messageFrom(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
