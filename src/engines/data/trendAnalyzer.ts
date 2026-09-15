import type {
  DataValue,
  ParsedDataset,
} from "../../types/dataset";

import type {
  DatasetProfile,
} from "./profiler";

export type TrendDirection =
  | "up"
  | "down"
  | "flat";

export type TrendPoint = {
  date: string;
  value: number;
};

export type TrendAnalysis = {
  dateColumn: string;
  valueColumn: string;

  direction: TrendDirection;

  firstValue: number;
  lastValue: number;

  absoluteChange: number;
  percentageChange: number | null;

  averageValue: number;
  averagePeriodChange: number;

  strongestPeriod: TrendPoint | null;
  weakestPeriod: TrendPoint | null;

  points: TrendPoint[];
};

export type DatasetTrendReport = {
  trends: TrendAnalysis[];
};

export function analyzeDatasetTrends(
  dataset: ParsedDataset,
  profile: DatasetProfile
): DatasetTrendReport {
  const dateColumns =
    profile.columns.filter(
      (column) =>
        column.type === "date"
    );

  const numericColumns =
    profile.columns.filter(
      (column) =>
        column.type === "number"
    );

  const trends: TrendAnalysis[] = [];

  for (const dateColumn of dateColumns) {
    for (const numericColumn of numericColumns) {
      const result =
        analyzeTrend(
          dataset,
          dateColumn.name,
          numericColumn.name
        );

      if (result) {
        trends.push(result);
      }
    }
  }

  return {
    trends,
  };
}

function analyzeTrend(
  dataset: ParsedDataset,
  dateColumn: string,
  valueColumn: string
): TrendAnalysis | null {
  const points =
    dataset.rows
      .map((row) => {
        const date =
          toDate(
            row[dateColumn]
          );

        const value =
          toNumber(
            row[valueColumn]
          );

        if (
          !date ||
          value === null
        ) {
          return null;
        }

        return {
          date,
          value,
        };
      })
      .filter(
        (
          item
        ): item is {
          date: Date;
          value: number;
        } =>
          item !== null
      )
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      );

  if (
    points.length < 2
  ) {
    return null;
  }

  const first =
    points[0];

  const last =
    points[
      points.length - 1
    ];

  if (
    !first ||
    !last
  ) {
    return null;
  }

  const firstValue =
    first.value;

  const lastValue =
    last.value;

  const absoluteChange =
    lastValue -
    firstValue;

  const percentageChange =
    firstValue === 0
      ? null
      : (
          absoluteChange /
          Math.abs(
            firstValue
          )
        ) * 100;

  const averageValue =
    points.reduce(
      (sum, point) =>
        sum +
        point.value,
      0
    ) /
    points.length;

  const changes: number[] = [];

  for (
    let index = 1;
    index <
    points.length;
    index += 1
  ) {
    const current =
      points[index];

    const previous =
      points[
        index - 1
      ];

    if (
      !current ||
      !previous
    ) {
      continue;
    }

    changes.push(
      current.value -
      previous.value
    );
  }

  const averagePeriodChange =
    changes.length === 0
      ? 0
      : changes.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        changes.length;

  const strongest =
    points.reduce(
      (best, point) =>
        point.value >
        best.value
          ? point
          : best
    );

  const weakest =
    points.reduce(
      (worst, point) =>
        point.value <
        worst.value
          ? point
          : worst
    );

  const direction =
    detectDirection(
      absoluteChange,
      firstValue
    );

  return {
    dateColumn,
    valueColumn,

    direction,

    firstValue:
      round(
        firstValue,
        2
      ),

    lastValue:
      round(
        lastValue,
        2
      ),

    absoluteChange:
      round(
        absoluteChange,
        2
      ),

    percentageChange:
      percentageChange ===
      null
        ? null
        : round(
            percentageChange,
            2
          ),

    averageValue:
      round(
        averageValue,
        2
      ),

    averagePeriodChange:
      round(
        averagePeriodChange,
        2
      ),

    strongestPeriod: {
      date:
        formatDate(
          strongest.date
        ),

      value:
        round(
          strongest.value,
          2
        ),
    },

    weakestPeriod: {
      date:
        formatDate(
          weakest.date
        ),

      value:
        round(
          weakest.value,
          2
        ),
    },

    points:
      points.map(
        (point) => ({
          date:
            formatDate(
              point.date
            ),

          value:
            round(
              point.value,
              2
            ),
        })
      ),
  };
}

function detectDirection(
  absoluteChange: number,
  firstValue: number
): TrendDirection {
  if (
    firstValue === 0
  ) {
    if (
      absoluteChange > 0
    ) {
      return "up";
    }

    if (
      absoluteChange < 0
    ) {
      return "down";
    }

    return "flat";
  }

  const ratio =
    Math.abs(
      absoluteChange /
      firstValue
    );

  if (
    ratio < 0.02
  ) {
    return "flat";
  }

  return absoluteChange > 0
    ? "up"
    : "down";
}

function toNumber(
  value: DataValue
): number | null {
  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : null;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(/,/g, "")
      .replace(
        /^[AED$€£₹]\s*/i,
        ""
      );

  if (!normalized) {
    return null;
  }

  const result =
    Number(
      normalized
    );

  return Number.isFinite(
    result
  )
    ? result
    : null;
}

function toDate(
  value: DataValue
): Date | null {
  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const text =
    value.trim();

  if (!text) {
    return null;
  }

  const patterns = [
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
  ];

  if (
    !patterns.some(
      (pattern) =>
        pattern.test(text)
    )
  ) {
    return null;
  }

  const timestamp =
    Date.parse(text);

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return null;
  }

  return new Date(
    timestamp
  );
}

function formatDate(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

function round(
  value: number,
  decimals: number
) {
  const factor =
    10 ** decimals;

  return (
    Math.round(
      value *
      factor
    ) /
    factor
  );
}