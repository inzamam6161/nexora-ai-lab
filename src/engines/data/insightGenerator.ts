import type {
  DatasetProfile,
} from "./profiler";

import type {
  DatasetStatistics,
} from "./statistics";

import type {
  DatasetAnomalyReport,
} from "./anomalyDetector";

import type {
  DatasetTrendReport,
} from "./trendAnalyzer";

export type InsightType =
  | "quality"
  | "trend"
  | "category"
  | "anomaly"
  | "statistics";

export type InsightPriority =
  | "high"
  | "medium"
  | "low";

export type GeneratedInsight = {
  id: string;

  type: InsightType;

  priority: InsightPriority;

  title: string;

  description: string;

  value?: string | number;

  relatedColumn?: string;
};

export type InsightReport = {
  insights: GeneratedInsight[];

  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
};

export function generateInsights(
  profile: DatasetProfile,
  statistics: DatasetStatistics,
  anomalies: DatasetAnomalyReport,
  trends: DatasetTrendReport
): InsightReport {
  const insights: GeneratedInsight[] = [];

  addQualityInsights(
    insights,
    profile
  );

  addTrendInsights(
    insights,
    trends
  );

  addCategoryInsights(
    insights,
    statistics
  );

  addAnomalyInsights(
    insights,
    anomalies
  );

  addNumericInsights(
    insights,
    statistics
  );

  const sorted =
    insights.sort(
      (a, b) =>
        priorityRank(
          b.priority
        ) -
        priorityRank(
          a.priority
        )
    );

  return {
    insights: sorted,

    highPriorityCount:
      sorted.filter(
        (item) =>
          item.priority ===
          "high"
      ).length,

    mediumPriorityCount:
      sorted.filter(
        (item) =>
          item.priority ===
          "medium"
      ).length,

    lowPriorityCount:
      sorted.filter(
        (item) =>
          item.priority ===
          "low"
      ).length,
  };
}

function addQualityInsights(
  insights: GeneratedInsight[],
  profile: DatasetProfile
) {
  insights.push({
    id: "dataset-completeness",

    type: "quality",

    priority:
      profile.completenessPercentage <
      90
        ? "high"
        : profile.completenessPercentage <
            98
          ? "medium"
          : "low",

    title:
      "Dataset completeness",

    description:
      `The dataset is ${profile.completenessPercentage}% complete.`,

    value:
      `${profile.completenessPercentage}%`,
  });

  if (
    profile.missingCellCount >
    0
  ) {
    insights.push({
      id: "missing-values",

      type: "quality",

      priority:
        profile.completenessPercentage <
        90
          ? "high"
          : "medium",

      title:
        "Missing values detected",

      description:
        `${profile.missingCellCount} cells are missing across the dataset.`,

      value:
        profile.missingCellCount,
    });
  }

  if (
    profile.duplicateRowCount >
    0
  ) {
    insights.push({
      id: "duplicate-rows",

      type: "quality",

      priority:
        profile.duplicateRowCount >
        Math.max(
          5,
          profile.rowCount *
            0.05
        )
          ? "high"
          : "medium",

      title:
        "Duplicate records detected",

      description:
        `${profile.duplicateRowCount} duplicate rows were found.`,

      value:
        profile.duplicateRowCount,
    });
  }

  for (
    const column
    of profile.columns
  ) {
    if (
      column.missingPercentage >=
      20
    ) {
      insights.push({
        id:
          `missing-${column.name}`,

        type:
          "quality",

        priority:
          column.missingPercentage >=
          40
            ? "high"
            : "medium",

        title:
          `${column.name} has missing data`,

        description:
          `${column.missingPercentage}% of values in ${column.name} are missing.`,

        value:
          `${column.missingPercentage}%`,

        relatedColumn:
          column.name,
      });
    }
  }
}

