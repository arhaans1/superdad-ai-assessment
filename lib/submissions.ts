import { randomUUID } from "crypto";
import type { Prisma, Submission } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SubmissionCreateData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  answers: Prisma.InputJsonValue;
  scoreConsistency: number;
  scoreOwnership: number;
  scoreRelationships: number;
  scoreInitiative: number;
  scoreWork: number;
  scoreOverall: number;
  archetypeKey: string;
  archetypeName: string;
  diagnosis: string;
  focusShift: string;
  aiModel?: string | null;
  userAgent?: string | null;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config) {
    throw new Error("Supabase REST is not configured.");
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase REST ${response.status}: ${body || response.statusText}`);
  }

  return (await response.json()) as T;
}

function normalizeSubmission(raw: Record<string, unknown>): Submission {
  return {
    id: String(raw.id),
    createdAt: new Date(String(raw.createdAt)),
    name: String(raw.name),
    email: String(raw.email),
    phone: String(raw.phone),
    city: String(raw.city),
    answers: raw.answers as Prisma.JsonValue,
    scoreConsistency: Number(raw.scoreConsistency),
    scoreOwnership: Number(raw.scoreOwnership),
    scoreRelationships: Number(raw.scoreRelationships),
    scoreInitiative: Number(raw.scoreInitiative),
    scoreWork: Number(raw.scoreWork),
    scoreOverall: Number(raw.scoreOverall),
    archetypeKey: String(raw.archetypeKey),
    archetypeName: String(raw.archetypeName),
    diagnosis: String(raw.diagnosis),
    focusShift: String(raw.focusShift),
    aiModel: raw.aiModel === null || raw.aiModel === undefined ? null : String(raw.aiModel),
    userAgent: raw.userAgent === null || raw.userAgent === undefined ? null : String(raw.userAgent)
  };
}

export async function createSubmission(data: SubmissionCreateData): Promise<Submission> {
  if (supabaseConfig()) {
    const rows = await supabaseFetch<Record<string, unknown>[]>("Submission", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: randomUUID(),
        ...data
      })
    });

    const created = rows[0];
    if (!created) throw new Error("Supabase did not return the created submission.");
    return normalizeSubmission(created);
  }

  return prisma.submission.create({
    data
  });
}

export async function listSubmissions(options?: { take?: number }): Promise<Submission[]> {
  if (supabaseConfig()) {
    const params = new URLSearchParams({
      select: "*",
      order: "createdAt.desc"
    });

    if (options?.take) {
      params.set("limit", String(options.take));
    }

    const rows = await supabaseFetch<Record<string, unknown>[]>(
      `Submission?${params.toString()}`
    );
    return rows.map(normalizeSubmission);
  }

  return prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: options?.take
  });
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (supabaseConfig()) {
    const params = new URLSearchParams({
      select: "*",
      id: `eq.${id}`,
      limit: "1"
    });
    const rows = await supabaseFetch<Record<string, unknown>[]>(
      `Submission?${params.toString()}`
    );

    return rows[0] ? normalizeSubmission(rows[0]) : null;
  }

  return prisma.submission.findUnique({ where: { id } });
}
