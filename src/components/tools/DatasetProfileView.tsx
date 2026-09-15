import type {
  DatasetProfile,
} from "../../engines/data/profiler";

type DatasetProfileViewProps = {
  profile: DatasetProfile;
};

export default function DatasetProfileView({
  profile,
}: DatasetProfileViewProps) {
  return (
    <div className="dataset-profile">
      <div className="dataset-profile__overview">
        <Metric
          label="Rows"
          value={profile.rowCount}
        />

        <Metric
          label="Columns"
          value={profile.columnCount}
        />

        <Metric
          label="Complete"
          value={`${profile.completenessPercentage}%`}
        />

        <Metric
          label="Duplicates"
          value={
            profile.duplicateRowCount
          }
        />
      </div>

      <div className="dataset-profile__columns">
        <header>
          <span className="eyebrow">
            COLUMN PROFILE
          </span>

          <h3>
            Dataset structure
          </h3>
        </header>

        {profile.columns.map(
          (column) => (
            <article
              key={column.name}
              className="column-profile"
            >
              <div className="column-profile__header">
                <div>
                  <strong>
                    {column.name}
                  </strong>

                  <span>
                     {column.type}
                     {" · "}
                     {column.typeConfidence}%
                  </span>
                </div>

                <span>
                  {
                    column.missingPercentage
                  }
                  % missing
                </span>
              </div>

              <div className="column-profile__metrics">
                <div>
                  <span>Unique</span>
                  <strong>
                    {
                      column.uniqueCount
                    }
                  </strong>
                </div>

                <div>
                  <span>Missing</span>
                  <strong>
                    {
                      column.missingCount
                    }
                  </strong>
                </div>

                <div>
                  <span>Filled</span>
                  <strong>
                    {
                      column.nonNullCount
                    }
                  </strong>
                </div>
              </div>

              {column.numericStats && (
                <div className="column-profile__numeric">
                  <span>
                    Min{" "}
                    <strong>
                      {
                        column.numericStats
                          .min
                      }
                    </strong>
                  </span>

                  <span>
                    Max{" "}
                    <strong>
                      {
                        column.numericStats
                          .max
                      }
                    </strong>
                  </span>

                  <span>
                    Avg{" "}
                    <strong>
                      {
                        column.numericStats
                          .mean
                      }
                    </strong>
                  </span>

                  <span>
                    Median{" "}
                    <strong>
                      {
                        column.numericStats
                          .median
                      }
                    </strong>
                  </span>
                </div>
              )}

              <div className="column-profile__samples">
                {column.sampleValues.map(
                  (value, index) => (
                    <span
                      key={`${column.name}-${index}`}
                    >
                      {formatValue(
                        value
                      )}
                    </span>
                  )
                )}
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="dataset-profile__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatValue(
  value:
    | string
    | number
    | boolean
    | Date
    | null
) {
  if (value === null) {
    return "null";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  return String(value);
}