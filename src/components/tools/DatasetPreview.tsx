import type {
  ParsedDataset,
} from "../../types/dataset";

type DatasetPreviewProps = {
  dataset: ParsedDataset;
  maxRows?: number;
};

export default function DatasetPreview({
  dataset,
  maxRows = 6,
}: DatasetPreviewProps) {
  const previewRows =
    dataset.rows.slice(
      0,
      maxRows
    );

  return (
    <section className="dataset-preview">
      <div className="dataset-preview__header">
        <div>
          <span className="eyebrow">
            DATASET PREVIEW
          </span>

          <h3>
            {dataset.fileName}
          </h3>
        </div>

        <div className="dataset-preview__meta">
          <span>
            {dataset.rowCount} rows
          </span>

          <span>
            {dataset.columns.length} columns
          </span>

          {dataset.sheetName && (
            <span>
              {dataset.sheetName}
            </span>
          )}
        </div>
      </div>

      {dataset.columns.length === 0 ? (
        <div className="dataset-preview__empty">
          No columns were found in this dataset.
        </div>
      ) : dataset.rows.length === 0 ? (
        <div className="dataset-preview__empty">
          The dataset contains columns but no data rows.
        </div>
      ) : (
        <>
          <div className="dataset-preview__table-wrapper">
            <table className="dataset-preview__table">
              <thead>
                <tr>
                  {dataset.columns.map(
                    (column) => (
                      <th key={column}>
                        {column}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {previewRows.map(
                  (row, rowIndex) => (
                    <tr key={rowIndex}>
                      {dataset.columns.map(
                        (column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            title={formatCellValue(
                              row[column]
                            )}
                          >
                            {formatCellValue(
                              row[column]
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {dataset.rowCount >
            previewRows.length && (
            <div className="dataset-preview__footer">
              Showing first{" "}
              {previewRows.length} of{" "}
              {dataset.rowCount} rows
            </div>
          )}
        </>
      )}
    </section>
  );
}

function formatCellValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "—";
    }

    return value
      .toISOString()
      .slice(0, 10);
  }

  if (
    typeof value === "number"
  ) {
    return new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  if (
    typeof value === "boolean"
  ) {
    return value
      ? "True"
      : "False";
  }

  return String(value);
}