#!/usr/bin/env bash
set -euo pipefail

# Nexora AI Lab — lint/build follow-up fix
# Run from the nexora-ai-lab repository root AFTER the first one-shot update.

if [[ ! -f "package.json" ]] || ! grep -q '"name": "nexora-ai-lab"' package.json; then
  echo "Error: run this script from the root of the nexora-ai-lab repository."
  exit 1
fi

echo "==> Fixing Nexora validation errors"

# ---------------------------------------------------------------------------
# 1. InsightView: render icon JSX via a stable component instead of creating
#    a component variable during InsightCard render.
# ---------------------------------------------------------------------------
python3 <<'PY'
from pathlib import Path

path = Path("src/components/tools/InsightView.tsx")
text = path.read_text()

old = '''function InsightCard({
  insight,
}: {
  insight: GeneratedInsight;
}) {
  const Icon =
    getInsightIcon(
      insight
    );

  return (
    <article className="insight-card">
      <div className="insight-card__icon">
        <Icon size={16} />
      </div>
'''

new = '''function InsightCard({
  insight,
}: {
  insight: GeneratedInsight;
}) {
  return (
    <article className="insight-card">
      <div className="insight-card__icon">
        <InsightIcon insight={insight} />
      </div>
'''

if old not in text:
    raise SystemExit("Could not find expected InsightCard block in InsightView.tsx")

text = text.replace(old, new)

start = text.find("function getInsightIcon(")
if start == -1:
    raise SystemExit("Could not find getInsightIcon in InsightView.tsx")

replacement = '''function InsightIcon({
  insight,
}: {
  insight: GeneratedInsight;
}) {
  if (insight.type === "anomaly") {
    return <AlertTriangle size={16} />;
  }

  if (insight.type === "trend") {
    return <TrendingUp size={16} />;
  }

  if (insight.type === "quality") {
    return <CheckCircle2 size={16} />;
  }

  if (insight.type === "statistics") {
    return <BarChart3 size={16} />;
  }

  return <Lightbulb size={16} />;
}
'''

text = text[:start] + replacement
path.write_text(text)
PY

# ---------------------------------------------------------------------------
# 2. DatasetCleaner: use DataRow rather than the wrapper Object type.
# ---------------------------------------------------------------------------
cat > src/pages/DatasetCleanerPage.tsx <<'EOF'
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
EOF

# ---------------------------------------------------------------------------
# 3. SocialPostStudio:
#    - use state instead of reading a ref during render
#    - start loading in user actions rather than synchronously in an effect
#    - remove irregular full-width whitespace
#    - clean up object URLs
# ---------------------------------------------------------------------------
cat > src/pages/SocialPostStudioPage.tsx <<'EOF'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  Image as ImageIcon,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Analysis = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: "warm" | "cool" | "balanced";
  orientation: string;
  palette: string[];
};

type Post = {
  title: string;
  caption: string;
  hashtags: string[];
  tip: string;
};

type Crop = "4:5" | "1:1" | "9:16";

type Props = {
  onBack: () => void;
};

