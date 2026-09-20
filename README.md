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
