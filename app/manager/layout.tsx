import { AppShell } from "../components/dashboard/AppShell";
export default function Layout({children}:{children:React.ReactNode}){return <AppShell role="manager">{children}</AppShell>}
