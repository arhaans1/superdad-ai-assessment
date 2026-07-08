import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ScoreBars } from "@/components/ScoreBars";
import { ScoreRadar } from "@/components/ScoreRadar";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { questions } from "@/lib/questions";
import type { AssessmentAnswer, Scores } from "@/lib/types";

function displayAnswer(answer: AssessmentAnswer): string {
  const question = questions.find((item) => item.id === answer.questionId);

  if (question?.kind === "mcq" && typeof answer.value === "number") {
    return (
      question.options.find((option) => option.value === answer.value)?.label ||
      String(answer.value)
    );
  }

  return String(answer.value);
}

function displayQuestion(answer: AssessmentAnswer): string {
  return questions.find((item) => item.id === answer.questionId)?.prompt || answer.questionId;
}

export default async function SubmissionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  let submission;
  try {
    submission = await prisma.submission.findUnique({ where: { id } });
  } catch (error) {
    console.error("Admin detail failed to load submission", error);
    return (
      <div className="admin-shell">
        <div className="admin-top">
          <div className="content-inner">
            <Link href="/admin" style={{ color: "#FFFFFF" }}>
              Back to dashboard
            </Link>
            <h1 className="section-heading" style={{ color: "#FFFFFF", marginTop: "1rem" }}>
              Submission unavailable
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>
              Could not load this submission right now. Please refresh in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    notFound();
  }

  const scores: Scores = {
    consistency: submission.scoreConsistency,
    ownership: submission.scoreOwnership,
    relationships: submission.scoreRelationships,
    initiative: submission.scoreInitiative,
    work: submission.scoreWork,
    overall: submission.scoreOverall,
    homeOverall: Math.round(
      (submission.scoreConsistency +
        submission.scoreOwnership +
        submission.scoreRelationships +
        submission.scoreInitiative) /
        4
    ),
    workHomeGap:
      submission.scoreWork -
      Math.round(
        (submission.scoreConsistency +
          submission.scoreOwnership +
          submission.scoreRelationships +
          submission.scoreInitiative) /
          4
      )
  };
  const answers = submission.answers as unknown as AssessmentAnswer[];

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div className="content-inner">
          <Link href="/admin" style={{ color: "#FFFFFF" }}>
            Back to dashboard
          </Link>
          <h1 className="section-heading" style={{ color: "#FFFFFF", marginTop: "1rem" }}>
            {submission.name}
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>
            {submission.archetypeName} - {submission.createdAt.toLocaleString()}
          </p>
        </div>
      </div>

      <main className="admin-content">
        <section className="detail-grid">
          <div className="data-card">
            <h2 className="section-heading">Lead info</h2>
            <p>
              <strong>Email:</strong> {submission.email}
            </p>
            <p>
              <strong>Phone:</strong> {submission.phone}
            </p>
            <p>
              <strong>City:</strong> {submission.city}
            </p>
          </div>
          <div className="data-card">
            <h2 className="section-heading">Scores</h2>
            <ScoreBars scores={scores} />
          </div>
        </section>

        <section className="content-section" style={{ paddingInline: 0 }}>
          <div className="data-card chart-panel">
            <ScoreRadar scores={scores} />
          </div>
        </section>

        <section className="detail-grid">
          <div className="data-card">
            <h2 className="section-heading">Diagnosis</h2>
            <div className="diagnosis">{submission.diagnosis}</div>
          </div>
          <div className="data-card">
            <h2 className="section-heading">Focus shift</h2>
            <div className="diagnosis">{submission.focusShift}</div>
          </div>
        </section>

        <section className="content-section" style={{ paddingInline: 0 }}>
          <div className="data-card">
            <h2 className="section-heading">Raw answers</h2>
            <div className="score-bars">
              {answers.map((answer) => (
                <div className="score-row" key={answer.questionId}>
                  <div className="score-row-top">
                    <span>{displayQuestion(answer)}</span>
                  </div>
                  <div>{displayAnswer(answer)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
