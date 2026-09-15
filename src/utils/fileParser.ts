import * as XLSX from "xlsx";

import type {
  DataRow,
  DataValue,
  ParsedDataset,
} from "../types/dataset";

export async function parseDataFile(
  file: File
): Promise<ParsedDataset> {
  const buffer =
    await file.arrayBuffer();

  const workbook = XLSX.read(
    buffer,
    {
      type: "array",
      cellDates: true,
    }
  );

  const sheetName =
    workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(
      "No worksheet found in this file."
    );
  }

  const worksheet =
    workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(
      "Unable to read worksheet."
    );
  }

  const rawRows =
    XLSX.utils.sheet_to_json<
      Record<string, unknown>
    >(worksheet, {
      defval: null,
      raw: true,
    });

  if (rawRows.length === 0) {
    throw new Error(
      "The spreadsheet contains no data."
    );
  }

  const columns =
    Array.from(
      new Set(
        rawRows.flatMap((row) =>
          Object.keys(row)
        )
      )
    );

  const rows: DataRow[] =
    rawRows.map((row) => {
      const normalizedRow:
        DataRow = {};

      columns.forEach(
        (column) => {
          normalizedRow[column] =
            normalizeValue(
              row[column]
            );
        }
      );

      return normalizedRow;
    });

  return {
    fileName: file.name,
    sheetName,
    columns,
    rows,
    rowCount: rows.length,
  };
}

function normalizeValue(
  value: unknown
): DataValue {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return String(value);
}