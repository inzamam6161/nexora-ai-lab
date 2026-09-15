import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import type {
  DatasetTrendReport,
  TrendDirection,
} from "../../engines/data/trendAnalyzer";

type TrendViewProps = {
  report: DatasetTrendReport;
};

export default function TrendView({
  report,
}: TrendViewProps) {
  return (
    <section className="trend-view">
      <header>
        <span className="eyebrow">
          TREND ANALYSIS
        </span>

        <h3>
          Time-based movement
        </h3>
      </header>

      {report.trends.length ===
      0 ? (
        <div className="trend-empty">
          No usable date + numeric
          combination was found.
        </div>
      ) : (
        <div className="trend-list">
          {report.trends.map(
            (trend) => (
              <article
                key={`${trend.dateColumn}-${trend.valueColumn}`}
                className="trend-card"
              >
                <div className="trend-card__header">
                  <div>
                    <strong>
                      {
                        trend.valueColumn
                      }
                    </strong>

                    <span>
                      by{" "}
                      {
                        trend.dateColumn
                      }
                    </span>
                  </div>

                  <TrendBadge
                    direction={
                      trend.direction
                    }
                  />
                </div>

                <div className="trend-metrics">
                  <Metric
                    label="First"
                    value={
                      trend.firstValue
                    }
                  />

                  <Metric
                    label="Last"
                    value={
                      trend.lastValue
                    }
                  />

                  <Metric
                    label="Change"
                    value={
                      formatSigned(
                        trend.absoluteChange
                      )
                    }
                  />

                  <Metric
                    label="% Change"
                    value={
                      trend.percentageChange ===
                      null
                        ? "N/A"
                        : `${formatSigned(
                            trend.percentageChange
                          )}%`
                    }
                  />
                </div>

                <div className="trend-periods">
                  <div>
                    <span>
                      Strongest
                    </span>

                    <strong>
                      {
                        trend.strongestPeriod
                          ?.value
                      }
                    </strong>

                    <small>
                      {
                        trend.strongestPeriod
                          ?.date
                      }
                    </small>
                  </div>

                  <div>
                    <span>
                      Weakest
                    </span>

                    <strong>
                      {
                        trend.weakestPeriod
                          ?.value
                      }
                    </strong>

                    <small>
                      {
                        trend.weakestPeriod
                          ?.date
                      }
                    </small>
                  </div>
                </div>

                <div className="trend-summary">
                  Average value:{" "}
                  <strong>
                    {
                      trend.averageValue
                    }
                  </strong>

                  {" · "}

                  Average period change:{" "}
                  <strong>
                    {formatSigned(
                      trend.averagePeriodChange
                    )}
                  </strong>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}

function TrendBadge({
  direction,
}: {
  direction: TrendDirection;
}) {
  if (
    direction === "up"
  ) {
    return (
      <span className="trend-badge">
        <ArrowUpRight
          size={13}
        />
        Growing
      </span>
    );
  }

  if (
    direction === "down"
  ) {
    return (
      <span className="trend-badge">
        <ArrowDownRight
          size={13}
        />
        Declining
      </span>
    );
  }

  return (
    <span className="trend-badge">
      <ArrowRight
        size={13}
      />
      Stable
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="trend-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatSigned(
  value: number
) {
  if (
    value > 0
  ) {
    return `+${value}`;
  }

  return String(value);
}