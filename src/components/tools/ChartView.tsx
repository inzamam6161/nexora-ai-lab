import type {
  ChartRecommendation,
  ChartRecommendationReport,
} from "../../engines/data/chartRecommender";

type ChartViewProps = {
  report:
    ChartRecommendationReport;
};

export default function ChartView({
  report,
}: ChartViewProps) {
  return (
    <section className="chart-view">
      <header className="chart-view__header">
        <div>
          <span className="eyebrow">
            RECOMMENDED VISUALS
          </span>

          <h3>
            Dataset charts
          </h3>
        </div>

        <span>
          {
            report.charts
              .length
          }{" "}
          charts
        </span>
      </header>

      {report.charts.length ===
      0 ? (
        <div className="chart-empty">
          No useful chart
          recommendation was
          found.
        </div>
      ) : (
        <div className="chart-list">
          {report.charts.map(
            (chart) => (
              <ChartCard
                key={
                  chart.id
                }
                chart={
                  chart
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function ChartCard({
  chart,
}: {
  chart:
    ChartRecommendation;
}) {
  return (
    <article className="chart-card">
      <div className="chart-card__header">
        <div>
          <strong>
            {chart.title}
          </strong>

          <p>
            {
              chart.description
            }
          </p>
        </div>

        <span>
          {
            chart.type
          }
        </span>
      </div>

      <div className="chart-card__canvas">
        {chart.type ===
          "bar" && (
          <BarChart
            chart={chart}
          />
        )}

        {chart.type ===
          "line" && (
          <LineChart
            chart={chart}
          />
        )}

        {chart.type ===
          "distribution" && (
          <DistributionChart
            chart={chart}
          />
        )}
      </div>
    </article>
  );
}


function BarChart({
  chart,
}: {
  chart:
    ChartRecommendation;
}) {
  const data =
    chart.data.slice(
      0,
      10
    );

  const maximum =
    Math.max(
      ...data.map(
        (item) =>
          Math.abs(
            item.value
          )
      ),
      1
    );

  return (
    <div className="bar-chart">
      {data.map(
        (item) => {
          const width =
            (
              Math.abs(
                item.value
              ) /
              maximum
            ) *
            100;

          return (
            <div
              key={
                item.label
              }
              className="bar-chart__row"
            >
              <div className="bar-chart__label">
                {
                  item.label
                }
              </div>

              <div className="bar-chart__track">
                <div
                  className="bar-chart__bar"
                  style={{
                    width:
                      `${width}%`,
                  }}
                />
              </div>

              <strong>
                {formatValue(
                  item.value
                )}
              </strong>
            </div>
          );
        }
      )}
    </div>
  );
}

function LineChart({
  chart,
}: {
  chart:
    ChartRecommendation;
}) {
  const data =
    chart.data.slice(
      0,
      40
    );

  if (
    data.length <
    2
  ) {
    return null;
  }

  const width =
    640;

  const height =
    220;

  const padding =
    20;

  const values =
    data.map(
      (item) =>
        item.value
    );

  const min =
    Math.min(
      ...values
    );

  const max =
    Math.max(
      ...values
    );

  const range =
    max - min ||
    1;

  const points =
    data.map(
      (
        item,
        index
      ) => {
        const x =
          padding +
          (
            index /
            Math.max(
              data.length -
                1,
              1
            )
          ) *
            (
              width -
              padding *
                2
            );

        const y =
          height -
          padding -
          (
            (
              item.value -
              min
            ) /
            range
          ) *
            (
              height -
              padding *
                2
            );

        return {
          x,
          y,
          ...item,
        };
      }
    );

  const path =
    points
      .map(
        (
          point,
          index
        ) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${point.x} ${point.y}`
      )
      .join(" ");

  return (
    <div className="line-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          chart.title
        }
      >
        <line
          x1={padding}
          y1={
            height -
            padding
          }
          x2={
            width -
            padding
          }
          y2={
            height -
            padding
          }
          className="line-chart__axis"
        />

        <path
          d={path}
          className="line-chart__line"
        />

        {points.map(
          (
            point,
            index
          ) => (
            <circle
              key={`${point.label}-${index}`}
              cx={
                point.x
              }
              cy={
                point.y
              }
              r="4"
              className="line-chart__point"
            >
              <title>
                {
                  point.label
                }
                {": "}
                {
                  point.value
                }
              </title>
            </circle>
          )
        )}
      </svg>

      <div className="line-chart__labels">
        <span>
          {
            data[0]
              ?.label
          }
        </span>

        <span>
          {
            data[
              data.length -
                1
            ]?.label
          }
        </span>
      </div>
    </div>
  );
}

function DistributionChart({
  chart,
}: {
  chart:
    ChartRecommendation;
}) {
  const maximum =
    Math.max(
      ...chart.data.map(
        (item) =>
          Math.abs(
            item.value
          )
      ),
      1
    );

  return (
    <div className="distribution-chart">
      {chart.data.map(
        (item) => (
          <div
            key={
              item.label
            }
            className="distribution-chart__item"
          >
            <span>
              {
                item.label
              }
            </span>

            <div className="distribution-chart__track">
              <div
                className="distribution-chart__fill"
                style={{
                  width:
                    `${
                      (
                        Math.abs(
                          item.value
                        ) /
                        maximum
                      ) *
                      100
                    }%`,
                }}
              />
            </div>

            <strong>
              {formatValue(
                item.value
              )}
            </strong>
          </div>
        )
      )}
    </div>
  );
}

function formatValue(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation:
        Math.abs(
          value
        ) >= 1000000
          ? "compact"
          : "standard",

      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}