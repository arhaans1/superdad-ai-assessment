"use client";

import { ArrowRight, Download, PlayCircle, RotateCcw } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import type { Archetype, AssessmentSettings, InsightReport } from "@/lib/types";

export type ResultData = {
  id?: string;
  archetype: Archetype;
  report: InsightReport;
};

function videoEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (url.hostname.includes("loom.com")) {
      return rawUrl.replace("/share/", "/embed/");
    }
    return null;
  } catch {
    return null;
  }
}

export function ResultsView({
  result,
  settings,
  onRestart
}: {
  result: ResultData;
  settings: AssessmentSettings;
  onRestart?: () => void;
}) {
  const embedUrl = videoEmbedUrl(settings.videoUrl);
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

        {showVideo ? (
          <section className="content-section video-section">
            <div className="content-inner video-layout">
              <div>
                <div className="eyebrow dark">Recognition is the beginning</div>
                <h2 className="section-heading">Understand why these patterns may be showing up</h2>
                <p className="diagnosis">
                  Watch this short message from Vishal to see how seven underlying gaps can
                  connect fatherhood, relationships, work, confidence and life direction.
                </p>
              </div>
              {embedUrl ? (
                <div className="video-frame">
                  <iframe
                    src={embedUrl}
                    title="A message from Vishal about your assessment"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  className="primary-button"
                  href={settings.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PlayCircle size={18} /> Watch the Video
                </a>
              )}
            </div>
          </section>
        ) : null}

        {showBooking ? (
          <section className="content-section">
            <div className="content-inner booking-card">
              <div>
                <div className="eyebrow">Want clarity on what to rebuild next?</div>
                <h2>Book a short conversation with our team.</h2>
                <p>
                  We’ll understand where you are today, what you want life and fatherhood to
                  look like, and what may currently be getting in the way.
                </p>
              </div>
              <a
                className="primary-button light-button"
                href={settings.bookingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Book a Call <ArrowRight size={18} />
              </a>
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
