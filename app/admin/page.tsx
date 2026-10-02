import Link from "next/link";
import { Download } from "lucide-react";
import { AdminLogin } from "@/components/AdminLogin";
import { BrandHeader } from "@/components/BrandHeader";
import { DistributionBars } from "@/components/DistributionBars";
import { getAdminStats } from "@/lib/admin";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveAssessmentSettings } from "@/app/admin/actions";
import { getAssessmentSettings } from "@/lib/settings";
import { fatherhoodStageLabels } from "@/lib/types";
import type { FatherhoodStage } from "@/lib/types";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; settings?: string }>;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="admin-shell">
        <BrandHeader />
        <AdminLogin />
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const query = (resolvedParams.q || "").trim().toLowerCase();
  const [stats, assessmentSettings] = await Promise.all([
    getAdminStats(),
    getAssessmentSettings()
  ]);
  const submissions = query
    ? stats.submissions.filter((submission) =>
        [submission.name, submission.email, submission.city]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : stats.submissions;

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div className="content-inner">
          <h1 className="section-heading" style={{ color: "#FFFFFF" }}>
            Assessment admin
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>
            Leads, reports, raw answers, and export.
          </p>
        </div>
      </div>
      <main className="admin-content">
        <section className="stats-grid">
          {[
            ["Total submissions", stats.total],
            ["Today", stats.today],
            ["Most common", stats.mostCommonArchetype],
            ["Average gap signal", stats.averageOverall]
          ].map(([label, value]) => (
            <div className="stat-card" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </section>

        {stats.error ? (
          <section className="content-section" style={{ paddingInline: 0 }}>
            <div className="data-card">
              <h2 className="section-heading">Connection issue</h2>
              <p className="error-text">{stats.error}</p>
            </div>
          </section>
        ) : null}

        <section
          className="content-section"
          id="assessment-settings"
          style={{ paddingInline: 0 }}
        >
          <form className="data-card settings-form" action={saveAssessmentSettings}>
            <div>
              <div className="section-kicker">Assessment settings</div>
              <h2 className="section-heading">Video and booking links</h2>
              <p className="helper-text">
                Update what appears after a participant receives his insight report. Use secure
                HTTPS links.
              </p>
            </div>
            {resolvedParams.settings === "saved" ? (
              <p className="success-text">Settings saved. The public assessment is updated.</p>
            ) : null}
            {resolvedParams.settings && resolvedParams.settings !== "saved" ? (
              <p className="error-text">
                {resolvedParams.settings === "invalid_url"
                  ? "Please use a complete HTTPS URL."
                  : resolvedParams.settings === "missing_url"
                    ? "Add a URL before enabling that section."
                    : "Settings could not be saved. Check the database connection and try again."}
              </p>
            ) : null}
            <div className="settings-grid">
              <div className="field">
                <label htmlFor="videoUrl">Post-assessment video URL</label>
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://youtube.com/watch?v=..."
                  defaultValue={assessmentSettings.videoUrl}
                />
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    name="videoEnabled"
                    defaultChecked={assessmentSettings.videoEnabled}
                  />
                  Show the video section
                </label>
              </div>
              <div className="field">
                <label htmlFor="bookingUrl">Booking calendar URL</label>
                <input
                  id="bookingUrl"
                  name="bookingUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://calendly.com/..."
                  defaultValue={assessmentSettings.bookingUrl}
                />
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    name="bookingEnabled"
                    defaultChecked={assessmentSettings.bookingEnabled}
                  />
                  Show the Book a Call section
                </label>
              </div>
            </div>
            <div className="button-row">
              <button className="primary-button" type="submit">
                Save Assessment Settings
              </button>
            </div>
          </form>
        </section>

        <section className="content-section" style={{ paddingInline: 0 }}>
          <div className="data-card">
            <h2 className="section-heading">Archetype distribution</h2>
            <DistributionBars distribution={stats.distribution} />
          </div>
        </section>

        <section className="data-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem"
            }}
          >
            <form className="field" style={{ width: "min(420px, 100%)" }}>
              <label htmlFor="q">Search</label>
              <input id="q" name="q" defaultValue={query} placeholder="Name, email, or city" />
            </form>
            <a className="primary-button" href="/api/admin/export">
              <Download size={18} /> Export CSV
            </a>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Archetype</th>
                  <th>Stage</th>
                  <th>Gap signal</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.createdAt.toLocaleString()}</td>
                    <td>{submission.name}</td>
                    <td>{submission.email}</td>
                    <td>{submission.phone}</td>
                    <td>{submission.city}</td>
                    <td>{submission.archetypeName}</td>
                    <td>
                      {submission.fatherhoodStage
                        ? fatherhoodStageLabels[submission.fatherhoodStage as FatherhoodStage] ||
                          submission.fatherhoodStage
                        : "Legacy"}
                    </td>
                    <td>{submission.scoreOverall ?? "—"}</td>
                    <td>
                      <Link href={`/admin/${submission.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
                {!submissions.length ? (
                  <tr>
                    <td colSpan={9}>No submissions found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
