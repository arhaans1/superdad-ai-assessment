"use client";

import { Download, RotateCcw } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { ScoreBars } from "@/components/ScoreBars";
import { ScoreRadar } from "@/components/ScoreRadar";
import type { Archetype, Scores } from "@/lib/types";

export type ResultData = {
  id?: string;
  archetype: Archetype;
  scores: Scores;
  diagnosis: string;
  focusShift: string;
};

export function ResultsView({
  result,
  onRestart
}: {
  result: ResultData;
  onRestart?: () => void;
}) {
  return (
    <div className="page-shell">
      <BrandHeader />
      <section className="results-header">
        <div className="intro-inner">
          <h1 className="results-title">{result.archetype.name}</h1>
          <p className="results-tagline">{result.archetype.description}</p>
        </div>
      </section>

      <main>
        <section className="content-section">
          <div className="content-inner score-layout">
            <div className="chart-panel" aria-label="Five-dimension score radar chart">
              <ScoreRadar scores={result.scores} />
            </div>
            <ScoreBars scores={result.scores} />
          </div>
        </section>

        <section className="content-section">
          <div className="content-inner">
            <h2 className="section-heading">Your report</h2>
            <div className="diagnosis">{result.diagnosis}</div>
          </div>
        </section>

        <section className="content-section">
          <div className="content-inner">
            <div className="focus-card">
              <h2 className="section-heading">Your first shift</h2>
              <div className="diagnosis">{result.focusShift}</div>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="content-inner">
            <div className="bridge-block">
              <p>
                This assessment is a snapshot - a starting point. The fathers who actually
                close the gap don&apos;t do it alone. They do it with a clear system and a
                room full of men walking the same path. If something here resonated, the
                rest of today&apos;s session is built exactly for that. Stay with us.
              </p>
            </div>
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
