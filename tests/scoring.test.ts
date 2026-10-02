import { strict as assert } from "assert";
import { questionsForStage, scoredQuestions } from "@/lib/questions";
import { fallbackReport } from "@/lib/report";
import { computeScores, determineArchetype } from "@/lib/scoring";
import type { AssessmentAnswer, Gap } from "@/lib/types";

function answers(defaultValue: number, gapValues: Partial<Record<Gap, number>> = {}) {
  return [
    ...scoredQuestions.map((question) => ({
      questionId: question.id,
      value: gapValues[question.gap] ?? defaultValue
    })),
    { questionId: "q22", value: "A recent family moment stayed with me." },
    { questionId: "q23", value: "I want to build a more intentional weekly rhythm." }
  ] satisfies AssessmentAnswer[];
}

const strong = computeScores(answers(0));
assert.equal(strong.identity, 0);
assert.equal(strong.alignment, 0);
assert.equal(strong.overall, 0);
assert.equal(determineArchetype(strong).key, "present");
const strongReport = fallbackReport({
  archetype: determineArchetype(strong),
  scores: strong,
  answers: answers(0),
  fatherhoodStage: "soon_to_be"
});
assert.match(strongReport.attentionAreas[0].insight, /clear|protect|strengthen/i);

const provider = computeScores(
  answers(1, { responsibility: 3, conditioning: 2, alignment: 2 })
);
assert.equal(provider.responsibility, 75);
assert.equal(determineArchetype(provider).key, "provider");

const firefighter = computeScores(
  answers(1, { emotional: 3, decision_making: 2 })
);
assert.equal(determineArchetype(firefighter).key, "firefighter");

const weekend = computeScores(answers(1, { alignment: 3 }));
assert.equal(determineArchetype(weekend).key, "weekend");

const awakening = computeScores(answers(2));
assert.equal(determineArchetype(awakening).key, "awakening");

const soonToBe = questionsForStage("soon_to_be").find((question) => question.id === "q11");
const olderChild = questionsForStage("young_preteen").find((question) => question.id === "q11");
assert.match(soonToBe?.prompt || "", /baby, finances or the future/i);
assert.match(olderChild?.prompt || "", /child disagrees or pushes a boundary/i);
assert.equal(scoredQuestions.length, 21);

console.log("Scoring tests passed.");
