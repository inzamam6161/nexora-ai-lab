import type {
  DataValue,
} from "../types/dataset";

export function parseNumericValue(
  value: DataValue | unknown
): number | null {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : null;
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  let normalized =
    value
      .trim()
      .replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  let isNegative =
    false;

  if (
    normalized.startsWith("(") &&
    normalized.endsWith(")")
  ) {
    isNegative =
      true;

    normalized =
      normalized.slice(
        1,
        -1
      );
  }

  normalized =
    normalized
      .replace(
        /^(?:AED|USD|EUR|GBP|INR)\s*/i,
        ""
      )
      .replace(
        /^[\$€£₹]\s*/,
        ""
      )
      .replace(
        /\s*(?:AED|USD|EUR|GBP|INR)$/i,
        ""
      )
      .replace(
        /[%\s]/g,
        "");

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return null;
  }

  return isNegative
    ? -parsed
    : parsed;
}

export function parseDateValue(
  value: DataValue | unknown
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
    typeof value !== "string"
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

export function normalizeGroupValue(
  value: DataValue | unknown
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
      .toISOString()
      .slice(
        0,
        10
      );
  }

  const text =
    String(value)
      .trim();

  return text ||
    null;
}

export function isMissingValue(
  value: DataValue | unknown
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