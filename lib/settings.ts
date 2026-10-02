import { prisma } from "@/lib/prisma";
import type { AssessmentSettings } from "@/lib/types";

const defaults: AssessmentSettings = {
  videoUrl: process.env.ASSESSMENT_VIDEO_URL || "",
  bookingUrl: process.env.BOOKING_URL || "",
  videoEnabled: Boolean(process.env.ASSESSMENT_VIDEO_URL),
  bookingEnabled: Boolean(process.env.BOOKING_URL)
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

async function settingsFetch(path: string, init?: RequestInit) {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase REST is not configured.");

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
    throw new Error(`Supabase settings ${response.status}: ${body || response.statusText}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

function normalise(raw?: Record<string, unknown> | null): AssessmentSettings {
  if (!raw) return defaults;
  return {
    videoUrl: typeof raw.videoUrl === "string" ? raw.videoUrl : "",
    bookingUrl: typeof raw.bookingUrl === "string" ? raw.bookingUrl : "",
    videoEnabled: Boolean(raw.videoEnabled),
    bookingEnabled: Boolean(raw.bookingEnabled)
  };
}

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Assessment settings lookup timed out.")), ms);
  });

  try {
    return await Promise.race([promise, limit]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function getAssessmentSettings(): Promise<AssessmentSettings> {
  try {
    if (supabaseConfig()) {
      const rows = await withTimeout(
        settingsFetch(
          "AssessmentSettings?select=videoUrl,bookingUrl,videoEnabled,bookingEnabled&id=eq.primary&limit=1"
        )
      );
      return normalise(rows[0]);
    }

    return normalise(
      await withTimeout(prisma.assessmentSettings.findUnique({ where: { id: "primary" } }))
    );
  } catch (error) {
    console.warn("Assessment settings could not be loaded; using defaults", error);
    return defaults;
  }
}

export async function updateAssessmentSettings(settings: AssessmentSettings) {
  if (supabaseConfig()) {
    const rows = await settingsFetch("AssessmentSettings?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: "primary", ...settings, updatedAt: new Date().toISOString() })
    });
    return normalise(rows[0]);
  }

  return prisma.assessmentSettings.upsert({
    where: { id: "primary" },
    create: { id: "primary", ...settings },
    update: settings
  });
}

export function validOptionalHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
