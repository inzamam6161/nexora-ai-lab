import type {
  ParsedDataset,
} from "../../types/dataset";

import type {
  AggregationOperation,
} from "../data/aggregationEngine";

import {
  aggregateDataset,
} from "../data/aggregationEngine";

import {
  filterDataset,
} from "../data/filterEngine";

export type ComparisonRequest = {
  categoryColumn: string;

  values: [
    string,
    string
  ];

  operation:
    AggregationOperation;

  valueColumn?: string;
};

export type ComparisonSide = {
  label: string;

  value: number;

  rowsUsed: number;
};

export type ComparisonResult = {
  left:
    ComparisonSide;

  right:
    ComparisonSide;

  difference: number;

  absoluteDifference: number;

  percentageDifference:
    number | null;

  winner:
    string | null;
};

export function compareDatasetValues(
  dataset: ParsedDataset,
  request: ComparisonRequest
): ComparisonResult {
  const [
    leftLabel,
    rightLabel,
  ] =
    request.values;

  const leftFiltered =
    filterDataset(
      dataset,
      [
        {
          column:
            request.categoryColumn,

          operator:
            "equals",

          value:
            leftLabel,
        },
      ]
    );

  const rightFiltered =
    filterDataset(
      dataset,
      [
        {
          column:
            request.categoryColumn,

          operator:
            "equals",

          value:
            rightLabel,
        },
      ]
    );

  const leftAggregation =
    aggregateDataset(
      leftFiltered.dataset,
      {
        operation:
          request.operation,

        valueColumn:
          request.valueColumn,
      }
    );

  const rightAggregation =
    aggregateDataset(
      rightFiltered.dataset,
      {
        operation:
          request.operation,

        valueColumn:
          request.valueColumn,
      }
    );

  const leftValue =
    leftAggregation.rows[0]
      ?.value ?? 0;

  const rightValue =
    rightAggregation.rows[0]
      ?.value ?? 0;

  const difference =
    round(
      leftValue -
        rightValue,
      2
    );

  const absoluteDifference =
    round(
      Math.abs(
        difference
      ),
      2
    );

  const percentageDifference =
    rightValue === 0
      ? null
      : round(
          (
            difference /
            Math.abs(
              rightValue
            )
          ) *
            100,
          2
        );

  let winner:
    string | null =
      null;

  if (
    leftValue >
    rightValue
  ) {
    winner =
      leftLabel;
  }

  if (
    rightValue >
    leftValue
  ) {
    winner =
      rightLabel;
  }

  return {
    left: {
      label:
        leftLabel,

      value:
        leftValue,

      rowsUsed:
        leftAggregation
          .totalRowsUsed,
    },

    right: {
      label:
        rightLabel,

      value:
        rightValue,

      rowsUsed:
        rightAggregation
          .totalRowsUsed,
    },

    difference,

    absoluteDifference,

    percentageDifference,

    winner,
  };
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