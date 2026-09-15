import type {
  DatasetStatistics,
} from "../../engines/data/statistics";

type DatasetStatisticsViewProps = {
  statistics: DatasetStatistics;
};

export default function DatasetStatisticsView({
  statistics,
}: DatasetStatisticsViewProps) {
  return (
    <section className="statistics-view">
      {statistics.numeric.length > 0 && (
        <div className="statistics-section">
          <header>
            <span className="eyebrow">
              NUMERIC ANALYSIS
            </span>

            <h3>
              Numeric statistics
            </h3>
          </header>

          <div className="statistics-list">
            {statistics.numeric.map(
              (stat) => (
                <article
                  key={
                    stat.column
                  }
                  className="statistics-card"
                >
                  <div className="statistics-card__title">
                    <strong>
                      {
                        stat.column
                      }
                    </strong>

                    <span>
                      numeric
                    </span>
                  </div>

                  <div className="statistics-grid">
                    <Metric
                      label="Mean"
                      value={
                        stat.mean
                      }
                    />

                    <Metric
                      label="Median"
                      value={
                        stat.median
                      }
                    />

                    <Metric
                      label="Min"
                      value={
                        stat.min
                      }
                    />

                    <Metric
                      label="Max"
                      value={
                        stat.max
                      }
                    />

                    <Metric
                      label="Q1"
                      value={
                        stat.q1
                      }
                    />

                    <Metric
                      label="Q3"
                      value={
                        stat.q3
                      }
                    />

                    <Metric
                      label="Std dev"
                      value={
                        stat.standardDeviation
                      }
                    />

                    <Metric
                      label="Sum"
                      value={
                        stat.sum
                      }
                    />
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}

      {statistics.categorical.length >
        0 && (
        <div className="statistics-section">
          <header>
            <span className="eyebrow">
              CATEGORY ANALYSIS
            </span>

            <h3>
              Frequency distribution
            </h3>
          </header>

          <div className="statistics-list">
            {statistics.categorical.map(
              (stat) => (
                <article
                  key={
                    stat.column
                  }
                  className="statistics-card"
                >
                  <div className="statistics-card__title">
                    <div>
                      <strong>
                        {
                          stat.column
                        }
                      </strong>

                      <span>
                        {
                          stat.uniqueCount
                        }{" "}
                        unique
                      </span>
                    </div>

                    <span>
                      category
                    </span>
                  </div>

                  {stat.topValue && (
                    <div className="statistics-top">
                      <span>
                        Most common
                      </span>

                      <strong>
                        {
                          stat.topValue
                        }
                      </strong>

                      <small>
                        {
                          stat.topCount
                        }{" "}
                        rows ·{" "}
                        {
                          stat.topPercentage
                        }
                        %
                      </small>
                    </div>
                  )}

                  <div className="frequency-list">
                    {stat.distribution
                      .slice(0, 6)
                      .map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.value
                            }
                            className="frequency-item"
                          >
                            <div className="frequency-item__header">
                              <span>
                                {
                                  item.value
                                }
                              </span>

                              <span>
                                {
                                  item.percentage
                                }
                                %
                              </span>
                            </div>

                            <div className="frequency-bar">
                              <div
                                className="frequency-bar__fill"
                                style={{
                                  width:
                                    `${Math.min(
                                      item.percentage,
                                      100
                                    )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="statistics-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}