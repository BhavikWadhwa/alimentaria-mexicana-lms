import { Info, Lightbulb } from "lucide-react";

export function SourceCitation({organization,title,date,methodology,url}:{organization:string;title:string;date:string;methodology:string;url:string}){
  return <div className="source-citation"><Info size={17}/><div><strong>Source: {organization}.</strong> <a href={url} target="_blank" rel="noreferrer">{title}</a> · {date}<br/><span>{methodology}</span></div></div>;
}
export function DemoDataBadge(){return <span className="demo-data-badge">Illustrative demo data</span>}
export function DemoNotice(){return <aside className="demo-notice"><strong>Demo environment:</strong> Public menu information is based on Alimentaria Mexicana&apos;s publicly available menu. Sales, ingredient costs, employee information, waste, recipes and profitability figures are fictional.</aside>}
export function MetricCard({label,value,detail}:{label:string;value:string;detail?:string}){return <article className="metric-card"><span>{label}</span><strong>{value}</strong>{detail&&<small>{detail}</small>}</article>}
export function InsightCard({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}){return <article className="insight-card"><Lightbulb/><div><strong>{title}</strong><p>{children}</p>{action}</div></article>}
