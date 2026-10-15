import { strict as assert } from "assert";
import {
  assessmentHash,
  assessmentResult,
  emptyAssessmentSession,
  reachableSession,
  restoreAssessmentSession,
  serialiseAssessmentSession,
  sessionAtHash
} from "@/lib/assessment-session";
import { archetypes } from "@/lib/archetypes";
import { questions } from "@/lib/questions";
import type { AssessmentSession } from "@/lib/assessment-session";
import type { AssessmentResult } from "@/lib/types";

function draft(answeredCount: number): AssessmentSession {
  return {
    ...emptyAssessmentSession(),
    step: "questions",
    stage: "baby_toddler",
    questionIndex: answeredCount,
    answers: Object.fromEntries(questions.slice(0, answeredCount).map((question) => [
      question.id, question.kind === "mcq" ? 2 : "A completed written reflection."
    ]))
  };
}

for (const count of [0, 10, 15, 21]) {
  const session = draft(count);
  assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession(session)), session);
  assert.equal(assessmentHash(session), `#question-${count + 1}`);
}

const partialText = draft(21);
partialText.answers.q22 = "A thought in progress.\nNot finished yet";
assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession(partialText)), partialText);

const lead = { ...draft(24), step: "lead" as const, questionIndex: 23 };
lead.lead = { name: "Test Father", email: "resume@example.test", phone: "1234", city: "Test City" };
assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession(lead)), lead);
assert.equal(assessmentHash(lead), "#details");

const result: AssessmentResult = {
  id: "test-submission",
  archetype: archetypes.awakening,
  report: {
    currentPattern: "Your specific saved pattern.",
    beneathSurface: "Your saved insight.",
    whatIsWorking: ["A strength."],
    attentionAreas: [{ gap: "alignment", title: "Alignment", insight: "Your saved attention area." }],
    nextReflections: ["Your saved next step."]
  }
};
const completed: AssessmentSession = { ...lead, step: "results", result };
assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession(completed)), completed);
assert.equal(assessmentHash(completed), "#results");
assert.deepEqual(sessionAtHash(completed, "#question-1"), completed);

// Once a response is received, refresh during the animation recovers the report.
assert.equal(restoreAssessmentSession(serialiseAssessmentSession({ ...completed, step: "analysing" }))?.step, "results");
// Before a response is received, return to the filled details without repeating a POST.
assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession({ ...lead, step: "analysing" })), lead);

for (const corrupt of [null, "", "not json", "null", "[]", "{}", '{"schemaVersion":99}']) {
  assert.equal(restoreAssessmentSession(corrupt), null);
}
assert.equal(assessmentResult({ archetype: { key: "toString" }, report: {} }), null);
assert.equal(assessmentResult({ ...result, report: { ...result.report, attentionAreas: [null] } }), null);
assert.equal(assessmentResult({ ...result, report: { ...result.report, nextReflections: [42] } }), null);
const oldDraft = { ...JSON.parse(serialiseAssessmentSession(draft(10))), assessmentVersion: "future-or-obsolete-version" };
assert.equal(restoreAssessmentSession(JSON.stringify(oldDraft)), null);
const oldReport = { ...JSON.parse(serialiseAssessmentSession(completed)), assessmentVersion: "previous-version" };
assert.equal(restoreAssessmentSession(JSON.stringify(oldReport))?.result?.report.currentPattern, result.report.currentPattern);

// A saved question ID survives changes to the numeric index representation.
const savedLocation = JSON.parse(serialiseAssessmentSession(draft(10)));
savedLocation.questionId = questions[5].id;
assert.equal(restoreAssessmentSession(JSON.stringify(savedLocation))?.questionIndex, 5);
assert.equal(sessionAtHash(draft(10), "#question-5").questionIndex, 4);
assert.equal(sessionAtHash(draft(10), "#question-100").questionIndex, 10);
assert.equal(sessionAtHash(draft(10), "#details").questionIndex, 10);
assert.equal(sessionAtHash(draft(10), "#details").step, "questions");
assert.equal(reachableSession({ ...draft(10), stage: null }).step, "stage");

const unsafeDraft = JSON.parse(serialiseAssessmentSession(draft(10)));
unsafeDraft.answers[questions[0].id] = 100;
unsafeDraft.answers.unknown = "discard this";
unsafeDraft.questionId = questions[18].id;
const safeDraft = restoreAssessmentSession(JSON.stringify(unsafeDraft));
assert.equal(safeDraft?.questionIndex, 0);
assert.equal(safeDraft?.answers.unknown, undefined);

assert.equal(assessmentHash(emptyAssessmentSession()), "");
assert.deepEqual(restoreAssessmentSession(serialiseAssessmentSession(emptyAssessmentSession())), emptyAssessmentSession());
console.log("Session tests passed: draft/result restoration, interrupted submission, URL navigation, and corrupt storage.");
