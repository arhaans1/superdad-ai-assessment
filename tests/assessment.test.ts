import { strict as assert } from "assert";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/submit/route";
import { ASSESSMENT_VERSION, questions, questionsForStage, scoredQuestions } from "@/lib/questions";
import { computeScores, determineArchetype } from "@/lib/scoring";
import { fatherhoodStages, gaps } from "@/lib/types";
import type { SubmitPayload } from "@/lib/types";
import { validateSubmitPayload } from "@/lib/validation";

const reflection = "Being present, making my own choices, and growing with my child.\nA life we build together.";

function payload(value = 2): SubmitPayload {
  return {
    name: "Assessment Test",
    email: "assessment@example.test",
    phone: "+910000000000",
    city: "Test City",
    fatherhoodStage: "baby_toddler",
    answers: questions.map((question) => ({
      questionId: question.id,
      value: question.kind === "mcq" ? value : question.id === "q24" ? reflection : "A written reflection."
    }))
  };
}

async function main() {
  assert.equal(scoredQuestions.length, 21);
  assert.equal(questions.length, 24);
  assert.equal(questions.at(-1)?.id, "q24");
  assert.equal(questions.at(-1)?.prompt, "What does redefining fatherhood mean to you?");

  for (const stage of fatherhoodStages) {
    const displayed = questionsForStage(stage);
    for (const question of displayed) {
      if (question.kind !== "mcq") continue;
      assert.deepEqual(question.options.map((option) => option.value), [0, 1, 2, 3, 4]);
      assert.equal(new Set(question.options.map((option) => option.label)).size, 5);
      assert.ok(question.options.every((option) => !/^(strongly agree|agree|strongly disagree|disagree|it depends|almost always|often|sometimes|rarely|almost never|very easy|usually easy|difficult|very difficult)$/i.test(option.label)));
    }
    const legacy = questionsForStage(stage, "intentional-father-v2");
    assert.equal(legacy.length, 23);
    assert.equal(legacy.find((q) => q.id === "q24"), undefined);
    const legacyIdentity = legacy.find((q) => q.id === "q1");
    assert.equal(legacyIdentity?.kind === "mcq" && legacyIdentity.options[0].label, "Strongly agree");
    const legacyReverse = legacy.find((q) => q.id === "q14");
    assert.equal(legacyReverse?.kind === "mcq" && legacyReverse.options[0].label, "Strongly disagree");
  }

  // Exercise every existing numeric value and verify that the new text cannot
  // alter gap weights, overall scores, or archetype selection.
  for (const value of [0, 1, 2, 3, 4]) {
    const current = payload(value);
    const previous = current.answers.filter((answer) => answer.questionId !== "q24");
    const scores = computeScores(current.answers);
    assert.deepEqual(scores, computeScores(previous));
    for (const gap of gaps) assert.equal(scores[gap], value * 25);
    assert.equal(scores.overall, value * 25);
    assert.equal(determineArchetype(scores).key, determineArchetype(computeScores(previous)).key);
  }

  const valid = payload();
  assert.equal(validateSubmitPayload(valid).answers.find((a) => a.questionId === "q24")?.value, reflection);
  for (const value of ["0", "1", "4", "My own definition.\nMy own words."]) {
    const body = payload();
    body.answers.find((a) => a.questionId === "q24")!.value = value;
    assert.equal(validateSubmitPayload(body).answers.find((a) => a.questionId === "q24")?.value, value);
  }
  const missing = payload();
  missing.answers = missing.answers.filter((answer) => answer.questionId !== "q24");
  assert.throws(() => validateSubmitPayload(missing), /all written reflection/);
  const blank = payload();
  blank.answers.find((a) => a.questionId === "q24")!.value = "   ";
  assert.throws(() => validateSubmitPayload(blank), /all written reflection/);
  const blankChoice = payload();
  blankChoice.answers.find((a) => a.questionId === "q1")!.value = "";
  assert.throws(() => validateSubmitPayload(blankChoice), /multiple-choice/);
  const numericChoice = payload();
  numericChoice.answers.find((a) => a.questionId === "q1")!.value = "3";
  assert.equal(validateSubmitPayload(numericChoice).answers.find((a) => a.questionId === "q1")?.value, 3);

  // Run the real submit handler through validation, scoring, report fallback,
  // and persistence. Only the external database transport is replaced.
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
  };
  let stored: Record<string, unknown> | undefined;
  try {
    process.env.SUPABASE_URL = "https://assessment-test.invalid";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.ANTHROPIC_API_KEY = "";
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://assessment-test.invalid/rest/v1/Submission");
      assert.equal(init?.method, "POST");
      stored = JSON.parse(String(init?.body));
      return Response.json([{ ...stored, createdAt: new Date().toISOString() }]);
    };
    const response = await POST(new NextRequest("http://localhost/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valid)
    }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.saved, true);
    assert.ok(result.id);
    assert.equal(stored?.assessmentVersion, ASSESSMENT_VERSION);
    assert.deepEqual(stored?.answers, valid.answers);
    assert.equal(stored?.email, valid.email);
    assert.equal(stored?.scoreOverall, 50);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  console.log("Assessment tests passed: contextual choices, unchanged scoring, validation, and saved lead response.");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
