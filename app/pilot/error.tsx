"use client";
export default function PilotErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="pilot-auth">
      <section className="pilot-panel">
        <h1>Unable to load this page</h1>
        <p>Please try again. If the problem continues, contact management.</p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <a href="/pilot/login">Back to sign in</a>
      </section>
    </main>
  );
}
