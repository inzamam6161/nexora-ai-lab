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
