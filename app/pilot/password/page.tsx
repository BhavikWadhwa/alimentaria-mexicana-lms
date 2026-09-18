import { AuthForm } from "@/app/components/pilot/AuthForm";
import { requirePilotPage } from "@/app/lib/pilot/auth";
export default async function PasswordPage() {
  await requirePilotPage();
  return (
    <main className="pilot-auth">
      <section className="pilot-panel">
        <h1>Choose a new password</h1>
        <AuthForm mode="password" />
      </section>
    </main>
  );
}
