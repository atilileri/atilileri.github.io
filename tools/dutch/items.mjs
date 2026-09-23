#!/usr/bin/env node
/*
 * The only way in or out of the Item inventory.
 *
 *   node tools/dutch/items.mjs due [--limit N] [--on <date>]
 *   node tools/dutch/items.mjs get <id> [<id> ...]
 *   node tools/dutch/items.mjs add            < new-items.yml
 *   node tools/dutch/items.mjs answer         < verdicts.txt
 *
 * **Docent never opens `items.yml`.** Holding B1 needs 1,600–2,600 Items
 * (#100) and an Item carries Turkish prose, so the file reaches about 260,000
 * tokens — larger than the agent that maintains it. It is queried, never read,
 * and never hand-edited. The reasoning is docs/dutch/adr/0014; the contract
 * this file implements is docs/dutch/INVENTORY.md. Locked by issue #152.
 *
 * Two files, joined on the Item id:
 *
 *   docs/dutch/items.yml      content, keyed by the slugged Dutch word
 *   docs/dutch/schedule.yml   churn — `rung`, `answered`, and `wrong` during
 *                             a wrong streak — per Direction
 *
 * Three rules hold the whole thing up:
 *
 *   1. **Validate everything, then write once.** Docent writes blind, so a
 *      failed call must leave both files exactly as they were. There is no
 *      partial write anywhere below.
 *   2. **A due date is never stored.** It is derived from the Horizon at read
 *      time (#100), so moving the Horizon reschedules the inventory with an
 *      empty git diff.
 *   3. **Drift between the two files is reported, never repaired.** A script
 *      that quietly fixes a mismatch hides the bug that caused it.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import yaml from "js-yaml";

const ITEMS = "docs/dutch/items.yml";
const SCHEDULE = "docs/dutch/schedule.yml";
const PLAN = "docs/dutch/PLAN.md";
const DIRECTIONS = ["recognition", "production"];
const MASTERED = 5;
const MASTERED_GAP = 180;
const BUDGET = 50;

// The fields a Prompt needs to ask a review. Everything else on an Item —
// bridge, hook, split, trap, the pronunciation fields — is needed only when an
// answer is wrong and Docent has to explain, so `due` leaves it out and `get`
// brings it back. Fifty lean Items cost a few thousand tokens; fifty whole ones
// cost about seven thousand and are mostly unread.
const LEAN = ["nl", "tr", "en"];

// ------------------------------------------------------------------- the id

/*
 * The id is the Dutch word, slugged. A diff and a Picture filename
 * (public/images/dutch/<id>.webp) then both read as the word they are about.
 *
 * Diacritics are kept, because stripping them collides `één` with `een` — two
 * different Dutch words. Case, spaces and punctuation go.
 */
