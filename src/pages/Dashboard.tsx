import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Workflow,
} from "lucide-react";
import { tools } from "../data/tools";
import type { ToolRoute } from "../app/toolRegistry";

type Props = {
  onNavigate: (tool: ToolRoute) => void;
};

export default function Dashboard({ onNavigate }: Props) {
  const open = (id: string) => onNavigate(id as ToolRoute);

  return (
    <section className="nexora-home nexora-home--final">
      <div className="nexora-home__stars" />

      <header className="nexora-topbar">
        <button
          className="nexora-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="nexora-brand__mark">
            <BrainCircuit size={22} />
          </span>
          <span>
            <strong>Nexora AI Lab</strong>
            <small>Analyze · Understand · Create</small>
          </span>
        </button>

        <nav>
          <button className="is-active">Home</button>
          <button onClick={() => open("data-analyst")}>Workspace</button>
        </nav>

        <div className="nexora-topbar__actions">
          <button
            className="open-workspace"
            onClick={() => open("data-analyst")}
          >
            Open Workspace <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <div className="nexora-stage">
        <section className="nexora-intro nexora-intro--final">
          <span className="eyebrow">
            LOCAL-FIRST INTELLIGENCE. REAL-WORLD VALUE.
          </span>
          <h1>
            What will you <em>explore</em> today?
          </h1>
          <p>
            Nine practical intelligence tools. One workspace.
            <br />
            Turn information into clarity with transparent browser-side
            processing.
          </p>

          <div className="nexora-principles">
            <span>◈ Private & Local</span>
            <span>ϟ Transparent Analysis</span>
            <span>◇ Built for Real Work</span>
          </div>
        </section>

        <div className="capability-map capability-map--final">
          <div className="capability-map__rings" />

          <div className="nexora-core nexora-core--final">
            <span className="nexora-core__icon">
              <BrainCircuit size={54} />
            </span>
            <strong>NEXORA AI</strong>
            <small>LOCAL · DATA · ACTION</small>
            <em>
              Practical tools.
              <br />
              Clear outputs.
            </em>
          </div>

          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                className={`orbit-tool orbit-tool--${index + 1}`}
                onClick={() => open(tool.id)}
              >
                <span className="orbit-tool__icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>{tool.title}</strong>
                  <small>{tool.shortDescription}</small>
                </span>
                <ArrowRight className="orbit-tool__arrow" size={14} />
              </button>
            );
          })}
        </div>

        <aside className="nexora-sidecards nexora-sidecards--final">
          <section>
            <div className="sidecard-title">
              <Workflow size={15} />
              <strong>Example workflows</strong>
            </div>
            <button onClick={() => open("data-analyst")}>
              Sales dataset → trends & anomalies <ArrowRight size={12} />
            </button>
            <button onClick={() => open("resume-analyzer")}>
              Resume + role → skill overlap <ArrowRight size={12} />
            </button>
            <button onClick={() => open("meeting-intelligence")}>
              Meeting notes → decisions & actions <ArrowRight size={12} />
            </button>
            <button onClick={() => open("social-post-studio")}>
              Photo → local image treatment <ArrowRight size={12} />
            </button>
          </section>

          <section>
            <div className="sidecard-title">
              <Lightbulb size={15} />
              <strong>Ideas for you</strong>
            </div>
            <button onClick={() => open("data-analyst")}>
              “Analyze my sales data” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("dataset-cleaner")}>
              “Clean this messy dataset” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("log-analyzer")}>
              “Find repeated app errors” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("social-post-studio")}>
              “Prepare a social post” <ArrowRight size={12} />
            </button>
          </section>
        </aside>

        <div className="nexora-dock">
          <div className="nexora-command">
            <Sparkles size={16} />
            <span>Ask a question about your data...</span>
            <button
              aria-label="Open Data Q&A"
              onClick={() => open("data-qa")}
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="nexora-quick">
            <button onClick={() => open("data-analyst")}>
              Analyze my data
            </button>
            <button onClick={() => open("document-intelligence")}>
              Summarize text
            </button>
            <button onClick={() => open("resume-analyzer")}>
              Check my resume
            </button>
            <button onClick={() => open("expense-intelligence")}>
              Understand expenses
            </button>
            <button onClick={() => open("social-post-studio")}>
              Prepare a social post
            </button>
          </div>
        </div>

        <div className="nexora-status">
          <CheckCircle2 size={12} /> Local engines ready
          <span>Portfolio build</span>
        </div>
      </div>
    </section>
  );
}
