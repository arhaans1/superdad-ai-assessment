import { archetypes } from "@/lib/archetypes";
import { scoredQuestions } from "@/lib/questions";
import type { Archetype, AssessmentAnswer, Dimension, Scores } from "@/lib/types";

const dimensions: Dimension[] = [
  "consistency",
  "ownership",
  "relationships",
  "initiative",
  "work"
];

export function computeScores(answers: AssessmentAnswer[]): Scores {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const raw: Record<Dimension, number> = {
    consistency: 0,
    ownership: 0,
    relationships: 0,
    initiative: 0,
    work: 0
  };

  for (const question of scoredQuestions) {
    const value = answerMap.get(question.id);
    if (typeof value !== "number" || value < 0 || value > 4) {
      throw new Error(`Missing or invalid answer for ${question.id}`);
    }
    raw[question.dimension] += value;
  }

  const normalised = Object.fromEntries(
    dimensions.map((dimension) => [dimension, Math.round((raw[dimension] / 12) * 100)])
  ) as Record<Dimension, number>;

  const homeOverall = Math.round(
    (normalised.consistency +
      normalised.ownership +
      normalised.relationships +
      normalised.initiative) /
      4
  );

  const overall = Math.round(
    (normalised.consistency +
      normalised.ownership +
      normalised.relationships +
      normalised.initiative +
      normalised.work) /
      5
  );

  return {
    ...normalised,
    overall,
    homeOverall,
    workHomeGap: normalised.work - homeOverall
  };
}

export function determineArchetype(scores: Scores): Archetype {
  const C = scores.consistency;
  const O = scores.ownership;
  const R = scores.relationships;
  const I = scores.initiative;
  const homeOverall = scores.homeOverall;

  if (homeOverall >= 78 && Math.min(C, O, R, I) >= 65) {
    return archetypes.present;
  }

  if (I >= 55 && homeOverall >= 45 && homeOverall <= 77 && O >= 50) {
    return archetypes.awakening;
  }

  if (O >= 55 && R <= 45) {
    return archetypes.provider;
  }

  if (C <= 40 && R >= 45) {
    return archetypes.weekend;
  }

  if (I <= 40 && O <= 50 && R <= 50) {
    return archetypes.firefighter;
  }

  return archetypes.ghost;
}

export function lowestDimension(scores: Scores): Dimension {
  return dimensions.reduce((lowest, dimension) =>
    scores[dimension] < scores[lowest] ? dimension : lowest
  );
}

export function strongestDimension(scores: Scores): Dimension {
  return dimensions.reduce((highest, dimension) =>
    scores[dimension] > scores[highest] ? dimension : highest
  );
}
