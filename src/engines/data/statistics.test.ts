import { describe, expect, it } from "vitest";
import { calculateDatasetStatistics } from "./statistics";
import type { DatasetProfile } from "./profiler";
import type { ParsedDataset } from "../../types/dataset";

describe("calculateDatasetStatistics", () => {
  it("calculates numeric and categorical statistics deterministically", () => {
    const dataset: ParsedDataset = {
      fileName: "sample.csv",
      sheetName: "Sheet1",
      columns: ["amount", "region"],
      rowCount: 4,
      rows: [
        { amount: 10, region: "Dubai" },
        { amount: 20, region: "Dubai" },
        { amount: 30, region: "Abu Dhabi" },
        { amount: 40, region: "Dubai" },
      ],
    };

    const profile: DatasetProfile = {
      rowCount: 4,
      columnCount: 2,
      missingCellCount: 0,
      totalCellCount: 8,
      completenessPercentage: 100,
      duplicateRowCount: 0,
      columns: [
        {
          name: "amount",
          type: "number",
          typeConfidence: 1,
          totalCount: 4,
          nonNullCount: 4,
          missingCount: 0,
          missingPercentage: 0,
          uniqueCount: 4,
          uniquePercentage: 100,
          sampleValues: [10, 20, 30, 40],
        },
        {
          name: "region",
          type: "category",
          typeConfidence: 1,
          totalCount: 4,
          nonNullCount: 4,
          missingCount: 0,
          missingPercentage: 0,
          uniqueCount: 2,
          uniquePercentage: 50,
          sampleValues: ["Dubai", "Abu Dhabi"],
        },
      ],
    };

    const result = calculateDatasetStatistics(dataset, profile);

    expect(result.numeric).toHaveLength(1);
    expect(result.numeric[0]).toMatchObject({
      column: "amount",
      count: 4,
      min: 10,
      max: 40,
      range: 30,
      sum: 100,
      mean: 25,
      median: 25,
      q1: 17.5,
      q3: 32.5,
    });

    expect(result.categorical).toHaveLength(1);
    expect(result.categorical[0]).toMatchObject({
      column: "region",
      count: 4,
      uniqueCount: 2,
      topValue: "Dubai",
      topCount: 3,
      topPercentage: 75,
    });
  });
});
