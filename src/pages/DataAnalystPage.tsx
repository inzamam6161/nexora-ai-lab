import {
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import ChartView
  from "../components/tools/ChartView";

import {
  recommendCharts,
} from "../engines/data/chartRecommender";

import type {
  ChartRecommendationReport,
} from "../engines/data/chartRecommender";

import InsightView
  from "../components/tools/InsightView";

import {
  generateInsights,
} from "../engines/data/insightGenerator";

import type {
  InsightReport,
} from "../engines/data/insightGenerator";

import TrendView
  from "../components/tools/TrendView";

import {
  analyzeDatasetTrends,
} from "../engines/data/trendAnalyzer";

import type {
  DatasetTrendReport,
} from "../engines/data/trendAnalyzer";

import AnomalyView
  from "../components/tools/AnomalyView";

import {
  detectDatasetAnomalies,
} from "../engines/data/anomalyDetector";

import type {
  DatasetAnomalyReport,
} from "../engines/data/anomalyDetector";

import DatasetStatisticsView
  from "../components/tools/DatasetStatisticsView";

import {
  calculateDatasetStatistics,
} from "../engines/data/statistics";

import type {
  DatasetStatistics,
} from "../engines/data/statistics";

import DatasetProfileView
  from "../components/tools/DatasetProfileView";

import {
  profileDataset,
} from "../engines/data/profiler";

import type {
  DatasetProfile,
} from "../engines/data/profiler";

import FileDropzone
  from "../components/shared/FileDropzone";
import ExampleFileButton from "../components/shared/ExampleFileButton";

import InputPanel
  from "../components/tools/InputPanel";

import ResultPanel
  from "../components/tools/ResultPanel";

import ToolIntro
  from "../components/tools/ToolIntro";

import {
  tools,
} from "../data/tools";

import {
  parseDataFile,
} from "../utils/fileParser";

import type {
  ParsedDataset,
} from "../types/dataset";

type DataAnalystPageProps = {
  onBack: () => void;
};

export default function DataAnalystPage({
  onBack,
}: DataAnalystPageProps) {
    const [dataset, setDataset] =
        useState<ParsedDataset | null>(
        null
        );

    const [ profile, setProfile] = useState<DatasetProfile | null>(null);

    const [ statistics, setStatistics ] = useState<DatasetStatistics | null>(null);

    const [ anomalyReport, setAnomalyReport ] = useState<DatasetAnomalyReport | null>(null);

    const [ trendReport, setTrendReport ] = useState<DatasetTrendReport | null>(null);

    const [ insightReport,setInsightReport ] = useState<InsightReport | null>(null);
    const [ chartReport, setChartReport] = useState<ChartRecommendationReport | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const tool = tools.find(
    (item) =>
      item.id === "data-analyst"
  );

  if (!tool) {
    return null;
  }

async function handleFiles(
  files: File[]
) {
  const file = files[0];

  if (!file) {
    setDataset(null);
    setProfile(null);
    setStatistics(null);
    setError(null);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const parsed =
      await parseDataFile(file);

    const generatedProfile =
      profileDataset(parsed);

    const generatedStatistics =
        calculateDatasetStatistics(
            parsed,
            generatedProfile
        );

    const generatedAnomalies =
    detectDatasetAnomalies(
        parsed,
        generatedProfile
    );

    const generatedTrends =
    analyzeDatasetTrends(
        parsed,
        generatedProfile
    );

    const generatedInsights =
    generateInsights(
        generatedProfile,
        generatedStatistics,
        generatedAnomalies,
        generatedTrends
    );

    const generatedCharts =
    recommendCharts(
        parsed,
        generatedProfile,
        generatedStatistics,
        generatedTrends
    );

    setDataset(parsed);

    setProfile(
      generatedProfile
    );

    setStatistics(
      generatedStatistics
    );

    setAnomalyReport(
        generatedAnomalies
    );

    setTrendReport(
        generatedTrends
    );

    setInsightReport(
        generatedInsights
    );
    
    setChartReport(
        generatedCharts
    );

  } catch (error) {
    setDataset(null);
    setProfile(null);
    setStatistics(null);
    setAnomalyReport(null);
    setTrendReport(null);
    setInsightReport(null);
    setChartReport(null);
    setError(
      error instanceof Error
        ? error.message
        : "Unable to analyze file."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <section className="tool-workspace">
      <button
        type="button"
        className="tool-workspace__back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Dashboard
      </button>

      <ToolIntro tool={tool} />

      <div className="tool-workspace__grid">
        <InputPanel
          title="Upload your dataset"
          description="Upload CSV or Excel data to begin analysis."
        >
          <FileDropzone
            accept=".csv,.xlsx,.xls"
            acceptedExtensions={[
              ".csv",
              ".xlsx",
              ".xls",
            ]}
            maxSizeMB={10}
            onFilesSelected={
              handleFiles
            }
          />
          <ExampleFileButton path="/examples/sales-analysis.csv" fileName="sales-analysis.csv" type="text/csv" onLoad={handleFiles} label="Try sample sales data" />
        </InputPanel>

        <ResultPanel
          status={
            loading
              ? "loading"
              : error
                ? "error"
                : dataset
                  ? "success"
                  : "empty"
          }
          errorMessage={
            error ?? undefined
          }
        >
        {dataset &&
            profile &&
            statistics &&
            anomalyReport &&
            trendReport &&
            insightReport && 
            chartReport &&(
                <>
                <DatasetPreview
                    dataset={dataset}
                />

                <InsightView
                    report={
                    insightReport
                    }
                />

                {chartReport && (
                    <ChartView
                        report={
                        chartReport
                        }
                    />
                )}

                <DatasetProfileView
                    profile={profile}
                />

                <DatasetStatisticsView
                    statistics={
                    statistics
                    }
                />

                <AnomalyView
                    report={
                    anomalyReport
                    }
                />

                <TrendView
                    report={
                    trendReport
                    }
                />
                </>
            )}
        </ResultPanel>
      </div>
    </section>
  );
}

type DatasetPreviewProps = {
  dataset: ParsedDataset;
};

function DatasetPreview({
  dataset,
}: DatasetPreviewProps) {
  return (
    <div className="dataset-preview">
      <div className="dataset-preview__stats">
        <div>
          <span>Rows</span>
          <strong>
            {dataset.rowCount}
          </strong>
        </div>

        <div>
          <span>Columns</span>
          <strong>
            {dataset.columns.length}
          </strong>
        </div>

        <div>
          <span>Sheet</span>
          <strong>
            {dataset.sheetName}
          </strong>
        </div>
      </div>

      <div className="dataset-preview__file">
        {dataset.fileName}
      </div>
    </div>
  );
}