import { useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import FileDropzone from "../components/shared/FileDropzone";
import ExampleFileButton from "../components/shared/ExampleFileButton";
import { parseDataFile } from "../utils/fileParser";
import type { DataRow, ParsedDataset } from "../types/dataset";

type Props = {
  onBack: () => void;
};

export default function DatasetCleanerPage({ onBack }: Props) {
  const [data, setData] = useState<ParsedDataset | null>(null);
  const [cleaned, setCleaned] = useState<ParsedDataset | null>(null);

  async function load(files: File[]) {
    const file = files[0];

    if (!file) {
      setData(null);
      setCleaned(null);
      return;
    }

    const parsed = await parseDataFile(file);
    setData(parsed);
    setCleaned(null);
  }

  function clean() {
    if (!data) {
      return;
    }

    const seen = new Set<string>();
    const rows: DataRow[] = [];

    for (const row of data.rows) {
      const normalized = Object.fromEntries(
        data.columns.map((column) => {
          const value = row[column];

          return [
            column,
            typeof value === "string" ? value.trim() : value,
          ];
        })
      ) as DataRow;

      const key = JSON.stringify(normalized);

      if (!seen.has(key)) {
        seen.add(key);
        rows.push(normalized);
      }
    }

    setCleaned({
      ...data,
      rows,
      rowCount: rows.length,
    });
  }

  function download() {
    if (!cleaned) {
      return;
    }

    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      cleaned.columns.map(escape).join(","),
      ...cleaned.rows.map((row) =>
        cleaned.columns
          .map((column) => escape(row[column]))
          .join(",")
      ),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cleaned-dataset.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  const duplicates = data
    ? data.rowCount -
      new Set(data.rows.map((row) => JSON.stringify(row))).size
    : 0;

  const missing = data
    ? data.rows.reduce(
        (count, row) =>
          count +
          data.columns.filter((column) => {
            const value = row[column];

            return (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            );
          }).length,
        0
      )
    : 0;

  return (
    <section className="work-page">
      <button className="work-back" onClick={onBack}>
        <ArrowLeft size={15} /> Back
      </button>

      <header className="work-hero">
        <span className="eyebrow">DATA QUALITY</span>
        <h1>Dataset Cleaner</h1>
        <p>
          Inspect common spreadsheet problems, clean safe issues, and
          export the result.
        </p>
      </header>

      <div className="work-grid">
        <section className="work-card">
          <span className="eyebrow">UPLOAD</span>

          <FileDropzone
            accept=".csv,.xlsx,.xls"
            acceptedExtensions={[".csv", ".xlsx", ".xls"]}
            onFilesSelected={load}
          />

          <ExampleFileButton
            path="/examples/messy-customer-data.csv"
            fileName="messy-customer-data.csv"
            type="text/csv"
            onLoad={load}
            label="Try messy customer data"
          />

          {data && (
            <button className="primary-action" onClick={clean}>
              Clean safe issues
            </button>
          )}
        </section>

        <section className="work-card">
          <span className="eyebrow">QUALITY REPORT</span>

          {!data ? (
            <div className="work-empty">
              Upload a dataset to inspect it.
            </div>
          ) : (
            <div className="metric-grid">
              <div>
                <strong>{data.rowCount}</strong>
                <span>Rows</span>
              </div>

              <div>
                <strong>{duplicates}</strong>
                <span>Duplicates</span>
              </div>

              <div>
                <strong>{missing}</strong>
                <span>Missing cells</span>
              </div>

              <div>
                <strong>{cleaned?.rowCount ?? "—"}</strong>
                <span>Clean rows</span>
              </div>
            </div>
          )}

          {cleaned && (
            <>
              <div className="result-section">
                <h3>Changes applied</h3>
                <p>Removed exact duplicate rows.</p>
                <p>
                  Trimmed leading and trailing spaces from text cells.
                </p>
                <p>
                  Missing values were left untouched to avoid inventing
                  data.
                </p>
              </div>

              <button className="quiet-action" onClick={download}>
                <Download size={13} /> Download CSV
              </button>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
