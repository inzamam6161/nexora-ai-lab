import type {
  ReactNode,
} from "react";

type InputPanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function InputPanel({
  title = "Provide your input",
  description,
  children,
}: InputPanelProps) {
  return (
    <section className="input-panel">
      <header className="input-panel__header">
        <div>
          <span className="eyebrow">
            INPUT
          </span>

          <h2>{title}</h2>

          {description && (
            <p>{description}</p>
          )}
        </div>
      </header>

      <div className="input-panel__content">
        {children}
      </div>
    </section>
  );
}