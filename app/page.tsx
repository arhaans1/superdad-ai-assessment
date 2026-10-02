import { AssessmentApp } from "@/components/AssessmentApp";
import { getAssessmentSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getAssessmentSettings();
  return <AssessmentApp settings={settings} />;
}
