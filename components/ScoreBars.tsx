import type { Scores } from "@/lib/types";

const rows = [
  ["identity", "Identity"],
  ["conditioning", "Inherited expectations"],
  ["responsibility", "Whole-life responsibility"],
  ["emotional", "Emotional patterns"],
  ["decision_making", "Decision-making"],
  ["fear", "Fear and uncertainty"],
  ["alignment", "Life alignment"]
] as const;

export function ScoreBars({ scores }: { scores: Scores }) {
  return (
    <div className="score-bars">
      {rows.map(([key, label]) => (
        <div className="score-row" key={key}>
          <div className="score-row-top">
            <span>{label}</span>
            <span>{scores[key]}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
