import { useState, useEffect } from "react";

export default function ResumeTipsView() {
  const [staticTips, setStaticTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [personalizing, setPersonalizing] = useState(false);
  const [personalized, setPersonalized] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/resume-tips/static")
      .then((res) => res.json())
      .then((data) => setStaticTips(data.tips || []))
      .catch(() => setError("Couldn't load tips. Check that the backend server is running."))
      .finally(() => setLoading(false));
  }, []);

  async function handlePersonalize(e) {
    e.preventDefault();
    setError("");
    setPersonalized(null);

    if (!role.trim()) {
      setError("Enter a job title or field first.");
      return;
    }

    setPersonalizing(true);
    try {
      const res = await fetch("/api/resume-tips/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (!data.available) {
        setError(
          "Personalized tips need an AI key set up on the backend — showing general tips below in the meantime."
        );
        return;
      }
      setPersonalized(data);
    } catch {
      setError("Couldn't reach the server. Check that the backend is running.");
    } finally {
      setPersonalizing(false);
    }
  }

  return (
    <>
      <h1 className="headline">Once you've spotted the scam, get the job for real.</h1>
      <p className="subhead">
        A resume built the right way gets past the first filter — human or automated.
        These tips are written for the Pakistani job market specifically, not generic
        advice copied from elsewhere.
      </p>

      <div className="intake">
        <form className="intake-inner report-form" onSubmit={handlePersonalize}>
          <label className="intake-label" htmlFor="role">
            Get Tips For a Specific Role (optional)
          </label>
          <input
            id="role"
            className="text-input"
            placeholder="e.g. Frontend Developer, Accountant, Graphic Designer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <div className="intake-footer">
            <span className="char-count"></span>
            <button className="scan-button" type="submit" disabled={personalizing}>
              {personalizing ? "Thinking…" : "Get Personalized Tips"}
            </button>
          </div>
        </form>
      </div>

      {error && <p className="error-note">{error}</p>}

      {personalized && (
        <div className="result-block">
          <div className="ai-summary">
            <strong>For: {role}</strong>
            {personalized.summary}
          </div>
          <h3 className="findings-heading" style={{ marginTop: 24 }}>
            Personalized Tips
          </h3>
          {personalized.tips.map((tip, i) => (
            <div className="finding" key={i}>
              <span className="severity-dot severity-low" />
              <div className="finding-text">{tip}</div>
            </div>
          ))}
        </div>
      )}

      <h3 className="findings-heading" style={{ marginTop: 48 }}>
        General Guidance
      </h3>

      {loading ? (
        <div className="no-findings">Loading tips…</div>
      ) : (
        staticTips.map((group) => (
          <div className="tip-group" key={group.category}>
            <h4 className="tip-category-heading">{group.category}</h4>
            {group.tips.map((tip, i) => (
              <div className="finding" key={i}>
                <span className="severity-dot severity-low" />
                <div className="finding-text">{tip}</div>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}
