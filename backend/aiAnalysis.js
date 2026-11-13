/**
 * aiAnalysis.js
 *
 * The genuine AI layer, separate from the deterministic rule engine.
 * The rule engine catches known keyword patterns; this layer catches
 * scams that are worded carefully enough to dodge those patterns but
 * still "read" as scammy in tone, structure, or internal inconsistency.
 *
 * Uses Google's Gemini API. Requires a GEMINI_API_KEY environment
 * variable. If it's not set, this layer is skipped entirely and the app
 * falls back to rule-engine results only — the app should never crash
 * or block on a missing key.
 */

const { GoogleGenAI } = require("@google/genai");

const SYSTEM_PROMPT = `You are a careful fraud-analysis assistant helping job-seekers in Pakistan evaluate job postings for scam risk. You are NOT a keyword matcher — a separate rule-based system already checks for obvious keywords like "registration fee" or "come alone". Your job is to catch what keyword matching misses:

- Tone and structure that reads as scripted, generic, or copy-pasted rather than a real company describing a real role
- Internal inconsistencies (e.g. senior-sounding title with entry-level description, vague company details, mismatched formality)
- Overly vague job descriptions paired with unusually attractive terms
- Subtle phrasing that implies payment, urgency, or unsafe interview arrangements WITHOUT using the obvious keywords (e.g. "you'll need to complete onboarding formalities before we proceed" instead of "pay a fee")
- Whether the posting includes concrete, verifiable details (named company, specific address, listed salary range, named contact person) versus vague placeholders

Be balanced: most job postings are completely legitimate. Do not manufacture concerns that aren't really there. If a posting reads as genuinely normal, say so plainly and give it a low score.

Respond ONLY with valid JSON in exactly this shape:
{
  "aiRiskScore": <integer 0-100>,
  "summary": "<one or two plain-language sentences on your overall read>",
  "flags": [
    { "reason": "<specific, plain-language explanation of what you noticed>", "severity": "high" | "medium" | "low" }
  ]
}
If you find nothing concerning, return an empty flags array and a low score.`;

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * @param {string} text - the job posting text
 * @returns {Promise<{available: boolean, aiRiskScore?: number, summary?: string, flags?: Array}>}
 */
async function analyzeWithAI(text) {
  const genAI = getClient();
  if (!genAI) {
    return { available: false };
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this job posting:\n\n"""\n${text}\n"""`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;
    if (!rawText) return { available: false };

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const flags = (parsed.flags || []).map((f, i) => ({
      id: `ai:${i}:${f.reason.slice(0, 24)}`,
      category: "ai_pattern_analysis",
      severity: ["high", "medium", "low"].includes(f.severity) ? f.severity : "medium",
      reason: f.reason,
    }));

    return {
      available: true,
      aiRiskScore: Math.max(0, Math.min(100, Number(parsed.aiRiskScore) || 0)),
      summary: parsed.summary || "",
      flags,
    };
  } catch (err) {
    console.error("AI analysis failed:", err.message);
    // Fail gracefully — the rule engine result still stands on its own.
    return { available: false, error: true };
  }
}

module.exports = { analyzeWithAI };