"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, BookOpen, CircleCheck, Clock3, FileText, Plus, Printer, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { equipment, equipmentTrainingLinks } from "../../data/operations-data";
import { employees, trainingModules } from "../../data/mock-data";
import { useOperations } from "../../lib/operations-store";
import type { EquipmentIssue, EquipmentIssueType, MaintenanceRecord, OperationalPriority } from "../../types";
import { formatDate, statusClass } from "./EquipmentPage";

export function EquipmentDetail({ equipmentId, mobile = false }: { equipmentId: string; mobile?: boolean }) {
  const item = equipment.find((candidate) => candidate.id === equipmentId);
  const { state, update } = useOperations();
  const [reporting, setReporting] = useState(false);
  const [addingMaintenance, setAddingMaintenance] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => queueMicrotask(() => setQrUrl(`${window.location.origin}/equipment/${equipmentId}`)), [equipmentId]);

  if (!item) return <div className="empty-state"><h1>Equipment not found</h1><Link href={mobile ? "/" : "/manager/equipment"} className="btn btn-dark">Return</Link></div>;

  const issues = state.equipmentIssues.filter((issue) => issue.equipmentId === item.id);
  const activeIssues = issues.filter((issue) => !issue.resolved);
  const records = state.maintenanceRecords.filter((record) => record.equipmentId === item.id).sort((a, b) => b.date.localeCompare(a.date));
  const links = equipmentTrainingLinks
    .filter((link) => link.equipmentId === item.id)
    .map((link) => ({ ...link, module: trainingModules.find((module) => module.id === link.trainingModuleId) }))
    .filter((link) => link.module);
  const effectiveStatus = activeIssues.some((issue) => issue.priority === "Critical" || issue.priority === "High") ? "Attention Required" : item.status;
  const total = records.reduce((sum, record) => sum + record.cost, 0);

  function addIssue(issue: EquipmentIssue) {
    update((current) => ({ ...current, equipmentIssues: [issue, ...current.equipmentIssues] }));
    setReporting(false);
  }

  function addMaintenance(record: MaintenanceRecord) {
    update((current) => ({ ...current, maintenanceRecords: [record, ...current.maintenanceRecords] }));
    setAddingMaintenance(false);
  }

  return <div className={mobile ? "equipment-mobile" : ""}>
    <div className="section-head">
      <div>
        {!mobile && <Link href="/manager/equipment" className="btn-link"><ArrowLeft size={16} /> Equipment</Link>}
        <p className="eyebrow" style={{ color: "var(--chilli)" }}>{item.assetCode} · {item.station}</p>
        <h1 className="display">{item.name}</h1>
        <span className={`status-badge ${statusClass(effectiveStatus)}`}>{effectiveStatus}</span>
      </div>
      <button className="btn btn-primary" onClick={() => setReporting(true)}><AlertTriangle size={17} /> Report an Issue</button>
    </div>

    <div className="equipment-detail-grid">
      <main>
        <section className="panel equipment-overview">
          <h2 className="panel-title">Overview</h2>
          <dl className="detail-list">
            {[["Brand / model", `${item.brand} ${item.model}`], ["Serial number", item.serialNumber], ["Installed", formatDate(item.installedDate)], ["Last service", formatDate(item.lastServicedDate)], ["Next service", formatDate(item.nextServiceDate)], ["Service provider", item.serviceCompany], ["Technician", item.technician], ["Warranty", item.warrantyExpiration]].map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
          </dl>
          <p className="demo-notice">{item.notes}</p>
        </section>

        <section className="panel">
          <div className="row between"><h2 className="panel-title">Open issues</h2><span className="tag">{activeIssues.length} active</span></div>
          <div className="issue-list">
            {issues.length ? issues.map((issue) => <article key={issue.id} className={issue.resolved ? "resolved" : ""}>
              <span className={`priority-dot ${issue.priority.toLowerCase()}`} />
              <div><strong>{issue.type}</strong><p>{issue.description}</p><small>{issue.priority} · {new Date(issue.reportedAt).toLocaleString("en-CA")}</small></div>
              {issue.resolved ? <CircleCheck /> : <button className="btn-link" onClick={() => update((current) => ({ ...current, equipmentIssues: current.equipmentIssues.map((candidate) => candidate.id === issue.id ? { ...candidate, resolved: true, resolutionNote: "Resolved in demo" } : candidate) }))}>Resolve</button>}
            </article>) : <div className="empty-state">No issues reported.</div>}
          </div>
        </section>

        <section className="panel" id="maintenance">
          <div className="row between">
            <div><h2 className="panel-title">Maintenance history</h2><strong>{money(total)}</strong><small className="muted"> recorded</small></div>
            {!mobile && <button className="btn btn-outline" onClick={() => setAddingMaintenance(true)}><Plus size={16} /> Add Record</button>}
          </div>
          <div className="maintenance-timeline">
            {records.map((record) => <article key={record.id}><span /><div><p className="eyebrow muted">{formatDate(record.date)}</p><h3>{record.type}</h3><p>{record.notes}</p><small>{record.technician} · {record.company} · {money(record.cost)}</small></div></article>)}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Training &amp; SOPs</h2>
          <p className="muted">These links open existing LMS modules. Equipment records do not duplicate course content.</p>
          <div className="training-links">
            {links.length ? links.map((link) => <Link key={link.id} href={`/employee/training/${link.trainingModuleId}`}><span className="icon-box">{link.relationshipType === "safety" ? <ShieldCheck /> : <BookOpen />}</span><div><strong>{link.module?.title}</strong><small>{link.relationshipType} · {link.module?.duration} min</small></div><span>Open LMS →</span></Link>) : <div className="empty-state">No linked training modules.</div>}
          </div>
        </section>
      </main>

      <aside>
        <section className="panel qr-panel"><p className="eyebrow muted">Scan at the equipment</p><h2 className="panel-title">QR access</h2>{qrUrl ? <QRCodeSVG value={qrUrl} size={210} level="M" includeMargin /> : <div className="qr-loading">Generating QR…</div>}<strong>{item.name}</strong><small>{item.assetCode}</small><button className="btn btn-dark no-print" onClick={() => window.print()}><Printer size={16} /> Print QR Label</button></section>
        <section className="panel quick-actions"><h2 className="panel-title">Quick access</h2>{links.slice(0, 3).map((link) => <Link key={link.id} href={`/employee/training/${link.trainingModuleId}`}><FileText size={17} />{link.relationshipType} instructions</Link>)}<button onClick={() => setReporting(true)}><AlertTriangle size={17} />Report issue</button><a href="#maintenance"><Clock3 size={17} />Maintenance history</a></section>
      </aside>
    </div>

    {reporting && <IssueModal equipmentId={item.id} close={() => setReporting(false)} submit={addIssue} />}
    {addingMaintenance && <MaintenanceModal equipmentId={item.id} close={() => setAddingMaintenance(false)} submit={addMaintenance} />}
  </div>;
}

