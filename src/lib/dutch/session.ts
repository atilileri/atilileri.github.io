// A Session's status is read off its Prompts, never declared.
type Prompt = { answer?: string; skipped?: boolean };

export type Status = "planned" | "partial" | "complete";

export function status(prompts: Prompt[]): Status {
  const done = prompts.filter((p) => p.answer !== undefined || p.skipped).length;
  if (prompts.length > 0 && done === prompts.length) return "complete";
  return done === 0 ? "planned" : "partial";
}

export const statusTr: Record<Status, string> = {
  planned: "planlandı",
  partial: "yarım",
  complete: "tamam",
};

export const formatDate = (d: Date, locale = "tr-TR") =>
  d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

// Frontmatter text is plain YAML, so Markdown never runs on it. Docent quotes
// Dutch in backticks there too; this turns those into <code>, and escapes the rest.
export function inline(text: string): string {
  const escaped = text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  return escaped.replace(/`([^`]+)`/g, '<code lang="nl">$1</code>');
}
