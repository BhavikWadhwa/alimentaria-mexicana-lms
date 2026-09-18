import type { Metadata } from "next";
import "./pilot.css";

export const metadata: Metadata = {
  title: "Alimentaria Mexicana | Training",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function PilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pilot">{children}</div>;
}
