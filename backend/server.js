const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { runRuleEngine } = require("./ruleEngine");
const { analyzeWithAI } = require("./aiAnalysis");
const { extractTextFromImage } = require("./ocr");
const { runLegitimacyCheck } = require("./legitimacyCheck");
const communityTrust = require("./communityTrust");
const wageTheft = require("./wageTheft");
const resumeAdvice = require("./resumeAdvice");

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function riskLabel(score) {
  if (score >= 60) return "High Risk";
  if (score >= 30) return "Caution";
  return "Low Risk";
}

app.post("/api/scan", async (req, res) => {
  const { text } = req.body || {};

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return res.status(400).json({
      error: "Please paste the job posting text (at least a sentence or two).",
    });
  }

  const { flags: ruleFlags, ruleScore } = runRuleEngine(text);

  // Run AI analysis and legitimacy check in parallel — independent checks,
  // no reason to make one wait on the other.
  const [ai, legitimacy] = await Promise.all([
    analyzeWithAI(text),
    runLegitimacyCheck(text),
  ]);

  let allFlags = [...ruleFlags, ...legitimacy.flags];
  let aiSummary = null;

  // Combine scores, but only average in layers that actually had
  // something to evaluate. A layer that found nothing to check (e.g. no
  // email present, so legitimacyScore defaults to 0) is NOT the same as
  // a layer that checked and found the posting clean — the former is
  // "no data," the latter is a real signal. Blending "no data" into the
  // average as if it were reassuring evidence would wrongly dilute a
  // confident rule-engine finding.
  const scores = [ruleScore]; // the rule engine always actively checks, so 0 here is a real signal
  if (legitimacy.checked) {
    scores.push(legitimacy.legitimacyScore);
  }
  if (ai.available) {
    allFlags = allFlags.concat(ai.flags);
    scores.push(ai.aiRiskScore);
    aiSummary = ai.summary;
  }

  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const finalScore = Math.round(maxScore * 0.65 + avgScore * 0.35);

  res.json({
    riskScore: finalScore,
    riskLabel: riskLabel(finalScore),
    flags: allFlags,
    positiveSignals: legitimacy.positiveSignals,
    ruleScore,
    legitimacyScore: legitimacy.legitimacyScore,
    aiAnalysis: ai.available
      ? { riskScore: ai.aiRiskScore, summary: aiSummary }
      : { unavailable: true },
  });
});

app.post("/api/ocr", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  try {
    const { text, confidence } = await extractTextFromImage(req.file.buffer);

    if (!text || text.trim().length < 5) {
      return res.status(422).json({
        error:
          "Couldn't read any text from that image clearly. Try a clearer screenshot, or paste the text directly.",
      });
    }

    res.json({ text, confidence });
  } catch (err) {
    console.error("OCR failed:", err.message);
    res.status(500).json({ error: "Something went wrong reading that image. Please try again." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---- Community Trust Layer ----

app.get("/api/community-reports", (req, res) => {
  res.json({ platforms: communityTrust.getAggregatedReports() });
});

app.post("/api/community-reports", (req, res) => {
  const { platformName, type, comment } = req.body || {};

  if (!platformName || !platformName.trim()) {
    return res.status(400).json({ error: "Please enter the platform or company name." });
  }
  if (type !== "scam" && type !== "legit") {
    return res.status(400).json({ error: "Report type must be 'scam' or 'legit'." });
  }

  const report = communityTrust.addReport({ platformName, type, comment });
  res.json({ report, platforms: communityTrust.getAggregatedReports() });
});

// ---- Wage-Theft Reporting ----

app.get("/api/wage-theft-reports", (req, res) => {
  res.json({ reports: wageTheft.getReports() });
});

app.post("/api/wage-theft-reports", (req, res) => {
  const { companyName, description, amountOwed } = req.body || {};

  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ error: "Please enter the company name." });
  }
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: "Please describe what happened in a bit more detail." });
  }

  const report = wageTheft.addReport({ companyName, description, amountOwed });
  res.json({ report, reports: wageTheft.getReports() });
});

// ---- Resume Guidance ----

app.get("/api/resume-tips/static", (req, res) => {
  res.json({ tips: resumeAdvice.STATIC_TIPS });
});

app.post("/api/resume-tips/personalized", async (req, res) => {
  const { role } = req.body || {};
  if (!role || !role.trim()) {
    return res.status(400).json({ error: "Please enter a job title or field." });
  }
  const result = await resumeAdvice.getPersonalizedTips(role.trim());
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`SafeCareerPK backend running on http://localhost:${PORT}`);
});