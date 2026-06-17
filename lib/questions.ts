import type { Dimension } from "@/lib/types";

export type QuestionOption = {
  label: string;
  value: number;
};

export type Question =
  | {
      id: string;
      kind: "mcq";
      dimension: Dimension;
      prompt: string;
      options: QuestionOption[];
    }
  | {
      id: string;
      kind: "text";
      prompt: string;
      helper: string;
      placeholder: string;
    };

const options = (labels: string[]): QuestionOption[] =>
  labels.map((label, value) => ({ label, value }));

export const questions: Question[] = [
  {
    id: "q1",
    kind: "mcq",
    dimension: "consistency",
    prompt:
      "On a typical weekday, how much fully-present time (no phone, no distractions) do you spend with your child?",
    options: options([
      "Honestly, almost none",
      "A few minutes here and there",
      "About 15-20 minutes",
      "30-45 focused minutes",
      "An hour or more, consistently"
    ])
  },
  {
    id: "q13",
    kind: "mcq",
    dimension: "work",
    prompt: "At work, when something needs to be done, how do you typically operate?",
    options: options([
      "I wait to be told what to do",
      "I do my part, but rarely more",
      "I step up when it's clearly expected",
      "I often take initiative before being asked",
      "I consistently lead - I see what's needed and drive it"
    ])
  },
  {
    id: "q4",
    kind: "mcq",
    dimension: "ownership",
    prompt: "Who do you see as primarily responsible for the emotional connection in your home?",
    options: options([
      "My wife - that's really her domain",
      "Mostly my wife, I help sometimes",
      "We split it, but she carries more",
      "We share it fairly equally",
      "I take full ownership of my part, actively"
    ])
  },
  {
    id: "q7",
    kind: "mcq",
    dimension: "relationships",
    prompt:
      "How well do you actually know what's going on in your child's inner world right now - their fears, friends, dreams?",
    options: options([
      "I realise I don't really know",
      "Only the surface",
      "Some of it",
      "A good amount",
      "Deeply - we talk about real things"
    ])
  },
  {
    id: "q10",
    kind: "mcq",
    dimension: "initiative",
    prompt:
      "Have you ever invested in learning how to be a better father (book, course, coach, programme)?",
    options: options([
      "Never - it never occurred to me",
      "I've thought about it but never did",
      "I've read/watched a little",
      "Yes, a few things",
      "Yes - I actively keep learning and applying"
    ])
  },
  {
    id: "q2",
    kind: "mcq",
    dimension: "consistency",
    prompt:
      "How predictable are you as a presence at home - can your family count on you showing up the same way each day?",
    options: options([
      "Not at all - it depends entirely on my work and mood",
      "Rarely - most days are unpredictable",
      "Somewhat - good weeks and bad weeks",
      "Mostly - I'm fairly steady",
      "Completely - they know exactly what to expect from me"
    ])
  },
  {
    id: "q14",
    kind: "mcq",
    dimension: "work",
    prompt: "How would your colleagues describe you as a team player?",
    options: options([
      "I mostly keep to myself / work alone",
      "I do my bit but don't really collaborate",
      "I'm cooperative when needed",
      "I'm a strong, dependable teammate",
      "I actively lift the whole team - people are better with me around"
    ])
  },
  {
    id: "q5",
    kind: "mcq",
    dimension: "ownership",
    prompt: "When something feels \"off\" between you and your child, what's your instinct?",
    options: options([
      "Wait for it to pass on its own",
      "Hope my wife handles it",
      "Worry about it but not act",
      "Bring it up when I find the right moment",
      "Take initiative to understand and address it directly"
    ])
  },
  {
    id: "q8",
    kind: "mcq",
    dimension: "relationships",
    prompt: "When was the last time your child came to YOU first with something important?",
    options: options([
      "I can't remember it happening",
      "It's been a very long time",
      "Occasionally, for practical things",
      "Fairly recently",
      "Regularly - I'm often their first call"
    ])
  },
  {
    id: "q11",
    kind: "mcq",
    dimension: "initiative",
    prompt: "Do you have any daily or weekly ritual that you do WITH your family, on purpose?",
    options: options([
      "No, nothing intentional",
      "Not really, it's all ad hoc",
      "One loose thing, inconsistently",
      "Yes, one or two we mostly keep",
      "Yes - intentional rituals we protect"
    ])
  },
  {
    id: "q3",
    kind: "mcq",
    dimension: "consistency",
    prompt: "When work gets intense, what usually happens to your time at home?",
    options: options([
      "Home time disappears completely",
      "It shrinks badly and stays shrunk",
      "It takes a hit but I recover after a while",
      "I protect it most of the time",
      "I hold my home boundaries no matter what"
    ])
  },
  {
    id: "q15",
    kind: "mcq",
    dimension: "work",
    prompt:
      "Think about the energy, focus and intentionality you bring to your career. Now compare it to what you bring to your family life. How do they match up?",
    options: options([
      "Work gets nearly all of my best energy; family gets the leftovers",
      "Work clearly gets more of my best self",
      "Work gets a bit more, but I'm trying to balance it",
      "They're fairly evenly matched",
      "I bring my best, most intentional self to my family - even more than to work"
    ])
  },
  {
    id: "q6",
    kind: "mcq",
    dimension: "ownership",
    prompt: "How much do you believe the state of your family life is within your control to change?",
    options: options([
      "Not much - it's just how things are now",
      "A little, but the damage feels done",
      "Maybe, if circumstances change first",
      "Largely - if I do the work",
      "Completely - change in me creates change around me"
    ])
  },
  {
    id: "q9",
    kind: "mcq",
    dimension: "relationships",
    prompt: "How would you describe the emotional climate between you and your partner lately?",
    options: options([
      "Distant - we're more like roommates",
      "Strained or tense",
      "Functional but flat",
      "Warm most of the time",
      "Genuinely connected and growing"
    ])
  },
  {
    id: "q12",
    kind: "mcq",
    dimension: "initiative",
    prompt:
      "When you think about working on yourself (your stress, your patterns, your growth), where are you?",
    options: options([
      "I don't have the time or energy for that",
      "I know I should but haven't started",
      "I dabble occasionally",
      "I work on it semi-regularly",
      "It's a consistent priority - I know it makes me a better father"
    ])
  },
  {
    id: "q16",
    kind: "text",
    prompt:
      "Describe one recent moment with your child or family that stayed with you - good or hard. What happened, and how did it make you feel?",
    helper: "Write 2-4 sentences.",
    placeholder: "There are no wrong answers - just write what comes to mind."
  },
  {
    id: "q17",
    kind: "text",
    prompt: "If one thing could change about your life as a father in the next 90 days, what would it be?",
    helper: "Write 1-2 sentences.",
    placeholder: "Name the change you would most want to feel at home."
  }
];

export const scoredQuestions = questions.filter((question) => question.kind === "mcq");
export const textQuestions = questions.filter((question) => question.kind === "text");
