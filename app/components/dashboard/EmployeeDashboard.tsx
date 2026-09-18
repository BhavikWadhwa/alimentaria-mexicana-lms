"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookCheck, BookOpen, Check, ChefHat, ClipboardCheck, Lock, Play, Trophy } from "lucide-react";
import { brand } from "../../config/brand";
import { trainingModules } from "../../data/mock-data";
import { readStorage, STORAGE_KEYS } from "../../lib/storage";

const icons = [BookOpen, BookCheck, ChefHat, ClipboardCheck, ChefHat, Play, Lock];

export function EmployeeDashboard() {
  const [lessonDone, setLessonDone] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setLessonDone(readStorage<string[]>(STORAGE_KEYS.lessons, []).includes("chips-and-tortillas"));
      const quizzes = readStorage<Record<string, number>>(STORAGE_KEYS.quiz, {});
      setQuizScore(quizzes.fryer ?? null);
    };
    sync();
    window.addEventListener("baysics-storage", sync);
    return () => window.removeEventListener("baysics-storage", sync);
  }, []);

  const overall = lessonDone ? 71 : 68;

  return <>
    <div><p className="eyebrow" style={{ color: "var(--chilli)" }}>Tu progreso</p><h1 className="display app-title">Your kitchen pathway.</h1></div>
    <section className="featured">
      <div className="featured-copy"><span className="tag" style={{ color: "var(--charcoal)" }}>Current station · Estación fría</span><h2 className="display">Cold Station Fundamentals</h2><p style={{ opacity: .74 }}>Five of eight lessons completed · 18 minutes remaining</p><div className="row between"><strong>65% complete</strong><span>5 / 8 lessons</span></div><div className="progress" style={{ margin: "12px 0 26px" }}><span style={{ width: "65%" }} /></div><Link className="btn btn-primary" href="/employee/training/cold-station">Continue Module <ArrowRight size={18} /></Link></div>
      <img className="featured-image" src={brand.images.coldStation} alt="Fresh guacamole ingredients at a colourful Mexican cold station" />
    </section>
    <div className="stat-grid"><Stat icon={<BookCheck />} value="4 of 7" label="Modules completed" /><Stat icon={<Trophy />} value={quizScore !== null ? "3 passed" : "2 passed"} label="Quizzes passed" /><Stat icon={<ClipboardCheck />} value="1 pending" label="Practical checklist" /><Stat icon={<ChefHat />} value={`${overall}%`} label="Overall progress" /></div>
    <div className="dashboard-grid">
      <section className="panel"><div className="row between"><div><p className="eyebrow muted">Entrenamiento</p><h2 className="panel-title">Training pathway</h2></div><Link href="/employee/training" className="btn btn-outline">View all</Link></div><div className="module-list">{trainingModules.map((module, index) => { const Icon = icons[index]; const progress = module.id === "fryer-station" && lessonDone ? 38 : module.progress; return <article className="module-row" key={module.id}><span className="icon-box"><Icon size={20} /></span><div><strong>{module.title}</strong><div className="muted" style={{ fontSize: 12 }}>{module.microLabel} · {module.lessons} lessons</div></div><div><div className="row between" style={{ fontSize: 12 }}><span>{module.status.replace("-", " ")}</span><strong>{progress}%</strong></div><div className="progress" style={{ marginTop: 7 }}><span style={{ width: `${progress}%` }} /></div></div>{module.status === "locked" ? <span className="tag"><Lock size={13} /> Locked</span> : <Link className="btn btn-outline" href={`/employee/training/${module.id}`}>{module.status === "completed" ? "Review" : "Continue"}</Link>}</article>; })}</div></section>
      <aside className="panel shift-card"><p className="eyebrow">Próximo turno</p><p className="shift-date">{brand.demoShift}</p><strong>4:00 PM–10:30 PM</strong><p>Cold Station · Trainer: {brand.demoManager.name}</p><div className="skill-list"><strong>Skills to review</strong><span><Check size={15} /> Station opening sequence</span><span><Check size={15} /> Guacamole quality check</span><span><Check size={15} /> Allergy callouts</span></div><Link href="/employee/checklists" className="btn btn-dark">Review Checklist</Link>{quizScore !== null && <p style={{ marginTop: 20, fontWeight: 800 }}>Latest fryer quiz: {quizScore}%</p>}</aside>
    </div>
  </>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="stat-card"><span className="icon-box">{icon}</span><span className="stat-number">{value}</span><span className="muted">{label}</span></div>;
}
