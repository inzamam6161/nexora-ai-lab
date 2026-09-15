import type {
  ParsedDataset,
} from "../../types/dataset";

import {
  normalizeGroupValue,
  parseDateValue,
  parseNumericValue,
} from "../../utils/dataValues";

export type AggregationOperation =
  | "sum"
  | "avg"
  | "count"
  | "min"
  | "max";

export type DateGranularity =
  | "day"
  | "month"
  | "quarter"
  | "year";

export type AggregationRequest = {
  operation: AggregationOperation;

  valueColumn?: string;

  groupByColumn?: string;

  dateGranularity?: DateGranularity;

  limit?: number;

  sort?: "asc" | "desc";
};

export type AggregationRow = {
  group: string;

  value: number;

  count: number;
};

export type AggregationResult = {
  operation: AggregationOperation;

  valueColumn?: string;

  groupByColumn?: string;

  dateGranularity?: DateGranularity;

  rows: AggregationRow[];

  totalGroups: number;

  totalRowsUsed: number;
};

export function aggregateDataset(
  dataset: ParsedDataset,
  request: AggregationRequest
): AggregationResult {
  validateRequest(
    dataset,
    request
  );

  if (
    request.groupByColumn
  ) {
    return aggregateGrouped(
      dataset,
      request
    );
  }

  return aggregateWholeDataset(
    dataset,
    request
  );
}

function aggregateGrouped(
  dataset: ParsedDataset,
  request: AggregationRequest
): AggregationResult {
  const groupColumn =
    request.groupByColumn;

  if (!groupColumn) {
    throw new Error(
      "groupByColumn is required."
    );
  }

  const groups =
    new Map<
      string,
      number[]
    >();

  let totalRowsUsed =
    0;

  for (
    const row
    of dataset.rows
  ) {
    const group =
      getGroupKey(
        row[
          groupColumn
        ],
        request.dateGranularity
      );

    if (!group) {
      continue;
    }

    if (
      request.operation ===
      "count"
    ) {
      const current =
        groups.get(
          group
        ) ?? [];

      current.push(1);

      groups.set(
        group,
        current
      );

      totalRowsUsed += 1;

      continue;
    }

    if (
      !request.valueColumn
    ) {
      continue;
    }

    const numeric =
      parseNumericValue(
        row[
          request.valueColumn
        ]
      );

    if (
      numeric === null
    ) {
      continue;
    }

    const current =
      groups.get(
        group
      ) ?? [];

    current.push(
      numeric
    );

    groups.set(
      group,
      current
    );

    totalRowsUsed += 1;
  }

  let rows =
    Array.from(
      groups.entries()
    ).map(
      ([group, values]) => ({
        group,

        value:
          calculateAggregation(
            values,
            request.operation
          ),

        count:
          values.length,
      })
    );

  rows =
    sortRows(
      rows,
      request.sort ??
        "desc"
    );

  if (
    request.limit &&
    request.limit > 0
  ) {
    rows =
      rows.slice(
        0,
        request.limit
      );
  }

  return {
    operation:
      request.operation,

    valueColumn:
      request.valueColumn,

    groupByColumn:
      request.groupByColumn,

    dateGranularity:
      request.dateGranularity,

    rows,

    totalGroups:
      groups.size,

    totalRowsUsed,
  };
}

function aggregateWholeDataset(
  dataset: ParsedDataset,
  request: AggregationRequest
): AggregationResult {
  if (
    request.operation ===
    "count"
  ) {
    return {
      operation:
        "count",

      rows: [
        {
          group:
            "All rows",

          value:
            dataset.rows.length,

          count:
            dataset.rows.length,
        },
      ],

      totalGroups: 1,

      totalRowsUsed:
        dataset.rows.length,
    };
  }

  if (
    !request.valueColumn
  ) {
    throw new Error(
      `valueColumn is required for ${request.operation}.`
    );
  }

  const values =
    dataset.rows
      .map((row) =>
        parseNumericValue(
          row[
            request.valueColumn!
          ]
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  return {
    operation:
      request.operation,

    valueColumn:
      request.valueColumn,

    rows: [
      {
        group:
          "All rows",

        value:
          calculateAggregation(
            values,
            request.operation
          ),

        count:
          values.length,
      },
    ],

    totalGroups: 1,

    totalRowsUsed:
      values.length,
  };
}

function calculateAggregation(
  values: number[],
  operation: AggregationOperation
): number {
  if (
    operation ===
    "count"
  ) {
    return values.length;
  }

  if (
    values.length === 0
  ) {
    return 0;
  }

  if (
    operation ===
    "sum"
  ) {
    return round(
      values.reduce(
        (
          total,
          value
        ) =>
          total +
          value,
        0
      ),
      2
    );
  }

  if (
    operation ===
    "avg"
  ) {
    const sum =
      values.reduce(
        (
          total,
          value
        ) =>
          total +
          value,
        0
      );

    return round(
      sum /
        values.length,
      2
    );
  }

  if (
    operation ===
    "min"
  ) {
    return round(
      Math.min(
        ...values
      ),
      2
    );
  }

  if (
    operation ===
    "max"
  ) {
    return round(
      Math.max(
        ...values
      ),
      2
    );
  }

  return 0;
}

function getGroupKey(
  value: unknown,
  dateGranularity?: DateGranularity
): string | null {
  if (
    dateGranularity
  ) {
    const date =
      parseDateValue(
        value
      );

    if (!date) {
      return null;
    }

    return formatDateGroup(
      date,
      dateGranularity
    );
  }

  return normalizeGroupValue(
    value
  );
}

function formatDateGroup(
  date: Date,
  granularity: DateGranularity
): string {
  const year =
    date.getFullYear();

  const month =
    date.getMonth() +
    1;

  if (
    granularity ===
    "year"
  ) {
    return String(
      year
    );
  }

  if (
    granularity ===
    "quarter"
  ) {
    const quarter =
      Math.floor(
        (
          month -
          1
        ) /
          3
      ) + 1;

    return `${year}-Q${quarter}`;
  }

  if (
    granularity ===
    "month"
  ) {
    return `${year}-${String(
      month
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${year}-${String(
    month
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}

function validateRequest(
  dataset: ParsedDataset,
  request: AggregationRequest
) {
  if (
    request.valueColumn &&
    !dataset.columns.includes(
      request.valueColumn
    )
  ) {
    throw new Error(
      `Column "${request.valueColumn}" does not exist.`
    );
  }

  if (
    request.groupByColumn &&
    !dataset.columns.includes(
      request.groupByColumn
    )
  ) {
    throw new Error(
      `Column "${request.groupByColumn}" does not exist.`
    );
  }

  if (
    request.dateGranularity &&
    !request.groupByColumn
  ) {
    throw new Error(
      "dateGranularity requires groupByColumn."
    );
  }

  if (
    request.operation !==
      "count" &&
    !request.valueColumn
  ) {
    throw new Error(
      `valueColumn is required for ${request.operation}.`
    );
  }
}

function sortRows(
  rows: AggregationRow[],
  direction: "asc" | "desc"
) {
  return [
    ...rows,
  ].sort(
    (a, b) =>
      direction ===
      "desc"
        ? b.value -
          a.value
        : a.value -
          b.value
  );
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