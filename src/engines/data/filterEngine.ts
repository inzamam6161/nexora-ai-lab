import type {
  DataRow,
  DataValue,
  ParsedDataset,
} from "../../types/dataset";

import {
  normalizeGroupValue,
  parseDateValue,
  parseNumericValue,
} from "../../utils/dataValues";

export type FilterOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "greater-than-or-equal"
  | "less-than"
  | "less-than-or-equal"
  | "contains"
  | "between"
  | "date-month"
  | "date-year";

export type DatasetFilter = {
  column: string;

  operator: FilterOperator;

  value:
    | string
    | number;

  secondValue?:
    | string
    | number;
};

export type FilterResult = {
  dataset: ParsedDataset;

  originalRowCount: number;

  filteredRowCount: number;

  filters: DatasetFilter[];
};

export function filterDataset(
  dataset: ParsedDataset,
  filters: DatasetFilter[]
): FilterResult {
  if (
    filters.length ===
    0
  ) {
    return {
      dataset,
      originalRowCount:
        dataset.rowCount,
      filteredRowCount:
        dataset.rowCount,
      filters: [],
    };
  }

  validateFilters(
    dataset,
    filters
  );

  const rows =
    dataset.rows.filter(
      (row) =>
        filters.every(
          (filter) =>
            matchesFilter(
              row,
              filter
            )
        )
    );

  const filteredDataset:
    ParsedDataset = {
      ...dataset,

      rows,

      rowCount:
        rows.length,
  };

  return {
    dataset:
      filteredDataset,

    originalRowCount:
      dataset.rowCount,

    filteredRowCount:
      rows.length,

    filters,
  };
}

function matchesFilter(
  row: DataRow,
  filter: DatasetFilter
): boolean {
  const value =
    row[
      filter.column
    ];

  switch (
    filter.operator
  ) {
    case "equals":
      return equalsValue(
        value,
        filter.value
      );

    case "not-equals":
      return !equalsValue(
        value,
        filter.value
      );

    case "contains":
      return containsValue(
        value,
        filter.value
      );

    case "greater-than":
      return compareNumeric(
        value,
        filter.value,
        (a, b) =>
          a > b
      );

    case "greater-than-or-equal":
      return compareNumeric(
        value,
        filter.value,
        (a, b) =>
          a >= b
      );

    case "less-than":
      return compareNumeric(
        value,
        filter.value,
        (a, b) =>
          a < b
      );

    case "less-than-or-equal":
      return compareNumeric(
        value,
        filter.value,
        (a, b) =>
          a <= b
      );

    case "between":
      return betweenNumeric(
        value,
        filter.value,
        filter.secondValue
      );

    case "date-month":
      return matchesMonth(
        value,
        filter.value
      );

    case "date-year":
      return matchesYear(
        value,
        filter.value
      );
  }
}

function equalsValue(
  actual: DataValue,
  expected:
    | string
    | number
) {
  const actualNumber =
    parseNumericValue(
      actual
    );

  const expectedNumber =
    parseNumericValue(
      expected
    );

  if (
    actualNumber !== null &&
    expectedNumber !== null
  ) {
    return (
      actualNumber ===
      expectedNumber
    );
  }

  const left =
    normalizeGroupValue(
      actual
    );

  const right =
    normalizeGroupValue(
      expected
    );

  if (
    left === null ||
    right === null
  ) {
    return false;
  }

  return (
    left.toLowerCase() ===
    right.toLowerCase()
  );
}

function containsValue(
  actual: DataValue,
  expected:
    | string
    | number
) {
  const left =
    normalizeGroupValue(
      actual
    );

  const right =
    normalizeGroupValue(
      expected
    );

  if (
    left === null ||
    right === null
  ) {
    return false;
  }

  return left
    .toLowerCase()
    .includes(
      right.toLowerCase()
    );
}

function compareNumeric(
  actual: DataValue,
  expected:
    | string
    | number,
  comparator:
    (
      left: number,
      right: number
    ) => boolean
) {
  const left =
    parseNumericValue(
      actual
    );

  const right =
    parseNumericValue(
      expected
    );

  if (
    left === null ||
    right === null
  ) {
    return false;
  }

  return comparator(
    left,
    right
  );
}

function betweenNumeric(
  actual: DataValue,
  first:
    | string
    | number,
  second:
    | string
    | number
    | undefined
) {
  if (
    second ===
    undefined
  ) {
    return false;
  }

  const actualValue =
    parseNumericValue(
      actual
    );

  const firstValue =
    parseNumericValue(
      first
    );

  const secondValue =
    parseNumericValue(
      second
    );

  if (
    actualValue === null ||
    firstValue === null ||
    secondValue === null
  ) {
    return false;
  }

  const min =
    Math.min(
      firstValue,
      secondValue
    );

  const max =
    Math.max(
      firstValue,
      secondValue
    );

  return (
    actualValue >= min &&
    actualValue <= max
  );
}

function matchesMonth(
  actual: DataValue,
  expected:
    | string
    | number
) {
  const date =
    parseDateValue(
      actual
    );

  if (!date) {
    return false;
  }

  const target =
    String(expected)
      .toLowerCase();

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const monthIndex =
    monthNames.findIndex(
      (month) =>
        month ===
        target
    );

  if (
    monthIndex >= 0
  ) {
    return (
      date.getMonth() ===
      monthIndex
    );
  }

  const numericMonth =
    Number(
      expected
    );

  return (
    Number.isInteger(
      numericMonth
    ) &&
    numericMonth >= 1 &&
    numericMonth <= 12 &&
    date.getMonth() ===
      numericMonth - 1
  );
}

function matchesYear(
  actual: DataValue,
  expected:
    | string
    | number
) {
  const date =
    parseDateValue(
      actual
    );

  if (!date) {
    return false;
  }

  const year =
    Number(
      expected
    );

  return (
    Number.isInteger(
      year
    ) &&
    date.getFullYear() ===
      year
  );
}

function validateFilters(
  dataset: ParsedDataset,
  filters: DatasetFilter[]
) {
  for (
    const filter
    of filters
  ) {
    if (
      !dataset.columns.includes(
        filter.column
      )
    ) {
      throw new Error(
        `Filter column "${filter.column}" does not exist.`
      );
    }
  }
}