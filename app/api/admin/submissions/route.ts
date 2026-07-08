import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/submissions";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const submissions = await listSubmissions({ take: 250 });

  return NextResponse.json({ submissions });
}
