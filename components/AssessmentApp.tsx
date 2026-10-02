"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { ResultsView, type ResultData } from "@/components/ResultsView";
import { questionsForStage } from "@/lib/questions";
import { fatherhoodStageLabels, fatherhoodStages } from "@/lib/types";
import type {
  AnswerValue,
  AssessmentAnswer,
  AssessmentSettings,
  FatherhoodStage,
  SubmitPayload
} from "@/lib/types";

type Step = "intro" | "stage" | "questions" | "lead" | "analysing" | "results";

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  city: ""
};

export function AssessmentApp({ settings }: { settings: AssessmentSettings }) {
  const [step, setStep] = useState<Step>("intro");
  const [stage, setStage] = useState<FatherhoodStage | null>(null);
  const [lead, setLead] = useState(emptyLead);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);

  const displayQuestions = useMemo(() => (stage ? questionsForStage(stage) : []), [stage]);
  const question = displayQuestions[questionIndex];
  const totalSteps = displayQuestions.length + 1;
  const progress = Math.round(((questionIndex + 2) / totalSteps) * 100);

  function restart() {
    setStep("intro");
    setStage(null);
    setLead(emptyLead);
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setError("");
  }

  if (step === "results" && result) {
    return <ResultsView result={result} settings={settings} onRestart={restart} />;
  }

  async function submitAssessment() {
    if (!stage) return;
    setError("");
    setStep("analysing");

    const payload: SubmitPayload = {
      ...lead,
      fatherhoodStage: stage,
      answers: displayQuestions.map((item) => ({
        questionId: item.id,
        value: answers[item.id] ?? ""
      })) as AssessmentAnswer[]
    };

    const minimumWait = new Promise((resolve) => setTimeout(resolve, 2600));

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      await minimumWait;

      if (!response.ok) {
        throw new Error(data.error || "Please check your answers and try again.");
      }

      setResult(data);
      setStep("results");
    } catch (err) {
      await minimumWait;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("lead");
    }
  }

  function leadReady() {
    return (
      lead.name.trim() &&
      lead.email.trim() &&
      lead.phone.trim() &&
      lead.city.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)
    );
  }

  function goNext() {
    setError("");
    if (!question) return;

    const value = answers[question.id];
    if (question.kind === "mcq" && typeof value !== "number") {
      setError("Please choose one answer.");
      return;
    }
    if (question.kind === "text" && (typeof value !== "string" || value.trim().length < 3)) {
      setError("Please write a short response.");
      return;
    }

    if (questionIndex === displayQuestions.length - 1) {
      setStep("lead");
      return;
    }

    setQuestionIndex((current) => current + 1);
  }

  return (
    <div className="page-shell">
      <BrandHeader />

      {step === "intro" ? (
        <>
          <section className="intro-band">
            <div className="intro-inner">
              <div className="eyebrow">Discover your father archetype</div>
              <h1 className="intro-title">The Intentional Father Assessment</h1>
              <p className="intro-copy">
                See the patterns shaping your family, relationships, work and sense of
                direction—then discover what may deserve your attention next.
              </p>
              <div className="button-row">
                <button className="primary-button" onClick={() => setStep("stage")}>
                  Start My Assessment <ArrowRight size={18} />
                </button>
              </div>
              <p className="intro-note">About 5 minutes · Private · No right or wrong answers</p>
            </div>
          </section>
          <section className="content-section">
            <div className="content-inner">
              <div className="promise-grid">
                <div className="promise-card">
                  <span>01</span>
                  <h2>Understand where you are</h2>
                  <p>Recognise the patterns influencing this season of fatherhood.</p>
                </div>
                <div className="promise-card">
                  <span>02</span>
                  <h2>See what connects</h2>
                  <p>Explore how family, purpose, ambition and inner pressure interact.</p>
                </div>
                <div className="promise-card">
                  <span>03</span>
                  <h2>Choose what comes next</h2>
                  <p>Leave with a clearer idea of what you may want to rebuild intentionally.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {step === "stage" ? (
        <main className="content-section">
          <div className="assessment-panel">
            <div className="progress-track" aria-label="Assessment progress">
              <div className="progress-fill" style={{ width: `${Math.round(100 / 24)}%` }} />
            </div>
            <div className="question-count">Step 1 of 24</div>
            <h1 className="question-title">Where are you currently in your fatherhood journey?</h1>
            <p className="question-context">
              Your answer adapts a few situations so the assessment reflects your life today.
            </p>
            <div className="option-list">
              {fatherhoodStages.map((item) => (
                <button
                  type="button"
                  className={`option-button ${stage === item ? "is-selected" : ""}`}
                  key={item}
                  aria-pressed={stage === item}
                  onClick={() => setStage(item)}
                >
                  <span className="option-dot" />
                  <span>{fatherhoodStageLabels[item]}</span>
                </button>
              ))}
            </div>
            {error ? <p className="error-text" role="alert">{error}</p> : null}
            <div className="button-row">
              <button className="secondary-button" onClick={() => setStep("intro")}>
                <ArrowLeft size={18} /> Back
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  if (!stage) {
                    setError("Please choose the stage that best reflects your life today.");
                    return;
                  }
                  setError("");
                  setStep("questions");
                }}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </main>
      ) : null}

      {step === "questions" && question ? (
        <main className="content-section">
          <div className="assessment-panel">
            <div className="progress-track" aria-label="Assessment progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="question-count">
              Step {questionIndex + 2} of {totalSteps} · {progress}% complete
            </div>
            <h1 className="question-title">{question.prompt}</h1>
            {question.context ? <p className="question-context">{question.context}</p> : null}
            {question.kind === "mcq" ? (
              <div className="option-list">
                {question.options.map((option) => (
                  <button
                    type="button"
                    className={`option-button ${
                      answers[question.id] === option.value ? "is-selected" : ""
                    }`}
                    key={option.label}
                    aria-pressed={answers[question.id] === option.value}
                    onClick={() =>
                      setAnswers((current) => ({ ...current, [question.id]: option.value }))
                    }
                  >
                    <span className="option-dot" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="field">
                <div className="helper-text">{question.helper}</div>
                <textarea
                  aria-label="Your written reflection"
                  value={(answers[question.id] as string) || ""}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
                  }
                />
              </div>
            )}
            {error ? <p className="error-text" role="alert">{error}</p> : null}
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => {
                  setError("");
                  if (questionIndex === 0) setStep("stage");
                  else setQuestionIndex((current) => current - 1);
                }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button className="primary-button" onClick={goNext}>
                {questionIndex === displayQuestions.length - 1 ? (
                  <>
                    Complete Assessment <CheckCircle2 size={18} />
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      ) : null}

      {step === "lead" ? (
        <main className="content-section">
          <div className="assessment-panel">
            <div className="eyebrow dark">Your insight report is ready</div>
            <h1 className="question-title">Where should we send your personalised result?</h1>
            <p className="question-context">
              Enter your details to reveal your Father Archetype and areas that may deserve
              attention next.
            </p>
            <div className="form-grid">
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City / location"]
              ].map(([key, label]) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                    value={lead[key as keyof typeof lead]}
                    onChange={(event) =>
                      setLead((current) => ({ ...current, [key]: event.target.value }))
                    }
                    required
                  />
                </div>
              ))}
            </div>
            <p className="consent-line">
              By continuing, you agree to receive relevant follow-up from Platform of Papas.
            </p>
            {error ? <p className="error-text" role="alert">{error}</p> : null}
            <div className="button-row">
              <button className="secondary-button" onClick={() => setStep("questions")}>
                <ArrowLeft size={18} /> Back
              </button>
              <button
                className="primary-button"
                disabled={!leadReady()}
                onClick={() => void submitAssessment()}
              >
                Reveal My Archetype <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </main>
      ) : null}

      {step === "analysing" ? (
        <main className="content-section">
          <div className="analysis-box" role="status" aria-live="polite">
            <div className="analysis-mark" />
            <div className="eyebrow dark">Connecting the patterns</div>
            <h1 className="question-title">Preparing your personal insight...</h1>
            <p className="helper-text">
              We’re looking across your current stage, priorities and reflections—not grading
              you as a father.
            </p>
          </div>
        </main>
      ) : null}
    </div>
  );
}
