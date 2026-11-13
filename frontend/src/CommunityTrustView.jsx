import { useState, useEffect } from "react";

function trustStampClass(score) {
  if (score >= 70) return "stamp-low";
  if (score >= 40) return "stamp-medium";
  return "stamp-high";
}

function trustLabel(score) {
  if (score >= 70) return "Mostly Trusted";
  if (score >= 40) return "Mixed Reports";
  return "Mostly Scam Reports";
}

export default function CommunityTrustView() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [platformName, setPlatformName] = useState("");
  const [type, setType] = useState("scam");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState("");

  async function loadPlatforms() {
    setLoading(true);
    try {
      const res = await fetch("/api/community-reports");
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch {
      setError("Couldn't load community reports. Check that the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitNotice("");

    if (!platformName.trim()) {
      setError("Please enter the platform or company name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/community-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformName, type, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong submitting your report.");
        return;
      }

      setPlatforms(data.platforms);
      setSubmitNotice("Report added — thank you for helping other job-seekers.");
      setPlatformName("");
      setComment("");
    } catch {
      setError("Couldn't reach the server. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="headline">A shared record, built by people who've been there.</h1>
      <p className="subhead">
        Every entry here comes from someone who actually applied, interviewed, or
        worked with this platform. Report your own experience below, or check one
        before you commit.
      </p>

      <div className="intake">
        <form className="intake-inner report-form" onSubmit={handleSubmit}>
          <label className="intake-label" htmlFor="platformName">
            Platform / Company Name
          </label>
          <input
            id="platformName"
            className="text-input"
            placeholder="e.g. QuickEarnPK"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
          />

          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn ${type === "scam" ? "toggle-btn-active-red" : ""}`}
              onClick={() => setType("scam")}
            >
              I was scammed
            </button>
            <button
              type="button"
              className={`toggle-btn ${type === "legit" ? "toggle-btn-active-green" : ""}`}
              onClick={() => setType("legit")}
            >
              This was legitimate
            </button>
          </div>

          <label className="intake-label" htmlFor="comment">
            What happened (optional, but helpful)
          </label>
          <textarea
            id="comment"
            className="posting-input report-textarea"
            placeholder="Briefly describe your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
        Reported Platforms ({platforms.length})
      </h3>

      {loading ? (
        <div className="no-findings">Loading community reports…</div>
      ) : platforms.length === 0 ? (
        <div className="no-findings">No reports yet — be the first to add one.</div>
      ) : (
        platforms.map((p) => (
          <div className="ledger-entry" key={p.platformName}>
            <div className={`ledger-stamp ${trustStampClass(p.trustScore)}`}>
              {p.trustScore}
            </div>
            <div className="ledger-body">
              <div className="ledger-heading">
                <strong>{p.platformName}</strong>
                <span className={`ledger-label ${trustStampClass(p.trustScore)}`}>
                  {trustLabel(p.trustScore)}
                </span>
              </div>
              <div className="ledger-meta">
                {p.scamReports} scam report{p.scamReports !== 1 ? "s" : ""} · {p.legitReports}{" "}
                legitimate report{p.legitReports !== 1 ? "s" : ""}
              </div>
              {p.recentComments.map((c, i) => (
                <div className="ledger-comment" key={i}>
                  <span className={`severity-dot severity-${c.type === "scam" ? "high" : "low"}`} />
                  {c.comment || "(no details provided)"}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
