"use client";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { pilotRequest, messageFrom } from "./client";

const subscribe = () => () => {};
const browserReady = () => true;
const serverReady = () => false;

export function ActionButton({
  children,
  payload,
  endpoint = "actions",
}: {
  children: React.ReactNode;
  payload: Record<string, unknown>;
  endpoint?: string;
}) {
  const router = useRouter();
  // Server-rendered buttons must not accept clicks before their handler hydrates.
  const hydrated = useSyncExternalStore(subscribe, browserReady, serverReady);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={!hydrated || pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            const result = await pilotRequest(payload, endpoint);
            if (result.redirect) window.location.assign(result.redirect);
            else router.refresh();
          } catch (problem) {
            setError(messageFrom(problem));
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Saving…" : children}
      </button>
      {error && (
        <p role="alert" className="pilot-notice">
          {error}
        </p>
      )}
    </div>
  );
}
