import { NextRequest, NextResponse } from "next/server";
import { determineArchetype, computeScores } from "@/lib/scoring";
import { generateReport } from "@/lib/report";
import { createSubmission } from "@/lib/submissions";
import { validateSubmitPayload } from "@/lib/validation";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const SAVE_RETRY_DELAYS_MS = [250, 750];

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveSubmissionWithRetry({
  payload,
  scores,
  archetype,
  report,
  userAgent
}: {
  payload: ReturnType<typeof validateSubmitPayload>;
  scores: ReturnType<typeof computeScores>;
  archetype: ReturnType<typeof determineArchetype>;
  report: Awaited<ReturnType<typeof generateReport>>;
  userAgent: string | null;
}) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= SAVE_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await createSubmission({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        fatherhoodStage: payload.fatherhoodStage,
        answers: payload.answers,
        scoreIdentity: scores.identity,
        scoreConditioning: scores.conditioning,
        scoreResponsibility: scores.responsibility,
        scoreEmotional: scores.emotional,
        scoreDecisionMaking: scores.decision_making,
        scoreFear: scores.fear,
        scoreAlignment: scores.alignment,
        scoreOverall: scores.overall,
        archetypeKey: archetype.key,
        archetypeName: archetype.name,
        diagnosis: [
          report.currentPattern,
          report.beneathSurface,
          ...report.attentionAreas.map((area) => `${area.title}: ${area.insight}`)
        ].join("\n\n"),
        focusShift: report.nextReflections.join("\n"),
        reportJson: report,
        assessmentVersion: "intentional-father-v2",
        aiModel: report.aiModel,
        userAgent
      });
    } catch (error) {
      lastError = error;
      const retryDelay = SAVE_RETRY_DELAYS_MS[attempt];
      if (retryDelay === undefined) break;
      await wait(retryDelay);
    }
  }

  throw lastError;
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
    const report = await generateReport({
      archetype,
      scores,
      answers: payload.answers,
      fatherhoodStage: payload.fatherhoodStage
    });
    let submissionId: string | undefined;

    try {
      const submission = await saveSubmissionWithRetry({
        payload,
        scores,
        archetype,
        report,
        userAgent: request.headers.get("user-agent")
      });
      submissionId = submission.id;
    } catch (error) {
      console.error("Submission save failed after retries", error);
    }

    return NextResponse.json({
      id: submissionId,
      saved: Boolean(submissionId),
      archetype,
      report
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
