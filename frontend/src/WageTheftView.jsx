import { useState, useEffect } from "react";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

export default function WageTheftView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [amountOwed, setAmountOwed] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState("");

  async function loadReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/wage-theft-reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      setError("Couldn't load reports. Check that the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitNotice("");

    if (!companyName.trim()) {
      setError("Please enter the company name.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Please describe what happened in a bit more detail.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wage-theft-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, description, amountOwed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong submitting your report.");
        return;
      }

      setReports(data.reports);
      setSubmitNotice("Report added — thank you for helping other job-seekers see this pattern.");
      setCompanyName("");
      setDescription("");
      setAmountOwed("");
    } catch {
      setError("Couldn't reach the server. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="headline">Real work, real hours — payment that never came.</h1>
      <p className="subhead">
        This isn't something a scam-post scanner can catch in advance — the hiring
        was often real. This log exists so the next person can see the pattern
        before they accept the job.
      </p>

      <div className="intake">
        <form className="intake-inner report-form" onSubmit={handleSubmit}>
          <label className="intake-label" htmlFor="companyName">
            Company Name
          </label>
          <input
            id="companyName"
            className="text-input"
            placeholder="e.g. BrightLeaf Marketing"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <label className="intake-label" htmlFor="amountOwed">
            Amount Owed (optional)
          </label>
          <input
            id="amountOwed"
            className="text-input"
            placeholder="e.g. Rs 15,000"
            value={amountOwed}
            onChange={(e) => setAmountOwed(e.target.value)}
          />

          <label className="intake-label" htmlFor="wtDescription">
            What happened
          </label>
          <textarea
            id="wtDescription"
            className="posting-input report-textarea"
            placeholder="Describe the work you did and what happened with payment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="intake-footer">
            <span className="char-count">Anonymous by default</span>
            <button className="scan-button" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>

      {submitNotice && <p className="ocr-notice">{submitNotice}</p>}
      {error && <p className="error-note">{error}</p>}

      <h3 className="findings-heading" style={{ marginTop: 48 }}>
        Recent Reports ({reports.length})
      </h3>

      {loading ? (
        <div className="no-findings">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="no-findings">No reports yet — be the first to add one.</div>
      ) : (
        reports.map((r) => (
          <div className="wt-entry" key={r.id}>
            <div className="wt-heading">
              <strong>{r.companyName}</strong>
              <span className="wt-meta">
                {r.amountOwed && `${r.amountOwed} owed · `}
                {timeAgo(r.createdAt)}
              </span>
            </div>
            <p className="wt-description">{r.description}</p>
          </div>
        ))
      )}
    </>
  );
}
