import { requirePilotPage } from "@/app/lib/pilot/auth";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePilotPage(["ADMIN", "MANAGER"]);
  return children;
}
