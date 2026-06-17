import { strict as assert } from "assert";
import { determineArchetype, computeScores } from "@/lib/scoring";
import type { AssessmentAnswer } from "@/lib/types";

const scoredIds = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
  "q11",
  "q12",
  "q13",
  "q14",
  "q15"
];

function answers(values: Record<string, number>): AssessmentAnswer[] {
  return [
    ...scoredIds.map((id) => ({ questionId: id, value: values[id] ?? 2 })),
    { questionId: "q16", value: "A recent family moment stayed with me." },
    { questionId: "q17", value: "I want to be more present." }
  ];
}

const perfect = computeScores(answers(Object.fromEntries(scoredIds.map((id) => [id, 4]))));
assert.equal(perfect.consistency, 100);
assert.equal(perfect.ownership, 100);
assert.equal(perfect.relationships, 100);
assert.equal(perfect.initiative, 100);
assert.equal(perfect.work, 100);
assert.equal(determineArchetype(perfect).key, "present");

const provider = computeScores(
  answers({
    q4: 4,
    q5: 3,
    q6: 3,
    q7: 1,
    q8: 1,
    q9: 1,
    q13: 4,
    q14: 4,
    q15: 3
  })
);
assert.equal(determineArchetype(provider).key, "provider");

const weekend = computeScores(
  answers({
    q1: 1,
    q2: 1,
    q3: 1,
    q7: 2,
    q8: 2,
    q9: 3,
    q10: 2,
    q11: 2,
    q12: 2
  })
);
assert.equal(determineArchetype(weekend).key, "weekend");

const firefighter = computeScores(
  answers({
    q4: 1,
    q5: 1,
    q6: 2,
    q7: 1,
    q8: 1,
    q9: 2,
    q10: 1,
    q11: 1,
    q12: 1
  })
);
assert.equal(determineArchetype(firefighter).key, "firefighter");

console.log("Scoring tests passed.");
