import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "confident_father_admin";
const ONE_DAY_SECONDS = 60 * 60 * 24;

function secret(): string {
  return process.env.SESSION_SECRET || "development-session-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD || "change-me";
  return password === configured;
}

export async function setAdminCookie(): Promise<void> {
  const expiresAt = Date.now() + ONE_DAY_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const value = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY_SECONDS
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [role, expiresAt, signature] = parts;
  if (role !== "admin" || Number(expiresAt) < Date.now()) return false;

  return safeEqual(signature, sign(`${role}.${expiresAt}`));
}
