// The Plan is read where Docent keeps it, never copied: docs/dutch/plan.yml.
// Its format is .agents/skills/docent/PLAN-FORMAT.md.
import { readFileSync } from "node:fs";
import yaml from "js-yaml";

export interface Objective {
  id: string;
  skill: string;
  tier: "exam" | "stretch" | "knm";
  status: "todo" | "active" | "done" | "unsupported";
  text: string;
  theme?: string;
  angles?: string[];
  sessions?: string[];
}

export interface Plan {
  horizon: string;
  objectives: Objective[];
}

export function readPlan(): Plan {
  const plan = yaml.load(readFileSync("docs/dutch/plan.yml", "utf8")) as Plan;
  return { horizon: String(plan.horizon), objectives: plan.objectives ?? [] };
}
