import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSubmission } from "@/lib/submissions";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const submission = await getSubmission(id);

  if (!submission) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ submission });
}
