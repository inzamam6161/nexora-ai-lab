#!/usr/bin/env bash
set -euo pipefail

# Nexora AI Lab — Design 1 theme across the whole project
# Run from the root of the nexora-ai-lab repository:
#   bash apply-nexora-design1-theme.sh

if [[ ! -f "package.json" ]] || ! grep -q '"name": "nexora-ai-lab"' package.json; then
  echo "Error: run this script from the root of the nexora-ai-lab repository."
  exit 1
fi

echo "==> Applying Nexora Design 1 theme across the project"

mkdir -p src/components/layout src/pages src

cat > src/components/layout/AppShell.tsx <<'EOF'
import type { ReactNode } from "react";
import {
  BrainCircuit,
  Home,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { tools } from "../../data/tools";
import type { ToolRoute } from "../../app/toolRegistry";

type Props = {
  children: ReactNode;
  activeTool: ToolRoute;
  onNavigate: (tool: ToolRoute) => void;
};

export default function AppShell({
  children,
  activeTool,
  onNavigate,
}: Props) {
  const isHome = activeTool === "dashboard";

  return (
    <div className={`shell ${isHome ? "shell--home" : "shell--tool"}`}>
      <div className="shell__ambient shell__ambient--one" />
      <div className="shell__ambient shell__ambient--two" />

      <header className="shell__header">
        <button
          className="shell__brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="shell__brand-icon">
            <BrainCircuit size={22} />
          </span>

          <span className="shell__brand-copy">
            <strong>Nexora AI Lab</strong>
            <small>Local Intelligence Workspace</small>
          </span>
        </button>

        <nav className="shell__nav">
          <button
            className={isHome ? "is-active" : ""}
            onClick={() => onNavigate("dashboard")}
          >
            <Home size={15} />
            Home
          </button>

          <button
            className={!isHome ? "is-active" : ""}
            onClick={() => onNavigate("data-analyst")}
          >
            <LayoutGrid size={15} />
            Workspace
          </button>

          <button onClick={() => onNavigate("data-qa")}>
            <Sparkles size={15} />
            Ask Nexora
          </button>
        </nav>

        <button
          className="shell__cta"
          onClick={() =>
            onNavigate(isHome ? "data-analyst" : "dashboard")
          }
        >
          {isHome ? "Open Workspace" : "Back Home"}
        </button>
      </header>

      {!isHome && (
        <div className="shell__subnav">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                className={activeTool === tool.id ? "is-current" : ""}
                onClick={() => onNavigate(tool.id as ToolRoute)}
              >
                <Icon size={14} />
                <span>{tool.title}</span>
              </button>
            );
          })}
        </div>
      )}

      <main className="shell__content">{children}</main>
    </div>
  );
}
EOF

cat > src/pages/Dashboard.tsx <<'EOF'
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CircleDollarSign,
  FileText,
  Image,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TableProperties,
  TerminalSquare,
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
EOF

cat > src/index.css <<'EOF'
:root {
  --bg: #07101f;
  --bg-soft: #0a1428;
  --panel: rgba(8, 18, 37, 0.86);
  --panel-strong: rgba(9, 20, 41, 0.96);
  --panel-soft: rgba(13, 25, 48, 0.78);
  --line: rgba(119, 146, 213, 0.18);
  --line-strong: rgba(139, 166, 239, 0.3);
  --text: #f3f7ff;
  --muted: #a7b7d8;
  --muted-2: #7e91b7;
  --primary: #7a6cff;
  --primary-strong: #925bff;
  --primary-soft: rgba(122, 108, 255, 0.18);
  --cyan: #3fb8ff;
  --teal: #31d3b4;
  --orange: #f7a84f;
  --pink: #ff6ab3;
  --shadow: 0 18px 50px rgba(2, 7, 20, 0.48);
  --radius-xl: 28px;
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --max-width: 1320px;
  --font-stack: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-stack);
  color: var(--text);
  background:
    radial-gradient(circle at 18% 10%, rgba(74, 120, 255, 0.2), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(122, 108, 255, 0.22), transparent 24%),
    radial-gradient(circle at 50% 100%, rgba(42, 76, 163, 0.16), transparent 26%),
    linear-gradient(180deg, #08111f 0%, #050c17 50%, #071223 100%);
  background-attachment: fixed;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(circle at center, black 45%, transparent 100%);
  opacity: 0.24;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
  border: 0;
  background: transparent;
  color: inherit;
}

