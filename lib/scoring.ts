import { archetypes } from "@/lib/archetypes";
import { scoredQuestions } from "@/lib/questions";
import { gaps } from "@/lib/types";
import type { Archetype, AssessmentAnswer, Gap, Scores } from "@/lib/types";

export function computeScores(answers: AssessmentAnswer[]): Scores {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const raw = Object.fromEntries(gaps.map((gap) => [gap, 0])) as Record<Gap, number>;
  const counts = Object.fromEntries(gaps.map((gap) => [gap, 0])) as Record<Gap, number>;

  for (const question of scoredQuestions) {
    const value = answerMap.get(question.id);
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 4) {
      throw new Error(`Missing or invalid answer for ${question.id}`);
    }
    raw[question.gap] += value;
    counts[question.gap] += 1;
  }

  const normalised = Object.fromEntries(
    gaps.map((gap) => [gap, Math.round((raw[gap] / (counts[gap] * 4)) * 100)])
  ) as Record<Gap, number>;

  return {
    ...normalised,
    overall: Math.round(gaps.reduce((sum, gap) => sum + normalised[gap], 0) / gaps.length)
  };
}

export function determineArchetype(scores: Scores): Archetype {
  const highest = rankedGaps(scores)[0];
  const max = highest?.score ?? 0;

  if (scores.overall <= 25 && max <= 40) {
    return archetypes.present;
  }

  if (
    scores.responsibility >= 55 &&
    scores.conditioning >= 45 &&
    scores.alignment >= 45
  ) {
    return archetypes.provider;
  }

  if (scores.emotional >= 60 && scores.decision_making >= 50) {
    return archetypes.firefighter;
  }

  if (scores.alignment >= 60 && scores.emotional < 60) {
    return archetypes.weekend;
  }

  if (scores.overall <= 52 && scores.decision_making <= 55) {
    return archetypes.awakening;
  }

  return archetypes.ghost;
}

export function rankedGaps(scores: Scores): Array<{ gap: Gap; score: number }> {
  return gaps
    .map((gap) => ({ gap, score: scores[gap] }))
    .sort((left, right) => right.score - left.score);
}

export function strongestGap(scores: Scores): Gap {
  return gaps.reduce((strongest, gap) =>
    scores[gap] < scores[strongest] ? gap : strongest
  );
}
