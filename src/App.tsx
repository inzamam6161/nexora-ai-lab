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
