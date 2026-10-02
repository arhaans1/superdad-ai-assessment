import type { Archetype, ArchetypeKey } from "@/lib/types";

export const archetypes: Record<ArchetypeKey, Archetype> = {
  provider: {
    key: "provider",
    name: "The Provider",
    description:
      "You take providing seriously and often carry a great deal for the people you love. Your opportunity may be to expand that strength so responsibility also includes attention, emotional availability, shared decisions and care for your own wellbeing."
  },
  ghost: {
    key: "ghost",
    name: "The Ghost",
    description:
      "You may be physically present while part of your attention remains with work, pressure or the next problem to solve. This is not a character flaw. It is a current pattern—and one that can change as you learn how to arrive more fully in the moments that matter."
  },
  firefighter: {
    key: "firefighter",
    name: "The Firefighter",
    description:
      "You are often dependable when something urgent needs solving. Under pressure, however, life can become reactive. The next step may be creating enough space to notice patterns earlier and build connection through ordinary, steady moments too."
  },
  weekend: {
    key: "weekend",
    name: "The Weekend Dad",
    description:
      "You care about connection, but work and responsibility may push it into the time that remains. Your opportunity is not necessarily to find many more hours. It may be to create small, reliable points of presence throughout ordinary days."
  },
  awakening: {
    key: "awakening",
    name: "The Awakening Father",
    description:
      "Something has already shifted in you. You can see where life no longer fully supports the father, partner and man you intend to become. You are beginning to act on that awareness; the opportunity now is to turn insight into a few consistent choices."
  },
  present: {
    key: "present",
    name: "The Present Father",
    description:
      "Many parts of your life appear to reflect what matters to you. You show signs of clarity, ownership and presence while continuing to make room for ambition. The work ahead is less about repair and more about protecting and deepening what is already taking shape."
  }
};
