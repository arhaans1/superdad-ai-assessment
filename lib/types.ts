export const fatherhoodStages = [
  "soon_to_be",
  "baby_toddler",
  "young_preteen"
] as const;

export type FatherhoodStage = (typeof fatherhoodStages)[number];

export const fatherhoodStageLabels: Record<FatherhoodStage, string> = {
  soon_to_be: "Soon-to-be father",
  baby_toddler: "Father of a baby / toddler",
  young_preteen: "Father of a young / pre-teen child"
};

export const gaps = [
  "identity",
  "conditioning",
  "responsibility",
  "emotional",
  "decision_making",
  "fear",
  "alignment"
] as const;

export type Gap = (typeof gaps)[number];

export const gapLabels: Record<Gap, string> = {
  identity: "Identity",
  conditioning: "Inherited expectations",
  responsibility: "Whole-life responsibility",
  emotional: "Emotional patterns",
  decision_making: "Decision-making",
  fear: "Fear and uncertainty",
  alignment: "Life alignment"
};

export type AnswerValue = string | number;

export type AssessmentAnswer = {
  questionId: string;
  value: AnswerValue;
};

/** Higher gap scores indicate an area that may deserve more attention. */
export type Scores = Record<Gap, number> & {
  overall: number;
};

export type ArchetypeKey =
  | "provider"
  | "ghost"
  | "firefighter"
  | "weekend"
  | "awakening"
  | "present";

export type Archetype = {
  key: ArchetypeKey;
  name: string;
  description: string;
};

export type AttentionArea = {
  gap: Gap;
  title: string;
  insight: string;
};

export type InsightReport = {
  currentPattern: string;
  whatIsWorking: string[];
  beneathSurface: string;
  attentionAreas: AttentionArea[];
  nextReflections: string[];
};

export type AssessmentSettings = {
  videoUrl: string;
  bookingUrl: string;
  videoEnabled: boolean;
  bookingEnabled: boolean;
};

export type SubmitPayload = {
  name: string;
  email: string;
  phone: string;
  city: string;
  fatherhoodStage: FatherhoodStage;
  answers: AssessmentAnswer[];
};