function addTrendInsights(
  insights: GeneratedInsight[],
  trends: DatasetTrendReport
) {
  for (
    const trend
    of trends.trends
  ) {
    if (
      trend.percentageChange ===
      null
    ) {
      continue;
    }

    const change =
      Math.abs(
        trend.percentageChange
      );

    const priority:
      InsightPriority =
        change >= 30
          ? "high"
          : change >= 10
            ? "medium"
            : "low";

    if (
      trend.direction === "up"
    ) {
      insights.push({
        id:
          `trend-up-${trend.dateColumn}-${trend.valueColumn}`,

        type:
          "trend",

        priority,

        title:
          `${trend.valueColumn} is growing`,

        description:
          `${trend.valueColumn} increased by ${formatNumber(
            change
          )}% from ${formatNumber(
            trend.firstValue
          )} to ${formatNumber(
            trend.lastValue
          )}.`,

        value:
          `+${formatNumber(
            trend.percentageChange
          )}%`,

        relatedColumn:
          trend.valueColumn,
      });
    }

    if (
      trend.direction === "down"
    ) {
      insights.push({
        id:
          `trend-down-${trend.dateColumn}-${trend.valueColumn}`,

        type:
          "trend",

        priority,

        title:
          `${trend.valueColumn} is declining`,

        description:
          `${trend.valueColumn} decreased by ${formatNumber(
            change
          )}% from ${formatNumber(
            trend.firstValue
          )} to ${formatNumber(
            trend.lastValue
          )}.`,

        value:
          `${formatNumber(
            trend.percentageChange
          )}%`,

        relatedColumn:
          trend.valueColumn,
      });
    }

    if (
      trend.direction ===
      "flat"
    ) {
      insights.push({
        id:
          `trend-flat-${trend.dateColumn}-${trend.valueColumn}`,

        type:
          "trend",

        priority:
          "low",

        title:
          `${trend.valueColumn} is stable`,

        description:
          `${trend.valueColumn} changed by only ${formatNumber(
            change
          )}% across the observed period.`,

        value:
          `${formatNumber(
            trend.percentageChange
          )}%`,

        relatedColumn:
          trend.valueColumn,
      });
    }

    if (
      trend.strongestPeriod
    ) {
      insights.push({
        id:
          `strongest-${trend.dateColumn}-${trend.valueColumn}`,

        type:
          "trend",

        priority:
          "low",

        title:
          `Strongest ${trend.valueColumn} period`,

        description:
          `${trend.valueColumn} reached its highest observed value of ${formatNumber(
            trend.strongestPeriod
              .value
          )} on ${trend.strongestPeriod.date}.`,

        value:
          formatNumber(
            trend.strongestPeriod
              .value
          ),

        relatedColumn:
          trend.valueColumn,
      });
    }
  }
}

function addCategoryInsights(
  insights: GeneratedInsight[],
  statistics: DatasetStatistics
) {
  for (
    const category
    of statistics.categorical
  ) {
    if (
      !category.topValue
    ) {
      continue;
    }

    const dominant =
      category.topPercentage >=
      50;

    insights.push({
      id:
        `category-${category.column}`,

      type:
        "category",

      priority:
        category.topPercentage >=
        70
          ? "medium"
          : "low",

      title:
        dominant
          ? `${category.topValue} dominates ${category.column}`
          : `Top ${category.column}: ${category.topValue}`,

      description:
        `${category.topValue} represents ${category.topPercentage}% of non-empty ${category.column} values.`,

      value:
        `${category.topPercentage}%`,

      relatedColumn:
        category.column,
    });
  }
}

function addAnomalyInsights(
  insights: GeneratedInsight[],
  anomalies: DatasetAnomalyReport
) {
  for (
    const column
    of anomalies.columns
  ) {
    const high =
      column.anomalies.filter(
        (anomaly) =>
          anomaly.severity ===
          "high"
      ).length;

    const medium =
      column.anomalies.filter(
        (anomaly) =>
          anomaly.severity ===
          "medium"
      ).length;

    const priority:
      InsightPriority =
        high > 0
          ? "high"
          : medium > 0
            ? "medium"
            : "low";

    insights.push({
      id:
        `anomaly-${column.column}`,

      type:
        "anomaly",

      priority,

      title:
        `${column.anomalyCount} unusual ${column.column} value${
          column.anomalyCount ===
          1
            ? ""
            : "s"
        } detected`,

      description:
        `${column.anomalyPercentage}% of numeric ${column.column} values were flagged as unusual.`,

      value:
        column.anomalyCount,

      relatedColumn:
        column.column,
    });
  }
}

function addNumericInsights(
  insights: GeneratedInsight[],
  statistics: DatasetStatistics
) {
  for (
    const numeric
    of statistics.numeric
  ) {
    if (
      numeric.mean === 0
    ) {
      continue;
    }

    const relativeSpread =
      Math.abs(
        numeric.standardDeviation /
        numeric.mean
      );

    if (
      relativeSpread >= 1
    ) {
      insights.push({
        id:
          `spread-${numeric.column}`,

        type:
          "statistics",

        priority:
          "medium",

        title:
          `${numeric.column} varies widely`,

        description:
          `${numeric.column} has high variability relative to its average value.`,

        value:
          formatNumber(
            numeric.standardDeviation
          ),

        relatedColumn:
          numeric.column,
      });
    }
  }
}

function priorityRank(
  priority: InsightPriority
) {
  if (
    priority === "high"
  ) {
    return 3;
  }

  if (
    priority === "medium"
  ) {
    return 2;
  }

  return 1;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}