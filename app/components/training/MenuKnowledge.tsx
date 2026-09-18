"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { publicMenu, menuMetadata } from "../../data/alimentaria-menu";

const coldItems=publicMenu.filter(item=>["guacamole","beet-ceviche","shrimp-ceviche","hamachi"].includes(item.id));
const questions=[
  {prompt:"Which section contains Beef Birria?",options:["Mains","Tacos","To Share"],answer:"Tacos"},
  {prompt:"What is the public listed price of Guacamole?",options:["$12","$15","$18"],answer:"$15"},
  {prompt:"Which item lists slow-braised beef and birria consomé?",options:["Beef Birria","Highway Chicken","Grilled Bavette"],answer:"Beef Birria"},
];
export function MenuKnowledge(){const [answers,setAnswers]=useState<Record<number,string>>({});return <><div className="section-head"><div><p className="eyebrow" style={{color:"var(--chilli)"}}>Cold Station · Menú</p><h1 className="display">Menu Knowledge</h1><p className="muted">Learn public-facing menu details connected to your assigned station.</p></div><span className="tag">Public menu knowledge</span></div><aside className="demo-notice"><strong>Source:</strong> {menuMetadata.menuSource}. Public names, descriptions, categories and prices only. Any private recipe must be replaced with the restaurant&apos;s approved SOP.</aside><div className="knowledge-grid">{coldItems.map(item=><article className="card knowledge-card" key={item.id}><p className="eyebrow muted">{item.category}</p><h2 className="display">{item.name}</h2><strong>{item.priceDisplay}</strong><p>{item.description}</p><span className="tag">Cold Station</span></article>)}</div><section className="panel knowledge-quiz"><p className="eyebrow muted">Quick knowledge check</p><h2 className="panel-title">Can you find it on the menu?</h2>{questions.map((question,index)=><fieldset key={question.prompt}><legend>{index+1}. {question.prompt}</legend>{question.options.map(option=><button className={`answer ${answers[index]===option?(option===question.answer?"correct":"incorrect"):""}`} key={option} onClick={()=>setAnswers({...answers,[index]:option})}>{option}{answers[index]===option&&option===question.answer&&<CheckCircle2 size={18}/>}</button>)}</fieldset>)}</section></>}
