"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Play, RotateCcw } from "lucide-react";
import { brand } from "../../config/brand";
import { fryerLesson, terminology, trainingModules } from "../../data/mock-data";
import { readStorage, STORAGE_KEYS, writeStorage } from "../../lib/storage";

export function LessonPage({ moduleId }: { moduleId: string }) {
  const trainingModule = trainingModules.find((item) => item.id === moduleId) ?? trainingModules[5];
  const isFryer = trainingModule.id === "fryer-station";
  const title = isFryer ? fryerLesson.title : `${trainingModule.title}: Station Essentials`;
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCompleted(readStorage<string[]>(STORAGE_KEYS.lessons, []).includes(fryerLesson.id)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markComplete = () => {
    const ids = readStorage<string[]>(STORAGE_KEYS.lessons, []);
    if (!ids.includes(fryerLesson.id)) writeStorage(STORAGE_KEYS.lessons, [...ids, fryerLesson.id]);
    setCompleted(true);
    window.dispatchEvent(new Event("baysics-storage"));
  };

  const progress = completed ? Math.min(100, trainingModule.progress + 13) : trainingModule.progress;
  const lessonCount = completed ? trainingModule.completedLessons + 1 : trainingModule.completedLessons;

  return <>
    <nav className="row muted" aria-label="Breadcrumb"><Link href="/employee/training">My Training</Link><ArrowRight size={14} /><span>{trainingModule.title}</span><ArrowRight size={14} /><strong>Lesson {fryerLesson.lessonNumber}</strong></nav>
    <div className="section-head" style={{ marginTop: 25 }}><div><p className="eyebrow" style={{ color: "var(--chilli)" }}>Lesson {fryerLesson.lessonNumber} of {trainingModule.lessons} · Cocina</p><h1 className="display">{title}</h1><div className="row muted"><Clock size={17} />{fryerLesson.duration} minutes <span>•</span> Demonstration content</div></div><span className="tag">{completed ? <><CheckCircle2 size={16} /> Completed</> : "In progress"}</span></div>
    <div className="lesson-layout">
      <div>
        <div className="video-placeholder" style={{ backgroundImage: `url(${isFryer ? brand.images.fryer : trainingModule.image})` }}><button className="play" aria-label={playing ? "Replay demonstration video" : "Play demonstration video"} onClick={() => setPlaying(true)}>{playing ? <RotateCcw /> : <Play fill="currentColor" />}</button>{playing && <strong style={{ position: "absolute", bottom: 25, zIndex: 2 }}>Demo video preview · 02:14</strong>}</div>
        <article className="card lesson-content">
          <p className="tag">Placeholder demonstration material</p>
          <h2>Lesson summary</h2><p className="muted" style={{ lineHeight: 1.75 }}>{fryerLesson.summary}</p>
          <h2>Learning outcomes</h2><ul className="check-list">{fryerLesson.outcomes.map((item) => <li key={item}><Check size={18} color="var(--agave)" />{item}</li>)}</ul>
          <h2>Required equipment</h2><div className="restaurant-types">{fryerLesson.equipment.map((item) => <span key={item}>{item}</span>)}</div>
          <h2>Step-by-step demonstration</h2><ol style={{ display: "grid", gap: 16, paddingLeft: 24 }}>{fryerLesson.steps.map((item, index) => <li key={item}><strong>Step {index + 1}.</strong> {item}</li>)}</ol>
          <div className="warning" style={{ marginTop: 28 }}><div className="row"><AlertTriangle color="var(--chilli)" /><strong>Safety note</strong></div><p>This page is product-demo content, not real operating instruction. Actual equipment, food-safety, temperature, and timing procedures must come from the restaurant’s approved SOPs and qualified in-person trainer.</p></div>
          <h2>Timing and quality reference</h2><p className="muted">Demo reference only: use the visual timer, compare against the restaurant’s approved quality card, communicate delays, and never substitute these fictional values for live operations.</p>
          <h2>Common mistakes</h2>{fryerLesson.mistakes.map((item) => <details key={item} className="card" style={{ padding: 16, marginBottom: 9 }}><summary style={{ fontWeight: 800, cursor: "pointer" }}>{item}</summary><p className="muted">Pause, reset the demonstration workflow, and ask the station lead to review the relevant operating procedure.</p></details>)}
          <h2>English / Spanish terminology</h2><div className="table-wrap"><table className="terminology"><thead><tr><th>English</th><th>Español</th></tr></thead><tbody>{terminology.map(([english, spanish]) => <tr key={english}><td>{english}</td><td>{spanish}</td></tr>)}</tbody></table></div>
        </article>
        <div className="row between" style={{ marginTop: 20, flexWrap: "wrap" }}><Link className="btn btn-outline" href="/employee/training"><ArrowLeft size={17} /> Previous lesson</Link><Link className="btn btn-dark" href={isFryer ? "/employee/training/fryer-station/quiz" : "/employee/training/fryer-station"}>Next lesson <ArrowRight size={17} /></Link></div>
      </div>
      <aside className="panel lesson-aside"><p className="eyebrow muted">Module progress</p><h2 className="panel-title">{trainingModule.title}</h2><div className="row between" style={{ marginTop: 24 }}><span>{progress}% complete</span><strong>{lessonCount}/{trainingModule.lessons}</strong></div><div className="progress" style={{ margin: "10px 0 26px" }}><span style={{ width: `${progress}%` }} /></div><button onClick={markComplete} disabled={completed} className="btn btn-primary" style={{ width: "100%" }}>{completed ? <><CheckCircle2 size={18} /> Lesson Complete</> : "Mark as Complete"}</button>{isFryer && <Link href="/employee/training/fryer-station/quiz" className="btn btn-outline" style={{ width: "100%", marginTop: 10 }}>Take Knowledge Check</Link>}<p className="muted" style={{ fontSize: 12, marginTop: 18 }}>Your progress is saved in this browser for the prototype.</p></aside>
    </div>
  </>;
}
