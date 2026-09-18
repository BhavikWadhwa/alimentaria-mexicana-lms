import Link from "next/link";
import { AuthForm } from "@/app/components/pilot/AuthForm";
import { isPilotConfigured } from "@/app/lib/pilot/supabase";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string; updated?: string }>;
}) {
  const query = await searchParams;
  const configured = isPilotConfigured();
  return (
    <main className="pilot-auth">
      <section className="pilot-panel">
        <p className="eyebrow">Alimentaria Mexicana</p>
        <h1>Team training</h1>
        <p>Sign in to your training and SOP library.</p>
        {!configured && (
          <p className="pilot-notice" role="status">
            The pilot is awaiting account setup. Management will let you know
            when sign-in is available.
          </p>
        )}
        {query.expired && (
          <p role="alert">
            This reset link has expired or has already been used. Request a new
            one.
          </p>
        )}
        {query.updated && (
          <p role="status">
            Your password was updated. Sign in with your new password.
          </p>
        )}
        <AuthForm mode="login" disabled={!configured} />
        <Link href="/pilot/reset">Forgot your password?</Link>
      </section>
    </main>
  );
}
