import { redirect } from "next/navigation";
import { requirePilotPage } from "@/app/lib/pilot/auth";
export default async function PilotHome() {
  const { employee } = await requirePilotPage();
  redirect(
    employee.app_role === "EMPLOYEE" ? "/pilot/training" : "/pilot/admin",
  );
}
