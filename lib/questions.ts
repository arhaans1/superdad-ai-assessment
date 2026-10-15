import type { FatherhoodStage, Gap } from "@/lib/types";

export type QuestionOption = {
  label: string;
  value: number;
};

type StageCopy = Record<FatherhoodStage, string>;
type QuestionOptions = QuestionOption[] | Record<FatherhoodStage, QuestionOption[]>;

export const ASSESSMENT_VERSION = "intentional-father-v2.1";

export type Question =
  | {
      id: string;
      kind: "mcq";
      gap: Gap;
      prompt: string | StageCopy;
      context?: string | StageCopy;
      options: QuestionOptions;
    }
  | {
      id: string;
      kind: "text";
      prompt: string | StageCopy;
      context?: string | StageCopy;
      helper?: string;
      placeholder: string;
      minLength?: number;
    };

export type DisplayQuestion =
  | (Omit<Extract<Question, { kind: "mcq" }>, "prompt" | "context" | "options"> & {
      prompt: string;
      context?: string;
      options: QuestionOption[];
    })
  | (Omit<Extract<Question, { kind: "text" }>, "prompt" | "context"> & {
      prompt: string;
      context?: string;
    });

// Keep the wording that existing v2 leads actually selected in the admin view.
const legacyPositiveAgreement: QuestionOption[] = [
  { label: "Strongly agree", value: 0 },
  { label: "Agree", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Disagree", value: 3 },
  { label: "Strongly disagree", value: 4 }
];

const legacyNegativeAgreement: QuestionOption[] = [
  { label: "Strongly disagree", value: 0 },
  { label: "Disagree", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Agree", value: 3 },
  { label: "Strongly agree", value: 4 }
];

const legacyEaseScale: QuestionOption[] = [
  { label: "Very easy", value: 0 },
  { label: "Usually easy", value: 1 },
  { label: "It depends", value: 2 },
  { label: "Difficult", value: 3 },
  { label: "Very difficult", value: 4 }
];

const legacyFrequencyPositive: QuestionOption[] = [
  { label: "Almost always", value: 0 },
  { label: "Often", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Rarely", value: 3 },
  { label: "Almost never", value: 4 }
];

// Preserve the five existing gap values: 0 = least gap, 4 = greatest gap.
const options = (labels: [string, string, string, string, string]): QuestionOption[] =>
  labels.map((label, value) => ({ label, value }));

export const questions: Question[] = [
  {
    id: "q1",
    kind: "mcq",
    gap: "identity",
    prompt: "I have a clear sense of the kind of father, partner and man I want to become.",
    context: "Think beyond what others expect of you.",
    options: options([
      "I know the kind of father, partner and man I want to be and make choices around it.",
      "I have a clear picture, though I do not always live by it.",
      "I know some qualities I want to develop, but the bigger picture is still forming.",
      "I mostly focus on meeting expectations rather than choosing who I want to become.",
      "I have not thought about the kind of father, partner and man I want to be."
    ])
  },
  {
    id: "q4",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I have consciously thought about what being a good father means to me.",
    context: "Not only what you saw growing up or what others told you.",
    options: options([
      "I have thought it through and chosen what being a good father means to me.",
      "I have reflected on it and have a fairly clear personal view.",
      "I have thought about it a little, but still rely on what I have seen or been told.",
      "I mostly follow the example I grew up with without questioning it.",
      "I have never really stopped to think about what being a good father means to me."
    ])
  },
  {
    id: "q7",
    kind: "mcq",
    gap: "responsibility",
    prompt: "I see my responsibility to my family as extending beyond financial provision.",
    context: "For example: attention, communication, health, support and reliability.",
    options: options([
      "Providing is one part; I take full ownership of my part in connection, care and support too.",
      "I see care, communication and reliability as my responsibility alongside providing.",
      "I know there is more to my role, but providing still takes most of my attention.",
      "I mainly see myself as the provider and leave most other family needs to others.",
      "As long as I provide financially, I feel I have done my part."
    ])
  },
  {
    id: "q10",
    kind: "mcq",
    gap: "emotional",
    prompt:
      "I notice when stress or pressure is beginning to influence how I communicate with people close to me.",
    options: options([
      "I notice the early signs of pressure before they affect how I speak.",
      "I usually catch the change in my tone or patience as it begins.",
      "Sometimes I notice it early; other times I realise afterwards.",
      "I usually realise only after I have snapped or withdrawn.",
      "I rarely notice the effect until someone points it out."
    ])
  },
  {
    id: "q13",
    kind: "mcq",
    gap: "decision_making",
    prompt: "When I know an important change is needed in my personal life, I take concrete action.",
    options: options([
      "I take initiative to understand and address it directly.",
      "I usually choose a concrete next step and follow through.",
      "I take a few steps, but often lose momentum.",
      "I worry about it but rarely act.",
      "I wait for things to change on their own."
    ])
  },
  {
    id: "q16",
    kind: "mcq",
    gap: "fear",
    prompt: "I can recognise when fear of making the wrong decision is causing me to delay action.",
    context: "Fear can look like overthinking, excessive planning or waiting for certainty.",
    options: options([
      "I can clearly tell when fear is behind my hesitation.",
      "I usually recognise when fear is making me delay a decision.",
      "Sometimes I recognise the fear; sometimes I mistake it for needing more time.",
      "I usually call it planning or being careful and only recognise the fear later.",
      "I struggle to tell whether fear is behind my delays."
    ])
  },
  {
    id: "q19",
    kind: "mcq",
    gap: "alignment",
    prompt: "My calendar reflects the priorities I say are most important to me.",
    options: options([
      "I consistently protect time for the people and priorities that matter most.",
      "Most weeks, my calendar reflects my priorities.",
      "Some priorities get time, but others are regularly squeezed out.",
      "My calendar is mostly driven by urgent demands rather than my priorities.",
      "My most important priorities rarely get space in my calendar."
    ])
  },
  {
    id: "q2",
    kind: "mcq",
    gap: "identity",
    prompt: "I feel clear about what I personally want from the next chapter of my life.",
    options: options([
      "I know what I want from the next chapter and can describe it clearly.",
      "I have a fairly clear direction, with a few details still to work out.",
      "I have some ideas, but I am unsure which direction matters most to me.",
      "I mostly know what others expect, rather than what I personally want.",
      "I feel lost about what I want from the next chapter of my life."
    ])
  },
  {
    id: "q5",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I can tell the difference between what I genuinely value and what I simply learned to expect of myself.",
    options: options([
      "I can clearly separate my own values from expectations I inherited.",
      "I can usually tell which expectations fit me and which I learned from others.",
      "I recognise a few inherited expectations, but many still feel like my own.",
      "I often follow expectations without knowing whether I personally value them.",
      "I have never really separated what I value from what I was taught to expect."
    ])
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
    options: {
      soon_to_be: options([
        "I take full ownership of my part in supporting my partner and preparing for our baby.",
        "We share the preparations fairly equally, and I usually notice what is needed.",
        "I take part, but my partner still carries more of the planning and preparation.",
        "I help when asked, but my partner handles most of the preparations.",
        "I leave the preparations and most of the support to my partner or other family members."
      ]),
      baby_toddler: options([
        "I take full ownership of my part in our child's care and supporting my partner.",
        "We share the demands fairly equally, and I usually notice what is needed.",
        "We split the demands, but my partner carries more.",
        "I help sometimes, but my partner handles most of the care and planning.",
        "I leave the care and day-to-day family demands to my partner or other family members."
      ]),
      young_preteen: options([
        "I take ownership of my child's needs and how I communicate, respond and show up.",
        "I usually take care of their needs and pay attention to my own responses.",
        "I handle practical needs, but my communication and reactions are inconsistent.",
        "I help when asked and give little thought to how I respond around my child.",
        "I leave most needs to others and rarely reflect on how I show up."
      ])
    }
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
    options: options([
      "I can pause, settle myself and choose how to respond, even under pressure.",
      "I can usually take a breath before I respond.",
      "Sometimes I pause; sometimes I react before I can stop myself.",
      "I find it hard to pause and often respond in the heat of the moment.",
      "I react immediately and struggle to pause at all."
    ])
  },
  {
    id: "q14",
    kind: "mcq",
    gap: "decision_making",
    prompt: "I postpone important personal decisions because work is busy.",
    context: "Think about health, relationships, boundaries or an overdue conversation.",
    options: options([
      "I make important personal decisions even when work is busy.",
      "I rarely postpone them and usually set a time to decide.",
      "I put some decisions off, but eventually return to them.",
      "I often wait for work to calm down before deciding.",
      "Work is always the reason I leave important personal decisions unresolved."
    ])
  },
  {
    id: "q17",
    kind: "mcq",
    gap: "fear",
    prompt: "Concern about financial security influences how much time and energy I give to work.",
    context: "Providing matters. This asks whether concern sometimes makes it hard to switch off.",
    options: options([
      "I plan for financial security without fear pushing me to keep working.",
      "Financial worries rarely lead me to give work more time than I intend.",
      "Sometimes financial worries make it difficult to switch off.",
      "Financial worries often push me to work longer or stay mentally at work.",
      "Fear about financial security dominates how much time and energy I give to work."
    ])
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
    options: {
      soon_to_be: options([
        "I consistently give my partner focused, uninterrupted attention when we talk about our future family.",
        "I am mentally present for most conversations, with only occasional distractions.",
        "I listen, but thoughts about work often pull my attention away.",
        "I am usually distracted by work or my phone when my partner wants to talk.",
        "I am rarely mentally present for these conversations."
      ]),
      baby_toddler: options([
        "I consistently give my partner and child focused, uninterrupted time at home.",
        "I am mentally present with them most of the time.",
        "I give them attention, but my mind often wanders back to work.",
        "I am usually distracted by work or my phone when I am with them.",
        "I am at home physically, but almost always mentally at work."
      ]),
      young_preteen: options([
        "I consistently give my child focused, uninterrupted attention when they need me.",
        "I am fully present most of the time when my child wants my attention.",
        "I give them attention, but my mind often wanders to work or other pressures.",
        "I am usually distracted by work or my phone when my child wants my attention.",
        "I am rarely able to give my child my full attention."
      ])
    }
  },
  {
    id: "q3",
    kind: "mcq",
    gap: "identity",
    prompt:
      "Even while meeting my responsibilities, I still feel connected to who I am outside my roles.",
    context: "Your roles may include professional, provider, partner and father.",
    options: options([
      "I stay connected to my own interests, values and sense of self alongside my responsibilities.",
      "I usually feel like myself, even while meeting the demands of my roles.",
      "I sometimes feel connected to myself, but my roles often take over.",
      "I mostly define myself through what I do for other people.",
      "I feel I have lost touch with who I am outside my roles."
    ])
  },
  {
    id: "q6",
    kind: "mcq",
    gap: "conditioning",
    prompt: "I feel free to build my own version of fatherhood rather than automatically repeating what I experienced growing up.",
    context: "You can keep what serves you and expand what no longer fits.",
    options: options([
      "I consciously choose what to keep from my upbringing and what to do differently.",
      "I usually follow my own approach, even when it differs from how I was raised.",
      "I am changing some patterns, but still repeat others without thinking.",
      "I often repeat the parenting patterns I grew up with, even when I want to change them.",
      "I feel bound to follow the version of fatherhood I experienced growing up."
    ])
  },
  {
    id: "q9",
    kind: "mcq",
    gap: "responsibility",
    prompt: "I take ownership when an important part of my family or personal life needs attention.",
    options: options([
      "I take initiative to understand and address it directly.",
      "I usually take responsibility and make time to address it.",
      "I notice what needs attention, but my follow-through is inconsistent.",
      "I worry about it but tend to wait for someone else to act.",
      "I wait for it to pass on its own."
    ])
  },
  {
    id: "q12",
    kind: "mcq",
    gap: "emotional",
    prompt: "Work-related pressure rarely determines how I behave at home.",
    options: options([
      "I can leave work pressure behind and respond to my family calmly.",
      "Work pressure rarely changes how I treat people at home.",
      "Some days I handle it well; other days my stress spills over at home.",
      "Work pressure often makes me impatient, withdrawn or reactive at home.",
      "Work pressure almost always sets the tone for how I behave at home."
    ])
  },
  {
    id: "q15",
    kind: "mcq",
    gap: "decision_making",
    prompt: "My personal life receives the same deliberate decision-making that I apply professionally.",
    options: options([
      "I give personal decisions the same care, planning and follow-through as professional ones.",
      "I usually approach personal decisions as deliberately as decisions at work.",
      "I think some personal decisions through, but am more deliberate at work.",
      "Work decisions get my best thinking; personal decisions are mostly reactive.",
      "I leave personal decisions to chance, even though I plan carefully at work."
    ])
  },
  {
    id: "q18",
    kind: "mcq",
    gap: "fear",
    prompt: "I am comfortable making meaningful life changes even when there is some uncertainty involved.",
    options: options([
      "I can make meaningful changes without needing every outcome to be certain.",
      "I am usually comfortable taking a considered step despite some uncertainty.",
      "I can make smaller changes, but uncertainty makes bigger ones difficult.",
      "I usually wait until I feel sure before making a meaningful change.",
      "Uncertainty makes me avoid meaningful changes altogether."
    ])
  },
  {
    id: "q21",
    kind: "mcq",
    gap: "alignment",
    prompt: "My professional ambition and family priorities feel capable of strengthening each other rather than constantly competing.",
    context: "This is not about becoming less ambitious. It is about building a life where both can matter.",
    options: options([
      "My ambition and family priorities actively support each other.",
      "I can usually pursue my goals while protecting what matters to my family.",
      "Sometimes they work together; sometimes I feel pulled between them.",
      "I often feel I must choose between professional progress and family priorities.",
      "Work and family feel like a constant competition that I cannot resolve."
    ])
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
  },
  {
    id: "q24",
    kind: "text",
    prompt: "What does redefining fatherhood mean to you?",
    placeholder: "What does redefining fatherhood mean to you?",
    minLength: 1
  }
];

function stageText(copy: string | StageCopy | undefined, stage: FatherhoodStage) {
  if (!copy) return undefined;
  return typeof copy === "string" ? copy : copy[stage];
}

export function questionsForStage(
  stage: FatherhoodStage,
  assessmentVersion = ASSESSMENT_VERSION
): DisplayQuestion[] {
  return questions
    .filter((question) => assessmentVersion !== "intentional-father-v2" || question.id !== "q24")
    .map((question): DisplayQuestion => {
      const copy = {
        prompt: stageText(question.prompt, stage) || "",
        context: stageText(question.context, stage)
      };
      if (question.kind === "text") return { ...question, ...copy };

      let resolvedOptions = Array.isArray(question.options)
        ? question.options
        : question.options[stage];
      if (assessmentVersion === "intentional-father-v2") {
        resolvedOptions = question.id === "q11"
          ? legacyEaseScale
          : question.id === "q20"
            ? legacyFrequencyPositive
            : ["q14", "q17"].includes(question.id)
              ? legacyNegativeAgreement
              : legacyPositiveAgreement;
      }
      return { ...question, ...copy, options: resolvedOptions };
    });
}

export const scoredQuestions = questions.filter(
  (question): question is Extract<Question, { kind: "mcq" }> => question.kind === "mcq"
);

export const textQuestions = questions.filter(
  (question): question is Extract<Question, { kind: "text" }> => question.kind === "text"
);
