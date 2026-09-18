import Link from "next/link";
import { ArrowRight, ClipboardCheck, GraduationCap, MessageSquareText, Wrench } from "lucide-react";

const pillars = [
  { icon: <GraduationCap />, label: "TRAINING", title: "Give people the knowledge before they need it under pressure.", items: ["Employee pathways", "Videos and quizzes", "Recipes and SOPs", "Certifications and sign-offs"], href: "/employee" },
  { icon: <ClipboardCheck />, label: "PREP", title: "Turn par levels and station needs into one clear daily plan.", items: ["Daily prep lists", "Station assignments", "Priorities and progress", "Linked recipes and training"], href: "/manager/prep" },
  { icon: <MessageSquareText />, label: "HANDOFF", title: "Carry important context cleanly from one shift to the next.", items: ["Morning brief", "Priority notes", "Acknowledgements", "Prep and equipment links"], href: "/manager/handoff" },
  { icon: <Wrench />, label: "EQUIPMENT", title: "Keep issues, service history, QR access, and SOPs together.", items: ["Asset records", "Issue reporting", "Maintenance history", "QR-linked instructions"], href: "/manager/equipment" },
];

export function PlatformStory() {
  return <>
    <section className="platform-section section" id="platform">
      <div className="container">
        <p className="eyebrow" style={{ color: "var(--chilli)" }}>Restaurant operations, connected</p>
        <h2 className="display section-title">One place for the work that keeps a kitchen ready.</h2>
        <div className="pillar-grid">
          {pillars.map((pillar) => <article key={pillar.label}>
            <span className="pillar-icon">{pillar.icon}</span>
            <p className="eyebrow">{pillar.label}</p>
            <h3 className="display">{pillar.title}</h3>
            {pillar.items.map((item) => <span key={item}>{item}</span>)}
            <Link href={pillar.href}>Explore {pillar.label.toLowerCase()} <ArrowRight size={17} /></Link>
          </article>)}
        </div>
        <div className="system-flow" aria-label="Connected product cycle"><strong>LEARN</strong><i>→</i><strong>PREP</strong><i>→</i><strong>HAND OFF</strong><i>→</i><strong>IMPROVE</strong></div>
      </div>
    </section>
    <section className="operations-story section">
      <div className="container">
        <p className="eyebrow">From knowledge to daily readiness</p>
        <div className="story-flow">
          {["A new employee is hired", "Structured training is assigned", "Station SOPs build confidence", "Managers plan the day’s prep", "Teams record progress during service", "Closing staff leave a clear handoff", "Equipment issues become trackable records", "The next shift starts with context"].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}
        </div>
        <h2 className="display">Training becomes part of daily kitchen operations.</h2>
      </div>
    </section>
  </>;
}
