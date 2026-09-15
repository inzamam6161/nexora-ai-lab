import {
  AlertTriangle,
} from "lucide-react";

import type {
  DatasetAnomalyReport,
} from "../../engines/data/anomalyDetector";

type AnomalyViewProps = {
  report: DatasetAnomalyReport;
};

export default function AnomalyView({
  report,
}: AnomalyViewProps) {
  return (
    <section className="anomaly-view">
      <header>
        <span className="eyebrow">
          ANOMALY DETECTION
        </span>

        <h3>
          Unusual values
        </h3>
      </header>

      <div className="anomaly-summary">
        <div>
          <span>
            Anomalies
          </span>

          <strong>
            {
              report.totalAnomalies
            }
          </strong>
        </div>

        <div>
          <span>
            Affected columns
          </span>

          <strong>
            {
              report.affectedColumns
            }
          </strong>
        </div>
      </div>

      {report.totalAnomalies ===
      0 ? (
        <div className="anomaly-empty">
          No obvious numeric anomalies
          detected.
        </div>
      ) : (
        <div className="anomaly-columns">
          {report.columns.map(
            (column) => (
              <article
                key={
                  column.column
                }
                className="anomaly-column"
              >
                <div className="anomaly-column__header">
                  <div>
                    <strong>
                      {
                        column.column
                      }
                    </strong>

                    <span>
                      {
                        column.anomalyCount
                      }{" "}
                      anomalies
                    </span>
                  </div>

                  <span>
                    {
                      column.anomalyPercentage
                    }
                    %
                  </span>
                </div>

                <div className="anomaly-list">
                  {column.anomalies
                    .slice(0, 8)
                    .map(
                      (
                        anomaly
                      ) => (
                        <div
                          key={`${anomaly.column}-${anomaly.rowIndex}`}
                          className="anomaly-item"
                        >
                          <div className="anomaly-item__icon">
                            <AlertTriangle
                              size={
                                15
                              }
                            />
                          </div>

                          <div className="anomaly-item__content">
                            <div className="anomaly-item__title">
                              <strong>
                                {
                                  anomaly.value
                                }
                              </strong>

                              <span>
                                Row{" "}
                                {
                                  anomaly.rowIndex +
                                  2
                                }
                              </span>

                              <span>
                                {
                                  anomaly.method
                                }
                              </span>

                              <span>
                                {
                                  anomaly.severity
                                }
                              </span>
                            </div>

                            <p>
                              {
                                anomaly.reason
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}