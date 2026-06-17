import Anthropic from "@anthropic-ai/sdk";
import { archetypes } from "@/lib/archetypes";
import { lowestDimension, strongestDimension } from "@/lib/scoring";
import type { Archetype, AssessmentAnswer, Scores } from "@/lib/types";

const dimensionLabels = {
  consistency: "Consistency",
  ownership: "Ownership",
  relationships: "Relationships",
  initiative: "Daily Initiative",
  work: "Work Integration"
};

export type ReportInput = {
  archetype: Archetype;
  scores: Scores;
  answers: AssessmentAnswer[];
};

export type GeneratedReport = {
  diagnosis: string;
  focusShift: string;
  aiModel: string;
};

function textAnswer(answers: AssessmentAnswer[], questionId: string): string {
  const value = answers.find((answer) => answer.questionId === questionId)?.value;
  return typeof value === "string" ? value.trim() : "";
}

export function fallbackReport(input: ReportInput): GeneratedReport {
  const weakest = lowestDimension(input.scores);
  const strongest = strongestDimension(input.scores);
  const q16 = textAnswer(input.answers, "q16");
  const q17 = textAnswer(input.answers, "q17");
  const gapLine =
    input.scores.workHomeGap >= 18
      ? "There is also a clear work-home mirror here. You may bring more structure, initiative, and leadership to work than you currently bring into ordinary family moments."
      : input.scores.workHomeGap <= -18
        ? "Your family side is carrying real strength. The opportunity is to keep that presence steady while work also gets your calmer, clearer leadership."
        : "Your work and home scores are close enough to show alignment. The next step is not a total rebuild; it is a sharper daily practice.";

  return {
    aiModel: "fallback",
    diagnosis: [
      `${input.archetype.description}`,
      `Your strongest area is ${dimensionLabels[strongest]}, and that matters. It shows there is already something solid to build on. Your lowest area is ${dimensionLabels[weakest]}, which is likely where your family feels the gap most clearly.`,
      gapLine,
      q16
        ? `The moment you described - "${q16}" - matters because it shows what is already sitting in your heart.`
        : "Even without one perfect story, your answers show a father who is paying attention.",
      q17
        ? `Your 90-day desire - "${q17}" - is a good starting point. It is specific enough to turn into action, and small enough to begin today.`
        : "The next 90 days do not need a dramatic promise. They need one simple pattern that your family can feel."
    ].join("\n\n"),
    focusShift: `Start with ${dimensionLabels[weakest]}. Pick one small action you can repeat daily for the next seven days, then protect it like a meeting that matters. Keep it simple enough that your family can feel it before you try to perfect it.`
  };
}

function buildPrompt(input: ReportInput): string {
  const q16 = textAnswer(input.answers, "q16");
  const q17 = textAnswer(input.answers, "q17");

  return `Here is a father's assessment data. Write his personalised report.

ARCHETYPE: ${input.archetype.name}
HOME SCORES (0-100): Consistency ${input.scores.consistency}, Ownership ${input.scores.ownership}, Relationships ${input.scores.relationships}, Daily Initiative ${input.scores.initiative}.
WORK SCORE (0-100): Work Integration ${input.scores.work}.
Overall (home) ${input.scores.homeOverall}. Work-vs-home gap: ${input.scores.workHomeGap}.

His own words:
- A recent moment that stayed with him: "${q16}"
- What he'd change in the next 90 days: "${q17}"

Write TWO things, separated by the marker [FOCUS]:

1. DIAGNOSIS (3-4 short paragraphs):
   - Open by reflecting back his archetype in a way that feels seen, not labelled.
   - Weave in his strongest dimension (genuine credit) and his weakest (gently).
   - IF there is a meaningful gap between his Work score and his home scores,
     name it directly and compassionately - e.g. "You bring initiative and
     leadership to work, but at home you wait." This work-home mirror is a key
     insight; use it when the numbers support it.
   - Reference his written answers directly - show him you read them.
   - End this section on a hopeful, possibility-focused note.

2. [FOCUS] FOCUS SHIFT (2-3 sentences):
   - The single most important shift for him to focus on first, based on his
     lowest dimension and his stated 90-day desire.
   - Make it feel doable and specific, not generic.

Output only the report. No preamble.`;
}

export async function generateReport(input: ReportInput): Promise<GeneratedReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  if (!apiKey) {
    return fallbackReport(input);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model,
      max_tokens: 800,
      system:
        "You are an insightful, warm, and emotionally intelligent coach for fathers,\nwriting on behalf of Platform of Papas (founder: Vishal Kumar Singh). You are\nwriting a short personalised assessment report for a father who just completed\na self-assessment.\n\nYour voice: warm, direct, never preachy, never clinical. You speak to him like\na coach who genuinely sees him. Simple language a 5th grader could follow. Short,\npunchy sentences. No jargon. India-aware (use relatable Indian family context\nwhere natural, but do not overdo it).\n\nRules:\n- Do NOT shame or judge. Every father here is trying. Acknowledge effort.\n- Be specific. Reference his actual written answers so it feels written for him.\n- Do not give medical or psychological diagnoses.\n- Keep hope front and centre: change is possible, it's not too late.\n- Do not hard-sell. One gentle forward-looking line at the very end is allowed,\n  pointing toward \"the path ahead\" - but no pricing, no pushy CTA.",
      messages: [{ role: "user", content: buildPrompt(input) }]
    });

    const output = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!output) {
      return fallbackReport(input);
    }

    const [diagnosis, focus] = output.split("[FOCUS]");
    if (!focus) {
      const fallback = fallbackReport(input);
      return {
        diagnosis: output,
        focusShift: fallback.focusShift,
        aiModel: model
      };
    }

    return {
      diagnosis: diagnosis.trim(),
      focusShift: focus.trim(),
      aiModel: model
    };
  } catch {
    return fallbackReport(input);
  }
}

export function archetypeForKey(key: string): Archetype {
  return archetypes[key as keyof typeof archetypes] || archetypes.ghost;
}
