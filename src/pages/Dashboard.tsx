import { useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Image,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { tools } from "../data/tools";
import type { ToolRoute } from "../app/toolRegistry";

type Props = {
  onNavigate: (tool: ToolRoute) => void;
};

type Filter = "all" | "data" | "documents" | "productivity" | "media";

type CategoryMeta = {
  label: string;
  badge: string;
  icon: LucideIcon;
};

const CATEGORY_META: Record<Exclude<Filter, "all">, CategoryMeta> = {
  data: {
    label: "Data",
    badge: "DATA",
    icon: TableProperties,
  },
  documents: {
    label: "Documents",
    badge: "DOCUMENTS",
    icon: FileText,
  },
  productivity: {
    label: "Productivity",
    badge: "PRODUCTIVITY",
    icon: Workflow,
  },
  media: {
    label: "Media",
    badge: "MEDIA",
    icon: Image,
  },
};

const TOOL_CATEGORIES: Record<string, Exclude<Filter, "all">> = {
  "data-analyst": "data",
  "dataset-cleaner": "data",
  "data-qa": "data",
  "expense-intelligence": "data",
  "document-intelligence": "documents",
  "resume-analyzer": "documents",
  "meeting-intelligence": "productivity",
  "log-analyzer": "productivity",
  "social-post-studio": "media",
};

export default function Dashboard({ onNavigate }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredTools = useMemo(
    () =>
      filter === "all"
        ? tools
        : tools.filter(
            (tool) => TOOL_CATEGORIES[tool.id] === filter
          ),
    [filter]
  );

  const quickExamples = [
    {
      title: "Sales analysis",
      subtitle: "CSV → Trends → Anomalies",
      tool: "data-analyst" as ToolRoute,
      icon: TableProperties,
    },
    {
      title: "Resume match",
      subtitle: "Resume + Job → Skill gaps",
      tool: "resume-analyzer" as ToolRoute,
      icon: FileText,
    },
    {
      title: "Social post",
      subtitle: "Image → Analysis → Export",
      tool: "social-post-studio" as ToolRoute,
      icon: Image,
    },
  ];

  return (
    <section className="dashboard">
      <section className="hero">
        <div className="hero__content">
          <span className="eyebrow">LOCAL-FIRST INTELLIGENCE</span>

          <h1>
            Turn information
            <br />
            into <span>insight.</span>
          </h1>

          <p className="hero__lead">
            Analyze data, documents, expenses, logs and images
            directly in your browser. Nine practical tools, one
            workspace.
          </p>

          <div className="hero__features">
            <div className="hero__feature">
              <ShieldCheck size={18} />
              <div>
                <strong>Private & Local</strong>
                <small>Your data stays in your browser.</small>
              </div>
            </div>

            <div className="hero__feature">
              <Zap size={18} />
              <div>
                <strong>No Paid API</strong>
                <small>Browser-first processing.</small>
              </div>
            </div>

            <div className="hero__feature">
              <BrainCircuit size={18} />
              <div>
                <strong>Built for Real Work</strong>
                <small>Practical tools, clear outputs.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero__command">
          <div className="hero__command-head">
            <span className="hero__command-mark">
              <Sparkles size={18} />
            </span>

            <div>
              <h3>Ask Nexora</h3>
              <p>What would you like to work with today?</p>
            </div>
          </div>

          <button
            className="command-input"
            onClick={() => onNavigate("data-qa")}
          >
            <span>
              Ask a question about your data, documents, or ideas...
            </span>
            <ArrowRight size={18} />
          </button>

          <div className="command-chips">
            <button onClick={() => onNavigate("data-analyst")}>
              Analyze my sales data
            </button>
            <button onClick={() => onNavigate("dataset-cleaner")}>
              Clean this dataset
            </button>
            <button onClick={() => onNavigate("resume-analyzer")}>
              Check my resume
            </button>
            <button
              onClick={() => onNavigate("document-intelligence")}
            >
              Summarize a document
            </button>
            <button
              onClick={() => onNavigate("social-post-studio")}
            >
              Prepare a social post
            </button>
          </div>

          <div className="status-pills">
            <span>Runs locally in your browser</span>
            <span>React + TypeScript</span>
            <span>Portfolio build</span>
          </div>
        </div>
      </section>

      <section className="quick-examples">
        <div className="section-header">
          <div>
            <span className="eyebrow">QUICK EXAMPLES</span>
            <h2>Start with a proven workflow</h2>
          </div>
        </div>

        <div className="quick-examples__grid">
          {quickExamples.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="quick-card"
                onClick={() => onNavigate(item.tool)}
              >
                <span className="quick-card__icon">
                  <Icon size={18} />
                </span>

                <div className="quick-card__copy">
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>

                <ArrowRight size={16} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="tools-section">
        <div className="section-header section-header--split">
          <div>
            <h2>Explore Our Tools</h2>
            <p>
              Nine practical tools for real-world tasks. All
              processed locally in your browser.
            </p>
          </div>

          <div className="filter-bar">
            {(["all", "data", "documents", "productivity", "media"] as const).map(
              (item) => (
                <button
                  key={item}
                  className={filter === item ? "is-active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item === "all"
                    ? "All Tools"
                    : CATEGORY_META[item].label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="tool-grid">
          {filteredTools.map((tool) => {
            const category = TOOL_CATEGORIES[tool.id];
            const meta = CATEGORY_META[category];
            const Icon = tool.icon;

            return (
              <article className="tool-card" key={tool.id}>
                <div className="tool-card__icon">
                  <Icon size={24} />
                </div>

                <div className="tool-card__body">
                  <div className="tool-card__head">
                    <h3>{tool.title}</h3>
                    <span className="tool-tag">{meta.badge}</span>
                  </div>

                  <p>{tool.shortDescription}</p>

                  <div className="tool-card__footer">
                    <span className="tool-card__meta">
                      <meta.icon size={14} />
                      {meta.label}
                    </span>

                    <button
                      className="tool-card__open"
                      onClick={() =>
                        onNavigate(tool.id as ToolRoute)
                      }
                    >
                      Open
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="dashboard-footer">
        <div className="dashboard-footer__brand">
          <BrainCircuit size={18} />
          <div>
            <strong>Nexora AI Lab</strong>
            <small>Local • Private • Practical</small>
          </div>
        </div>

        <div className="dashboard-footer__links">
          <button onClick={() => onNavigate("document-intelligence")}>
            Documentation
          </button>
          <button onClick={() => onNavigate("data-qa")}>
            Ask Nexora
          </button>
          <button onClick={() => onNavigate("data-analyst")}>
            Workspace
          </button>
        </div>
      </footer>
    </section>
  );
}
