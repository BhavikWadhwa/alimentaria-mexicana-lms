"use client";

import { useState } from "react";
import { Award, Lock, Printer, X } from "lucide-react";
import { brand } from "../../config/brand";
import { certificates } from "../../data/mock-data";

export function CertificatesPage() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="section-head"><div><p className="eyebrow" style={{ color: "var(--chilli)" }}>Tus logros</p><h1 className="display">Certificates</h1><p className="muted">Digital milestones paired with practical manager sign-offs.</p></div><span className="tag">2 earned · 3 locked</span></div>
    <div className="certificate-grid">{certificates.map(certificate => <article className={`certificate-card card ${certificate.earned ? "" : "locked"}`} key={certificate.id}><div><span className="icon-box">{certificate.earned ? <Award /> : <Lock />}</span><p className="eyebrow" style={{ marginTop: 25 }}>{certificate.earned ? "Certificate earned" : "Practical sign-off required"}</p><h2 className="display" style={{ fontSize: 34, lineHeight: 1 }}>{certificate.title}</h2>{certificate.date && <p style={{ opacity: .65 }}>{certificate.date}</p>}</div>{certificate.earned && <button className="btn btn-light no-print" onClick={() => setOpen(true)}>View certificate</button>}</article>)}</div>
    {open && <div className="modal-backdrop"><div className="modal"><button className="round-btn close no-print" onClick={() => setOpen(false)} aria-label="Close certificate"><X /></button><div className="certificate-print"><div className="wordmark">{brand.name}.</div><p className="eyebrow" style={{ marginTop: 40 }}>Certificate of completion</p><h2 className="display" style={{ fontSize: 54 }}>Restaurant Orientation</h2><p>This certifies that</p><h3 className="display" style={{ fontSize: 42 }}>{brand.demoEmployee.name}</h3><p>completed the demonstration module for<br /><strong>{brand.restaurantName}</strong></p><p style={{ marginTop: 45 }}>Issued July 18, 2026 · Demo credential</p></div><button className="btn btn-dark no-print" onClick={() => window.print()} style={{ marginTop: 20 }}><Printer size={17} /> Print Certificate</button></div></div>}
  </>;
}
