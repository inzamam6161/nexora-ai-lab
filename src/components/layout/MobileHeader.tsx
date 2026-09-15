import {
  Menu,
  Sparkles,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  tools,
} from "../../data/tools";

import type {
  ToolRoute,
} from "../../app/toolRegistry";

type MobileHeaderProps = {
  activeTool: ToolRoute;
  onNavigate: (tool: ToolRoute) => void;
};

export default function MobileHeader({
  activeTool,
  onNavigate,
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  function handleNavigate(
    tool: ToolRoute
  ) {
    onNavigate(tool);
    setIsOpen(false);
  }

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-header__brand">
          <div className="mobile-header__logo">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>Nexora</strong>
            <span>AI Lab</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-header__menu"
          aria-label="Open navigation"
          onClick={() =>
            setIsOpen(true)
          }
        >
          <Menu size={22} />
        </button>
      </header>

      {isOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__header">
            <strong>Tools</strong>

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() =>
                setIsOpen(false)
              }
            >
              <X size={22} />
            </button>
          </div>

          <nav className="mobile-menu__nav">
            <button
              type="button"
              className={
                activeTool === "dashboard"
                  ? "mobile-menu__item mobile-menu__item--active"
                  : "mobile-menu__item"
              }
              onClick={() =>
                handleNavigate(
                  "dashboard"
                )
              }
            >
              Dashboard
            </button>

            {tools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className={
                  activeTool === tool.id
                    ? "mobile-menu__item mobile-menu__item--active"
                    : "mobile-menu__item"
                }
                onClick={() =>
                  handleNavigate(
                    tool.id as ToolRoute
                  )
                }
              >
                {tool.title}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}