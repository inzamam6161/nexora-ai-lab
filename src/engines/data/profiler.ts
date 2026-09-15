import type {
  DataRow,
  DataValue,
  ParsedDataset,
} from "../../types/dataset";

export type ColumnType =
  | "number"
  | "text"
  | "date"
  | "boolean"
  | "category"
  | "id"
  | "mixed"
  | "empty";

export type NumericStats = {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
};

export type TypeInference = {
  type: ColumnType;
  confidence: number;
};

export type ColumnProfile = {
  name: string;

  type: ColumnType;
  typeConfidence: number;

  totalCount: number;
  nonNullCount: number;

  missingCount: number;
  missingPercentage: number;

  uniqueCount: number;
  uniquePercentage: number;

  sampleValues: DataValue[];

  numericStats?: NumericStats;
};

export type DatasetProfile = {
  rowCount: number;
  columnCount: number;

  missingCellCount: number;
  totalCellCount: number;

  completenessPercentage: number;

  duplicateRowCount: number;

  columns: ColumnProfile[];
};

export function profileDataset(
  dataset: ParsedDataset
): DatasetProfile {
  const columns =
    dataset.columns.map((columnName) =>
      profileColumn(
        columnName,
        dataset.rows
      )
    );

  const totalCellCount =
    dataset.rowCount *
    dataset.columns.length;

  const missingCellCount =
    columns.reduce(
      (total, column) =>
        total +
        column.missingCount,
      0
    );

  const completenessPercentage =
    totalCellCount === 0
      ? 100
      : ((totalCellCount -
          missingCellCount) /
          totalCellCount) *
        100;

  return {
    rowCount: dataset.rowCount,

    columnCount:
      dataset.columns.length,

    missingCellCount,

    totalCellCount,

    completenessPercentage:
      round(
        completenessPercentage,
        1
      ),

    duplicateRowCount:
      countDuplicateRows(
        dataset.rows,
        dataset.columns
      ),

    columns,
  };
}

function profileColumn(
  columnName: string,
  rows: DataRow[]
): ColumnProfile {
  const values =
    rows.map(
      (row) =>
        row[columnName] ?? null
    );

  const nonNullValues =
    values.filter(
      (value) =>
        !isMissing(value)
    );

  const missingCount =
    values.length -
    nonNullValues.length;

  const uniqueValues =
    getUniqueValues(
      nonNullValues
    );

  const inference =
    inferColumnType(
      columnName,
      nonNullValues
    );

  const numericValues =
    inference.type === "number"
      ? extractNumericValues(
          nonNullValues
        )
      : [];

  return {
    name: columnName,

    type: inference.type,

    typeConfidence:
      inference.confidence,

    totalCount:
      values.length,

    nonNullCount:
      nonNullValues.length,

    missingCount,

    missingPercentage:
      values.length === 0
        ? 0
        : round(
            (missingCount /
              values.length) *
              100,
            1
          ),

    uniqueCount:
      uniqueValues.length,

    uniquePercentage:
      nonNullValues.length === 0
        ? 0
        : round(
            (uniqueValues.length /
              nonNullValues.length) *
              100,
            1
          ),

    sampleValues:
      uniqueValues.slice(0, 5),

    numericStats:
      numericValues.length > 0
        ? calculateNumericStats(
            numericValues
          )
        : undefined,
  };
}

function inferColumnType(
  columnName: string,
  values: DataValue[]
): TypeInference {
  if (values.length === 0) {
    return {
      type: "empty",
      confidence: 100,
    };
  }

  const sample =
    values.slice(0, 100);

  const scores = {
    number: 0,
    date: 0,
    boolean: 0,
    text: 0,
  };

  sample.forEach((value) => {
    if (isBooleanLike(value)) {
      scores.boolean += 1;
      return;
    }

    if (isNumberLike(value)) {
      scores.number += 1;
      return;
    }

    if (isDateLike(value)) {
      scores.date += 1;
      return;
    }

    scores.text += 1;
  });

  const total =
    sample.length;

  const numberRatio =
    scores.number / total;

  const dateRatio =
    scores.date / total;

  const booleanRatio =
    scores.boolean / total;

  const textRatio =
    scores.text / total;

  if (booleanRatio >= 0.9) {
    return {
      type: "boolean",
      confidence:
        percentage(
          booleanRatio
        ),
    };
  }

  if (numberRatio >= 0.9) {
    const uniqueCount =
      getUniqueValues(
        values
      ).length;

    if (
      looksLikeIdColumn(
        columnName,
        values,
        uniqueCount
      )
    ) {
      return {
        type: "id",
        confidence:
          percentage(
            numberRatio
          ),
      };
    }

    return {
      type: "number",
      confidence:
        percentage(
          numberRatio
        ),
    };
  }

  if (dateRatio >= 0.85) {
    return {
      type: "date",
      confidence:
        percentage(
          dateRatio
        ),
    };
  }

  if (textRatio >= 0.8) {
    const uniqueCount =
      getUniqueValues(
        values
      ).length;

    if (
      looksLikeIdColumn(
        columnName,
        values,
        uniqueCount
      )
    ) {
      return {
        type: "id",
        confidence:
          percentage(
            textRatio
          ),
      };
    }

    if (
      looksCategorical(
        values,
        uniqueCount
      )
    ) {
      return {
        type: "category",
        confidence:
          percentage(
            textRatio
          ),
      };
    }

    return {
      type: "text",
      confidence:
        percentage(
          textRatio
        ),
    };
  }

  return {
    type: "mixed",
    confidence:
      percentage(
        Math.max(
          numberRatio,
          dateRatio,
          booleanRatio,
          textRatio
        )
      ),
  };
}