export default function SocialPostStudioPage({ onBack }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [isSample, setIsSample] = useState(false);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [crop, setCrop] = useState<Crop>("4:5");

  const canvas = useRef<HTMLCanvasElement>(null);

  const post = useMemo(
    () =>
      analysis
        ? buildPost(analysis, context, isSample)
        : null,
    [analysis, context, isSample]
  );

  function replaceImage(nextUrl: string) {
    setImage((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }

      return nextUrl;
    });
  }

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setBusy(true);
    setAnalysis(null);
    setIsSample(false);
    setContext(fileHint(file.name));
    replaceImage(URL.createObjectURL(file));
  }

  async function loadExample() {
    setBusy(true);
    setAnalysis(null);

    try {
      const blob = await fetch("/examples/dubai-evening.png").then(
        (response) => {
          if (!response.ok) {
            throw new Error("Unable to load the sample photo.");
          }

          return response.blob();
        }
      );

      setIsSample(true);
      setContext("Dubai evening skyline and city lights");
      replaceImage(URL.createObjectURL(blob));
    } catch {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!image) {
      return;
    }

    let cancelled = false;

    analyzeImage(image)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setAnalysis(result);
        setBrightness(
          result.brightness < 90
            ? 112
            : result.brightness > 175
              ? 94
              : 103
        );
        setContrast(result.contrast < 42 ? 112 : 104);
        setSaturation(result.saturation < 35 ? 112 : 104);
      })
      .finally(() => {
        if (!cancelled) {
          setBusy(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [image]);

  useEffect(
    () => () => {
      if (image?.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    },
    [image]
  );

  function exportImage() {
    if (!image || !canvas.current) {
      return;
    }

    const [ratioWidth, ratioHeight] = crop
      .split(":")
      .map(Number);

    const img = new Image();

    img.onload = () => {
      const targetCanvas = canvas.current;

      if (!targetCanvas) {
        return;
      }

      targetCanvas.width = 1080;
      targetCanvas.height = Math.round(
        1080 * ratioHeight / ratioWidth
      );

      const drawingContext = targetCanvas.getContext("2d");

      if (!drawingContext) {
        return;
      }

      drawingContext.filter =
        `brightness(${brightness}%) ` +
        `contrast(${contrast}%) ` +
        `saturate(${saturation}%)`;

      const targetRatio = ratioWidth / ratioHeight;
      const sourceRatio = img.width / img.height;

      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (sourceRatio > targetRatio) {
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = img.width / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      drawingContext.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetCanvas.width,
        targetCanvas.height
      );

      targetCanvas.toBlob((blob) => {
        if (!blob) {
          return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download =
          `nexora-instagram-${crop.replace(":", "x")}.png`;
        anchor.click();

        URL.revokeObjectURL(url);
      }, "image/png");
    };

    img.src = image;
  }

  function copyPost() {
    if (!post) {
      return;
    }

    void navigator.clipboard.writeText(
      `${post.title}\n\n${post.caption}\n\n${post.hashtags.join(" ")}`
    );
  }

  return (
    <section className="work-page social-studio">
      <button className="work-back" onClick={onBack}>
        <ArrowLeft size={15} /> All tools
      </button>

      <header className="work-hero">
        <span className="eyebrow">CREATIVE INTELLIGENCE</span>
        <h1>Social Post Studio</h1>
        <p>
          Turn a photo into an Instagram-ready image, caption and hashtag
          set. Image measurements stay in your browser.
        </p>
      </header>

      <div className="social-layout">
        <section className="work-card social-input">
          <label className="image-picker">
            <ImageIcon size={22} />
            <b>Drop or choose a photo</b>
            <span>JPG, PNG or WebP</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={choose}
            />
          </label>

          <button className="example-action" onClick={loadExample}>
            <Sparkles size={14} /> Try sample photo
          </button>

          {image && (
            <>
              <label>
                Photo context{" "}
                <small>
                  helps captions describe the subject accurately
                </small>
              </label>

              <input
                className="context-input"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="e.g. Dubai skyline after sunset"
              />

              <div className="crop-tabs">
                {(["4:5", "1:1", "9:16"] as const).map(
                  (ratio) => (
                    <button
                      className={crop === ratio ? "active" : ""}
                      onClick={() => setCrop(ratio)}
                      key={ratio}
                    >
                      {ratio}
                    </button>
                  )
                )}
              </div>

              <div className="controls">
                <label>
                  Brightness
                  <input
                    type="range"
                    min="70"
                    max="130"
                    value={brightness}
                    onChange={(event) =>
                      setBrightness(Number(event.target.value))
                    }
                  />
                  <span>{brightness}%</span>
                </label>

                <label>
                  Contrast
                  <input
                    type="range"
                    min="70"
                    max="135"
                    value={contrast}
                    onChange={(event) =>
                      setContrast(Number(event.target.value))
                    }
                  />
                  <span>{contrast}%</span>
                </label>

                <label>
                  Saturation
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={saturation}
                    onChange={(event) =>
                      setSaturation(Number(event.target.value))
                    }
                  />
                  <span>{saturation}%</span>
                </label>
              </div>
            </>
          )}
        </section>

        <section className="work-card social-preview-card">
          {image ? (
            <>
              <div
                className={`instagram-preview crop-${crop.replace(
                  ":",
                  "-"
                )}`}
              >
                <div className="ig-head">
                  <span className="ig-avatar">N</span>
                  <b>nexora.lab</b>
                  <span>•••</span>
                </div>

                <img
                  src={image}
                  alt="Selected social post preview"
                  style={{
                    filter:
                      `brightness(${brightness}%) ` +
                      `contrast(${contrast}%) ` +
                      `saturate(${saturation}%)`,
                  }}
                />

                <div className="ig-actions">
                  <span>♡</span>
                  <span>⌁</span>
                  <span>⌯</span>
                </div>

                {post && (
                  <div className="ig-copy">
                    <b>{post.title}</b>
                    <p>{post.caption}</p>
                    <div>{post.hashtags.join(" ")}</div>
                  </div>
                )}
              </div>

              <div className="work-actions">
                <button
                  className="primary-action"
                  onClick={exportImage}
                >
                  <Download size={14} /> Export image
                </button>

                <button
                  className="example-action"
                  onClick={copyPost}
                >
                  <Copy size={14} /> Copy post
                </button>
              </div>
            </>
          ) : (
            <div className="work-empty">
              Upload a photo to build the post preview.
            </div>
          )}

          <canvas ref={canvas} hidden />
        </section>

        <aside className="work-card social-insights">
          <span className="eyebrow">
            <WandSparkles size={12} /> PHOTO READ
          </span>

          {busy ? (
            <p>Reading pixels…</p>
          ) : analysis ? (
            <>
              <div className="metric-grid">
                <div>
                  <strong>{analysis.brightness}</strong>
                  <span>brightness</span>
                </div>

                <div>
                  <strong>{analysis.contrast}</strong>
                  <span>contrast</span>
                </div>

                <div>
                  <strong>{analysis.temperature}</strong>
                  <span>temperature</span>
                </div>

                <div>
                  <strong>{analysis.orientation}</strong>
                  <span>orientation</span>
                </div>
              </div>

              <p className="palette">
                {analysis.palette.map((color) => (
                  <i
                    key={color}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </p>

              <p>{post?.tip}</p>

              <small className="truth-note">
                Nexora measures the image locally. The context field is
                used for subject-specific copy because pixel statistics
                alone cannot reliably identify arbitrary subjects.
              </small>
            </>
          ) : (
            <p>Image analysis will appear here.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

function fileHint(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b(img|image|photo|dsc)\d*\b/gi, "")
    .trim();
}

async function analyzeImage(src: string): Promise<Analysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = () => {
      reject(new Error("Unable to read the selected image."));
    };

    img.onload = () => {
      const sampleCanvas = document.createElement("canvas");
      const width = 96;
      const height = Math.max(
        1,
        Math.round(96 * img.height / img.width)
      );

      sampleCanvas.width = width;
      sampleCanvas.height = height;

      const context2d = sampleCanvas.getContext("2d");

      if (!context2d) {
        reject(new Error("Canvas is not available."));
        return;
      }

      context2d.drawImage(img, 0, 0, width, height);

      const pixels = context2d.getImageData(
        0,
        0,
        width,
        height
      ).data;

      let luminance = 0;
      let luminanceSquared = 0;
      let saturationTotal = 0;
      let redTotal = 0;
      let blueTotal = 0;

      const buckets = new Map<string, number>();

      for (let index = 0; index < pixels.length; index += 16) {
        const red = pixels[index] ?? 0;
        const green = pixels[index + 1] ?? 0;
        const blue = pixels[index + 2] ?? 0;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const light =
          0.2126 * red +
          0.7152 * green +
          0.0722 * blue;

        luminance += light;
        luminanceSquared += light * light;
        saturationTotal += max
          ? ((max - min) / max) * 100
          : 0;

        redTotal += red;
        blueTotal += blue;

        const hex = `#${[red, green, blue]
          .map((value) => Math.round(value / 48) * 48)
          .map((value) =>
            Math.min(255, value)
              .toString(16)
              .padStart(2, "0")
          )
          .join("")}`;

        buckets.set(
          hex,
          (buckets.get(hex) ?? 0) + 1
        );
      }

      const sampleCount = pixels.length / 16;
      const average = luminance / sampleCount;
      const deviation = Math.sqrt(
        Math.max(
          0,
          luminanceSquared / sampleCount -
            average * average
        )
      );

      resolve({
        brightness: Math.round(average),
        contrast: Math.round(deviation),
        saturation: Math.round(
          saturationTotal / sampleCount
        ),
        temperature:
          redTotal > blueTotal * 1.08
            ? "warm"
            : blueTotal > redTotal * 1.08
              ? "cool"
              : "balanced",
        orientation:
          img.width > img.height
            ? "landscape"
            : img.width < img.height
              ? "portrait"
              : "square",
        palette: [...buckets]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 5)
          .map(([color]) => color),
      });
    };

    img.src = src;
  });
}

function buildPost(
  analysis: Analysis,
  context: string,
  isSample: boolean
): Post {
  const subject = (
    context.trim() ||
    (isSample ? "Dubai evening skyline" : "this moment")
  ).replace(/^./, (character) => character.toUpperCase());

  const mood =
    analysis.brightness < 85
      ? "moody"
      : analysis.saturation > 55
        ? "vibrant"
        : analysis.temperature === "warm"
          ? "warm"
          : "clean";

  const title =
    mood === "moody"
      ? `${subject} — After Hours`
      : mood === "vibrant"
        ? `${subject} in Full Color`
        : `${subject} — A Moment Worth Keeping`;

  const caption =
    `${subject}. ` +
    (mood === "moody"
      ? "Deep tones, quiet details and a little atmosphere."
      : mood === "vibrant"
        ? "Color, energy and the details that made this frame stand out."
        : "A simple frame with the details doing the talking.") +
    " Saved exactly how it felt.";

  const hashtags = [
    "#NexoraMade",
    "#Photography",
    `#${mood[0].toUpperCase()}${mood.slice(1)}Mood`,
    "#VisualStory",
    "#InstaDaily",
  ];

  for (const word of context.match(/[A-Za-z]{4,}/g) ?? []) {
    hashtags.push(`#${word}`);
  }

  return {
    title,
    caption,
    hashtags: [...new Set(hashtags)].slice(0, 10),
    tip:
      `Suggested treatment: ${
        analysis.brightness < 90
          ? "lift exposure slightly"
          : "protect highlights"
      }, ${
        analysis.contrast < 42
          ? "add definition"
          : "keep contrast controlled"
      }, and use ${
        analysis.orientation === "portrait"
          ? "the 4:5 crop"
          : "a 4:5 crop with a centered focal area"
      }.`,
  };
}
EOF

# ---------------------------------------------------------------------------
# 4. dataValues regex: remove unnecessary escaping for "$" in char class.
# ---------------------------------------------------------------------------
python3 <<'PY'
from pathlib import Path

path = Path("src/utils/dataValues.ts")
text = path.read_text()
text = text.replace(r'/^[\$€£₹]\s*/', r'/^[$€£₹]\s*/')
path.write_text(text)
PY

echo "==> Running lint"
npm run lint

echo "==> Running tests"
npm test

echo "==> Running production build"
npm run build

echo
echo "============================================================"
echo "Validation fixes applied successfully."
echo
echo "Next:"
echo "  git status"
echo "  git diff"
echo
echo "If the changes look correct:"
echo '  git add -A'
echo '  git commit -m "Polish Nexora portfolio build, routing, tests and CI"'
echo '  git push'
echo
echo "Optional dependency review:"
echo "  npm audit"
echo "============================================================"
