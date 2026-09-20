#!/usr/bin/env bash
set -euo pipefail

# Nexora AI Lab — one-shot portfolio-quality update
# Run this from the root of the nexora-ai-lab repository:
#   bash apply-nexora-one-shot-update.sh

if [[ ! -f "package.json" ]] || ! grep -q '"name": "nexora-ai-lab"' package.json; then
  echo "Error: run this script from the root of the nexora-ai-lab repository."
  exit 1
fi

echo "==> Updating Nexora AI Lab"

mkdir -p .github/workflows public/examples src/engines/data

# ---------------------------------------------------------------------------
# 1. Repository hygiene
# ---------------------------------------------------------------------------
if ! grep -qxF ".vite/" .gitignore; then
  printf "\n# Local build/tool caches\n.vite/\ncoverage/\n" >> .gitignore
fi

rm -rf .vite
git rm -r --cached .vite >/dev/null 2>&1 || true

# Remove unused Vite/React starter assets.
rm -f src/assets/react.svg src/assets/vite.svg

# ---------------------------------------------------------------------------
# 2. Shareable hash routing without adding a router dependency
# ---------------------------------------------------------------------------
cat > src/app/toolRegistry.ts <<'EOF'
export const TOOL_ROUTES = [
  "dashboard",
  "data-analyst",
  "dataset-cleaner",
  "data-qa",
  "document-intelligence",
  "resume-analyzer",
  "expense-intelligence",
  "meeting-intelligence",
  "log-analyzer",
  "social-post-studio",
] as const;

export type ToolRoute = (typeof TOOL_ROUTES)[number];

const TOOL_ROUTE_SET = new Set<string>(TOOL_ROUTES);

export function isToolRoute(value: string): value is ToolRoute {
  return TOOL_ROUTE_SET.has(value);
}

export function hashForTool(tool: ToolRoute): string {
  return tool === "dashboard" ? "#/" : `#/tools/${tool}`;
}

export function toolFromHash(hash: string): ToolRoute {
  const normalized = hash
    .replace(/^#\/?/, "")
    .replace(/^tools\//, "")
    .replace(/\/+$/, "");

  if (!normalized || normalized === "dashboard") {
    return "dashboard";
  }

  return isToolRoute(normalized) ? normalized : "dashboard";
}
EOF

cat > src/App.tsx <<'EOF'
import { useEffect, useState, type ReactNode } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import DataAnalystPage from "./pages/DataAnalystPage";
import DataQAPage from "./pages/DataQAPage";
import DatasetCleanerPage from "./pages/DatasetCleanerPage";
import IntelligencePage from "./pages/IntelligencePage";
import ExpenseIntelligencePage from "./pages/ExpenseIntelligencePage";
import SocialPostStudioPage from "./pages/SocialPostStudioPage";
import {
  hashForTool,
  toolFromHash,
  type ToolRoute,
} from "./app/toolRegistry";

const TITLES: Record<ToolRoute, string> = {
  dashboard: "Nexora AI Lab",
  "data-analyst": "Data Analyst",
  "dataset-cleaner": "Dataset Cleaner",
  "data-qa": "Data Q&A",
  "document-intelligence": "Document Intelligence",
  "resume-analyzer": "Resume ↔ Job Analyzer",
  "expense-intelligence": "Expense Intelligence",
  "meeting-intelligence": "Meeting Intelligence",
  "log-analyzer": "Developer Log Analyzer",
  "social-post-studio": "Social Post Studio",
};

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolRoute>(() =>
    toolFromHash(window.location.hash)
  );

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/");
    }

    const syncRoute = () => {
      setActiveTool(toolFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const title = TITLES[activeTool];
    document.title =
      activeTool === "dashboard"
        ? "Nexora AI Lab — Local Intelligence Toolkit"
        : `${title} — Nexora AI Lab`;
  }, [activeTool]);

  const navigate = (tool: ToolRoute) => {
    const nextHash = hashForTool(tool);

    if (window.location.hash === nextHash) {
      setActiveTool(tool);
      return;
    }

    window.location.hash = nextHash;
  };

  const back = () => navigate("dashboard");

  let page: ReactNode;

  switch (activeTool) {
    case "data-analyst":
      page = <DataAnalystPage onBack={back} />;
      break;
    case "data-qa":
      page = <DataQAPage onBack={back} />;
      break;
    case "dataset-cleaner":
      page = <DatasetCleanerPage onBack={back} />;
      break;
    case "expense-intelligence":
      page = <ExpenseIntelligencePage onBack={back} />;
      break;
    case "document-intelligence":
    case "resume-analyzer":
    case "meeting-intelligence":
    case "log-analyzer":
      page = <IntelligencePage mode={activeTool} onBack={back} />;
      break;
    case "social-post-studio":
      page = <SocialPostStudioPage onBack={back} />;
      break;
    default:
      page = <Dashboard onNavigate={navigate} />;
  }

  return (
    <AppShell activeTool={activeTool} onNavigate={navigate}>
      {page}
    </AppShell>
  );
}
EOF

