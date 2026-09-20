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
