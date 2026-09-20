import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  Image,
  MessageSquareText,
  Sparkles,
  TableProperties,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";

export type ToolDefinition = {
  id: string;
  title: string;
  shortDescription: string;
  input: string[];
  output: string[];
  icon: LucideIcon;
  status?: "ready" | "coming-soon";
};

export const tools: ToolDefinition[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    shortDescription:
      "Turn spreadsheets into useful business insights.",
    input: [
      "CSV or Excel file",
      "Sales, operations or business data",
    ],
    output: [
      "Statistics",
      "Trends",
      "Anomalies",
      "Charts",
    ],
    icon: BarChart3,
    status: "ready",
  },
  {
    id: "dataset-cleaner",
    title: "Dataset Cleaner",
    shortDescription:
      "Find and fix common data-quality problems.",
    input: [
      "CSV or Excel file",
      "Messy or incomplete dataset",
    ],
    output: [
      "Detected issues",
      "Cleaned dataset",
      "Downloadable file",
    ],
    icon: TableProperties,
  },
  {
    id: "data-qa",
    title: "Data Q&A",
    shortDescription:
      "Ask plain-English questions about your dataset.",
    input: [
      "CSV or Excel file",
      "A question about the data",
    ],
    output: [
      "Direct answer",
      "Calculation",
      "Supporting chart",
    ],
    icon: MessageSquareText,
  },
  {
    id: "document-intelligence",
    title: "Document Intelligence",
    shortDescription:
      "Extract the important information from documents.",
    input: [
      "Pasted or extracted document text",
    ],
    output: [
      "Summary",
      "Key information",
      "Important sections",
    ],
    icon: FileText,
  },
  {
    id: "resume-analyzer",
    title: "Resume ↔ Job Analyzer",
    shortDescription:
      "Compare a resume against a job description.",
    input: [
      "Resume",
      "Job description",
    ],
    output: [
      "Match score",
      "Missing skills",
      "Strengths",
      "Recommendations",
    ],
    icon: BriefcaseBusiness,
  },
  {
    id: "expense-intelligence",
    title: "Expense Intelligence",
    shortDescription:
      "Understand where your money is going.",
    input: [
      "Expense CSV or Excel",
    ],
    output: [
      "Spending breakdown",
      "Trends",
      "Unusual expenses",
      "Insights",
    ],
    icon: CircleDollarSign,
  },
  {
    id: "meeting-intelligence",
    title: "Meeting Intelligence",
    shortDescription:
      "Turn meeting notes into structured outcomes.",
    input: [
      "Meeting transcript",
      "Notes or copied text",
    ],
    output: [
      "Summary",
      "Decisions",
      "Action items",
      "Topics",
    ],
    icon: Sparkles,
  },
  {
    id: "log-analyzer",
    title: "Developer Log Analyzer",
    shortDescription:
      "Find recurring errors and useful patterns in logs.",
    input: [
      "Application logs",
      "Server logs",
    ],
    output: [
      "Errors",
      "Patterns",
      "Frequency",
      "Possible causes",
    ],
    icon: TerminalSquare,
  },
  {
    id: "social-post-studio",
    title: "Social Post Studio",
    shortDescription:
      "Prepare photos for social-media publishing.",
    input: [
      "One photo",
    ],
    output: [
      "Image enhancement",
      "Smart crop",
      "Caption",
      "Hashtags",
      "Export",
    ],
    icon: Image,
  },
];