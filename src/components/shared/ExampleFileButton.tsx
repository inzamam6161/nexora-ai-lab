import { Sparkles } from "lucide-react";

type Props = {
  path: string;
  fileName: string;
  type?: string;
  onLoad: (files: File[]) => void | Promise<void>;
  label?: string;
};

export default function ExampleFileButton({ path, fileName, type = "text/plain", onLoad, label = "Try example" }: Props) {
  async function loadExample() {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Example file could not be loaded.");
    const blob = await response.blob();
    await onLoad([new File([blob], fileName, { type: blob.type || type })]);
  }

  return <button type="button" className="example-action" onClick={loadExample}><Sparkles size={14}/>{label}</button>;
}
