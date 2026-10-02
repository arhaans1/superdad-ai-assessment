import { isAdminAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/submissions";

const headers = [
  "createdAt",
  "name",
  "email",
  "phone",
  "city",
  "fatherhoodStage",
  "archetypeName",
  "scoreIdentity",
  "scoreConditioning",
  "scoreResponsibility",
  "scoreEmotional",
  "scoreDecisionMaking",
  "scoreFear",
  "scoreAlignment",
  "scoreOverall",
  "reportJson",
  "assessmentVersion",
  "answers",
  "diagnosis",
  "focusShift",
  "aiModel",
  "userAgent",
  "scoreConsistency",
  "scoreOwnership",
  "scoreRelationships",
  "scoreInitiative",
  "scoreWork"
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

  const submissions = await listSubmissions();

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
      "Content-Disposition": "attachment; filename=intentional-father-submissions.csv"
    }
  });
}
