import {
  ArrowRight,
  Check,
} from "lucide-react";

import type {
  ToolDefinition,
} from "../../data/tools";

type ToolCardProps = {
  tool: ToolDefinition;
  onOpen: () => void;
};

export default function ToolCard({
  tool,
  onOpen,
}: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <article className="tool-card">
      <div className="tool-card__top">
        <div className="tool-card__icon">
          <Icon size={20} />
        </div>

        {tool.status === "ready" && (
          <span className="tool-card__status">
            Ready
          </span>
        )}
      </div>

      <div className="tool-card__heading">
        <h2>{tool.title}</h2>

        <p>
          {tool.shortDescription}
        </p>
      </div>

      <div className="tool-card__flow">
        <div className="tool-card__section">
          <span className="tool-card__label">
            You provide
          </span>

          <ul>
            {tool.input.map((item) => (
              <li key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="tool-card__divider">
          <ArrowRight size={16} />
        </div>

        <div className="tool-card__section">
          <span className="tool-card__label">
            You get
          </span>

          <ul>
            {tool.output.map((item) => (
              <li key={item}>
                <Check size={13} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className="tool-card__button"
        onClick={onOpen}
      >
        Open tool
        <ArrowRight size={16} />
      </button>
    </article>
  );
}