"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, UserRoundCheck } from "lucide-react";
import { checklists } from "../../data/mock-data";
import { readStorage, STORAGE_KEYS, writeStorage } from "../../lib/storage";

export function ChecklistsPage() {
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setState(readStorage(STORAGE_KEYS.checklists, {})), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggle = (key: string) => {
    const next = { ...state, [key]: !state[key] };
    setState(next);
    writeStorage(STORAGE_KEYS.checklists, next);
  };

  return <>
    <div className="section-head">
      <div><p className="eyebrow" style={{ color: "var(--chilli)" }}>Listas de verificación</p><h1 className="display">Shift checklists</h1><p className="muted">Your checks are saved in this browser.</p></div>
      <span className="tag"><CheckCircle2 size={16} />{Object.values(state).filter(Boolean).length} items checked</span>
    </div>
    <div className="checklist-list">
      {checklists.map((list) => {
        const count = list.items.filter((_, index) => state[`${list.id}-${index}`]).length;
        return <section className="card checklist-group" key={list.id}>
          <div className="row between" style={{ alignItems: "start" }}><div><p className="eyebrow muted">{list.microLabel}</p><h2 className="panel-title">{list.title}</h2></div><span className="tag">{count}/{list.items.length} complete</span></div>
          <div style={{ marginTop: 18 }}>{list.items.map((item, index) => {
            const key = `${list.id}-${index}`;
            return <label className="check-item" key={key}><input type="checkbox" checked={!!state[key]} onChange={() => toggle(key)} /><span style={{ textDecoration: state[key] ? "line-through" : "none", color: state[key] ? "var(--warm-grey)" : "inherit" }}>{item}</span></label>;
          })}</div>
          <div className="row muted" style={{ marginTop: 18 }}><UserRoundCheck size={18} /><span>Manager sign-off: pending practical review</span></div>
        </section>;
      })}
    </div>
  </>;
}
