import Link from "next/link";
import {
  BookOpen,
  Library,
  Users,
  LayoutDashboard,
  FilePenLine,
} from "lucide-react";
import { requirePilotPage } from "@/app/lib/pilot/auth";
import { ActionButton } from "@/app/components/pilot/ActionButton";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { employee } = await requirePilotPage();
  // Navigation is convenience only. Each destination and RPC checks permissions.
  const management = employee.app_role !== "EMPLOYEE";
  return (
    <div className="pilot-workspace">
      <aside className="pilot-sidebar">
        <Link href="/pilot" className="pilot-wordmark">
          Alimentaria
          <br />
          <span>Mexicana</span>
        </Link>
        <p className="eyebrow">Team learning</p>
        <nav aria-label="Training navigation">
          <Link href="/pilot/training">
            <BookOpen size={20} />
            My training
          </Link>
          <Link href="/pilot/library">
            <Library size={20} />
            SOP library
          </Link>
          {management && (
            <>
              <Link href="/pilot/admin">
                <LayoutDashboard size={20} />
                Overview
              </Link>
              <Link href="/pilot/admin/employees">
                <Users size={20} />
                Employees
              </Link>
              <Link href="/pilot/admin/content">
                <FilePenLine size={20} />
                Training & SOPs
              </Link>
            </>
          )}
        </nav>
        <div className="pilot-account">
          <strong>
            {employee.first_name} {employee.last_name}
          </strong>
          <small>{employee.app_role.toLowerCase()}</small>
          <Link href="/pilot/password">Change password</Link>
          <ActionButton endpoint="auth" payload={{ action: "logout" }}>
            Sign out
          </ActionButton>
        </div>
      </aside>
      <main className="pilot-main">{children}</main>
    </div>
  );
}
