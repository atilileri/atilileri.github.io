/*
 * Tests for the inventory's query and write rules.
 *
 *   node --test tools/dutch/items.test.mjs
 *
 * Docent writes this file blind — it is too large to read (docs/dutch/adr/0014)
 * — so the properties fixed below are the ones nothing else can catch:
 *
 *   - the ladder derives from the Horizon and stores no due date, so moving the
 *     Horizon reschedules everything with an empty diff (#100);
 *   - two wrong in a row land on rung 1 from every Rung, which is the rule that
 *     needed a third field to be implementable at all (#152);
 *   - a bad call writes nothing, because a partial write to a 260,000-token
 *     file cannot be reviewed by the agent that made it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slug, idMatchesWord, gaps, gapFor, move, dueList, mergeAdd,
  parseVerdicts, applyVerdicts, drift, readHorizon, parseArgs, days,
} from "./items.mjs";

// ------------------------------------------------------------------- the id

test("the id is the Dutch word, slugged", () => {
  assert.equal(slug("fiets"), "fiets");
  assert.equal(slug("De man met de hoed"), "de-man-met-de-hoed");
  assert.equal(slug("'s morgens"), "s-morgens");
});

test("diacritics survive, because stripping them collides two real words", () => {
  // "één" (one, emphatic) and "een" (a) are different words. A slug that
  // folded the accents would make the second `add` look like a duplicate.
  assert.equal(slug("één"), "één");
  assert.notEqual(slug("één"), slug("een"));
  assert.equal(slug("café"), "café");
});

test("a collision suffix is accepted and anything else is not", () => {
  assert.ok(idMatchesWord("bank", "bank"));
  assert.ok(idMatchesWord("bank-2", "bank"));
  assert.ok(!idMatchesWord("bank-meubel", "bank"));
  assert.ok(!idMatchesWord("i0417", "bank"));
});

// --------------------------------------------------------------- the ladder

test("the gaps come from the Horizon and match the numbers #100 recorded", () => {
  // Both recorded ladders reproduce, which is what pins the formula: #100
  // wrote 3/7/13/26 in early September (208 days to the Horizon) and #90 wrote
  // 3/6/12/24 on 2026-09-19 (193 days). No single rounding rule fits 7 and 13
  // except half-up on 208/32 = 6.5, so the pair is a tighter check than either.
  assert.deepEqual(gaps("2027-03-31", "2026-09-04").slice(0, 4), [3, 7, 13, 26]);
  assert.deepEqual(gaps("2027-03-31", "2026-09-19").slice(0, 4), [3, 6, 12, 24]);
});

test("the ladder retunes as the Horizon approaches, with no row rewritten", () => {
  const september = gaps("2027-03-31", "2026-09-19");
  const november = gaps("2027-03-31", "2026-11-19");
  assert.deepEqual(september, [3, 6, 12, 24, 180]);
  assert.deepEqual(november, [2, 4, 8, 17, 180]);
  // Mastered is flat and does not move with the Horizon.
  assert.equal(september[4], november[4]);
});

test("a near or past Horizon floors every gap at one day and never at zero", () => {
  for (const r of [1, 2, 3, 4]) {
    assert.equal(gapFor(r, "2026-09-20", "2026-09-19"), 1);
    assert.equal(gapFor(r, "2020-01-01", "2026-09-19"), 1);
  }
  assert.equal(gapFor(5, "2020-01-01", "2026-09-19"), 180);
});

// ------------------------------------------------------------------- a move

test("right advances one Rung and stops at Mastered", () => {
  assert.deepEqual(move({ rung: 1 }, "right"), { rung: 2 });
  assert.deepEqual(move({ rung: 5 }, "right"), { rung: 5 });
});

test("a right answer clears the wrong streak", () => {
  assert.deepEqual(move({ rung: 2, wrong: true }, "right"), { rung: 3 });
});

test("one wrong drops one Rung; two in a row drop to rung 1 from any Rung", () => {
  // This is the rule that could not be implemented with #100's two fields:
  // from rung 5, two plain decrements land on 3, not 1.
  for (const start of [3, 4, 5]) {
    const first = move({ rung: start }, "wrong");
    assert.equal(first.rung, start - 1);
    assert.equal(move(first, "wrong").rung, 1);
  }
});

test("wrong never goes below rung 1", () => {
  assert.equal(move({ rung: 1 }, "wrong").rung, 1);
});

test("an unknown verdict is refused rather than guessed", () => {
  assert.throws(() => move({ rung: 2 }, "maybe"), /right or wrong/);
});

// --------------------------------------------------------------- the queue

const items = {
  fiets: { nl: "fiets", tr: "bisiklet", en: "bicycle", hook: "uzun Türkçe bir sahne" },
  huis: { nl: "huis", tr: "ev", en: "house" },
  boom: { nl: "boom", tr: "ağaç", en: "tree" },
};
const H = "2027-03-31";
const TODAY = "2026-09-19"; // gaps 3/6/12/24/180

test("a Direction is due when its gap has passed, counted from the answer", () => {
  const schedule = {
    fiets: { recognition: { rung: 1, answered: "2026-09-16" }, production: { rung: 1, answered: TODAY } },
    huis: { recognition: { rung: 1, answered: "2026-09-18" }, production: { rung: 1, answered: TODAY } },
  };
  const due = dueList(items, schedule, { horizon: H, today: TODAY });
  assert.deepEqual(due.map((r) => `${r.id}/${r.direction}`), ["fiets/recognition"]);
});

test("due carries the lean fields only, so fifty of them stay cheap", () => {
  const schedule = { fiets: { recognition: { rung: 1, answered: "2026-09-01" }, production: { rung: 1, answered: TODAY } } };
  const [row] = dueList(items, schedule, { horizon: H, today: TODAY });
  assert.deepEqual(Object.keys(row).sort(), ["direction", "en", "id", "nl", "overdue", "rung", "tr"]);
  assert.ok(!("hook" in row));
});

test("production waits for recognition to pass rung 1", () => {
  const schedule = {
    fiets: { recognition: { rung: 1, answered: TODAY }, production: { rung: 1, answered: "2026-01-01" } },
    huis: { recognition: { rung: 2, answered: TODAY }, production: { rung: 1, answered: "2026-01-01" } },
  };
  const due = dueList(items, schedule, { horizon: H, today: TODAY });
  assert.deepEqual(due.map((r) => r.id), ["huis"]);
});

test("the most overdue comes first", () => {
  const schedule = {
    // rung 1 gap is 3 days, rung 3 gap is 12: fiets is 15 overdue, boom 18, huis 46.
    fiets: { recognition: { rung: 1, answered: "2026-09-01" }, production: { rung: 1, answered: TODAY } },
    huis: { recognition: { rung: 1, answered: "2026-08-01" }, production: { rung: 1, answered: TODAY } },
    boom: { recognition: { rung: 3, answered: "2026-08-20" }, production: { rung: 1, answered: TODAY } },
  };
  const due = dueList(items, schedule, { horizon: H, today: TODAY });
  assert.deepEqual(due.map((r) => r.id), ["huis", "boom", "fiets"]);
});

test("a tie in overdue goes to the lower Rung, so a struggling word wins", () => {
  const schedule = {
    // Both 15 days overdue: fiets at rung 1 (3-day gap, 18 days ago),
    // boom at rung 3 (12-day gap, 27 days ago).
    fiets: { recognition: { rung: 1, answered: "2026-09-01" }, production: { rung: 1, answered: TODAY } },
    boom: { recognition: { rung: 3, answered: "2026-08-23" }, production: { rung: 1, answered: TODAY } },
  };
  const due = dueList(items, schedule, { horizon: H, today: TODAY });
  assert.deepEqual(due.map((r) => [r.id, r.overdue]), [["fiets", 15], ["boom", 15]]);
});

test("the budget caps the queue, and the cut falls on the least overdue", () => {
  const schedule = {
    fiets: { recognition: { rung: 1, answered: "2026-09-01" }, production: { rung: 1, answered: TODAY } },
    huis: { recognition: { rung: 1, answered: "2026-08-01" }, production: { rung: 1, answered: TODAY } },
  };
  const due = dueList(items, schedule, { horizon: H, today: TODAY, limit: 1 });
  assert.deepEqual(due.map((r) => r.id), ["huis"]);
});

test("moving the Horizon reschedules the queue with no row rewritten", () => {
  const schedule = { huis: { recognition: { rung: 4, answered: "2026-09-01" }, production: { rung: 1, answered: TODAY } } };
  const far = dueList(items, schedule, { horizon: "2027-03-31", today: TODAY });
  const near = dueList(items, schedule, { horizon: "2026-11-30", today: TODAY });
  assert.equal(far.length, 0); // rung 4 gap is 24 days; 18 have passed
  assert.equal(near.length, 1); // the same row, gap now 9 days
});

test("a Mastered Direction returns, rarely, rather than leaving circulation", () => {
  const old = { huis: { recognition: { rung: 5, answered: "2026-01-01" }, production: { rung: 5, answered: TODAY } } };
  assert.equal(dueList(items, old, { horizon: H, today: TODAY }).length, 1);
});

// ---------------------------------------------------------------- the drift

test("drift is reported in both directions", () => {
  const found = drift({ fiets: items.fiets }, { huis: {} });
  assert.equal(found.length, 2);
  assert.match(found.join("\n"), /fiets: in the inventory/);
  assert.match(found.join("\n"), /huis: in the schedule/);
});

// ----------------------------------------------------------------- add

test("add writes the Item and starts both Directions on rung 1 today", () => {
  const next = mergeAdd({}, {}, { fiets: { nl: "fiets", tr: "bisiklet", en: "bicycle" } }, TODAY);
  assert.deepEqual(next.schedule.fiets, {
    recognition: { rung: 1, answered: TODAY },
    production: { rung: 1, answered: TODAY },
  });
  assert.equal(next.items.fiets.tr, "bisiklet");
});

test("add refuses a duplicate id and names the word already there", () => {
  assert.throws(
    () => mergeAdd(items, {}, { fiets: { nl: "fiets", tr: "başka", en: "other" } }, TODAY),
    /already exists .*bisiklet.*fiets-2/s,
  );
});

test("add refuses an id that is not the slugged word", () => {
  assert.throws(
    () => mergeAdd({}, {}, { i0417: { nl: "fiets", tr: "bisiklet", en: "bicycle" } }, TODAY),
    /must be "fiets"/,
  );
});

test("add refuses an Item missing a required field", () => {
  assert.throws(() => mergeAdd({}, {}, { fiets: { nl: "fiets", tr: "bisiklet" } }, TODAY), /missing en/);
});

test("add refuses a list where a map keyed by id is meant", () => {
  assert.throws(() => mergeAdd({}, {}, [{ nl: "fiets" }], TODAY), /map of Items keyed by id/);
});

test("a refused add changes neither input", () => {
  const before = structuredClone(items);
  assert.throws(() => mergeAdd(items, {}, { fiets: { nl: "fiets", tr: "x", en: "y" } }, TODAY));
  assert.deepEqual(items, before);
});

// -------------------------------------------------------------- the verdicts

test("verdicts parse one per line, and comments and blanks are ignored", () => {
  assert.deepEqual(parseVerdicts("# session 12\nfiets recognition right\n\nhuis production wrong\n"), [
    { id: "fiets", direction: "recognition", verdict: "right" },
    { id: "huis", direction: "production", verdict: "wrong" },
  ]);
});

test("a malformed verdict line fails the whole batch and says which line", () => {
  assert.throws(() => parseVerdicts("fiets recognition right\nhuis sideways wrong\n"), /line 2/);
  assert.throws(() => parseVerdicts("fiets recognition\n"), /line 1/);
  assert.throws(() => parseVerdicts("fiets recognition perhaps\n"), /right or wrong/);
});

test("an unknown id fails the batch before anything is written", () => {
  const schedule = { fiets: { recognition: { rung: 1, answered: TODAY }, production: { rung: 1, answered: TODAY } } };
  const before = structuredClone(schedule);
  assert.throws(
    () => applyVerdicts(items, schedule, parseVerdicts("fiets recognition right\nzzz production wrong\n"), TODAY),
    /no such Item: zzz/,
  );
  assert.deepEqual(schedule, before);
});

test("applying verdicts stamps the day the learner answered, not the due date", () => {
  const schedule = { fiets: { recognition: { rung: 2, answered: "2026-09-01" }, production: { rung: 1, answered: "2026-09-01" } } };
  const next = applyVerdicts(items, schedule, parseVerdicts("fiets recognition right\n"), "2026-09-19");
  assert.deepEqual(next.fiets.recognition, { rung: 3, answered: "2026-09-19" });
  assert.deepEqual(schedule.fiets.recognition, { rung: 2, answered: "2026-09-01" }, "the input is untouched");
});

test("a wrong answer leaves the streak bit, and the next right answer clears it", () => {
  const schedule = { fiets: { recognition: { rung: 4, answered: TODAY }, production: { rung: 1, answered: TODAY } } };
  const one = applyVerdicts(items, schedule, parseVerdicts("fiets recognition wrong\n"), TODAY);
  assert.deepEqual(one.fiets.recognition, { rung: 3, wrong: true, answered: TODAY });
  const two = applyVerdicts(items, one, parseVerdicts("fiets recognition wrong\n"), TODAY);
  assert.equal(two.fiets.recognition.rung, 1);
  const three = applyVerdicts(items, two, parseVerdicts("fiets recognition right\n"), TODAY);
  assert.ok(!("wrong" in three.fiets.recognition));
});

// -------------------------------------------------------------- the Horizon

test("the Horizon is read from a prose line, because PLAN.md has no shape yet", () => {
  assert.equal(readHorizon("# Plan\n\n**Horizon**: 2027-03-31 — explicitly temporary.\n"), "2027-03-31");
  assert.equal(readHorizon("horizon: 2027-03-31\n"), "2027-03-31");
  assert.equal(readHorizon("# Plan\nNo date here.\n"), null);
  // A date on a line that is not about the Horizon is not the Horizon.
  assert.equal(readHorizon("Written 2026-09-23.\n"), null);
});

// ------------------------------------------------------------------- the CLI

test("an unknown flag is refused rather than ignored", () => {
  assert.throws(() => parseArgs(["due", "--limlt", "5"]), /unknown argument/);
});

test("a bad date is refused where it is given, not later", () => {
  assert.throws(() => parseArgs(["due", "--on", "tuesday"]), /not a date/);
});

test("days between two dates ignores the clock", () => {
  assert.equal(days("2026-09-01", "2026-09-19"), 18);
  assert.equal(days("2026-09-19", "2026-09-01"), -18);
});
