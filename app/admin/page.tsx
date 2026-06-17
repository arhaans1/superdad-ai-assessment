import Link from "next/link";
import { Download } from "lucide-react";
import { AdminLogin } from "@/components/AdminLogin";
import { BrandHeader } from "@/components/BrandHeader";
import { DistributionBars } from "@/components/DistributionBars";
import { getAdminStats } from "@/lib/admin";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
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

  const query = ((await searchParams).q || "").trim().toLowerCase();
  const stats = await getAdminStats();
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
            ["Average overall", stats.averageOverall]
          ].map(([label, value]) => (
            <div className="stat-card" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
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
                  <th>Overall</th>
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
                    <td>{submission.scoreOverall}</td>
                    <td>
                      <Link href={`/admin/${submission.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
                {!submissions.length ? (
                  <tr>
                    <td colSpan={8}>No submissions found.</td>
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
