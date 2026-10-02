import type { FatherhoodStage, Gap } from "@/lib/types";

export type QuestionOption = {
  label: string;
  value: number;
};

type StageCopy = Record<FatherhoodStage, string>;

export type Question =
  | {
      id: string;
      kind: "mcq";
      gap: Gap;
      prompt: string | StageCopy;
      context?: string | StageCopy;
      options: QuestionOption[];
    }
  | {
      id: string;
      kind: "text";
      prompt: string | StageCopy;
      context?: string | StageCopy;
      helper: string;
      placeholder: string;
    };

export type DisplayQuestion =
  | (Omit<Extract<Question, { kind: "mcq" }>, "prompt" | "context"> & {
      prompt: string;
      context?: string;
    })
  | (Omit<Extract<Question, { kind: "text" }>, "prompt" | "context"> & {
      prompt: string;
      context?: string;
    });

const positiveAgreement: QuestionOption[] = [
  { label: "Strongly agree", value: 0 },
  { label: "Agree", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Disagree", value: 3 },
  { label: "Strongly disagree", value: 4 }
];

const negativeAgreement: QuestionOption[] = [
  { label: "Strongly disagree", value: 0 },
  { label: "Disagree", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Agree", value: 3 },
  { label: "Strongly agree", value: 4 }
];

const easeScale: QuestionOption[] = [
  { label: "Very easy", value: 0 },
  { label: "Usually easy", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Difficult", value: 3 },
  { label: "Very difficult", value: 4 }
];

const frequencyPositive: QuestionOption[] = [
  { label: "Almost always", value: 0 },
  { label: "Often", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Rarely", value: 3 },
  { label: "Almost never", value: 4 }
];

export const questions: Question[] = [
  {
    id: "q1",
    kind: "mcq",
    gap: "identity",
    prompt: "I have a clear sense of the kind of father, partner and man I want to become.",
    context: "Think beyond what others expect of you.",
    options: positiveAgreement
  },
  {
    id: "q4",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I have consciously thought about what being a good father means to me.",
    context: "Not only what you saw growing up or what others told you.",
    options: positiveAgreement
  },
  {
    id: "q7",
    kind: "mcq",
    gap: "responsibility",
    prompt: "I see my responsibility to my family as extending beyond financial provision.",
    context: "For example: attention, communication, health, support and reliability.",
    options: positiveAgreement
  },
  {
    id: "q10",
    kind: "mcq",
    gap: "emotional",
    prompt:
      "I notice when stress or pressure is beginning to influence how I communicate with people close to me.",
    options: positiveAgreement
  },
  {
    id: "q13",
    kind: "mcq",
    gap: "decision_making",
    prompt: "When I know an important change is needed in my personal life, I take concrete action.",
    options: positiveAgreement
  },
  {
    id: "q16",
    kind: "mcq",
    gap: "fear",
    prompt: "I can recognise when fear of making the wrong decision is causing me to delay action.",
    context: "Fear can look like overthinking, excessive planning or waiting for certainty.",
    options: positiveAgreement
  },
  {
    id: "q19",
    kind: "mcq",
    gap: "alignment",
    prompt: "My calendar reflects the priorities I say are most important to me.",
    options: positiveAgreement
  },
  {
    id: "q2",
    kind: "mcq",
    gap: "identity",
    prompt: "I feel clear about what I personally want from the next chapter of my life.",
    options: positiveAgreement
  },
  {
    id: "q5",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I can tell the difference between what I genuinely value and what I simply learned to expect of myself.",
    options: positiveAgreement
  },
  {
    id: "q8",
    kind: "mcq",
    gap: "responsibility",
    prompt: {
      soon_to_be:
        "I actively support my partner and take part in preparing for the changes our family is going through.",
      baby_toddler:
        "I actively support my partner and share the demands of our new family life.",
      young_preteen:
        "I take responsibility not only for my child's needs, but also for how I communicate, respond and show up around them."
    },
    options: positiveAgreement
  },
  {
    id: "q11",
    kind: "mcq",
    gap: "emotional",
    prompt: {
      soon_to_be:
        "When conversations about the baby, finances or the future feel uncertain, how easy is it for you to pause before reacting?",
      baby_toddler:
        "When tiredness or a disrupted routine puts you under pressure, how easy is it for you to pause before reacting?",
      young_preteen:
        "When your child disagrees or pushes a boundary, how easy is it for you to pause before reacting?"
    },
    options: easeScale
  },
  {
    id: "q14",
    kind: "mcq",
    gap: "decision_making",
    prompt: "I postpone important personal decisions because work is busy.",
    context: "Think about health, relationships, boundaries or an overdue conversation.",
    options: negativeAgreement
  },
  {
    id: "q17",
    kind: "mcq",
    gap: "fear",
    prompt: "Concern about financial security influences how much time and energy I give to work.",
    context: "Providing matters. This asks whether concern sometimes makes it hard to switch off.",
    options: negativeAgreement
  },
  {
    id: "q20",
    kind: "mcq",
    gap: "alignment",
    prompt: {
      soon_to_be:
        "When my partner wants to discuss the pregnancy, baby or our future family, I can be mentally present rather than distracted by work.",
      baby_toddler:
        "When I am home with my partner and child, I can mentally disconnect from work and be present.",
      young_preteen:
        "When my child wants my attention, I can be fully present rather than mentally occupied by work or other pressures."
    },
    options: frequencyPositive
  },
  {
    id: "q3",
    kind: "mcq",
    gap: "identity",
    prompt:
      "Even while meeting my responsibilities, I still feel connected to who I am outside my roles.",
    context: "Your roles may include professional, provider, partner and father.",
    options: positiveAgreement
  },
  {
    id: "q6",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I feel free to build my own version of fatherhood rather than automatically repeating what I experienced growing up.",
    context: "You can keep what serves you and expand what no longer fits.",
    options: positiveAgreement
  },
  {
    id: "q9",
    kind: "mcq",
    gap: "responsibility",
    prompt: "I take ownership when an important part of my family or personal life needs attention.",
    options: positiveAgreement
  },
  {
    id: "q12",
    kind: "mcq",
    gap: "emotional",
    prompt: "Work-related pressure rarely determines how I behave at home.",
    options: positiveAgreement
  },
  {
    id: "q15",
    kind: "mcq",
    gap: "decision_making",
    prompt: "My personal life receives the same deliberate decision-making that I apply professionally.",
    options: positiveAgreement
  },
  {
    id: "q18",
    kind: "mcq",
    gap: "fear",
    prompt: "I am comfortable making meaningful life changes even when there is some uncertainty involved.",
    options: positiveAgreement
  },
  {
    id: "q21",
    kind: "mcq",
    gap: "alignment",
    prompt: "My professional ambition and family priorities feel capable of strengthening each other rather than constantly competing.",
    context: "This is not about becoming less ambitious. It is about building a life where both can matter.",
    options: positiveAgreement
  },
  {
    id: "q22",
    kind: "text",
    prompt: {
      soon_to_be:
        "Describe one recent moment about becoming a father that stayed with you. What happened, and what did it bring up for you?",
      baby_toddler:
        "Describe one recent moment with your partner or child that stayed with you. What happened, and how did it make you feel?",
      young_preteen:
        "Describe one recent moment with your family that stayed with you—good or difficult. What happened, and how did it make you feel?"
    },
    helper: "Write 2–4 sentences.",
    placeholder: "There are no wrong answers—write what comes to mind."
  },
  {
    id: "q23",
    kind: "text",
    prompt: "If you could intentionally rebuild one part of your life in the next 90 days, what would it be?",
    context: "It could involve family, your relationship, health, work, confidence or direction.",
    helper: "Write 1–2 sentences.",
    placeholder: "Name the change that would matter most to you."
  }
];

function stageText(copy: string | StageCopy | undefined, stage: FatherhoodStage) {
  if (!copy) return undefined;
  return typeof copy === "string" ? copy : copy[stage];
}

export function questionsForStage(stage: FatherhoodStage): DisplayQuestion[] {
  return questions.map((question) => ({
    ...question,
    prompt: stageText(question.prompt, stage) || "",
    context: stageText(question.context, stage)
  })) as DisplayQuestion[];
}

export const scoredQuestions = questions.filter(
  (question): question is Extract<Question, { kind: "mcq" }> => question.kind === "mcq"
);

export const textQuestions = questions.filter(
  (question): question is Extract<Question, { kind: "text" }> => question.kind === "text"
);
