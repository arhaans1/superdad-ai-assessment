import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ScoreBars } from "@/components/ScoreBars";
import { ScoreRadar } from "@/components/ScoreRadar";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AssessmentAnswer, Scores } from "@/lib/types";

const answerLabels: Record<string, string> = {
  q1: "Fully-present weekday time",
  q2: "Predictability at home",
  q3: "Home time when work intensifies",
  q4: "Responsibility for emotional connection",
  q5: "Instinct when something feels off",
  q6: "Belief in control to change family life",
  q7: "Child's inner world",
  q8: "Child comes first with important things",
  q9: "Emotional climate with partner",
  q10: "Investment in learning fatherhood",
  q11: "Intentional family ritual",
  q12: "Working on self",
  q13: "Work initiative",
  q14: "Work team play",
  q15: "Best energy at work vs family",
  q16: "Recent moment that stayed",
  q17: "90-day change"
};

export default async function SubmissionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
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
            <p>
              <strong>Model:</strong> {submission.aiModel || "Unknown"}
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
                    <span>{answerLabels[answer.questionId] || answer.questionId}</span>
                  </div>
                  <div>{String(answer.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
