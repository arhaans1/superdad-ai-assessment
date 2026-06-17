export type Dimension =
  | "consistency"
  | "ownership"
  | "relationships"
  | "initiative"
  | "work";

export type AnswerValue = string | number;

export type AssessmentAnswer = {
  questionId: string;
  value: AnswerValue;
};

export type Scores = {
  consistency: number;
  ownership: number;
  relationships: number;
  initiative: number;
  work: number;
  overall: number;
  homeOverall: number;
  workHomeGap: number;
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

export type SubmitPayload = {
  name: string;
  email: string;
  phone: string;
  city: string;
  answers: AssessmentAnswer[];
};
