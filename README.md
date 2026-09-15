# Nexora AI Lab

Nexora AI Lab is a local-first collection of small intelligence tools built with React and TypeScript. I made it as a portfolio project to explore how far useful analysis can go with transparent rules and browser-side processing instead of paid AI APIs.

## What is included

- **AI Data Analyst** — profiles CSV/XLSX files, calculates statistics, finds anomalies and trends, generates insights, and recommends charts.
- **Dataset Cleaner** — removes exact duplicate rows, trims text values, reports missing cells, and exports a cleaned CSV.
- **Data Q&A** — turns a focused plain-English question into filters and aggregations, then shows the answer and reasoning.
- **Document Intelligence** — summarizes pasted text and surfaces recurring terms and document shape.
- **Resume ↔ Job Analyzer** — compares detected technical skills in a resume and job description.
- **Expense Intelligence** — finds likely amount/category fields and builds a local spending breakdown.
- **Meeting Intelligence** — extracts a short summary, explicit decisions, action-like sentences, and common topics.
- **Developer Log Analyzer** — groups recurring warning/error patterns from pasted logs.
- **Social Post Studio** — locally crops a photo to 4:5, adjusts brightness/contrast/saturation, and exports a 1080×1350 PNG.

## Stack

React 19, TypeScript, Vite, SheetJS (`xlsx`) and Lucide icons. Spreadsheet and image processing happens in the browser.

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## Notes

This project intentionally avoids pretending deterministic rules are a generative model. The analysis tools expose calculations and reasoning where useful, and the photo editor is described as image processing rather than generative AI.

PDF binary extraction is not bundled; Document Intelligence currently works from pasted/extracted text. This keeps the project dependency-light and fully local.

## Built-in examples

Every tool has a small example so the project can be tested without preparing files first. Spreadsheet tools load bundled CSV data, the text tools load realistic sample documents/notes/logs, the resume analyzer loads both sides of a sample comparison, and Social Post Studio includes a local sample image. The examples go through the same processing paths as user-provided input.
