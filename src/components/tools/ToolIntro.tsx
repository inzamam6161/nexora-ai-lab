import type {
  ToolDefinition,
} from "../../data/tools";

type ToolIntroProps = {
  tool: ToolDefinition;
};

export default function ToolIntro({
  tool,
}: ToolIntroProps) {
  const Icon = tool.icon;

  return (
    <section className="tool-intro">
      <div className="tool-intro__heading">
        <div className="tool-intro__icon">
          <Icon size={24} />
        </div>

        <div>
          <span className="eyebrow">
            INTELLIGENCE TOOL
          </span>

          <h1>{tool.title}</h1>

          <p>
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="tool-intro__flow">
        <div className="tool-intro__panel">
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

        <div className="tool-intro__panel">
          <span className="tool-card__label">
            You get
          </span>

          <ul>
            {tool.output.map((item) => (
              <li key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}