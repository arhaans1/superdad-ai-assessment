import type { Archetype, ArchetypeKey } from "@/lib/types";

export const archetypes: Record<ArchetypeKey, Archetype> = {
  provider: {
    key: "provider",
    name: "The Provider",
    description:
      "You carry your family on your shoulders. You give everything you have - financially, materially, dependably. But somewhere along the way, providing became a substitute for connecting. Your family has your effort. What they're quietly missing is you. The good news: the same drive that makes you a great provider can make you a deeply present father - once you learn where to point it."
  },
  ghost: {
    key: "ghost",
    name: "The Ghost",
    description:
      "You're home. You're at the table. You're in the room. But your mind is still in the meeting, still solving the problem, still somewhere else. Your family feels the difference between your body being present and you being present - and so do you. This isn't a character flaw. It's a skill no one taught you: how to actually arrive when you get home."
  },
  firefighter: {
    key: "firefighter",
    name: "The Firefighter",
    description:
      "You show up when there's a problem to solve - a crisis, a conflict, a thing to fix. You're reliable in the emergency. But connection isn't built in emergencies; it's built in ordinary moments. Right now you're reacting to your family instead of building with them. The shift ahead is from putting out fires to lighting them."
  },
  weekend: {
    key: "weekend",
    name: "The Weekend Dad",
    description:
      "Monday to Friday, you're running. The weekend is when you try to make up for it - and you carry a quiet guilt the rest of the week. But connection isn't a debt you repay on Saturday. It's a thread woven through ordinary days. You don't need more time. You need a different way of being present in the time you already have."
  },
  awakening: {
    key: "awakening",
    name: "The Awakening Father",
    description:
      "Something has already shifted in you. You can feel the gap between the father you are and the father you want to be - and that awareness is the hardest part, and you're already past it. You're taking steps, even if they're inconsistent. What you need now isn't motivation. It's a system, and a community of men walking the same path, so the change finally sticks."
  },
  present: {
    key: "present",
    name: "The Present Father",
    description:
      "You've done real work, and it shows. You're consistent, you take ownership, and your family feels you - not just your presence, but you. You're in rare company. The path ahead isn't fixing what's broken; it's deepening what's already strong, and perhaps helping other fathers find what you've found. Mastery, not repair."
  }
};
