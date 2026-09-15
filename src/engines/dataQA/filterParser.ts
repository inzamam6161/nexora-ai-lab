import type {
  DatasetProfile,
} from "../data/profiler";

import type {
  DatasetFilter,
} from "../data/filterEngine";

export type FilterParseResult = {
  filters:
    DatasetFilter[];

  confidence: number;

  explanations:
    string[];
};

export function parseQuestionFilters(
  question: string,
  profile: DatasetProfile
): FilterParseResult {
  const normalized =
    normalize(
      question
    );

  const filters:
    DatasetFilter[] =
      [];

  const explanations:
    string[] =
      [];

  detectNumericFilters(
    normalized,
    profile,
    filters,
    explanations
  );

  detectCategoryFilters(
    normalized,
    profile,
    filters,
    explanations
  );

  detectMonthFilters(
    normalized,
    profile,
    filters,
    explanations
  );

  detectYearFilters(
    normalized,
    profile,
    filters,
    explanations
  );

  return {
    filters:
      deduplicateFilters(
        filters
      ),

    confidence:
      filters.length >
      0
        ? 0.9
        : 0,

    explanations,
  };
}

function detectNumericFilters(
  question: string,
  profile: DatasetProfile,
  filters:
    DatasetFilter[],
  explanations:
    string[]
) {
  for (
    const column
    of profile.columns
  ) {
    if (
      column.type !==
      "number"
    ) {
      continue;
    }

    const name =
      normalize(
        column.name
      );

    const patterns = [
      {
        regex:
          new RegExp(
            `${escapeRegExp(
              name
            )}\\s+(?:above|over|greater than|more than)\\s+([\\d,.]+)`,
            "i"
          ),

        operator:
          "greater-than" as const,
      },

      {
        regex:
          new RegExp(
            `${escapeRegExp(
              name
            )}\\s+(?:below|under|less than)\\s+([\\d,.]+)`,
            "i"
          ),

        operator:
          "less-than" as const,
      },

      {
        regex:
          new RegExp(
            `${escapeRegExp(
              name
            )}\\s+(?:at least|minimum of)\\s+([\\d,.]+)`,
            "i"
          ),

        operator:
          "greater-than-or-equal" as const,
      },

      {
        regex:
          new RegExp(
            `${escapeRegExp(
              name
            )}\\s+(?:at most|maximum of)\\s+([\\d,.]+)`,
            "i"
          ),

        operator:
          "less-than-or-equal" as const,
      },

      {
        regex:
          new RegExp(
            `${escapeRegExp(
              name
            )}\\s+between\\s+([\\d,.]+)\\s+and\\s+([\\d,.]+)`,
            "i"
          ),

        operator:
          "between" as const,
      },
    ];

    for (
      const pattern
      of patterns
    ) {
      const match =
        question.match(
          pattern.regex
        );

      if (!match) {
        continue;
      }

      const first =
        parseNumericText(
          match[1]
        );

      if (
        first === null
      ) {
        continue;
      }

      if (
        pattern.operator ===
        "between"
      ) {
        const second =
          parseNumericText(
            match[2]
          );

        if (
          second === null
        ) {
          continue;
        }

        filters.push({
          column:
            column.name,

          operator:
            "between",

          value:
            first,

          secondValue:
            second,
        });

        explanations.push(
          `${column.name} filtered between ${first} and ${second}.`
        );

        continue;
      }

      filters.push({
        column:
          column.name,

        operator:
          pattern.operator,

        value:
          first,
      });

      explanations.push(
        `${column.name} filtered using ${pattern.operator} ${first}.`
      );
    }
  }
}

function detectCategoryFilters(
  question: string,
  profile: DatasetProfile,
  filters:
    DatasetFilter[],
  explanations:
    string[]
) {
  for (
    const column
    of profile.columns
  ) {
    if (
      column.type !==
        "category" &&
      column.type !==
        "text"
    ) {
      continue;
    }

    const sampleValues =
      column.sampleValues
        .filter(
          (
            value
          ): value is
            | string
            | number
            | boolean =>
            value !==
              null &&
            !(value instanceof Date)
        )
        .map(
          (value) =>
            String(value)
              .trim()
        )
        .filter(Boolean);

    for (
      const value
      of sampleValues
    ) {
      if (
        containsPhrase(
          question,
          value
        )
      ) {
        filters.push({
          column:
            column.name,

          operator:
            "equals",

          value,
        });

        explanations.push(
          `${column.name} filtered to ${value}.`
        );

        break;
      }
    }
  }
}

function detectMonthFilters(
  question: string,
  profile: DatasetProfile,
  filters:
    DatasetFilter[],
  explanations:
    string[]
) {
  const dateColumn =
    profile.columns.find(
      (column) =>
        column.type ===
        "date"
    );

  if (!dateColumn) {
    return;
  }

  const months = [
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

  const month =
    months.find(
      (candidate) =>
        containsPhrase(
          question,
          candidate
        )
    );

  if (!month) {
    return;
  }

  filters.push({
    column:
      dateColumn.name,

    operator:
      "date-month",

    value:
      month,
  });

  explanations.push(
    `${dateColumn.name} filtered to ${month}.`
  );
}

function detectYearFilters(
  question: string,
  profile: DatasetProfile,
  filters:
    DatasetFilter[],
  explanations:
    string[]
) {
  const dateColumn =
    profile.columns.find(
      (column) =>
        column.type ===
        "date"
    );

  if (!dateColumn) {
    return;
  }

  const matches =
    question.match(
      /\b(19|20)\d{2}\b/g
    );

  if (
    !matches ||
    matches.length ===
      0
  ) {
    return;
  }

  const year =
    Number(
      matches[0]
    );

  filters.push({
    column:
      dateColumn.name,

    operator:
      "date-year",

    value:
      year,
  });

  explanations.push(
    `${dateColumn.name} filtered to year ${year}.`
  );
}

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /[^\p{L}\p{N}\s,.]/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function containsPhrase(
  question: string,
  value: string
) {
  const normalizedValue =
    normalize(
      value
    );

  const regex =
    new RegExp(
      `(^|\\s)${escapeRegExp(
        normalizedValue
      )}(?=\\s|$)`,
      "i"
    );

  return regex.test(
    question
  );
}

function parseNumericText(
  value:
    | string
    | undefined
): number | null {
  if (!value) {
    return null;
  }

  const parsed =
    Number(
      value.replace(
        /,/g,
        ""
      )
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function deduplicateFilters(
  filters:
    DatasetFilter[]
) {
  const seen =
    new Set<string>();

  return filters.filter(
    (filter) => {
      const key =
        JSON.stringify(
          filter
        );

      if (
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}

function escapeRegExp(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}