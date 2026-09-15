import type {
  DataValue,
  ParsedDataset,
} from "../../types/dataset";

import type {
  DatasetProfile,
} from "./profiler";

export type AnomalyMethod =
  | "iqr"
  | "zscore";

export type NumericAnomaly = {
  column: string;

  rowIndex: number;

  value: number;

  method: AnomalyMethod;

  score: number;

  severity:
    | "low"
    | "medium"
    | "high";

  reason: string;
};

export type ColumnAnomalySummary = {
  column: string;

  anomalyCount: number;

  anomalyPercentage: number;

  anomalies: NumericAnomaly[];
};

export type DatasetAnomalyReport = {
  totalAnomalies: number;

  affectedColumns: number;

  columns: ColumnAnomalySummary[];
};

export function detectDatasetAnomalies(
  dataset: ParsedDataset,
  profile: DatasetProfile
): DatasetAnomalyReport {
  const columns: ColumnAnomalySummary[] = [];

  for (const column of profile.columns) {
    if (column.type !== "number") {
      continue;
    }

    const values =
      dataset.rows
        .map((row, rowIndex) => ({
          rowIndex,
          value: toNumber(
            row[column.name]
          ),
        }))
        .filter(
          (
            item
          ): item is {
            rowIndex: number;
            value: number;
          } =>
            item.value !== null
        );

    if (values.length < 4) {
      continue;
    }

    const iqrAnomalies =
      detectIQRAnomalies(
        column.name,
        values
      );

    const zScoreAnomalies =
      detectZScoreAnomalies(
        column.name,
        values
      );

    const merged =
      mergeAnomalies(
        iqrAnomalies,
        zScoreAnomalies
      );

    if (merged.length === 0) {
      continue;
    }

    columns.push({
      column:
        column.name,

      anomalyCount:
        merged.length,

      anomalyPercentage:
        round(
          (
            merged.length /
            values.length
          ) * 100,
          1
        ),

      anomalies:
        merged,
    });
  }

  return {
    totalAnomalies:
      columns.reduce(
        (total, column) =>
          total +
          column.anomalyCount,
        0
      ),

    affectedColumns:
      columns.length,

    columns,
  };
}


function detectIQRAnomalies(
  column: string,
  values: {
    rowIndex: number;
    value: number;
  }[]
): NumericAnomaly[] {
  const sorted =
    values
      .map(
        (item) =>
          item.value
      )
      .sort(
        (a, b) =>
          a - b
      );

  const q1 =
    percentile(
      sorted,
      0.25
    );

  const q3 =
    percentile(
      sorted,
      0.75
    );

  const iqr =
    q3 - q1;

  if (iqr === 0) {
    return [];
  }

  const lowerBound =
    q1 -
    1.5 * iqr;

  const upperBound =
    q3 +
    1.5 * iqr;

  return values
    .filter(
      (item) =>
        item.value <
          lowerBound ||
        item.value >
          upperBound
    )
    .map((item) => {
      const distance =
        item.value <
        lowerBound
          ? lowerBound -
            item.value
          : item.value -
            upperBound;

      const score =
        distance / iqr;

      return {
        column,

        rowIndex:
          item.rowIndex,

        value:
          item.value,

        method:
          "iqr",

        score:
          round(
            score,
            2
          ),

        severity:
          getSeverity(
            score
          ),

        reason:
          item.value <
          lowerBound
            ? `Value is below the IQR lower bound (${round(
                lowerBound,
                2
              )}).`
            : `Value is above the IQR upper bound (${round(
                upperBound,
                2
              )}).`,
      };
    });
}

function detectZScoreAnomalies(
  column: string,
  values: {
    rowIndex: number;
    value: number;
  }[]
): NumericAnomaly[] {
  if (
    values.length < 5
  ) {
    return [];
  }

  const numbers =
    values.map(
      (item) =>
        item.value
    );

  const mean =
    numbers.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    numbers.length;

  const variance =
    numbers.reduce(
      (sum, value) =>
        sum +
        (
          value -
          mean
        ) ** 2,
      0
    ) /
    numbers.length;

  const stdDev =
    Math.sqrt(
      variance
    );

  if (stdDev === 0) {
    return [];
  }

  return values
    .map((item) => {
      const zScore =
        Math.abs(
          (
            item.value -
            mean
          ) /
            stdDev
        );

      return {
        item,
        zScore,
      };
    })
    .filter(
      ({ zScore }) =>
        zScore >= 2.5
    )
    .map(
      ({
        item,
        zScore,
      }) => ({
        column,

        rowIndex:
          item.rowIndex,

        value:
          item.value,

        method:
          "zscore",

        score:
          round(
            zScore,
            2
          ),

        severity:
          getSeverity(
            zScore
          ),

        reason:
          `Value is ${round(
            zScore,
            2
          )} standard deviations from the mean.`,
      })
    );
}

function mergeAnomalies(
  first: NumericAnomaly[],
  second: NumericAnomaly[]
) {
  const map =
    new Map<
      string,
      NumericAnomaly
    >();

  for (const anomaly of [
    ...first,
    ...second,
  ]) {
    const key =
      `${anomaly.column}-${anomaly.rowIndex}`;

    const existing =
      map.get(key);

    if (!existing) {
      map.set(
        key,
        anomaly
      );

      continue;
    }

    if (
      severityRank(
        anomaly.severity
      ) >
      severityRank(
        existing.severity
      )
    ) {
      map.set(
        key,
        anomaly
      );
    }
  }

  return Array.from(
    map.values()
  ).sort(
    (a, b) =>
      severityRank(
        b.severity
      ) -
      severityRank(
        a.severity
      )
  );
}

function getSeverity(
  score: number
):
  | "low"
  | "medium"
  | "high" {
  if (score >= 4) {
    return "high";
  }

  if (score >= 2.5) {
    return "medium";
  }

  return "low";
}

function severityRank(
  severity:
    | "low"
    | "medium"
    | "high"
) {
  if (
    severity === "high"
  ) {
    return 3;
  }

  if (
    severity === "medium"
  ) {
    return 2;
  }

  return 1;
}

function percentile(
  sorted: number[],
  value: number
) {
  if (
    sorted.length === 1
  ) {
    return (
      sorted[0] ??
      0
    );
  }

  const position =
    (
      sorted.length -
      1
    ) * value;

  const lower =
    Math.floor(
      position
    );

  const upper =
    Math.ceil(
      position
    );

  const weight =
    position -
    lower;

  const lowerValue =
    sorted[lower] ??
    0;

  const upperValue =
    sorted[upper] ??
    lowerValue;

  return (
    lowerValue +
    (
      upperValue -
      lowerValue
    ) *
      weight
  );
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