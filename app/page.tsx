"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { ResultsView, type ResultData } from "@/components/ResultsView";
import { questions } from "@/lib/questions";
import type { AnswerValue, AssessmentAnswer, SubmitPayload } from "@/lib/types";

type Step = "intro" | "lead" | "questions" | "analysing" | "results";

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  city: ""
};

export default function Home() {
  const [step, setStep] = useState<Step>("intro");
  const [lead, setLead] = useState(emptyLead);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);

  const question = questions[questionIndex];
  const progress = useMemo(
    () => Math.round(((questionIndex + 1) / questions.length) * 100),
    [questionIndex]
  );

  if (step === "results" && result) {
    return (
      <ResultsView
        result={result}
        onRestart={() => {
          setStep("intro");
          setLead(emptyLead);
          setQuestionIndex(0);
          setAnswers({});
          setResult(null);
          setError("");
        }}
      />
    );
  }

  async function submitAssessment() {
    setError("");
    setStep("analysing");

    const payload: SubmitPayload = {
      ...lead,
      answers: questions.map((item) => ({
        questionId: item.id,
        value: answers[item.id] ?? ""
      })) as AssessmentAnswer[]
    };

    const minimumWait = new Promise((resolve) => setTimeout(resolve, 4200));

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
      setStep("questions");
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

    if (questionIndex === questions.length - 1) {
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
              <h1 className="intro-title">Confident Father AI Assessment</h1>
              <p className="intro-copy">
                In 3 minutes, see exactly where you stand as a father today - at home,
                at work, and in the gap between the two.
              </p>
              <div className="button-row">
                <button className="primary-button" onClick={() => setStep("questions")}>
                  Start My Assessment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </section>
          <section className="content-section">
            <div className="content-inner diagnosis">
              Answer honestly - there are no right answers. This is just for you. In 3
              minutes, you&apos;ll see exactly where you stand as a father today.
            </div>
          </section>
        </>
      ) : null}

      {step === "lead" ? (
        <main className="content-section">
          <div className="assessment-panel">
            <h1 className="question-title">Your report is ready</h1>
            <p className="intro-copy" style={{ color: "#505050", marginTop: 0 }}>
              Enter your details to reveal your personalised Confident Father report.
            </p>
            <div className="form-grid">
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City"]
              ].map(([key, label]) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    type={key === "email" ? "email" : "text"}
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
              By continuing, you agree to receive follow-up from Platform of Papas.
            </p>
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => {
                  setError("");
                  setStep("questions");
                }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                className="primary-button"
                disabled={!leadReady()}
                onClick={() => void submitAssessment()}
              >
                Reveal My Report <ArrowRight size={18} />
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
              Question {questionIndex + 1} of {questions.length}
            </div>
            <h1 className="question-title">{question.prompt}</h1>
            {question.kind === "mcq" ? (
              <div className="option-list">
                {question.options.map((option) => (
                  <button
                    className={`option-button ${
                      answers[question.id] === option.value ? "is-selected" : ""
                    }`}
                    key={option.value}
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
                  value={(answers[question.id] as string) || ""}
                  placeholder={question.placeholder}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
                  }
                />
              </div>
            )}
            {error ? <p className="error-text">{error}</p> : null}
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => {
                  setError("");
                  if (questionIndex === 0) {
                    setStep("intro");
                  } else {
                    setQuestionIndex((current) => current - 1);
                  }
                }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button className="primary-button" onClick={goNext}>
                {questionIndex === questions.length - 1 ? (
                  <>
                    See My Results <CheckCircle2 size={18} />
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

      {step === "analysing" ? (
        <main className="content-section">
          <div className="analysis-box">
            <div className="analysis-mark" />
            <h1 className="question-title">AI is analysing your answers...</h1>
            <p className="helper-text">
              Your report is being shaped around your scores and written reflections.
            </p>
          </div>
        </main>
      ) : null}
    </div>
  );
}
