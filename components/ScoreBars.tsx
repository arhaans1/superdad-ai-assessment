import type { Scores } from "@/lib/types";

const rows = [
  ["consistency", "Consistency"],
  ["ownership", "Ownership"],
  ["relationships", "Relationships"],
  ["initiative", "Daily Initiative"],
  ["work", "Work Integration"]
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
              className={`bar-fill ${key === "work" ? "work" : ""}`}
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
