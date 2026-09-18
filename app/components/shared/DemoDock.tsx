"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { resetDemoStorage } from "../../lib/storage";

export function DemoDock() {
  const pathname = usePathname();
  if (pathname.startsWith("/pilot")) return null;
  return (
    <aside className="demo-dock" aria-label="Prototype view controls">
      <span className="eyebrow" style={{ padding: "0 7px", opacity: 0.55 }}>
        Demo
      </span>
      <Link href="/">Marketing Website</Link>
      <Link href="/employee">Employee Demo</Link>
      <Link href="/manager">Manager Demo</Link>
      <Link href="/pilot/login">Alimentaria Pilot</Link>
      <button
        onClick={() => {
          resetDemoStorage();
          window.location.reload();
        }}
        aria-label="Reset all demo data"
      >
        <RotateCcw size={14} /> Reset
      </button>
    </aside>
  );
}
