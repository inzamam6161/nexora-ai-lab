import type {
  ParsedDataset,
} from "../../types/dataset";

import type {
  DatasetProfile,
} from "./profiler";

import type {
  DatasetStatistics,
} from "./statistics";

import type {
  DatasetTrendReport,
} from "./trendAnalyzer";

export type ChartType =
  | "bar"
  | "line"
  | "distribution";

export type ChartDatum = {
  label: string;
  value: number;
};

export type ChartRecommendation = {
  id: string;

  type: ChartType;

  title: string;

  description: string;

  categoryColumn?: string;
  numericColumn: string;

  data: ChartDatum[];

  priority: number;
};

export type ChartRecommendationReport = {
  charts: ChartRecommendation[];
};

export function recommendCharts(
  dataset: ParsedDataset,
  profile: DatasetProfile,
  statistics: DatasetStatistics,
  trends: DatasetTrendReport
): ChartRecommendationReport {
  const charts: ChartRecommendation[] = [];

  addTrendCharts(
    charts,
    trends
  );

  addCategoryCharts(
    charts,
    dataset,
    profile
  );

  addDistributionCharts(
    charts,
    statistics
  );

  const uniqueCharts =
    removeDuplicateCharts(
      charts
    );

  return {
    charts:
      uniqueCharts
        .sort(
          (a, b) =>
            b.priority -
            a.priority
        )
        .slice(0, 8),
  };
}

function addTrendCharts(
  charts: ChartRecommendation[],
  trends: DatasetTrendReport
) {
  for (const trend of trends.trends) {
    if (
      trend.points.length < 2
    ) {
      continue;
    }

    charts.push({
      id:
        `trend-${trend.dateColumn}-${trend.valueColumn}`,

      type:
        "line",

      title:
        `${trend.valueColumn} over time`,

      description:
        `Shows how ${trend.valueColumn} changes across ${trend.dateColumn}.`,

      categoryColumn:
        trend.dateColumn,

      numericColumn:
        trend.valueColumn,

      data:
        trend.points.map(
          (point) => ({
            label:
              point.date,

            value:
              point.value,
          })
        ),

      priority: 100,
    });
  }
}

function addCategoryCharts(
  charts: ChartRecommendation[],
  dataset: ParsedDataset,
  profile: DatasetProfile
) {
  const categories =
    profile.columns.filter(
      (column) =>
        column.type ===
          "category" ||
        column.type ===
          "boolean"
    );

  const numericColumns =
    profile.columns.filter(
      (column) =>
        column.type ===
        "number"
    );

  for (
    const category
    of categories
  ) {
    for (
      const numeric
      of numericColumns
    ) {
      const aggregated =
        aggregateByCategory(
          dataset,
          category.name,
          numeric.name
        );

      if (
        aggregated.length < 2 ||
        aggregated.length > 15
      ) {
        continue;
      }

      charts.push({
        id:
          `bar-${category.name}-${numeric.name}`,

        type:
          "bar",

        title:
          `${numeric.name} by ${category.name}`,

        description:
          `Compares total ${numeric.name} across ${category.name}.`,

        categoryColumn:
          category.name,

        numericColumn:
          numeric.name,

        data:
          aggregated,

        priority: 80,
      });
    }
  }
}

function addDistributionCharts(
  charts: ChartRecommendation[],
  statistics: DatasetStatistics
) {
  for (
    const numeric
    of statistics.numeric
  ) {
    if (
      numeric.count < 5
    ) {
      continue;
    }

    charts.push({
      id:
        `distribution-${numeric.column}`,

      type:
        "distribution",

      title:
        `${numeric.column} distribution`,

      description:
        `Shows how ${numeric.column} values are distributed.`,

      numericColumn:
        numeric.column,

      data: [
        {
          label: "Min",
          value:
            numeric.min,
        },
        {
          label: "Q1",
          value:
            numeric.q1,
        },
        {
          label: "Median",
          value:
            numeric.median,
        },
        {
          label: "Q3",
          value:
            numeric.q3,
        },
        {
          label: "Max",
          value:
            numeric.max,
        },
      ],

      priority: 50,
    });
  }
}

function aggregateByCategory(
  dataset: ParsedDataset,
  categoryColumn: string,
  numericColumn: string
): ChartDatum[] {
  const groups =
    new Map<
      string,
      number
    >();

  for (
    const row
    of dataset.rows
  ) {
    const category =
      normalizeCategory(
        row[
          categoryColumn
        ]
      );

    const value =
      parseNumber(
        row[
          numericColumn
        ]
      );

    if (
      category === null ||
      value === null
    ) {
      continue;
    }

    groups.set(
      category,
      (
        groups.get(
          category
        ) ?? 0
      ) + value
    );
  }

  return Array.from(
    groups.entries()
  )
    .map(
      ([label, value]) => ({
        label,

        value:
          round(
            value,
            2
          ),
      })
    )
    .sort(
      (a, b) =>
        b.value -
        a.value
    );
}

function normalizeCategory(
  value: unknown
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
      .slice(0, 10);
  }

  const result =
    String(value)
      .trim();

  return result ||
    null;
}

function parseNumber(
  value: unknown
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
        /^(?:AED|USD|EUR|GBP|INR|\$|€|£|₹)\s*/i,
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

function removeDuplicateCharts(
  charts: ChartRecommendation[]
) {
  const seen =
    new Set<string>();

  return charts.filter(
    (chart) => {
      if (
        seen.has(
          chart.id
        )
      ) {
        return false;
      }

      seen.add(
        chart.id
      );

      return true;
    }
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