function IssueModal({ equipmentId, close, submit }: { equipmentId: string; close: () => void; submit: (issue: EquipmentIssue) => void }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submit({ id: crypto.randomUUID(), equipmentId, type: String(data.get("type")) as EquipmentIssueType, priority: String(data.get("priority")) as OperationalPriority, description: String(data.get("description")), reportedByEmployeeId: String(data.get("employee")), reportedAt: new Date().toISOString(), resolved: false });
  }
  return <div className="modal-backdrop"><form className="modal issue-form" onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="issue-title"><h2 id="issue-title" className="display">Report equipment issue</h2><label>Issue type<select name="type">{["Not working", "Temperature issue", "Leak", "Electrical", "Unusual sound", "Physical damage", "Other"].map((type) => <option key={type}>{type}</option>)}</select></label><label>Priority<select name="priority"><option>Critical</option><option>High</option><option>Normal</option></select></label><label>Reported by<select name="employee">{employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></label><label>Description<textarea name="description" rows={5} required placeholder="What happened? What did you observe?" /></label><label>Photo or file<span className="file-placeholder">Attachment placeholder · no upload in demo</span></label><div className="row"><button className="btn btn-primary" type="submit">Report Issue</button><button className="btn btn-outline" type="button" onClick={close}>Cancel</button></div></form></div>;
}

function MaintenanceModal({ equipmentId, close, submit }: { equipmentId: string; close: () => void; submit: (record: MaintenanceRecord) => void }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submit({ id: crypto.randomUUID(), equipmentId, date: String(data.get("date")), type: String(data.get("type")), technician: String(data.get("technician")), company: String(data.get("company")), cost: Number(data.get("cost")), notes: String(data.get("notes")) });
  }
  return <div className="modal-backdrop"><form className="modal issue-form" onSubmit={onSubmit} role="dialog" aria-modal="true" aria-labelledby="maintenance-title"><h2 id="maintenance-title" className="display">Add maintenance record</h2><label>Date<input name="date" type="date" defaultValue="2026-09-01" required /></label><label>Service type<input name="type" defaultValue="Preventive service" required /></label><label>Technician<input name="technician" defaultValue="Mike Chen" required /></label><label>Company<input name="company" defaultValue="ABC Restaurant Equipment" required /></label><label>Cost (CAD)<input name="cost" type="number" min="0" step="1" defaultValue="250" required /></label><label>Notes<textarea name="notes" rows={4} required placeholder="Work completed and follow-up required" /></label><div className="row"><button className="btn btn-primary" type="submit">Save Record</button><button className="btn btn-outline" type="button" onClick={close}>Cancel</button></div></form></div>;
}

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
