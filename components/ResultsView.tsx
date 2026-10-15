"use client";

import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { assessmentVideo } from "@/lib/video";
import type { AssessmentResult, AssessmentSettings } from "@/lib/types";

export type ResultData = AssessmentResult;

export function ResultsView({
  result,
  settings,
  onRestart
}: {
  result: ResultData;
  settings: AssessmentSettings;
  onRestart?: () => void;
}) {
  const video = assessmentVideo(settings.videoUrl);
  const showVideo = settings.videoEnabled && Boolean(settings.videoUrl);
  const showBooking = settings.bookingEnabled && Boolean(settings.bookingUrl);

  return (
    <div className="page-shell">
      <BrandHeader />
      <section className="results-header">
        <div className="intro-inner">
          <div className="eyebrow">Your Father Archetype</div>
          <h1 className="results-title">{result.archetype.name}</h1>
          <p className="results-tagline">
            This reflects where you appear to be today—not who you are permanently.
          </p>
        </div>
      </section>

      <main>
        <section className="content-section">
          <div className="content-inner report-stack">
            <article className="insight-section opening-insight">
              <div className="section-kicker">Your current pattern</div>
              <p>{result.report.currentPattern}</p>
            </article>

            <article className="insight-section">
              <div className="section-kicker">What seems to be working</div>
              <ul className="insight-list strength-list">
                {result.report.whatIsWorking.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="insight-section beneath-card">
              <div className="section-kicker">What may be happening beneath the surface</div>
              <p>{result.report.beneathSurface}</p>
            </article>

            <article className="insight-section">
              <div className="section-kicker">Areas that may deserve attention</div>
              <div className="attention-grid">
                {result.report.attentionAreas.map((area, index) => (
                  <div className="attention-card" key={area.gap}>
                    <span>0{index + 1}</span>
                    <h2>{area.title}</h2>
                    <p>{area.insight}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="insight-section reflection-card">
              <div className="section-kicker">Your next reflection</div>
              <ol className="reflection-list">
                {result.report.nextReflections.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {showVideo || showBooking ? (
          <section className="content-section video-section">
            <div className="content-inner result-next-steps">
              {showVideo ? (
                <div className="video-layout">
                  <div className="video-heading">
                    <h2 className="section-heading">Understand why these patterns may be showing up.</h2>
                    <p>Watch this quick video.</p>
                  </div>
                  {video ? (
                    <div className="video-frame">
                      {video.kind === "embed" ? (
                        <iframe
                          src={video.src}
                          title="A message from Vishal about your assessment"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.src}
                          controls
                          playsInline
                          preload="metadata"
                          aria-label="A message from Vishal about your assessment"
                        />
                      )}
                    </div>
                  ) : (
                    <p role="status">The video is currently unavailable. Please try again later.</p>
                  )}
                </div>
              ) : null}

              {showBooking ? (
                <div className="booking-card">
                  <h2>Book a short conversation with our team.</h2>
                  <p>Book a one-to-one personalised assessment with our team.</p>
                  <a
                    className="primary-button light-button"
                    href={settings.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book a Call <ArrowRight size={18} />
                  </a>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="content-section result-actions">
          <div className="content-inner">
            <div className="button-row">
              <button className="primary-button" onClick={() => window.print()}>
                <Download size={18} /> Download My Report
              </button>
              {onRestart ? (
                <button className="secondary-button" onClick={onRestart}>
                  <RotateCcw size={18} /> Start Again
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
