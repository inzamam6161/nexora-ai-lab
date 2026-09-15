import { useState } from "react";
import { ArrowLeft, Download, Play, Sparkles } from "lucide-react";

type Mode = "document-intelligence" | "resume-analyzer" | "meeting-intelligence" | "log-analyzer";

type Props = { mode: Mode; onBack: () => void };

type Output = { title: string; items: string[] }[];

const config: Record<Mode, { title: string; eyebrow: string; description: string; first: string; second?: string; action: string }> = {
  "document-intelligence": { title: "Document Intelligence", eyebrow: "TEXT INTELLIGENCE", description: "Pull the useful parts out of long text without sending it anywhere.", first: "Paste document text", action: "Analyze document" },
  "resume-analyzer": { title: "Resume ↔ Job Analyzer", eyebrow: "CAREER INTELLIGENCE", description: "Compare a resume with a job description and see the overlap clearly.", first: "Paste resume", second: "Paste job description", action: "Compare" },
  "meeting-intelligence": { title: "Meeting Intelligence", eyebrow: "WORK INTELLIGENCE", description: "Turn rough meeting notes into decisions and next actions.", first: "Paste transcript or notes", action: "Process notes" },
  "log-analyzer": { title: "Developer Log Analyzer", eyebrow: "DEVELOPER INTELLIGENCE", description: "Group repeated errors and surface the noisy parts of application logs.", first: "Paste application logs", action: "Analyze logs" },
};

