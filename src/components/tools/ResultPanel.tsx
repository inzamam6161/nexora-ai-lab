import type {
  ReactNode,
} from "react";

export type ResultStatus =
  | "empty"
  | "loading"
  | "success"
  | "error";

type ResultPanelProps = {
  status: ResultStatus;
  children?: ReactNode;
  errorMessage?: string;
};

export default function ResultPanel({
  status,
  children,
  errorMessage,
}: ResultPanelProps) {
  return (
    <section className="result-panel">
      <header className="result-panel__header">
        <span className="eyebrow">
          RESULT
        </span>

        <h2>Analysis output</h2>
      </header>

      <div className="result-panel__content">
        {status === "empty" && (
          <div className="result-state">
            <strong>
              Nothing analyzed yet.
            </strong>

            <p>
              Provide the required input
              to generate a result.
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="result-state">
            <div className="loader" />

            <strong>
              Analyzing...
            </strong>

            <p>
              Processing your input.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="result-state">
            <strong>
              Unable to analyze input.
            </strong>

            <p>
              {errorMessage ??
                "Something went wrong."}
            </p>
          </div>
        )}

        {status === "success" &&
          children}
      </div>
    </section>
  );
}