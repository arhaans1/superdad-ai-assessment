"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateAssessmentSettings, validOptionalHttpsUrl } from "@/lib/settings";

export async function saveAssessmentSettings(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const bookingUrl = String(formData.get("bookingUrl") || "").trim();
  const videoEnabled = formData.get("videoEnabled") === "on";
  const bookingEnabled = formData.get("bookingEnabled") === "on";

  if (!validOptionalHttpsUrl(videoUrl) || !validOptionalHttpsUrl(bookingUrl)) {
    redirect("/admin?settings=invalid_url#assessment-settings");
  }
  if ((videoEnabled && !videoUrl) || (bookingEnabled && !bookingUrl)) {
    redirect("/admin?settings=missing_url#assessment-settings");
  }

  try {
    await updateAssessmentSettings({ videoUrl, bookingUrl, videoEnabled, bookingEnabled });
  } catch (error) {
    console.error("Assessment settings update failed", error);
    redirect("/admin?settings=error#assessment-settings");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?settings=saved#assessment-settings");
}