function isNumberLike(
  value: DataValue
) {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(
      value
    );
  }

  if (
    typeof value !== "string"
  ) {
    return false;
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
    return false;
  }

  return (
    !Number.isNaN(
      Number(normalized)
    ) &&
    Number.isFinite(
      Number(normalized)
    )
  );
}

function isBooleanLike(
  value: DataValue
) {
  if (
    typeof value === "boolean"
  ) {
    return true;
  }

  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return [
    "true",
    "false",
    "yes",
    "no",
    "y",
    "n",
  ].includes(normalized);
}

function isDateLike(
  value: DataValue
) {
  if (
    value instanceof Date
  ) {
    return !Number.isNaN(
      value.getTime()
    );
  }

  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const text =
    value.trim();

  if (!text) {
    return false;
  }

  const datePatterns = [
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,
  ];

  const matchesPattern =
    datePatterns.some(
      (pattern) =>
        pattern.test(text)
    );

  if (!matchesPattern) {
    return false;
  }

  const parsed =
    Date.parse(text);

  return !Number.isNaN(
    parsed
  );
}

function looksCategorical(
  values: DataValue[],
  uniqueCount: number
) {
  if (
    values.length === 0
  ) {
    return false;
  }

  const ratio =
    uniqueCount /
    values.length;

  return (
    uniqueCount <= 30 ||
    ratio <= 0.2
  );
}

function looksLikeIdColumn(
  columnName: string,
  values: DataValue[],
  uniqueCount: number
) {
  const normalizedName =
    columnName
      .trim()
      .toLowerCase();

  const nameLooksLikeId =
    normalizedName === "id" ||
    normalizedName.endsWith(
      "_id"
    ) ||
    normalizedName.endsWith(
      " id"
    ) ||
    normalizedName.includes(
      "identifier"
    ) ||
    normalizedName.includes(
      "order number"
    ) ||
    normalizedName.includes(
      "reference"
    );

  if (!nameLooksLikeId) {
    return false;
  }

  const uniquenessRatio =
    uniqueCount /
    values.length;

  return uniquenessRatio >= 0.8;
}

function extractNumericValues(
  values: DataValue[]
) {
  return values
    .map((value) => {
      if (
        typeof value ===
        "number"
      ) {
        return value;
      }

      if (
        typeof value ===
        "string"
      ) {
        const normalized =
          value
            .trim()
            .replace(/,/g, "")
            .replace(
              /^[AED$€£₹]\s*/i,
              ""
            );

        const number =
          Number(normalized);

        return Number.isFinite(
          number
        )
          ? number
          : null;
      }

      return null;
    })
    .filter(
      (
        value
      ): value is number =>
        value !== null
    );
}

function calculateNumericStats(
  numbers: number[]
): NumericStats | undefined {
  if (
    numbers.length === 0
  ) {
    return undefined;
  }

  const sorted = [
    ...numbers,
  ].sort(
    (a, b) => a - b
  );

  const sum =
    numbers.reduce(
      (total, value) =>
        total + value,
      0
    );

  const mean =
    sum /
    numbers.length;

  const middle =
    Math.floor(
      sorted.length / 2
    );

  const median =
    sorted.length % 2 === 0
      ? (
          sorted[middle - 1] +
          sorted[middle]
        ) / 2
      : sorted[middle];

  return {
    min:
      sorted[0] ?? 0,

    max:
      sorted[
        sorted.length - 1
      ] ?? 0,

    mean:
      round(mean, 2),

    median:
      round(median, 2),

    sum:
      round(sum, 2),
  };
}

function getUniqueValues(
  values: DataValue[]
): DataValue[] {
  const seen =
    new Set<string>();

  const unique:
    DataValue[] = [];

  values.forEach((value) => {
    const key =
      serializeValue(value);

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  });

  return unique;
}

function countDuplicateRows(
  rows: DataRow[],
  columns: string[]
): number {
  const seen =
    new Set<string>();

  let duplicates = 0;

  rows.forEach((row) => {
    const key =
      columns
        .map((column) =>
          serializeValue(
            row[column] ?? null
          )
        )
        .join("|||");

    if (seen.has(key)) {
      duplicates += 1;
    } else {
      seen.add(key);
    }
  });

  return duplicates;
}

function isMissing(
  value: DataValue
) {
  return (
    value === null ||
    value === undefined ||
    (
      typeof value ===
        "string" &&
      value.trim() === ""
    )
  );
}

function serializeValue(
  value: DataValue
) {
  if (
    value instanceof Date
  ) {
    return `date:${value.toISOString()}`;
  }

  return `${typeof value}:${String(
    value
  )}`;
}

function percentage(
  ratio: number
) {
  return round(
    ratio * 100,
    1
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
      value * factor
    ) / factor
  );
}