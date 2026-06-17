import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const headers = [
  "createdAt",
  "name",
  "email",
  "phone",
  "city",
  "archetypeName",
  "scoreConsistency",
  "scoreOwnership",
  "scoreRelationships",
  "scoreInitiative",
  "scoreWork",
  "scoreOverall",
  "answers",
  "diagnosis",
  "focusShift",
  "aiModel",
  "userAgent"
];

function csvCell(value: unknown): string {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" }
  });

  const rows = [
    headers.join(","),
    ...submissions.map((submission) =>
      headers
        .map((header) => csvCell(submission[header as keyof typeof submission]))
        .join(",")
    )
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=confident-father-submissions.csv"
    }
  });
}
