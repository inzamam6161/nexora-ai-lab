import type {
  DataValue,
  ParsedDataset,
} from "../../types/dataset";

import type {
  ColumnProfile,
  DatasetProfile,
} from "./profiler";

export type NumericColumnStatistics = {
  column: string;

  count: number;

  min: number;
  max: number;
  range: number;

  sum: number;
  mean: number;

  median: number;

  q1: number;
  q3: number;

  variance: number;
  standardDeviation: number;
};

export type CategoryFrequency = {
  value: string;
  count: number;
  percentage: number;
};

export type CategoricalColumnStatistics = {
  column: string;

  count: number;
  uniqueCount: number;

  topValue: string | null;
  topCount: number;
  topPercentage: number;

  distribution: CategoryFrequency[];
};

export type DatasetStatistics = {
  numeric: NumericColumnStatistics[];

  categorical:
    CategoricalColumnStatistics[];
};

export function calculateDatasetStatistics(
  dataset: ParsedDataset,
  profile: DatasetProfile
): DatasetStatistics {
  const numeric: NumericColumnStatistics[] = [];

  const categorical:
    CategoricalColumnStatistics[] = [];

  for (const column of profile.columns) {
    if (column.type === "number") {
      const stats =
        calculateNumericColumnStatistics(
          dataset,
          column
        );

      if (stats) {
        numeric.push(stats);
      }
    }

    if (
      column.type === "category" ||
      column.type === "boolean"
    ) {
      const stats =
        calculateCategoricalColumnStatistics(
          dataset,
          column
        );

      if (stats) {
        categorical.push(stats);
      }
    }
  }

  return {
    numeric,
    categorical,
  };
}

function calculateNumericColumnStatistics(
  dataset: ParsedDataset,
  column: ColumnProfile
): NumericColumnStatistics | null {
  const values =
    dataset.rows
      .map((row) =>
        toNumber(
          row[column.name]
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  if (values.length === 0) {
    return null;
  }

  const sorted = [
    ...values,
  ].sort(
    (a, b) => a - b
  );

  const count =
    sorted.length;

  const sum =
    sorted.reduce(
      (total, value) =>
        total + value,
      0
    );

  const mean =
    sum / count;

  const min =
    sorted[0] ?? 0;

  const max =
    sorted[
      sorted.length - 1
    ] ?? 0;

  const median =
    calculateMedian(
      sorted
    );

  const q1 =
    calculatePercentile(
      sorted,
      0.25
    );

  const q3 =
    calculatePercentile(
      sorted,
      0.75
    );

  const variance =
    calculateVariance(
      sorted,
      mean
    );

  const standardDeviation =
    Math.sqrt(
      variance
    );

  return {
    column: column.name,

    count,

    min:
      round(
        min,
        2
      ),

    max:
      round(
        max,
        2
      ),

    range:
      round(
        max - min,
        2
      ),

    sum:
      round(
        sum,
        2
      ),

    mean:
      round(
        mean,
        2
      ),

    median:
      round(
        median,
        2
      ),

    q1:
      round(
        q1,
        2
      ),

    q3:
      round(
        q3,
        2
      ),

    variance:
      round(
        variance,
        2
      ),

    standardDeviation:
      round(
        standardDeviation,
        2
      ),
  };
}

function calculateCategoricalColumnStatistics(
  dataset: ParsedDataset,
  column: ColumnProfile
): CategoricalColumnStatistics | null {
  const values =
    dataset.rows
      .map((row) =>
        normalizeCategoryValue(
          row[column.name]
        )
      )
      .filter(
        (
          value
        ): value is string =>
          value !== null
      );

  if (values.length === 0) {
    return null;
  }

  const frequency =
    new Map<
      string,
      number
    >();

  for (const value of values) {
    frequency.set(
      value,
      (
        frequency.get(
          value
        ) ?? 0
      ) + 1
    );
  }

  const distribution =
    Array.from(
      frequency.entries()
    )
      .map(
        ([value, count]) => ({
          value,

          count,

          percentage:
            round(
              (
                count /
                values.length
              ) * 100,
              1
            ),
        })
      )
      .sort(
        (a, b) =>
          b.count -
          a.count
      );

  const top =
    distribution[0];

  return {
    column:
      column.name,

    count:
      values.length,

    uniqueCount:
      frequency.size,

    topValue:
      top?.value ??
      null,

    topCount:
      top?.count ??
      0,

    topPercentage:
      top?.percentage ??
      0,

    distribution,
  };
}

function calculateMedian(
  sorted: number[]
): number {
  if (
    sorted.length === 0
  ) {
    return 0;
  }

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 0
  ) {
    const left =
      sorted[
        middle - 1
      ] ?? 0;

    const right =
      sorted[
        middle
      ] ?? 0;

    return (
      left +
      right
    ) / 2;
  }

  return (
    sorted[middle] ??
    0
  );
}

function calculatePercentile(
  sorted: number[],
  percentile: number
): number {
  if (
    sorted.length === 0
  ) {
    return 0;
  }

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
    ) * percentile;

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
    sorted[
      lower
    ] ?? 0;

  const upperValue =
    sorted[
      upper
    ] ??
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

function calculateVariance(
  values: number[],
  mean: number
): number {
  if (
    values.length === 0
  ) {
    return 0;
  }

  const totalSquaredDifference =
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        (
          value -
          mean
        ) ** 2,
      0
    );

  return (
    totalSquaredDifference /
    values.length
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
      .replace(
        /,/g,
        ""
      )
      .replace(
        /^[AED$€£₹]\s*/i,
        ""
      );

  if (!normalized) {
    return null;
  }

  const number =
    Number(
      normalized
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function normalizeCategoryValue(
  value: DataValue
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return value
      .toISOString();
  }

  if (
    typeof value ===
    "string"
  ) {
    const trimmed =
      value.trim();

    return trimmed
      ? trimmed
      : null;
  }

  return String(
    value
  );
}

function round(
  value: number,
  decimals: number
): number {
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