import {
  useState,
} from "react";

import FileDropzone from "../shared/FileDropzone";
import {
  ArrowLeft,
} from "lucide-react";

import ToolIntro from "./ToolIntro";
import InputPanel from "./InputPanel";
import ResultPanel from "./ResultPanel";

import type {
  ToolDefinition,
} from "../../data/tools";

type ToolWorkspaceProps = {
  tool: ToolDefinition;
  onBack: () => void;
};

export default function ToolWorkspace({
  tool,
  onBack,
}: ToolWorkspaceProps) {
  
  const [, setFiles] =useState<File[]>([]);

  return (
    <section className="tool-workspace">
      <button
        type="button"
        className="tool-workspace__back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Dashboard
      </button>

      <ToolIntro tool={tool} />

      <div className="tool-workspace__grid">
        <InputPanel
        title="Upload your dataset"
        description="Upload CSV or Excel data to begin analysis."
        >
        {tool.id === "data-analyst" ? (
        <FileDropzone
            accept=".csv,.xlsx,.xls"
            acceptedExtensions={[
                ".csv",
                ".xlsx",
                ".xls",
            ]}
            maxSizeMB={10}
            onFilesSelected={setFiles}
            />
        ) : (
            <div className="input-placeholder">
            Input component will be added
            when this tool is implemented.
            </div>
        )}
        </InputPanel>

        <ResultPanel status="empty" />
      </div>
    </section>
  );
}