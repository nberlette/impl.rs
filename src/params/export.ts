export type ExportFormat = "json" | "yaml" | "yml" | "toml" | "csv";

export function match(p: string): p is ExportFormat {
  p = ((p || "") + "").toLowerCase().trim();
  return ["csv", "json", "toml", "yaml", "yml"].includes(p);
}
