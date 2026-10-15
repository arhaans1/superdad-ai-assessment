import { archetypes } from "@/lib/archetypes";
import { ASSESSMENT_VERSION, questions } from "@/lib/questions";
import { fatherhoodStages, gaps } from "@/lib/types";
import type { AnswerValue, AssessmentResult, FatherhoodStage, InsightReport } from "@/lib/types";

export const ASSESSMENT_STORAGE_KEY = "pops:assessment-session:v1";
export type AssessmentStep = "intro" | "stage" | "questions" | "lead" | "analysing" | "results";
export type AssessmentLead = { name: string; email: string; phone: string; city: string };

export type AssessmentSession = {
  step: AssessmentStep;
  stage: FatherhoodStage | null;
  lead: AssessmentLead;
  questionIndex: number;
  answers: Record<string, AnswerValue>;
  result: AssessmentResult | null;
};

export function emptyAssessmentSession(): AssessmentSession {
  return {
    step: "intro",
    stage: null,
    lead: { name: "", email: "", phone: "", city: "" },
    questionIndex: 0,
    answers: {},
    result: null
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function textArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Check browser storage and server responses before rendering the report. */
export function assessmentResult(value: unknown): AssessmentResult | null {
  if (!record(value) || !record(value.archetype) || !record(value.report)) return null;
  const { archetype, report } = value;
  if (
    typeof archetype.key !== "string" || !Object.hasOwn(archetypes, archetype.key) ||
    typeof archetype.name !== "string" || typeof archetype.description !== "string" ||
    typeof report.currentPattern !== "string" || typeof report.beneathSurface !== "string" ||
    !textArray(report.whatIsWorking) || !textArray(report.nextReflections) ||
    !Array.isArray(report.attentionAreas) ||
    !report.attentionAreas.every((area) => record(area) &&
      typeof area.gap === "string" && gaps.includes(area.gap as typeof gaps[number]) &&
      typeof area.title === "string" && typeof area.insight === "string")
  ) return null;

  return {
    ...(typeof value.id === "string" ? { id: value.id } : {}),
    archetype: {
      key: archetype.key as AssessmentResult["archetype"]["key"],
      name: archetype.name,
      description: archetype.description
    },
    report: {
      currentPattern: report.currentPattern,
      beneathSurface: report.beneathSurface,
      whatIsWorking: report.whatIsWorking,
      nextReflections: report.nextReflections,
      attentionAreas: report.attentionAreas as InsightReport["attentionAreas"]
    }
  };
}

export function firstUnansweredQuestion(answers: AssessmentSession["answers"]): number {
  return questions.findIndex((question) => {
    const value = answers[question.id];
    return question.kind === "mcq"
      ? typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 4
      : typeof value !== "string" || value.trim().length < (question.minLength ?? 3);
  });
}

/** Recover safely if a URL or an older draft points beyond completed answers. */
export function reachableSession(session: AssessmentSession): AssessmentSession {
  if (session.result) return { ...session, step: "results" };
  if (session.step === "intro" || session.step === "stage") return session;
  if (!session.stage) return { ...session, step: "stage", questionIndex: 0 };

  const firstMissing = firstUnansweredQuestion(session.answers);
  const lastReachable = firstMissing === -1 ? questions.length - 1 : firstMissing;
  const questionIndex = Math.max(0, Math.min(session.questionIndex, lastReachable));
  if (["lead", "analysing", "results"].includes(session.step)) {
    // Never automatically repeat a POST after an interrupted request.
    return firstMissing === -1
      ? { ...session, step: "lead", questionIndex: questions.length - 1 }
      : { ...session, step: "questions", questionIndex: firstMissing };
  }
  return { ...session, questionIndex };
}

export function serialiseAssessmentSession(session: AssessmentSession): string {
  return JSON.stringify({
    schemaVersion: 1,
    assessmentVersion: ASSESSMENT_VERSION,
    step: session.step,
    stage: session.stage,
    lead: session.lead,
    // IDs keep a saved location stable if the display order changes later.
    questionId: questions[session.questionIndex]?.id,
    answers: session.answers,
    result: session.result
  });
}

export function restoreAssessmentSession(raw: string | null): AssessmentSession | null {
  if (!raw) return null;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || saved.schemaVersion !== 1) return null;
    const session = emptyAssessmentSession();
    session.result = assessmentResult(saved.result);
    // Completed reports survive future questionnaire revisions.
    if (!session.result && saved.assessmentVersion !== ASSESSMENT_VERSION) return null;

    const steps: AssessmentStep[] = ["intro", "stage", "questions", "lead", "analysing", "results"];
    if (steps.includes(saved.step as AssessmentStep)) session.step = saved.step as AssessmentStep;
    if (fatherhoodStages.includes(saved.stage as FatherhoodStage)) session.stage = saved.stage as FatherhoodStage;
    session.questionIndex = Math.max(0, questions.findIndex((question) => question.id === saved.questionId));

    if (record(saved.lead)) {
      for (const field of ["name", "email", "phone", "city"] as const) {
        const value = saved.lead[field];
        if (typeof value === "string") session.lead[field] = value.slice(0, 500);
      }
    }
    if (record(saved.answers)) {
      for (const question of questions) {
        const value = saved.answers[question.id];
        if (question.kind === "text" && typeof value === "string") {
          session.answers[question.id] = value.slice(0, 2000);
        } else if (question.kind === "mcq" && typeof value === "number" &&
          Number.isInteger(value) && value >= 0 && value <= 4) {
          session.answers[question.id] = value;
        }
      }
    }
    return reachableSession(session);
  } catch {
    return null;
  }
}

export function assessmentHash(session: AssessmentSession): string {
  if (session.step === "intro") return "";
  if (session.step === "stage") return "#fatherhood";
  if (session.step === "questions") return `#question-${session.questionIndex + 1}`;
  if (session.step === "lead") return "#details";
  return `#${session.step}`;
}

export function sessionAtHash(session: AssessmentSession, hash: string): AssessmentSession {
  if (session.result) return { ...session, step: "results" };
  const match = /^#question-(\d+)$/.exec(hash);
  if (match) {
    return reachableSession({ ...session, step: "questions", questionIndex: Number(match[1]) - 1 });
  }
  const step = hash === "#fatherhood" ? "stage" : hash === "#details" ? "lead" : null;
  return step ? reachableSession({ ...session, step }) : reachableSession(session);
}