# ---------------------------------------------------------------------------
# 3. Honest, portfolio-focused homepage
# ---------------------------------------------------------------------------
cat > src/pages/Dashboard.tsx <<'EOF'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Workflow,
} from "lucide-react";
import { tools } from "../data/tools";
import type { ToolRoute } from "../app/toolRegistry";

type Props = {
  onNavigate: (tool: ToolRoute) => void;
};

export default function Dashboard({ onNavigate }: Props) {
  const open = (id: string) => onNavigate(id as ToolRoute);

  return (
    <section className="nexora-home nexora-home--final">
      <div className="nexora-home__stars" />

      <header className="nexora-topbar">
        <button
          className="nexora-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="nexora-brand__mark">
            <BrainCircuit size={22} />
          </span>
          <span>
            <strong>Nexora AI Lab</strong>
            <small>Analyze · Understand · Create</small>
          </span>
        </button>

        <nav>
          <button className="is-active">Home</button>
          <button onClick={() => open("data-analyst")}>Workspace</button>
        </nav>

        <div className="nexora-topbar__actions">
          <button
            className="open-workspace"
            onClick={() => open("data-analyst")}
          >
            Open Workspace <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <div className="nexora-stage">
        <section className="nexora-intro nexora-intro--final">
          <span className="eyebrow">
            LOCAL-FIRST INTELLIGENCE. REAL-WORLD VALUE.
          </span>
          <h1>
            What will you <em>explore</em> today?
          </h1>
          <p>
            Nine practical intelligence tools. One workspace.
            <br />
            Turn information into clarity with transparent browser-side
            processing.
          </p>

          <div className="nexora-principles">
            <span>◈ Private & Local</span>
            <span>ϟ Transparent Analysis</span>
            <span>◇ Built for Real Work</span>
          </div>
        </section>

        <div className="capability-map capability-map--final">
          <div className="capability-map__rings" />

          <div className="nexora-core nexora-core--final">
            <span className="nexora-core__icon">
              <BrainCircuit size={54} />
            </span>
            <strong>NEXORA AI</strong>
            <small>LOCAL · DATA · ACTION</small>
            <em>
              Practical tools.
              <br />
              Clear outputs.
            </em>
          </div>

          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                className={`orbit-tool orbit-tool--${index + 1}`}
                onClick={() => open(tool.id)}
              >
                <span className="orbit-tool__icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>{tool.title}</strong>
                  <small>{tool.shortDescription}</small>
                </span>
                <ArrowRight className="orbit-tool__arrow" size={14} />
              </button>
            );
          })}
        </div>

        <aside className="nexora-sidecards nexora-sidecards--final">
          <section>
            <div className="sidecard-title">
              <Workflow size={15} />
              <strong>Example workflows</strong>
            </div>
            <button onClick={() => open("data-analyst")}>
              Sales dataset → trends & anomalies <ArrowRight size={12} />
            </button>
            <button onClick={() => open("resume-analyzer")}>
              Resume + role → skill overlap <ArrowRight size={12} />
            </button>
            <button onClick={() => open("meeting-intelligence")}>
              Meeting notes → decisions & actions <ArrowRight size={12} />
            </button>
            <button onClick={() => open("social-post-studio")}>
              Photo → local image treatment <ArrowRight size={12} />
            </button>
          </section>

          <section>
            <div className="sidecard-title">
              <Lightbulb size={15} />
              <strong>Ideas for you</strong>
            </div>
            <button onClick={() => open("data-analyst")}>
              “Analyze my sales data” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("dataset-cleaner")}>
              “Clean this messy dataset” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("log-analyzer")}>
              “Find repeated app errors” <ArrowRight size={12} />
            </button>
            <button onClick={() => open("social-post-studio")}>
              “Prepare a social post” <ArrowRight size={12} />
            </button>
          </section>
        </aside>

        <div className="nexora-dock">
          <div className="nexora-command">
            <Sparkles size={16} />
            <span>Ask a question about your data...</span>
            <button
              aria-label="Open Data Q&A"
              onClick={() => open("data-qa")}
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="nexora-quick">
            <button onClick={() => open("data-analyst")}>
              Analyze my data
            </button>
            <button onClick={() => open("document-intelligence")}>
              Summarize text
            </button>
            <button onClick={() => open("resume-analyzer")}>
              Check my resume
            </button>
            <button onClick={() => open("expense-intelligence")}>
              Understand expenses
            </button>
            <button onClick={() => open("social-post-studio")}>
              Prepare a social post
            </button>
          </div>
        </div>

        <div className="nexora-status">
          <CheckCircle2 size={12} /> Local engines ready
          <span>Portfolio build</span>
        </div>
      </div>
    </section>
  );
}
EOF

