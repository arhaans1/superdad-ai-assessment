"use client";

import { LockKeyhole } from "lucide-react";
import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Could not sign in.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="content-section">
      <form className="assessment-panel" onSubmit={login}>
        <h1 className="question-title">Admin login</h1>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="button-row">
          <button className="primary-button" disabled={loading}>
            <LockKeyhole size={18} /> {loading ? "Signing in" : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
