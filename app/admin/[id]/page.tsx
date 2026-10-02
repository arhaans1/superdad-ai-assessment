import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ScoreBars } from "@/components/ScoreBars";
import { ScoreRadar } from "@/components/ScoreRadar";
import { isAdminAuthenticated } from "@/lib/auth";
import { questionsForStage } from "@/lib/questions";
import { getSubmission } from "@/lib/submissions";
import { fatherhoodStageLabels, fatherhoodStages } from "@/lib/types";
import type {
  AssessmentAnswer,
  FatherhoodStage,
  InsightReport,
  Scores
} from "@/lib/types";

function isStage(value: string | null): value is FatherhoodStage {
  return Boolean(value && fatherhoodStages.includes(value as FatherhoodStage));
}

function isInsightReport(value: unknown): value is InsightReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const report = value as Partial<InsightReport>;
  return (
    typeof report.currentPattern === "string" &&
    Array.isArray(report.whatIsWorking) &&
    typeof report.beneathSurface === "string" &&
    Array.isArray(report.attentionAreas) &&
    Array.isArray(report.nextReflections)
  );
}

function v2Scores(submission: Awaited<ReturnType<typeof getSubmission>>): Scores | null {
  if (
    !submission ||
    submission.scoreIdentity === null ||
    submission.scoreConditioning === null ||
    submission.scoreResponsibility === null ||
    submission.scoreEmotional === null ||
    submission.scoreDecisionMaking === null ||
    submission.scoreFear === null ||
    submission.scoreAlignment === null
  ) {
    return null;
  }

  return {
    identity: submission.scoreIdentity,
    conditioning: submission.scoreConditioning,
    responsibility: submission.scoreResponsibility,
    emotional: submission.scoreEmotional,
    decision_making: submission.scoreDecisionMaking,
    fear: submission.scoreFear,
    alignment: submission.scoreAlignment,
    overall: submission.scoreOverall || 0
  };
}

export default async function SubmissionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const { id } = await params;
  let submission;
  try {
    submission = await getSubmission(id);
  } catch (error) {
    console.error("Admin detail failed to load submission", error);
    return (
      <div className="admin-shell">
        <div className="admin-top">
          <div className="content-inner">
            <Link href="/admin" style={{ color: "#FFFFFF" }}>
              Back to dashboard
            </Link>
            <h1 className="section-heading admin-heading">Submission unavailable</h1>
            <p className="admin-subcopy">
              Could not load this submission right now. Please refresh in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) notFound();

  const scores = v2Scores(submission);
  const answers = submission.answers as unknown as AssessmentAnswer[];
  const stage = isStage(submission.fatherhoodStage) ? submission.fatherhoodStage : null;
  const displayQuestions = stage ? questionsForStage(stage) : [];
  const report = isInsightReport(submission.reportJson) ? submission.reportJson : null;

  function questionText(answer: AssessmentAnswer) {
    return (
      displayQuestions.find((question) => question.id === answer.questionId)?.prompt ||
      `Legacy assessment question ${answer.questionId}`
    );
  }

  function answerText(answer: AssessmentAnswer) {
    const question = displayQuestions.find((item) => item.id === answer.questionId);
    if (question?.kind === "mcq" && typeof answer.value === "number") {
      return question.options.find((option) => option.value === answer.value)?.label || String(answer.value);
    }
    return String(answer.value);
  }

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div className="content-inner">
          <Link href="/admin" style={{ color: "#FFFFFF" }}>
            Back to dashboard
          </Link>
          <h1 className="section-heading admin-heading">{submission.name}</h1>
          <p className="admin-subcopy">
            {submission.archetypeName} · {submission.createdAt.toLocaleString()}
          </p>
        </div>
      </div>

      <main className="admin-content">
        <section className="detail-grid">
          <div className="data-card">
            <h2 className="section-heading">Lead info</h2>
            <p><strong>Email:</strong> {submission.email}</p>
            <p><strong>Phone:</strong> {submission.phone}</p>
            <p><strong>City:</strong> {submission.city}</p>
            <p>
              <strong>Fatherhood stage:</strong>{" "}
              {stage ? fatherhoodStageLabels[stage] : "Legacy assessment"}
            </p>
          </div>
          <div className="data-card">
            <h2 className="section-heading">Internal gap signals</h2>
            {scores ? (
              <>
                <p className="helper-text">Higher values indicate more attention may be useful.</p>
                <ScoreBars scores={scores} />
              </>
            ) : (
              <p className="helper-text">This submission uses the original five-dimension model.</p>
            )}
          </div>
        </section>

        {scores ? (
          <section className="content-section admin-section-reset">
            <div className="data-card chart-panel">
              <ScoreRadar scores={scores} />
            </div>
          </section>
        ) : null}

        {report ? (
          <section className="content-section admin-section-reset">
            <div className="data-card report-stack">
              <div>
                <h2 className="section-heading">Current pattern</h2>
                <p className="diagnosis">{report.currentPattern}</p>
              </div>
              <div>
                <h2 className="section-heading">What is working</h2>
                <ul className="insight-list">
                  {report.whatIsWorking.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="section-heading">Beneath the surface</h2>
                <p className="diagnosis">{report.beneathSurface}</p>
              </div>
              <div>
                <h2 className="section-heading">Attention areas</h2>
                {report.attentionAreas.map((area) => (
                  <p key={area.gap}><strong>{area.title}:</strong> {area.insight}</p>
                ))}
              </div>
              <div>
                <h2 className="section-heading">Next reflections</h2>
                <ol className="reflection-list">
                  {report.nextReflections.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>
            </div>
          </section>
        ) : (
          <section className="detail-grid admin-section-reset">
            <div className="data-card">
              <h2 className="section-heading">Diagnosis</h2>
              <div className="diagnosis">{submission.diagnosis}</div>
            </div>
            <div className="data-card">
              <h2 className="section-heading">Focus shift</h2>
              <div className="diagnosis">{submission.focusShift}</div>
            </div>
          </section>
        )}

        <section className="content-section admin-section-reset">
          <div className="data-card">
            <h2 className="section-heading">Raw answers</h2>
            <div className="score-bars">
              {answers.map((answer) => (
                <div className="score-row" key={answer.questionId}>
                  <div className="score-row-top"><span>{questionText(answer)}</span></div>
                  <div>{answerText(answer)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
