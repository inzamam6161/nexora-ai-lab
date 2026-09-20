import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import type {
  GeneratedInsight,
  InsightReport,
} from "../../engines/data/insightGenerator";

type InsightViewProps = {
  report: InsightReport;
};

export default function InsightView({
  report,
}: InsightViewProps) {
  return (
    <section className="insight-view">
      <header className="insight-view__header">
        <div>
          <span className="eyebrow">
            AUTOMATED INSIGHTS
          </span>

          <h3>
            What Nexora found
          </h3>
        </div>

        <span className="insight-view__count">
          {report.insights.length}
          {" "}
          insights
        </span>
      </header>

      <div className="insight-summary">
        <SummaryMetric
          label="High priority"
          value={
            report.highPriorityCount
          }
        />

        <SummaryMetric
          label="Medium"
          value={
            report.mediumPriorityCount
          }
        />

        <SummaryMetric
          label="Informational"
          value={
            report.lowPriorityCount
          }
        />
      </div>

      {report.insights.length ===
      0 ? (
        <div className="insight-empty">
          No meaningful insights were
          generated for this dataset.
        </div>
      ) : (
        <div className="insight-list">
          {report.insights.map(
            (insight) => (
              <InsightCard
                key={
                  insight.id
                }
                insight={
                  insight
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function InsightCard({
  insight,
}: {
  insight: GeneratedInsight;
}) {
  return (
    <article className="insight-card">
      <div className="insight-card__icon">
        <InsightIcon insight={insight} />
      </div>

      <div className="insight-card__content">
        <div className="insight-card__heading">
          <div>
            <strong>
              {
                insight.title
              }
            </strong>

            {insight.relatedColumn && (
              <span>
                {
                  insight.relatedColumn
                }
              </span>
            )}
          </div>

          <span
            className={`insight-priority insight-priority--${insight.priority}`}
          >
            {
              insight.priority
            }
          </span>
        </div>

        <p>
          {
            insight.description
          }
        </p>

        {insight.value !==
          undefined && (
          <strong className="insight-card__value">
            {
              insight.value
            }
          </strong>
        )}
      </div>
    </article>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsightIcon({
  insight,
}: {
  insight: GeneratedInsight;
}) {
  if (insight.type === "anomaly") {
    return <AlertTriangle size={16} />;
  }

  if (insight.type === "trend") {
    return <TrendingUp size={16} />;
  }

  if (insight.type === "quality") {
    return <CheckCircle2 size={16} />;
  }

  if (insight.type === "statistics") {
    return <BarChart3 size={16} />;
  }

  return <Lightbulb size={16} />;
}
