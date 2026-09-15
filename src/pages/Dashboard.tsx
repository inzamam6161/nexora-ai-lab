import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, Lightbulb, MoonStar, Sparkles } from "lucide-react";
import { tools } from "../data/tools";
import type { ToolRoute } from "../app/toolRegistry";

type Props = { onNavigate: (tool: ToolRoute) => void };

export default function Dashboard({ onNavigate }: Props) {
  const open = (id: string) => onNavigate(id as ToolRoute);

  return <section className="nexora-home nexora-home--final">
    <div className="nexora-home__stars" />
    <header className="nexora-topbar">
      <button className="nexora-brand" onClick={() => onNavigate("dashboard")}>
        <span className="nexora-brand__mark"><BrainCircuit size={22} /></span>
        <span><strong>Nexora AI Lab</strong><small>Analyze · Understand · Create</small></span>
      </button>
      <nav><button className="is-active">Home</button><button onClick={() => open("data-analyst")}>Workspace</button><button>About</button></nav>
      <div className="nexora-topbar__actions"><button className="icon-action" aria-label="Theme"><MoonStar size={17} /></button><button className="open-workspace" onClick={() => open("data-analyst")}>Open Workspace <ArrowRight size={15} /></button></div>
    </header>

    <div className="nexora-stage">
      <section className="nexora-intro nexora-intro--final">
        <span className="eyebrow">YOUR AI TOOLKIT. REAL WORLD VALUE.</span>
        <h1>What will you <em>explore</em> today?</h1>
        <p>Nine powerful AI tools. One workspace.<br />Turn your information into clarity.</p>
        <div className="nexora-principles"><span>◈ Private & Local</span><span>ϟ Practical AI</span><span>◇ Built for Real Work</span></div>
      </section>

      <div className="capability-map capability-map--final">
        <div className="capability-map__rings" />
        <div className="nexora-core nexora-core--final"><span className="nexora-core__icon"><BrainCircuit size={54} /></span><strong>NEXORA AI</strong><small>DATA · IDEAS · ACTION</small><em>A smarter way<br/>to work.</em></div>
        {tools.map((tool, index) => { const Icon = tool.icon; return <button key={tool.id} className={`orbit-tool orbit-tool--${index + 1}`} onClick={() => open(tool.id)}><span className="orbit-tool__icon"><Icon size={22} /></span><span><strong>{tool.title}</strong><small>{tool.shortDescription}</small></span><ArrowRight className="orbit-tool__arrow" size={14} /></button>; })}
      </div>

      <aside className="nexora-sidecards nexora-sidecards--final">
        <section><div className="sidecard-title"><Clock3 size={15} /><strong>Recent activity</strong></div><p>Sales Data Analysis <small>2 hours ago</small></p><p>Resume Analysis <small>5 hours ago</small></p><p>Q3 Expenses <small>1 day ago</small></p><p>Meeting Summary <small>2 days ago</small></p></section>
        <section><div className="sidecard-title"><Lightbulb size={15} /><strong>Ideas for you</strong></div><button onClick={() => open("data-analyst")}>“Analyze my sales data” <ArrowRight size={12}/></button><button onClick={() => open("dataset-cleaner")}>“Clean this messy dataset” <ArrowRight size={12}/></button><button onClick={() => open("log-analyzer")}>“Find repeated app errors” <ArrowRight size={12}/></button><button onClick={() => open("social-post-studio")}>“Prepare a social post” <ArrowRight size={12}/></button></section>
      </aside>

      <div className="nexora-dock">
        <div className="nexora-command"><Sparkles size={16}/><span>Ask anything or choose a tool...</span><button onClick={() => open("data-qa")}><ArrowRight size={18}/></button></div>
        <div className="nexora-quick"><button onClick={() => open("data-analyst")}>Analyze my data</button><button onClick={() => open("document-intelligence")}>Summarize a document</button><button onClick={() => open("resume-analyzer")}>Check my resume</button><button onClick={() => open("expense-intelligence")}>Find unusual expenses</button><button onClick={() => open("social-post-studio")}>Create a social post</button></div>
      </div>
      <div className="nexora-status"><CheckCircle2 size={12}/> All Systems Ready <span>v1.0</span></div>
    </div>
  </section>;
}
