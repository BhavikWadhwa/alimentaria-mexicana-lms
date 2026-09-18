"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, ChevronRight, QrCode, Search, Settings2, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { equipment } from "../../data/operations-data";
import { useOperations } from "../../lib/operations-store";
import type { EquipmentStatus } from "../../types";

export function EquipmentPage() {
  const { state } = useOperations();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const openIssues = state.equipmentIssues.filter((issue) => !issue.resolved);
  const equipmentWithStatus = useMemo(() => equipment.map((item) => {
    const issues = openIssues.filter((issue) => issue.equipmentId === item.id);
    const effectiveStatus: EquipmentStatus = issues.some((issue) => issue.priority === "Critical" || issue.priority === "High") ? "Attention Required" : item.status;
    return { ...item, effectiveStatus, issueCount: issues.length };
  }), [openIssues]);
  const filtered = useMemo(() => equipmentWithStatus.filter((item) => (status === "All" || item.effectiveStatus === status) && `${item.name} ${item.assetCode} ${item.station}`.toLowerCase().includes(query.toLowerCase())), [equipmentWithStatus, query, status]);

  return <>
    <div className="section-head"><div><p className="eyebrow" style={{ color: "var(--chilli)" }}>Kitchen assets · Equipo</p><h1 className="display">Equipment</h1><p className="muted">Maintenance, issues, QR access, and training links in one shared record.</p></div><span className="tag"><Wrench size={15} />{openIssues.length} active issues</span></div>
    <div className="metric-grid ops-metrics"><EquipmentMetric label="Assets" value={`${equipment.length}`} icon={<Settings2 />} /><EquipmentMetric label="Operational" value={`${equipmentWithStatus.filter((item) => item.effectiveStatus === "Operational").length}`} icon={<Wrench />} /><EquipmentMetric label="Needs attention" value={`${equipmentWithStatus.filter((item) => item.effectiveStatus === "Attention Required").length}`} icon={<AlertTriangle />} /><EquipmentMetric label="Service due soon" value="4" icon={<CalendarClock />} /></div>
    <div className="filters"><label className="search-label"><Search size={17} /><span className="sr-only">Search equipment</span><input placeholder="Search equipment or asset code" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter equipment status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Operational</option><option>Attention Required</option><option>Out of Service</option><option>Under Repair</option></select></div>
    <div className="equipment-grid">
      {filtered.map((item) => <article className="equipment-card" key={item.id}>
        <div className="row between"><span className={`status-badge ${statusClass(item.effectiveStatus)}`}>{item.effectiveStatus}</span><QrCode size={20} /></div>
        <h2 className="display">{item.name}</h2><p className="muted">{item.assetCode} · {item.station}</p>
        <dl><div><dt>Brand / model</dt><dd>{item.brand} {item.model}</dd></div><div><dt>Last service</dt><dd>{formatDate(item.lastServicedDate)}</dd></div><div><dt>Next service</dt><dd>{formatDate(item.nextServiceDate)}</dd></div></dl>
        {item.issueCount > 0 && <div className="equipment-alert"><AlertTriangle size={16} />{item.issueCount} unresolved {item.issueCount === 1 ? "issue" : "issues"}</div>}
        <Link href={`/manager/equipment/${item.id}`} className="btn-link">View equipment <ChevronRight size={16} /></Link>
      </article>)}
    </div>
  </>;
}

function EquipmentMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <article className="metric-card"><span className="icon-box">{icon}</span><strong>{value}</strong><span>{label}</span></article>;
}

export function statusClass(status: string) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
