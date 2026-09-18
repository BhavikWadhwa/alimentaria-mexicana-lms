import Link from "next/link";
import { AuthForm } from "@/app/components/pilot/AuthForm";
import { isPilotConfigured } from "@/app/lib/pilot/supabase";
export default function ResetPage() {
  return (
    <main className="pilot-auth">
      <section className="pilot-panel">
        <p className="eyebrow">Alimentaria Mexicana</p>
        <h1>Reset password</h1>
        <AuthForm mode="reset" disabled={!isPilotConfigured()} />
        <Link href="/pilot/login">Back to sign in</Link>
      </section>
    </main>
  );
}
