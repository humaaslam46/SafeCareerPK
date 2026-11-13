import { useState } from "react";
import { motion } from "framer-motion";
import RiskDonut from "./RiskDonut.jsx";
import KpiRow from "./KpiRow.jsx";
import ScanHistoryChart from "./ScanHistoryChart.jsx";
import LayerDonut from "./LayerDonut.jsx";

const VERDICT_COPY = {
  "Low Risk":
    "No common scam patterns were detected in this posting. Still use your own judgement — this isn't a guarantee.",
  Caution:
    "A few signals here are worth a second look before you respond or share any information.",
  "High Risk":
    "This posting matches patterns commonly seen in job scams. Avoid paying any fee and avoid meeting alone at an unverified location.",
};

function buildWhyExplanation(result) {
  const { ruleScore, legitimacyScore, aiAnalysis, flags, riskLabel } = result;

  const layers = [{ name: "the rule engine", score: ruleScore }];
  if (legitimacyScore || legitimacyScore === 0) {
    layers.push({ name: "the legitimacy check", score: legitimacyScore });
  }
  if (aiAnalysis && !aiAnalysis.unavailable) {
    layers.push({ name: "the AI analysis", score: aiAnalysis.riskScore });
  }

  const dominant = layers.reduce((a, b) => (b.score > a.score ? b : a), layers[0]);

  if (riskLabel === "Low Risk") {
    return "No layer found meaningful risk signals — the score stayed low across the board.";
  }

  const categoryCounts = {};
  for (const f of flags) {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  if (dominant.score === 0) {
    return "Risk came from a mix of smaller signals rather than one dominant layer.";
  }

  const categoryLabel = topCategory ? topCategory[0].replace(/_/g, " ") : "multiple factors";
  return `Driven mainly by ${dominant.name} (scored ${dominant.score}/100), most notably ${categoryLabel} signals.`;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function ScannerView() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [ocrNotice, setOcrNotice] = useState("");
  const [history, setHistory] = useState([]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setOcrNotice("");
    setOcrLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't read that image. Try pasting the text instead.");
        return;
      }

      setText(data.text);
      setOcrNotice(
        `Text extracted from your screenshot (${Math.round(data.confidence)}% confidence) — check it looks right below, then scan.`
      );
    } catch (err) {
      setError("Couldn't reach the image reader. Check that the backend server is running.");
    } finally {
      setOcrLoading(false);
      e.target.value = "";
    }
  }

  async function handleScan() {
    setError("");
    setResult(null);

    if (text.trim().length < 10) {
      setError("Paste a bit more of the job posting so we have something to check.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong while scanning. Please try again.");
        return;
      }
      setResult(data);
      setHistory((h) => [...h, { score: data.riskScore, label: data.riskLabel }]);
    } catch (err) {
      setError("Couldn't reach the scanner. Check that the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  const aiAvailable = !!(result && result.aiAnalysis && !result.aiAnalysis.unavailable);
  const aiScore = aiAvailable ? result.aiAnalysis.riskScore : 0;

  return (
    <>
      <h1 className="headline">Before you reply, know what you're replying to.</h1>
      <p className="subhead">
        Paste a job posting below. We'll check it against patterns commonly seen in
        Pakistani job scams — fee requests, urgency tactics, and unsafe interview
        arrangements — and tell you plainly what we found, and why.
      </p>

      <div className="intake">
        <div className="intake-inner">
          <div className="intake-label-row">
            <label className="intake-label" htmlFor="posting">
              Job Posting Text
            </label>
            <label className="upload-link">
              {ocrLoading ? "Reading image…" : "Upload a screenshot instead"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={ocrLoading}
                hidden
              />
            </label>
          </div>
          <textarea
            id="posting"
            className="posting-input"
            placeholder="Paste the full job posting here — the more context, the better the check."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="intake-footer">
          <span className="char-count">{text.length} characters</span>
          <button className="scan-button" onClick={handleScan} disabled={loading}>
            {loading ? "Scanning…" : "Scan Posting"}
          </button>
        </div>
      </div>

      {ocrNotice && <p className="ocr-notice">{ocrNotice}</p>}
      {error && <p className="error-note">{error}</p>}

      {result && (
        <motion.div
          className="result-block"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="verdict-panel">
            <RiskDonut score={result.riskScore} label={result.riskLabel} />
            <div className="verdict-copy">
              <h2>{result.riskLabel}</h2>
              <p>{VERDICT_COPY[result.riskLabel]}</p>
              <div className="why-line">
                <strong>Why: </strong>
                {buildWhyExplanation(result)}
              </div>
            </div>
          </div>

          <KpiRow
            riskScore={result.riskScore}
            riskLabel={result.riskLabel}
            ruleScore={result.ruleScore}
            legitimacyScore={result.legitimacyScore}
            aiScore={aiScore}
            aiAvailable={aiAvailable}
          />

          <div className="analytics-grid analytics-grid-wide">
            <div className="analytics-card">
              <p className="analytics-card-title">Session Scan History</p>
              <ScanHistoryChart history={history} />
            </div>
            <div className="analytics-card">
              <p className="analytics-card-title">Layer Breakdown</p>
              <LayerDonut
                ruleScore={result.ruleScore}
                legitimacyScore={result.legitimacyScore}
                aiScore={aiScore}
                aiAvailable={aiAvailable}
              />
            </div>
          </div>

          <h3 className="findings-heading">Findings ({result.flags.length})</h3>

          {result.flags.length === 0 ? (
            <div className="no-findings">
              No specific red flags matched — that doesn't confirm this posting is
              genuine, only that it didn't trip any of our current checks.
            </div>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="show">
              {result.flags.map((flag) => (
                <motion.div className="finding" key={flag.id} variants={itemVariants}>
                  <span className={`severity-dot severity-${flag.severity}`} />
                  <div className="finding-text">
                    <span className="finding-category">
                      {flag.category.replace(/_/g, " ")}
                      {flag.category === "ai_pattern_analysis" && (
                        <span className="ai-badge">AI</span>
                      )}
                    </span>
                    {flag.reason}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {result.positiveSignals && result.positiveSignals.length > 0 && (
            <>
              <h3 className="positive-heading">
                Positive Signals ({result.positiveSignals.length})
              </h3>
              <motion.div variants={listVariants} initial="hidden" animate="show">
                {result.positiveSignals.map((signal) => (
                  <motion.div className="positive-signal" key={signal.id} variants={itemVariants}>
                    <span className="positive-dot" />
                    <div className="finding-text">{signal.reason}</div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {result.aiAnalysis && !result.aiAnalysis.unavailable && result.aiAnalysis.summary && (
            <div className="ai-summary">
              <strong>AI Analysis Summary</strong>
              {result.aiAnalysis.summary}
            </div>
          )}

          <p className="footnote">
            This tool flags patterns and explains its reasoning — it doesn't make the
            decision for you. Always verify a company independently before paying any
            fee or attending an in-person interview alone.
          </p>
        </motion.div>
      )}
    </>
  );
}