img {
  max-width: 100%;
  display: block;
}

.shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.shell__ambient {
  position: fixed;
  inset: auto;
  pointer-events: none;
  filter: blur(90px);
  opacity: 0.6;
  z-index: 0;
}

.shell__ambient--one {
  top: 72px;
  left: -40px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: rgba(84, 117, 255, 0.18);
}

.shell__ambient--two {
  right: -80px;
  top: 220px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: rgba(130, 80, 255, 0.16);
}

.shell__header,
.shell__subnav,
.shell__content {
  position: relative;
  z-index: 1;
}

.shell__header {
  width: min(calc(100% - 40px), var(--max-width));
  margin: 24px auto 12px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  border: 1px solid var(--line);
  background: rgba(6, 15, 30, 0.74);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.shell__brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #d7d4ff;
  background:
    linear-gradient(135deg, rgba(122, 108, 255, 0.24), rgba(63, 184, 255, 0.15));
  border: 1px solid rgba(135, 145, 255, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.shell__brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shell__brand-copy strong {
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.shell__brand-copy small {
  color: var(--muted);
  font-size: 0.86rem;
}

.shell__nav {
  display: inline-flex;
  justify-self: center;
  align-items: center;
  gap: 10px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(11, 20, 39, 0.88);
}

.shell__nav button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  color: var(--muted);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.shell__nav button:hover,
.shell__nav button.is-active {
  color: var(--text);
  background: rgba(122, 108, 255, 0.18);
}

.shell__nav button:hover {
  transform: translateY(-1px);
}

.shell__cta,
.primary-action,
.open-workspace {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  border: 1px solid rgba(158, 148, 255, 0.48);
  box-shadow:
    0 10px 24px rgba(108, 82, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shell__cta:hover,
.primary-action:hover,
.open-workspace:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 28px rgba(108, 82, 255, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.shell__subnav {
  width: min(calc(100% - 40px), var(--max-width));
  margin: 0 auto 12px;
  padding: 12px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  border: 1px solid var(--line);
  background: rgba(6, 15, 30, 0.68);
  backdrop-filter: blur(16px);
  border-radius: 18px;
}

.shell__subnav::-webkit-scrollbar {
  display: none;
}

.shell__subnav button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--muted);
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(15, 27, 50, 0.72);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.shell__subnav button:hover,
.shell__subnav button.is-current {
  color: var(--text);
  border-color: rgba(139, 166, 239, 0.26);
  background: rgba(122, 108, 255, 0.14);
}

.shell__content {
  width: min(calc(100% - 40px), var(--max-width));
  margin: 0 auto 32px;
  padding-bottom: 28px;
}

.dashboard {
  display: grid;
  gap: 26px;
  padding-top: 8px;
}

.hero,
.quick-examples,
.tools-section,
.dashboard-footer,
.work-hero,
.tool-intro,
.work-card,
.input-panel,
.result-panel,
.insight-view,
.social-input,
.social-preview-card,
.social-insights,
.result-section,
.dataset-preview,
[class*="chart"],
[class*="trend"],
[class*="anomaly"],
[class*="statistics"] {
  border: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(12, 22, 43, 0.96), rgba(8, 16, 30, 0.96));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.hero,
.quick-examples,
.tools-section,
.dashboard-footer {
  padding: 28px;
}

.hero {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 28px;
}

.eyebrow {
  display: inline-block;
  color: #8fb5ff;
  letter-spacing: 0.24em;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.hero__content h1 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 5rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.hero__content h1 span {
  color: #8f89ff;
}

.hero__lead {
  max-width: 620px;
  margin: 20px 0 0;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1.7;
}

.hero__features {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.hero__feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(11, 22, 42, 0.72);
}

.hero__feature svg {
  color: #92a8ff;
  flex-shrink: 0;
  margin-top: 2px;
}

.hero__feature strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.hero__feature small {
  color: var(--muted);
  line-height: 1.5;
}

.hero__command {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background:
    radial-gradient(circle at top right, rgba(122, 108, 255, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(11, 22, 45, 0.95), rgba(8, 16, 31, 0.95));
}

.hero__command-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__command-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(122, 108, 255, 0.16);
  color: #d8d4ff;
  border: 1px solid rgba(147, 140, 255, 0.24);
}

.hero__command-head h3 {
  margin: 0;
  font-size: 1.7rem;
}

.hero__command-head p {
  margin: 4px 0 0;
  color: var(--muted);
}

.command-input {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  color: var(--muted);
  border: 1px solid rgba(133, 156, 225, 0.22);
  background: rgba(6, 14, 27, 0.9);
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.command-input:hover {
  border-color: rgba(147, 140, 255, 0.4);
  transform: translateY(-1px);
}

.command-input svg {
  color: #d8d4ff;
  flex-shrink: 0;
}

.command-chips,
.status-pills,
.crop-tabs,
.work-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.command-chips button,
.status-pills span,
.example-action,
.quiet-action,
.crop-tabs button,
.filter-bar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  color: var(--muted);
  border: 1px solid rgba(127, 150, 214, 0.18);
  background: rgba(14, 24, 46, 0.82);
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.command-chips button:hover,
.example-action:hover,
.quiet-action:hover,
.crop-tabs button:hover,
.filter-bar button:hover {
  color: var(--text);
  border-color: rgba(147, 140, 255, 0.35);
  background: rgba(122, 108, 255, 0.12);
}

.status-pills span {
  color: #97add4;
  font-size: 0.88rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.section-header h2,
.work-hero h1,
.tool-intro h1,
.tool-intro h2,
.result-section h3,
.insight-view h3 {
  margin: 0;
  letter-spacing: -0.03em;
}

.section-header p,
.work-hero p,
.tool-intro p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.section-header--split {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.quick-examples__grid,
.tool-grid {
  display: grid;
  gap: 18px;
}

.quick-examples__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(11, 22, 43, 0.8);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.quick-card:hover,
.tool-card:hover {
  transform: translateY(-4px);
  border-color: rgba(147, 140, 255, 0.35);
  background: rgba(13, 25, 49, 0.95);
}

.quick-card__icon,
.tool-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #d8d4ff;
  background:
    linear-gradient(135deg, rgba(122, 108, 255, 0.22), rgba(63, 184, 255, 0.1));
  border: 1px solid rgba(145, 152, 255, 0.22);
}

.quick-card__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-card__copy strong {
  font-size: 1rem;
}

.quick-card__copy small {
  color: var(--muted);
}

.quick-card > svg:last-child {
  margin-left: auto;
  color: #c8d0ff;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-bar button.is-active {
  color: white;
  border-color: rgba(160, 149, 255, 0.42);
  background: linear-gradient(135deg, rgba(122, 108, 255, 0.36), rgba(60, 123, 255, 0.18));
}

.tool-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.tool-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: rgba(12, 22, 43, 0.82);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.tool-card__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.tool-card__head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.tool-card__head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.tool-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.tool-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #bfd4ff;
  border: 1px solid rgba(127, 150, 214, 0.24);
  background: rgba(14, 24, 46, 0.84);
  white-space: nowrap;
}

.tool-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.tool-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #8fb5ff;
  font-size: 0.9rem;
}

.tool-card__open {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d4d9ff;
  font-weight: 600;
}

.dashboard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 22px;
  padding-bottom: 22px;
}

.dashboard-footer__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d8dfff;
}

.dashboard-footer__brand small {
  display: block;
  color: var(--muted);
  margin-top: 3px;
}

.dashboard-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.dashboard-footer__links button {
  color: var(--muted);
}

.dashboard-footer__links button:hover {
  color: var(--text);
}

.work-page,
.tool-workspace {
  display: grid;
  gap: 22px;
  padding-top: 8px;
}

.work-back,
.tool-workspace__back {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: var(--muted);
  border-radius: 999px;
  border: 1px solid rgba(127, 150, 214, 0.2);
  background: rgba(12, 22, 43, 0.74);
}

.work-back:hover,
.tool-workspace__back:hover {
  color: var(--text);
  border-color: rgba(147, 140, 255, 0.35);
}

.work-hero,
.tool-intro {
  padding: 24px 26px;
}

.work-grid,
.tool-workspace__grid,
.social-layout {
  display: grid;
  gap: 22px;
}

.work-grid,
.tool-workspace__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.social-layout {
  grid-template-columns: 1.2fr 1fr;
}

.work-card,
.input-panel,
.result-panel,
.social-input,
.social-preview-card,
.social-insights,
.insight-view,
.dataset-preview,
[class*="statistics"],
[class*="chart"],
[class*="trend"],
[class*="anomaly"] {
  padding: 22px;
}

.work-card__head,
.result-panel__head,
.insight-view__header,
.tool-intro__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.work-empty {
  padding: 18px;
  color: var(--muted);
  border: 1px dashed rgba(127, 150, 214, 0.24);
  border-radius: 18px;
  background: rgba(9, 18, 36, 0.5);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.metric-grid > div {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(13, 24, 48, 0.8);
}

.metric-grid strong {
  display: block;
  font-size: 1.35rem;
  margin-bottom: 6px;
}

.metric-grid span {
  color: var(--muted);
  font-size: 0.92rem;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

input[type="text"],
input[type="file"],
input[type="search"],
input[type="number"],
textarea,
select,
.context-input {
  width: 100%;
  padding: 14px 16px;
  color: var(--text);
  border-radius: 16px;
  border: 1px solid rgba(127, 150, 214, 0.18);
  background: rgba(7, 15, 28, 0.9);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

textarea {
  min-height: 160px;
  resize: vertical;
  line-height: 1.6;
}

input:focus,
textarea:focus,
select:focus {
  border-color: rgba(147, 140, 255, 0.45);
  box-shadow: 0 0 0 3px rgba(122, 108, 255, 0.16);
}

input::placeholder,
textarea::placeholder {
  color: #7890be;
}

input[type="range"] {
  width: 100%;
}

.image-picker,
.file-dropzone,
[class*="dropzone"] {
  display: grid;
  gap: 8px;
  padding: 20px;
  border-radius: 18px;
  border: 1px dashed rgba(127, 150, 214, 0.24);
  background: rgba(10, 18, 36, 0.74);
  color: var(--muted);
}

.image-picker b,
.file-dropzone b {
  color: var(--text);
}

.result-stack,
.insight-list {
  display: grid;
  gap: 16px;
}

.result-section {
  padding: 18px;
}

.result-section h3 {
  margin-bottom: 10px;
}

.result-section p {
  margin: 0 0 10px;
  color: var(--muted);
  line-height: 1.65;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(127, 150, 214, 0.18);
}

th,
td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(127, 150, 214, 0.12);
}

th {
  color: var(--text);
  background: rgba(13, 24, 48, 0.9);
}

td {
  color: var(--muted);
  background: rgba(7, 15, 28, 0.78);
}

.palette {
  display: flex;
  gap: 10px;
  margin: 14px 0;
}

.palette i {
  width: 28px;
  height: 28px;
  display: inline-block;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.instagram-preview {
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(127, 150, 214, 0.18);
  background: rgba(8, 16, 31, 0.94);
}

.ig-head,
.ig-actions,
.ig-copy {
  padding: 14px 16px;
}

.ig-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ig-avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary), var(--pink));
  font-size: 0.9rem;
  font-weight: 700;
}

.ig-head b {
  margin-right: auto;
}

.ig-copy p {
  color: var(--muted);
  line-height: 1.6;
}

.truth-note {
  display: block;
  margin-top: 10px;
  color: var(--muted);
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .hero,
  .tool-grid,
  .quick-examples__grid,
  .work-grid,
  .tool-workspace__grid,
  .social-layout {
    grid-template-columns: 1fr;
  }

  .section-header--split,
  .dashboard-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 920px) {
  .shell__header {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .shell__nav {
    justify-self: start;
    flex-wrap: wrap;
  }

  .hero__features {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .shell__content,
  .shell__header,
  .shell__subnav {
    width: min(calc(100% - 24px), var(--max-width));
  }

  .hero,
  .quick-examples,
  .tools-section,
  .dashboard-footer,
  .work-hero,
  .tool-intro,
  .work-card,
  .input-panel,
  .result-panel,
  .social-input,
  .social-preview-card,
  .social-insights {
    padding: 18px;
  }

  .hero__content h1 {
    font-size: 2.5rem;
  }

  .tool-card {
    grid-template-columns: 1fr;
  }

  .tool-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .command-input {
    align-items: flex-start;
  }
}
EOF

echo "==> Running lint"
npm run lint

echo "==> Running tests"
npm test

echo "==> Running production build"
npm run build

echo
echo "============================================================"
echo "Nexora Design 1 theme has been applied."
echo
echo "Next:"
echo "  git status"
echo "  git diff"
echo
echo "If everything looks good:"
echo '  git add -A'
echo '  git commit -m "Apply Design 1 theme across Nexora project"'
echo '  git push'
echo "============================================================"
