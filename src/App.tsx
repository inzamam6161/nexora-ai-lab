import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import DataAnalystPage from "./pages/DataAnalystPage";
import DataQAPage from "./pages/DataQAPage";
import DatasetCleanerPage from "./pages/DatasetCleanerPage";
import IntelligencePage from "./pages/IntelligencePage";
import ExpenseIntelligencePage from "./pages/ExpenseIntelligencePage";
import SocialPostStudioPage from "./pages/SocialPostStudioPage";
import type { ToolRoute } from "./app/toolRegistry";

function App(){const[activeTool,setActiveTool]=useState<ToolRoute>("dashboard");const back=()=>setActiveTool("dashboard");let page:React.ReactNode;
 switch(activeTool){
  case"data-analyst":page=<DataAnalystPage onBack={back}/>;break;
  case"data-qa":page=<DataQAPage onBack={back}/>;break;
  case"dataset-cleaner":page=<DatasetCleanerPage onBack={back}/>;break;
  case"expense-intelligence":page=<ExpenseIntelligencePage onBack={back}/>;break;
  case"document-intelligence":case"resume-analyzer":case"meeting-intelligence":case"log-analyzer":page=<IntelligencePage mode={activeTool} onBack={back}/>;break;
  case"social-post-studio":page=<SocialPostStudioPage onBack={back}/>;break;
  default:page=<Dashboard onNavigate={setActiveTool}/>;
 }
 return <AppShell activeTool={activeTool} onNavigate={setActiveTool}>{page}</AppShell>;
}
export default App;
