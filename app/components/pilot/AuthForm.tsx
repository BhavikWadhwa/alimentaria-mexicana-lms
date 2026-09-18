"use client";
import { useState } from "react";
import { pilotRequest, messageFrom } from "./client";

export function AuthForm({
  mode,
  disabled = false,
}: {
  mode: "login" | "reset" | "password";
  disabled?: boolean;
}) {
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
          const result = await pilotRequest(
            {
              action: mode,
              email: form.get("email"),
              password: form.get("password"),
            },
            "auth",
          );
          if (result.redirect) window.location.assign(result.redirect);
          else setMessage(result.message ?? "Done.");
        } catch (error) {
          setMessage(messageFrom(error));
        } finally {
          setPending(false);
        }
      }}
    >
      {mode !== "password" && (
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={disabled}
          />
        </label>
      )}
      {mode !== "reset" && (
        <label>
          {mode === "password" ? "New password" : "Password"}
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "password" ? "new-password" : "current-password"
            }
            minLength={mode === "password" ? 12 : 1}
            maxLength={128}
            required
            disabled={disabled}
          />
        </label>
      )}
      {mode === "password" && <p>Use at least 12 characters.</p>}
      <button className="btn btn-primary" disabled={disabled || pending}>
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : mode === "reset"
              ? "Send reset email"
              : "Save password"}
      </button>
      {message && (
        <p role="status" className="pilot-notice">
          {message}
        </p>
      )}
    </form>
  );
}