export default function IntelligencePage({ mode, onBack }: Props) {
  const meta = config[mode];
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [output, setOutput] = useState<Output | null>(null);

  async function loadExample() {
    const files: Record<Mode, [string, string?]> = {
      "document-intelligence": ["/examples/project-proposal.txt"],
      "resume-analyzer": ["/examples/sample-resume.txt", "/examples/mobile-engineer-job.txt"],
      "meeting-intelligence": ["/examples/product-meeting.txt"],
      "log-analyzer": ["/examples/application-errors.log"],
    };
    const [firstPath, secondPath] = files[mode];
    const firstText = await fetch(firstPath).then(r => r.text());
    setFirst(firstText);
    if (secondPath) setSecond(await fetch(secondPath).then(r => r.text()));
    setOutput(null);
  }

  function run() {
    if (!first.trim()) return;
    if (mode === "document-intelligence") setOutput(analyzeDocument(first));
    if (mode === "resume-analyzer") setOutput(analyzeResume(first, second));
    if (mode === "meeting-intelligence") setOutput(analyzeMeeting(first));
    if (mode === "log-analyzer") setOutput(analyzeLogs(first));
  }

  function exportResult() {
    if (!output) return;
    const text = output.map(section => `${section.title}\n${section.items.map(x => `- ${x}`).join("\n")}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `${mode}-result.txt`; a.click(); URL.revokeObjectURL(url);
  }

  return <section className="work-page">
    <button className="work-back" onClick={onBack}><ArrowLeft size={15}/> Back</button>
    <header className="work-hero"><span className="eyebrow">{meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.description}</p></header>
    <div className="work-grid">
      <section className="work-card"><span className="eyebrow">INPUT</span><label>{meta.first}</label><textarea value={first} onChange={e=>setFirst(e.target.value)} placeholder={samplePlaceholder(mode)} />
        {meta.second && <><label>{meta.second}</label><textarea value={second} onChange={e=>setSecond(e.target.value)} placeholder="Paste the role requirements here…" /></>}
        <div className="work-actions"><button className="primary-action" onClick={run} disabled={!first.trim()}><Play size={14}/>{meta.action}</button><button className="example-action" onClick={loadExample}><Sparkles size={14}/> Load example</button></div>
      </section>
      <section className="work-card"><div className="work-card__head"><span className="eyebrow">RESULT</span>{output && <button className="quiet-action" onClick={exportResult}><Download size={13}/> Export</button>}</div>
        {!output ? <div className="work-empty">Your result will appear here.</div> : <div className="result-stack">{output.map(section=><div className="result-section" key={section.title}><h3>{section.title}</h3>{section.items.map((item,i)=><p key={i}>{item}</p>)}</div>)}</div>}
      </section>
    </div>
  </section>;
}

function sentences(text:string){ return text.replace(/\s+/g," ").split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>20); }
function words(text:string){ return text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []; }
function topKeywords(text:string, n=8){ const stop=new Set(["the","and","for","with","that","this","from","have","will","your","you","are","was","were","into","our","but","not","can","has","had","about"]); const counts=new Map<string,number>(); for(const w of words(text)){if(!stop.has(w))counts.set(w,(counts.get(w)??0)+1)} return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([w,c])=>`${w} · ${c}`); }
function analyzeDocument(text:string):Output { const s=sentences(text); return [{title:"Summary",items:(s.slice(0,2).length?s.slice(0,2):[text.slice(0,260)])},{title:"Key terms",items:topKeywords(text)},{title:"Document shape",items:[`${words(text).length} words`,`${s.length} substantial sentences`]}]; }
function skills(text:string){ const known=["react native","react","typescript","javascript","swift","kotlin","ios","android","node.js","node","mongodb","sql","aws","redux","graphql","rest","git","ci/cd","docker","testing","jest","figma","firebase"]; const lower=text.toLowerCase(); return known.filter(s=>lower.includes(s)); }
function analyzeResume(resume:string,jd:string):Output { const have=skills(resume), wanted=skills(jd), matched=wanted.filter(x=>have.includes(x)), missing=wanted.filter(x=>!have.includes(x)); const score=wanted.length?Math.round(matched.length/wanted.length*100):0; return [{title:"Match",items:[`${score}% skill overlap`,`${matched.length} of ${wanted.length} detected requirements matched`]},{title:"Strong matches",items:matched.length?matched:["No explicit skill matches detected"]},{title:"Gaps to address",items:missing.length?missing:["No obvious technical gaps detected"]},{title:"Resume signals",items:[`${words(resume).length} words`,`${have.length} recognized technical skills`]}]; }
function analyzeMeeting(text:string):Output { const s=sentences(text); const actions=s.filter(x=>/\b(will|need to|action|todo|follow up|owner|by (monday|tuesday|wednesday|thursday|friday|tomorrow|next))\b/i.test(x)); const decisions=s.filter(x=>/\b(decided|agreed|approved|choose|chosen|final|decision)\b/i.test(x)); return [{title:"Quick summary",items:s.slice(0,3).length?s.slice(0,3):[text.slice(0,260)]},{title:"Decisions",items:decisions.length?decisions:["No explicit decisions detected"]},{title:"Action items",items:actions.length?actions:["No explicit action items detected"]},{title:"Topics",items:topKeywords(text,6)}]; }
function analyzeLogs(text:string):Output { const lines=text.split(/\r?\n/).filter(Boolean); const bad=lines.filter(x=>/error|exception|fatal|failed|warn/i.test(x)); const normalized=bad.map(x=>x.replace(/^.*?(error|exception|fatal|failed|warn)[:\s-]*/i,"$1: ").replace(/\b\d+\b/g,"#").slice(0,160)); const counts=new Map<string,number>(); normalized.forEach(x=>counts.set(x,(counts.get(x)??0)+1)); const groups=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([x,c])=>`${c}× ${x}`); return [{title:"Overview",items:[`${lines.length} log lines scanned`,`${bad.length} warning/error lines found`]},{title:"Recurring patterns",items:groups.length?groups:["No obvious error patterns detected"]},{title:"Next check",items:[bad.length?"Start with the highest-frequency pattern and inspect the first occurrence in context.":"No action needed from the supplied log sample."]}]; }
function samplePlaceholder(mode:Mode){ if(mode==="log-analyzer") return "Paste logs here…"; if(mode==="meeting-intelligence") return "Paste meeting notes or a transcript…"; if(mode==="resume-analyzer") return "Paste resume text here…"; return "Paste document text here…"; }
