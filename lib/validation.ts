import { scoredQuestions, textQuestions } from "@/lib/questions";
import { fatherhoodStages } from "@/lib/types";
import type { AssessmentAnswer, FatherhoodStage, SubmitPayload } from "@/lib/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubmitPayload(body: unknown): SubmitPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid submission.");
  }

  const payload = body as Partial<SubmitPayload>;
  const name = clean(payload.name);
  const email = clean(payload.email).toLowerCase();
  const phone = clean(payload.phone);
  const city = clean(payload.city);
  const fatherhoodStage = clean(payload.fatherhoodStage);

  if (!name || !email || !phone || !city) {
    throw new Error("Name, email, phone, and city are required.");
  }

  if (!emailPattern.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!fatherhoodStages.includes(fatherhoodStage as FatherhoodStage)) {
    throw new Error("Please choose where you are in your fatherhood journey.");
  }

  if (!Array.isArray(payload.answers)) {
    throw new Error("Answers are required.");
  }

  const answers = payload.answers.map(normaliseAnswer);
  const map = new Map(answers.map((answer) => [answer.questionId, answer.value]));

  for (const question of scoredQuestions) {
    const value = map.get(question.id);
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 4) {
      throw new Error("Please answer all multiple-choice questions.");
    }
  }

  for (const question of textQuestions) {
    const value = map.get(question.id);
    if (typeof value !== "string" || value.trim().length < 3) {
      throw new Error("Please complete both written reflection questions.");
    }
  }

  return {
    name,
    email,
    phone,
    city,
    fatherhoodStage: fatherhoodStage as FatherhoodStage,
    answers
  };
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

function normaliseAnswer(answer: unknown): AssessmentAnswer {
  if (!answer || typeof answer !== "object") {
    return { questionId: "", value: "" };
  }

  const raw = answer as Partial<AssessmentAnswer>;
  const questionId = clean(raw.questionId);
  const value = raw.value;

  if (typeof value === "number") {
    return { questionId, value };
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 4) {
      return { questionId, value: numeric };
    }
    return { questionId, value: value.trim().slice(0, 2000) };
  }

  return { questionId, value: "" };
}