# ---------------------------------------------------------------------------
# 4. Capability wording fixes
# ---------------------------------------------------------------------------
perl -0pi -e 's/title: "AI Data Analyst"/title: "Data Analyst"/g' src/data/tools.ts
perl -0pi -e 's/"PDF or text document"/"Pasted or extracted document text"/g' src/data/tools.ts

# Fix the broken Developer Log Analyzer example path.
perl -0pi -e 's#/examples/application-errors\.log#/examples/application-errors.txt#g' src/pages/IntelligencePage.tsx

cat > public/examples/application-errors.txt <<'EOF'
2026-09-20T09:12:02Z WARN Network request retry scheduled for /api/profile
2026-09-20T09:12:03Z ERROR Request failed with status 503 for /api/profile
2026-09-20T09:12:05Z ERROR Request failed with status 503 for /api/profile
2026-09-20T09:12:09Z WARN Network request retry scheduled for /api/profile
2026-09-20T09:14:21Z ERROR TypeError: Cannot read properties of undefined at Dashboard.tsx:184
2026-09-20T09:15:02Z ERROR Request failed with status 503 for /api/profile
2026-09-20T09:18:33Z WARN Image decode took 840ms for dashboard-preview.png
2026-09-20T09:19:10Z ERROR TypeError: Cannot read properties of undefined at Dashboard.tsx:205
2026-09-20T09:20:42Z INFO User returned to dashboard
EOF

# ---------------------------------------------------------------------------
# 5. SEO and social metadata
# ---------------------------------------------------------------------------
cat > index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Nexora AI Lab — Local Intelligence Toolkit</title>
    <meta
      name="description"
      content="A local-first React and TypeScript toolkit for data analysis, dataset cleaning, document intelligence, resume matching, expense analysis, developer logs, and browser-side image processing."
    />
    <meta name="theme-color" content="#080b14" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Nexora AI Lab — Local Intelligence Toolkit" />
    <meta
      property="og:description"
      content="Nine practical browser-side intelligence tools built with React and TypeScript, designed around transparent local processing."
    />
    <meta property="og:url" content="https://nexora-ai-lab-psi.vercel.app/" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Nexora AI Lab" />
    <meta
      name="twitter:description"
      content="Local-first data, document, developer, career, expense, and image intelligence tools."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# ---------------------------------------------------------------------------
