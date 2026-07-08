import type { Submission } from "@prisma/client";
import { listSubmissions } from "@/lib/submissions";

export type AdminStats = Awaited<ReturnType<typeof buildStats>>;

export async function getAdminStats() {
  try {
    const submissions = await listSubmissions();

    return buildStats(submissions);
  } catch (error) {
    console.error("Admin dashboard failed to load submissions", error);
    return {
      ...buildStats([]),
      error:
        "Could not load submissions because the app cannot reach Supabase from Vercel. Check that Vercel DATABASE_URL uses the Supabase pooler on port 6543 and ends with ?pgbouncer=true&connection_limit=1."
    };
  }
}

function buildStats(submissions: Submission[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = submissions.filter((submission) => submission.createdAt >= startOfToday).length;

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
    distribution,
    error: undefined as string | undefined
  };
}
