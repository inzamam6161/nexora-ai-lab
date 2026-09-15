import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BarChart3,
  Database,
  Lightbulb,
  MessageSquareText,
  Send,
} from "lucide-react";

import FileDropzone
  from "../components/shared/FileDropzone";
import ExampleFileButton from "../components/shared/ExampleFileButton";

import DatasetPreview
  from "../components/tools/DatasetPreview";

import {
  parseDataFile,
} from "../utils/fileParser";

import {
  profileDataset,
} from "../engines/data/profiler";

import {
  answerDataQuestion,
} from "../engines/dataQA/queryEngine";

import type {
  ParsedDataset,
} from "../types/dataset";

import type {
  DatasetProfile,
} from "../engines/data/profiler";

import type {
  DataQAResult,
} from "../engines/dataQA/queryEngine";

type DataQAPageProps = {
  onBack: () => void;
};

export default function DataQAPage({
  onBack,
}: DataQAPageProps) {
  const [
    dataset,
    setDataset,
  ] =
    useState<ParsedDataset | null>(
      null
    );

  const [
    profile,
    setProfile,
  ] =
    useState<DatasetProfile | null>(
      null
    );

  const [
    question,
    setQuestion,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState<DataQAResult | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const suggestedQuestions =
    useMemo(
      () =>
        buildSuggestedQuestions(
          profile
        ),
      [profile]
    );

  async function handleFiles(
    files: File[]
  ) {
    const file =
      files[0];

    if (!file) {
      clearDataset();

      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setQuestion("");

      const parsed =
        await parseDataFile(
          file
        );

      const generatedProfile =
        profileDataset(
          parsed
        );

      setDataset(
        parsed
      );

      setProfile(
        generatedProfile
      );
    } catch (
      caughtError
    ) {
      clearDataset();

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The dataset could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAsk() {
    if (
      !dataset ||
      !profile
    ) {
      setError(
        "Upload a dataset before asking a question."
      );

      return;
    }

    const trimmed =
      question.trim();

    if (!trimmed) {
      setError(
        "Enter a question about your dataset."
      );

      return;
    }

    setError(null);

    const generatedResult =
      answerDataQuestion(
        trimmed,
        dataset,
        profile
      );

    setResult(
      generatedResult
    );
  }

  function handleSuggestedQuestion(
    suggestedQuestion:
      string
  ) {
    setQuestion(
      suggestedQuestion
    );

    if (
      !dataset ||
      !profile
    ) {
      return;
    }

    const generatedResult =
      answerDataQuestion(
        suggestedQuestion,
        dataset,
        profile
      );

    setResult(
      generatedResult
    );

    setError(null);
  }

  function clearDataset() {
    setDataset(null);
    setProfile(null);
    setQuestion("");
    setResult(null);
  }

  return (
    <section className="data-qa-page">
      <header className="data-qa-page__header">
        <button
          type="button"
          className="data-qa-page__back"
          onClick={
            onBack
          }
        >
          <ArrowLeft
            size={16}
          />

          Back
        </button>

        <div className="data-qa-page__title">
          <span className="eyebrow">
            DATA INTELLIGENCE
          </span>

          <h1>
            Data Q&A
          </h1>

          <p>
            Upload a dataset and
            ask plain-English
            questions about the
            numbers inside it.
          </p>
        </div>
      </header>

      <div className="data-qa-page__intro">
        <InfoCard
          icon={
            Database
          }
          title="What you provide"
          text="CSV or Excel dataset"
        />

        <InfoCard
          icon={
            MessageSquareText
          }
          title="What you ask"
          text="Questions about totals, averages, rankings and groups"
        />

        <InfoCard
          icon={
            BarChart3
          }
          title="What you get"
          text="Answer, calculation, reasoning and chart"
        />
      </div>

      <div className="data-qa-layout">
        <div className="data-qa-layout__main">
          <section className="data-qa-panel">
            <div className="data-qa-panel__header">
              <div>
                <span className="eyebrow">
                  STEP 01
                </span>

                <h2>
                  Upload dataset
                </h2>
              </div>

              {dataset && (
                <span className="data-qa-panel__status">
                  {
                    dataset.rowCount
                  }{" "}
                  rows
                </span>
              )}
            </div>

            <FileDropzone
              accept=".csv,.xlsx,.xls"
              acceptedExtensions={[".csv", ".xlsx", ".xls"]}
              maxSizeMB={
                10
              }
              multiple={
                false
              }
              onFilesSelected={handleFiles}
            />

            <ExampleFileButton path="/examples/uae-sales-data.csv" fileName="uae-sales-data.csv" type="text/csv" onLoad={handleFiles} label="Try sample UAE sales data" />

            {loading && (
              <div className="data-qa-message">
                Reading and
                profiling dataset...
              </div>
            )}

            {error && (
              <div className="data-qa-error">
                {error}
              </div>
            )}
          </section>

          {dataset &&
            profile && (
            <>
              <DatasetPreview
                dataset={
                  dataset
                }
              />

              <section className="data-qa-panel">
                <div className="data-qa-panel__header">
                  <div>
                    <span className="eyebrow">
                      STEP 02
                    </span>

                    <h2>
                      Ask your data
                    </h2>
                  </div>
                </div>

                <div className="data-qa-question-box">
                  <textarea
                    value={
                      question
                    }
                    onChange={(
                      event
                    ) =>
                      setQuestion(
                        event
                          .target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        handleAsk();
                      }
                    }}
                    placeholder="Example: Which region generated the most revenue?"
                    rows={3}
                  />

                  <button
                    type="button"
                    onClick={
                      handleAsk
                    }
                    disabled={
                      !question.trim()
                    }
                  >
                    <Send
                      size={15}
                    />

                    Ask
                  </button>
                </div>

                {suggestedQuestions.length >
                  0 && (
                  <div className="data-qa-suggestions">
                    <div className="data-qa-suggestions__title">
                      <Lightbulb
                        size={13}
                      />

                      Try asking
                    </div>

                    <div className="data-qa-suggestions__list">
                      {suggestedQuestions.map(
                        (
                          suggestion
                        ) => (
                          <button
                            key={
                              suggestion
                            }
                            type="button"
                            onClick={() =>
                              handleSuggestedQuestion(
                                suggestion
                              )
                            }
                          >
                            {
                              suggestion
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </section>

              {result && (
                <DataQAResultView
                  result={
                    result
                  }
                />
              )}
            </>
          )}
        </div>

        {profile && (
          <aside className="data-qa-sidebar">
            <DatasetContext
              profile={
                profile
              }
            />
          </aside>
        )}
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon:
    typeof Database;
  title: string;
  text: string;
}) {
  return (
    <div className="data-qa-info-card">
      <div className="data-qa-info-card__icon">
        <Icon
          size={16}
        />
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </div>
    </div>
  );
}

function DatasetContext({
  profile,
}: {
  profile:
    DatasetProfile;
}) {
  return (
    <section className="data-qa-context">
      <span className="eyebrow">
        DATASET CONTEXT
      </span>

      <h3>
        Columns Nexora understands
      </h3>

      <div className="data-qa-context__summary">
        <div>
          <strong>
            {
              profile.rowCount
            }
          </strong>

          <span>
            Rows
          </span>
        </div>

        <div>
          <strong>
            {
              profile.columnCount
            }
          </strong>

          <span>
            Columns
          </span>
        </div>
      </div>

      <div className="data-qa-columns">
        {profile.columns.map(
          (column) => (
            <div
              key={
                column.name
              }
              className="data-qa-column"
            >
              <div>
                <strong>
                  {
                    column.name
                  }
                </strong>

                <span>
                  {
                    column.type
                  }
                </span>
              </div>

              <span>
                {
                  column.typeConfidence
                }
                %
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function DataQAResultView({
  result,
}: {
  result:
    DataQAResult;
}) {
  if (
    !result.success
  ) {
    return (
      <section className="data-qa-result data-qa-result--failed">
        <span className="eyebrow">
          RESULT
        </span>

        <h2>
          I couldn't answer that
          confidently
        </h2>

        <p>
          {
            result.answer
          }
        </p>

        {result.reasoning.map(
          (
            item,
            index
          ) => (
            <div
              key={
                index
              }
              className="data-qa-reason"
            >
              {item}
            </div>
          )
        )}
      </section>
    );
  }

  return (
    <section className="data-qa-result">
      <span className="eyebrow">
        ANSWER
      </span>

      <div className="data-qa-answer">
        <MessageSquareText
          size={20}
        />

        <div>
          <h2>
            {
              result.answer
            }
          </h2>

          <span>
            Confidence{" "}
            {
              Math.round(
                result.parser
                  .confidence *
                  100
              )
            }
            %
          </span>
        </div>
      </div>

      {result.aggregation && (
        <>
          <CalculationView
            result={
              result
            }
          />

          <AggregationResultView
            result={
              result
            }
          />

          <QAChart
            result={
              result
            }
          />
        </>
      )}

      <ReasoningView
        reasoning={
          result.reasoning
        }
      />
    </section>
  );
}

function CalculationView({
  result,
}: {
  result:
    DataQAResult;
}) {
  const request =
    result.parser.request;

  if (!request) {
    return null;
  }

  return (
    <div className="data-qa-calculation">
      <span className="eyebrow">
        CALCULATION
      </span>

      <code>
        {buildCalculationLabel(
          request
        )}
      </code>
    </div>
  );
}

function AggregationResultView({
  result,
}: {
  result:
    DataQAResult;
}) {
  const aggregation =
    result.aggregation;

  if (
    !aggregation ||
    aggregation.rows
      .length === 0
  ) {
    return null;
  }

  return (
    <div className="data-qa-table-wrapper">
      <div className="data-qa-section-title">
        <span className="eyebrow">
          RESULT DATA
        </span>

        <span>
          {
            aggregation.totalRowsUsed
          }{" "}
          rows used
        </span>
      </div>

      <div className="data-qa-table">
        <div className="data-qa-table__row data-qa-table__row--header">
          <span>
            {
              aggregation.groupByColumn ??
              "Result"
            }
          </span>

          <span>
            {
              aggregation.operation.toUpperCase()
            }
          </span>

          <span>
            Rows
          </span>
        </div>

        {aggregation.rows
          .slice(
            0,
            12
          )
          .map(
            (row) => (
              <div
                key={
                  row.group
                }
                className="data-qa-table__row"
              >
                <strong>
                  {
                    row.group
                  }
                </strong>

                <span>
                  {formatNumber(
                    row.value
                  )}
                </span>

                <span>
                  {
                    row.count
                  }
                </span>
              </div>
            )
          )}
      </div>
    </div>
  );
}

function ReasoningView({
  reasoning,
}: {
  reasoning: string[];
}) {
  return (
    <div className="data-qa-reasoning">
      <span className="eyebrow">
        HOW IT WORKED
      </span>

      <div className="data-qa-reasoning__flow">
        {reasoning.map(
          (
            item,
            index
          ) => (
            <div
              key={
                `${item}-${index}`
              }
              className="data-qa-reason"
            >
              <span>
                {
                  index +
                  1
                }
              </span>

              <p>
                {item}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function QAChart({
  result,
}: {
  result:
    DataQAResult;
}) {
  const aggregation =
    result.aggregation;

  if (
    !aggregation ||
    aggregation.rows
      .length < 2
  ) {
    return null;
  }

  const rows =
    aggregation.rows.slice(
      0,
      10
    );

  const isDate =
    Boolean(
      result.parser
        .detected
        .dateGranularity
    );

  return (
    <div className="data-qa-chart">
      <div className="data-qa-section-title">
        <span className="eyebrow">
          VISUALIZATION
        </span>

        <span>
          {isDate
            ? "Line"
            : "Bar"}
        </span>
      </div>

      {isDate ? (
        <SimpleLineChart
          rows={
            rows
          }
        />
      ) : (
        <SimpleBarChart
          rows={
            rows
          }
        />
      )}
    </div>
  );
}

function SimpleBarChart({
  rows,
}: {
  rows: Array<{
    group: string;
    value: number;
  }>;
}) {
  const maximum =
    Math.max(
      ...rows.map(
        (row) =>
          Math.abs(
            row.value
          )
      ),
      1
    );

  return (
    <div className="data-qa-bar-chart">
      {rows.map(
        (row) => (
          <div
            key={
              row.group
            }
            className="data-qa-bar-chart__row"
          >
            <span>
              {
                row.group
              }
            </span>

            <div className="data-qa-bar-chart__track">
              <div
                className="data-qa-bar-chart__fill"
                style={{
                  width:
                    `${
                      (
                        Math.abs(
                          row.value
                        ) /
                        maximum
                      ) *
                      100
                    }%`,
                }}
              />
            </div>

            <strong>
              {formatNumber(
                row.value
              )}
            </strong>
          </div>
        )
      )}
    </div>
  );
}

function SimpleLineChart({
  rows,
}: {
  rows: Array<{
    group: string;
    value: number;
  }>;
}) {
  const chronological =
    [...rows].sort(
      (a, b) =>
        a.group.localeCompare(
          b.group
        )
    );

  if (
    chronological.length <
    2
  ) {
    return null;
  }

  const width =
    700;

  const height =
    220;

  const padding =
    24;

  const values =
    chronological.map(
      (row) =>
        row.value
    );

  const minimum =
    Math.min(
      ...values
    );

  const maximum =
    Math.max(
      ...values
    );

  const range =
    maximum -
      minimum ||
    1;

  const points =
    chronological.map(
      (
        row,
        index
      ) => {
        const x =
          padding +
          (
            index /
            (
              chronological.length -
              1
            )
          ) *
            (
              width -
              padding *
                2
            );

        const y =
          height -
          padding -
          (
            (
              row.value -
              minimum
            ) /
            range
          ) *
            (
              height -
              padding *
                2
            );

        return {
          ...row,
          x,
          y,
        };
      }
    );

  const path =
    points
      .map(
        (
          point,
          index
        ) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${point.x} ${point.y}`
      )
      .join(" ");

  return (
    <div className="data-qa-line-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={
            path
          }
          className="data-qa-line-chart__path"
        />

        {points.map(
          (
            point,
            index
          ) => (
            <circle
              key={`${point.group}-${index}`}
              cx={
                point.x
              }
              cy={
                point.y
              }
              r="4"
              className="data-qa-line-chart__point"
            >
              <title>
                {
                  point.group
                }
                {": "}
                {
                  point.value
                }
              </title>
            </circle>
          )
        )}
      </svg>

      <div className="data-qa-line-chart__labels">
        <span>
          {
            chronological[
              0
            ]?.group
          }
        </span>

        <span>
          {
            chronological[
              chronological.length -
                1
            ]?.group
          }
        </span>
      </div>
    </div>
  );
}

function buildSuggestedQuestions(
  profile:
    DatasetProfile | null
) {
  if (!profile) {
    return [];
  }

  const numeric =
    profile.columns.find(
      (column) =>
        column.type ===
        "number"
    );

  const category =
    profile.columns.find(
      (column) =>
        column.type ===
          "category" ||
        column.type ===
          "text"
    );

  const date =
    profile.columns.find(
      (column) =>
        column.type ===
        "date"
    );

  const questions:
    string[] = [];

  if (numeric) {
    questions.push(
      `What is the total ${numeric.name}?`
    );

    questions.push(
      `What is the average ${numeric.name}?`
    );
  }

  if (
    numeric &&
    category
  ) {
    questions.push(
      `Which ${category.name} has the most ${numeric.name}?`
    );

    questions.push(
      `Show ${numeric.name} by ${category.name}`
    );
  }

  if (
    numeric &&
    date
  ) {
    questions.push(
      `Show monthly ${numeric.name}`
    );
  }

  questions.push(
    "How many records are there?"
  );

  return questions.slice(
    0,
    6
  );
}

function buildCalculationLabel(
  request: {
    operation:
      | "sum"
      | "avg"
      | "count"
      | "min"
      | "max";

    valueColumn?: string;

    groupByColumn?: string;

    dateGranularity?:
      | "day"
      | "month"
      | "quarter"
      | "year";

    sort?:
      | "asc"
      | "desc";

    limit?: number;
  }
) {
  let calculation =
    request.operation ===
      "count"
      ? "COUNT(*)"
      : `${request.operation.toUpperCase()}(${request.valueColumn})`;

  if (
    request.groupByColumn
  ) {
    calculation +=
      ` GROUP BY ${request.groupByColumn}`;

    if (
      request.dateGranularity
    ) {
      calculation +=
        `:${request.dateGranularity}`;
    }
  }

  if (
    request.sort
  ) {
    calculation +=
      ` ORDER ${request.sort.toUpperCase()}`;
  }

  if (
    request.limit
  ) {
    calculation +=
      ` LIMIT ${request.limit}`;
  }

  return calculation;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}