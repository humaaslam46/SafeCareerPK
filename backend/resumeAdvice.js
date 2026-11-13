/**
 * resumeAdvice.js
 *
 * Resume guidance tailored for the Pakistani job market — a natural
 * companion feature to the scam scanner: once someone knows how to spot
 * a bad posting, the next thing they need is a resume strong enough to
 * get past a good one. Static tips always work with zero setup; the
 * personalized layer uses the same Gemini client as the AI scam
 * analysis, so it shares infrastructure rather than duplicating it.
 */

// Safety net: make sure .env is loaded even if the entry file forgot to.
// Wrapped in try/catch so the app still starts if dotenv isn't installed.
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed; rely on the entry file or host environment variables
}

const { GoogleGenAI } = require("@google/genai");

const STATIC_TIPS = [
  {
    category: "Formatting",
    tips: [
      "Keep it to one page unless you have 8+ years of experience — recruiters in Pakistan typically spend under 30 seconds on a first pass.",
      "Use a clean, single-column layout. Heavily designed templates often break when converted to PDF or scanned by applicant-tracking systems.",
      "Save and send as PDF, not Word — this keeps your formatting intact across any device the employer opens it on.",
    ],
  },
  {
    category: "Content",
    tips: [
      "Lead each bullet with what you did and what changed because of it — \"Improved X by Y%\" reads stronger than \"Responsible for X.\"",
      "Match keywords from the actual job posting where genuinely true — many companies filter applications by keyword before a human ever reads them.",
      "List your strongest, most relevant experience first — don't make a recruiter dig for it.",
    ],
  },
  {
    category: "Local Context (Pakistan)",
    tips: [
      "A small professional photo is still common and generally expected on CVs in Pakistan, unlike in the US/UK — include one if you're applying locally, and skip it for international remote roles.",
      "List your city clearly — many local employers filter by location before anything else, especially for on-site roles.",
      "It's fine to mention language proficiency (Urdu, English, regional languages) — this genuinely matters for many roles here.",
    ],
  },
  {
    category: "Red Flags to Avoid",
    tips: [
      "Never list your CNIC number, full home address, or bank details on a CV shared publicly or with unverified recruiters — legitimate employers ask for this only after a real offer, through secure channels.",
      "Be cautious of \"resume review\" or \"CV enhancement\" services that ask for payment before showing you any real feedback — a real, informative critique should be visible before any payment is requested.",
      "Double check any company you're sending your CV to using this app's Posting Scanner or Community Trust tab first, especially if the posting reached you through an unfamiliar WhatsApp group or page.",
    ],
  },
];

const SYSTEM_PROMPT = `You are a practical, encouraging resume coach for job-seekers in Pakistan. Given a job title or field, give 4-6 short, specific, genuinely useful tips for tailoring a resume to that kind of role. Be concrete, not generic — mention specific skills, keywords, or achievements relevant to that field where you can. Keep each tip to one sentence. Respond ONLY with valid JSON in exactly this shape:
{
  "tips": ["...", "..."],
  "summary": "<one encouraging sentence tailored to this field>"
}`;

let client = null;
function getClient() {
  // trim() guards against stray spaces or newlines copied along with the key
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Returns one of:
 *  { available: true, tips: [...], summary: "..." }
 *  { available: false, reason: "missing_key" }
 *  { available: false, reason: "empty_response" }
 *  { available: false, error: true, reason: "api_error", detail: "..." }
 *
 * Your route/UI should show "API key missing" ONLY when reason === "missing_key".
 */
async function getPersonalizedTips(role) {
  const genAI = getClient();
  if (!genAI) {
    console.error("GEMINI_API_KEY is not set in process.env");
    return { available: false, reason: "missing_key" };
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Job title or field: ${role}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text;
    if (!rawText) {
      console.error("Resume tips: Gemini returned an empty response");
      return { available: false, reason: "empty_response" };
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      available: true,
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      summary: parsed.summary || "",
    };
  } catch (err) {
    // Log the full error so the real cause (bad key, quota, model name, parse error) is visible
    console.error("Resume tips AI call failed:", err);
    return {
      available: false,
      error: true,
      reason: "api_error",
      detail: err.message,
    };
  }
}

module.exports = { STATIC_TIPS, getPersonalizedTips };