export function slug(nl) {
  return String(nl)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// `bank` the furniture and `bank` the money both slug to `bank`; the second
// one added becomes `bank-2`. The suffix carries no meaning — the `tr` and
// `en` fields one line below already say which word it is.
export function idMatchesWord(id, nl) {
  const base = slug(nl);
  return id === base || new RegExp(`^${escapeRe(base)}-\\d+$`).test(id);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------- the ladder

/*
 * #100: rungs 1–4 sit at Horizon/64, /32, /16, /8, floored at one day, and
 * rung 5 is Mastered at a flat 180 days. The Horizon is a date, so the gaps
 * shrink as it approaches and the whole inventory retunes with no row rewritten.
 */
export function gaps(horizon, today) {
  const h = days(today, horizon);
  const at = (n) => Math.max(1, Math.round(h / n));
  return [at(64), at(32), at(16), at(8), MASTERED_GAP];
}

export function gapFor(rung, horizon, today) {
  const g = gaps(horizon, today);
  return g[clampRung(rung) - 1];
}

export const clampRung = (r) => Math.min(MASTERED, Math.max(1, Number(r) || 1));

export function days(from, to) {
  return Math.round((date(to) - date(from)) / 86400000);
}

export function date(d) {
  const t = d instanceof Date ? d : new Date(`${d}T00:00:00Z`);
  if (Number.isNaN(t.getTime())) throw new Error(`not a date: ${d}`);
  return t;
}

export const iso = (d) => date(d).toISOString().slice(0, 10);

/*
 * Right advances a Rung, wrong drops one, and two wrong in a row drop to rung 1.
 *
 * That last rule needs one bit of memory, which #100's two-field Schedule did
 * not have — from rung 5, two plain decrements land on rung 3 rather than 1.
 * `wrong` is that bit. It is written only during a streak and deleted by the
 * next right answer, so nearly every row still carries two fields (issue #152).
 */
export function move(state, verdict) {
  const rung = clampRung(state?.rung);
  if (verdict === "right") return { rung: Math.min(MASTERED, rung + 1) };
  if (verdict !== "wrong") throw new Error(`verdict is right or wrong, not "${verdict}"`);
  return { rung: state?.wrong ? 1 : Math.max(1, rung - 1), wrong: true };
}

// ------------------------------------------------------------------ the files

function loadYaml(path, what) {
  if (!existsSync(path)) return {};
  let parsed;
  try {
    parsed = yaml.load(readFileSync(path, "utf8"), { filename: path });
  } catch (err) {
    throw new Error(`${path} is not valid YAML: ${err.message}`);
  }
  if (parsed == null) return {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${path} must be a map of ${what} keyed by id, not a list`);
  }
  return parsed;
}

/*
 * The order a person reads in, not the order a computer sorts in: the three
 * words first, then the teaching prose, then pronunciation. `recognition`
 * comes before `production` because that is the order they are learned in.
 * Anything unrecognised keeps its own order at the end, so a field added later
 * is never silently dropped.
 */
const FIELD_ORDER = [
  "nl", "tr", "en",
  "bridge", "hook", "split", "trap",
  "say", "sayCredit", "sayChecked", "ipa", "ipaChecked",
  "recognition", "production",
  "rung", "answered", "wrong",
];

export function orderFields(value) {
  if (Array.isArray(value)) return value.map(orderFields);
  if (value == null || typeof value !== "object") return value;
  const known = FIELD_ORDER.filter((f) => f in value);
  const rest = Object.keys(value).filter((k) => !FIELD_ORDER.includes(k));
  return Object.fromEntries([...known, ...rest].map((k) => [k, orderFields(value[k])]));
}

/*
 * Sorted by id on every write, so a new Item lands beside its neighbours and a
 * diff shows one insertion rather than a growing tail. `flowLevel: 2` keeps one
 * Direction on one line, which is what holds a Session's fifty Rung moves to
 * fifty changed lines.
 */
function dumpYaml(obj, { flowLevel = -1 } = {}) {
  return yaml.dump(orderFields(sortKeys(obj)), {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
    flowLevel,
  });
}

const sortKeys = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .sort((a, b) => a.localeCompare(b, "nl", { numeric: true }))
      .map((k) => [k, o[k]]),
  );

// ------------------------------------------------------------------ the plan

/*
 * One declared date. PLAN.md does not exist yet — #90 found that authoring it
 * is the first build task — so the reader is deliberately loose: the first ISO
 * date on a line that mentions the Horizon wins, whatever prose surrounds it.
 */
export function readHorizon(text) {
  for (const line of String(text).split("\n")) {
    if (!/horizon/i.test(line)) continue;
    const m = line.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

function horizonOf(opts) {
  if (opts.horizon) return opts.horizon;
  if (!existsSync(opts.plan)) {
    throw new Error(
      `no Horizon: ${opts.plan} does not exist yet. Pass --horizon <date>, or author the Plan.`,
    );
  }
  const h = readHorizon(readFileSync(opts.plan, "utf8"));
  if (!h) throw new Error(`no Horizon date found in ${opts.plan}`);
  return h;
}

// -------------------------------------------------------------------- drift

/*
 * Reported, never repaired. A missing Schedule row means `add` did not run; a
 * Schedule row with no Item means an Item was removed by hand. Both are bugs
 * the learner should see, and neither is something a script should paper over.
 */
export function drift(items, schedule) {
  const out = [];
  for (const id of Object.keys(items)) {
    if (!schedule[id]) out.push(`${id}: in the inventory, not in the schedule`);
  }
  for (const id of Object.keys(schedule)) {
    if (!items[id]) out.push(`${id}: in the schedule, not in the inventory`);
  }
  return out;
}

// ---------------------------------------------------------------------- due

/*
 * The queue. Most overdue first, so a backlog drains oldest-first; a tie goes
 * to the lower Rung, because a struggling word is worth more than a held one;
 * a remaining tie goes to the id, so the output is the same on every run.
 *
 * `production` waits for `recognition` to pass rung 1 (#100), so a word is
 * never asked in the harder direction before it is recognised at all.
 */
export function dueList(items, schedule, { horizon, today, limit = BUDGET }) {
  const rows = [];
  for (const [id, state] of Object.entries(schedule)) {
    if (!items[id]) continue;
    const recognitionRung = clampRung(state?.recognition?.rung);
    for (const direction of DIRECTIONS) {
      const s = state?.[direction];
      if (!s || !s.answered) continue;
      if (direction === "production" && recognitionRung < 2) continue;
      const rung = clampRung(s.rung);
      const due = days(s.answered, today) - gapFor(rung, horizon, today);
      if (due < 0) continue;
      rows.push({ id, direction, rung, overdue: due });
    }
  }
  rows.sort(
    (a, b) =>
      b.overdue - a.overdue || a.rung - b.rung || a.id.localeCompare(b.id, "nl"),
  );
  return rows.slice(0, limit).map((r) => ({
    ...r,
    ...Object.fromEntries(LEAN.filter((f) => f in items[r.id]).map((f) => [f, items[r.id][f]])),
  }));
}

// ---------------------------------------------------------------- the commands

function cmdDue(opts) {
  const items = loadYaml(opts.items, "Items");
  const schedule = loadYaml(opts.schedule, "Directions");
  const horizon = horizonOf(opts);
  const today = opts.on || iso(new Date());

  for (const d of drift(items, schedule)) console.error(`drift: ${d}`);

  const rows = dueList(items, schedule, { horizon, today, limit: opts.limit });
  process.stdout.write(
    rows.length
      ? yaml.dump(rows, { lineWidth: 100, noRefs: true, quotingType: '"' })
      : "[]\n",
  );
  console.error(
    `${rows.length} due of a ${opts.limit}-Direction budget; ` +
      `horizon ${horizon}, gaps ${gaps(horizon, today).join("/")} days, on ${today}`,
  );
}

function cmdGet(opts, ids) {
  const items = loadYaml(opts.items, "Items");
  const missing = ids.filter((id) => !(id in items));
  if (missing.length) throw new Error(`no such Item: ${missing.join(", ")}`);
  process.stdout.write(dumpYaml(Object.fromEntries(ids.map((id) => [id, items[id]]))));
}

/*
 * A YAML map of new Items on stdin, keyed by id. Prose does not survive a
 * command line, and ten new Items are one call rather than ten.
 */
export function mergeAdd(items, schedule, incoming, today) {
  const errors = [];
  if (typeof incoming !== "object" || incoming == null || Array.isArray(incoming)) {
    throw new Error("stdin must be a YAML map of Items keyed by id");
  }
  for (const [id, item] of Object.entries(incoming)) {
    if (id in items) {
      errors.push(`${id} already exists (${items[id].nl} — ${items[id].tr}). Use ${id}-2 if this is a different word.`);
      continue;
    }
    if (!item || typeof item !== "object") { errors.push(`${id}: not a map`); continue; }
    for (const f of LEAN) if (!item[f]) errors.push(`${id}: missing ${f}`);
    if (item.nl && !idMatchesWord(id, item.nl)) {
      errors.push(`${id}: id must be "${slug(item.nl)}", or that with a -2 suffix`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));

  const nextItems = { ...items };
  const nextSchedule = { ...schedule };
  for (const [id, item] of Object.entries(incoming)) {
    nextItems[id] = item;
    // A new Item was just taught, so both Directions start on rung 1 answered
    // today, and recognition comes back in three days.
    nextSchedule[id] = {
      recognition: { rung: 1, answered: today },
      production: { rung: 1, answered: today },
    };
  }
  return { items: nextItems, schedule: nextSchedule, added: Object.keys(incoming) };
}

function cmdAdd(opts, stdin) {
  const items = loadYaml(opts.items, "Items");
  const schedule = loadYaml(opts.schedule, "Directions");
  const today = opts.on || iso(new Date());
  let incoming;
  try {
    incoming = yaml.load(stdin, { filename: "stdin" });
  } catch (err) {
    throw new Error(`stdin is not valid YAML: ${err.message}`);
  }
  const next = mergeAdd(items, schedule, incoming, today);
  if (!opts.dryRun) {
    writeFileSync(opts.items, dumpYaml(next.items));
    writeFileSync(opts.schedule, dumpYaml(next.schedule, { flowLevel: 2 }));
  }
  console.error(`${opts.dryRun ? "would add" : "added"} ${next.added.length}: ${next.added.join(", ")}`);
}

/*
 * One verdict per line: `<id> <direction> <right|wrong>`. A Session's fifty
 * Rung moves are one call, and the whole batch fails if any line is wrong.
 */
export function parseVerdicts(text) {
  const rows = [];
  const errors = [];
  text.split("\n").forEach((raw, n) => {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) return;
    const [id, direction, verdict, ...rest] = line.split(/\s+/);
    if (rest.length || !id || !direction || !verdict) {
      errors.push(`line ${n + 1}: expected "<id> <direction> <right|wrong>", got "${raw.trim()}"`);
      return;
    }
    if (!DIRECTIONS.includes(direction)) {
      errors.push(`line ${n + 1}: direction is recognition or production, not "${direction}"`);
      return;
    }
    if (verdict !== "right" && verdict !== "wrong") {
      errors.push(`line ${n + 1}: verdict is right or wrong, not "${verdict}"`);
      return;
    }
    rows.push({ id, direction, verdict });
  });
  if (errors.length) throw new Error(errors.join("\n"));
  return rows;
}

export function applyVerdicts(items, schedule, verdicts, today) {
  const errors = [];
  for (const { id, direction } of verdicts) {
    if (!(id in items)) errors.push(`no such Item: ${id}`);
    else if (!schedule[id]?.[direction]) errors.push(`${id} has no ${direction} in the schedule`);
  }
  if (errors.length) throw new Error([...new Set(errors)].join("\n"));

  const next = structuredClone(schedule);
  for (const { id, direction, verdict } of verdicts) {
    next[id][direction] = { ...move(next[id][direction], verdict), answered: today };
  }
  return next;
}

function cmdAnswer(opts, stdin) {
  const items = loadYaml(opts.items, "Items");
  const schedule = loadYaml(opts.schedule, "Directions");
  // The date the learner answered, never the due date (#100). An answer that
  // arrives a week late counts from the day it was given.
  const today = opts.on || iso(new Date());
  const verdicts = parseVerdicts(stdin);
  const next = applyVerdicts(items, schedule, verdicts, today);
  if (!opts.dryRun) writeFileSync(opts.schedule, dumpYaml(next, { flowLevel: 2 }));
  const right = verdicts.filter((v) => v.verdict === "right").length;
  console.error(
    `${opts.dryRun ? "would apply" : "applied"} ${verdicts.length} verdicts ` +
      `(${right} right, ${verdicts.length - right} wrong) on ${today}`,
  );
}

// ---------------------------------------------------------------------- CLI

const HELP = `The only way in or out of the Item inventory. Docent never opens the file.

  node tools/dutch/items.mjs due [--limit N]     the queue, lean, most overdue first
  node tools/dutch/items.mjs get <id> [<id>...]  whole Items, every field
  node tools/dutch/items.mjs add   < items.yml   new Items as a YAML map on stdin
  node tools/dutch/items.mjs answer < verdicts   "<id> <direction> <right|wrong>" per line

  --on <date>       treat this as today (default: today)
  --horizon <date>  use this Horizon instead of the one in ${PLAN}
  --limit N         due only: budget in Directions (default ${BUDGET})
  --items <path>    inventory (default ${ITEMS})
  --schedule <path> schedule (default ${SCHEDULE})
  --dry-run         report the change and write nothing

Rules: docs/dutch/INVENTORY.md — why: docs/dutch/adr/0014`;

export function parseArgs(argv) {
  const opts = {
    items: ITEMS, schedule: SCHEDULE, plan: PLAN,
    limit: BUDGET, on: null, horizon: null, dryRun: false,
  };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a === "--on") opts.on = iso(argv[++i]);
    else if (a === "--horizon") opts.horizon = iso(argv[++i]);
    else if (a === "--items") opts.items = argv[++i];
    else if (a === "--schedule") opts.schedule = argv[++i];
    else if (a === "--plan") opts.plan = argv[++i];
    else if (a.startsWith("--")) throw new Error(`unknown argument: ${a}`);
    else rest.push(a);
  }
  return { opts, rest };
}

const readStdin = async () => {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
};

async function main() {
  const { opts, rest } = parseArgs(process.argv.slice(2));
  const [command, ...args] = rest;
  if (opts.help || !command) { console.log(HELP); return; }

  if (command === "due") return cmdDue(opts);
  if (command === "get") {
    if (!args.length) throw new Error("get needs at least one id");
    return cmdGet(opts, args);
  }
  if (command === "add") return cmdAdd(opts, await readStdin());
  if (command === "answer") return cmdAnswer(opts, await readStdin());
  throw new Error(`unknown command: ${command}. One of due, get, add, answer.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`items: ${err.message}`);
    process.exit(1);
  });
}
