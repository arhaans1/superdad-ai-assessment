"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { Scores } from "@/lib/types";

export function ScoreRadar({ scores }: { scores: Scores }) {
  const data = [
    { dimension: "Identity", score: scores.identity },
    { dimension: "Expectations", score: scores.conditioning },
    { dimension: "Responsibility", score: scores.responsibility },
    { dimension: "Emotions", score: scores.emotional },
    { dimension: "Decisions", score: scores.decision_making },
    { dimension: "Fear", score: scores.fear },
    { dimension: "Alignment", score: scores.alignment }
  ];

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(47,79,92,0.22)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: "#2F4F5C", fontSize: 12 }} />
        <Tooltip />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#C58A2B"
          fill="#C58A2B"
          fillOpacity={0.38}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