# 6. Unit test coverage for a core analysis engine
# ---------------------------------------------------------------------------
cat > src/engines/data/statistics.test.ts <<'EOF'
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
EOF

# ---------------------------------------------------------------------------
# 7. CI
# ---------------------------------------------------------------------------
cat > .github/workflows/ci.yml <<'EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
EOF

# ---------------------------------------------------------------------------
# 8. Portfolio-focused README
# ---------------------------------------------------------------------------
cat > README.md <<'EOF'
# Nexora AI Lab

**Local-first browser intelligence toolkit built with React and TypeScript.**

Nexora AI Lab is a portfolio project exploring how useful analysis can be built with transparent rules, browser-side processing, and focused domain engines instead of depending on paid AI APIs for every feature.

**Live demo:** https://nexora-ai-lab-psi.vercel.app/

## Why I built it

The goal is not to label every calculation as generative AI. Nexora separates deterministic analysis from capabilities that would genuinely require a model.

The project demonstrates:

- data profiling, statistics, trends, anomalies, and chart recommendations,
- natural-language-style dataset filtering and aggregation,
- document, meeting, resume, and log analysis,
- local spreadsheet processing,
- browser-side image measurements and export,
- reusable React/TypeScript architecture,
- privacy-conscious local processing,
- example-driven UX so every tool can be tested immediately.

## Tools

| Tool | What it does |
| --- | --- |
| **Data Analyst** | Profiles CSV/XLSX data and produces statistics, trends, anomalies, insights, and chart recommendations |
| **Dataset Cleaner** | Finds common data-quality problems and exports a cleaned CSV |
| **Data Q&A** | Converts focused plain-English dataset questions into filters, comparisons, and aggregations |
| **Document Intelligence** | Summarizes pasted or already-extracted text and surfaces key terms/document shape |
| **Resume ↔ Job Analyzer** | Compares detected technical skills in a resume and job description |
| **Expense Intelligence** | Detects likely amount/category fields and builds a local spending breakdown |
| **Meeting Intelligence** | Extracts a compact summary, explicit decisions, action-like sentences, and topics |
| **Developer Log Analyzer** | Groups repeated warning/error patterns from application logs |
| **Social Post Studio** | Measures an image locally, adjusts presentation, crops, exports, and prepares context-assisted post copy |

## Architecture

```text
React UI
   │
   ├── Shared workspace components
   │
   ├── Tool pages
   │
   └── Local example inputs
           │
           ▼
Focused processing engines
   │
   ├── Dataset profiler
   ├── Statistics
   ├── Anomaly detection
   ├── Trend analysis
   ├── Insight generation
   ├── Chart recommendation
   ├── Question / filter / aggregation parsing
   ├── Text heuristics
   └── Canvas image processing
           │
           ▼
Transparent local result
```

### Data-analysis flow

```text
CSV / XLSX
   ↓
File parser
   ↓
Dataset profile
   ↓
Statistics / anomalies / trends
   ↓
Insights + chart recommendations
   ↓
React result views
```

### Data Q&A flow

```text
Dataset + focused question
   ↓
Question parser
   ↓
Filter / comparison / aggregation intent
   ↓
Deterministic query engine
   ↓
Answer + supporting reasoning
```

### Social Post Studio flow

```text
Photo
   ↓
Browser Canvas
   ↓
Brightness / contrast / saturation / temperature / palette
   ↓
User-adjustable treatment + crop
   ↓
Local image export
```

Pixel measurements do not pretend to identify arbitrary image subjects. Subject-specific copy uses the context entered by the user.

## Privacy

The current portfolio build is intentionally local-first.

- Spreadsheet analysis happens in the browser.
- Text intelligence runs locally in the browser.
- Social Post Studio measures and processes images locally.
- The current implementation does not require a paid AI API.
- Uploaded portfolio-demo content is not intentionally sent to an application backend.

