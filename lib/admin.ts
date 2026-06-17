import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [submissions, today] = await Promise.all([
    prisma.submission.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.submission.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  const distribution = submissions.reduce<Record<string, number>>((acc, submission) => {
    acc[submission.archetypeName] = (acc[submission.archetypeName] || 0) + 1;
    return acc;
  }, {});

  const mostCommonArchetype =
    Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data yet";

  const averageOverall = submissions.length
    ? Math.round(
        submissions.reduce((sum, submission) => sum + submission.scoreOverall, 0) /
          submissions.length
      )
    : 0;

  return {
    submissions,
    total: submissions.length,
    today,
    mostCommonArchetype,
    averageOverall,
    distribution
  };
}
