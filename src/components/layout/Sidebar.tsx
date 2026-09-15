import {
  House,
  Sparkles,
} from "lucide-react";

import {
  tools,
} from "../../data/tools";

import type {
  ToolRoute,
} from "../../app/toolRegistry";

type SidebarProps = {
  activeTool: ToolRoute;
  onNavigate: (tool: ToolRoute) => void;
};

export default function Sidebar({
  activeTool,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Sparkles size={20} />
        </div>

        <div className="sidebar__brand-text">
          <strong>Nexora</strong>
          <span>AI Lab</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <button
          type="button"
          className={
            activeTool === "dashboard"
              ? "sidebar__item sidebar__item--active"
              : "sidebar__item"
          }
          onClick={() =>
            onNavigate("dashboard")
          }
        >
          <House size={18} />
          <span>Dashboard</span>
        </button>

        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <button
              key={tool.id}
              type="button"
              className={
                activeTool === tool.id
                  ? "sidebar__item sidebar__item--active"
                  : "sidebar__item"
              }
              onClick={() =>
                onNavigate(
                  tool.id as ToolRoute
                )
              }
            >
              <Icon size={18} />
              <span>{tool.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <span>
          Local-first intelligence
        </span>

        <small>
          No paid AI APIs
        </small>
      </div>
    </aside>
  );
}