Always inspect the deployed application and source before using it with genuinely sensitive production data.

## Built-in examples

Each capability includes example content so the tool can be evaluated without preparing files first.

Examples include:

- sales analysis CSV,
- messy customer dataset,
- monthly expenses,
- sample resume and mobile-engineer job description,
- product meeting notes,
- project proposal text,
- application error logs,
- sample social image.

The examples use the same processing paths as user-provided inputs.

## Stack

- React 19
- TypeScript
- Vite
- SheetJS (`xlsx`)
- Lucide icons
- Browser Canvas APIs
- Vitest
- GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

## Shareable tool routes

Nexora uses dependency-free hash routing so individual tools can be linked directly while remaining simple to deploy on static hosting.

Examples:

```text
/#/tools/data-analyst
/#/tools/data-qa
/#/tools/resume-analyzer
/#/tools/social-post-studio
```

Browser Back/Forward navigation also works between tools.

## Current limitations

- Document Intelligence currently works with pasted or pre-extracted text; PDF binary extraction is not bundled.
- The text-intelligence tools use deterministic heuristics rather than a generative LLM.
- Data Q&A intentionally supports focused analytical questions rather than unrestricted natural-language reasoning.
- Social Post Studio uses pixel statistics plus user context; it does not perform general computer-vision object recognition.
- This is a portfolio engineering build rather than a production SaaS service.

## Engineering choices

A few deliberate decisions:

- **Transparent processing over fake AI claims.** Calculations and heuristics remain identifiable as calculations and heuristics.
- **Local-first by default.** The current tools work without sending files to a paid model endpoint.
- **Small focused engines.** Profiling, statistics, anomalies, trends, filtering, aggregation, and presentation are separated.
- **Examples use real paths.** Demo inputs go through the same code paths as uploaded/pasted content.
- **Shareable routes without deployment complexity.** Hash routing keeps static Vercel hosting straightforward.
- **Test core calculations.** Deterministic analysis logic is a good fit for automated unit testing.

## Repository usage

This repository is published primarily as a portfolio and engineering case study. No explicit open-source license is currently granted. Contact the author before reusing substantial portions of the source.

## Author

**Inzamamul Haque**  
Senior Mobile Engineer / React Native Engineer

- Portfolio: https://inzamam-dev.vercel.app/
- GitHub: https://github.com/inzamam6161
EOF

# ---------------------------------------------------------------------------
# 9. Package scripts + current Vitest
# ---------------------------------------------------------------------------
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
npm install --save-dev 'vitest@^5.0.1'

# ---------------------------------------------------------------------------
# 10. GitHub repository metadata (optional; only when gh is installed/authenticated)
# ---------------------------------------------------------------------------
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "==> Updating GitHub repository metadata"
  gh repo edit inzamam6161/nexora-ai-lab \
    --description "Local-first React + TypeScript intelligence toolkit for data, documents, career, developer logs, expenses, and browser-side image processing." \
    --homepage "https://nexora-ai-lab-psi.vercel.app/" \
    --add-topic react \
    --add-topic typescript \
    --add-topic vite \
    --add-topic data-analysis \
    --add-topic local-first \
    --add-topic portfolio
else
  echo "==> GitHub CLI not authenticated; skipping repo description/topics update."
fi

# ---------------------------------------------------------------------------
# 11. Validate
# ---------------------------------------------------------------------------
echo "==> Running lint"
npm run lint

echo "==> Running tests"
npm test

echo "==> Running production build"
npm run build

echo
echo "============================================================"
echo "Nexora AI Lab one-shot update applied."
echo "Review changes with:"
echo "  git status"
echo "  git diff"
echo
echo "Then commit/push when satisfied:"
echo '  git add -A'
echo '  git commit -m "Polish Nexora portfolio build, routing, tests and CI"'
echo '  git push'
echo "============================================================"
