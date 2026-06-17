import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { determineArchetype, computeScores } from "@/lib/scoring";
import { generateReport } from "@/lib/report";
import { prisma } from "@/lib/prisma";
import { validateSubmitPayload } from "@/lib/validation";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

function clientKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimit.get(key);
  if (!current || current.resetAt < now) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  try {
    const key = clientKey(request);
    if (isLimited(key)) {
      return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
    }

    const payload = validateSubmitPayload(await request.json());
    const scores = computeScores(payload.answers);
    const archetype = determineArchetype(scores);
    const report = await generateReport({ archetype, scores, answers: payload.answers });

    const submission = await prisma.submission.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        answers: payload.answers as Prisma.InputJsonValue,
        scoreConsistency: scores.consistency,
        scoreOwnership: scores.ownership,
        scoreRelationships: scores.relationships,
        scoreInitiative: scores.initiative,
        scoreWork: scores.work,
        scoreOverall: scores.overall,
        archetypeKey: archetype.key,
        archetypeName: archetype.name,
        diagnosis: report.diagnosis,
        focusShift: report.focusShift,
        aiModel: report.aiModel,
        userAgent: request.headers.get("user-agent")
      }
    });

    return NextResponse.json({
      id: submission.id,
      archetype,
      scores,
      diagnosis: report.diagnosis,
      focusShift: report.focusShift
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isValidationError =
      message.startsWith("Invalid") ||
      message.startsWith("Name, email") ||
      message.startsWith("Please") ||
      message.startsWith("Missing or invalid");

    if (!isValidationError) {
      console.error("Submission failed", error);
    }

    return NextResponse.json(
      {
        error: isValidationError
          ? message
          : "We could not create your report right now. Please try again in a moment."
      },
      { status: 400 }
    );
  }
}
